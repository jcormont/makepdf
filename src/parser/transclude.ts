import * as glob from "glob";
import * as path from "path";
import { parseInline } from "./inline.js";
import { ParseContext, parseMarkdownFile } from "./parse.js";

function makeImage(p: string, caption: string | any[], props: any) {
  let result = [
    {
      image: p,
      style: "img",
      ...props,
    },
  ];

  if (caption) {
    result.push({ text: caption, style: "caption" });
  }
  return { stack: result, unbreakable: true };
}

/** Parse a file reference, and optionally the indented content below it */
export async function parseFileRef(
  pattern: string,
  caption: string | any[],
  ctx: ParseContext,
  indent: number,
  props: any
) {
  // find content if indented directly below file reference line
  let innerContent: string[] = [];
  let firstInnerIndent = indent + 8;
  while (ctx.hasInput()) {
    let nextLine = ctx.peek();
    if (!nextLine) {
      // skip over completely blank lines
      ctx.shift();
      if (innerContent.length) innerContent.push("");
      continue;
    }
    let nextIndent = nextLine.match(/^\s*/)![0].length;
    if (nextIndent <= indent) break;
    if (nextIndent < firstInnerIndent) firstInnerIndent = nextIndent;
    innerContent.push(ctx.shift());
  }
  innerContent = innerContent.map((s) => s.slice(firstInnerIndent));

  // expand referenced file path relative to the entry point
  pattern = pattern.trim();
  let isRelative = pattern[0] !== "/";
  let cwd = isRelative ? path.dirname(ctx.fileName) : ctx.output.getBaseDir();
  let files = glob.sync(pattern.replace(/^\//, ""), { cwd });
  if (!files.length) {
    throw Error("Transclusion file not found: " + pattern);
  }

  // insert one or more files
  let result: any[] = [];
  for (let fileName of files) {
    let p = path.resolve(cwd, fileName);

    // insert an image
    if (/(?:\.jpg|\.jpeg|\.png)$/.test(pattern)) {
      if (innerContent.length) {
        caption = parseInline(innerContent.join(" "), ctx);
      } else if (typeof caption === "string") {
        caption = parseInline(caption, ctx);
      }
      result.push(makeImage(p, caption, props));
      continue;
    }

    // insert a markdown file
    if (/(?:\.md|\.txt)$/.test(pattern)) {
      result.push(
        ...(await parseMarkdownFile(p, ctx.output, {
          content: innerContent.join("\n") || caption,
        }))
      );
      continue;
    }

    // insert the result of a javascript module/function
    if (/(?:\.js)$/.test(pattern)) {
      let r = await import(path.resolve(p));
      if (r.default) r = r.default;
      if (typeof r === "function") {
        r = r({
          context: ctx.output,
          content: innerContent.join("\n") || caption,
          ...props,
        });
      }
      if (!Array.isArray(r)) r = [r];
      result.push(...r);
      continue;
    }

    // not sure what to do with this file...
    throw Error("Unknown file type: " + pattern);
  }
  return result;
}
