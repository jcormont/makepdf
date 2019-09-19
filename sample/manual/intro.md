# Introduction

This document contains instructions for use of the `makepdf` tool. The source for this document is available in the `sample/` folder of the project's repository on Github.

The `makepdf` software package uses the [pdfmake](https://github.com/bpampuch/pdfmake) package, which is itself based on [pdfkit](https://github.com/foliojs/pdfkit). All packages are available under an open source license, and are available for installation through NPM.

## Installation

Generating PDF files with makepdf requires installing [Node.JS](https://nodejs.org) and the accompanying NPM package manager. Editing source files (Markdown) does not require Node.JS or NPM.

**Running makepdf.** To generate a PDF file from Markdown files in the current folder, run the following command in a Command Prompt (Windows) or Terminal (Mac OS/Linux) window:

```bash
npx makepdf
```

This looks for `makepdf` on NPM, and runs the code locally. By default, the `index.md` file is converted, but it's recommended to create a configuration file to customize input and output settings (see [](#config)). Configuration files with the name `makepdf.json` will be used automatically, but you can also pass the name of a configuration file by appending a file name to the end of the command above.

**Installation as a global executable.** This method makes the `makepdf` command available without the use of `npx`.

To install `makepdf` on your computer, run the following command:

```bash
npm install -g makepdf
```

Now you can create PDF files using the `makepdf` command, with an optional parameter for the configuration file name.

## Configuration {#config}

Project configuration files are usually named `makepdf.json`, but any other file name can be passed to the `makepdf` command, including files located in other folders.

The configuration is stored using the JSON file format -- either as a single object, or as an array of objects for multiple output files. For an example configuration file, refer to the `sample/` folder of the Github repository.

The following options are available. None or required, but leaving out the 'info' values results in a warning.

\\{defs}

- (heading)
  - Option
  - Description
- |
  - skip
  - **boolean** True if this document should not be generated (useful if the configuration file contains an array for multiple documents).
- |
  - define
  - **object** Key-value (string) map of texts that can be inserted using the `\\insert` tag.
- |
  - input.baseDir
  - Path name for the directory that contains all other files (if not the same as the directory that contains the configuration file itself).
- |
  - input.entry
  - Path and/or file name for the Markdown file that is converted. Defaults to `index.md`.
- |
  - output.debug
  - **boolean** True if an additional file called `debug.json` should be generated, which contains the document structure that is sent to `pdfmake`.
- |
  - output.file
  - Path and file name for the resulting PDF file.
- |
  - output.info
  - **object** Key-value (string) map for meta data that gets saved to the PDF file. This includes `title`, `author`, `subject`, and `keywords`.
- |
  - output.footerStartPage
  - First page (1-n) that should include a footer with the document title and subject, and page number.
- |
  - output.footerEndPage
  - Last page (1-n, _or_ negative value) that should include a footer. Negative values indicate pages _before_ the end, i.e. -1 is the last page, -2 the page before that, etc.
- |
  - output.tocLevel
  - Lowest heading level (1-n) to be included in the automatically generated Table of Contents.
- |
  - output.autonumSuffix
  - Suffix to be appended to all automatically generated numbers. Defaults to a single space, but some might prefer a dot instead.
- |
  - output.pageSize
  - **object** with `height` and `width` properties (in points, i.e. 1/72\"), for the total size of the generated page(s). May also be set to a 'named' page size, e.g. `"A4"` (as a string). The default page size is 6\" by 9\" for improved readability on screens, or printing at the size of a pocket-sized book.
- |
  - output.pageOrientation
  - Either `portrait` (default) or `landscape`.
- |
  - output.pageMargins
  - **array** (left, top, right, bottom values), page margins in points.
- |
  - output.footerMargins
  - **array** (left, top, right, bottom values), margins around the footer area, within the page area. The top value is used for the offset between text and footer, the bottom value is usually 0.
- |
  - fonts
  - **object** Key-object map that defines a font by name, and lists font _files_ for different styles (glob, e.g. `"fonts/**/Arial.ttf"` to find the Arial font within any folder that is located within the `fonts` folder). Styles should include `normal`, `bold`, `italics`, and `bolditalics`. Default font names include "Headings", "Headings Bold", "Headings Light", "Body", "Body Bold", "Body Light", "Monospaced", and "Symbol".
- |
  - styles
  - **object** Key-object map that defines text styles by name, and lists properties for each style. All properties are passed to the `pdfmake` library directly, refer to its documentation for more information. The default set is defined in the `src/config/styles.ts` file in the makepdf Github repository.
