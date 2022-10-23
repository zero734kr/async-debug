import type { AsyncHook } from "node:async_hooks";
import { createHook } from "node:async_hooks";
import { writeSync } from "node:fs";
import { performance } from "node:perf_hooks";
import process from "node:process";

/**
 * Options to configure the async hook.
 */
export type DebugOptions = {
    /**
     * The threshold to determine if an asynchronous task is taking too long in milliseconds.
     * If an object is passed as a parameter, each key of object is the type of the asynchronous
     * resource and the value will be used for each of them,
     * and if no corresponding key is found, the default below will be used.
     * If threshold is not specified, the default value is 300ms.
     * If a number is passed as a parameter, it will be used for all async resources.
     */
    longTaskThreshold?: Record<string, number> | number;
};

export enum DebugEventType {
    LISTENING = "LISTENING",
}

export type DebugEvent = {
    asyncId: number;
    resourceType: string;
    startTime?: number;
    type: DebugEventType;
};

/**
 * Storing information about the asynchronous execution context.
 */
export const asyncTaskContextStore = new Map();

/**
 * According to node.js async_hooks documentation,
 * printing to the console is an asynchronous operation.
 * So `console.log` will cause an infinite loop as the hook callbacks are called recursively.
 * we need to print to the console synchronously.
 *
 * @see https://nodejs.org/api/async_hooks.html#printing-in-asynchook-callbacks
 */
function debugLogSync(...args: any[]) {
    if (process.env.AD_DEBUGGING !== "1") {
        return;
    }

    return writeSync(process.stdout.fd, `${args.join(" ")}\n`);
}

/**
 * Creates an async hook to debug asynchronous tasks.
 */
export function configure({ longTaskThreshold = 300 }: DebugOptions = {}): AsyncHook {
    // I haven't used before/after hook because it not worked correctly.

    return createHook({
        init(asyncId, type, eid) {
            debugLogSync(`INIT: ${asyncId}(${type}) - ${eid}`);

            if (asyncTaskContextStore.has(asyncId)) {
                return;
            }

            asyncTaskContextStore.set(asyncId, {
                asyncId,
                type: DebugEventType.LISTENING,
                startTime: performance.now(),
                resourceType: type,
            });
        },
        destroy(asyncId) {
            const event = asyncTaskContextStore.get(asyncId);

            if (event && event.type === DebugEventType.LISTENING) {
                const duration = performance.now() - event.startTime!;

                debugLogSync(`DESTROY: ${asyncId} - ${duration}ms`);

                const threshold = typeof longTaskThreshold === "number" ?
                    longTaskThreshold :
                    longTaskThreshold[event.resourceType] ?? 300;

                if (duration >= threshold) {
                    console.warn(`Executing asynchronous task (asyncId: ${asyncId}) using ${event.resourceType} took ${duration}ms to complete.`);
                }
            }

            asyncTaskContextStore.delete(asyncId);
        },
    });
}
