import Reveal from "../components/Reveal.jsx";

const values = ["Creativity with intention", "Clear communication", "Strategic thinking", "Attention to detail", "Consistent execution", "Continuous improvement"];

export default function About() {
  return (
    <section className="page-wrap page-section" data-scroll-scene="about">
      <Reveal className="page-heading"><p className="eyebrow">ABOUT QELVAIRO</p><h1>Creativity With a Purpose. <span className="gradient-text">Advertising With a Point of View.</span></h1><p>We bring design, media, storytelling, and marketing together to help businesses communicate their value more clearly.</p></Reveal>
      <div className="about-grid">
        <Reveal className="card about-philosophy"><p className="eyebrow">OUR PHILOSOPHY</p><h2>“Create What Comes Next.”</h2><p>We believe the best creative work helps a business take its next step with clarity and confidence.</p></Reveal>
        <div className="value-grid">{values.map((value, index) => <Reveal className="value-item" delay={index * 40} key={value}><span>0{index + 1}</span><p>{value}</p></Reveal>)}</div>
      </div>
      <Reveal className="founder-card"><div className="founder-monogram" aria-hidden="true">MK</div><div><p className="eyebrow">FOUNDER</p><h2>Midhun Krishna P</h2><p>Founder, QELVAIRO</p></div></Reveal>
    </section>
  );
}
