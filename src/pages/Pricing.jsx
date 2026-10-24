import { Link } from "react-router";
import Reveal from "../components/Reveal.jsx";
import { packages } from "../data.js";

export default function Pricing() {
  return (
    <section className="page-wrap page-section" data-scroll-scene="pricing">
      <Reveal className="page-heading"><p className="eyebrow">PRICING / INR</p><h1>A clear place <span className="gradient-text">to begin.</span></h1><p>Starting packages help frame the conversation. Final deliverables, timelines, and revision limits are confirmed in your project proposal.</p></Reveal>
      <div className="pricing-grid">
        {packages.map((plan, index) => (
          <Reveal className={"price-card" + (plan.featured ? " price-featured" : "")} delay={index * 70} key={plan.name}>
            {plan.featured && <span className="popular-tag">CREATIVE PARTNERSHIP</span>}
            <p className="eyebrow">{plan.name.toUpperCase()}</p><h2>{plan.price}</h2><p>{plan.description}</p>
            <ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link className={plan.featured ? "button" : "button button-quiet"} to={"/?package=" + encodeURIComponent(plan.name) + "#contact"}>Choose This Plan <span className="tiny-icon">↗</span></Link>
          </Reveal>
        ))}
      </div>
      <p className="fine-print">Prices are in Indian rupees (INR). Exact deliverables, timelines, and revision limits are confirmed in the project proposal. No unlimited work or revisions are implied.</p>
    </section>
  );
}
