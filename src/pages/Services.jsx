import { Link } from "react-router";
import Reveal from "../components/Reveal.jsx";
import { services } from "../data.js";

export default function Services() {
  return (
    <section className="page-wrap page-section" data-scroll-scene="services">
      <Reveal className="page-heading"><p className="eyebrow">SERVICES / CREATIVE PARTNERSHIP</p><h1>Make the right <span className="gradient-text">things happen.</span></h1><p>Choose one focused service or bring several together into a campaign shaped around your goals.</p></Reveal>
      <div className="service-list">
        {services.map((service, index) => (
          <Reveal className={"service-detail tone-" + service.color} delay={index * 35} key={service.title}>
            <div className="service-detail-heading"><span className="service-index">0{index + 1}</span><h2>{service.title}</h2></div>
            <p>{service.description}</p><ul>{service.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
            <Link className="text-link" to={"/?service=" + encodeURIComponent(service.title) + "#contact"}>Discuss this service <span className="tiny-icon">↗</span></Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
