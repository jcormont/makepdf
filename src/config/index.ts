import defaults from "./defaults.js";

export * from "./fonts.js";
export * from "./pagebreak.js";
export * from "./tables.js";

export type Defaults = typeof defaults;

/** Helper function to overwrite all properties in a plain object */
function ovr<T extends {}>(target: T, source: any): T {
  const objToString = {}.toString;
  const result: any = { ...target };
  for (let p in source) {
    if (
      result[p] != null &&
      result[p].toString === objToString &&
      source[p].toString === objToString
    ) {
      result[p] = ovr(result[p], source[p]);
    } else {
      result[p] = source[p];
    }
  }
  return result;
}

/** Returns full configuration based on defaults plus given overrides (object) */
export function getConfig(overrides: any = {}): Defaults {
  let config = ovr(defaults, overrides);
  return config;
}
