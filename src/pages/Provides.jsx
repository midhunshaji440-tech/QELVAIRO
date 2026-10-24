import Reveal from "../components/Reveal.jsx";

const deliverables = [
  "Custom creative solutions shaped around the agreed brief",
  "Clear communication and timelines agreed in advance",
  "Brand-consistent assets prepared for the intended channels",
  "Revision scope confirmed for each project before work begins",
  "Campaign-ready creative and handover notes where applicable",
  "Marketing performance reports when included in the selected service",
];
const options = [
  ["Creative Essentials", "Individual creative assets and smaller, clearly scoped projects."],
  ["Brand Growth", "Ongoing creative and marketing support with an agreed rhythm."],
  ["Full Campaign Partnership", "Coordinated production, campaign assets, and agreed reporting."],
];

export default function Provides() {
  return (
    <section className="page-wrap page-section" data-scroll-scene="provides">
      <Reveal className="page-heading"><p className="eyebrow">WHAT YOU RECEIVE</p><h1>Thoughtful work. <span className="gradient-text">Clear expectations.</span></h1><p>Every engagement starts with a shared understanding of scope, timing, and what success means for your project.</p></Reveal>
      <div className="provides-layout">
        <Reveal className="card provides-note"><p className="eyebrow">BUILT AROUND YOUR BRIEF</p><h2>Good collaboration starts with clarity.</h2><p>Before work begins, we confirm deliverables, project timelines, revision policies, and any reporting included in the selected service.</p></Reveal>
        <div className="check-list">
          {deliverables.map((item, index) => <Reveal className="check-row" delay={index * 45} key={item}><span className="check-mark" aria-hidden="true">✓</span><p>{item}</p></Reveal>)}
        </div>
      </div>
      <Reveal className="section-intro section-intro-spaced"><p className="eyebrow">WAYS TO WORK TOGETHER</p><h2>Choose a starting point.</h2></Reveal>
      <div className="three-grid">
        {options.map(([title, body], index) => <Reveal className="card engagement-card" delay={index * 70} key={title}><span className="service-index">0{index + 1}</span><h3>{title}</h3><p>{body}</p><a className="text-link" href="#contact">Talk through your project <span className="tiny-icon">↗</span></a></Reveal>)}
      </div>
      <p className="fine-print">Campaign outcomes depend on the brief, audience, budget, creative, and market conditions. We do not guarantee sales, virality, or advertising results.</p>
    </section>
  );
}
