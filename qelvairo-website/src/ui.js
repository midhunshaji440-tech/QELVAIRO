export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export const icons = {
  spark: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  social: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/>',
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h3m-3 3h7"/>',
  pen: '<path d="m4 20 4.2-1 10.6-10.6a2.2 2.2 0 0 0-3.1-3.1L5.1 16 4 20Z"/><path d="m14.5 6.5 3 3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};

export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}

export function button(href, label, kind = 'primary', extra = '') {
  return `<a class="button button-${kind} ${extra}" href="${escapeHtml(href)}" data-link>${escapeHtml(label)}${kind === 'primary' ? icon('arrow') : ''}</a>`;
}

export function pageIntro(eyebrow, title, description, extra = '') {
  return `<section class="page-intro"><div class="eyebrow"><span class="eyebrow-dot"></span>${escapeHtml(eyebrow)}</div><h1>${title}</h1><p>${escapeHtml(description)}</p>${extra}</section>`;
}

export function sectionHeading(eyebrow, title, description = '') {
  return `<div class="section-heading" data-reveal><div class="eyebrow"><span class="eyebrow-dot"></span>${escapeHtml(eyebrow)}</div><h2>${title}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ''}</div>`;
}

export function serviceCard(service, index = 0, compact = false) {
  return `<article class="service-card ${compact ? 'service-card-compact' : ''}" data-reveal style="--reveal-delay:${(index % 4) * 70}ms"><div class="service-card-top"><span class="service-icon">${icon(service.id === 'brand' ? 'layers' : service.id === 'social' ? 'social' : service.id === 'marketing' ? 'target' : service.id === 'video' ? 'video' : service.id === 'web' ? 'web' : service.id === 'content' ? 'pen' : service.id === 'custom' ? 'compass' : 'spark')}</span><span class="service-number">${String(index + 1).padStart(2, '0')}</span></div><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(compact ? service.short : service.description)}</p>${compact ? `<a class="text-link" href="/services" data-link>Explore service ${icon('arrow')}</a>` : `<div class="service-benefit"><span>THE VALUE</span><p>${escapeHtml(service.benefit)}</p></div><div class="deliverable-list">${service.deliverables.map((item) => `<span>${icon('check')}${escapeHtml(item)}</span>`).join('')}</div>${button(`/contact?service=${encodeURIComponent(service.name)}`, 'Discuss This Service', 'text')}`}</article>`;
}

export function projectArt(project, large = false) {
  const art = escapeHtml(project.art || 'art-signal');
  const tag = escapeHtml(project.tag || 'CREATIVE / CONCEPT');
  const title = escapeHtml(project.title);
  return `<div class="project-art ${art} ${large ? 'project-art-large' : ''}" aria-label="Abstract concept artwork for ${title}" role="img"><span class="art-grid"></span><span class="art-orb"></span><span class="art-frame"></span><span class="art-copy">${tag}</span><span class="art-title">${title}</span><span class="art-index">Q / 0${(project.id?.length || 1) % 8 + 1}</span><span class="project-concept">CONCEPT PROJECT</span></div>`;
}

export function projectCard(project, index = 0) {
  return `<article class="project-card" data-category="${escapeHtml(project.category)}" data-reveal style="--reveal-delay:${(index % 3) * 80}ms"><a class="project-card-link" href="/work?project=${encodeURIComponent(project.id)}" data-link aria-label="View concept details for ${escapeHtml(project.title)}">${projectArt(project)}<div class="project-meta"><div><span class="project-category">${escapeHtml(project.category)}${project.concept ? ' · CONCEPT' : ''}</span><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.description)}</p></div><span class="project-arrow">${icon('arrow')}</span></div></a></article>`;
}

export function ctaBand(title, description, label = 'Let’s Build Something Great', href = '/contact') {
  return `<section class="cta-band" data-reveal><div class="cta-orbit cta-orbit-one"></div><div class="cta-orbit cta-orbit-two"></div><div class="cta-content"><div class="eyebrow"><span class="eyebrow-dot"></span>THE NEXT MOVE</div><h2>${title}</h2><p>${escapeHtml(description)}</p>${button(href, label)}</div></section>`;
}
