const SUPABASE_URL="https://wwiovsfkmymwkvxaehkh.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3aW92c2ZrbXltd2t2eGFlaGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNTE0MjEsImV4cCI6MjEwNjkyNzQyMX0.gEo2azUF1x3gwVG7h8NCDop_ZdjUl41viisIWcK8eI4";
const TABLE_NAME="absensi_v2";
const supa=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=id=>document.getElementById(id);

let toastTimer;
const toast=(m,ms=2500)=>{const t=$("toast");clearTimeout(toastTimer);t.textContent=m;t.classList.add("show");toastTimer=setTimeout(()=>t.classList.remove("show"),ms);};
const openL=()=>{document.body.classList.add("login-open");$("loginModal").classList.add("show");};
const closeL=()=>{document.body.classList.remove("login-open");$("loginModal").classList.remove("show");};
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

let all=[],role="visit",canEdit=false,currentEmail="",isSyncing=false,hasShown=false,selectMode=false;
const selected=new Set();

function maskEmail(e){
  const [u,d]=String(e||"").split("@");
  if(!d)return "***";
  return u.charAt(0)+"*".repeat(Math.max(3,u.length-1))+"@"+d;
}

/* ================= KONFIG MAPEL ================= */
const PAK="PENDIDIKAN AGAMA KRISTEN (PAK)";
const KONFIG_KELAS={
"X E":{mapel:{"KIMIA":"PUJI SUSANTI, S.Pd","BAHASA INGGRIS":"YUNI PUSPITASARI, S.Pd","SENI BUDAYA":"ACI WINARTI, S.Pd.I","SOSIOLOGI":"DESWA YODI EKA PUTRA, S.Pd","BAHASA INDONESIA":"SUNARNI, S.Pd","GEOGRAFI":"DESWA YODI EKA PUTRA, S.Pd","BUDAYA MELAYU RIAU (BMR)":"IRZA LIANA PITRI, S.Sos","MATEMATIKA":"MERI ANDAYANI, S.Pd","BIOLOGI":"FAUZUL AZMI, S.Sos","SEJARAH":"ROSELA, S.H","PENDIDIKAN JASMANI, OLAHRAGA dan KESEHATAN (PJOK)":"BONIKA, S.Pd","FISIKA":"PUJI SUSANTI, S.Pd","PENDIDIKAN PANCASILA dan KEWARGANEGARAAN (PPKn)":"ROSELA, S.H","TEKNIK INFORMASI dan KOMUNIKASI (TIK)":"FAUZUL AZMI, S.Sos","PENDIDIKAN AGAMA ISLAM (PAI)":"ACI WINARTI, S.Pd.I","EKONOMI":"ANITA SAPUTRI, S.E"}},
"XI F":{mapel:{"SEJARAH":"ROSELA, S.H","EKONOMI":"ANITA SAPUTRI, S.E","SENI BUDAYA":"SUNARNI, S.Pd","MATEMATIKA TINGKAT LANJUT (MTL)":"MERI ANDAYANI, S.Pd","PENDIDIKAN JASMANI, OLAHRAGA dan KESEHATAN (PJOK)":"BONIKA, S.Pd","PENDIDIKAN AGAMA ISLAM (PAI)":"ACI WINARTI, S.Pd.I","MATEMATIKA WAJIB":"MERI ANDAYANI, S.Pd","PRAKARYA":"SUNARNI, S.Pd","BAHASA INDONESIA":"ANITA SAPUTRI, S.E","PENDIDIKAN PANCASILA dan KEWARGANEGARAAN (PPKn)":"ROSELA, S.H","BAHASA INGGRIS":"YUNI PUSPITASARI, S.Pd","BIOLOGI":"FAUZUL AZMI, S.Sos","SOSIOLOGI":"DESWA YODI EKA PUTRA, S.Pd","BUDAYA MELAYU RIAU (BMR)":"IRZA LIANA PITRI, S.Sos"}},
"XII MIPA":{mapel:{"SEJARAH INDONESIA":"FAUZUL AZMI, S.Sos","MATEMATIKA PEMINATAN (MTK PM)":"MERI ANDAYANI, S.Pd","PENDIDIKAN PANCASILA dan KEWARGANEGARAAN (PPKn)":"ROSELA, S.H","BAHASA INDONESIA":"ANITA SAPUTRI, S.E","BIOLOGI":"IRZA LIANA PITRI, S.Sos","FISIKA":"PUJI SUSANTI, S.Pd","SENI BUDAYA":"SUNARNI, S.Pd","KIMIA":"PUJI SUSANTI, S.Pd","SOSIOLOGI":"DESWA YODI EKA PUTRA, S.Pd","PENDIDIKAN JASMANI, OLAHRAGA dan KESEHATAN (PJOK)":"BONIKA, S.Pd","PENDIDIKAN AGAMA ISLAM (PAI)":"ACI WINARTI, S.Pd.I","BAHASA INGGRIS":"YUNI PUSPITASARI, S.Pd","MATEMATIKA WAJIB":"MERI ANDAYANI, S.Pd","PRAKARYA":"SUNARNI, S.Pd","BUDAYA MELAYU RIAU (BMR)":"IRZA LIANA PITRI, S.Sos"}}
};
function getKelasAktif(){return $("fKelas").value||"";}
function getMapelGuruAktif(){const k=getKelasAktif();if(k&&KONFIG_KELAS[k])return KONFIG_KELAS[k].mapel;let g={};Object.values(KONFIG_KELAS).forEach(x=>Object.assign(g,x.mapel));return g;}
function getGuruMapelAktif(){const mg=getMapelGuruAktif();let gm={};Object.entries(mg).forEach(([m,g])=>{if(!gm[g])gm[g]=[];gm[g].push(m);});return gm;}
let MAPEL_GURU=getMapelGuruAktif(),GURU_MAPEL=getGuruMapelAktif();
function isiAwal(){
  MAPEL_GURU=getMapelGuruAktif();GURU_MAPEL=getGuruMapelAktif();
  const selM=$("fMapel"),selG=$("fGuru");
  selM.innerHTML='<option value="">Semua Mapel</option>';selG.innerHTML='<option value="">Semua Guru</option>';
  Object.keys(MAPEL_GURU).sort().forEach(m=>{const o=document.createElement("option");o.value=m;o.textContent=m;selM.appendChild(o);});
  const oPak=document.createElement("option");oPak.value=PAK;oPak.textContent=PAK;oPak.disabled=true;selM.appendChild(oPak);
  Object.keys(GURU_MAPEL).sort().forEach(g=>{const o=document.createElement("option");o.value=g;o.textContent=g;selG.appendChild(o);});
}
function onKelasChange(){isiAwal();hasShown=false;renderStats([]);render();$("infoFilter").textContent="Pilih filter lalu klik Tampilkan";}
function onFilterTyping(){if(hasShown){$("infoFilter").textContent="Filter berubah, klik Tampilkan lagi";}}

