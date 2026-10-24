import { createServer } from 'node:http';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, rename, stat, chmod } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultContent } from './src/data.js';

const scrypt = promisify(scryptCallback);
const root = path.dirname(fileURLToPath(import.meta.url));

async function loadDotEnv() {
  try {
    const raw = await readFile(path.join(root, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || Object.hasOwn(process.env, match[1])) continue;
      let value = match[2];
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      process.env[match[1]] = value;
    }
  } catch {}
}
await loadDotEnv();

const port = Number(process.env.PORT || 4173);
const production = process.env.NODE_ENV === 'production';
const configuredDataDir = process.env.QELVAIRO_DATA_DIR || path.join(root, 'data');
const dataDir = path.resolve(configuredDataDir);
const contentFile = path.join(dataDir, 'site-content.json');
const enquiriesFile = path.join(dataDir, 'enquiries.json');
const staticRoot = await stat(path.join(root, 'dist', 'index.html')).then(() => path.join(root, 'dist')).catch(() => root);
const sessions = new Map();
const rateLimits = new Map();
const requestCounts = new Map();
const SESSION_AGE = 12 * 60 * 60 * 1000;
const CONTENT_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon' };
const clone = (value) => JSON.parse(JSON.stringify(value));

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254; }
function validPublicUrl(value) {
  if (!value) return true;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
function initialContact() {
  return {
    email: process.env.QELVAIRO_CONTACT_EMAIL || '',
    phone: process.env.QELVAIRO_CONTACT_PHONE || '',
    instagram: process.env.QELVAIRO_INSTAGRAM_URL || '',
    linkedin: process.env.QELVAIRO_LINKEDIN_URL || ''
  };
}

await mkdir(dataDir, { recursive: true, mode: 0o700 });
try { await chmod(dataDir, 0o700); } catch {}
let siteContent = { ...clone(defaultContent), contact: { ...defaultContent.contact, ...initialContact() } };
let enquiries = [];
try {
  const saved = JSON.parse(await readFile(contentFile, 'utf8'));
  siteContent = { ...siteContent, ...saved, contact: { ...siteContent.contact, ...(saved.contact || {}) } };
} catch {}
try { enquiries = JSON.parse(await readFile(enquiriesFile, 'utf8')); if (!Array.isArray(enquiries)) enquiries = []; } catch {}

const adminPassword = process.env.QELVAIRO_ADMIN_PASSWORD || '';
const adminConfigured = adminPassword.length >= 16 && adminPassword.length <= 1024;
const passwordSalt = randomBytes(16);
const passwordHash = adminConfigured ? await scrypt(adminPassword, passwordSalt, 64) : null;
let writeQueue = Promise.resolve();

function queueSave(file, content) {
  writeQueue = writeQueue.then(async () => {
    const temporary = `${file}.${randomBytes(5).toString('hex')}.tmp`;
    await writeFile(temporary, JSON.stringify(content, null, 2), { mode: 0o600 });
    try { await chmod(temporary, 0o600); } catch {}
    await rename(temporary, file);
  });
  return writeQueue;
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(JSON.stringify(value));
}

function readCookie(request, name) {
  const cookie = request.headers.cookie || '';
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : '';
}

function hashToken(token) { return createHash('sha256').update(token).digest('hex'); }

function currentSession(request) {
  const token = readCookie(request, 'qelvairo_session');
  if (!token) return null;
  const key = hashToken(token);
  const session = sessions.get(key);
  if (!session || session.expiresAt <= Date.now()) { sessions.delete(key); return null; }
  session.expiresAt = Date.now() + SESSION_AGE;
  return { key, session };
}

function requireAdmin(request, response) {
  if (!adminConfigured) { sendJson(response, 503, { error: 'Admin authentication is not configured on this server.' }); return null; }
  const session = currentSession(request);
  if (!session) { sendJson(response, 401, { error: 'Please sign in again to continue.' }); return null; }
  return session;
}

function originAllowed(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}

async function readBody(request, maxBytes = 300_000) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) { const error = new Error('Request is too large.'); error.status = 413; throw error; }
    chunks.push(chunk);
  }
  if (!size) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const error = new Error('Please send valid JSON.'); error.status = 400; throw error; }
}

function getRateState(map, key, windowMs) {
  let state = map.get(key);
  if (!state || state.resetAt <= Date.now()) { state = { count: 0, resetAt: Date.now() + windowMs }; map.set(key, state); }
  return state;
}

