import { defaultContent } from './data.js';
import { publicShell } from './components.js';
import { renderHome } from './pages/home.js';
import { renderServices } from './pages/services.js';
import { renderProvides } from './pages/provides.js';
import { renderWork } from './pages/work.js';
import { renderPricing } from './pages/pricing.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderAdmin, mountAdmin } from './pages/admin.js';

const pageInfo = {
  '/': { name: 'Home', title: 'QELVAIRO — We Make Brands Impossible to Ignore', description: 'Independent creative thinking for brands ready to move forward. Strategy, design, media, and advertising with intention.' },
  '/services': { name: 'Services', title: 'Creative Services — QELVAIRO', description: 'Brand identity, advertising creative, social media, digital marketing, video, web, and custom creative services.' },
  '/provides': { name: 'Provides', title: 'What You Receive — QELVAIRO', description: 'A clear, thoughtful creative partnership with agreed deliverables, timelines, and scope.' },
  '/work': { name: 'Work', title: 'Selected Concepts — QELVAIRO', description: 'Explore QELVAIRO concept projects across branding, advertising, social media, websites, and motion.' },
  '/pricing': { name: 'Pricing', title: 'Project Pricing — QELVAIRO', description: 'Explore clear INR starting points for focused creative projects, brand growth, and custom campaigns.' },
  '/about': { name: 'About', title: 'About QELVAIRO — Create What Comes Next', description: 'QELVAIRO combines design, media, storytelling, and marketing to help businesses communicate their value.' },
  '/contact': { name: 'Contact', title: 'Start a Project — QELVAIRO', description: 'Tell QELVAIRO what you are building and explore how thoughtful creative work can move your business forward.' },
  '/admin': { name: 'Admin', title: 'Admin — QELVAIRO', description: 'Private QELVAIRO website administration.' }
};

let siteContent = structuredClone(defaultContent);
try {
  const response = await fetch('/api/site-content', { headers: { Accept: 'application/json' } });
  if (response.ok) {
    const { content } = await response.json();
    siteContent = { ...siteContent, ...content, contact: { ...siteContent.contact, ...(content.contact || {}) } };
  }
} catch {}

function currentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return pageInfo[path] ? path : '/not-found';
}

function updateMetadata(path) {
  const info = pageInfo[path] || { name: 'Not found', title: 'Page not found — QELVAIRO', description: 'This page could not be found.' };
  document.title = info.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', info.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', info.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', info.description);
}

function pageMarkup(path) {
  const search = window.location.search;
  switch (path) {
    case '/': return renderHome(siteContent);
    case '/services': return renderServices(siteContent);
    case '/provides': return renderProvides();
    case '/work': return renderWork(siteContent, search);
    case '/pricing': return renderPricing(siteContent);
    case '/about': return renderAbout();
    case '/contact': return renderContact(siteContent, search);
    case '/admin': return renderAdmin();
    default: return `<section class="not-found"><span class="eyebrow"><i class="eyebrow-dot"></i>404 / PAGE NOT FOUND</span><h1>This page is not <span class="gradient-text">in the picture.</span></h1><p>The page may have moved or the link may be incomplete.</p><a class="button button-primary" href="/" data-link>Return Home <span class="icon">→</span></a></section>`;
  }
}

function revealOnScroll() {
  const elements = document.querySelectorAll('[data-reveal]:not(.is-visible)');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, current) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); current.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  elements.forEach((element) => observer.observe(element));
}

function wireNavigation() {
  document.querySelectorAll('a[data-link]').forEach((anchor) => anchor.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.target === '_blank') return;
    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    event.preventDefault();
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    history.pushState({}, '', url);
    render();
  }));
  document.querySelector('.menu-toggle')?.addEventListener('click', (event) => {
    const toggle = event.currentTarget;
    const nav = document.querySelector('#mobile-nav');
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.hidden = open;
  });
  document.querySelectorAll('.mobile-nav a').forEach((anchor) => anchor.addEventListener('click', () => {
    const toggle = document.querySelector('.menu-toggle');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  document.querySelector('.announcement-close')?.addEventListener('click', () => document.querySelector('#announcement')?.remove());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const nav = document.querySelector('#mobile-nav');
      const toggle = document.querySelector('.menu-toggle');
      if (nav && !nav.hidden) { nav.hidden = true; toggle?.setAttribute('aria-expanded', 'false'); toggle?.focus(); }
    }
  }, { once: true });
}

function wireFilters() {
  const filters = document.querySelectorAll('[data-filter]');
  if (!filters.length) return;
  filters.forEach((button) => button.addEventListener('click', () => {
    const active = button.dataset.filter;
    filters.forEach((item) => { const selected = item === button; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', String(selected)); });
    document.querySelectorAll('.project-card').forEach((card) => { card.hidden = active !== 'All Work' && card.dataset.category !== active; });
  }));
}

function wireContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"]');
    const message = document.querySelector('#form-message');
    const values = Object.fromEntries(new FormData(form).entries());
    submit.disabled = true;
    submit.innerHTML = 'Sending securely…';
    message.hidden = true;
    message.className = 'form-message';
    try {
      const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(values) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'The enquiry could not be sent right now.');
      form.reset();
      message.innerHTML = `<strong>Thank you. Your enquiry is in.</strong><span>Reference ${result.reference}. Your message has been stored securely for follow-up.</span>`;
      message.classList.add('is-success');
    } catch (error) {
      if (error instanceof TypeError && siteContent.contact?.email) {
        const subject = `Project enquiry · ${values.name}`;
        const body = [`Name: ${values.name}`, `Brand: ${values.brand || 'Not provided'}`, `Email: ${values.email}`, `Phone: ${values.phone || 'Not provided'}`, `Service: ${values.service}`, `Package: ${values.package || 'Not selected'}`, `Budget: ${values.budget || 'Not provided'}`, `Timeline: ${values.timeline || 'Not provided'}`, `Preferred contact: ${values.contactMethod}`, '', values.description].join('\n');
        window.location.href = `mailto:${encodeURIComponent(siteContent.contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        message.innerHTML = '<strong>Your email draft is ready.</strong><span>QELVAIRO has not received or stored this enquiry yet. Send the draft from your email app to complete it.</span>';
        message.classList.add('is-warning');
      } else {
        message.innerHTML = `<strong>Your enquiry was not sent.</strong><span>${escapeText(error.message)}. ${siteContent.contact?.email ? `You can also email <a href="mailto:${escapeText(siteContent.contact.email)}">${escapeText(siteContent.contact.email)}</a>.` : 'No contact email is configured, so there is no email fallback yet. Please try again later.'}</span>`;
        message.classList.add('is-error');
      }
      message.hidden = false;
    }
    if (message.classList.contains('is-success')) message.hidden = false;
    submit.disabled = false;
    submit.innerHTML = 'Send Project Enquiry <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  });
}

function escapeText(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function render() {
  const path = currentPath();
  updateMetadata(path);
  const app = document.querySelector('#app');
  app.innerHTML = publicShell(path, siteContent.announcement, pageMarkup(path), pageInfo[path]?.name || 'Not found');
  wireNavigation();
  wireFilters();
  wireContactForm();
  revealOnScroll();
  if (path === '/admin') mountAdmin();
  if (window.location.hash) requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
}

window.addEventListener('popstate', render);
render();
