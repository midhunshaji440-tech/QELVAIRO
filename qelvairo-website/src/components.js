import { button, escapeHtml, icon } from './ui.js';

const links = [
  ['Home', '/'], ['Services', '/services'], ['Provides', '/provides'], ['Work', '/work'], ['Pricing', '/pricing'], ['About', '/about']
];

export function header(path, announcement = '') {
  return `${announcement ? `<div class="announcement" id="announcement"><span class="announce-pulse"></span><span>${escapeHtml(announcement)}</span><button class="announcement-close" type="button" aria-label="Dismiss announcement">${icon('close')}</button></div>` : ''}<header class="site-header"><div class="nav-wrap"><a class="wordmark" href="/" data-link aria-label="QELVAIRO home"><span>QELVAIRO</span><small>CREATE WHAT COMES NEXT</small></a><nav class="desktop-nav" aria-label="Main navigation">${links.map(([name, href]) => `<a class="nav-link ${path === href ? 'is-active' : ''}" href="${href}" data-link>${name}</a>`).join('')}</nav><div class="nav-actions">${button('/contact', 'Start a Project', 'small') }<button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">${icon('menu')}</button></div></div><div class="mobile-nav" id="mobile-nav" hidden><nav aria-label="Mobile navigation">${[...links, ['Contact', '/contact']].map(([name, href]) => `<a class="mobile-link ${path === href ? 'is-active' : ''}" href="${href}" data-link>${name}${icon('arrow')}</a>`).join('')}</nav><p>Creative · Media · Advertising</p></div></header>`;
}

export function footer(content) {
  const contact = content.contact || {};
  const hasContact = contact.email || contact.phone;
  const socialLinks = [['Instagram', contact.instagram], ['LinkedIn', contact.linkedin]].filter(([, url]) => url);
  return `<footer class="site-footer"><div class="footer-glow"></div><div class="footer-main"><div class="footer-brand"><a class="wordmark wordmark-footer" href="/" data-link><span>QELVAIRO</span><small>CREATE WHAT COMES NEXT</small></a><p>Independent creative thinking for brands ready to move forward. Strategy, design, media, and advertising with intention.</p><div class="footer-social">${socialLinks.length ? socialLinks.map(([label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}${icon('arrow')}</a>`).join('') : '<span class="muted-note">Social links coming soon</span>'}</div></div><div class="footer-col"><h3>Explore</h3>${links.map(([label, href]) => `<a href="${href}" data-link>${label}</a>`).join('')}<a href="/contact" data-link>Contact</a></div><div class="footer-col"><h3>What We Do</h3>${(content.services || []).slice(0, 5).map((service) => `<a href="/contact?service=${encodeURIComponent(service.name)}" data-link>${escapeHtml(service.name)}</a>`).join('')}</div><div class="footer-contact"><h3>Start a conversation</h3><p>${hasContact ? 'Tell us where you want to take your brand.' : 'Contact details will appear here once configured.'}</p>${contact.email ? `<a class="footer-contact-link" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}${contact.phone ? `<a class="footer-contact-link" href="tel:${escapeHtml(contact.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(contact.phone)}</a>` : ''}${button('/contact', 'Start a Project', 'outline')}</div></div><div class="footer-bottom"><span>© 2026 QELVAIRO. All rights reserved.</span><span>Designed with creativity by Midhun Krishna P.</span></div></footer>`;
}

export function publicShell(path, announcement, content, page, pageName) {
  return `${header(path, announcement)}<main id="main-content" data-page="${escapeHtml(pageName)}">${page}</main>${footer(content)}`;
}
