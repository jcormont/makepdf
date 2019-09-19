import { readFileSync } from "fs";
import { makeBlock, makeSeparator } from "../content/blocks";
import { asTextNode, parseInline, flattenText } from "./inline";
import { OutputContext } from "./context";
import { parseFileRef } from "./transclude";

const RE_LINE_NOT_PLAIN_TEXT = /^(\s*\#|\-\s|\*\s|1\.\s|\`\`\`|\-{3,}\s*$|\\\\\{|\\\\include|\\\\image|\\\\img|\\\\toc|\\\\pagebreak)/;
const RE_TABLE_SEPARATOR_LINE = /^\s*(\|\s*)?(\:?\-{3,}\:?\s*\|?\s*)+$/;

/** Parser context definition */
export class ParseContext {
  constructor(fileName: string, output: OutputContext, defs?: any) {
    this.fileName = fileName;
    this.output = output;
    this._defs = output.mergeDefinitions(defs);
  }

  append(text: string) {
    this._lines.push(...text.split(/\r\n|\n\r|\r|\n/));
  }

  /** Returns the current line number (starts at 1) */
  getLineNumber() {
    return this._n;
  }

  /** Returns true if currently at given line number */
  isAt(lineNumber: number) {
    return this.getLineNumber() === lineNumber;
  }

  /** Returns true if more lines are available */
  hasInput() {
    return !!this._lines.length;
  }

  /** Returns the next line */
  peek() {
    this._autoReplace();
    return this._lines[0] || "";
  }

  /** Returns and removes the next line */
  shift() {
    this._n++;
    this._autoReplace();
    return this._lines.shift() || "";
  }

  /** Runs given function and asserts that one or more lines are used */
  validate(f: () => void) {
    let n = this.getLineNumber();
    f();
    if (this.isAt(n)) {
      let str = this.peek() || (this.hasInput ? "<blank line>" : "<end>");
      throw Error("Cannot parse input: " + str);
    }
  }

  /** Returns the meta/custom definition for given property */
  getDefinition(name: string) {
    if (this._defs[name] == null) {
      throw Error("Definition not found for: " + name);
    }
    return String(this._defs[name]);
  }

  /** Disable input-level replacements (comments, insert tags) */
  disableReplacements() {
    this._noReplace = true;
  }

  /** Re-enable input-level replacements (after calling `disableReplacements` earlier) */
  enableReplacements() {
    this._noReplace = false;
  }

  /** Replace comments and insert tags for the next line in the buffer */
  private _autoReplace() {
    if (!this._lines.length || this._noReplace) return;
    let line = this._lines[0]
      .replace(/<!--(.*?)-->/g, "")
      .replace(/^([-*> \t]+)\\\\insert\s*\(([^\s\)]+)\)/gm, (_m, pre, name) => {
        // replace 'insert' at the START of a line (repeat prefix)
        let defLines = this.getDefinition(name)
          .split(/\n/)
          .map(s => pre + s);
        this._lines.splice(1, 0, ...defLines.slice(1));
        return defLines[0];
      });
    this._lines[0] = line;
  }

  /** The current file name */
  readonly fileName: string;

  /** The document output context */
  readonly output: OutputContext;

  private _n = 1;
  private _lines: string[] = [];
  private _defs: any;
  private _noReplace?: boolean;
}

