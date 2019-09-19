# Tables & Columns {#tables}

Two methods for generating tables are supported by makepdf. The first is based on the syntax used by most Markdown parsers, while the second is based on list syntax, which is better suited for tables with large amounts of text. This method can also be used to create 'columns', which are a lot like tables with a single row and different padding styles.

### Markdown syntax

Tables are created using pipe characters `|` around cells (the first and last ones are optional), and a 'separator' line between the table heading and other rows. The separator line consists of three or more dashes for each cell, separated by pipe characters.

Consider the following Markdown source text:

```markdown
| One | Two | Three |
| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |
```

This becomes a table with a heading row and two rows, and three columns.

| One | Two | Three |
| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |

**Literal pipe characters** -- To include literal pipe characters within your table, prefix them with a backslash character, i.e. `\|`.

**Column alignment** -- To align all cells in a table column to the left (default), right, or center, add colon characters on the left side, right side, or both sides of the separator dashes respectively.

```markdown
| Right | Center | Left |
| ----: | :----: | :--- |
| X     | Y      | Z    |
| 1     | 2      | 3    |
```

| Right | Center | Left |
| ----: | :----: | :--- |
| X     | Y      | Z    |
| 1     | 2      | 3    |

**Column width** -- Normally, each column takes up as little or as much space as it needs to fit its contents. The table doesn't necessarily take up the full width of the page. Markdown doesn't provide a way to set column widths, but the [block properties tag](#blockprops) (or block style tag) can be used to specify widths explicitly as an array. The width of each column should be specified in the following manner:

- A number, which specifies the width in points (1/72\").
- `auto` -- makes the column take up as much space as needed, within as little space as available.
- `*` -- which makes the column take up as much space as available.

Example:

```markdown
\\{"widths": [50,"*"]}
|Amount|Description|
|---:|---|
|$128|Lorem ipsum dolor sit amet|
|$1,000|Adipiscit|
```

\\{"widths": [50,"*"]}
|Amount|Description|
|---:|---|
|$128|Lorem ipsum dolor sit amet|
|$1,000|Adipiscit|

**No heading row** -- To insert a table without a heading row, simply start the table with a separator line:

```markdown
| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |
```

| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |

**Decorations** -- The `layout` block property can be used to specify a specific combination of line widths, line colors, and padding.

The following predefined (named) table layouts are available:

- `default` -- as illustrated above, horizontal lines only.
- `noBorders` -- no borders at all, no padding.
- `allBorders` -- all borders (thin), regular padding.

(Note that the header row background and font are defined using the `tableHeader` style, and are not affected by the table 'layout').

```markdown
\\{"layout": "noBorders"}
| One | Two | Three |
| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |
```

\\{"layout": "noBorders"}
| One | Two | Three |
| --- | --- | ----- |
| X   | Y   | Z     |
| 1   | 2   | 3     |

**Note:** You can also use a [block style tag](#blockstyle) to set layout, widths, and other properties in one go, if you add a custom style definition to the configuration file.

By default, the `defs` (definitions table) style can be used to create tables with a narrow first column and a full-width second column -- which is useful for tables that describe a set of terms:

\\{defs}
Element | Description
--- | ---
Input field | Enter a number between 1-100.
**OK** button | Click here to approve the transaction.
**Cancel** button | Click here to close the dialog and cancel the transaction.

### List syntax

Alternatively, you can turn a nested list into a table using a block property tag. Set the `table` property to `true`, or to a specific table layout name to turn list items into rows and nested list items into cells.

By default, the first list item becomes the table's heading row. If you do not want the table to include a heading row, set the `headerRows` property to zero.

This is especially useful if your table contains a lot of text, or nested (styled) blocks, as in the example below.

```markdown
\\{"table": "noBorders", "widths": ["*", 50], "headerRows": 0}
- - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Suspendisse elementum tellus dui, ac pretium nisl sodales in.

    Aliquam non est ut libero dapibus sagittis vitae quis dolor.
  - 00:05
- - Ut id est et enim laoreet condimentum in blandit tortor.
    Suspendisse nec nulla at elit lobortis blandit id in justo.
    Sed tempus dui ut mauris euismod dapibus.
    Morbi quis convallis mauris.
  - 01:10
- - Vestibulum ante ipsum primis in faucibus orci luctus et
    ultrices posuere cubilia Curae;
    Pellentesque habitant morbi tristique senectus et netus et
    malesuada fames ac turpis egestas.

    Habitant morbi tristique senectus et netus et malesuada
    fames ac turpis egestas.
  - 02:25
```

\\{"table": "noBorders", "widths": ["*", 50], "headerRows": 0}
- - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    Suspendisse elementum tellus dui, ac pretium nisl sodales in.

    Aliquam non est ut libero dapibus sagittis vitae quis dolor.
  - 00:05
- - Ut id est et enim laoreet condimentum in blandit tortor.
    Suspendisse nec nulla at elit lobortis blandit id in justo.
    Sed tempus dui ut mauris euismod dapibus.
    Morbi quis convallis mauris.
  - 01:10
- - Vestibulum ante ipsum primis in faucibus orci luctus et
    ultrices posuere cubilia Curae;
    Pellentesque habitant morbi tristique senectus et netus et
    malesuada fames ac turpis egestas.

    Habitant morbi tristique senectus et netus et malesuada
    fames ac turpis egestas.
  - 02:25

Note that nested list items can be formatted as above with two bullets on a single line, or with items on a separate line (see below). Any content before the nested list is ignored -- however, list items cannot be completely blank (after the `-` or `*` symbol), so it's a good idea to add a single character to indicate new rows.

Named styles that include a `table` property have the same effect, such as the built-in `defs` style.

```markdown
\\{defs}
- |
  - Element
  - Description
- |
  - Input field
  - Enter a number between 1-100.
- |
  - **OK** button
  - Click here to approve the transaction.
- |
  - **Cancel** button
  - Click here to close the dialog and cancel the transaction.
```

\\{defs}
- |
  - Element
  - Description
- |
  - Input field
  - Enter a number between 1-100.
- |
  - **OK** button
  - Click here to approve the transaction.
- |
  - **Cancel** button
  - Click here to close the dialog and cancel the transaction.

### Columns

A list with two or more items can also be converted into blocks that are placed next to each other on the horizontal axis, using the `columns` property.

Set this property to `true` to enable column mode. By default, all columns are equally sized.

```markdown
\\{"columns": true}
- Left
- Middle
- Right
```

\\{"columns": true}
- Left
- Middle
- Right

To change column padding and sizing, add optional `columnGap` and/or `widths` properties. If `columnGap` is specified, the `column` property is no longer needed.

```markdown
\\{"columnGap": 6, "widths": ["auto", "*"]}
- **Note**
- Nullam vitae urna metus. Vivamus quis justo eros. Nullam auctor purus at tincidunt bibendum. Praesent non blandit arcu, eget lacinia metus.
```

\\{"columnGap": 6, "widths": ["auto", "*"]}
- **Note**
- Nullam vitae urna metus. Vivamus quis justo eros. Nullam auctor purus at tincidunt bibendum. Praesent non blandit arcu, eget lacinia metus.

Tables and columns can be nested inside of other block-level elements, and the other way around, as illustrated by the following example.

```markdown
\\{note}
> \\{"columnGap": 6, "widths": ["auto"], "margin": [0, 0]}
> - **Note**
> - Nullam vitae urna metus. Vivamus quis justo eros.
>   Nullam auctor purus at tincidunt bibendum.
>   \\{small right nomargin}
>   Aliquam non est ut libero dapibus sagittis vitae quis dolor.
```

\\{note}
> \\{"columnGap": 6, "widths": ["auto"], "margin": [0, 0]}
> - **Note**
> - Nullam vitae urna metus. Vivamus quis justo eros.
>   Nullam auctor purus at tincidunt bibendum.
>   \\{small right nomargin}
>   Aliquam non est ut libero dapibus sagittis vitae quis dolor.
