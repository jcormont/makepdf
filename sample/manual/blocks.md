# Blocks

Text in the document is grouped into 'block-level' elements, or blocks. Some blocks can also be nested.

The following types of blocks are supported:

- Paragraphs
- Headings
- Lists
- Separators (horizontal lines, and page breaks)
- Code blocks
- Other blocks (quote/note style)

## Paragraphs

The most common block is the paragraph. This is simply a continuous line of text that is automatically wrapped across multiple lines in the resulting document if needed.

Paragraphs are separated by empty lines, *or* other types of blocks (e.g. separators or lists).

In the source document, a single paragraph can be split across multiple lines. A single line break in the source document has no effect on the output. Insert manual line breaks within the text if needed (see [](#auto)].

## Headings

Markdown-style headings using hash characters `#` are supported. One hash character at the start of a line denotes a level-1 heading, two characters denotes a level-2 heading, and so on. Only 4 levels are supported.

```markdown
# Level 1 heading
## Level 2 heading
Body text (optionally separated using a blank line).
```

Automatic numbering and references are handled specially within heading blocks. Refer to [](#refs) for details.

## Lists

Single or multi-level lists can be formatted using Markdown syntax. Use either dashes `-` or asterisks `*` followed by one space, or numbers followed by a dot and a space to demarcate list items.

Empty lines between list items are allowed, and number ranges do not need to be contiguous.

```markdown
- This is an example.
- Nest lists by indenting each nested item:
  1. One
  2. Two
  1. Three
```

- This is an example.
- Nest lists by indenting each nested item:
  1. One
  2. Two
  1. Three

To add other blocks within lists, make sure that the block is indented at least as deeply as the list text itself.

- This is a list item
    ```
    This is a code block within a list item.
    ```

- Another list item.

  A second paragraph.

## Separators

**Horizontal line** -- Insert a horizontal line using three or more dashes on a single line (i.e. `---`). The inserted line is surrounded by a significant amount of padding. Override the predefined `separator` style's `lineWidth`, `lineColor`, and `margin` properties to change the separator's appearance.

**Page break** -- Insert a manual page break at any point using the `\\pagebreak` tag. This tag must appear on a separate line as well.

## Pre-formatted blocks (code) {#codeblocks}

To format code in blocks of monospaced text, wrap the text between lines consisting of three or more backticks.

````
```
This text will be formatted using a monospaced font,
  indentation and newlines are preserved.
```
````

**Note:** Code blocks of five lines or less are automatically made 'unbreakable', i.e. they will not be split across multiple pages in the final document.

## Other blocks

Similar to code blocks, other text blocks can be made to stand out from the rest using indentation, background color, or borders. Use the Markdown 'quote' syntax to format text as a separate block:

```markdown
This text is not in a block.

> This text is in a block.
> This is on the same line.
```

This text is not in a block.

> This text is in a block.
> This is on the same line.

By default, the text is only indented slightly. To make the block stand out more, use block styles and properties (see below).

## Block styling

All types of blocks (paragraphs, headings, lists, separators, code, other blocks, and also [Tables](#tables)) can be formatted using additional style properties, which are passed directly to the `pdfmake` tool.

You can either pass these properties individually, or use one or more of the named styles that are defined in the [configuration file](#config).

### Block property tags {#blockprops}

To specify individual properties for a block, use one or more 'property tags' on a separate line before the block. These tags are formatted using JSON:

```markdown
\\{"alignment": "right", "color": "red"}
Red and right aligned paragraph.
```

\\{"alignment": "right", "color": "red"}
Red and right aligned paragraph.

One or more blank lines may appear between a property tag and the block itself, which will not introduce additional space in the output document.

Block property tags can be formatted to span multiple lines if that makes the JSON structure easier to read -- especially for 'quote' style blocks, which can have multiple properties for border widths and colors as illustrated below.

```markdown
\\{
\\  "margin": [15, 10, 0, 10],
\\  "fillColor": "#ffeeee",
\\  "color": "red",
\\  "borderWidth": [5, 0, 1, 1],
\\  "borderColor": ["red", "#ccc", "#ccc", "#ccc"]
\\}
> This block looks very different.
```

\\{
\\  "margin": [15, 10, 0, 10],
\\  "fillColor": "#ffeeee",
\\  "color": "red",
\\  "borderWidth": [5, 0, 1, 1],
\\  "borderColor": ["red", "#ccc", "#ccc", "#ccc"]
\\}
> This block looks very different.

### Block style tags {#blockstyle}

Instead of specifying individual properties for each block, you can also use named block styles. Named styles are predefined groups of properties.

A number of built-in styles are available as well, such as `bold`, `italics`, `left`, `right`, `center`, `small`, `nomargin`, `caption`, `h1`-`h4`, `unbreakable`, and `note`.

Styles can be added or overridden using the [Configuration file](#config).

Specify one or more styles using a single tag using curly braces, e.g.:

```markdown
\\{note}
> **Note**: This is a note block. It stands out from the rest of the text.

\\{right small unbreakable}
This style works well for smallprint, aligned to the right side of the page and set using a smaller font and slightly faded color. The text will not be broken up across multiple pages if it occurs near the bottom of a page.
```

\\{note}
> **Note**: This is a note block. It stands out from the rest of the text.

\\{right small unbreakable}
This style works well for small print, aligned to the right side of the page and set using a smaller font and slightly faded color. The text will not be broken up across multiple pages if it occurs near the bottom of a page.
