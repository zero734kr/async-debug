import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    platform: "node",
    format: ["esm", "cjs"],
    target: "es2020",
    clean: true,
    dts: true,
    keepNames: true,
    shims: true,
    skipNodeModulesBundle: true,
});
