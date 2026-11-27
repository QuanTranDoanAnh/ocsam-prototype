/*
 * Sample data of the static prototype: one evening at Ốc Sam (business day 27/11/2026).
 * Every page reads from here, so the same table shows the same order on the phone, at the counter and in the office.
 * Money is integer VND, as in the real system (BR-06). Names and phone numbers are invented.
 * Classic script (not a module) so the pages also open from the file system: it defines the global `OCSAM`.
 */
window.OCSAM = (function () {
  const tenant = { code: 'ocsam', legalName: 'Công ty TNHH Ốc Sam', taxCode: '0000000000' };
  const premise = {
    id: 'main',
    code: 'main',
    name: 'Ốc Sam',
    address: '123 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh (địa chỉ mẫu)',
    phone: '028 0000 0000',
    openingTime: '16:00',
    dayCloseTime: '07:00',
    businessDay: '27/11/2026',
    now: '21:40',
  };

  /** Accounts (password in the prototype: any). role is the system role name shown in the app bar. */
  const users = {
    owner: { name: 'Lương Thị Mai', phone: '0900 000 001', role: 'owner', roleLabel: 'Chủ quán' },
    accountant: { name: 'Lê Minh Anh', phone: '0900 000 002', role: 'accountant', roleLabel: 'Kế toán' },
    manager: { name: 'Phạm Quốc Huy', phone: '0900 000 003', role: 'manager', roleLabel: 'Quản lý cơ sở' },
    waiter: { name: 'Nguyễn Văn Tùng', phone: '0900 000 004', role: 'waiter', roleLabel: 'Phục vụ' },
    cashier: { name: 'Võ Thị Hồng', phone: '0900 000 008', role: 'cashier', roleLabel: 'Thu ngân' },
    cukcuk_entry: { name: 'Bùi Thanh Tâm', phone: '0900 000 009', role: 'cukcuk_entry', roleLabel: 'Nhập CukCuk' },
  };
  const staff = [
    { ...users.owner, state: 'Đang làm', premises: 'Tất cả' },
    { ...users.accountant, state: 'Đang làm', premises: 'Tất cả' },
    { ...users.manager, state: 'Đang làm', premises: 'Ốc Sam' },
    { ...users.waiter, state: 'Đang làm', premises: 'Ốc Sam' },
    { name: 'Đỗ Thị Lan', phone: '0900 000 005', role: 'waiter', roleLabel: 'Phục vụ', state: 'Đang làm', premises: 'Ốc Sam' },
    { name: 'Hoàng Minh Khoa', phone: '0900 000 006', role: 'waiter', roleLabel: 'Phục vụ', state: 'Đang làm', premises: 'Ốc Sam' },
    { name: 'Lý Gia Bảo', phone: '0900 000 007', role: 'waiter', roleLabel: 'Phục vụ', state: 'Khóa tại cơ sở', premises: 'Ốc Sam' },
    { ...users.cashier, state: 'Đang làm', premises: 'Ốc Sam' },
    { ...users.cukcuk_entry, state: 'Đang làm', premises: 'Ốc Sam' },
    { name: 'Mai Văn Phúc', phone: '0900 000 010', role: 'waiter', roleLabel: 'Phục vụ', state: 'Đã nghỉ việc', premises: 'Ốc Sam' },
  ];

  const tiers = [
    { code: 'STD', name: 'Giá thường' },
    { code: 'AC', name: 'Phòng lạnh' },
  ];

  const areas = [
    { id: 'san', name: 'Sân trước', tier: 'STD' },
    { id: 'nha', name: 'Trong nhà', tier: 'STD' },
    { id: 'lanh', name: 'Phòng lạnh', tier: 'AC' },
  ];

  /** state as in the app: empty | open | awaiting_payment (payment requested) | bill_printed. session ids point into `sessions`. */
  const tables = [
    { id: 'S1', area: 'san', seats: 4, state: 'awaiting_payment', session: 'S1' },
    { id: 'S2', area: 'san', seats: 4, state: 'empty' },
    { id: 'S3', area: 'san', seats: 6, state: 'open', session: 'S3' },
    { id: 'S4', area: 'san', seats: 4, state: 'bill_printed', session: 'S4' },
    { id: 'S5', area: 'san', seats: 4, state: 'empty' },
    { id: 'S6', area: 'san', seats: 8, state: 'open', session: 'S6' },
    { id: 'T1', area: 'nha', seats: 4, state: 'open', session: 'T1' },
    { id: 'T2', area: 'nha', seats: 4, state: 'empty' },
    { id: 'T3', area: 'nha', seats: 6, state: 'empty' },
    { id: 'T4', area: 'nha', seats: 4, state: 'open', session: 'T4' },
    { id: 'T5', area: 'nha', seats: 2, state: 'empty' },
    { id: 'T6', area: 'nha', seats: 10, state: 'bill_printed', session: 'T6' },
    { id: 'L1', area: 'lanh', seats: 6, state: 'open', session: 'L1' },
    { id: 'L2', area: 'lanh', seats: 6, state: 'empty' },
    { id: 'L3', area: 'lanh', seats: 10, state: 'empty' },
  ];

  const groups = [
    { id: 'oc', name: 'Ốc', notes: ['Cay vừa', 'Không cay', 'Ít bơ'] },
    { id: 'so', name: 'Sò – Nghêu – Hến', notes: ['Không hành', 'Thêm ớt'] },
    { id: 'cua', name: 'Cua – Ghẹ – Tôm', notes: ['Hấp kỹ', 'Rang khô'] },
    { id: 'muc', name: 'Mực', notes: ['Nướng vừa', 'Ít sa tế'] },
    { id: 'lau', name: 'Lẩu', notes: ['Ít chua', 'Thêm bún'] },
    { id: 'them', name: 'Món thêm', notes: ['Ít dầu'] },
    { id: 'bia', name: 'Bia', notes: ['Ướp lạnh', 'Có đá'] },
    { id: 'nuoc', name: 'Nước', notes: ['Ít đá', 'Không đá'] },
  ];

  /** Stations print the kitchen tickets; an item may print at several (BR-04). */
  const stations = [
    { id: 'bep', name: 'Bếp', printer: 'Bếp – Xprinter XP-Q200', ip: '192.168.1.51', status: 'ok' },
    { id: 'nuong', name: 'Nướng', printer: 'Nướng – Epson TM-T82III', ip: '192.168.1.52', status: 'paper' },
    { id: 'bar', name: 'Bar', printer: 'Bar – Xprinter XP-Q200', ip: '192.168.1.53', status: 'ok' },
  ];
  const billPrinter = { name: 'Thu ngân – Epson TM-T82III', ip: '192.168.1.50', status: 'ok' };

  /**
   * code, name, group, unit, kind (food | drink), vat %, std and ac prices (null = no price), stations,
   * market: true for a market price confirmed each day, soldOut, cukcuk: the CukCuk item code (null = not mapped).
   */
  const items = [
    { code: 'OH01', name: 'Ốc hương rang muối ớt', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 135000, ac: 149000, stations: ['bep'], cukcuk: 'OCHUONG-RM' },
    { code: 'OH02', name: 'Ốc hương xào bơ tỏi', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 135000, ac: 149000, stations: ['bep'], cukcuk: 'OCHUONG-BT' },
    { code: 'OL01', name: 'Ốc len xào dừa', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 85000, ac: 94000, stations: ['bep'], cukcuk: 'OCLEN-XD' },
    { code: 'OM01', name: 'Ốc móng tay xào rau muống', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 95000, ac: 105000, stations: ['bep'], cukcuk: 'MONGTAY-RM' },
    { code: 'OB01', name: 'Ốc bươu nhồi thịt hấp sả', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 89000, ac: 98000, stations: ['bep'], cukcuk: 'OCBUOU-NT' },
    { code: 'OG01', name: 'Ốc giác nướng mỡ hành', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 99000, ac: 109000, stations: ['nuong'], cukcuk: 'OCGIAC-NMH' },
    { code: 'OMO1', name: 'Ốc mỡ xào me', group: 'oc', unit: 'đĩa', kind: 'food', vat: 8, std: 75000, ac: 83000, stations: ['bep'], cukcuk: 'OCMO-XM', soldOut: true },
    { code: 'SD01', name: 'Sò điệp nướng mỡ hành', group: 'so', unit: 'đĩa', kind: 'food', vat: 8, std: 89000, ac: 98000, stations: ['nuong'], cukcuk: 'SODIEP-NMH' },
    { code: 'SH01', name: 'Sò huyết rang me', group: 'so', unit: 'đĩa', kind: 'food', vat: 8, std: 109000, ac: 120000, stations: ['bep'], cukcuk: 'SOHUYET-RM' },
    { code: 'SL01', name: 'Sò lông nướng mỡ hành', group: 'so', unit: 'đĩa', kind: 'food', vat: 8, std: 79000, ac: 87000, stations: ['nuong'], cukcuk: 'SOLONG-NMH' },
    { code: 'NG01', name: 'Nghêu hấp sả', group: 'so', unit: 'tô', kind: 'food', vat: 8, std: 69000, ac: 76000, stations: ['bep'], cukcuk: 'NGHEU-HS' },
    { code: 'HE01', name: 'Hến xúc bánh đa', group: 'so', unit: 'đĩa', kind: 'food', vat: 8, std: 65000, ac: 72000, stations: ['bep'], cukcuk: null },
    { code: 'GH01', name: 'Ghẹ hấp bia', group: 'cua', unit: 'kg', kind: 'food', vat: 8, std: 520000, ac: 570000, stations: ['bep'], cukcuk: 'GHE-HB', market: true },
    { code: 'CU01', name: 'Cua rang me', group: 'cua', unit: 'kg', kind: 'food', vat: 8, std: 650000, ac: null, stations: ['bep'], cukcuk: 'CUA-RM', market: true },
    { code: 'TS01', name: 'Tôm sú nướng muối ớt', group: 'cua', unit: 'kg', kind: 'food', vat: 8, std: 590000, ac: 650000, stations: ['nuong'], cukcuk: 'TOMSU-NMO', market: true },
    { code: 'MU01', name: 'Mực nướng sa tế', group: 'muc', unit: 'đĩa', kind: 'food', vat: 8, std: 145000, ac: 160000, stations: ['nuong'], cukcuk: 'MUC-NST' },
    { code: 'MU02', name: 'Mực xào chua ngọt', group: 'muc', unit: 'đĩa', kind: 'food', vat: 8, std: 125000, ac: 138000, stations: ['bep'], cukcuk: 'MUC-XCN' },
    { code: 'LA01', name: 'Lẩu Thái hải sản', group: 'lau', unit: 'nồi', kind: 'food', vat: 8, std: 299000, ac: 329000, stations: ['bep'], cukcuk: 'LAU-THS' },
    { code: 'RM01', name: 'Rau muống xào tỏi', group: 'them', unit: 'đĩa', kind: 'food', vat: 8, std: 45000, ac: 50000, stations: ['bep'], cukcuk: 'RAUMUONG' },
    { code: 'CC01', name: 'Cơm chiên hải sản', group: 'them', unit: 'đĩa', kind: 'food', vat: 8, std: 79000, ac: 87000, stations: ['bep'], cukcuk: 'COMCHIEN-HS' },
    { code: 'BM01', name: 'Bánh mì (chấm sốt)', group: 'them', unit: 'ổ', kind: 'food', vat: 8, std: 5000, ac: 5000, stations: ['bep'], cukcuk: 'BANHMI' },
    { code: 'BT01', name: 'Bia Tiger lon', group: 'bia', unit: 'lon', kind: 'drink', vat: 10, std: 25000, ac: 28000, stations: ['bar'], cukcuk: 'TIGER-LON' },
    { code: 'BH01', name: 'Bia Heineken lon', group: 'bia', unit: 'lon', kind: 'drink', vat: 10, std: 30000, ac: 33000, stations: ['bar'], cukcuk: 'HEINEKEN-LON' },
    { code: 'BS01', name: 'Bia Sài Gòn Special', group: 'bia', unit: 'chai', kind: 'drink', vat: 10, std: 22000, ac: 25000, stations: ['bar'], cukcuk: 'SGSPECIAL' },
    { code: 'NC01', name: 'Coca-Cola lon', group: 'nuoc', unit: 'lon', kind: 'drink', vat: 10, std: 18000, ac: 20000, stations: ['bar'], cukcuk: 'COCA-LON' },
    { code: 'NS01', name: 'Nước suối Aquafina', group: 'nuoc', unit: 'chai', kind: 'drink', vat: 10, std: 12000, ac: 14000, stations: ['bar'], cukcuk: 'AQUAFINA' },
    { code: 'TD01', name: 'Trà đá', group: 'nuoc', unit: 'ly', kind: 'drink', vat: 10, std: 5000, ac: 5000, stations: ['bar'], cukcuk: 'TRADA' },
    { code: 'NS02', name: 'Nước sấu đá', group: 'nuoc', unit: 'ly', kind: 'drink', vat: 10, std: 25000, ac: 28000, stations: ['bar'], cukcuk: null },
  ];

  /** Market prices of today; confirmed = the manager confirmed today's price (FR-07.04). */
  const todayPrices = [
    { code: 'GH01', yesterday: 520000, today: 520000, confirmed: true, by: 'Phạm Quốc Huy', at: '16:05' },
    { code: 'CU01', yesterday: 620000, today: 650000, confirmed: true, by: 'Phạm Quốc Huy', at: '16:07' },
    { code: 'TS01', yesterday: 590000, today: 590000, confirmed: false },
  ];

  /**
   * Open table sessions. lines: item code, qty, price (snapshot at order time, BR-02), round, state
   * (sent | queued | cancelled), note, by (waiter), at (time). qty of a kg item may be a decimal weight.
   */
  const sessions = {
    S1: {
      table: 'S1', guests: 4, openedAt: '19:12', waiter: 'Nguyễn Văn Tùng', order: 'ĐH-0041',
      lines: [
        { code: 'OH01', qty: 1, price: 135000, round: 1, state: 'sent', at: '19:15' },
        { code: 'SD01', qty: 2, price: 89000, round: 1, state: 'sent', at: '19:15', note: 'Không hành' },
        { code: 'BT01', qty: 6, price: 25000, round: 1, state: 'sent', at: '19:15', note: 'Ướp lạnh' },
        { code: 'MU01', qty: 1, price: 145000, round: 2, state: 'sent', at: '20:02' },
        { code: 'RM01', qty: 1, price: 45000, round: 2, state: 'sent', at: '20:02' },
        { code: 'BT01', qty: 6, price: 25000, round: 3, state: 'sent', at: '20:48' },
      ],
    },
    S3: {
      table: 'S3', guests: 6, openedAt: '19:40', waiter: 'Đỗ Thị Lan', order: 'ĐH-0044',
      lines: [
        { code: 'LA01', qty: 1, price: 299000, round: 1, state: 'sent', at: '19:43' },
        { code: 'OL01', qty: 2, price: 85000, round: 1, state: 'sent', at: '19:43' },
        { code: 'SH01', qty: 1, price: 109000, round: 1, state: 'cancelled', at: '19:43', cancelReason: 'Khách đổi món' },
        { code: 'SL01', qty: 2, price: 79000, round: 1, state: 'sent', at: '19:43' },
        { code: 'BH01', qty: 10, price: 30000, round: 1, state: 'sent', at: '19:43' },
        { code: 'OG01', qty: 1, price: 99000, round: 2, state: 'queued', at: '21:38' },
      ],
    },
    S4: {
      table: 'S4', guests: 4, openedAt: '18:30', waiter: 'Nguyễn Văn Tùng', order: 'ĐH-0036', bill: 'HĐ-0029',
      lines: [
        { code: 'OH02', qty: 1, price: 135000, round: 1, state: 'sent', at: '18:33' },
        { code: 'OM01', qty: 1, price: 95000, round: 1, state: 'sent', at: '18:33' },
        { code: 'NG01', qty: 1, price: 69000, round: 1, state: 'sent', at: '18:33' },
        { code: 'BS01', qty: 8, price: 22000, round: 1, state: 'sent', at: '18:33' },
        { code: 'CC01', qty: 1, price: 79000, round: 2, state: 'sent', at: '19:20' },
      ],
    },
    S6: {
      table: 'S6', guests: 8, openedAt: '20:05', waiter: 'Hoàng Minh Khoa', order: 'ĐH-0047',
      lines: [
        { code: 'GH01', qty: 1.2, price: 520000, round: 1, state: 'sent', at: '20:09' },
        { code: 'TS01', qty: 0.8, price: 590000, round: 1, state: 'sent', at: '20:09' },
        { code: 'OB01', qty: 2, price: 89000, round: 1, state: 'sent', at: '20:09' },
        { code: 'BT01', qty: 12, price: 25000, round: 1, state: 'sent', at: '20:09' },
        { code: 'BM01', qty: 6, price: 5000, round: 2, state: 'sent', at: '20:40' },
      ],
    },
    T1: {
      table: 'T1', guests: 2, openedAt: '20:50', waiter: 'Đỗ Thị Lan', order: 'ĐH-0049',
      lines: [
        { code: 'OL01', qty: 1, price: 85000, round: 1, state: 'sent', at: '20:52' },
        { code: 'NC01', qty: 2, price: 18000, round: 1, state: 'sent', at: '20:52', note: 'Ít đá' },
      ],
    },
    T4: {
      table: 'T4', guests: 4, openedAt: '21:15', waiter: 'Nguyễn Văn Tùng', order: 'ĐH-0051',
      lines: [
        { code: 'MU02', qty: 1, price: 125000, round: 1, state: 'sent', at: '21:17' },
        { code: 'SD01', qty: 1, price: 89000, round: 1, state: 'sent', at: '21:17' },
        { code: 'TD01', qty: 4, price: 5000, round: 1, state: 'sent', at: '21:17' },
      ],
    },
    T6: {
      table: 'T6', guests: 10, openedAt: '18:10', waiter: 'Hoàng Minh Khoa', order: 'ĐH-0033', bill: 'HĐ-0031',
      discount: { programme: 'SINHNHAT10', name: 'Sinh nhật giảm 10% hóa đơn', amount: 124700 },
      lines: [
        { code: 'LA01', qty: 2, price: 299000, round: 1, state: 'sent', at: '18:14' },
        { code: 'OH01', qty: 2, price: 135000, round: 1, state: 'sent', at: '18:14' },
        { code: 'SL01', qty: 1, price: 79000, round: 1, state: 'sent', at: '18:14' },
        { code: 'BT01', qty: 12, price: 25000, round: 2, state: 'sent', at: '19:05' },
      ],
    },
    L1: {
      table: 'L1', guests: 5, openedAt: '20:20', waiter: 'Hoàng Minh Khoa', order: 'ĐH-0048',
      lines: [
        { code: 'CU01', qty: 1.1, price: 650000, round: 1, state: 'sent', at: '20:24' },
        { code: 'OH01', qty: 1, price: 149000, round: 1, state: 'sent', at: '20:24' },
        { code: 'SD01', qty: 2, price: 98000, round: 1, state: 'sent', at: '20:24' },
        { code: 'BH01', qty: 8, price: 33000, round: 1, state: 'sent', at: '20:24' },
        { code: 'NS02', qty: 2, price: 28000, round: 2, state: 'sent', at: '21:02' },
      ],
    },
  };

  /** Bills of the day (lookup, reprint, reopen, cancel). method: cash | transfer | card; state: paid | printed | cancelled. */
  const bills = [
    { no: 'HĐ-0024', table: 'T2', at: '18:52', total: 486000, method: 'cash', state: 'paid', cashier: 'Võ Thị Hồng', copies: 1 },
    { no: 'HĐ-0025', table: 'S2', at: '19:05', total: 1128000, method: 'transfer', state: 'paid', cashier: 'Võ Thị Hồng', copies: 1 },
    { no: 'HĐ-0026', table: 'T3', at: '19:31', total: 734000, method: 'card', state: 'paid', cashier: 'Võ Thị Hồng', copies: 2 },
    { no: 'HĐ-0027', table: 'S5', at: '19:58', total: 392000, method: 'cash', state: 'cancelled', cashier: 'Võ Thị Hồng', copies: 1, note: 'Hủy: in nhầm bàn, đã lập lại HĐ-0028' },
    { no: 'HĐ-0028', table: 'S5', at: '20:01', total: 392000, method: 'transfer', state: 'paid', cashier: 'Võ Thị Hồng', copies: 1 },
    { no: 'HĐ-0029', table: 'S4', at: '21:22', total: 554000, method: null, state: 'printed', cashier: 'Võ Thị Hồng', copies: 1 },
    { no: 'HĐ-0030', table: 'L2', at: '21:25', total: 1386000, method: 'cash', state: 'paid', cashier: 'Võ Thị Hồng', copies: 1 },
    { no: 'HĐ-0031', table: 'T6', at: '21:30', total: 1122300, method: null, state: 'printed', cashier: 'Võ Thị Hồng', copies: 1 },
  ];

  const bank = { name: 'Vietcombank', account: '0000 0000 00000', holder: 'CONG TY TNHH OC SAM' };

  /** Promotion catalogue (FR-05). kind as shown in the office. */
  const promotions = [
    { code: 'SINHNHAT10', name: 'Sinh nhật giảm 10% hóa đơn', kind: 'Phần trăm cả hóa đơn', value: '10%', from: '01/11/2026', to: '31/12/2026', active: true },
    { code: 'HAPPYBIA', name: 'Happy hour bia 16:00–18:00 giảm 15%', kind: 'Phần trăm theo nhóm món (Bia)', value: '15%', from: '01/10/2026', to: '31/12/2026', active: true },
    { code: 'RAUFREE', name: 'Bàn từ 6 khách tặng rau muống xào', kind: 'Tặng món', value: 'Rau muống xào tỏi', from: '15/11/2026', to: '15/12/2026', active: true },
    { code: 'KHACHQUEN50', name: 'Khách quen giảm 50.000đ', kind: 'Số tiền cả hóa đơn', value: '50.000đ', from: '01/09/2026', to: '30/11/2026', active: true },
    { code: 'KHAITRUONG', name: 'Khai trương giảm 20%', kind: 'Phần trăm cả hóa đơn', value: '20%', from: '01/06/2026', to: '30/06/2026', active: false },
  ];

  /** CukCuk entry queue (S16): paid bills the clerk enters into CukCuk. */
  const cukcukQueue = [
    { bill: 'HĐ-0024', table: 'T2', paidAt: '18:55', total: 486000, state: 'entered', invoice: 'CK-112045', by: 'Bùi Thanh Tâm' },
    { bill: 'HĐ-0025', table: 'S2', paidAt: '19:08', total: 1128000, state: 'entered', invoice: 'CK-112046', by: 'Bùi Thanh Tâm' },
    { bill: 'HĐ-0026', table: 'T3', paidAt: '19:35', total: 734000, state: 'entered', invoice: 'CK-112047', by: 'Bùi Thanh Tâm' },
    { bill: 'HĐ-0027', table: 'S5', paidAt: '19:58', total: -392000, state: 'adjust', note: 'Hóa đơn đã hủy: điều chỉnh trên CukCuk' },
    { bill: 'HĐ-0028', table: 'S5', paidAt: '20:03', total: 392000, state: 'held', note: 'Chờ khách xác nhận tên công ty xuất hóa đơn' },
    { bill: 'HĐ-0030', table: 'L2', paidAt: '21:28', total: 1386000, state: 'waiting', late: false },
  ];

  /**
   * Remote approval requests (S11): in the app only cancellations ask approvers on shift remotely
   * (a printed line, or the whole table). A3 is the approved request behind the cancelled line of S3.
   */
  const approvals = [
    { id: 'A1', kind: 'Hủy món đã in', table: 'S3', detail: 'Sò lông nướng mỡ hành × 1 (79.000đ)', reason: 'Khách không dùng được', by: 'Đỗ Thị Lan', at: '21:37', state: 'waiting' },
    { id: 'A2', kind: 'Hủy món đã in', table: 'L1', detail: 'Sò điệp nướng mỡ hành × 1 (98.000đ)', reason: 'Món ra chậm, khách không dùng', by: 'Hoàng Minh Khoa', at: '21:39', state: 'waiting' },
    { id: 'A3', kind: 'Hủy món đã in', table: 'S3', detail: 'Sò huyết rang me × 1 (109.000đ)', reason: 'Khách đổi món', by: 'Đỗ Thị Lan', at: '21:34', state: 'approved', approver: 'Phạm Quốc Huy' },
  ];

  /** Kitchen send history (S04): one row per ticket. */
  const tickets = [
    { at: '21:38', table: 'S3', station: 'Nướng', kind: 'Gọi món', items: 'Ốc giác nướng mỡ hành × 1', state: 'queued', cause: 'Máy in Nướng hết giấy' },
    { at: '21:36', table: 'S3', station: 'Bếp', kind: 'Hủy món', items: 'Sò huyết rang me × 1', state: 'printed' },
    { at: '21:17', table: 'T4', station: 'Bếp', kind: 'Gọi món', items: 'Mực xào chua ngọt × 1, Sò điệp nướng mỡ hành × 1', state: 'printed' },
    { at: '21:17', table: 'T4', station: 'Bar', kind: 'Gọi món', items: 'Trà đá × 4', state: 'printed' },
    { at: '21:02', table: 'L1', station: 'Bar', kind: 'Gọi món', items: 'Nước sấu đá × 2', state: 'printed' },
    { at: '20:52', table: 'T1', station: 'Bếp', kind: 'Gọi món', items: 'Ốc len xào dừa × 1', state: 'printed' },
    { at: '20:48', table: 'S1', station: 'Bar', kind: 'Gọi món', items: 'Bia Tiger lon × 6', state: 'printed' },
    { at: '20:31', table: 'S6 → T5', station: 'Bếp', kind: 'Chuyển bàn', items: 'Chuyển cả bàn', state: 'printed' },
  ];

  /** Registered devices (S06). */
  const devices = [
    { name: 'iPhone 13 – Tùng', kind: 'Điện thoại phục vụ', paired: '02/11/2026', lastSeen: '21:39', state: 'active' },
    { name: 'iPhone 12 – Lan', kind: 'Điện thoại phục vụ', paired: '02/11/2026', lastSeen: '21:38', state: 'active' },
    { name: 'Samsung A54 – Khoa', kind: 'Điện thoại phục vụ', paired: '05/11/2026', lastSeen: '21:40', state: 'active' },
    { name: 'Máy tính quầy thu ngân', kind: 'Máy quầy', paired: '01/11/2026', lastSeen: '21:40', state: 'active' },
    { name: 'iPad quản lý', kind: 'Máy tính bảng', paired: '01/11/2026', lastSeen: '21:12', state: 'active' },
    { name: 'iPhone 8 cũ', kind: 'Điện thoại phục vụ', paired: '01/11/2026', lastSeen: '12/11/2026', state: 'revoked' },
  ];

  /** Premise health (S22, S27). */
  const health = {
    sync: { state: 'ok', lagSeconds: 4, lastPush: '21:40:12' },
    disk: { state: 'ok', freePercent: 62 },
    copy: { state: 'ok', last: '21:30', ageMinutes: 10 },
    printers: [
      { name: 'Bếp', state: 'ok', text: 'Sẵn sàng' },
      { name: 'Nướng', state: 'fault', text: 'Hết giấy – thay cuộn giấy 80 mm rồi đóng nắp' },
      { name: 'Bar', state: 'ok', text: 'Sẵn sàng' },
      { name: 'Thu ngân', state: 'ok', text: 'Sẵn sàng' },
    ],
  };

  /** Shifts (S28). */
  const shifts = [
    { name: 'Ca chiều', from: '16:00', to: '22:00', cashier: 'Võ Thị Hồng', opened: '15:52', closed: null, opening: 2000000, bills: 18, revenue: 14820000 },
    { name: 'Ca tối', from: '22:00', to: '03:00', cashier: null, opened: null, closed: null, opening: null, bills: 0, revenue: 0 },
  ];

  /** Sales of the last 7 business days (RP-01a) and today by group (RP-04). */
  const salesByDay = [
    { day: '21/11', bills: 61, guests: 214, revenue: 38450000, discount: 1210000 },
    { day: '22/11', bills: 74, guests: 268, revenue: 47920000, discount: 1580000 },
    { day: '23/11', bills: 69, guests: 241, revenue: 44310000, discount: 990000 },
    { day: '24/11', bills: 48, guests: 162, revenue: 29870000, discount: 640000 },
    { day: '25/11', bills: 52, guests: 177, revenue: 32150000, discount: 820000 },
    { day: '26/11', bills: 57, guests: 196, revenue: 35680000, discount: 1050000 },
    { day: '27/11', bills: 31, guests: 109, revenue: 21940000, discount: 582300, partial: true },
  ];
  const salesByGroup = [
    { group: 'Ốc', qty: 96, revenue: 9420000 },
    { group: 'Sò – Nghêu – Hến', qty: 58, revenue: 4710000 },
    { group: 'Cua – Ghẹ – Tôm', qty: 14.6, revenue: 8530000 },
    { group: 'Mực', qty: 22, revenue: 3010000 },
    { group: 'Lẩu', qty: 9, revenue: 2750000 },
    { group: 'Món thêm', qty: 41, revenue: 1480000 },
    { group: 'Bia', qty: 312, revenue: 8340000 },
    { group: 'Nước', qty: 87, revenue: 1260000 },
  ];
  const topItems = [
    { code: 'BT01', qty: 186, revenue: 4650000 },
    { code: 'OH01', qty: 31, revenue: 4185000 },
    { code: 'GH01', qty: 7.4, revenue: 3848000 },
    { code: 'BH01', qty: 104, revenue: 3120000 },
    { code: 'SD01', qty: 29, revenue: 2581000 },
  ];

  /** Control reports (RP-02 cancellations, RP-03 discounts) and the morning exception report (S29). */
  const cancellations = [
    { at: '21:36', table: 'S3', item: 'Sò huyết rang me', qty: 1, amount: 109000, printed: true, reason: 'Khách đổi món', by: 'Đỗ Thị Lan', approver: 'Phạm Quốc Huy' },
    { at: '20:14', table: 'S6', item: 'Bia Tiger lon', qty: 2, amount: 50000, printed: false, reason: 'Gọi nhầm', by: 'Hoàng Minh Khoa', approver: null },
    { at: '19:22', table: 'T3', item: 'Lẩu Thái hải sản', qty: 1, amount: 299000, printed: true, reason: 'Món ra chậm, khách không dùng', by: 'Nguyễn Văn Tùng', approver: 'Lương Thị Mai' },
  ];
  const discounts = [
    { at: '21:29', bill: 'HĐ-0031', table: 'T6', programme: 'SINHNHAT10', amount: 124700, inCatalogue: true, by: 'Võ Thị Hồng' },
    { at: '19:03', bill: 'HĐ-0025', table: 'S2', programme: 'KHACHQUEN50', amount: 50000, inCatalogue: true, by: 'Võ Thị Hồng' },
    { at: '18:50', bill: 'HĐ-0024', table: 'T2', programme: null, amount: 40000, inCatalogue: false, reason: 'Khách quen của chủ quán', by: 'Phạm Quốc Huy' },
  ];
  const priceEdits = [
    { at: '16:07', item: 'Cua rang me', from: 620000, to: 650000, kind: 'Xác nhận giá thời giá', by: 'Phạm Quốc Huy', flagged: false },
    { at: '15:40', item: 'Ốc hương rang muối ớt', from: 129000, to: 135000, kind: 'Sửa giá thường', by: 'Lê Minh Anh', flagged: true },
  ];

  /** Alerts (S25) and their routes. */
  const alerts = [
    { at: '21:38', kind: 'Máy in lỗi', text: 'Máy in Nướng hết giấy, 1 phiếu đang chờ', level: 'fault', to: 'Quản lý cơ sở', state: 'open' },
    { at: '21:30', kind: 'Giá chưa xác nhận', text: 'Tôm sú nướng muối ớt chưa xác nhận giá hôm nay', level: 'warn', to: 'Quản lý cơ sở', state: 'open' },
    { at: '20:10', kind: 'Mất kết nối trung tâm', text: 'Cơ sở mất kết nối 6 phút, đã gửi bù đủ', level: 'warn', to: 'Chủ quán, Kế toán', state: 'resolved' },
    { at: '07:02', kind: 'Sao lưu trung tâm', text: 'Bản sao lưu 07:00 hoàn tất (412 MB)', level: 'ok', to: 'Chủ quán', state: 'resolved' },
  ];
  const alertRoutes = [
    { kind: 'Máy in lỗi', roles: ['Quản lý cơ sở'], grace: '2 phút', repeat: 'Mỗi giờ' },
    { kind: 'Mất kết nối trung tâm', roles: ['Chủ quán', 'Kế toán'], grace: '5 phút', repeat: 'Mỗi giờ' },
    { kind: 'Ổ đĩa sắp đầy', roles: ['Chủ quán'], grace: '0 phút', repeat: 'Mỗi giờ' },
    { kind: 'Sao lưu thất bại', roles: ['Chủ quán', 'Kế toán'], grace: '15 phút', repeat: 'Mỗi giờ' },
    { kind: 'Giá chưa xác nhận', roles: ['Quản lý cơ sở'], grace: '30 phút', repeat: 'Mỗi giờ' },
  ];

  /** Day close (S17) and RP-09 reconciliation. */
  const dayCloses = [
    { day: '26/11/2026', closedAt: '07:00', bills: 57, revenue: 35680000, cukcukRevenue: 35680000, diff: 0, state: 'Khớp' },
    { day: '25/11/2026', closedAt: '07:00', bills: 52, revenue: 32150000, cukcukRevenue: 32098000, diff: -52000, state: 'Lệch' },
    { day: '24/11/2026', closedAt: '07:00', bills: 48, revenue: 29870000, cukcukRevenue: 29870000, diff: 0, state: 'Khớp' },
  ];

  return {
    tenant, premise, users, staff, tiers, areas, tables, groups, stations, billPrinter, items, todayPrices,
    sessions, bills, bank, promotions, cukcukQueue, approvals, tickets, devices, health, shifts,
    salesByDay, salesByGroup, topItems, cancellations, discounts, priceEdits, alerts, alertRoutes, dayCloses,
  };
})();
