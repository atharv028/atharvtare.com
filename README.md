# portfolio-2026

Atharv Tare's portfolio. Plain HTML, CSS and JavaScript, with no build step and nothing to install.

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173.

## What's live

- **The trace** at the top uses the browser's own timing data from each visitor's page load. On localhost the network steps take under 1 ms. On a real host, visitors see real DNS, connection and download times.
- **Save my contact card** builds a `.vcf` in the browser with name, email, LinkedIn and GitHub. It has no phone number.

## Editing

There are two pages. `index.html` is the overview, and `work.html` is the full work history. Each role on the work page has an id (`#cogniai`, `#appyhigh`, `#appyhigh-intern`, `#forethought`, `#ibdtd`) that the overview links to. The career timeline at the top of `work.html` is built from each row's `data-start` / `data-end` (`YYYY-MM` or `now`), so a new role only needs a new `<li>`. Layer colours are `--l1` to `--l5` in `styles.css`. They passed a colour-blindness check for both light and dark mode.

## Deploy (GitHub Pages + Cloudflare)

The site is served from the `main` branch root at https://atharvtare.com. The `CNAME` file sets the domain, and `.nojekyll` makes Pages serve the files as-is.

`stories.txt` and `portfolio-data.json` are gitignored on purpose. They hold internal notes and must never be pushed to this public repo.

Cloudflare DNS for `atharvtare.com`:

| Type | Name | Content |
|------|------|---------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | `<github-username>.github.io` |

Keep these **DNS only** (grey cloud) until GitHub shows the certificate as issued and "Enforce HTTPS" is ticked. After that you can switch on the orange-cloud proxy, as long as Cloudflare SSL/TLS is set to **Full** (not Flexible, which causes a redirect loop).
