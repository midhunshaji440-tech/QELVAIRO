import { useState } from "react";
import ProjectGrid from "../components/ProjectGrid.jsx";
import Reveal from "../components/Reveal.jsx";
import { categories, projects } from "../data.js";

export default function Work() {
  const [active, setActive] = useState("All Work");
  const filtered = active === "All Work" ? projects : projects.filter((project) => project.category === active);
  return (
    <section className="page-wrap page-section" data-scroll-scene="work">
      <Reveal className="page-heading"><p className="eyebrow">FEATURED WORK / CONCEPT PORTFOLIO</p><h1>Good ideas, <span className="gradient-text">made visible.</span></h1><p>A selection of creative directions built to show the range of stories a brand can tell.</p></Reveal>
      <div className="filter-row" aria-label="Filter projects">
        {categories.map((category) => <button className={"filter-button" + (active === category ? " filter-active" : "")} key={category} type="button" aria-pressed={active === category} onClick={() => setActive(category)}>{category}</button>)}
      </div>
      <ProjectGrid projects={filtered} />
      <p className="fine-print">These portfolio examples are concept projects, not completed client engagements.</p>
      <div className="inline-cta"><p>Have a project in mind?</p><a className="text-link" href="#contact">Let’s talk <span className="tiny-icon">↗</span></a></div>
    </section>
  );
}
