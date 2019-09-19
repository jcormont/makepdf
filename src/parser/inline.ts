import { ParseContext } from "./parse";

/** Character-based parse context */
class InlineParseContext {
  constructor(s: string) {
    this._ahead = s;
  }

  /** Returns the next character */
  peek() {
    return this._ahead[0];
  }

  /** Removes n characters from the input string */
  shift(n: number) {
    let result = this._ahead.slice(0, n);
    this._behind += result;
    this._ahead = this._ahead.slice(n);
    return result;
  }

  /** Matches against the remaining input string */
  match(re: RegExp) {
    return this._ahead.match(re);
  }

  /** Matches against the already-parsed part of the input string */
  matchBehind(re: RegExp) {
    return this._behind.match(re);
  }

  /** Runs given function with a clone of this context; if the function returns a truethy value, the cloned context is copied back */
  cont<T>(f: (ctx: InlineParseContext) => T): T {
    let next = new InlineParseContext(this._ahead);
    next._behind = this._behind;
    let b = f(next);
    if (b) {
      this._ahead = next._ahead;
      this._behind = next._behind;
    }
    return b;
  }

  private _ahead: string;
  private _behind = "";
}

/** Return text as an array of content blocks or strings */
export function parseInline(text: string, outer: ParseContext, props?: any) {
  /** Parse inline literal (code) text */
  function parseCode(ctx: InlineParseContext) {
    let match = ctx.match(/^\`([^`]*)\`/);
    if (match) {
      ctx.shift(match[0].length);
      return { text: match[1], style: "code" };
    }
  }

  /** Parse text within paired symbols (e.g. **) */
  function parsePaired(ctx: InlineParseContext, expect: RegExp, props?: any) {
    let match = ctx.match(expect);
    if (match) {
      let result = ctx.cont(next => {
        next.shift(match![0].length); // start
        return parseUntil(next, expect, props);
      });
      if (result) ctx.shift(match![0].length); // end
      return result && asTextNode(result);
    }
  }

  /** Parse autonumbering pattern */
  function parseAutoNum(ctx: InlineParseContext, props?: any) {
    let match = ctx.match(
      /^\\\\((?:\([^\s\)\.]*\)\.|\[[^\s\]\.]*\]\.)+)(?:\{\#([^\s\}]+)\})?/
    );
    if (match) {
      ctx.shift(match[0].length);
      let text = outer.output.autoNumber(match[1]);
      let result = { ...props, text, style: "autonum" };
      if (match[2]) {
        result.id = match[2];
        outer.output.addRefId(result.id, text.trim(), 0);
      }
      return result;
    }
  }

  /** Parse a link */
  function parseLink(ctx: InlineParseContext, props?: any) {
    let match = ctx.match(/^\[[^\]]*\]\([^\)]+\)/);
    if (match) {
      return ctx.cont(next => {
        next.shift(1); // [
        let text = parseUntil(next, /^\]/, props);
        if (!text) return;
        next.shift(1); // ]
        let urlMatch = next.match(/\(([^\)]+)\)/);
        if (!urlMatch) return;
        next.shift(urlMatch[0].length);
        let url = urlMatch[1].trim();
        if (url[0] === "#") {
          // parse internal link
          let id = url.slice(1);
          if (!text.length) {
            return outer.output.addRefToUpdate(id, {
              linkToDestination: id,
              text: "",
              style: "doclink",
            });
          }
          return asTextNode(text, { linkToDestination: id, style: "doclink" });
        }
        return asTextNode(text, { link: url, style: "link" });
      });
    }
  }

  /** Parse inline tag */
  function parseTag(ctx: InlineParseContext, props?: any) {
    let match = ctx.match(/^\\\\(\w+)/);
    if (match) {
      let tag = match[1].toLowerCase();
      if (tag === "blank") {
        ctx.shift(7);
        return { text: "" };
      }
      if (tag === "newline") {
        ctx.shift(9);
        return "\n";
      }
      if (tag === "v" || tag === "verb" || tag === "verbatim") {
        ctx.shift(tag.length + 2);
        let text = "";
        let stop = ctx.shift(1);
        let c: string;
        while ((c = ctx.shift(1)) !== stop) {
          text += c;
        }
        return props ? { ...props, text } : text;
      }
      let insertion = ctx.match(/^\\\\insert\s*\(([^\s\)]+)\)/);
      if (insertion) {
        // replace 'insert' in the middle of a line
        // (start of line is handled in parse.ts)
        ctx.shift(insertion[0].length);
        let name = insertion[1];
        return outer.getDefinition(name);
      }

      let result = ctx.cont(next => {
        let match = ctx.match(/^\\\\\w+(?:\(([^\)]*)\))?\{/);
        if (match) {
          let params = match[1] || "";
          props = { ...props };
          switch (tag) {
            case "bold":
            case "b":
              props.bold = true;
              break;
            case "italics":
            case "italic":
            case "i":
              props.italics = true;
              break;
            case "code":
            case "kbd":
              props.style = "code";
              break;
            case "underline":
            case "overline":
            case "strikethrough":
            case "linethrough":
              props.decoration = tag;
              if (tag === "strikethrough" || tag === "linethrough") {
                props.decoration = "lineThrough";
              }
              if (params) {
                let [style, color] = params.trim().split(/\s+/);
                if (style) props.decorationStyle = style;
                if (color) props.decorationColor = color;
              }
              break;
            case "symbol":
            case "sym":
              props.font = "Symbol";
              props.bold = false;
              props.italics = false;
              break;
            case "color":
              props.color = params.trim();
              break;
            case "style":
              props = { ...props, ...outer.output.getStyleProps(params.trim()) };
              break;
            default:
              throw Error("Invalid inline tag: \\\\" + tag);
          }
          next.shift(match[0].length); // start
          return parseUntil(next, /^\}/, props);
        }
      });
      if (result) ctx.shift(1); // end
      return result && asTextNode(result);
    }
  }

  /** Parse all text until given regexp matches */
  function parseUntil(ctx: InlineParseContext, expect?: RegExp, props?: any) {
    let result: any[] = [];
    let s = "";
    const flush = () => {
      if (s) result.push(props ? { ...props, text: s } : s);
      s = "";
    };
    const move = (r: any) => {
      if (r) flush(), result.push(r);
      return r;
    };
    while (!expect || !ctx.match(expect)) {
      // done if there is no more input; check if expecting
      if (!ctx.peek()) {
        if (expect) return;
        break;
      }

      // check for matches ahead of expected match
      if (
        move(parseCode(ctx)) ||
        move(parsePaired(ctx, /^\*\*/, { ...props, bold: true })) ||
        move(parsePaired(ctx, /^__/, { ...props, bold: true })) ||
        move(parsePaired(ctx, /^\*/, { ...props, italics: true })) ||
        move(parsePaired(ctx, /^_/, { ...props, italics: true })) ||
        move(parsePaired(ctx, /^~~/, { ...props, decoration: "lineThrough" })) ||
        move(parseAutoNum(ctx, props)) ||
        move(parseLink(ctx, props)) ||
        move(parseTag(ctx, props))
      ) {
        continue;
      }

      // check punctuation
      if (ctx.match(/^\\\S/)) {
        let char = ctx.shift(2)[1];
        if (char === "~") char = "\u00A0";
        else if ("\\`*_{}[]()<>#+-.!'\"".indexOf(char) < 0) s += "\\";
        s += char;
      } else if (ctx.match(/^\-\-/)) {
        ctx.shift(2);
        s += "—";
      } else if (ctx.match(/^\.\.\./)) {
        ctx.shift(3);
        s += "…";
      } else if (ctx.peek() === "'") {
        s += ctx.matchBehind(/\S$/) ? "’" : "‘";
        ctx.shift(1);
      } else if (ctx.peek() === '"') {
        s += ctx.matchBehind(/\S$/) ? "”" : "“";
        ctx.shift(1);
      } else {
        // for anything else, just add plain text and move on
        let match = ctx.match(/^[\p{L}\p{N}]+/u);
        s += ctx.shift(match ? match[0].length : 1);
      }
    }
    flush();
    return result;
  }

  return parseUntil(new InlineParseContext(text), undefined, props) || [text];
}

/** Return given content (string or array) as a string, or as a `{ text: ... }` block, including given properties */
export function asTextNode(content: any): string | object & { text: any };
export function asTextNode(content: any, props: any): object & { text: any };
export function asTextNode(content?: any, props?: any) {
  let result: any = { text: "" };
  if (content) {
    if (typeof content === "string") result = content;
    else if (content.text) result = content;
    else if (content.length === 1) result = asTextNode(content[0]);
    else if (content.length) result.text = content;
  }
  if (props) {
    if (typeof result === "string") result = { text: result };
    Object.assign(result, props);
  }
  return result;
}

/** Return a string of text for given text node */
export function flattenText(
  text: string | { text: any } | any[],
  separator?: string
): string {
  if (typeof text === "string") return text.replace(/\s+/g, " ");
  if (Array.isArray(text)) {
    return text
      .map(a => flattenText(a))
      .join(separator || "")
      .replace(/\s+/g, " ");
  }
  if (text.text) return flattenText(text.text);
  return "";
}
