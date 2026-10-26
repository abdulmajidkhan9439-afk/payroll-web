# Payroll Management System

Single-page payroll app (`index.html`) hosted on Netlify. Data syncs to a Neon PostgreSQL database through Netlify Functions.

## Deploy setup

1. **Database:** run `netlify/schema.sql` once in the Neon SQL editor.
2. **Create users:** generate a bcrypt hash locally and insert the user. The command is in the comment in `schema.sql`.
3. **Set `AUTH_SECRET`:** in Netlify → Site configuration → Environment variables, add `AUTH_SECRET` with a random value of at least 32 characters. For example:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
   Without it, login and cloud sync return HTTP 500 (fail closed).
4. Deploy.

## Security model

- `login` checks the bcrypt password and returns a signed token, valid for 8 hours.
- `state-get` and `state-save` require that token (`Authorization: Bearer ...`). Requests without a valid token get HTTP 401.
- A user with a `unit_id` can only read and write their own unit. An admin without a `unit_id` can choose the unit.
- Offline mode (when the API can't be reached) only uses data already stored in that browser.