/* ================= TANGGAL & STATUS ================= */
const HARI=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const BULAN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
function labelTanggal(iso){const d=new Date(iso+"T00:00:00");return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;}
function normalStatus(s){if(!s)return "-";s=s.toString().trim().toLowerCase();if(["alpha","alfa","alpa","a"].includes(s))return "Alfa";if(["hadir","h"].includes(s))return "Hadir";if(["izin","ijin","i"].includes(s))return "Izin";if(["sakit","s"].includes(s))return "Sakit";return s.charAt(0).toUpperCase()+s.slice(1);}
function parseTanggalToISO(tgl){if(!tgl)return "";tgl=tgl.toString().trim();if(/^\d{4}-\d{2}-\d{2}$/.test(tgl))return tgl;const bm={januari:'01',februari:'02',maret:'03',april:'04',mei:'05',juni:'06',juli:'07',agustus:'08',september:'09',oktober:'10',november:'11',desember:'12'};const m=tgl.toLowerCase().match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})/);if(m)return `${m[3]}-${bm[m[2]]}-${String(m[1]).padStart(2,'0')}`;const d=new Date(tgl);if(!isNaN(d))return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;return "";}
function isoOf(x){return x.tgl||parseTanggalToISO(x.tanggal);}
function formatTanggalCantik(tgl){const iso=parseTanggalToISO(tgl);if(!iso)return tgl||"-";const d=new Date(iso+"T00:00:00");if(isNaN(d))return tgl;const hari=["Minggu","Senin","Selasa","Rabu","Kamis","Jum'at","Sabtu"][d.getDay()];return `${hari}, ${String(d.getDate()).padStart(2,'0')} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;}
function formatJamCantik(jam){if(!jam)return "-";return jam.toString().replace(/ WIB/gi,"").trim().replaceAll(".",":")+" WIB";}
function onDateChange(){const el=$("fTanggal"),w=$("dateWrap");w.classList.toggle("has-value",!!el.value);onFilterTyping();}

/* ================= AUTH ================= */
function setAuthUI(isLogin,r="visit"){
  role=r;canEdit=isLogin&&(r==="guru"||r==="developer");
  $("dashData").classList.toggle("hidden",!isLogin);
  $("adminArea").classList.toggle("hidden",!canEdit);
  $("btnLogin").classList.toggle("hidden",isLogin);
  $("btnLogout").classList.toggle("hidden",!isLogin);
  document.querySelectorAll(".onlyEditor").forEach(el=>el.classList.toggle("hidden",!canEdit));
  if(selectMode&&!canEdit)setSelectMode(false);
  if(isLogin){
    const b=r==="developer"?`<span class="roleBadge role-dev">🧑🏻‍💻 DEV</span>`:r==="guru"?`<span class="roleBadge role-guru">👨‍🏫 GURU</span>`:`<span class="roleBadge role-visit">👀 VISIT</span>`;
    $("headerDesc").innerHTML=`mode ${b} - ${escapeHtml(maskEmail(currentEmail))}`;
  }else{$("headerDesc").textContent="Login untuk akses data";}
}
function bersihUI(){
  currentEmail="";setAuthUI(false);all=[];hasShown=false;selected.clear();
  renderStats([]);render();
}
function roleDari(user){const r=user?.app_metadata?.role;return ["developer","guru","visit"].includes(r)?r:"visit";}
function mulaiSesi(user){
  currentEmail=user.email;
  setAuthUI(true,roleDari(user));
  load();
  if(canEdit)muatPengaturan();
}
async function login(){
  const e=$("email").value.trim(),p=$("pass").value.trim(),errBox=$("eLogin");
  const warn=m=>{errBox.textContent=m;errBox.style.display="block";setTimeout(()=>errBox.style.display="none",3000)};
  if(!e||!p)return warn("Email & password wajib");
  errBox.textContent="⏳ Memeriksa...";errBox.style.display="block";
  const {data,error}=await supa.auth.signInWithPassword({email:e,password:p});
  if(error){warn("❌ Salah! "+error.message);return;}
  errBox.style.display="none";closeL();$("email").value="";$("pass").value="";
  mulaiSesi(data.user);
  const r=roleDari(data.user);
  toast(r==="developer"?"🧑🏻‍💻 Developer":r==="guru"?"👨‍🏫 Guru":"👀 Visit (hanya lihat)");
}
async function logout(){await supa.auth.signOut();bersihUI();}
$("pass").addEventListener("keydown",e=>{if(e.key==="Enter")login();});
supa.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&currentEmail)bersihUI();});

/* ================= LOAD DATA (semua halaman, bukan hanya 1000) ================= */
async function load(keep=false){
  let rows=[],from=0;const step=1000;
  while(true){
    const {data,error}=await supa.from(TABLE_NAME).select("*")
      .order("created_at",{ascending:false}).order("id",{ascending:false}).range(from,from+step-1);
    if(error){
      if(/jwt|expired/i.test(error.message)){toast("Sesi habis, silakan login ulang");logout();}
      else toast("Gagal load: "+error.message);
      return;
    }
    rows=rows.concat(data||[]);
    if(!data||data.length<step)break;
    from+=step;
  }
  all=rows;
  const ada=new Set(all.map(x=>String(x.id)));
  [...selected].forEach(i=>{if(!ada.has(i))selected.delete(i);});
  if(keep&&hasShown){renderStats(getFiltered());render();}
  else{hasShown=false;renderStats([]);render();toast(`📥 ${all.length} data siap, klik Tampilkan`);}
}

function renderStats(filtered){
  const d=filtered||[];
  ["Hadir","Izin","Sakit","Alfa"].forEach(s=>{$("c"+s).textContent=d.filter(x=>normalStatus(x.status)===s).length;});
}

function getFiltered(){
  let d=[...all];
  if($("fKelas").value)d=d.filter(x=>(x.kelas||"")===$("fKelas").value);
  if($("fNama").value)d=d.filter(x=>x.nama?.toLowerCase().includes($("fNama").value.toLowerCase()));
  if($("fStatus").value)d=d.filter(x=>normalStatus(x.status)===normalStatus($("fStatus").value));
  if($("fMapel").value&&!$("fMapel").value.includes("PAK"))d=d.filter(x=>(x.mapel||"")===$("fMapel").value);
  if($("fGuru").value)d=d.filter(x=>(x.guru||"")===$("fGuru").value);
  if($("fTanggal").value){const p=$("fTanggal").value;d=d.filter(x=>isoOf(x)===p);}
  d.sort((a,b)=>(a.nama||"").toLowerCase().localeCompare((b.nama||"").toLowerCase()));
  return d;
}

function tampilkanData(){
  const f=getFiltered();hasShown=true;
  renderStats(f);render();
  toast(`✅ Menampilkan ${f.length} data`);
}

/* ================= RENDER TABEL ================= */
const opsi=(list,cur)=>{
  const l=[...list];if(cur&&cur!=="-"&&!l.includes(cur))l.unshift(cur);
  return `<option value="">-</option>`+l.map(v=>`<option ${v===cur?"selected":""}>${escapeHtml(v)}</option>`).join("");
};

function barisHtml(x){
  const id=String(x.id),st=normalStatus(x.status),iso=isoOf(x);
  const tglC=formatTanggalCantik(iso||x.tanggal),jamC=formatJamCantik(x.jam);
  const jamIn=x.jam?x.jam.toString().substring(0,5).replace(".",":"):"";
  const mapel=x.mapel||"-",guru=x.guru||"-",ket=x.keterangan||"";
  const eid=escapeHtml(id);
  const ck=`<td class="ckCol"><input type="checkbox" class="rowCk" data-id="${eid}" ${selected.has(id)?"checked":""}></td>`;

  if(!canEdit){
    const ketTxt=st==="Izin"?(ket?escapeHtml(ket):'<i style="color:#9a8fb0">(tanpa keterangan)</i>'):"-";
    return `<tr data-id="${eid}">${ck}<td class="namaCell"><b>${escapeHtml(x.nama)}</b><br><small>${escapeHtml(x.kelas||"")}</small></td><td><span class="badge ${escapeHtml(st)}">${escapeHtml(st)}</span></td><td><span class="badge badge-guru">${escapeHtml(guru)}</span></td><td><span class="badge badge-mapel">${escapeHtml(mapel)}</span></td><td>${tglC}</td><td>${jamC}</td><td class="ketCell">${ketTxt}</td><td>-</td></tr>`;
  }

  const ketCell=st==="Izin"
    ?`<input class="editInput" style="width:170px" maxlength="200" placeholder="keterangan izin" value="${escapeHtml(ket)}" data-f="keterangan" data-id="${eid}">`
    :"-";
  return `<tr data-id="${eid}">${ck}
  <td class="namaCell"><input class="editInput" style="width:110px" value="${escapeHtml(x.nama)}" data-f="nama" data-id="${eid}"><br><small style="font-size:9px">${escapeHtml(x.kelas||"")}</small></td>
  <td><div style="display:flex;flex-direction:column;gap:4px"><select class="editInput" style="width:75px" data-f="status" data-id="${eid}">${["Hadir","Izin","Sakit","Alfa"].map(s=>`<option ${st===s?"selected":""}>${s}</option>`).join("")}</select><span class="badge ${escapeHtml(st)}" style="font-size:9px;width:fit-content">${escapeHtml(st)}</span></div></td>
  <td><div style="display:flex;flex-direction:column;gap:4px"><select class="editInput" style="width:115px" data-f="guru" data-id="${eid}">${opsi(Object.keys(GURU_MAPEL),guru)}</select><span class="badge badge-guru" style="font-size:9px;width:fit-content">${escapeHtml(guru)}</span></div></td>
  <td><div style="display:flex;flex-direction:column;gap:4px"><select class="editInput" style="width:115px" data-f="mapel" data-id="${eid}">${opsi(Object.keys(MAPEL_GURU),mapel)}</select><span class="badge badge-mapel" style="font-size:9px;width:fit-content">${escapeHtml(mapel)}</span></div></td>
  <td><div style="display:flex;flex-direction:column;gap:4px"><input type="date" class="editInput" style="width:110px" value="${escapeHtml(iso)}" data-f="tgl" data-id="${eid}"><span style="font-size:10px;font-weight:700">${tglC}</span></div></td>
  <td><div style="display:flex;flex-direction:column;gap:4px"><input type="time" class="editInput" style="width:80px" value="${jamIn}" data-f="jam" data-id="${eid}"><span style="font-size:10px;font-weight:700">${jamC}</span></div></td>
  <td class="ketCell">${ketCell}</td>
  <td><button class="btnDel" data-del="${eid}">🗑️</button></td></tr>`;
}

function renderRekap(d){
  const area=$("rekapArea"),guruVal=$("fGuru").value,mapelVal=$("fMapel").value;
  if(!((guruVal||mapelVal)&&d.length>0)){area.classList.add("hidden");area.innerHTML="";return;}
  area.classList.remove("hidden");
  const hitung=a=>({Hadir:a.filter(x=>normalStatus(x.status)==="Hadir").length,Izin:a.filter(x=>normalStatus(x.status)==="Izin").length,Sakit:a.filter(x=>normalStatus(x.status)==="Sakit").length,Alfa:a.filter(x=>normalStatus(x.status)==="Alfa").length,total:a.length});
  const box=(ic,t,v)=>`<div class="rekapBox"><h4>${ic} ${escapeHtml(t)}</h4><div style="font-size:12px;line-height:1.8">Hadir: ${v.Hadir} | Izin: ${v.Izin} | Sakit: ${v.Sakit} | Alfa: ${v.Alfa}<br><b>Total: ${v.total} siswa</b></div></div>`;
  if(guruVal&&mapelVal){area.innerHTML=box("📚",mapelVal,hitung(d));return;}
  const key=guruVal?"mapel":"guru",ic=guruVal?"📚":"👨‍🏫",groups={};
  d.forEach(x=>{const k=x[key]||"Tanpa "+key;(groups[k]=groups[k]||[]).push(x);});
  area.innerHTML=Object.entries(groups).map(([k,a])=>box(ic,k,hitung(a))).join("");
}

function render(){
  const tbody=$("tbody");
  if(!hasShown){
    $("infoFilter").textContent=`${all.length} data siap - Pilih filter lalu klik Tampilkan`;
    $("rekapArea").classList.add("hidden");
    tbody.innerHTML=`<tr><td colspan=9 style="text-align:center;border:0;color:#6b5b8a;padding:20px">🔍 Klik <b>Tampilkan</b> untuk melihat data<br><small style="font-size:10px">${all.length} data tersimpan</small></td></tr>`;
    syncSelectUI();return;
  }
  const d=getFiltered();
  $("infoFilter").textContent=`Menampilkan ${d.length}/${all.length} | ${$("fKelas").value||"Semua Kelas"} - ${$("fGuru").value||"Semua Guru"} - ${$("fMapel").value||"Semua Mapel"}`;
  renderRekap(d);
  tbody.innerHTML=d.map(barisHtml).join("")||`<tr><td colspan=9 style="text-align:center;border:0;color:#6b5b8a">Tidak ada data sesuai filter</td></tr>`;
  syncSelectUI();
}

/* ================= MODE PILIH (CEKBOX) ================= */
function setSelectMode(on,firstId){
  if(on&&!canEdit)return;
  selectMode=on;
  $("tblWrap").classList.toggle("selecting",on);
  $("selBar").classList.toggle("hidden",!on);
  $("btnPilih").textContent=on?"✖️ Selesai Pilih":"☑️ Pilih Data";
  if(!on)selected.clear();
  if(on&&firstId)selected.add(String(firstId));
  if(on&&!hasShown)toast("Klik Tampilkan dulu untuk melihat data");
  syncSelectUI();
}
function syncSelectUI(){
  $("selCount").textContent=selected.size+" dipilih";
  const cks=[...document.querySelectorAll(".rowCk")];
  cks.forEach(c=>{const on=selected.has(c.dataset.id);c.checked=on;c.closest("tr").classList.toggle("rowSel",on);});
  $("ckAll").checked=cks.length>0&&cks.every(c=>c.checked);
}
$("ckAll").addEventListener("change",e=>{
  document.querySelectorAll(".rowCk").forEach(c=>{if(e.target.checked)selected.add(c.dataset.id);else selected.delete(c.dataset.id);});
  syncSelectUI();
});

// tahan lama (0,6 detik) pada baris = masuk mode pilih
let lpTimer=null;
const batalLP=()=>{clearTimeout(lpTimer);lpTimer=null;};
$("tbody").addEventListener("pointerdown",e=>{
  if(!canEdit||selectMode||!hasShown)return;
  if(e.target.closest("input,select,button,textarea"))return;
  const tr=e.target.closest("tr[data-id]");if(!tr)return;
  lpTimer=setTimeout(()=>{setSelectMode(true,tr.dataset.id);if(navigator.vibrate)navigator.vibrate(30);},600);
});
["pointerup","pointerleave","pointercancel"].forEach(ev=>$("tbody").addEventListener(ev,batalLP));

$("tbody").addEventListener("click",e=>{
  const del=e.target.closest("[data-del]");
  if(del){hapusSatu(del.dataset.del);return;}
  if(!selectMode)return;
  if(e.target.closest("input,select,textarea,button"))return;
  const tr=e.target.closest("tr[data-id]");if(!tr)return;
  const i=tr.dataset.id;
  if(selected.has(i))selected.delete(i);else selected.add(i);
  syncSelectUI();
});

$("tbody").addEventListener("change",e=>{
  const el=e.target;
  if(el.classList.contains("rowCk")){
    if(el.checked)selected.add(el.dataset.id);else selected.delete(el.dataset.id);
    syncSelectUI();return;
  }
  const f=el.dataset.f;if(!f)return;
  const id=el.dataset.id;
  if(f==="mapel")return editMapel(id,el.value);
  if(f==="guru")return editGuru(id,el.value);
  if(f==="tgl")return editTanggal(id,el.value);
  if(f==="jam")return editJam(id,el.value);
  if(f==="nama"&&!el.value.trim())return toast("❌ Nama tidak boleh kosong");
  if(f==="keterangan")return ubah(id,{keterangan:el.value.trim().slice(0,200)||null},"✅ Keterangan disimpan");
  return ubah(id,{[f]:el.value.trim()},"✅ "+f+" diubah");
});

/* ================= EDIT & HAPUS ================= */
async function ubah(id,obj,pesan){
  if(!canEdit)return toast("🔒 Tidak punya izin");
  const {data,error}=await supa.from(TABLE_NAME).update(obj).eq("id",id).select("id");
  if(error)return toast("❌ "+error.message);
  if(!data||!data.length)return toast("❌ Ditolak oleh database (cek izin / policy)");
  toast(pesan||"✅ Tersimpan");load(true);
}
function editMapel(id,m){
  if(!m)return toast("❌ Mapel kosong");
  if(m.includes("PAK"))return toast("❌ PAK tidak ada guru");
  const g=MAPEL_GURU[m];if(!g)return toast("❌ Guru tidak ditemukan");
  ubah(id,{mapel:m,guru:g},`📚 ${m} → ${g}`);
}
function editGuru(id,g){
  if(!g)return toast("❌ Guru kosong");
  const list=GURU_MAPEL[g]||[];
  const row=all.find(x=>String(x.id)===String(id));
  let m=row?.mapel;if(!list.includes(m))m=list[0]||"";
  ubah(id,{guru:g,mapel:m},`👨‍🏫 ${g} → ${m}`);
}
function editTanggal(id,iso){
  if(!iso)return toast("❌ Tanggal kosong");
  ubah(id,{tgl:iso,tanggal:labelTanggal(iso)},"✅ Tanggal diubah");
}
function editJam(id,v){
  if(!v)return toast("❌ Jam kosong");
  ubah(id,{jam:v.length===5?v+":00":v},"✅ Jam diubah");
}

async function hapusIds(ids){
  let terhapus=0;
  for(let i=0;i<ids.length;i+=100){
    const {data,error}=await supa.from(TABLE_NAME).delete().in("id",ids.slice(i,i+100)).select("id");
    if(error)return {error,terhapus};
    terhapus+=(data||[]).length;
  }
  return {terhapus};
}
async function hapusSatu(id){
  if(!canEdit)return toast("🔒 Tidak punya izin");
  if(!confirm("Hapus data ini?"))return;
  const r=await hapusIds([id]);
  if(r.error)return toast("❌ "+r.error.message);
  if(!r.terhapus)return toast("❌ Ditolak oleh database (cek izin / policy)");
  toast("Terhapus");load(true);
}
async function hapusTerpilih(){
  if(!canEdit)return;
  const ids=[...selected];
  if(!ids.length)return toast("Belum ada data yang dipilih");
  if(!confirm(`Hapus ${ids.length} data terpilih? Tidak bisa dibatalkan.`))return;
  const r=await hapusIds(ids);
  if(r.error)toast("❌ "+r.error.message);
  else toast(r.terhapus===ids.length?`🗑️ ${r.terhapus} data terhapus`:`⚠️ ${r.terhapus} dari ${ids.length} terhapus (sisanya ditolak izin)`,3500);
  selected.clear();load(true);
}
async function hapusSemua(){
  if(!canEdit)return toast("🔒 Tidak punya izin");
  if(!hasShown)return toast("Klik Tampilkan dulu");
  const d=getFiltered();
  if(!d.length)return toast("Tidak ada data");
  if(!confirm(`Hapus ${d.length} data yang terfilter?`))return;
  const r=await hapusIds(d.map(x=>x.id));
  if(r.error)toast("❌ "+r.error.message);else toast(`🗑️ ${r.terhapus} data terhapus`);
  load(true);
}

function resetFilter(){
  $("fTanggal").value="";$("dateWrap").classList.remove("has-value");
  $("fKelas").value="";$("fNama").value="";$("fStatus").value="";
  isiAwal();hasShown=false;renderStats([]);render();
  $("infoFilter").textContent="Filter direset, klik Tampilkan";
}

/* ================= EXCEL ================= */
async function downloadExcel(){
  if(!hasShown)return toast("Klik Tampilkan dulu baru download");
  const d=getFiltered();if(!d.length)return toast("Tidak ada data");
  const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet("Absensi");
  const HEADER=["NAMA","KELAS","STATUS","GURU","MAPEL","TANGGAL","JAM","KETERANGAN"];
  const FILLS=["FFFFE26A","FFB4F8C8","FFFF8A65","FFD8B4FE","FFFFDA77","FFA0E7E5","FFB4F8C8","FFFFE26A"];
  const WIDTHS=[22,12,14,30,42,34,18,40];
  const bd={style:'medium',color:{argb:'FF2D1B4E'}},border={top:bd,left:bd,bottom:bd,right:bd};
  const hRow=ws.addRow(HEADER);hRow.height=28;
  WIDTHS.forEach((w,i)=>ws.getColumn(i+1).width=w);
  hRow.eachCell((c,col)=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:FILLS[col-1]}};c.font={bold:true,size:12,color:{argb:"FF2D1B4E"}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border=border;});
  d.forEach(r=>{
    const row=ws.addRow([r.nama||"",r.kelas||"",normalStatus(r.status),r.guru||"",r.mapel||"",formatTanggalCantik(isoOf(r)||r.tanggal),formatJamCantik(r.jam),r.keterangan||""]);
    row.eachCell(c=>{c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.font={size:11,color:{argb:"FF2D1B4E"}};c.border=border;});
  });
  const buf=await wb.xlsx.writeBuffer();
  const blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`absensi-${$("fKelas").value||"semua"}-${$("fTanggal").value||new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1000);
  toast("✅ Excel OK!");
}