function rateLimited(map, key, maximum, windowMs) {
  const state = getRateState(map, key, windowMs);
  state.count += 1;
  return state.count > maximum;
}

function requireSameOrigin(request, response) {
  if (originAllowed(request)) return true;
  sendJson(response, 403, { error: 'This request could not be verified.' });
  return false;
}

function cleanString(value, name, maximum, { required = true, minimum = 1 } = {}) {
  if (typeof value !== 'string') throw new Error(`${name} must be text.`);
  const cleaned = value.trim();
  if (required && cleaned.length < minimum) throw new Error(`${name} is required.`);
  if (cleaned.length > maximum) throw new Error(`${name} must be ${maximum} characters or fewer.`);
  return cleaned;
}

function cleanStringArray(value, name, maximumItems = 20, maximumLength = 200) {
  if (!Array.isArray(value) || value.length > maximumItems) throw new Error(`${name} must be a list of up to ${maximumItems} items.`);
  return value.map((item, index) => cleanString(item, `${name} item ${index + 1}`, maximumLength));
}

function cleanId(value, name = 'id') {
  const id = cleanString(value, name, 50);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`${name} can use lowercase letters, numbers, and hyphens.`);
  return id;
}

function validateServiceCollection(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new Error('Services must contain between 1 and 30 entries.');
  const ids = new Set();
  return value.map((item) => {
    const id = cleanId(item?.id);
    if (ids.has(id)) throw new Error(`The service id “${id}” is duplicated.`);
    ids.add(id);
    return { id, name: cleanString(item.name, 'Service name', 100), short: cleanString(item.short, 'Service summary', 260), description: cleanString(item.description, 'Service description', 1200), benefit: cleanString(item.benefit, 'Service benefit', 400), deliverables: cleanStringArray(item.deliverables, 'Service deliverables', 16, 180) };
  });
}

function validateProjectCollection(value) {
  const allowedCategories = new Set(['Branding', 'Advertising', 'Social Media', 'Websites', 'Video & Motion']);
  const allowedArt = new Set(['art-aurelia', 'art-form', 'art-morrow', 'art-monsoon', 'art-signal', 'art-northstar']);
  if (!Array.isArray(value) || value.length > 100) throw new Error('Portfolio projects must be a list of up to 100 entries.');
  const ids = new Set();
  return value.map((item) => {
    const id = cleanId(item?.id, 'Project id');
    if (ids.has(id)) throw new Error(`The project id “${id}” is duplicated.`);
    ids.add(id);
    const category = cleanString(item.category, 'Project category', 40);
    if (!allowedCategories.has(category)) throw new Error(`“${category}” is not a supported portfolio category.`);
    if (typeof item.concept !== 'boolean') throw new Error('Each portfolio project must specify concept as true or false.');
    return { id, title: cleanString(item.title, 'Project title', 100), category, description: cleanString(item.description, 'Project description', 500), concept: item.concept, art: allowedArt.has(item.art) ? item.art : 'art-signal', tag: cleanString(item.tag || 'CREATIVE / CONCEPT', 'Project label', 70), challenge: cleanString(item.challenge || 'Explore a distinctive creative direction.', 'Project challenge', 500), approach: cleanString(item.approach || 'Bring strategy and visual craft together.', 'Project approach', 700), deliverables: cleanStringArray(item.deliverables || [], 'Project deliverables', 20, 180) };
  });
}

function validatePricingCollection(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) throw new Error('Pricing must contain between 1 and 10 packages.');
  const ids = new Set();
  return value.map((item) => {
    const id = cleanId(item?.id, 'Package id');
    if (ids.has(id)) throw new Error(`The package id “${id}” is duplicated.`);
    ids.add(id);
    if (typeof item.featured !== 'boolean') throw new Error('Each package must specify featured as true or false.');
    return { id, name: cleanString(item.name, 'Package name', 80), price: cleanString(item.price, 'Package price', 60), label: cleanString(item.label, 'Package label', 100), bestFor: cleanString(item.bestFor, 'Package description', 300), items: cleanStringArray(item.items, 'Package deliverables', 20, 200), featured: item.featured };
  });
}

function validateContact(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Contact details must be an object.');
  const contact = {
    email: cleanString(value.email || '', 'Contact email', 254, { required: false }),
    phone: cleanString(value.phone || '', 'Contact phone', 40, { required: false }),
    instagram: cleanString(value.instagram || '', 'Instagram URL', 300, { required: false }),
    linkedin: cleanString(value.linkedin || '', 'LinkedIn URL', 300, { required: false })
  };
  if (contact.email && !validEmail(contact.email)) throw new Error('Enter a valid contact email address.');
  if (!validPublicUrl(contact.instagram) || !validPublicUrl(contact.linkedin)) throw new Error('Social links must use a valid https:// address.');
  return contact;
}

