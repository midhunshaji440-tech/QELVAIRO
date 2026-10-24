import { escapeHtml, icon } from '../ui.js';

const groups = {
  announcement: { title: 'Announcement', key: 'announcement', help: 'The short message shown above the navigation on public pages.' },
  services: { title: 'Services', key: 'services', help: 'Edit service names, descriptions, benefits, and deliverables. Keep each id unique.' },
  projects: { title: 'Portfolio projects', key: 'projects', help: 'Add or update project concepts. Keep fictional work marked as concept=true.' },
  pricing: { title: 'Pricing packages', key: 'pricing', help: 'Edit INR pricing and the included scope for each starting package.' },
  contact: { title: 'Contact details', key: 'contact', help: 'These details are shown publicly in the footer and contact page. Leave fields blank to hide them.' }
};

export function renderAdmin() {
  return `<section class="admin-page"><div class="admin-topline"><a href="/" data-link class="back-link">← Back to website</a><span class="admin-environment"><i></i> PRIVATE ADMIN AREA</span></div><div class="admin-intro"><div class="eyebrow"><span class="eyebrow-dot"></span>QELVAIRO / ADMIN</div><h1>Manage the <span class="gradient-text">details.</span></h1><p>Enquiries and website content are available only after secure server-side sign-in is configured.</p></div><div id="admin-app" class="admin-app" aria-live="polite"><div class="admin-loading"><span class="loader-mark">Q</span><span>Checking admin configuration…</span></div></div></section>`;
}

async function request(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  let result = {};
  try { result = await response.json(); } catch {}
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result;
}

function setupNotice(configured, reason = '') {
  return `<div class="admin-setup-card"><span class="setup-lock">${icon('target')}</span><div><span class="admin-state-label">${configured ? 'ADMIN NOT CONFIGURED' : 'ADMIN NOT CONFIGURED'}</span><h2>Secure sign-in needs a server secret.</h2><p>Set <code>QELVAIRO_ADMIN_PASSWORD</code> on the server to enable admin access. Use a unique password with at least 16 characters, then restart the server. No fake or front-end-only login is provided.</p>${reason ? `<p class="admin-error-text">${escapeHtml(reason)}</p>` : ''}<div class="setup-status"><span><i></i>Private data remains inaccessible without authentication.</span><span>See <code>README.md</code> for deployment setup.</span></div></div></div>`;
}

function loginForm() {
  return `<form class="admin-login-form" id="admin-login-form"><div class="eyebrow"><span class="eyebrow-dot"></span>AUTHENTICATED ACCESS</div><h2>Welcome back.</h2><p>Sign in to manage enquiries and site content.</p><label class="field"><span>Admin password</span><input type="password" name="password" autocomplete="current-password" required minlength="16" placeholder="Enter your admin password" /></label><button class="button button-primary" type="submit">Sign in securely ${icon('arrow')}</button><div class="admin-inline-message" id="admin-login-message" role="alert"></div></form>`;
}

function dashboardFrame() {
  return `<div class="admin-dashboard"><aside class="admin-sidebar"><div class="admin-side-brand"><span>Q</span><div>QELVAIRO<small>ADMINISTRATION</small></div></div><nav aria-label="Admin sections"><button class="admin-tab is-active" data-admin-tab="overview">${icon('layers')}<span>Overview</span></button><button class="admin-tab" data-admin-tab="enquiries">${icon('arrow')}<span>Enquiries</span><i class="admin-count" id="new-count">0</i></button><div class="admin-nav-label">WEBSITE CONTENT</div>${Object.entries(groups).map(([key, value]) => `<button class="admin-tab" data-admin-tab="${key}">${icon(key === 'projects' ? 'spark' : key === 'services' ? 'compass' : key === 'pricing' ? 'target' : key === 'contact' ? 'social' : 'pen')}<span>${escapeHtml(value.title)}</span></button>`).join('')}</nav><button class="admin-logout" id="admin-logout">Sign out ${icon('close')}</button></aside><div class="admin-main"><div class="admin-main-top"><div><span class="admin-state-label">QELVAIRO / CONTROL ROOM</span><h2 id="admin-panel-title">Overview</h2></div><span class="authenticated-badge"><i></i> AUTHENTICATED SESSION</span></div><div class="admin-panel" id="admin-panel"><div class="admin-loading">Loading private data…</div></div></div></div>`;
}

