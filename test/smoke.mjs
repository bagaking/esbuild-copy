import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import copy from "esbuild-copy";

assert.equal(typeof copy, "function");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "esbuild-copy-"));
const sourceDir = path.join(tempDir, "source");
const destDir = path.join(tempDir, "dest");
const sourceFile = path.join(sourceDir, "asset.txt");
const destFile = path.join(destDir, "asset.txt");

try {
    fs.mkdirSync(sourceDir);
    fs.writeFileSync(sourceFile, "copied");

    const plugin = copy({
        from: sourceDir,
        dest: destDir,
        recursive: undefined,
    });

    assert.equal(plugin.name, "copy");

    let onEnd;
    plugin.setup({
        onEnd(callback) {
            onEnd = callback;
        },
    });

    assert.equal(typeof onEnd, "function");
    onEnd();

    assert.equal(fs.readFileSync(destFile, "utf8"), "copied");
} finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