function validateContentGroup(group, value) {
  switch (group) {
    case 'announcement': return cleanString(value, 'Announcement', 240, { required: false });
    case 'services': return validateServiceCollection(value);
    case 'projects': return validateProjectCollection(value);
    case 'pricing': return validatePricingCollection(value);
    case 'contact': return validateContact(value);
    default: throw new Error('Choose a supported website content section.');
  }
}

function referenceNumber() {
  const date = new Date();
  const yymmdd = `${String(date.getUTCFullYear()).slice(-2)}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
  return `QV-${yymmdd}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function validateEnquiry(body) {
  const enquiry = {
    name: cleanString(body.name, 'Full name', 100, { minimum: 2 }),
    brand: cleanString(body.brand || '', 'Business or brand name', 120, { required: false }),
    email: cleanString(body.email, 'Email address', 254),
    phone: cleanString(body.phone || '', 'Phone number', 30, { required: false }),
    service: cleanString(body.service, 'Service required', 100),
    package: cleanString(body.package || '', 'Package', 80, { required: false }),
    budget: cleanString(body.budget || '', 'Budget range', 80, { required: false }),
    timeline: cleanString(body.timeline || '', 'Timeline', 80, { required: false }),
    description: cleanString(body.description, 'Project description', 5000, { minimum: 20 }),
    contactMethod: cleanString(body.contactMethod || 'Email', 'Preferred contact method', 20),
    website: cleanString(body.website || '', 'Website field', 200, { required: false })
  };
  if (!validEmail(enquiry.email)) throw new Error('Enter a valid email address.');
  if (!['Email', 'Phone'].includes(enquiry.contactMethod)) throw new Error('Choose email or phone as your preferred contact method.');
  return enquiry;
}

async function sendAdminNotification(enquiry) {
  const hook = process.env.QELVAIRO_ADMIN_WEBHOOK;
  if (!hook) return;
  let url;
  try { url = new URL(hook); } catch { return; }
  if (url.protocol !== 'https:') return;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'qelvairo.enquiry.created', enquiry }), signal: AbortSignal.timeout(4000) });
  } catch {}
}

