import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "esbuild-copy-package-"));
const packDir = path.join(tempDir, "pack");
const consumerDir = path.join(tempDir, "consumer");
const expectedFiles = ["LICENSE", "README.md", "main.js", "package.json"];

function run(command, args, options = {}) {
    return execFileSync(command, args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...options,
    });
}

try {
    fs.mkdirSync(packDir);

    const packOutput = run("npm", ["pack", "--json", "--pack-destination", packDir], {
        cwd: repoRoot,
    });
    const [packResult] = JSON.parse(packOutput);

    assert.equal(packResult.name, "esbuild-copy");
    assert.equal(packResult.filename.endsWith(".tgz"), true);
    assert.equal(packResult.entryCount, expectedFiles.length);

    const packedFiles = packResult.files.map((file) => file.path).sort();
    assert.deepEqual(packedFiles, expectedFiles);

    const tarballs = fs.readdirSync(packDir).filter((file) => file.endsWith(".tgz"));
    assert.deepEqual(tarballs, [packResult.filename]);

    const tarballPath = path.join(packDir, packResult.filename);
    assert.equal(fs.existsSync(tarballPath), true);

    fs.mkdirSync(consumerDir);
    run("npm", ["init", "-y"], { cwd: consumerDir });
    run("npm", ["install", "--silent", "--no-audit", "--no-fund", tarballPath], {
        cwd: consumerDir,
    });

    const importSmoke = `
        import assert from "node:assert/strict";
        import copy from "esbuild-copy";

        assert.equal(typeof copy, "function");
        const plugin = copy({ from: ".", dest: "." });
        assert.deepEqual(
            { name: plugin.name, setup: typeof plugin.setup },
            { name: "copy", setup: "function" }
        );
    `;

    run("node", ["--input-type=module", "--eval", importSmoke], { cwd: consumerDir });
} finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
}
