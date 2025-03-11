<!-- Logo block (could also use a logo image) -->

\\{ "fontSize": 24, "alignment": "right" }

> **ACME** _Corp._

<!-- Title block -->

\\{ "relativePosition": { "y": 140 } }

> \\{ "font": "Headings Light", "fontSize": 28, "margin": [0, 0] }
> \\insert(title)
>
> \\{ "font": "Headings Bold", "fontSize": 18 }
> \\insert(subject)

<!-- Info block -->

\\{ "relativePosition": { "y": 360 } }

> \\include(/date.js)
>
> **Prepared for**\
> \\insert(customer)
>
> **By**\
> ACME Corp.
> \\insert(author)
