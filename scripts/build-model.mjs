// Build a web-ready 3D model for the landing page in one step:
//   npm run model:build -- <input.stl|.glb|.fbx|.obj> <name> [--tris 30000] [--yaw 0] [--eyelids] [--preview]
//
// 1. Blender (headless) cleans, decimates, normalises and paints the mesh
//    (scripts/model-to-glb.py).
// 2. gltfpack (-kn keeps named nodes such as "Eyelids") quantises + meshopt-compresses the geometry (textures are
//    already capped at 1024px WebP by Blender). three.js decodes it with
//    MeshoptDecoder, so no decoder files need hosting.
// Output: public/models/<name>.glb (+ a preview PNG next to the input with --preview).
// Set BLENDER=/path/to/blender if it is not on PATH.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const [input, name, ...rest] = process.argv.slice(2);
if (!input || !name) {
  console.error(
    "usage: npm run model:build -- <input> <name> [--tris N] [--yaw DEG] [--eyelids] [--preview]",
  );
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "models", `${name}.glb`);
mkdirSync(dirname(out), { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), "model-build-"));
const raw = join(tmp, "raw.glb");

const passthrough = [];
for (const flag of ["--tris", "--yaw"]) {
  const i = rest.indexOf(flag);
  if (i !== -1) passthrough.push(flag, rest[i + 1]);
}
if (rest.includes("--eyelids")) passthrough.push("--eyelids");
if (rest.includes("--preview"))
  passthrough.push(
    "--preview",
    resolve(dirname(resolve(input)), `${name}-preview.png`),
  );

try {
  execFileSync(
    process.env.BLENDER || "blender",
    [
      "-b",
      "--factory-startup",
      "--python",
      join(root, "scripts", "model-to-glb.py"),
      "--",
      resolve(input),
      raw,
      ...passthrough,
    ],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
  execFileSync(
    join(root, "node_modules", ".bin", "gltfpack"),
    ["-i", raw, "-o", out, "-cc", "-kn", "-ke"],
    { stdio: "inherit" },
  );
  console.log(`\n${out}: ${(statSync(out).size / 1024).toFixed(0)} KB`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
