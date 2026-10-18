/*
 * Where the portfolio API runs. On localhost the pages talk to a local API
 * (`go run .` or `docker compose up` in portfolio-api); everywhere else, to the deployed one.
 */
const API_URL =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:8080'
    : 'https://api.example.com'; // TODO: your VPS API's URL, no trailing slash

// Where /admin keeps the sign-in token for main.js to pick up.
const TOKEN_KEY = 'portfolio-admin-token';
