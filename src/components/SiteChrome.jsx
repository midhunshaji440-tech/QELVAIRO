import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { announcementEnabled, announcementText } from "../data.js";
import ScrollExperience from "./ScrollExperience.jsx";

const navItems = [
  ["Home", "#home"], ["Services", "#services"], ["Provides", "#provides"],
  ["Work", "#work"], ["Pricing", "#pricing"], ["About", "#about"], ["Contact", "#contact"],
];

function ScrollFlow() {
  const location = useLocation();
  useEffect(() => {
    let frame = 0;
    let previousY = window.scrollY;
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const viewport = window.innerHeight;
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = y / max;
        const root = document.documentElement;
        root.style.setProperty("--flow-y", (-y * 0.07) + "px");
        root.style.setProperty("--flow-turn", progress * 28 + "deg");
        root.style.setProperty("--page-progress", progress);
        root.dataset.scrollDirection = y >= previousY ? "down" : "up";
        previousY = y;
        document.querySelector(".site-header")?.classList.toggle("is-scrolled", y > 20);

        const opening = document.querySelector(".opening-sequence");
        if (opening) {
          const openingRect = opening.getBoundingClientRect();
          const openingProgress = clamp((viewport - openingRect.bottom) / Math.max(1, openingRect.height));
          root.style.setProperty("--opening-progress", openingProgress.toFixed(3));
        } else {
          root.style.setProperty("--opening-progress", "1");
        }

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.querySelectorAll("[data-scroll-scene]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const focus = reducedMotion ? 0 : clamp(1 - Math.abs(center - viewport * 0.5) / (viewport * 1.05));
          element.style.setProperty("--scene-focus", focus.toFixed(3));
          element.style.setProperty("--scene-glow", (focus * 0.28).toFixed(3));
          element.classList.toggle("scene-active", focus > 0.45);
        });

        document.querySelectorAll("[data-scroll-focus]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const focus = reducedMotion ? 0 : clamp(1 - Math.abs(center - viewport * 0.5) / (viewport * 0.82));
          const isProject = element.classList.contains("project-card");
          const minScale = reducedMotion ? 1 : isProject ? 0.92 : 0.96;
          const maxScale = reducedMotion ? 1 : isProject ? 1.08 : 1.055;
          element.style.setProperty("--scroll-focus", focus.toFixed(3));
          element.style.setProperty("--scroll-scale", (minScale + (maxScale - minScale) * focus).toFixed(3));
          element.style.setProperty("--scroll-lift", ((1 - focus) * 10).toFixed(1) + "px");
          element.style.setProperty("--scroll-glow-alpha", (0.025 + focus * 0.17).toFixed(3));
          element.style.setProperty("--scroll-border-alpha", (0.12 + focus * 0.38).toFixed(3));
          element.style.setProperty("--scroll-glow-opacity", (0.17 + focus * 0.3).toFixed(3));
          element.classList.toggle("scroll-focused", focus > 0.58);
        });

        document.querySelectorAll("[data-scroll-parallax]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const offset = reducedMotion ? 0 : clamp((viewport * 0.5 - (rect.top + rect.height * 0.5)) * 0.045, -28, 28);
          element.style.setProperty("--scroll-parallax", offset.toFixed(1) + "px");
        });

        document.querySelectorAll("[data-scroll-progress]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const fill = reducedMotion ? 0 : clamp((viewport * 0.78 - rect.top) / (rect.height + viewport * 0.55));
          element.style.setProperty("--scroll-fill", fill.toFixed(3));
        });

      });
    };
    const observer = new MutationObserver(update);
    const shell = document.querySelector(".site-shell");
    if (shell) observer.observe(shell, { childList: true, subtree: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.hash]);
  return null;
}

export default function SiteChrome({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const email = import.meta.env.VITE_CONTACT_EMAIL || "";
  const sectionHref = (target) => location.pathname === "/" ? target : "/" + target;

  useEffect(() => {
    setMenuOpen(false);
    if (location.hash) {
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth" }));
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="site-shell" id="top">
      <ScrollFlow />
      <div className="scroll-progress" aria-hidden="true" />
      <ScrollExperience />
      {announcementEnabled && <div className="announcement">{announcementText}</div>}
      <header className="site-header">
        <a className="brand-logo" href={sectionHref("#home")} aria-label="QELVAIRO home">
          <img src="/qelvairo-mark.png" alt="QELVAIRO Q emblem" />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span />
        </button>
        <nav className={"navigation" + (menuOpen ? " navigation-open" : "")} id="primary-navigation" aria-label="Main navigation">
          {navItems.map(([label, target]) => (
            <a
              key={target}
              href={sectionHref(target)}
              className={"nav-link" + ((location.hash || "#home") === target ? " nav-link-active" : "")}
              onClick={() => setMenuOpen(false)}
            >{label}</a>
          ))}
          <a className="button button-small nav-cta-mobile" href={sectionHref("#contact")} onClick={() => setMenuOpen(false)}>Start a Project <span className="tiny-icon" aria-hidden="true">↗</span></a>
        </nav>
        <a className="button button-small nav-cta" href={sectionHref("#contact")}>Start a Project <span className="tiny-icon" aria-hidden="true">↗</span></a>
      </header>

      <main className="page-transition" key={location.pathname}>{children}</main>

      <footer className="site-footer" data-scroll-scene="finale">
        <div className="footer-main">
          <div className="footer-brand-block">
            <img src="/qelvairo-mark.png" alt="QELVAIRO Q emblem" loading="lazy" />
            <p className="footer-tagline">Create What Comes Next.</p>
            <p className="footer-description">Independent creative, media, and advertising for brands ready to move forward.</p>
          </div>
          <div className="footer-column">
            <h2 className="footer-heading">Explore</h2>
            <a href={sectionHref("#services")}>Services</a><a href={sectionHref("#provides")}>What We Provide</a>
            <a href={sectionHref("#work")}>Work</a><a href={sectionHref("#pricing")}>Pricing</a><a href={sectionHref("#about")}>About</a>
          </div>
          <div className="footer-column">
            <h2 className="footer-heading">Start here</h2>
            <a href={sectionHref("#contact")}>Contact</a><Link to="/admin">Admin setup</Link>
            {email ? <a href={"mailto:" + email}>{email}</a> : <span className="footer-muted">Add a public contact email in .env</span>}
          </div>
          <div className="footer-cta">
            <p className="eyebrow">HAVE A GOOD IDEA?</p>
            <h2>Let’s make it matter.</h2>
            <a className="button" href={sectionHref("#contact")}>Start a Project <span className="tiny-icon" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 QELVAIRO. All rights reserved.</span>
          <span>Designed with creativity by Midhun Krishna P.</span>
        </div>
      </footer>
    </div>
  );
}
