import { existsSync } from "fs";
import * as glob from "glob";
import * as path from "path";
import { fileURLToPath } from "url";

let nodeModulesPaths: string[] = [];

function findNodeModules() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    let p = path.resolve(__dirname);
    while (true) {
      if (path.dirname(p) === "node_modules") {
        if (!nodeModulesPaths.includes(p)) {
          nodeModulesPaths.push(p);
        }
      }
      if (existsSync(path.join(p, "node_modules"))) {
        nodeModulesPaths.push(path.join(p, "node_modules"));
      }
      let up = path.resolve(p, "..");
      if (up === p) {
        if (nodeModulesPaths.length) return;
        throw Error();
      }
      p = up;
    }
  } catch (err) {
    throw Error("Cannot find node_modules path");
  }
}
findNodeModules();

function findFontFile(fileGlob: string) {
  try {
    let files = glob.sync(fileGlob);
    if (files.length) return files[0];
  } catch {}
  for (let nodeModulesPath of nodeModulesPaths) {
    try {
      let files = glob.sync(fileGlob, { cwd: nodeModulesPath });
      if (files.length) return path.resolve(nodeModulesPath, files[0]!);
    } catch {}
  }
  throw Error("Font file not found: " + fileGlob);
}

export function findFontFiles(globs: { [id: string]: { [s: string]: string } }) {
  let result: typeof globs = {};
  for (let id in globs) {
    let r: any = (result[id] = {});
    for (let s in globs[id]) {
      r[s] = findFontFile(globs[id][s]!);
    }
  }
  return result;
}
