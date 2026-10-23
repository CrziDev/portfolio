# portfolio

The static portfolio site. Content comes from the portfolio API, a separate project that isn't in this
repo; set its URL in `src/config.js`.

To edit, sign in at `/admin`, then use the pencil buttons on the page.

## Develop

```sh
npm install
npm run dev            # rebuilds dist/styles.css on change
npx serve -l 5500 .    # any static server; localhost uses the API at http://localhost:8001
```

Start the API locally with `go run .` or `docker compose up` in portfolio-api.

Run `npm run build` before committing, since `dist/styles.css` is committed.


