/**
 * app.js – Sriram Traders frontend application logic.
 * Replaces the inline localStorage-based JS with real API calls.
 */

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', function () {
  const user = API.getUser();
  if (user && user.isAdmin) {
    showAdminPanel();
  } else if (user) {
    showUserNav(user);
  }
});

/* ============================================================
   NAVIGATION
   ============================================================ */
function goHome() {
  document.getElementById('main-site').style.display  = 'block';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-panel').classList.remove('active');
  document.body.classList.remove('admin-active');
}

function showAdminPanel() {
  document.getElementById('main-site').style.display  = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  document.getElementById('admin-panel').classList.add('active');
  document.body.classList.add('admin-active');
  loadAdminData();
}

function scrollTo2(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   USER NAV
   ============================================================ */
function showUserNav(u) {
  // Always show the main site for customers — never leave admin panel visible
  goHome();
  document.getElementById('nav-auth-btns').style.display  = 'none';
  document.getElementById('nav-user-menu').style.display  = 'block';
  const initial = u.fname ? u.fname[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : 'U');
  document.getElementById('user-badge').textContent = initial;
  updateCartBadge();
}

function resetNav() {
  document.getElementById('nav-auth-btns').style.display  = 'flex';
  document.getElementById('nav-user-menu').style.display  = 'none';
  document.getElementById('user-dropdown').classList.remove('open');
}

function toggleUserMenu() {
  document.getElementById('user-dropdown').classList.toggle('open');
}

function closeDropdown() {
  document.getElementById('user-dropdown').classList.remove('open');
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openModal(name) {
  const el = document.getElementById('modal-' + name);
  if (!el) return;
  el.classList.add('open');
  if (name === 'cart') renderCartModal();
}

function closeModal(name) {
  const el = document.getElementById('modal-' + name);
  if (el) el.classList.remove('open');
}

function switchModal(from, to) {
  closeModal(from);
  openModal(to);
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideErr(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

/* ============================================================
   BTN LOADING STATE
   ============================================================ */
function setBtnLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Please wait…';
  } else {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

/* ============================================================
   CUSTOMER LOGIN
   ============================================================ */
async function doLogin() {
  hideErr('login-err');
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showErr('login-err', 'Please enter both email and password.'); return; }

  const btn = document.querySelector('#modal-login .btn-full');
  setBtnLoading(btn, true, 'Sign In');

  try {
    const data = await API.login(email, pass);
    closeModal('login');
    showUserNav(data.user);
    document.getElementById('login-email').value    = '';
    document.getElementById('login-password').value = '';
    showToast('Welcome back, ' + data.user.fname + '!');
  } catch (err) {
    showErr('login-err', err.message);
  } finally {
    setBtnLoading(btn, false, 'Sign In');
  }
}

/* ============================================================
   CUSTOMER REGISTER
   ============================================================ */
async function doRegister() {
  hideErr('reg-err');
  const fname = document.getElementById('reg-fname').value.trim();
  const lname = document.getElementById('reg-lname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const pass  = document.getElementById('reg-password').value;
  const conf  = document.getElementById('reg-confirm').value;

  if (!fname || !lname || !email || !phone || !pass || !conf) {
    showErr('reg-err', 'Please fill in all required fields.'); return;
  }
  if (pass.length < 6) { showErr('reg-err', 'Password must be at least 6 characters.'); return; }
  if (pass !== conf)    { showErr('reg-err', 'Passwords do not match.'); return; }

  const btn = document.querySelector('#modal-register .btn-full');
  setBtnLoading(btn, true, 'Create Account');

  try {
    const data = await API.register({ fname, lname, email, phone, password: pass });
    closeModal('register');
    showUserNav(data.user);
    ['reg-fname','reg-lname','reg-email','reg-phone','reg-password','reg-confirm']
      .forEach(id => { document.getElementById(id).value = ''; });
    showToast('Account created! Welcome, ' + data.user.fname + '!');
  } catch (err) {
    showErr('reg-err', err.message);
  } finally {
    setBtnLoading(btn, false, 'Create Account');
  }
}

/* ============================================================
   ADMIN LOGIN
   ============================================================ */
async function doAdminLogin() {
  hideErr('admin-err');
  const email = document.getElementById('admin-email').value.trim();
  const pass  = document.getElementById('admin-pass').value;
  if (!email || !pass) { showErr('admin-err', 'Please enter admin credentials.'); return; }

  const btn = document.querySelector('#modal-admin-login .btn-full-admin');
  setBtnLoading(btn, true, '🔐 Admin Sign In');

  try {
    await API.adminLogin(email, pass);
    closeModal('admin-login');
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-pass').value  = '';
    showAdminPanel();
    showToast('Welcome, Admin!');
  } catch (err) {
    showErr('admin-err', err.message);
  } finally {
    setBtnLoading(btn, false, '🔐 Admin Sign In');
  }
}

/* ============================================================
   LOGOUT
   ============================================================ */
function doLogout() {
  API.logout();
  resetNav();
  goHome();
  showToast('You have been logged out.');
}

/* ============================================================
   CART  (localStorage, per-user keyed by email)
   ============================================================ */
function cartKey() {
  const u = API.getUser();
  return u ? 'st_cart_' + u.email : 'st_cart_guest';
}
function getCart() {
  return JSON.parse(localStorage.getItem(cartKey()) || '[]');
}
function saveCart(items) {
  localStorage.setItem(cartKey(), JSON.stringify(items));
  updateCartBadge();
}
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  if (total > 0) { badge.textContent = total; badge.style.display = 'flex'; }
  else           { badge.style.display = 'none'; }
}

function addToCart(grade, desc) {
  const u = API.getUser();
  if (!u) { showToast('Please login to add items to cart.'); openModal('login'); return; }
  if (u.isAdmin) { showToast('Admin cannot add to cart.'); return; }

  const cart = getCart();
  const existing = cart.find(i => i.grade === grade);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ grade, desc, qty: 1 });
  }
  saveCart(cart);
  showToast(grade + ' added to cart! 🛒');
  updateCartBadge();
}

