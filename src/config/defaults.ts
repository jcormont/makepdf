import styles from "./styles.js";

const PLEX_FONT_LIGHT = {
  normal: "@ibm/plex/**/IBMPlexSans-Light.ttf",
  bold: "@ibm/plex/**/IBMPlexSans-Regular.ttf",
  italics: "@ibm/plex/**/IBMPlexSans-LightItalic.ttf",
  bolditalics: "@ibm/plex/**/IBMPlexSans-Italic.ttf",
};
const PLEX_FONT_REGULAR = {
  normal: "@ibm/plex/**/IBMPlexSans-Text.ttf",
  bold: "@ibm/plex/**/IBMPlexSans-SemiBold.ttf",
  italics: "@ibm/plex/**/IBMPlexSans-TextItalic.ttf",
  bolditalics: "@ibm/plex/**/IBMPlexSans-SemiBoldItalic.ttf",
};
const PLEX_FONT_BOLD = {
  normal: "@ibm/plex/**/IBMPlexSans-Medium.ttf",
  bold: "@ibm/plex/**/IBMPlexSans-Bold.ttf",
  italics: "@ibm/plex/**/IBMPlexSans-MediumItalic.ttf",
  bolditalics: "@ibm/plex/**/IBMPlexSans-BoldItalic.ttf",
};
const PLEX_FONT_MONO = {
  normal: "@ibm/plex/**/IBMPlexMono-Text.ttf",
  bold: "@ibm/plex/**/IBMPlexMono-Bold.ttf",
  italics: "@ibm/plex/**/IBMPlexMono-TextItalic.ttf",
  bolditalics: "@ibm/plex/**/IBMPlexMono-BoldItalic.ttf",
};

export default {
  skip: false,
  define: {},
  input: {
    baseDir: undefined as string | undefined,
    entry: "index.md",
  },
  output: {
    debug: false,
    footerStartPage: 1,
    footerEndPage: 0,
    tocLevel: 2,
    autonumSuffix: " ",
    pageSize: { width: 432, height: 648 },
    pageOrientation: "portrait",
    pageMargins: [54, 40, 54, 60],
    footerMargins: [54, 10, 54, 0],
    file: "dist/out.pdf",
    info: {
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "",
      producer: "",
    },
  },
  fonts: {
    "Headings Light": PLEX_FONT_LIGHT,
    Headings: PLEX_FONT_REGULAR,
    "Headings Bold": PLEX_FONT_BOLD,
    "Body Light": PLEX_FONT_LIGHT,
    Body: PLEX_FONT_REGULAR,
    "Body Bold": PLEX_FONT_BOLD,
    Monospaced: PLEX_FONT_MONO,
  },
  styles,
};