$("fGuru").addEventListener("change",()=>{
  if(isSyncing)return;isSyncing=true;
  const guru=$("fGuru").value,selM=$("fMapel");
  if(!guru){isiAwal();isSyncing=false;onFilterTyping();return;}
  const mapels=GURU_MAPEL[guru]||[];
  selM.innerHTML='<option value="">Semua Mapel</option>';
  mapels.forEach(m=>{const o=document.createElement("option");o.value=m;o.textContent=m;selM.appendChild(o);});
  const oPak=document.createElement("option");oPak.value=PAK;oPak.textContent=PAK;oPak.disabled=true;selM.appendChild(oPak);
  if(mapels.length>0)selM.value=mapels[0];
  isSyncing=false;onFilterTyping();
});
$("fMapel").addEventListener("change",()=>{
  if(isSyncing)return;isSyncing=true;
  const mapel=$("fMapel").value,selG=$("fGuru");
  if(!mapel){isiAwal();isSyncing=false;onFilterTyping();return;}
  if(mapel.includes("PAK")){toast("❌ PAK tidak ada guru");$("fMapel").value="";isSyncing=false;return;}
  const guru=MAPEL_GURU[mapel];
  selG.innerHTML='<option value="">Semua Guru</option>';
  if(guru){const o=document.createElement("option");o.value=guru;o.textContent=guru;selG.appendChild(o);selG.value=guru;}
  isSyncing=false;onFilterTyping();
});