function parse(ctx: ParseContext) {
  /** Next set of custom properties as read from the input */
  let _nextProps: any;

  /** Get the pending set of (block) properties and clear it right away */
  function getPendingProps() {
    let result = _nextProps || {};
    _nextProps = undefined;
    return result;
  }

  /** Add to the pending set of (block) properties */
  function setPendingProps(props: any) {
    if (!_nextProps) _nextProps = {};
    if (typeof props === "string") {
      props.split(/[\s,;]+/).forEach(name => {
        if (!name) return;
        Object.assign(_nextProps, ctx.output.getStyleProps(name));
      });
    } else {
      Object.assign(_nextProps, props);
    }
  }

  /** Parse line(s) with custom properties for the next block; does NOT return anything */
  function parseCustomProps(indent: number) {
    let text = "";
    let start = ctx.getLineNumber();
    let lastError: any;
    while (ctx.hasInput()) {
      let line = ctx.peek();
      let i = line.match(/^\s*/)![0].length;
      if (i < indent && !ctx.isAt(start)) break;
      let str = line.slice(indent);
      if (!/^\s*\\\\/.test(str)) break;
      text += (text ? "\n" : "") + str.replace(/^\s*\\\\/, "").trim();
      ctx.shift();
      try {
        let styleMatch = text.match(/\{\s*([-,;\w\s]+)\}/);
        setPendingProps(styleMatch ? styleMatch[1] : JSON.parse(text));
        text = "";
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (text) throw lastError || Error("Invalid property JSON: " + text);
  }

  /** Eat current line and return separator block */
  function parseSeparator() {
    ctx.shift();
    return makeSeparator(ctx.output.config, getPendingProps());
  }

  /** Parse heading (single line) */
  function parseHeading(indent: number) {
    let text = ctx.shift()!.slice(indent);
    let level = text.match(/^\#+/)![0].length;
    text = text.replace(/^\#+\s*/, "");
    let id = "heading__" + ctx.output.getHeadingId();
    text = text.replace(/\s*\{\#([^\s\}]+)\}\s*$/, (_m, id1) => {
      id = id1;
      return "";
    });
    let result = parseInline(text, ctx);
    result.forEach(r => {
      if (r.style === "autonum") r.style = "autonum_h" + level;
    });
    ctx.output.addRefId(id, result, level);
    return asTextNode(result, {
      style: "h" + level,
      headlineLevel: level,
      id,
      ...getPendingProps(),
    });
  }

  /** Parse paragraph text line(s) */
  function parseParagraph(indent: number) {
    let props = getPendingProps();
    let start = ctx.getLineNumber();
    let p = "";
    while (ctx.hasInput()) {
      let line = ctx.peek();
      let i = ctx.isAt(start) ? indent : line.match(/^\s*/)![0].length;
      if (i < indent || line.length <= i) break;
      let text = line.slice(i).replace(/\\$/, "\n");
      if (RE_LINE_NOT_PLAIN_TEXT.test(text)) break;
      if (RE_TABLE_SEPARATOR_LINE.test(text)) {
        return parseTable(i, p, props);
      }
      p += (p.length ? " " : "") + text;
      ctx.shift();
    }
    return asTextNode(parseInline(p, ctx), { style: "p", ...props });
  }

  /** Parse table; always called from `parseParagraph` which passes the first (heading) line which may have already been read (but not parsed), the next pending line in the buffer context is going to be the 'separator' line */
  function parseTable(indent: number, firstLine: string, props: any) {
    let headerRows = firstLine ? 1 : 0;

    // read separator line and figure out columns
    let widths: string[] = [];
    let alignment: string[] = [];
    let sep = ctx.shift().split("|");
    sep = sep.map(s => s.trim());
    sep.forEach((col, i) => {
      if (!col) return;
      widths.push("auto");
      if (col[col.length - 1] === ":") {
        let align = col[0] === ":" ? "center" : "right";
        alignment[i] = align;
      }
    });

    // parse heading line and all rows
    let body: any[] = [];
    const parseLine = (text: string, style: string) => {
      let p = parseInline(text, ctx);
      let cols: any[] = [[]];
      p.forEach(node => {
        let current = cols[cols.length - 1];
        if (typeof node === "string") {
          // look for all pipe chars, filter out
          // first/last columns below if extra
          let colSplit = node.split(/(?<!\\)\|/).map(s => s.replace(/\\\|/g, "|"));
          if (colSplit.length > 1) {
            node = colSplit.pop()!.trimLeft();
            colSplit.forEach(s => {
              if (!current.length) {
                current.push(s.trim());
              } else if (s !== "") {
                current.push(s.trimRight());
              }
              cols.push((current = []));
            });
          }
        }
        if (current.length === 1 && current[0] === "") {
          cols[cols.length - 1] = current = [node];
        } else {
          current.push(node);
        }
      });
      let row: any[] = [];
      cols.forEach((col, i) => {
        if (!sep[i] && (col.length <= 1 && !col[0])) {
          return;
        }
        let cell: any = asTextNode(col, { style });
        if (alignment[i]) cell.alignment = alignment[i];
        row.push(cell);
      });
      if (row.length !== widths.length) {
        let rowText = flattenText(row, " | ");
        if (rowText.length > 40) rowText = rowText.slice(0, 37) + "...";
        throw Error("Inconsistent table row length: " + rowText);
      }
      body.push(row);
    };
    if (firstLine) parseLine(firstLine, "tableHeader");
    while (true) {
      let line = ctx.peek();
      let i = line.match(/^\s*/)![0].length;
      if (i < indent || line.length <= i) break;
      parseLine(ctx.shift().slice(i), "tableCell");
    }

    // return table structure
    if ("widths" in props) widths = props.widths;
    return {
      layout: "default",
      style: "table",
      ...props,
      table: { body, widths, headerRows },
    };
  }

  /** Parse list items at given indentation and starting with given RegExp */
  function parseList(indent: number, re: RegExp) {
    let isOrdered = /\d/.test(ctx.peek()[indent]);
    let props = getPendingProps();
    let start = ctx.getLineNumber();

    let items: any[] = [];

    // keep going until no longer within the same list
    while (ctx.hasInput()) {
      let line = ctx.peek();
      let i = ctx.isAt(start) ? indent : line.match(/^\s*/)![0].length;
      let text = line.slice(i);
      if (!text.length) {
        // skip empty lines between list items
        ctx.shift();
        continue;
      }
      if (i < indent) break;

      // find out text indent and parse content
      if (!re.test(text)) break;
      text = text.replace(re, "");
      let textIndent = line.length - text.length;
      let li = parseAny(textIndent);
      if (li.length === 1) {
        let content = li[0];
        if (typeof content === "string") {
          items.push({ text: content, style: "li" });
        } else if (Array.isArray(content)) {
          items.push({ stack: content, style: "li" });
        } else if (!content.style || content.style === "p") {
          items.push({ ...content, style: "li" });
        } else if (content.ul || content.ol) {
          items.push(content);
        } else {
          items.push({ style: "li", ...content });
        }
      } else {
        items.push({ stack: li, style: "li" });
      }
    }

    // convert to table if props contain 'table'
    if ("table" in props) {
      return listToTable(items, props);
    }

    // convert to columns if props contain 'columns'
    if ("columns" in props || "columnGap" in props) {
      return listToColumns(items, props);
    }

    // return OL or UL structure
    let type = isOrdered ? "ol" : "ul";
    let style = indent ? type + "_inner" : type;
    return { [type]: items, style, ...props };
  }

  /** Converts a nested list structure to a table */
  function listToTable(items: any[], props: any) {
    let widths = props.widths;
    let layout = props.table;
    if (!(typeof layout === "string")) layout = "default";
    let headerRows = "headerRows" in props ? props.headerRows : 1;

    // turn all nested ULs into rows
    let body = items.map((r, i) => {
      if (!r.ul) {
        r = r.stack && r.stack.filter((n: any) => n.ul)[0];
        if (!r || !r.ul) return;
      }
      r.ul.forEach((c: any) => {
        if (c.style === "li") {
          c.style = i >= headerRows ? "tableCell" : "tableHeader";
        }
      });
      return r.ul;
    });
    body = body.filter(r => !!r);
    if (!body.length) throw Error("Table has no rows");

    return {
      layout,
      style: "table",
      ...props,
      table: { body, widths, headerRows },
    };
  }

  /** Converts a list structure to a group of columns */
  function listToColumns(columns: any[], props: any) {
    let widths = props.widths;
    if (Array.isArray(widths)) {
      widths.forEach((width, i) => {
        if (columns[i]) {
          if (columns[i].stack) {
            columns[i] = { ...columns[i], width };
          } else {
            columns[i] = asTextNode(columns[i], { width });
          }
        }
      });
    }
    return { style: "block_outer", ...props, columns };
  }

  /** Parse a pre-formatted block (until next backticks) */
  function parsePre(indent: number) {
    let firstLine = ctx.shift(); // eat up first backticks
    let ticks = firstLine.match(/^\s*(\`+)/)![1];
    let start = ctx.getLineNumber();
    let stack: any[] = [];
    ctx.disableReplacements();
    while (ctx.hasInput()) {
      let line = ctx.peek();
      let i = ctx.isAt(start) ? indent : line.match(/^\s*/)![0].length;
      let str = line.slice(indent);
      if (i < indent && str) break;
      ctx.shift();
      if (str.slice(0, ticks.length) === ticks) break;
      if (!str) str = "\u00A0";
      stack.push(asTextNode(str, { style: "code", preserveLeadingSpaces: true }));
    }
    ctx.enableReplacements();
    let props = ctx.output.getStyleProps("pre");
    if (stack.length <= 5) props.unbreakable = true;
    return makeBlock(stack, { ...props, ...getPendingProps() });
  }

  /** Parse a (quote) block */
  function parseBlock(indent: number) {
    let next = new (class extends ParseContext {
      constructor() {
        super(ctx.fileName, ctx.output);
      }
      getDefinition(name: string) {
        return ctx.getDefinition(name);
      }
      hasInput() {
        let next = ctx.peek();
        let i = next.match(/^\s*/)![0].length;
        return i === indent && next[i] === ">";
      }
      peek() {
        return ctx.peek().replace(/^\s*\>\s?/, "");
      }
      shift() {
        return ctx.shift().replace(/^\s*\>\s?/, "");
      }
      getLineNumber() {
        return ctx.getLineNumber();
      }
    })();
    let stack = parse(next);
    return makeBlock(stack, {
      unbreakable: true,
      style: "block",
      ...getPendingProps(),
    });
  }

  /** Parse an `\\include(...)` tag */
  function parseIncludeTag(indent: number, pattern: string, remainder: string) {
    ctx.shift();
    if (!pattern) {
      throw Error("Missing file name in \\\\include(...) tag");
    }
    return parseFileRef(pattern, remainder, ctx, indent, getPendingProps());
  }

  /** Parse given lines, as long as indented same or greater */
  function parseAny(indent: number) {
    let content: any[] = [];
    let start = ctx.getLineNumber();
    while (ctx.hasInput()) {
      // peek text and check indent
      let line = ctx.peek();
      let i = ctx.isAt(start) ? indent : line.match(/^\s*/)![0].length;
      let text = line.slice(i);
      if (i < indent && text) return content;

      // parse text, asserting that the parser head advances
      ctx.validate(() => {
        if (!text) ctx.shift();
        else if (/^\\\\\{/.test(text)) parseCustomProps(i);
        else if (text[0] === "#") content.push(parseHeading(i));
        else if (/^\-{3,}\s*$/.test(text)) content.push(parseSeparator());
        else if (/^\-\s/.test(text)) content.push(parseList(i, /^\s*\-\s/));
        else if (/^\*\s/.test(text)) content.push(parseList(i, /^\s*\*\s/));
        else if (/^\d+\.\s/.test(text)) content.push(parseList(i, /^\s*\d+\.\s/));
        else if (/^\>\s/.test(text)) content.push(parseBlock(i));
        else if (/^\`\`\`/.test(text)) content.push(parsePre(i));
        else {
          // check for tags, otherwise treat as paragraph
          let tagMatch = text.match(/^\s*\\\\(\w+)(?:\(([^\)]+)\))?(.*)/);
          let tag = tagMatch && tagMatch[1].toLowerCase();
          switch (tag) {
            case "include":
            case "image":
            case "img":
              content.push(...parseIncludeTag(i, tagMatch![2], tagMatch![3]));
              break;
            case "pagebreak":
              ctx.shift();
              content.push({ stack: [], pageBreak: "after" });
              break;
            case "toc":
              ctx.shift();
              content.push(ctx.output.getTOCTable());
              break;
            default:
              content.push(parseParagraph(i));
          }
        }
      });
    }
    return content;
  }

  return parseAny(0);
}

/** Parse an entire markdown file and return a content array */
export function parseMarkdownFile(fileName: string, output: OutputContext, defs?: any) {
  let str = readFileSync(fileName).toString();
  if (output.config.output.debug) {
    console.log("...parsing " + fileName);
  }

  // parse file using a new context structure
  let ctx = new ParseContext(fileName, output, defs);
  try {
    ctx.append(str);
    return parse(ctx);
  } catch (err) {
    throw {
      code: "PARSE_ERROR",
      message: err.message || String(err),
      line: ctx.getLineNumber(),
      fileName,
    };
  }
}
