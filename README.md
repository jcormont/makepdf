# makepdf

This tool converts Markdown documents (with some additional LaTeX-inspired tags) to professional-looking PDF documents, mostly targeted towards software specs and documentation.

Based on the awesome [`pdfmake`](https://github.com/bpampuch/pdfmake) tool, which is itself based on [`pdfkit`](https://github.com/foliojs/pdfkit).

## Samples

The source repository contains sample documents in the `sample/` folder.

This includes a manual that highlights most of the available features. The output for this document can be found in the root folder (see [`manual.pdf`](./manual.pdf)).

## Configuration

Configuration is read from `makepdf.json`, unless an argument is specified on the command line.

Refer to the PDF manual for the configuration format.

## Ideas

Some ideas for improvement:

- Use `.js` files with conventional naming (or defined in the config file) for e.g. headers and footers, adding table styles, post-processing headings, tables, etc. or a hook for the entire document.
- Standard files for front & back matter.
- Produce HTML alongside PDF for 'online help' files.
