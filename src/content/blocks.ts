import { Defaults } from "../config/index.js";

/** Return a separator node with given properties */
export function makeSeparator(config: Defaults, props: any) {
  return {
    table: { body: [[{ stack: [] }]], widths: ["*"] },
    layout: "separator",
    borders: [0, config.styles.separator.lineWidth, 0, 0],
    margin: config.styles.separator.margin,
    ...props,
  };
}

/** Return a block (table) with given properties */
export function makeBlock(stack: any[], props: any) {
  // don't add a single paragraph, just treat as text
  if (stack.length === 1 && stack[0].style === "p") {
    stack[0].style = undefined;
  }

  // create a table structure
  let result: any = {
    table: {
      widths: ["*"],
      body: [
        [
          {
            border: [true, true, true, true],
            stack,
            ...props,
            // margin: [10, 10],
          },
        ],
      ],
    },
    layout: "block",
    style: "block_outer",
  };

  // wrap in 'unbreakable' stack if needed
  if (props.unbreakable) {
    result = {
      unbreakable: true,
      stack: [result],
    };
  }
  return result;
}