/* ================= PENGATURAN: ABSEN SEKALI ================= */
function updateSwLabel(){$("swLabel").textContent=$("swSekali").checked?"ON":"OFF";}
async function muatPengaturan(){
  const {data}=await supa.rpc("info_absen");
  const r=Array.isArray(data)?data[0]:data;
  $("swSekali").checked=!!(r&&r.sekali);updateSwLabel();
}
$("swSekali").addEventListener("change",async e=>{
  const on=e.target.checked;
  const {error}=await supa.rpc("set_mode_sekali",{p_on:on});
  if(error){e.target.checked=!on;updateSwLabel();toast("❌ "+error.message);return;}
  updateSwLabel();
  toast(on?"✅ ON: sekali absen = semua mapel hari itu":"✅ OFF: absen per mapel");
});

/* ================= LIBUR MANUAL ================= */
async function muatLibur(){
  const box=$("listLibur");
  const {data,error}=await supa.rpc("daftar_libur");
  if(error){box.textContent="❌ "+error.message;return;}
  if(!data||!data.length){box.textContent="Belum ada libur manual.";return;}
  box.innerHTML=data.map(l=>{
    const tgl=l.tgl_mulai===l.tgl_akhir?formatTanggalCantik(l.tgl_mulai):`${formatTanggalCantik(l.tgl_mulai)}<br>s/d ${formatTanggalCantik(l.tgl_akhir)}`;
    return `<div class="item"><div><b>${tgl}</b><br>${escapeHtml(l.alasan)}<br><small>oleh ${escapeHtml(maskEmail(l.dibuat_oleh||""))}</small></div><div class="btns"><button class="btn btn-red" data-hl="${l.id}">🗑️ Hapus</button></div></div>`;
  }).join("");
}
$("btnKirimLibur").addEventListener("click",async()=>{
  const m=$("lMulai").value,a=$("lAkhir").value||m,al=$("lAlasan").value.trim();
  if(!m)return toast("Pilih tanggal libur");
  if(a<m)return toast("Tanggal selesai sebelum tanggal mulai");
  if(al.length<3)return toast("Tulis alasan libur (min. 3 huruf)");
  $("btnKirimLibur").disabled=true;
  const {error}=await supa.rpc("tambah_libur",{p_mulai:m,p_akhir:a,p_alasan:al});
  $("btnKirimLibur").disabled=false;
  if(error)return toast("❌ "+error.message,4000);
  $("lMulai").value="";$("lAkhir").value="";$("lAlasan").value="";
  toast("✅ Libur terkirim");muatLibur();
});
$("listLibur").addEventListener("click",async e=>{
  const b=e.target.closest("[data-hl]");if(!b)return;
  if(!confirm("Hapus libur ini?"))return;
  const {error}=await supa.rpc("hapus_libur",{p_id:Number(b.dataset.hl)});
  if(error)return toast("❌ "+error.message);
  toast("Libur dihapus");muatLibur();
});
$("pnlLibur").addEventListener("toggle",()=>{if($("pnlLibur").open)muatLibur();});

