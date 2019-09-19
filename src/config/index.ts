import * as path from "path";
import defaults from "./defaults";

export * from "./fonts";
export * from "./pagebreak";
export * from "./tables";

export type Defaults = typeof defaults;

/** Helper function to overwrite all properties in a plain object */
function ovr<T extends any>(target: T, source: any): T {
  const objToString = {}.toString;
  target = { ...target };
  for (let p in source) {
    if (
      target[p] != null &&
      target[p].toString === objToString &&
      source[p].toString === objToString
    ) {
      target[p] = ovr(target[p], source[p]);
    } else {
      target[p] = source[p];
    }
  }
  return target;
}

/** Returns full configuration based on defaults plus given overrides (object) */
export function getConfig(overrides: any = {}): Defaults {
  let config = ovr(defaults, overrides);
  return config;
}
