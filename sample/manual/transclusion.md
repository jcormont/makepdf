# Transclusion

Transclusion refers to the inclusion of content from another file that is placed alongside the current file. In documents that are processed by makepdf, images and text can be transcluded in almost the same way.

## Images

While it's currently not possible to include images within paragraph text (i.e. 'inline'), it is possible to include images as a separate block-level element.

The `\\image(...)` tag can be used to refer to an image file (PNG or JPG), and transclude the image itself into the document.

```markdown
Normal text goes here.

\\image(plant.png)
```

**Positioning** -- Use [tables or columns](#tables) to position images alongside parts of your document text, or use margins and/or alignment to offset the image on the page.

**Properties** -- By default, the image is displayed using its 'natural' dimensions, or otherwise as large as possible. This can be changed by setting either the `width` property, `height` property, or both.

**Captions** -- Any text that occurs after the `image` tag itself is considered to be part of the image _caption_, displayed underneath the image.

```markdown
Normal text goes here.

\\image(plant.png) Figure \\(fig). -- A common house plant.
```

**Folders** -- To include images from other folders, simply prepend the folder name (e.g. `other/plant.png`), or use `../` to go up a folder (e.g. `../img/plant.png`). As a shortcut, you can prepend the file/folder name with a slash `/` to find files from the folder that contains the configuration file (or base folder) instead of relative to the current file.

**Multiple files** -- You can include multiple files in one go using 'glob' patterns. For example, `../img/plants/**/*.png` will insert all 'PNG' images from any folder within the 'plants' folder at the given path. Files will be sorted by name. The caption, if any, will be used for all files (i.e. it is repeated).

## Text files

Text from other files can be inserted using another type of transclusion tag. To include the full text of a file `other.md`, use the following tag:

```markdown
\\include(other.md)
```

You can also include files from other folders, and multiple files at the same time using the same patterns described above for image files.

This makes it possible to split a long document into multiple files, e.g. one per chapter, and then transclude this content into the output document.

**Dynamic content** -- Instead of the caption that's used for included images (see above), any text placed after the `\\include` tag, OR below the tag indented by at least one more space, will be passed to the file as its 'content'. Content can be inserted at any point in the file using the following tag:

```markdown
Inserted content: \\insert(content)
```

This is mostly useful for files that are _templates_, which encapsulate a piece of content with e.g. block decorations or standard text.

For example, with the following text in a file `/includes/yellownote.md`:

```markdown
\\{note}
\\{"fillColor": "#ffffee"}
> **Note:**
> \\insert(content)
```

The following text in another file will result in the note displayed below.

```markdown
\\include(/include/yellownote.md)
    This is a paragraph that is displayed within a note
    that has a light yellow background tint.
```

\\include(/include/yellownote.md)
    This is a paragraph that is displayed within a note
    that has a light yellow background tint.
    
The content text is inserted as-is (including line breaks), *unless* the `\\insert` tag exists on its own line -- in which case all of the indentation and block marker (i.e. `>`) characters before the `\\insert` tag are duplicated for all inserted lines.

## JavaScript code

As the ultimate solution for inserting any type of content into the PDF output, you can use the `\\include` tag to include the _exported value_ of a JavaScript (CommonJS) module.

The exported data must be in the form of plain objects, strings, and arrays, as understood by the `pdfmake` library.
