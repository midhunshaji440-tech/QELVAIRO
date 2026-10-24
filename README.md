# QELVAIRO website starter

This is a React and Vite front-end starter based on the supplied QELVAIRO design brief.

## Folder structure

qelvairo-website/
  index.html
  package.json
  vite.config.js
  .env.example
  .gitignore
  public/
    qelvairo-logo.jpeg
  src/
    main.jsx
    App.jsx
    data.js
    styles.css
    components/
      Reveal.jsx
      SiteChrome.jsx
      ProjectGrid.jsx
    pages/
      Home.jsx
      Services.jsx
      Provides.jsx
      Work.jsx
      Pricing.jsx
      About.jsx
      Contact.jsx
      Admin.jsx

## Run locally

1. Copy this folder into your project location.
2. Put the supplied logo at public/qelvairo-logo.jpeg.
3. Open a terminal in this folder and run npm install, then npm run dev.
4. Set a real VITE_CONTACT_EMAIL in a local .env file for the email-based contact fallback.

## Important setup limits

- The contact form uses a clearly disclosed mailto fallback. The website does not save enquiries or send server notifications.
- The /admin page is a setup notice, not an authenticated dashboard. Do not put private enquiry data behind a front-end-only page. Add server-side authentication, authorization, and a database before enabling admin features.
- VITE_ values are included in browser code. Use them only for public contact settings, never secrets.
- Portfolio entries are explicitly marked as concept projects. Replace them with real work when available.