/* ================= RESET QR ================= */
let siswaCache=null;
async function muatSiswaCache(){
  if(siswaCache){isiRNama();return;}
  const {data,error}=await supa.rpc("siswa_dash");
  if(error){toast("❌ "+error.message);return;}
  siswaCache=data||[];isiRNama();
}
function isiRNama(){
  const k=$("rKelas").value;
  $("rNama").innerHTML='<option value="">-- Pilih nama --</option>';
  (siswaCache||[]).filter(s=>k==="SEMUA"||s.kelas===k).forEach(s=>{
    const o=document.createElement("option");
    o.value=s.kelas+"|"+s.nama;
    o.textContent=`${s.nama} (${s.kelas})${s.terikat?" 🔒":""}`;
    $("rNama").appendChild(o);
  });
}
function aturResetUI(){
  const w=$("rJenis").value==="wewenang";
  $("rSiswa").classList.toggle("hidden",w);
  $("rWewenang").classList.toggle("hidden",!w);
  $("rNamaWrap").classList.toggle("hidden",$("rBy").value!=="nama");
  if(w)muatPetugas();else muatSiswaCache();
}
$("rJenis").addEventListener("change",aturResetUI);
$("rBy").addEventListener("change",aturResetUI);
$("rKelas").addEventListener("change",isiRNama);
$("pnlReset").addEventListener("toggle",()=>{if($("pnlReset").open)aturResetUI();});

