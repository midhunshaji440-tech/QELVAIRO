import { useLocation } from "react-router";
import Reveal from "../components/Reveal.jsx";
import { services } from "../data.js";
import Services from "./Services.jsx";
import Provides from "./Provides.jsx";
import Work from "./Work.jsx";
import Pricing from "./Pricing.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";

const capabilities = ["Brand Strategy", "Creative Design", "Digital Marketing", "Social Media", "Campaign Production"];
const steps = ["Discover", "Strategize", "Create", "Launch", "Optimize"];

export default function OnePage() {
  const location = useLocation();

  return (
    <>
      <section className="opening-sequence logo-opening" id="home" data-scroll-scene="origin" aria-label="QELVAIRO">
        <img className="opening-logo" src="/qelvairo-mark.png" alt="QELVAIRO Q logo" />
      </section>

      <section className="capabilities-intro page-wrap" id="capabilities" data-scroll-scene="capabilities">
        <Reveal className="opening-scroll-hint scroll-copy"><span className="scroll-line" /> Scroll to explore</Reveal>
        <div className="capability-strip" aria-label="Agency capabilities">
          {capabilities.map((item, index) => (
            <Reveal as="span" className="capability-word scroll-copy" delay={index * 75} key={item}>
              {item}{index < capabilities.length - 1 && <i aria-hidden="true">✳</i>}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section page-wrap" data-scroll-scene="services-intro">
        <Reveal className="section-intro scroll-copy">
          <p className="eyebrow">WHAT WE DO</p>
          <h2>Creative built around <span className="muted">your next move.</span></h2>
          <p>From the first spark to launch day, bring the right creative thinking together for your business.</p>
        </Reveal>
        <div className="service-preview-grid">
          {services.slice(0, 4).map((service, index) => (
            <Reveal className={"service-card tone-" + service.color} delay={index * 65} key={service.title}>
              <span className="service-index">0{index + 1}</span><span className="service-glyph" aria-hidden="true">✳</span>
              <h3>{service.title}</h3><p>{service.description}</p>
              <a className="text-link" href="#services">Explore service <span className="tiny-icon">↗</span></a>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="single-page-anchor" id="services"><Services /></div>
      <div className="single-page-anchor" id="provides"><Provides /></div>
      <div className="single-page-anchor" id="work"><Work /></div>

      <section className="section page-wrap" data-scroll-scene="process">
        <Reveal className="section-intro"><p className="eyebrow">A CLEAR PROCESS</p><h2>Thoughtful from first brief to final launch.</h2></Reveal>
        <div className="process-row" data-scroll-progress>
          {steps.map((step, index) => <Reveal className="process-step" delay={index * 60} key={step}><span>0{index + 1}</span><h3>{step}</h3>{index < steps.length - 1 && <i aria-hidden="true">→</i>}</Reveal>)}
        </div>
      </section>

      <div className="single-page-anchor" id="pricing"><Pricing /></div>
      <div className="single-page-anchor" id="about"><About /></div>

      <section className="closing-cta page-wrap" data-scroll-scene="final-call">
        <Reveal className="cta-panel">
          <p className="eyebrow">THE NEXT CHAPTER STARTS HERE</p>
          <h2>Your Next Big Idea Deserves a <span className="gradient-text">Bigger Stage.</span></h2>
          <a className="button" href="#contact">Let’s Build Something Great <span className="tiny-icon">↗</span></a>
        </Reveal>
      </section>

      <div className="single-page-anchor" id="contact"><Contact key={location.search} /></div>
    </>
  );
}
