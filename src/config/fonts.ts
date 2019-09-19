import { existsSync } from "fs";
import * as glob from "glob";
import * as path from "path";

let nodeModulesPath = "";
function findNodeModules() {
  try {
    let p = path.resolve(__dirname);
    while (true) {
      if (path.dirname(p) === "node_modules") {
        nodeModulesPath = p;
        break;
      }
      if (existsSync(path.join(p, "node_modules"))) {
        nodeModulesPath = path.join(p, "node_modules");
        break;
      }
      let up = path.resolve(p, "..");
      if (up === p) throw Error();
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
  try {
    let files = glob.sync(fileGlob, { cwd: nodeModulesPath });
    if (files.length) return path.resolve(nodeModulesPath, files[0]);
  } catch {}
  throw Error("Font file not found: " + glob);
}

export function findFontFiles(globs: { [id: string]: { [s: string]: string } }) {
  let result: typeof globs = {};
  for (let id in globs) {
    let r: any = (result[id] = {});
    for (let s in globs[id]) {
      r[s] = findFontFile(globs[id][s]);
    }
  }
  return result;
}
