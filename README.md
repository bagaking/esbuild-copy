# esbuild-copy

Copy static files after an esbuild build finishes.

## Installation

```sh
npm install --save-dev esbuild-copy
```

## Requirements

This package requires Node.js 16.7 or newer and is ESM-only. Use it from an
ESM file, such as `esbuild.config.mjs` or a project with `"type": "module"`.
CommonJS `require("esbuild-copy")` is not supported.

## Usage

```js
import esbuild from "esbuild";
import copy from "esbuild-copy";

await esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "build/index.js",
  plugins: [
    copy({
      from: "public",
      dest: "build/public",
    }),
  ],
});
```

The plugin runs on esbuild's `onEnd` hook, so files are copied after each build
or rebuild completes.

## Options

`copy(options)` passes options through to Node's `fs.cpSync`. The defaults are:

```js
{
  from: "./statics",
  dest: "./build/statics",
  force: true,
  dereference: true,
  errorOnExist: false,
  preserveTimestamps: true,
  recursive: true,
}
```

This package uses `fs.cpSync`, which is why Node.js 16.7 or newer is required.

## Local Validation

```sh
npm ci
npm test
```

## License

[MIT](LICENSE)