async function handleApi(request, response, url) {
  const method = request.method || 'GET';
  const pathname = url.pathname;
  if (pathname === '/api/site-content' && method === 'GET') {
    return sendJson(response, 200, { content: siteContent });
  }
  if (pathname === '/api/admin/status' && method === 'GET') {
    return sendJson(response, 200, { configured: adminConfigured, authenticated: Boolean(currentSession(request)), reason: adminPassword && !adminConfigured ? 'The configured password must contain at least 16 characters.' : '' });
  }
  if (pathname === '/api/admin/login' && method === 'POST') {
    if (!requireSameOrigin(request, response)) return;
    if (!adminConfigured) return sendJson(response, 503, { error: 'Admin sign-in is not configured on this server.' });
    const ip = request.socket.remoteAddress || 'unknown';
    const attempts = getRateState(rateLimits, `login:${ip}`, 15 * 60 * 1000);
    if (attempts.count >= 8) return sendJson(response, 429, { error: 'Too many sign-in attempts. Please wait before trying again.' });
    const body = await readBody(request, 4000);
    const candidate = typeof body.password === 'string' ? body.password : '';
    const candidateHash = await scrypt(candidate, passwordSalt, 64);
    const accepted = candidateHash.length === passwordHash.length && timingSafeEqual(candidateHash, passwordHash);
    if (!accepted) { attempts.count += 1; return sendJson(response, 401, { error: 'The password was not accepted.' }); }
    rateLimits.delete(`login:${ip}`);
    const token = randomBytes(32).toString('base64url');
    sessions.set(hashToken(token), { createdAt: Date.now(), expiresAt: Date.now() + SESSION_AGE });
    const secure = production ? '; Secure' : '';
    response.setHeader('Set-Cookie', `qelvairo_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_AGE / 1000}${secure}`);
    return sendJson(response, 200, { authenticated: true });
  }
  if (pathname === '/api/admin/logout' && method === 'POST') {
    if (!requireSameOrigin(request, response)) return;
    const session = currentSession(request);
    if (session) sessions.delete(session.key);
    response.setHeader('Set-Cookie', 'qelvairo_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0' + (production ? '; Secure' : ''));
    return sendJson(response, 200, { authenticated: false });
  }
  if (pathname === '/api/enquiries' && method === 'POST') {
    if (!requireSameOrigin(request, response)) return;
    const ip = request.socket.remoteAddress || 'unknown';
    if (rateLimited(requestCounts, `enquiry:${ip}`, 4, 10 * 60 * 1000)) return sendJson(response, 429, { error: 'Too many enquiries were submitted from this connection. Please wait a while and try again.' });
    const body = await readBody(request, 12_000);
    const validated = validateEnquiry(body);
    const reference = referenceNumber();
    if (validated.website) return sendJson(response, 201, { accepted: true, reference });
    const enquiry = { ...validated, website: undefined, reference, status: 'New', createdAt: new Date().toISOString() };
    enquiries = [enquiry, ...enquiries].slice(0, 5000);
    await queueSave(enquiriesFile, enquiries);
    void sendAdminNotification(enquiry);
    return sendJson(response, 201, { accepted: true, reference });
  }
  if (pathname.startsWith('/api/admin/')) {
    const session = requireAdmin(request, response);
    if (!session) return;
    if (pathname === '/api/admin/dashboard' && method === 'GET') return sendJson(response, 200, { enquiries, content: siteContent });
    if (pathname === '/api/admin/content' && method === 'PATCH') {
      if (!requireSameOrigin(request, response)) return;
      const body = await readBody(request);
      const group = cleanString(body.group, 'Content section', 30);
      const value = validateContentGroup(group, body.value);
      siteContent = { ...siteContent, [group]: value };
      await queueSave(contentFile, siteContent);
      return sendJson(response, 200, { content: siteContent });
    }
    const match = pathname.match(/^\/api\/admin\/enquiries\/([A-Z0-9-]+)$/i);
    if (match && method === 'PATCH') {
      if (!requireSameOrigin(request, response)) return;
      const body = await readBody(request, 4000);
      const status = cleanString(body.status, 'Enquiry status', 30);
      if (!['New', 'In Progress', 'Completed', 'Archived'].includes(status)) return sendJson(response, 400, { error: 'Choose a supported enquiry status.' });
      const reference = decodeURIComponent(match[1]);
      const index = enquiries.findIndex((item) => item.reference === reference);
      if (index < 0) return sendJson(response, 404, { error: 'That enquiry could not be found.' });
      enquiries[index] = { ...enquiries[index], status, updatedAt: new Date().toISOString() };
      await queueSave(enquiriesFile, enquiries);
      return sendJson(response, 200, { enquiry: enquiries[index] });
    }
    return sendJson(response, 404, { error: 'Admin API route not found.' });
  }
  return sendJson(response, 404, { error: 'API route not found.' });
}

async function serveStatic(request, response, pathname) {
  const allowRootFiles = new Set(['/', '/index.html', '/favicon.svg', '/og-image.svg']);
  if (!allowRootFiles.has(pathname) && !pathname.startsWith('/src/')) {
    const indexPath = path.join(staticRoot, 'index.html');
    const html = await readFile(indexPath);
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    return response.end(html);
  }
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (relative.split(/[\\/]/).includes('..')) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('Not found.');
  }
  const file = path.resolve(staticRoot, relative);
  if (!file.startsWith(staticRoot + path.sep) && file !== path.join(staticRoot, 'index.html')) {
    response.writeHead(400); return response.end('Bad request.');
  }
  try {
    const content = await readFile(file);
    const type = CONTENT_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': production ? 'public, max-age=3600' : 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    if (request.method === 'HEAD') return response.end();
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found.');
  }
}

const server = createServer(async (request, response) => {
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(request, response, url);
    if (!['GET', 'HEAD'].includes(request.method || 'GET')) { response.writeHead(405, { Allow: 'GET, HEAD' }); return response.end(); }
    return await serveStatic(request, response, decodeURIComponent(url.pathname));
  } catch (error) {
    if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : 'Something went wrong. Please try again.' });
    else response.end();
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of sessions) if (value.expiresAt <= now) sessions.delete(key);
  for (const [key, value] of rateLimits) if (value.resetAt <= now) rateLimits.delete(key);
  for (const [key, value] of requestCounts) if (value.resetAt <= now) requestCounts.delete(key);
}, 60_000).unref();

server.listen(port, () => {
  console.log(`QELVAIRO website available on port ${port}.`);
  console.log(adminConfigured ? 'Server-side admin authentication is configured.' : 'Admin access is disabled until QELVAIRO_ADMIN_PASSWORD is configured.');
});
