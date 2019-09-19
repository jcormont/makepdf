# Inline Formatting

Makepdf supports inline Markdown formatting, as well as a number of extensions that are mostly based on LaTeX-like syntax.

## Automatic replacements {#auto}

Some punctuation and other characters are replaced to 'typographic' versions automatically. This includes the following characters:

- Straight double quotes are replaced with "curly quotes".
- Straight single quotes and apostrophe (e.g. in **it's**) are also replaced with 'curly quotes'.
- Double dash `--` is replaced with an em-dash -- like so.
- Three dots `...` are replaced with a single character '...' for better spacing.

Additionally, some special characters can be inserted using special codes:

- Use `\\newline` to insert a newline character. Alternatively, add a single backslash character `\` to the very end of a line.
- Use `\~` to insert a non-breaking space.

Special characters \\code{\\v=`\*_{}[]()<>#+-.!'"=} can be inserted verbatim by preceding them with a backslash. For example the text C:\\\* should be written as \\code{C:\\\\\\\*}, _except_ if this text occurs within [Code](#code) (see below). Similarly, to display measurements in feet and inches (6\'10\"), write 6\\\'10\\\".

Automatic numbering is supported within inline text as well, refer to [](#autonum).

## Bold, italics, strikethrough

Text can be made **bold**, set in _italics_ font, or ~~struck through~~ using 'paired' characters around the text.

```markdown
This is **bold** style.
This is _italics_ style.
This is ~~strikethrough~~ style.
```

Note that the symbols for bold and italics are interchangeable: asterisks and underscores will both work. A single pair changes to italics font, a double pair changes to bold font. These can be used **_together_** as well, even including **_~~strikethrough~~_**.

```markdown
This is **_really_ important**.
```

## Code {#code}

Surround inline code with backticks (i.e. \\code{\\v+`code`+}) to set it in a monospaced font, and disable parsing of tags and automatic replacements within this text.

```markdown
Boolean values are either `true` or `false`.
```

For blocks of code, refer to [](#codeblocks).

## Links

External links (i.e. URLs) can be inserted using Markdown syntax. Most PDF readers will make these 'clickable', and the link text will be styled using the `link` style, which can be overridden using the `style` object in the configuration file.

For example, a link to the Google home page can be inserted as `[Google](https://www.google.com)`, which results in the following link: [Google](https://www.google.com).

Internal (document) links can be inserted as well, refer to [](#refs).

## LaTex-style tags

Alternatively, you can use LaTeX-style tags for inline styling, which enable a few more possibilities for styling parts of your text.

```markdown
This is \\bold{\\italics{really} important}.
```

The following tags are available.

- \\code{\\v+\\bold{...}+} or \\code{\\v+\\b{...}+} for \\b{bold text}.
- \\code{\\v+\\italics{...}+} or \\code{\\v+\\i{...}+} for \\i{italics}.
- \\code{\\v+\\underline{...}+} for \\underline{underlined text}.
- \\code{\\v+\\overline{...}+} for \\overline{overlined text}.
- \\code{\\v+\\linethrough{...}+} for \\linethrough{struck-out text}.
- \\code{\\v+\\code{...}+} for inline \\code{code} (different from \\code{\\v+`code`+} since the text inside this tag is still parsed for other tags or markup).
- \\code{\\v+\\color(red){...}+} for \\color(red){colored} \\color(#aa00dd){text}. Some colors are available by name, but you can also use CSS-style colors like `#0022FF`.
- \\code{\\v+\\style(name){...}+} to apply a predefined style to a part of the text, e.g. \\style(link){link style} (not a link), or \\style(h4){Heading 4}.

Options for underline, overline, and strikethrough can be specified in brackets. This includes a line 'style' (i.e. `solid`, `dashed`, `dotted`, `wavy`, or `double`) followed by an optional color.

For example, \\code{\\v+\\underline(wavy red){this}+} results in \\underline(wavy red){this}.

#### Verbatim

To include text in the output without parsing it at all (such as for the examples shown in this document), you can use the \\code{\\v|\\verbatim+...+|} tag, or the shorter \\code{\\v|\\v+...+|} version. The plus symbol can be changed to any other character, as long as it doesn't appear within the text itself.

```markdown
Use \\code{\\v+\\code{...}+} for inline \\code{code}.
               ^^^^^^^^^^^ not parsed
```

#### Document properties

To insert document (meta) properties, such as the document author or title, you can use the `\\insert(...)` tag.

In addition to predefined meta properties, you can also define your own properties on the `define` object in the [configuration file](#config). This can be useful for inserting dynamic text fields such as a customer names or project dates.

```markdown
Prepared for: \\insert(customerName)
By: \\insert(author)
```
