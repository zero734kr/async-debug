# Asynchronous Operations Debugger

<div align="center">
	<br />
	<p>
		<a href="https://www.npmjs.com/package/async-debug"><img src="https://img.shields.io/npm/v/async-debug.svg?maxAge=3600" alt="npm version" /></a>
		<a href="https://www.npmjs.com/package/async-debug"><img src="https://img.shields.io/npm/dt/async-debug.svg?maxAge=3600" alt="npm downloads" /></a>
	</p>
</div>

## About

``async-debug`` is a Node.js module that debugs your asynchronous operations, inspired by [asyncio debug mode](https://docs.python.org/3/library/asyncio-dev.html#debug-mode) of python.

Currently, the only feature of this module is to listen for your asynchronous operations and log them to the console if they take too long to complete (considered "slow").

## Installation

```sh-session
npm install async-debug
yarn add async-debug
pnpm add async-debug
```

## Usage

```js
import { configure } from "async-debug";

const asyncDebugger = configure({
    longTaskThreshold: 250, // 0.25 seconds, default is 300 (0.3 seconds)
})

if (process.env.NODE_ENV === 'development') {
    asyncDebugger.enable();
}

// Your code here

// Output:
// Executing asynchronous operation 15 using HTTPCLIENTREQUEST took 313.654224999249ms to complete.
```

And that's it! You can now debug your asynchronous operations. 

If you want to setup different thresholds for different operations, you can pass `object` to the ``longTaskThreshold`` parameter like below.

```js
configure({
    longTaskThreshold: {
        HTTPCLIENTREQUEST: 300,
        TCPCONNECTWRAP: 100,
        FSREQCALLBACK: 150,
        // ...
    }
})
```

### Configuration

All options are described as JSDoc comments, but if I think it's necessary, I'll add them here later.