import { Link } from "react-router";
import Reveal from "./Reveal.jsx";

export default function ProjectGrid({ projects }) {
  return (
    <div className="project-grid project-grid-work">
      {projects.map((project, index) => (
        <Reveal className="project-card" delay={index * 70} key={project.title}>
          <div className={"project-art " + project.palette}>
            <span className="concept-label">Concept Project</span>
            <span className="project-art-title">{project.title}</span>
            <span className="project-art-orbit" aria-hidden="true" />
          </div>
          <div className="project-meta">
            <div><span className="project-category">{project.category}</span><h3>{project.title}</h3></div>
            <Link className="icon-link" to={"/?project=" + encodeURIComponent(project.title) + "#contact"} aria-label={"Ask about the " + project.title + " concept"}>
              <span className="tiny-icon" aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="project-description">{project.description}</p>
        </Reveal>
      ))}
    </div>
  );
}
