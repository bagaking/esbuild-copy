# esbuild-copy

Copy static files after an esbuild build finishes.

## Installation

```sh
npm install --save-dev esbuild-copy
```

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

This package uses `fs.cpSync`, which requires Node.js 16 or newer.
