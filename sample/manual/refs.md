# References & TOC {#refs}

## Automatic numbering {#autonum}

Automatic numbering is supported using tags that insert a number _and_ automatically increment an internal counter. Different counters are supported, to be able to keep track of various (nested) sequences.

#### Section numbering

Regular numbers (1, 2, 3, etc.) can be inserted using the `\\().` tag, which is reserved for chapter numbering. Each section can then be numbered using `\\().().` (the final dot is mandatory, but will not be inserted -- depending on the value of `autonumSuffix` in the [Configuration file](#config)).

Alphabetic sequences (e.g. appendix numbering) can be inserted using `\\[].`. These can be mixed an matched, such that a section of an appendix chapter can be numbered using `\\[].().`.

Example:

```markdown
# \\(). Introduction
## \\().(). Definitions
Lorem ipsum...

# Appendix \\[]. \\newline Examples
**Example \\[].().**
```

Automatically generated numbers within headings are styled using the special `autonum_h1` through `autonum_h4` styles. By default, numbers within level 1 headings are made bold and much larger than the rest of the text. This can be overridden by changing the properties for these styles in the [Configuration file](#config).

#### Other sequences

Any (nested) numbering sequence can be explicitly named, by placing a name within the tag's brackets, e.g. `\\(fig).`. Nested numbering sequences are also supported, for numbering within sections (i.e. `\\().(ex).`) or sequences within named sequences (i.e. `\\(clause).[].`).

Examples:

- First `\\(ex).` is \\(ex).
- Second `\\(ex).` is \\(ex).
    - Nested `\\(ex).[].` is \\(ex).[].
    - Nested `\\(ex).[].` is \\(ex).[]. with further sequences of `\\(ex).[].().` as \\(ex).[].()., \\(ex).[].()., \\(ex).[].().
    - A nested named sequence starts at 1 again, e.g. `\\(ex).[].(sub).`: \\(ex).[].(sub)., \\(ex).[].(sub)., \\(ex).[].(sub).
- Alpha `\\[ex].` is independent of numeric: \\[ex].
- Second `\\[ex].` is \\[ex].

## Cross-references

To be able to add cross-references within the document, first the relevant target sections need to be marked.

#### Heading markers

Headings (both with and without numbers) can be marked by adding a tag at the end of the heading line, as follows.

```markdown
## \\().(). Sample heading {#foo}
```

This heading can then be referenced using a Markdown-style link. Most PDF readers will make the link 'clickable', and also when printed the link can be made to look different (since links are styles using the `doclink` style; different from the `link` style which is applied to 'external' links). Example:

```markdown
Refer to [Sample](#foo) for details.
```

An advantage of marking the entire heading is that the heading text can be used dynamically as the text of the reference. Leave out all text from the link to insert the heading title automatically.

```markdown
Refer to section [](#foo) for details.
```

If the section number is e.g. 2.1, the above text will read "Refer to section 2.1 Sample heading for details".

#### Auto-number markers

To insert cross-references to _other_ parts of the document (i.e. targets that are not headings), you'll need to use automatic numbering. This ensures that references still make sense even if the document is printed.

Markers can be added to automatically numbered text, by adding the tag directly after the numbering tag. Example:

```markdown
\\{caption}
**Table \\(tbl).{#resultsTable}** -- Final results
```

\\{caption}
**Table \\(tbl).{#resultsTable}** -- Final results

The marker can then be referenced in the same way as headings, however in this case leaving out the heading text only inserts the number itself, not all of the surrounding text.

```markdown
Refer to table [](#resultsTable) for the final results.
```

Refer to table [](#resultsTable) for the final results.

## Table of contents

A Table of Contents (TOC) can be inserted automatically, as a list of cross-references with heading titles and page numbers.

To insert a TOC, simply use the `\\toc` tag, on a separate line.

**Heading levels** -- The maximum level for headings to appear in the TOC can be configured in the [Configuration file](#config).

**TOC table style** -- The TOC itself is styled using the `toc` style, which can be overridden. For example, you could change the overall font size, outer margin, or column widths.

**TOC entry styles** -- Each heading level is styled independently, which is what makes it possible to show the TOC as a hierarchy instead of a single list. Override the `toc1` through `toc4` styles to change the appearance of headings for each level within the TOC (e.g. font, style, or margin).