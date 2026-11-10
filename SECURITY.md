# Security policy

## Supported versions

| Component | Supported |
| --- | --- |
| Live site (`main` branch, GitHub Pages) | Yes |
| `@isaac070405/cell-3d` 0.1.x | Yes |
| Older commits and branches | No |

## Report a vulnerability

Use GitHub private vulnerability reporting: open the repository's **Security** tab, choose **Report a vulnerability**, and describe the issue. Do not open a public issue for a vulnerability.

Include the affected page or file, the steps to reproduce, and the impact you expect.

The maintainer aims to acknowledge a report within 7 days and to send a fix or a status update within 30 days. This is a student-run project, so these are targets and not guarantees.

## Scope

In scope:
- The site code in this repository (`js/`, `css/`, `index.html`, `scripts/`).
- The `@isaac070405/cell-3d` package and its publish workflow.

Out of scope:
- Vendored libraries in `vendor/` and `anatomy/vendor/` (Three.js, Mol*). Report these to their own projects.
- RCSB PDB, GitHub Pages and other third-party services.
- Errors in scientific data. Report these as a normal issue.

## Data handling

The site is static. It sets no cookies and stores only the language and theme choice in the browser. It loads structure files from RCSB at view time.
