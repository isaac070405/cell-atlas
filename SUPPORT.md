# Getting help

Cell Atlas is a small student-run project, so replies can take a few days.

## Where to go

| Need | Go to |
| --- | --- |
| Site does not load, a control fails, a 3D view looks wrong | [Bug report](https://github.com/isaac070405/cell-atlas/issues/new?template=bug_report.yml) |
| A number, unit, source or translation looks wrong | [Data or citation error](https://github.com/isaac070405/cell-atlas/issues/new?template=data_error.yml) |
| An idea for a new cell, structure or view | [Feature or data request](https://github.com/isaac070405/cell-atlas/issues/new?template=feature_request.yml) |
| A security vulnerability | Private report described in `SECURITY.md` |
| Conduct concern | Reporting steps in `CODE_OF_CONDUCT.md` |
| Accessibility barrier | Feedback steps in `ACCESSIBILITY.md` |
| Contributing code or data | `CONTRIBUTING.md` |

## Before you ask

- Run the site locally with `python3 -m http.server 8000`. Opening `index.html` from disk does not load the JSON data.
- Read the README for deep links such as `?cell=hepatocyte`, `?pdb=5XTD` and `?view=compare`.
- Check the source chip on a number. It names the paper, species and method behind it.
- Structure files load from RCSB at view time, so a blocked network or an RCSB outage stops Module B.

## What to include

- The page URL with its query string.
- Browser and device, for example Safari 18 on iPhone 15.
- Theme and language mode.
- A screenshot or a console error.

## Scope

This project does not give medical, dietary or study advice. Models are schematic, and values come from the cited papers, so check the source before relying on a number.
