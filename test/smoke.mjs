import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import esbuild from "esbuild";
import copy from "esbuild-copy";

assert.equal(typeof copy, "function");

{
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
}

{
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "esbuild-copy-"));
    const sourceDir = path.join(tempDir, "public");
    const sourceNestedDir = path.join(sourceDir, "nested");
    const sourceFile = path.join(sourceNestedDir, "asset.txt");
    const entryFile = path.join(tempDir, "entry.js");
    const outDir = path.join(tempDir, "dist");
    const outfile = path.join(outDir, "bundle.js");
    const copiedFile = path.join(outDir, "public", "nested", "asset.txt");

    try {
        fs.mkdirSync(sourceNestedDir, { recursive: true });
        fs.writeFileSync(sourceFile, "copied through esbuild");
        fs.writeFileSync(entryFile, "export const value = 1;\n");

        await esbuild.build({
            entryPoints: [entryFile],
            bundle: true,
            outfile,
            plugins: [
                copy({
                    from: sourceDir,
                    dest: path.join(outDir, "public"),
                }),
            ],
        });

        assert.equal(fs.existsSync(outfile), true);
        assert.equal(fs.readFileSync(copiedFile, "utf8"), "copied through esbuild");
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}
