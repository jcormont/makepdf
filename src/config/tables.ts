import { Defaults } from "./index.js";

function fval<T>(v: T) {
  return () => v;
}

export function getTableLayouts(config: Defaults) {
  return {
    block: {
      hLineWidth(idx: number, block: any) {
        let body = block && block.table && block.table.body;
        let cell = body && body[0] && body[0][0];
        let w = cell && cell.borderWidth;
        return (w && (idx && w[3] != null ? w[3] : w[1])) || 0;
      },
      vLineWidth(idx: number, block: any) {
        let body = block && block.table && block.table.body;
        let cell = body && body[0] && body[0][0];
        let w = cell && cell.borderWidth;
        return (w && (idx && w[2] != null ? w[2] : w[0])) || 0;
      },
      paddingLeft: fval(0),
      paddingRight: fval(0),
      paddingTop: fval(0),
      paddingBottom: fval(0),
    },
    separator: {
      hLineWidth: fval(config.styles.separator.lineWidth),
      vLineWidth: fval(0),
      hLineColor: fval(config.styles.separator.lineColor),
      paddingLeft: fval(0),
      paddingRight: fval(0),
      paddingTop: fval(0),
      paddingBottom: fval(0),
    },
    default: {
      hLineWidth: fval(0.5),
      vLineWidth: fval(0),
      hLineColor: fval("#aaaaaa"),
      paddingLeft: fval(4.5),
      paddingRight: fval(4.5),
      paddingTop: fval(3),
      paddingBottom: fval(3),
    },
    allBorders: {
      hLineWidth: fval(0.5),
      vLineWidth: fval(0.5),
      hLineColor: fval("#aaaaaa"),
      vLineColor: fval("#aaaaaa"),
      paddingLeft: fval(4.5),
      paddingRight: fval(4.5),
      paddingTop: fval(3),
      paddingBottom: fval(3),
    },
    toc: {
      hLineWidth: (i: number) => (i ? 0.5 : 0),
      vLineWidth: fval(0),
      paddingLeft: fval(0),
      paddingTop: fval(1),
      paddingBottom: fval(1),
      hLineColor: fval("#cccccc"),
      hLineStyle: fval({ dash: { length: 1, space: 4 } }),
    },
  };
}