$("btnResetSiswa").addEventListener("click",async()=>{
  const by=$("rBy").value,aksi=$("rAksi").value;
  let kelas=$("rKelas").value,nama=null,target;
  if(by==="nama"){
    const v=$("rNama").value;if(!v)return toast("Pilih nama siswa dulu");
    [kelas,nama]=v.split("|");target=`${nama} (${kelas})`;
  }else target=kelas==="SEMUA"?"SEMUA siswa di SEMUA kelas":`semua siswa kelas ${kelas}`;
  const txt=aksi==="hp"?"reset ikatan HP (QR bisa di-scan dari HP baru)":"GANTI KODE QR (kartu lama langsung tidak berlaku, harus cetak ulang)";
  if(!confirm(`${txt}\n\nUntuk: ${target}\n\nLanjutkan?`))return;
  $("btnResetSiswa").disabled=true;
  const {data,error}=await supa.rpc("reset_qr_siswa",{p_mode:aksi,p_kelas:kelas,p_nama:nama});
  $("btnResetSiswa").disabled=false;
  if(error)return toast("❌ "+error.message,4000);
  toast(`✅ ${data} siswa direset`+(aksi==="kode"?" • cetak ulang kartu di cetak.html":""),4500);
  siswaCache=null;muatSiswaCache();
});

