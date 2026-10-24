# QELVAIRO website

A responsive, dependency-free website for QELVAIRO, with separate client-side page modules, direct URL support, a Node.js server, private enquiry storage, and a server-protected admin area. It uses native browser APIs and Node.js built-ins; there are no third-party packages to install.

## Run locally

Use Node.js 20 or later:

```sh
node server.mjs
```

Open `http://localhost:4173`. The server serves the source directly for local work. Build a production bundle with:

```sh
node build.mjs
NODE_ENV=production node server.mjs
```

On Windows PowerShell, set environment values for the current session with `$env:NAME = 'value'` before starting the server.

## Configure the private admin area

Set `QELVAIRO_ADMIN_PASSWORD` to a unique password of at least 16 characters. Admin login is disabled until this value is present. The password is read from the server environment and derived with scrypt in memory; it is not written to the website or stored as plain text. Admin sessions use an HttpOnly, SameSite=Strict cookie, and the cookie is marked Secure when `NODE_ENV=production`.

Copy `.env.example` to `.env` for local development, or use your hosting provider's secret manager in production. Never commit `.env` or expose server secrets in client code.

The admin area can:

- Review private enquiries and move them through New, In Progress, Completed, or Archived.
- Edit the public announcement, contact settings, services, prices, and portfolio concepts.

The content editor accepts JSON for collections. The server validates edits before saving. Public pages read the stored content, while enquiries and content are saved in the private data directory.

## Contact details, storage, and notifications

Set `QELVAIRO_CONTACT_EMAIL`, `QELVAIRO_CONTACT_PHONE`, `QELVAIRO_INSTAGRAM_URL`, and `QELVAIRO_LINKEDIN_URL` to seed public contact settings. They can also be managed after admin access is configured. Social links must use HTTPS.

By default, private JSON data is kept in `./data`, outside the built `dist/` site files. Set `QELVAIRO_DATA_DIR` to a persistent, private directory for deployment. Back up this directory securely. The server stores enquiries only after validating the fields; a per-connection rate limit and hidden honeypot field help reduce spam.

Optional admin notifications can be sent to a server-configured HTTPS webhook by setting `QELVAIRO_ADMIN_WEBHOOK`. The webhook URL stays on the server. Enquiries continue to be stored if the notification endpoint is unavailable.

If the enquiry API cannot be reached, the contact page only opens an email draft when a contact email is configured. It tells the visitor that QELVAIRO has not received the enquiry until they send that email. With no email configured, it reports that the enquiry was not sent or stored.

## Deployment notes

- Put the Node server behind HTTPS in production and set `NODE_ENV=production` so session cookies use the Secure flag.
- Keep `QELVAIRO_DATA_DIR` writable by the server process and outside public static hosting.
- The server includes a history fallback for public routes such as `/services`, `/work`, and `/contact`.
- Keep the Node process and its data directory protected, monitored, and backed up according to your hosting environment.
- Admin sign-in and enquiry APIs are real server-side routes; the frontend never receives the password or private enquiry store unless an authenticated session is active.

## Brand assets

The materials attached to this task contained the written brief but did not include the official QELVAIRO logo image. The site therefore uses a typographic wordmark as a temporary text treatment and does not redraw a logo. Replace that text treatment with the supplied official logo asset when it is available.

Portfolio entries are explicitly marked **Concept Project**. The artwork is built from local CSS and SVG, so it does not depend on remote stock images.
Performance improvements are being tested.
