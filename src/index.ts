import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import * as path from "path";
import {
  Defaults,
  findFontFiles,
  getConfig,
  pageBreakBefore,
  getTableLayouts,
} from "./config/index.js";
import { getFooterFn } from "./content/footer.js";
import { OutputContext } from "./parser/context.js";
import { parseMarkdownFile } from "./parser/parse.js";
import { DynamicContent, Margins, PageOrientation } from "pdfmake/interfaces.js";

const PROGRAM_NAME = "makepdf";
const DEFAULT_CONFIG = "makepdf.json";

let writeOutputLog = false;

/** Output PDF using `pdfmake` */
async function writePdf(content: any[], ctx: OutputContext) {
  if (writeOutputLog) console.log("...generating PDF");
  let PdfPrinter = (await import("pdfmake")).default;
  let fonts = findFontFiles(ctx.config.fonts);
  let printer = new PdfPrinter(fonts);
  let pdfDoc = printer.createPdfKitDocument(
    {
      info: ctx.config.output.info,
      pageSize: ctx.config.output.pageSize,
      pageOrientation: ctx.config.output.pageOrientation as PageOrientation,
      pageMargins: ctx.config.output.pageMargins as Margins,
      defaultStyle: ctx.config.styles.default,
      styles: ctx.config.styles as any,
      pageBreakBefore,
      content,
      footer: getFooterFn(ctx.config) as DynamicContent,
    },
    {
      tableLayouts: getTableLayouts(ctx.config),
    }
  );
  let dirName = path.dirname(ctx.config.output.file);
  if (!existsSync(dirName)) mkdirSync(dirName, { recursive: true });
  if (writeOutputLog) console.log("Writing to " + ctx.config.output.file);
  pdfDoc.pipe(createWriteStream(ctx.config.output.file));
  pdfDoc.end();
}

/** Run given function for each configuration entry (if config file is an array) */
function withConfig(configFileName: string | undefined, f: (config: Defaults) => void) {
  let allConfig: Defaults[];
  if (!configFileName && existsSync(DEFAULT_CONFIG)) configFileName = DEFAULT_CONFIG;
  if (configFileName) {
    if (!existsSync(configFileName)) {
      console.log("Configuration file not found: " + configFileName);
      process.exit(1);
    }
    let overrides = JSON.parse(readFileSync(configFileName).toString());
    if (!Array.isArray(overrides)) overrides = [overrides];
    allConfig = overrides.map((o: any) => getConfig(o));
  } else {
    allConfig = [getConfig()];
  }
  allConfig.filter((c) => !c.skip).forEach(f);
}

/** Generate a PDF document using given configuration */
export async function generate(config: Defaults) {
  let context = new OutputContext(config);
  let content: any[];
  try {
    let fileName = config.input.entry;
    if (config.input.baseDir) {
      fileName = path.resolve(config.input.baseDir, fileName);
    }
    content = await parseMarkdownFile(fileName, context);
    context.updateRefs();
    if (config.output.debug) {
      writeFileSync("debug.json", JSON.stringify(content, undefined, "  "));
    }
  } catch (err: any) {
    if (err.code === "PARSE_ERROR") {
      console.error(`*** Parse error (${err.fileName}:${err.line})\n${err.message}`);
    } else {
      console.error(err);
    }
    return process.exit(1);
  }
  await writePdf(content, context);
}

/** CLI main function */
async function main() {
  let arg = process.argv[2];
  if (arg === "--help" || arg === "-h") {
    console.log("Usage: " + PROGRAM_NAME + " [configurationfile]");
    process.exit(0);
  }
  withConfig(arg, async (config) => {
    // make paths relative to config file
    let argBase = arg && path.resolve(path.dirname(arg));
    if (config.output.file && argBase) {
      config.output.file = path.resolve(argBase, config.output.file);
    }
    if (config.input.baseDir && argBase) {
      config.input.baseDir = path.resolve(argBase, config.input.baseDir);
    }
    if (!config.input.baseDir) config.input.baseDir = argBase;

    // set/warn about output info fields
    if (!config.output.info.creator) config.output.info.creator = PROGRAM_NAME;
    if (!config.output.info.producer) config.output.info.producer = PROGRAM_NAME;
    if (!config.output.info.author) {
      console.log("Warning: Missing author field in config (output.info.author)");
    }
    if (!config.output.info.title) {
      console.log("Warning: Missing title field in config (output.info.title)");
    }
    if (!config.output.info.subject) {
      console.log("Warning: Missing subject field in config (output.info.subject)");
    }

    // generate the PDF for this config
    writeOutputLog = true;
    await generate(config);
  });
}

main();