async function muatPetugas(){
  const box=$("listPetugas");
  const {data,error}=await supa.rpc("petugas_dash");
  if(error){box.textContent="❌ "+error.message;return;}
  if(!data||!data.length){box.textContent="Belum ada QR wewenang.";return;}
  box.innerHTML=data.map(p=>{
    const terakhir=p.terakhir_pakai?new Date(p.terakhir_pakai).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"}):"belum pernah";
    return `<div class="item"><div><b>${escapeHtml(p.label)}</b> ${p.aktif?"✅":"⛔ nonaktif"}<br><small>dipakai ${p.jumlah_pakai}x • terakhir ${terakhir}</small></div><div class="btns"><button class="btn btn-yellow" data-pt="${p.id}" data-m="ulang">♻️ Terbitkan ulang</button><button class="btn" data-pt="${p.id}" data-m="${p.aktif?"nonaktif":"aktif"}">${p.aktif?"⛔ Nonaktifkan":"✅ Aktifkan"}</button></div></div>`;
  }).join("");
}
$("listPetugas").addEventListener("click",async e=>{
  const b=e.target.closest("[data-pt]");if(!b)return;
  const m=b.dataset.m;
  const t={ulang:"Terbitkan ulang? QR lama langsung mati dan kartu harus dicetak ulang.",nonaktif:"Nonaktifkan QR wewenang ini?",aktif:"Aktifkan lagi QR wewenang ini?"}[m];
  if(!confirm(t))return;
  const {error}=await supa.rpc("reset_qr_petugas",{p_id:Number(b.dataset.pt),p_mode:m});
  if(error)return toast("❌ "+error.message);
  toast(m==="ulang"?"✅ Diterbitkan ulang • cetak kartu baru di cetak.html":"✅ Berhasil",4000);
  muatPetugas();
});

/* ================= AWAL ================= */
window.addEventListener("scroll",()=>{$("stickyNavbar").classList.toggle("scrolled",window.scrollY>10);});
isiAwal();
(async()=>{
  const {data}=await supa.auth.getSession();
  if(data.session){mulaiSesi(data.session.user);}
  else{setAuthUI(false);renderStats([]);render();}
})();