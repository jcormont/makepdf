import { Defaults } from "../config/index.js";
import { flattenText } from "./inline.js";

class AutoNumberState {
  constructor(private _prev?: AutoNumberState, private _isAlpha?: boolean) {}

  inc() {
    this._num++;
    this._next = {};
    return this.current();
  }

  current(suffix = ""): string {
    if (!this._prev) return "";
    if (!this._num) this._num = 1;
    let cur = this._isAlpha ? String.fromCharCode(64 + this._num) : this._num;
    return this._prev.current(".") + cur + suffix;
  }

  getNextAlpha(name?: string) {
    let id = "A" + (name || "default");
    if (!this._next[id]) {
      this._next[id] = new AutoNumberState(this, true);
    }
    return this._next[id];
  }

  getNextNum(name?: string) {
    let id = "N" + (name || "default");
    if (!this._next[id]) {
      this._next[id] = new AutoNumberState(this);
    }
    return this._next[id];
  }

  private _next: { [id: string]: AutoNumberState } = {};
  private _num = 0;
}

export class OutputContext {
  constructor(public readonly config: Defaults) {}

  getBaseDir() {
    return this.config.input.baseDir || "./";
  }

  getStyleProps(style: string) {
    let styles: any = this.config.styles;
    if (!styles[style]) {
      throw Error("Style not defined: " + style);
    }
    return styles[style];
  }

  getHeadingId() {
    return this._nextHeadingId++;
  }

  getMaxTocLevel() {
    return this.config.output.tocLevel || 1;
  }

  mergeDefinitions(overrides: any = {}) {
    return { ...this.config.define, ...this.config.output.info, ...overrides };
  }

  addRefId(id: string, text: any, headingLevel: number) {
    text = flattenText(text);
    this._refIds[id] = { text, headingLevel };
    if (headingLevel >= 1 && headingLevel <= this.getMaxTocLevel()) {
      this._toc.push(id);
    }
  }

  addRefToUpdate(id: string, refNode: any) {
    this._refsToUpdate.push({ id, refNode });
    return refNode;
  }

  updateRefs() {
    this._refsToUpdate.forEach((r) => {
      if (!this._refIds[r.id]) throw Error("Reference not found: " + r.id);
      r.refNode.text = this._refIds[r.id]?.text || "";
    });
    Object.assign(this._tocTable, this.config.styles.toc);
    this._tocTable.table = {
      widths: this.config.styles.toc.widths,
      body: this._toc.map((id) => [
        {
          linkToDestination: id,
          text: this._refIds[id]!.text,
          style: "toc" + this._refIds[id]!.headingLevel,
        },
        { pageReference: id, alignment: "right" },
      ]),
    };
  }

  autoNumber(pattern: string) {
    let num = this._numState;
    while (pattern.length) {
      let nextIdx = pattern.indexOf(".") + 1;
      if (pattern[0] === "(") {
        let endIdx = pattern.indexOf(")");
        let name = pattern.slice(1, endIdx > 0 ? endIdx : 1);
        num = num.getNextNum(name);
      } else if (pattern[0] === "[") {
        let endIdx = pattern.indexOf("]");
        let name = pattern.slice(1, endIdx > 0 ? endIdx : 1);
        num = num.getNextAlpha(name);
      }
      if (nextIdx <= 0) break;
      pattern = pattern.slice(nextIdx);
    }
    return num.inc() + this.config.output.autonumSuffix;
  }

  getTOCTable() {
    return this._tocTable;
  }

  private _numState = new AutoNumberState();

  private _nextHeadingId = 1;
  private _toc: string[] = [];
  private _tocTable: any = {};
  private _refIds: { [id: string]: { text: string; headingLevel: number } } = {};
  private _refsToUpdate: Array<{ id: string; refNode: { text: string } }> = [];
}
