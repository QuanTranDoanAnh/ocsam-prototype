/*
 * Shared shell of the static prototype. Classic script (works from file://), loaded after data.js.
 *
 * A page calls P.frame({...}) once, then writes its content into the returned <main>:
 *   const main = P.frame({ surface: 'office', user: 'accountant', title: 'Danh mục món', nav: 'catalogue' });
 *   main.insertAdjacentHTML('beforeend', `...`);
 *
 * Wiring without per-page code:
 *   <button data-go="cashier-bill.html?table=S4">  navigates (any element)
 *   <button data-open="dlg-cancel">                 shows <dialog id="dlg-cancel"> as a modal
 *   <button data-close>                             closes the dialog it is in
 *   <button data-toast="Đã gửi bếp">                shows a short message (actions that would change data)
 *   <div data-tabs> <button data-tab="a"> … <section data-panel="a">  simple tabs
 * The class names come from the real app (apps/web/src/styles.css, copied into app.css).
 */
window.P = (function () {
  const D = window.OCSAM;

  const money = (n) => (n < 0 ? '-' : '') + Math.abs(Math.round(n)).toLocaleString('vi-VN').replace(/,/g, '.') + 'đ';
  const num = (n) => Math.round(n).toLocaleString('vi-VN').replace(/,/g, '.');
  const qty = (q) => (Number.isInteger(q) ? String(q) : String(q).replace('.', ','));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const param = (name, fallback) => new URLSearchParams(location.search).get(name) ?? fallback;

  const item = (code) => D.items.find((i) => i.code === code);
  const group = (id) => D.groups.find((g) => g.id === id);
  const area = (id) => D.areas.find((a) => a.id === id);
  const table = (id) => D.tables.find((t) => t.id === id);
  const session = (tableId) => D.sessions[tableId];
  const lineAmount = (l) => Math.round(l.qty * l.price);
  /** Live lines (not cancelled) and their total; a bill total subtracts the session's discount. */
  const sessionTotal = (s) => s.lines.filter((l) => l.state !== 'cancelled').reduce((a, l) => a + lineAmount(l), 0);
  const sessionDue = (s) => sessionTotal(s) - (s.discount ? s.discount.amount : 0);

  /** Table states and their words (messages.ts); the tile class is `table-tile table-<state>`. */
  const TABLE_STATE = {
    empty: 'Trống',
    open: 'Đang phục vụ',
    awaiting_payment: 'Chờ thanh toán',
    bill_printed: 'Đã in hóa đơn',
  };

  /** Office sidebar (apps/web/src/surfaces/office/index.tsx): groups, labels and order as in the app. */
  const OFFICE_NAV = [
    ['Thực đơn', [
      ['catalogue', 'Danh mục món', 'office-catalogue.html'],
      ['groups', 'Nhóm món và ghi chú', 'office-groups.html'],
      ['promotions', 'Khuyến mại', 'office-promotions.html'],
      ['cukcukMap', 'Ánh xạ CukCuk', 'office-cukcuk-map.html'],
      ['today', 'Giá hôm nay', 'office-today-prices.html'],
      ['import', 'Nhập từ Excel', 'office-import.html'],
    ]],
    ['Cơ sở', [
      ['premise', 'Thông tin cơ sở', 'office-premise.html'],
      ['areas', 'Khu và bàn', 'office-areas.html'],
      ['floorPlan', 'Sơ đồ bàn', 'office-floor-plan.html'],
      ['printers', 'Trạm in và máy in', 'office-printers.html'],
      ['billSettings', 'Cài đặt hóa đơn', 'office-bill-settings.html'],
      ['devices', 'Thiết bị', 'office-devices.html'],
    ]],
    ['Báo cáo', [
      ['live', 'Trực tiếp', 'office-live.html'],
      ['alerts', 'Cảnh báo', 'office-alerts.html'],
      ['sales', 'Báo cáo bán hàng', 'office-sales.html'],
      ['shifts', 'Ca làm việc', 'office-shifts.html'],
    ]],
    ['Kiểm soát', [
      ['control', 'Báo cáo kiểm soát', 'office-control.html'],
      ['exceptions', 'Báo cáo ngoại lệ', 'office-exceptions.html'],
    ]],
    ['Đối chiếu và chốt ngày', [
      ['rp09', 'Đối chiếu CukCuk (RP-09)', 'office-rp09.html'],
      ['dayClose', 'Chốt ngày', 'office-day-close.html'],
    ]],
    ['Tài khoản', [
      ['accounts', 'Nhân viên', 'office-accounts.html'],
      ['permissions', 'Phân quyền', 'office-permissions.html'],
    ]],
  ];

  /**
   * Draws the app bar (and the office sidebar and breadcrumb) and returns the <main> to fill.
   * opts: surface 'order' | 'cashier' | 'office' | 'handoff'; user: a key of D.users; title; nav (office screen key);
   * crumbs: [{label, href}] (office; default "Văn phòng > title"); noTitle: true when the page draws its own heading.
   */
  function frame(opts) {
    const u = D.users[opts.user];
    const navy = opts.surface !== 'order' && opts.surface !== 'handoff';
    if (navy) document.documentElement.dataset.chrome = 'navy';
    document.title = `${opts.title} · iOcOrder (prototype)`;
    const header = `
      <header class="appbar">
        <div>
          <strong>iOcOrder</strong>
          <p data-testid="who">${esc(u.name)} · ${D.tenant.code} · ${u.role}</p>
        </div>
        <button type="button" class="secondary" data-go="login.html">Đăng xuất</button>
      </header>`;
    let html;
    if (opts.surface === 'office') {
      const sidebar = OFFICE_NAV.map(
        ([g, links]) =>
          `<p class="sidebar-group">${g}</p><ul>${links
            .map(
              ([key, label, href]) =>
                `<li><a href="${href}"${key === opts.nav ? ' aria-current="page"' : ''}>${label}</a></li>`,
            )
            .join('')}</ul>`,
      ).join('');
      const crumbs = opts.crumbs ?? [{ label: 'Văn phòng', href: 'office-catalogue.html' }, { label: opts.title }];
      const crumbHtml = crumbs
        .map((c, i) =>
          i === crumbs.length - 1
            ? `<li aria-current="page">${esc(c.label)}</li>`
            : `<li><a href="${c.href}">${esc(c.label)}</a></li>`,
        )
        .join('');
      html = `${header}
        <div class="console">
          <nav class="sidebar" aria-label="Chức năng văn phòng">${sidebar}</nav>
          <main class="console-main">
            <nav aria-label="Vị trí"><ol class="crumbs">${crumbHtml}</ol></nav>
            ${opts.noTitle ? '' : `<h1>${esc(opts.title)}</h1>`}
          </main>
        </div>`;
    } else {
      html = `${header}<main>${opts.noTitle ? '' : `<h1>${esc(opts.surfaceTitle ?? opts.title)}</h1>`}</main>`;
    }
    document.body.insertAdjacentHTML('afterbegin', html);
    document.body.insertAdjacentHTML(
      'beforeend',
      `<aside class="proto-bar" aria-label="Prototype">
         <span>Prototype tĩnh · dữ liệu mẫu, không lưu thay đổi</span>
         <a href="index.html">Bản đồ màn hình</a>
         <button type="button" class="proto-theme" title="Đổi sáng / tối">◐</button>
       </aside>`,
    );
    return document.querySelector('main');
  }

  function toast(text) {
    let t = document.querySelector('.proto-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'proto-toast';
      t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // One click handler for the whole page, so content added after P.frame is wired too.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-go],[data-open],[data-close],[data-toast],[data-tab],.proto-theme');
    if (!el) return;
    if (el.classList.contains('proto-theme')) {
      const root = document.documentElement;
      const dark = root.dataset.theme === 'dark';
      root.dataset.theme = dark ? 'light' : 'dark';
      localStorage.setItem('proto-theme', root.dataset.theme);
      return;
    }
    if (el.dataset.toast) toast(el.dataset.toast);
    if (el.dataset.open) {
      e.preventDefault();
      document.getElementById(el.dataset.open)?.showModal();
    }
    if (el.hasAttribute('data-close')) {
      e.preventDefault();
      el.closest('dialog')?.close();
    }
    if (el.dataset.tab) {
      const box = el.closest('[data-tabs]');
      box.querySelectorAll('[data-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
      box.querySelectorAll('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== el.dataset.tab));
    }
    if (el.dataset.go) {
      e.preventDefault();
      const go = () => (location.href = el.dataset.go);
      el.dataset.toast ? setTimeout(go, 700) : go();
    }
  });
  const savedTheme = localStorage.getItem('proto-theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  return {
    D, money, num, qty, esc, param, item, group, area, table, session, lineAmount, sessionTotal, sessionDue,
    TABLE_STATE, OFFICE_NAV, frame, toast,
  };
})();
