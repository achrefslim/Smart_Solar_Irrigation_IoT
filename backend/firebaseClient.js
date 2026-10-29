const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '.env');
const REQUEST_TIMEOUT_MS = 15000;

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return;

  const envFile = fs.readFileSync(ENV_PATH, 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sep = trimmed.indexOf('=');
    if (sep === -1) continue;

    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function getConfig() {
  loadEnvFile();

  const databaseUrl = (process.env.FIREBASE_URL || '').replace(/\/+$/, '');
  if (!databaseUrl) {
    throw new Error('FIREBASE_URL is missing in backend/.env');
  }

  return {
    databaseUrl,
    apiKey: process.env.FIREBASE_API_KEY || '',
    email: process.env.FIREBASE_EMAIL || '',
    password: process.env.FIREBASE_PASSWORD || '',
  };
}

function formatFirebaseError(status, body) {
  if (!body) return `HTTP ${status}`;
  if (typeof body === 'string') return `HTTP ${status}: ${body}`;
  if (body.error) {
    if (typeof body.error === 'string') return `HTTP ${status}: ${body.error}`;
    if (body.error.message) return `HTTP ${status}: ${body.error.message}`;
  }
  return `HTTP ${status}: ${JSON.stringify(body)}`;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let body = null;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!res.ok) {
      throw new Error(formatFirebaseError(res.status, body));
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

class FirebaseRestClient {
  constructor() {
    this.config = getConfig();
    this.idToken = '';
    this.tokenExpiresAt = 0;
    this.authMode = 'public';
  }

  hasPasswordAuth() {
    return Boolean(this.config.apiKey && this.config.email && this.config.password);
  }

  async authenticate() {
    if (!this.hasPasswordAuth()) {
      this.authMode = 'public';
      return '';
    }

    if (this.idToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.idToken;
    }

    const authUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.config.apiKey}`;

    const body = await fetchJson(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.config.email,
        password: this.config.password,
        returnSecureToken: true,
      }),
    });

    this.idToken = body.idToken || '';
    this.tokenExpiresAt = Date.now() + Number(body.expiresIn || 3600) * 1000;
    this.authMode = 'password';
    return this.idToken;
  }

  async url(dbPath) {
    const token = await this.authenticate();
    const cleanPath = String(dbPath || '').replace(/^\/+|\/+$/g, '');
    const suffix = cleanPath ? `/${cleanPath}.json` : '/.json';
    const query = token ? `?auth=${encodeURIComponent(token)}` : '';
    return `${this.config.databaseUrl}${suffix}${query}`;
  }

  async get(dbPath) {
    return fetchJson(await this.url(dbPath));
  }

  async put(dbPath, value) {
    return fetchJson(await this.url(dbPath), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
  }

  async patch(dbPath, value) {
    return fetchJson(await this.url(dbPath), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
  }
}

module.exports = {
  FirebaseRestClient,
  getConfig,
};
