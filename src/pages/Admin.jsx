import Reveal from "../components/Reveal.jsx";

export default function Admin() {
  return (
    <section className="page-wrap page-section">
      <Reveal className="admin-notice">
        <p className="eyebrow">ADMIN / SETUP REQUIRED</p>
        <h1>Secure admin is <span className="gradient-text">not configured.</span></h1>
        <p>This starter does not include a login, database, or protected admin API. The page is intentionally a setup notice; it does not pretend to secure private information.</p>
        <div className="admin-checklist">
          <p><span>01</span> Configure server-side authentication and sessions.</p>
          <p><span>02</span> Add authorization checks to every admin API.</p>
          <p><span>03</span> Connect a database for enquiries, projects, and pricing.</p>
          <p><span>04</span> Keep passwords and secret keys on the server only.</p>
        </div>
      </Reveal>
    </section>
  );
}