function overviewPanel(data) {
  const inquiries = data.enquiries || [];
  const fresh = inquiries.filter((item) => item.status === 'New').length;
  return `<div class="admin-summary-grid"><article><span>ALL ENQUIRIES</span><strong>${inquiries.length}</strong><small>Securely stored on this server</small></article><article><span>NEW</span><strong>${fresh}</strong><small>Awaiting review</small></article><article><span>ACTIVE PROJECTS</span><strong>${inquiries.filter((item) => item.status === 'In Progress').length}</strong><small>Marked in progress</small></article></div><div class="admin-welcome-card"><div class="admin-welcome-mark">Q.</div><div><span class="admin-state-label">WORKSPACE STATUS</span><h3>Your website content is ready to manage.</h3><p>Update a content section from the left menu or review a recent enquiry. Changes are saved to the private server data directory.</p></div></div><div class="admin-recent"><div class="admin-panel-heading"><div><span class="admin-state-label">LATEST MESSAGES</span><h3>Recent enquiries</h3></div><button class="admin-small-link" data-admin-tab="enquiries">View all ${icon('arrow')}</button></div>${inquiries.length ? inquiryRows(inquiries.slice(0, 5)) : '<div class="admin-empty">No enquiries yet. New project messages will appear here.</div>'}</div>`;
}

function inquiryRows(items) {
  return `<div class="inquiry-list">${items.map((item) => `<article class="inquiry-row"><div class="inquiry-initial">${escapeHtml((item.name || '?').slice(0, 1).toUpperCase())}</div><div class="inquiry-main"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.brand || item.service || 'Project enquiry')} · ${escapeHtml(item.reference)}</span></div><span class="status-pill status-${escapeHtml(item.status.toLowerCase().replaceAll(' ', '-'))}">${escapeHtml(item.status)}</span><time>${escapeHtml(new Date(item.createdAt).toLocaleDateString())}</time><button class="inquiry-expand" data-inquiry="${escapeHtml(item.reference)}" aria-label="View ${escapeHtml(item.name)} enquiry">${icon('arrow')}</button></article><div class="inquiry-detail" data-detail="${escapeHtml(item.reference)}" hidden><div><span>EMAIL</span><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></div><div><span>SERVICE</span><strong>${escapeHtml(item.service)}</strong></div><div><span>PROJECT</span><p>${escapeHtml(item.description)}</p></div><label>Status<select data-status-reference="${escapeHtml(item.reference)}"><option ${item.status === 'New' ? 'selected' : ''}>New</option><option ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option><option ${item.status === 'Completed' ? 'selected' : ''}>Completed</option><option ${item.status === 'Archived' ? 'selected' : ''}>Archived</option></select></label></div>`).join('')}</div>`;
}

function groupPanel(groupKey, content) {
  const group = groups[groupKey];
  const value = content[group.key];
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return `<div class="content-editor"><div class="content-editor-heading"><span class="admin-state-label">EDIT PUBLIC WEBSITE CONTENT</span><h3>${escapeHtml(group.title)}</h3><p>${escapeHtml(group.help)}</p></div>${typeof value === 'string' ? `<label class="field"><span>Announcement text</span><input type="text" id="content-text-value" maxlength="240" value="${escapeHtml(text)}" /></label>` : `<label class="field"><span>${escapeHtml(group.title)} data</span><textarea id="content-json-value" rows="20" spellcheck="false">${escapeHtml(text)}</textarea><small class="field-hint">JSON is validated on the server before saving. Keep the existing structure and edit values carefully.</small></label>`}<div class="content-save-row"><span class="admin-inline-message" id="content-save-message" role="status"></span><button class="button button-primary" id="save-content" type="button">Save ${escapeHtml(group.title)} ${icon('arrow')}</button></div></div>`;
}

function enquiriesPanel(data) {
  const inquiries = data.enquiries || [];
  return `<div class="admin-panel-heading"><div><span class="admin-state-label">PRIVATE CLIENT DATA</span><h3>Project enquiries</h3><p>Names, messages, and contact details are visible only in this authenticated dashboard.</p></div><span class="admin-total">${inquiries.length} TOTAL</span></div>${inquiries.length ? inquiryRows(inquiries) : '<div class="admin-empty">No enquiries yet. Submitted project messages will be stored here.</div>'}`;
}

