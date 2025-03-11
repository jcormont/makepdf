import { Defaults } from "../config/index.js";

export function getFooterFn(config: Defaults) {
  return function (currentPage: number, numPages: any) {
    if (
      (config.output.footerEndPage! < 0 &&
        currentPage > numPages + config.output.footerEndPage!) ||
      (config.output.footerEndPage! > 0 && currentPage > config.output.footerEndPage!)
    )
      return null;
    if (config.output.footerStartPage) {
      currentPage -= config.output.footerStartPage - 1;
    }
    if (currentPage < 1) return null;
    return {
      columns: [
        {
          width: "*",
          text: [
            { text: config.output.info.title, bold: true },
            { text: " — " + config.output.info.subject },
          ],
          color: "#666666",
        },
        {
          width: 100,
          text: String(currentPage),
          alignment: "right",
        },
      ],
      style: "footer",
      margin: config.output.footerMargins,
      font: "Headings Light",
    };
  };
}