function removeFromCart(grade) {
  saveCart(getCart().filter(i => i.grade !== grade));
  renderCartModal();
}

function changeCartQty(grade, delta) {
  const cart = getCart();
  const item = cart.find(i => i.grade === grade);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCartModal();
}

function clearCart() {
  saveCart([]);
  renderCartModal();
}

/* Grade → product image map */
const GRADE_IMG = {
  'W180': 'images/180.jpeg',
  'W240': 'images/240.jpeg',
  'W320': 'images/320.jpeg',
  'W450': 'images/450.jpg',
  'JH':   'images/jh.jpeg',
  'BB':   'images/bb.jpeg',
};

function renderCartModal() {
  const cart   = getCart();
  const list   = document.getElementById('cart-items-list');
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-qty');

  if (!cart.length) {
    list.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛒</span>
        <h3>Your cart is empty</h3>
        <p>Add cashew grades from our products section<br>to get started.</p>
        <button class="btn-cart-shop" onclick="closeModal('cart');scrollTo2('products')">
          Browse Products →
        </button>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  const totalKg = cart.reduce((s, i) => s + i.qty, 0);
  if (totalEl) totalEl.textContent = totalKg + ' kg';
  if (footer)  footer.style.display = 'block';

  list.innerHTML = cart.map(item => {
    const imgSrc = GRADE_IMG[item.grade] || 'images/320.jpeg';
    return `
    <div class="cart-item">
      <div class="cart-item-icon">
        <img src="${imgSrc}" alt="${escHtml(item.grade)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.grade)}</div>
        <div class="cart-item-sub">${escHtml(item.desc)}</div>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn" onclick="changeCartQty('${item.grade}',-1)">−</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeCartQty('${item.grade}',1)">+</button>
          <span class="cart-qty-unit">kg</span>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${item.grade}')" title="Remove item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>`;
  }).join('');
}

function checkoutFromCart() {
  const cart = getCart();
  if (!cart.length) { showToast('Your cart is empty.'); return; }
  closeModal('cart');
  // Pre-fill order modal: first item's grade (user can change in modal)
  openOrderModalFromCart(cart);
}

/* ============================================================
   ORDER MODAL  (only reachable from cart now)
   ============================================================ */
function openOrderModalFromCart(cart) {
  const u = API.getUser();
  if (!u) { showToast('Please login to place an order.'); openModal('login'); return; }

  // Build a summary of cart items for the grade dropdown / notes
  const firstGrade = cart[0].grade;
  const cartSummary = cart.map(i => i.grade + ' × ' + i.qty + ' kg').join(', ');

  // Pre-select first cart grade, pre-fill phone, add cart summary to notes
  document.getElementById('order-grade').value  = firstGrade;
  document.getElementById('order-phone').value  = u.phone || '';
  document.getElementById('order-notes').value  = 'Cart: ' + cartSummary;
  document.getElementById('order-qty').value    = cart[0].qty;
  hideErr('order-err');
  openModal('order');
}

async function submitOrder() {
  hideErr('order-err');
  const u = API.getUser();
  if (!u) { showErr('order-err', 'Session expired. Please login again.'); return; }

  const grade   = document.getElementById('order-grade').value;
  const qty     = document.getElementById('order-qty').value.trim();
  const phone   = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  const city    = document.getElementById('order-city').value.trim();
  const state   = document.getElementById('order-state').value.trim();
  const pincode = document.getElementById('order-pincode').value.trim();
  const method  = document.getElementById('order-method').value;
  const notes   = document.getElementById('order-notes').value.trim();

  if (!qty || !phone || !address || !city || !state || !pincode) {
    showErr('order-err', 'Please fill all required fields.'); return;
  }
  if (!/^\d{6}$/.test(pincode)) {
    showErr('order-err', 'Pincode must be exactly 6 digits.'); return;
  }

  // WhatsApp shortcut – no DB write needed
  if (method === 'whatsapp') {
    const cart = getCart();
    const cartSummary = cart.length
      ? cart.map(i => i.grade + ' × ' + i.qty + ' kg').join(', ')
      : grade + ' × ' + qty + ' kg';
    const msg = `Hello Sriram Traders!\n\nNew Order:\nName: ${u.fname} ${u.lname || ''}\nItems: ${cartSummary}\nPhone: ${phone}\nAddress: ${address}, ${city}, ${state} - ${pincode}${notes ? '\nNotes: ' + notes : ''}`;
    window.open('https://wa.me/917339409378?text=' + encodeURIComponent(msg), '_blank');
    closeModal('order');
    clearCart();
    clearOrderForm();
    return;
  }

  const btn = document.querySelector('#modal-order .btn-full');
  setBtnLoading(btn, true, '✅ Confirm Order');

  try {
    await API.placeOrder({ grade, qty: parseInt(qty), phone, address, city, state, pincode, notes });
    closeModal('order');
    clearCart();
    clearOrderForm();
    showToast("Order placed! We'll call you to confirm.");
  } catch (err) {
    showErr('order-err', err.message);
  } finally {
    setBtnLoading(btn, false, '✅ Confirm Order');
  }
}

function clearOrderForm() {
  ['order-qty','order-phone','order-address','order-city','order-state','order-pincode','order-notes']
    .forEach(id => { document.getElementById(id).value = ''; });
}

/* ============================================================
   MY ORDERS DRAWER
   ============================================================ */
async function showMyOrders() {
  const u = API.getUser();
  if (!u) return;

  const list = document.getElementById('my-orders-list');
  list.innerHTML = '<div class="drawer-loading"><span style="font-size:32px;display:block;margin-bottom:12px;">⏳</span>Loading your orders…</div>';
  openModal('myorders');

  try {
    const data   = await API.myOrders();
    const orders = data.orders;

    if (!orders.length) {
      list.innerHTML = `
        <div class="orders-empty">
          <span class="orders-empty-icon">📦</span>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders.<br>Add items to cart and checkout to get started.</p>
          <button class="btn-cart-shop" onclick="closeModal('myorders');scrollTo2('products')">
            Shop Now →
          </button>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(o => {
      const statusCls = o.status === 'Pending'    ? 'status-pending'
                      : o.status === 'Processing' ? 'status-processing'
                      : o.status === 'Delivered'  ? 'status-delivered'
                      : 'status-cancelled';
      const statusIcon = o.status === 'Pending'    ? '🕐'
                       : o.status === 'Processing' ? '⚙️'
                       : o.status === 'Delivered'  ? '✅'
                       : '❌';
      const dateStr = new Date(o.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      return `
        <div class="order-card">
          <div class="order-card-head">
            <div>
              <div class="order-card-id">Order #${o.id}</div>
              <div class="order-card-date">Placed on ${dateStr}</div>
            </div>
            <span class="status-badge ${statusCls}">${statusIcon} ${o.status}</span>
          </div>
          <div class="order-card-body">
            <div class="order-detail-row">
              <span class="order-detail-label">Grade</span>
              <span class="order-detail-val"><span class="order-grade-pill">🥜 ${escHtml(o.grade)}</span></span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Quantity</span>
              <span class="order-detail-val" style="font-weight:700;color:var(--dark-green);">${o.qty} kg</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Phone</span>
              <span class="order-detail-val">${escHtml(o.phone)}</span>
            </div>
            <div class="order-detail-row">
              <span class="order-detail-label">Delivery</span>
              <span class="order-detail-val">${escHtml(o.address)},<br>${escHtml(o.city)}, ${escHtml(o.state)} – ${escHtml(o.pincode)}</span>
            </div>
            ${o.notes ? `<div class="order-detail-row">
              <span class="order-detail-label">Notes</span>
              <span class="order-detail-val" style="color:var(--text-light);">${escHtml(o.notes)}</span>
            </div>` : ''}
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<div class="orders-empty">
      <span class="orders-empty-icon">⚠️</span>
      <h3>Could not load orders</h3>
      <p style="color:var(--red);">${escHtml(err.message)}</p>
    </div>`;
  }
}

/* ============================================================
   WHATSAPP DIRECT
   ============================================================ */
function waOrder(grade) {
  const msg = `Hello Sriram Traders! I am interested in ordering ${grade} cashews. Please share the price and availability.`;
  window.open('https://wa.me/917339409378?text=' + encodeURIComponent(msg), '_blank');
}

/* ============================================================
   QUOTATION FORM
   ============================================================ */
async function submitQuote() {
  hideErr('quote-err');
  const name  = document.getElementById('q-name').value.trim();
  const phone = document.getElementById('q-phone').value.trim();
  const email = document.getElementById('q-email').value.trim();
  const grade = document.getElementById('q-grade').value;
  const qty   = document.getElementById('q-qty').value.trim();
  const required_by = document.getElementById('q-date').value;
  const notes = document.getElementById('q-notes').value.trim();

  if (!name || !phone || !email || !grade || !qty) {
    showErr('quote-err', 'Please fill in all required fields marked with *.'); return;
  }

  const btn = document.querySelector('.quote-form .btn-full');
  setBtnLoading(btn, true, '📋 Send Quotation Request');

  try {
    await API.submitQuote({ name, phone, email, grade, qty: parseInt(qty), required_by, notes });
    ['q-name','q-phone','q-email','q-qty','q-date','q-notes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('q-grade').value = '';
    showSuccess('quote-success', '✅ Quotation request submitted! We will reply within 24 hours.');
  } catch (err) {
    showErr('quote-err', err.message);
  } finally {
    setBtnLoading(btn, false, '📋 Send Quotation Request');
  }
}

/* ============================================================
   ADMIN PANEL
   ============================================================ */
async function loadAdminData() {
  try {
    const [statsData, ordersData, quotesData, customersData] = await Promise.all([
      API.adminStats(),
      API.allOrders(),
      API.allQuotes(),
      API.allCustomers(),
    ]);

    // Stats
    document.getElementById('stat-orders').textContent    = statsData.totalOrders;
    document.getElementById('stat-pending').textContent   = statsData.pendingOrders;
    document.getElementById('stat-quotes').textContent    = statsData.totalQuotes;
    document.getElementById('stat-customers').textContent = statsData.totalCustomers;

    // Orders table
    renderOrdersTable(ordersData.orders);

    // Quotes table
    renderQuotesTable(quotesData.quotes);

    // Customers table
    renderCustomersTable(customersData.customers);

  } catch (err) {
    showToast('Failed to load admin data: ' + err.message);
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state">No orders yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const cls = o.status === 'Pending'    ? 'status-pending'
              : o.status === 'Processing' ? 'status-processing'
              : o.status === 'Delivered'  ? 'status-delivered'
              : 'status-cancelled';
    const fullName = escHtml(o.fname) + ' ' + escHtml(o.lname);
    return `<tr>
      <td><b>#${o.id}</b></td>
      <td>
        <div style="font-weight:700;color:var(--dark-green);">${fullName}</div>
        <div style="font-size:11px;color:var(--text-light);margin-top:2px;">${escHtml(o.customer_email)}</div>
        <div style="font-size:11px;color:var(--text-mid);margin-top:1px;">📞 ${escHtml(o.phone)}</div>
      </td>
      <td><b>${escHtml(o.grade)}</b></td>
      <td>${o.qty} kg</td>
      <td>
        <div>${escHtml(o.address)}</div>
        <div style="font-size:11px;color:var(--text-mid);">${escHtml(o.city)}, ${escHtml(o.state)}</div>
        <div style="font-size:11px;color:var(--text-light);">PIN: ${escHtml(o.pincode)}</div>
      </td>
      <td>${new Date(o.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
      <td>
        <select class="status-select" onchange="changeOrderStatus(${o.id}, this.value)">
          ${['Pending','Processing','Delivered','Cancelled'].map(s =>
            `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function changeOrderStatus(id, status) {
  try {
    await API.updateOrderStatus(id, status);
    showToast('Order #' + id + ' → ' + status);
    // Refresh stats
    const statsData = await API.adminStats();
    document.getElementById('stat-pending').textContent = statsData.pendingOrders;
  } catch (err) {
    showToast('Error: ' + err.message);
  }
}

function renderQuotesTable(quotes) {
  const tbody = document.getElementById('quotes-tbody');
  if (!quotes.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state">No quotation requests yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = quotes.map(q => `<tr>
    <td>#${q.id}</td>
    <td>${escHtml(q.name)}</td>
    <td>${escHtml(q.phone)}</td>
    <td>${escHtml(q.email)}</td>
    <td>${escHtml(q.grade)}</td>
    <td>${q.qty} kg</td>
    <td>${q.required_by ? new Date(q.required_by).toLocaleDateString('en-IN') : '—'}</td>
    <td style="max-width:200px;word-break:break-word;">${q.notes ? escHtml(q.notes) : '—'}</td>
  </tr>`).join('');
}

function renderCustomersTable(customers) {
  const tbody = document.getElementById('customers-tbody');
  if (!customers.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state">No registered customers yet.</div></td></tr>';
    return;
  }
  tbody.innerHTML = customers.map(c => `<tr>
    <td>${c.id}</td>
    <td>${escHtml(c.fname)} ${escHtml(c.lname)}</td>
    <td>${escHtml(c.email)}</td>
    <td>${escHtml(c.phone)}</td>
    <td>${new Date(c.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
    <td>${c.order_count}</td>
  </tr>`).join('');
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('admin-tab-' + tab).classList.add('active');
}

/* ============================================================
   EXPORT TO CSV / EXCEL
   ============================================================ */
async function exportData(type) {
  const btn = event.currentTarget;
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Exporting…';

  try {
    const token = API.getToken();
    const res   = await fetch('/api/export/' + type, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Export failed');
    }

    // Get filename from Content-Disposition header or fallback
    const disposition = res.headers.get('Content-Disposition') || '';
    const match       = disposition.match(/filename="?([^"]+)"?/);
    const filename    = match ? match[1] : type + '_export.csv';

    // Trigger browser download
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅ ' + filename + ' downloaded!');
  } catch (err) {
    showToast('Export failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = origHTML;
  }
}

/* ============================================================
   UTILITY
   ============================================================ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// Close user dropdown when clicking outside
document.addEventListener('click', function (e) {
  const menu = document.getElementById('nav-user-menu');
  if (menu && !menu.contains(e.target)) {
    document.getElementById('user-dropdown').classList.remove('open');
  }
});
