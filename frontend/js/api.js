/**
 * api.js – Centralised HTTP helpers for Sriram Traders frontend.
 * All calls go to /api/* on the same origin (served by Express).
 */

const API = (() => {
  const BASE = '/api';

  /* ── Token helpers ──────────────────────────────────────── */
  function getToken() {
    return localStorage.getItem('st_token') || null;
  }
  function setToken(t) {
    if (t) localStorage.setItem('st_token', t);
    else    localStorage.removeItem('st_token');
  }
  function setUser(u) {
    if (u) localStorage.setItem('st_user', JSON.stringify(u));
    else    localStorage.removeItem('st_user');
  }
  function getUser() {
    return JSON.parse(localStorage.getItem('st_user') || 'null');
  }
  function clearSession() {
    setToken(null);
    setUser(null);
  }

  /* ── Core fetch wrapper ─────────────────────────────────── */
  async function request(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers['Authorization'] = 'Bearer ' + token;
    }
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res  = await fetch(BASE + path, opts);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
  }

  /* ── Auth ───────────────────────────────────────────────── */
  async function register(payload) {
    const data = await request('POST', '/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(email, password) {
    const data = await request('POST', '/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function adminLogin(email, password) {
    const data = await request('POST', '/auth/admin-login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    clearSession();
  }

  /* ── Orders ─────────────────────────────────────────────── */
  async function placeOrder(payload) {
    return request('POST', '/orders', payload, true);
  }
  async function myOrders() {
    return request('GET', '/orders/my', null, true);
  }
  async function allOrders() {
    return request('GET', '/orders', null, true);
  }
  async function updateOrderStatus(id, status) {
    return request('PATCH', `/orders/${id}/status`, { status }, true);
  }
  async function adminStats() {
    return request('GET', '/orders/stats', null, true);
  }

  /* ── Quotes ─────────────────────────────────────────────── */
  async function submitQuote(payload) {
    return request('POST', '/quotes', payload);
  }
  async function allQuotes() {
    return request('GET', '/quotes', null, true);
  }

  /* ── Customers ───────────────────────────────────────────── */
  async function allCustomers() {
    return request('GET', '/customers', null, true);
  }

  /* ── Public exports ─────────────────────────────────────── */
  return {
    getUser, getToken, setToken, setUser, clearSession,
    register, login, adminLogin, logout,
    placeOrder, myOrders, allOrders, updateOrderStatus, adminStats,
    submitQuote, allQuotes,
    allCustomers,
  };
})();