export async function mountAdmin() {
  const root = document.querySelector('#admin-app');
  if (!root) return;
  let status;
  try { status = await request('/api/admin/status'); }
  catch (error) { root.innerHTML = setupNotice(false, `The server could not be reached: ${error.message}`); return; }
  if (!status.configured) { root.innerHTML = setupNotice(false, status.reason); return; }
  if (!status.authenticated) { root.innerHTML = loginForm(); bindLogin(root); return; }
  root.innerHTML = dashboardFrame();
  let data;
  try { data = await request('/api/admin/dashboard'); }
  catch (error) { root.innerHTML = `<div class="admin-error-card">${escapeHtml(error.message)}. Please refresh and sign in again.</div>`; return; }
  let active = 'overview';

  function paint() {
    document.querySelector('#admin-panel-title').textContent = active === 'overview' ? 'Overview' : active === 'enquiries' ? 'Enquiries' : groups[active]?.title || 'Overview';
    const panel = document.querySelector('#admin-panel');
    panel.innerHTML = active === 'overview' ? overviewPanel(data) : active === 'enquiries' ? enquiriesPanel(data) : groupPanel(active, data.content);
    document.querySelector('#new-count').textContent = String((data.enquiries || []).filter((item) => item.status === 'New').length);
    document.querySelectorAll('[data-admin-tab]').forEach((el) => el.classList.toggle('is-active', el.dataset.adminTab === active));
    bindPanel(panel);
  }

  function bindPanel(panel) {
    panel.querySelectorAll('[data-admin-tab]').forEach((el) => el.addEventListener('click', () => { active = el.dataset.adminTab; paint(); }));
    panel.querySelectorAll('[data-inquiry]').forEach((el) => el.addEventListener('click', () => {
      const row = panel.querySelector(`[data-detail="${CSS.escape(el.dataset.inquiry)}"]`);
      if (row) row.hidden = !row.hidden;
    }));
    panel.querySelectorAll('[data-status-reference]').forEach((select) => select.addEventListener('change', async () => {
      select.disabled = true;
      try {
        const result = await request(`/api/admin/enquiries/${encodeURIComponent(select.dataset.statusReference)}`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) });
        data.enquiries = data.enquiries.map((item) => item.reference === result.enquiry.reference ? result.enquiry : item);
        paint();
      } catch (error) { select.disabled = false; window.alert(`Could not update enquiry status: ${error.message}`); }
    }));
    panel.querySelector('#save-content')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const message = panel.querySelector('#content-save-message');
      button.disabled = true;
      message.textContent = 'Saving…';
      let value;
      try {
        value = active === 'announcement' ? panel.querySelector('#content-text-value').value : JSON.parse(panel.querySelector('#content-json-value').value);
      } catch { message.textContent = 'Check the JSON syntax and try again.'; message.classList.add('is-error'); button.disabled = false; return; }
      try {
        const result = await request('/api/admin/content', { method: 'PATCH', body: JSON.stringify({ group: active, value }) });
        data.content = result.content;
        message.textContent = 'Saved. Public pages will now use this content.';
        message.classList.remove('is-error');
      } catch (error) { message.textContent = error.message; message.classList.add('is-error'); }
      button.disabled = false;
    });
  }

  document.querySelectorAll('.admin-sidebar [data-admin-tab]').forEach((el) => el.addEventListener('click', () => { active = el.dataset.adminTab; paint(); }));
  document.querySelector('#admin-logout').addEventListener('click', async () => {
    try { await request('/api/admin/logout', { method: 'POST', body: '{}' }); } catch {}
    root.innerHTML = loginForm();
    bindLogin(root);
  });
  paint();
}

function bindLogin(root) {
  const form = root.querySelector('#admin-login-form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector('#admin-login-message');
    button.disabled = true;
    message.textContent = 'Checking credentials…';
    try {
      await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: new FormData(form).get('password') }) });
      await mountAdmin();
    } catch (error) {
      message.textContent = error.message;
      button.disabled = false;
    }
  });
}
