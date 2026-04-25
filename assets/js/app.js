/* PT. Magflow Elektrindo Persada site scripts. Extracted from index.html for maintainability. */

/* ---- Inline script block 1 ---- */
(function(){
  var _loaderTimer=setTimeout(function(){
    var ld=document.getElementById('loader');
    if(ld&&!ld.classList.contains('gone')){
      ld.classList.add('gone');
      var hi=document.getElementById('heroImg');
      if(hi)hi.classList.add('loaded');
    }
  },1500);
  window._loaderTimer=_loaderTimer;
})();

/* ---- Inline script block 2 ---- */
var pltsType = 'hybrid';
if(typeof CL === 'undefined') var CL = 'id';

// —— HELPERS ——
function calcText(idText, enText){
  return CL === 'en' ? enText : idText;
}
function calcEl(id){
  return document.getElementById(id);
}
function calcNum(id, fallback){
  var el = calcEl(id);
  var n = el ? parseFloat(el.value) : NaN;
  return isFinite(n) ? n : fallback;
}
function clampNumber(n, min, max){
  return Math.min(max, Math.max(min, n));
}
function setSelectByValue(id, value){
  var el = calcEl(id);
  if(!el) return;
  for(var i=0;i<el.options.length;i++){
    if(String(el.options[i].value) === String(value)){
      el.selectedIndex = i;
      return;
    }
  }
}
function formatRp(n) {
  var num = isFinite(n) ? Math.round(n) : 0;
  if(num >= 1e9) return 'Rp ' + (num/1e9).toFixed(1) + ' M';
  if(num >= 1e6) return 'Rp ' + (num/1e6).toFixed(1) + ' jt';
  return 'Rp ' + num.toLocaleString('id-ID');
}

// —— INPUT STATE ——
function getTarif(){
  var v = calcEl('plts_tarif').value;
  if(v === 'custom'){
    return Math.max(calcNum('plts_tarif_custom', 1441), 1);
  }
  return Math.max(parseFloat(v) || 1441, 1);
}
function getWp(){
  var v = calcEl('plts_wp').value;
  if(v === 'custom'){
    return Math.max(calcNum('plts_wp_custom', 550), 1);
  }
  return Math.max(parseFloat(v) || 550, 1);
}
function syncTarifUI(){
  var select = calcEl('plts_tarif');
  var custom = calcEl('plts_tarif_custom');
  var label = calcEl('lbl_tarif');
  if(!select || !custom || !label) return;
  var isCustom = select.value === 'custom';
  custom.style.display = isCustom ? 'block' : 'none';
  if(!isCustom){
    label.textContent = Math.round(parseFloat(select.value) || 1441).toLocaleString('id-ID') + ' Rp/kWh';
    return;
  }
  var customTarif = parseFloat(custom.value);
  label.textContent = customTarif > 0
    ? Math.round(customTarif).toLocaleString('id-ID') + ' Rp/kWh'
    : calcText('Custom', 'Custom');
}
function syncWpUI(){
  var select = calcEl('plts_wp');
  var custom = calcEl('plts_wp_custom');
  var label = calcEl('lbl_wp');
  if(!select || !custom || !label) return;
  var isCustom = select.value === 'custom';
  custom.style.display = isCustom ? 'block' : 'none';
  if(!isCustom){
    label.textContent = select.value + ' Wp';
    return;
  }
  var customWp = parseFloat(custom.value);
  label.textContent = customWp > 0 ? Math.round(customWp) + ' Wp' : calcText('Custom', 'Custom');
}

// —— UX HELPERS ——
function ensurePLTSTypeNote(){
  var row = calcEl('btn_offgrid');
  if(!row || !row.parentNode) return null;
  var note = calcEl('plts_type_note');
  if(!note){
    note = document.createElement('div');
    note.id = 'plts_type_note';
    note.style.cssText = 'font-size:.62rem;color:#6B7A93;margin-top:6px;line-height:1.5';
    row.parentNode.parentNode.insertBefore(note, row.parentNode.nextSibling);
  }
  return note;
}
function updatePLTSTypeNote(){
  var note = ensurePLTSTypeNote();
  var prices = {ongrid:11, hybrid:15, offgrid:18};
  if(!note) return;
  note.textContent = calcText(
    'Jenis sistem memengaruhi harga & proyeksi finansial, bukan sizing panel. Harga default ' + (prices[pltsType] || 15) + ' jt/kWp.',
    'System type affects price & financial projection, not panel sizing. Default price ' + (prices[pltsType] || 15) + ' M IDR/kWp.'
  );
}
function applyPLTSResponsiveGrid(){
  var g = calcEl('plts_main_grid');
  if(!g) return;
  if(window.innerWidth < 720){
    g.style.gridTemplateColumns = '1fr';
    g.style.gap = '20px';
  } else if(window.innerWidth < 980){
    g.style.gridTemplateColumns = '340px 1fr';
    g.style.gap = '24px';
  } else {
    g.style.gridTemplateColumns = '380px 1fr';
    g.style.gap = '28px';
  }
}

// —— EVENT HANDLERS ——
function setPLTSType(type) {
  var prices = {ongrid:11, hybrid:15, offgrid:18};
  pltsType = prices[type] ? type : 'hybrid';
  ['ongrid','hybrid','offgrid'].forEach(function(t) {
    var b = calcEl('btn_' + t);
    if(!b) return;
    var active = t === pltsType;
    b.style.background = active ? 'var(--blue)' : '#fff';
    b.style.color = active ? '#fff' : '#6B7A93';
    b.style.borderColor = active ? 'var(--blue)' : '#E2E8F0';
  });
  var priceInput = calcEl('plts_hargakwp');
  if(priceInput) priceInput.value = prices[pltsType] || 15;
  updatePLTSTypeNote();
  hitungPLTS();
}
function onKwhChange(){
  var tagihan = calcEl('plts_tagihan');
  var helper = calcEl('helper_note');
  if(tagihan) tagihan.value = '';
  if(helper) helper.textContent = '';
  hitungPLTS();
}
function onTagihanChange(){
  var tag = calcNum('plts_tagihan', 0);
  var tarif = Math.max(calcNum('plts_tarif_helper', 1441), 1);
  var helper = calcEl('helper_note');
  if(tag > 0){
    var kwhBulanan = tag / tarif;
    var kwhHarian = Math.round((kwhBulanan / 30) * 10) / 10;
    calcEl('plts_kwh').value = kwhHarian;
    if(helper){
      helper.textContent = calcText(
        '→ ' + kwhHarian + ' kWh/hari. Estimasi kasar; tagihan PLN bisa termasuk abonemen, PPJ, dan biaya non-energi.',
        '→ ' + kwhHarian + ' kWh/day. Rough estimate; PLN bills may include fixed charges, taxes, and non-energy fees.'
      );
    }
  } else if(helper){
    helper.textContent = '';
  }
  hitungPLTS();
}
function onTarifChange(){
  syncTarifUI();
  hitungPLTS();
}
function onWpChange(){
  syncWpUI();
  hitungPLTS();
}
function toggleAdv(){
  var panel = calcEl('adv_panel');
  var ico = calcEl('adv_ico');
  if(!panel || !ico) return;
  var open = panel.style.display === 'none';
  panel.style.display = open ? 'block' : 'none';
  ico.style.transform = open ? 'rotate(180deg)' : '';
}
function resetKalkulator(){
  if(calcEl('plts_kwh')) calcEl('plts_kwh').value = '60';
  if(calcEl('plts_tagihan')) calcEl('plts_tagihan').value = '';
  if(calcEl('plts_luas')) calcEl('plts_luas').value = '';
  if(calcEl('plts_eff')) calcEl('plts_eff').value = '85';
  if(calcEl('plts_buffer')) calcEl('plts_buffer').value = '25';
  if(calcEl('plts_hargakwp')) calcEl('plts_hargakwp').value = '15';
  if(calcEl('plts_eskalasi')) calcEl('plts_eskalasi').value = '5';
  if(calcEl('plts_tarif_custom')) calcEl('plts_tarif_custom').value = '';
  if(calcEl('plts_wp_custom')) calcEl('plts_wp_custom').value = '';
  setSelectByValue('plts_lokasi', '5.0');
  setSelectByValue('plts_tarif', '1441');
  setSelectByValue('plts_tarif_helper', '1441');
  setSelectByValue('plts_wp', '550');
  syncTarifUI();
  syncWpUI();
  if(calcEl('helper_note')) calcEl('helper_note').textContent = '';
  setPLTSType('hybrid');
}

// —— CALCULATION ——
function hitungPLTS() {
  syncTarifUI();
  syncWpUI();
  updatePLTSTypeNote();

  var kwhHari = Math.max(calcNum('plts_kwh', 0), 0);
  var luas = Math.max(calcNum('plts_luas', 0), 0);
  var psh = Math.max(calcNum('plts_lokasi', 5.0), 0.1);
  var tarif = getTarif();
  var wp = getWp();
  var wpKwp = wp / 1000;
  var effPct = clampNumber(calcNum('plts_eff', 85), 1, 99);
  var bufferPctInput = clampNumber(calcNum('plts_buffer', 25), 0, 100);
  var hargaKwpJuta = Math.max(calcNum('plts_hargakwp', 15), 0);
  var eskalasiPct = Math.max(calcNum('plts_eskalasi', 5), 0);
  var eff = effPct / 100;
  var bufferPct = bufferPctInput / 100;
  var hargaKwp = hargaKwpJuta * 1e6;
  var eskalasi = eskalasiPct / 100;

  if(calcEl('plts_eff')) calcEl('plts_eff').value = effPct;
  if(calcEl('plts_buffer')) calcEl('plts_buffer').value = bufferPctInput;
  if(calcEl('lbl_psh')) calcEl('lbl_psh').textContent = 'PSH ' + psh.toFixed(1);

  var energiKotor = kwhHari > 0 ? kwhHari / eff : 0;
  var kwpMinimum = psh > 0 ? energiKotor / psh : 0;
  var kwpTarget = kwpMinimum * (1 + bufferPct);
  var nPanel = kwpTarget > 0 && wpKwp > 0 ? Math.ceil(kwpTarget / wpKwp) : 0;
  var kwpActual = nPanel * wpKwp;

  var produksiBersih = kwpActual * psh * eff;
  var produksiTahunan = produksiBersih * 365;

  var biayaInvestasi = kwpActual * hargaKwp;
  var hematTahun1 = produksiTahunan * tarif;
  var roi = hematTahun1 > 0 ? biayaInvestasi / hematTahun1 : null;

  var totalHemat = 0;
  var kumulatifCashflow = -biayaInvestasi;
  var breakeven = null;
  var hematPerTahun = [];
  for(var tahun = 1; tahun <= 10; tahun++){
    var hematTahunKe = produksiTahunan * tarif * Math.pow(1 + eskalasi, tahun - 1);
    totalHemat += hematTahunKe;
    var kumulatifSebelum = kumulatifCashflow;
    kumulatifCashflow += hematTahunKe;
    if(breakeven === null && hematTahunKe > 0 && kumulatifCashflow >= 0){
      breakeven = (tahun - 1) + ((0 - kumulatifSebelum) / hematTahunKe);
    }
    hematPerTahun.push(hematTahunKe);
  }

  var netProfit10Tahun = totalHemat - biayaInvestasi;
  var returnPct10Tahun = biayaInvestasi > 0 ? Math.round((totalHemat / biayaInvestasi) * 100) : 0;
  var kebutuhanTahunan = kwhHari * 365;
  var coveragePct = kebutuhanTahunan > 0 ? Math.min((produksiTahunan / kebutuhanTahunan) * 100, 100) : 0;
  var coverageDisplay = Math.round(coveragePct);
  var co2Saved = produksiTahunan * 0.87 / 1000;
  var maxPanelByRoof = luas > 0 ? Math.floor(luas / 3.5) : 0;
  var roofWarning = luas > 0 && maxPanelByRoof > 0 && nPanel > maxPanelByRoof;

  ['res_kapasitas','res_biaya','res_hemat','res_roi','res_co2','res_persen','res_10yr_hemat','res_10yr_profit','res_10yr_return'].forEach(function(id){
    var el = calcEl(id);
    if(el){
      el.style.opacity = '0';
      setTimeout(function(){ el.style.opacity = '1'; }, 80);
    }
  });

  calcEl('res_kapasitas').textContent = kwpActual.toFixed(2);
  calcEl('res_panel').textContent = nPanel + ' ' + calcText('panel', 'panels') + ' ' + wp + 'Wp';
  calcEl('res_biaya').textContent = formatRp(biayaInvestasi);
  calcEl('res_hemat').textContent = formatRp(hematTahun1);
  calcEl('res_hemat_bulan').textContent = formatRp(hematTahun1 / 12) + ' ≈ ' + calcText('per bulan', 'per month');
  calcEl('res_roi').textContent = !roi ? 'N/A' : (roi > 30 ? calcText('> 30 thn', '> 30 yr') : roi.toFixed(1) + calcText(' thn', ' yr'));
  calcEl('res_co2').textContent = co2Saved.toFixed(1) + ' ton/' + calcText('thn', 'yr');
  calcEl('res_persen').textContent = coverageDisplay + '%';
  calcEl('res_bar').style.width = coverageDisplay + '%';
  calcEl('res_eskalasi_note').textContent = calcText('eskalasi ', 'escalation ') + Math.round(eskalasiPct) + '%/' + calcText('thn', 'yr');
  calcEl('res_10yr_hemat').textContent = formatRp(totalHemat);
  calcEl('res_10yr_profit').textContent = (netProfit10Tahun >= 0 ? '+' : '') + formatRp(netProfit10Tahun);
  calcEl('res_10yr_return').textContent = returnPct10Tahun + '%';
  calcEl('res_breakeven_lbl').textContent = kwhHari <= 0 ? '' : (breakeven ? 'BEP ' + calcText('thn ', 'yr ') + breakeven.toFixed(1) : 'BEP: N/A');

  var bc = calcEl('bar_chart');
  if(bc){
    var maxHemat = hematPerTahun.length ? Math.max.apply(null, hematPerTahun) : 0;
    var breakYear = breakeven ? Math.ceil(breakeven) : -1;
    bc.innerHTML = '';
    hematPerTahun.forEach(function(h, i){
      var height = maxHemat > 0 ? Math.max(Math.round((h / maxHemat) * 36), 2) : 2;
      var bar = document.createElement('div');
      bar.style.cssText = 'flex:1;border-radius:2px 2px 0 0;background:' + (i + 1 === breakYear ? '#fbbf24' : 'rgba(255,255,255,' + (0.15 + i * 0.08) + ')') + ';height:' + height + 'px;transition:height .4s ease';
      bc.appendChild(bar);
    });
  }

  calcEl('d_kwh').textContent = kwhHari.toFixed(1) + calcText(' kWh/hari', ' kWh/day');
  calcEl('d_kotor').textContent = energiKotor.toFixed(2) + calcText(' kWh/hari', ' kWh/day');
  calcEl('d_kwpmin').textContent = kwpMinimum.toFixed(3) + ' kWp';
  calcEl('d_kwpbuf').textContent = kwpTarget.toFixed(3) + ' kWp';
  calcEl('d_panel').textContent = nPanel + ' ' + calcText('unit', 'panels');
  calcEl('d_bersih').textContent = produksiBersih.toFixed(2) + calcText(' kWh/hari', ' kWh/day');

  var note = '';
  if(kwhHari <= 0){
    note = calcText('Masukkan konsumsi listrik harian untuk memulai estimasi.', 'Enter daily electricity consumption to start the estimate.');
  } else if(coverageDisplay >= 100){
    note = calcText('Produksi PLTS diperkirakan mencukupi kebutuhan energi harian.', 'Estimated PV production is sufficient to cover daily energy demand.');
  } else {
    note = calcText('Sistem diperkirakan menutup sekitar ', 'The system is estimated to cover about ') + coverageDisplay + '% ' + calcText('kebutuhan listrik tahunan Anda.', 'of your annual electricity demand.');
  }
  if(roofWarning){
    note += ' ' + calcText('Luas atap mungkin belum cukup untuk ' + nPanel + ' panel (perkiraan muat ±' + maxPanelByRoof + ' panel).', 'Roof area may be insufficient for ' + nPanel + ' panels (estimated fit: ±' + maxPanelByRoof + ' panels).');
  }
  calcEl('res_note').textContent = note;
}

// —— INIT ——
document.addEventListener('DOMContentLoaded', function(){
  applyPLTSResponsiveGrid();
  ensurePLTSTypeNote();
  syncTarifUI();
  syncWpUI();
  setPLTSType('hybrid');
  window.addEventListener('resize', applyPLTSResponsiveGrid);
});

/* ---- Inline script block 3 ---- */
const T={
 id:{nav_about:'Tentang Kami',
nav_svc:'Layanan',
nav_calc:'Kalkulator PLTS',
nav_proj:'Proyek',
nav_mkt:'Sektor',
nav_ct:'Kontak',
calc_ey:'Kalkulator Estimasi',
calc_sub:'Masukkan konsumsi harian dan kondisi lokasi untuk estimasi kapasitas panel, biaya investasi, dan proyeksi keuntungan 10 tahun.',
nav_cta:'Konsultasi Gratis',
hero_tag:'Inovatif & Kooperatif Sejak 2020',
h1a:'SOLUSI TEKNIK',
h1b:'KELISTRIKAN',
h1c:'& ENERGI SURYA',
hero_p:'Dari gardu induk 500 kV hingga PLTS terapung 145 MWac — kami kerjakan langsung di lapangan dengan tim bersertifikat BNSP dan standar internasional.',
btn_wa:'Hubungi Kami',
btn_proj:'Lihat Proyek',
hs1:'Proyek Selesai',
hs2:'Tahun Pengalaman',
hs3:'Tegangan Tertinggi',
iso_lbl:'Tersertifikasi & Berstandar',
ss1:'Proyek Selesai',
ss2:'Tahun Pengalaman',
ss3:'Tegangan Tertinggi',
ab_ey:'Tentang Perusahaan',
ab_h2:'BERPENGALAMAN\nDI TEGANGAN TINGGI\nDAN ENERGI SURYA',
ab_q:'"Sejak 2020, kami sudah menangani proyek dari GI 150 kV di Batam sampai PLTS terapung 145 MWac di Cirata — semua kami kerjakan langsung di lapangan."',
ab_p:'Kontraktor spesialis kelistrikan tegangan tinggi, telekomunikasi, dan energi surya sejak 2020. Berpengalaman di proyek skala nasional bersama PLN, Siemens Energy, PowerChina, dan Pertamina.',
ap1:'Tersertifikasi ISO 9001, 14001, dan 45001 — standar kualitas, lingkungan, dan K3',
ap2:'Bermitra dengan Siemens Energy, PLN, PowerChina, Doosan, Huawei, dan Bekaert',
ap3:'Menangani proyek dari 70 kV hingga GITET 500 kV di seluruh Indonesia',
ap4:'Teknisi bersertifikat BNSP, beroperasi aktif dari Sumatera hingga NTT',
cert_ey:'Sertifikasi & Legalitas',
cert_h2:'STANDAR & AKREDITASI\nINTERNASIONAL',
cert_p:'Beroperasi di bawah ISO 9001, 14001, dan 45001 — standar mutu, lingkungan, dan K3 internasional. Seluruh pekerjaan mengacu pada regulasi teknis PLN dan ESDM.',
vm_ey:'Arah Perusahaan',
vm_h2:'VISI & MISI',
vis_h:'VISI',
mis_h:'MISI',
vis_p:'Menjadi penyedia jasa terkemuka di kelistrikan tegangan tinggi, T&C, dan energi surya — dipercaya klien korporat dan BUMN di seluruh Indonesia.',
mis_p:'Memberikan kepuasan penuh dan jaminan kualitas untuk setiap proyek, dengan mengutamakan keselamatan K3, ketepatan waktu, dan standar teknis tertinggi.',
m1:'Memberikan layanan berkualitas tinggi yang melampaui ekspektasi klien di setiap tahap proyek.',
m2:'Terus berinovasi dalam proses, teknologi, dan kompetensi tim — mengadopsi standar teknis terbaru secara berkelanjutan.',
m3:'Memastikan keselamatan K3 dan kepuasan klien melalui eksekusi yang profesional dan terdokumentasi.',
svc_ey:'Layanan Kami',
svc_h2:'SOLUSI TEKNIK\nLENGKAP',
svc_sub:'Dari perencanaan hingga komisioning penuh — tim spesialis kami menangani seluruh siklus proyek kelistrikan dan energi surya Anda.',
s1h:'Instalasi Listrik & Mekanikal',
s1p:'Pemasangan instalasi listrik dan mekanikal skala industri sesuai PUIL 2011, SNI, dan regulasi teknis PLN. Mencakup instalasi panel, kabel daya, grounding, dan sistem proteksi.',
s2h:'Testing & Commissioning',
s2p:'Pengujian sistem LV, MV, HV hingga EHV 500 kV secara menyeluruh. Meliputi relay protection, power quality analysis, insulation test, dan functional test sesuai standar IEC dan PLN.',
s3h:'Gardu Induk & Substation',
s3p:'Erection, instalasi, testing, dan komisioning gardu induk 70–500 kV. Berpengalaman menangani GI PLN, GITET, dan switchyard industri dari Sumatera hingga Nusa Tenggara.',
s4h:'Solar Panel & PLTS',
s4p:'Instalasi sistem solar PV on-grid, off-grid, dan hybrid untuk kebutuhan industri dan komersial. Termasuk layanan PdM PLTS, rooftop solar, dan floating solar skala besar.',
s5h:'Preventive Maintenance',
s5p:'Program pemeliharaan preventif jangka panjang untuk transformator daya, gardu induk, dan sistem kelistrikan industri. Mencakup inspeksi berkala, pengujian kondisi, dan penggantian komponen.',
s6h:'Telekomunikasi & Konsultansi',
s6p:'Konstruksi jaringan telekomunikasi, integrasi sistem SCADA/SAS, konsultansi teknis engineering, dan pengadaan material listrik untuk proyek skala besar.',
lm:'Konsultasi',
lm2:'Detail',
lm3:'Konsultasi',
lm4:'Konsultasi',
lm5:'Konsultasi',
lm6:'Konsultasi',
tc_ey:'Keahlian Teknis Utama',
tc_h2:'TESTING &\nCOMMISSIONING\nKELISTRIKAN',
tc_p:'Proses T&C mengacu pada IEC 60364, IEEE, SNI PUIL, dan prosedur PLN. Setiap pengujian didokumentasikan dalam berita acara komisioning resmi yang teraudit.',
ts1h:'Inspeksi Pre-Commissioning',
ts1p:'Verifikasi seluruh instalasi fisik terhadap SLD, spesifikasi teknis, dan dokumen desain sebelum sistem dienergize.',
ts2h:'Pengujian & Pengukuran Listrik',
ts2p:'Insulation resistance, earth resistance, contact resistance, power quality, partial discharge, dan thermografi inframerah.',
ts3h:'Energizing & Functional Test',
ts3p:'Energisasi bertahap, pengujian relay protection, konfigurasi setting, dan functional test seluruh sistem kontrol.',
ts4h:'Penerimaan & Serah Terima',
ts4p:'Berita acara serah terima, dokumen as-built, laporan T&C lengkap, dan manual operasi untuk klien.',
tc_scope:'LINGKUP PENGUJIAN',
tc_sp:'Sistem LV hingga EHV 500 kV.',
sol_ey:'Energi Surya',
sol_h2:'CIRATA 145 MWac\nFLOATING SOLAR\nPOWER PLANT',
sol_p:'Dipercaya PT. PowerChina untuk layanan PdM di PLTS Cirata — pembangkit surya terapung terbesar di Asia Tenggara, 145 MWac di atas Waduk Cirata, Jawa Barat.',
sl1:'Kapasitas',
sl2:'Mitra',
sl3:'Lingkup',
pr_ey:'Rekam Jejak',
pr_h2:'65+ PROYEK\nSELESAI',
pr_sub:'Lebih dari 65 proyek selesai sejak 2020 — testing & commissioning gardu induk, instalasi PLTS, dan pemeliharaan kelistrikan di seluruh Indonesia.',
fa:'Semua',
fhv:'High Voltage',
fs:'Solar PV',
fm:'Maintenance',
fi:'Instalasi',
fo:'Ongoing',
clients_label:'Klien & Mitra',
mkt_ey:'Target Pasar',
mkt_h2:'SEKTOR YANG KAMI LAYANI',
mkt_sub:'Melayani berbagai sektor strategis nasional — dari pembangkit listrik, transmisi PLN, hingga industri minyak & gas dan properti komersial.',
mk1:'PLN & Utilitas',
mk1p:'Gardu induk, transmisi, dan distribusi tegangan tinggi untuk infrastruktur ketenagalistrikan nasional.',
mk2:'Industri & Manufaktur',
mk2p:'Instalasi dan commissioning sistem kelistrikan untuk pabrik, smelter, dan fasilitas industri berskala besar.',
mk3:'Energi Terbarukan',
mk3p:'PLTS on-grid, off-grid, hybrid, dan floating solar untuk proyek pembangkit energi bersih skala utilitas.',
mk4:'Infrastruktur & Properti',
mk4p:'Instalasi M&E untuk gedung komersial, kawasan industri, data center, dan infrastruktur publik.',
mk5:'Oil, Gas & Pertambangan',
mk5p:'Sistem kelistrikan untuk fasilitas migas, pertambangan, dan proses industri dengan standar keselamatan tinggi.',
eq_ey:'Peralatan Kami',
eq_h2:'ALAT UJI\nKELAS DUNIA',
eq_sub:'Peralatan Omicron CMC 356, Kocos ACTAS P260, dan Megger DLRO 200 — standar industri internasional untuk akurasi pengukuran tertinggi.',
ct_ey:'Hubungi Kami',
ct_h2:'SIAP MENJADI\nMITRA PROYEK\nANDA',
ct_p:'Tim teknis kami siap merespons kebutuhan proyek Anda. Konsultasi gratis, tanpa kewajiban. Beroperasi di seluruh Indonesia.',
cl1:'Telepon / WhatsApp',
cl2:'Email',
cl3:'Jam Operasional',
cl4:'Website',
wa_cta:'Hubungi via WhatsApp',
frm_h:'Kirim Pesan',
frm_p:'Isi form di bawah dan tim kami akan menghubungi Anda dalam 1x24 jam.',
fl1:'Nama Lengkap',
fl2:'Nomor WhatsApp',
fl3:'Perusahaan / Instansi',
fl4:'Layanan',
fl5:'Detail Proyek',
fo0:'Pilih Layanan',
fo1:'Instalasi Listrik',
fo2:'Testing & Commissioning',
fo3:'Solar Panel / PLTS',
fo4:'Gardu Induk',
fo5:'Preventive Maintenance',
fo6:'Konsultansi Teknis',
fsub:'Kirim via WhatsApp →',
ft_desc:'Mitra terpercaya untuk solusi kelistrikan tegangan tinggi, telekomunikasi, dan energi surya. Tersertifikasi ISO 9001, 14001, dan 45001. Beroperasi aktif di seluruh Indonesia.',
fc_svc:'Layanan',
fc1:'Instalasi Listrik',
fc2:'Testing & Commissioning',
fc3:'Solar PV',
fc4:'Gardu Induk',
fc5:'Maintenance',
fc_co:'Perusahaan',
fca:'Tentang',
fcb:'Visi & Misi',
fcc:'Proyek',
fcd:'Peralatan',
fc_ct:'Kontak',
m_about:'Tentang Kami',
m_services:'Layanan',
m_projects:'Proyek',
m_contact:'Kontak',
calc_h2a:'ESTIMASI KEBUTUHAN',
calc_h2b:'SOLAR PV ANDA',
cert_iso1:'Quality Management System',
cert_iso2:'Environmental Management',
cert_iso3:'Occupational Health &amp; Safety',
cert_d1:'Sistem manajemen mutu terstandarisasi internasional untuk konsistensi kualitas layanan.',
cert_d2:'Komitmen pengelolaan lingkungan yang bertanggung jawab dalam setiap proses konstruksi.',
cert_d3:'Standar keselamatan dan kesehatan kerja internasional — zero accident menjadi prioritas.',
partners_ey:'Partner\'s Appreciation',
partners_h2:'DIAKUI OLEH PARTNER<br><em style="font-style:normal;color:var(--red)" data-i="appr_h2b">KELAS DUNIA</em>',
partners_p:'Kepercayaan mitra yang diwujudkan dalam surat penghargaan resmi atas keberhasilan penyelesaian proyek.',
eq_t1:'CMC 356 — Secondary Relay Tester',
eq_t2:'ACTAS P260 — Circuit Breaker Analyzer',
eq_t3:'DLRO 200 — Contact Resistance Meter',
eq_t4:'High Voltage Equipment Testing',
eq_t5:'Primary Injection — CPC 100',
eq_t6:'Relay Protection Configuration',
eq_av1:'Tersedia — Sewa / Mobilisasi',
eq_av2:'Tersedia — Mobilisasi ke Lokasi',
eq_fo:'FIELD OPERATIONS',
calc_l_input:'Parameter Input',
calc_l_kwh:'Konsumsi Harian',
calc_l_tagihan:'Estimasi dari tagihan',
calc_l_tarif:'Tarif PLN',
calc_l_luas:'Luas Atap',
calc_l_jenis:'Jenis Sistem',
calc_l_eff:'Efisiensi (%)',
calc_l_buf:'Buffer (%)',
calc_l_harga:'Harga/kWp (Rp jt)',
calc_l_esk:'Eskalasi %/thn',
calc_l_kap:'Kapasitas Sistem',
calc_l_inv:'Estimasi Investasi',
calc_l_hemat:'Hemat / Tahun',
calc_l_roi:'Balik Modal',
calc_l_co2:'Reduksi CO₂',
calc_l_proy:'Proyeksi 10 Tahun',
calc_l_th:'Total Hemat',
calc_l_np:'Net Profit',
calc_l_cov:'Cakupan Kebutuhan',
calc_yr1:'Thn 1',
calc_yr10:'Thn 10',
calc_wa_cta:'Konsultasi Gratis via WhatsApp',
proj_showing:'Menampilkan',
proj_of:'dari',
proj_done:'proyek selesai',
ct_addr_h:'Alamat Lengkap',
ct_maps:'Lihat di Google Maps',
unit_kwh:'kWh/hari',
tarif_o0:'Rp 1.115 R-1',tarif_o1:'Rp 1.352 R-2',tarif_o2:'Rp 1.441 B-2',tarif_o3:'Rp 1.699 B-3',
tarif_1:'Rp 1.115 — R-1 Rumah Tangga 900VA',tarif_d0:'Rp 1.115 — R-1 Rumah Tangga 900VA',
tarif_2:'Rp 1.352 — R-1/R-2 Rumah Tangga',tarif_d1:'Rp 1.352 — R-1/R-2 Rumah Tangga',
tarif_3:'Rp 1.441 — B-2/I-2 Bisnis/Industri',tarif_d2:'Rp 1.441 — B-2/I-2 Bisnis/Industri',
tarif_4:'Rp 1.699 — B-3 Bisnis Besar',tarif_d3:'Rp 1.699 — B-3 Bisnis Besar',
tarif_5:'Rp 1.036 — S-2 Sosial',tarif_d4:'Rp 1.036 — S-2 Sosial',
calc_psh_lbl:'PSH',
reg_1:'Jabar/Jabodetabek',loc_jabar:'Jabar/Jabodetabek',
reg_2:'Jateng/DIY',loc_jateng:'Jateng/DIY',
reg_3:'Jatim',loc_jatim:'Jatim',
reg_4:'Sumut/Riau',loc_sumut:'Sumut/Riau',
reg_5:'Sumsel/Lampung',loc_sumsel:'Sumsel/Lampung',
reg_6:'Kalimantan',loc_kal:'Kalimantan',
reg_7:'Sulawesi',loc_sul:'Sulawesi',
reg_8:'Bali/NTB/NTT',loc_bali:'Bali/NTB/NTT',
reg_9:'Papua',loc_papua:'Papua',
sys_ongrid:'On-Grid',sys_hybrid:'Hybrid',sys_offgrid:'Off-Grid',
calc_ongrid:'On-Grid',calc_hybrid:'Hybrid',calc_offgrid:'Off-Grid',
calc_adv:'Parameter Lanjutan',
calc_unit_panel:'— panel surya',
calc_panel_sfx:'unit',
calc_l_ret:'Return',
calc_h2b:'SOLAR PV ANDA',
cert_name1:'Quality Management System',
cert_name2:'Environmental Management',
cert_name3:'Occupational Health & Safety',
cert_name4:'Sertifikat Badan Usaha',
cert_d4:'Terdaftar resmi di LPJK dengan SBU Transmisi Tenaga Listrik dan IUJK Konstruksi Elektrikal dari Kementerian PUPR.',
pd0:'Testing and Commissioning 1 Bay Transformer 150 kV.',
pd1:'Installation &amp; Commissioning Service sistem tegangan tinggi di kawasan industri Batam — proyek aktif 2026.',
pd2:'Testing &amp; Commissioning Relay Protection tegangan ekstra tinggi.',
pd3:'Kontrak pemeliharaan preventif jangka panjang GI Bekaert &amp; GI PLN Teluk Jambe.',
pd4:'Installation Grounding System GITET 500 kV tegangan ekstra tinggi.',
pd5:'Pemasangan sistem solar rooftop 500 kWp, integrasi inverter &amp; monitoring real-time.',
pd6:'Testing and Commissioning 7 Bay 150 kV GIS.',
pd7:'Pemasangan lengkap panel distribusi tegangan menengah &amp; rendah, termasuk bus duct dan kabel daya.',
pd8:'Testing and Commissioning HV Equipment gardu induk.',
pd9:'Overhaul &amp; kalibrasi relay proteksi digital di 8 GI wilayah Jawa Barat, termasuk pengujian diferensial &amp; REF.',
pd10:'TC &amp; Relay Testing sistem tegangan tinggi, uji proteksi jarak &amp; diferensial.',
pd11:'Integrasi PLTS Hybrid dengan genset diesel untuk stasiun terpencil, 200 kWp + storage baterai.',
pd12:'Penarikan &amp; terminasi kabel tanah tegangan menengah 20 kV sepanjang 4,2 km.',
pd13:'Pengadaan, instalasi &amp; konfigurasi sistem SCADA baru beserta RTU di 5 GI wilayah Jawa Barat.',
pd14:'Perancangan &amp; instalasi sistem pembumian gardu induk sesuai standar IEC 61936.',
pd15:'Pembongkaran, inspeksi, penggantian komponen &amp; uji dielektrik trafo daya 60 MVA.',
appr_proj_lbl:'Proyek',
cert_s_active:'Tersertifikasi',
cert_s_reg:'Terdaftar Resmi',
topbar_tag:'Inovatif & Kooperatif',
calc_l_steps:'Langkah Kalkulasi',
calc_s1:'① kWh/hari konsumsi',
calc_s2:'② Energi kotor (÷ eff)',
calc_s3:'③ kWp min (÷ PSH)',
calc_s4:'④ kWp + buffer 25%',
calc_s5:'⑤ Jumlah panel (ceil)',
calc_s6:'⑥ Produksi bersih/hari',
calc_def_eff:'Default 85%',
calc_def_buf:'Default 25%',
calc_def_harga:'Material+pasang',
calc_def_esk:'Kenaikan tarif PLN',
calc_l_wil:'Wilayah',
calc_l_panel:'Panel',
calc_disc:'* Sizing panel tidak dipengaruhi jenis sistem maupun tarif PLN — murni dari kWh/hari, efisiensi, buffer, Wp panel, dan PSH wilayah. Jenis sistem mengubah harga/kWp; tarif PLN mengubah proyeksi penghematan. Proyeksi 10 tahun memakai eskalasi tarif tahunan. Angka bersifat estimasi; konsultasikan ke tim Magflow untuk penawaran resmi.',
ph_name:'Nama lengkap',
ph_wa:'08xxxxxxxxxx',
ph_company:'Nama perusahaan (opsional)',
ph_msg:'Ceritakan kebutuhan proyek Anda...',
appr_h2b:'KELAS DUNIA',
appr_date2:'22 Januari 2024',
appr_badge1:'On Time Delivery',
appr_badge2:'Well Received',
ct_download:'Download Company Profile 2026',
ft_copy:'© 2026 PT. Magflow Elektrindo Persada. All rights reserved.',
ft_tagline:'Electrical · Solar · Commissioning · 2026',
ft_region:'Jawa Barat, Indonesia',
proj_cirata_p:'PdM PLTS Cirata Onshore & Offshore — terbesar di Asia Tenggara. Predictive Maintenance sistem panel surya terapung 145 MWac, meliputi inspeksi drone, IV curve, dan thermography.',
sol_cap:'145 MWac — Terbesar di Asia Tenggara',
tc_s1:'Insulation Resistance Test (Megger)',
tc_s2:'Earth / Ground Resistance Testing',
tc_s3:'Contact Resistance (Micro Ohm Meter)',
tc_s4:'Relay Protection Testing & Setting',
tc_s5:'CT/PT Ratio Test (CTAnalyzer Omicron)',
tc_s6:'Circuit Breaker Timing Test (Kocos)',
tc_s7:'Primary Injection (CPC100 Omicron)',
tc_s8:'Secondary Injection (CMC 356 Omicron)',
tc_s9:'SF6 Gas Handling & Filling',
tc_s10:'Power Quality Analysis',
eq1_title:'CMC 356 — Secondary Relay Tester',
eq1_s1:'Arus output hingga 3×64 A / tegangan 3×300 V',
eq1_s2:'Uji semua jenis relay proteksi (distance, differential, overcurrent)',
eq1_s3:'Frekuensi 10 Hz – 3 kHz, resolusi waktu 0.1 μs',
eq1_s4:'Kompatibel IEC 61850, DNP3, GOOSE',
eq2_title:'ACTAS P260 — Circuit Breaker Analyzer',
eq2_s1:'Analisis waktu buka/tutup CB dengan akurasi ±0.1 ms',
eq2_s2:'Pengukuran arus coil (trip & close), bounce time',
eq2_s3:'Uji 3 hingga 4 kutub serentak, channel hingga 16 input',
eq2_s4:'Perekaman kecepatan kontak CB (opsional sensor)',
eq3_title:'DLRO 200 — Contact Resistance Meter',
eq3_s1:'Arus injeksi DC hingga 200 A dengan akurasi ±0.2%',
eq3_s2:'Rentang ukur 0.1 μΩ – 100 mΩ',
eq3_s3:'Uji kontak CB, busbar joint, sambungan kabel MV/HV',
eq3_s4:'Simpan & ekspor data via USB / software PowerDB',
eq4_title:'High Voltage Equipment Testing',
eq4_s1:'Withstand & hipot test 6.6 kV – 500 kV',
eq4_s2:'Insulation resistance (IR) & polarization index (PI)',
eq4_s3:'Partial discharge measurement & tan δ (dissipation factor)',
eq4_s4:'Pengujian transformator, kabel, GIS di lapangan',
eq5_title:'Primary Injection — CPC 100',
eq5_s1:'Output arus primer hingga 2.000 A (AC/DC)',
eq5_s2:'Tegangan output 2 kV, daya hingga 10 kVA',
eq5_s3:'Uji CT ratio, burden, CT saturation, transformer turns ratio',
eq5_s4:'Integrasi modul CP TD1 untuk tes impedansi & kapasitansi',
eq6_title:'Relay Protection Configuration',
eq6_s1:'Setting & konfigurasi relay Siemens, SEL, ABB, GE, Schneider',
eq6_s2:'Koordinasi proteksi sistem distribusi 20 kV – 500 kV',
eq6_s3:'Upload / download setting via software vendor resmi',
eq6_s4:'Verifikasi logic, GOOSE, SAS integration (IEC 61850)',
iso_c1:'ISO 9001:2015 Quality Management',
iso_c2:'ISO 14001 Environmental',
iso_c3:'ISO 45001 Occupational Safety',
iso_c4:'SBU Transmisi Tenaga Listrik',
iso_c5:'IUJK — Konstruksi Elektrikal',
iso_c6:'65+ Proyek Selesai',
iso_c7:'K3 Zero Accident',
iso_c8:'Jawa & Bali Coverage',
iso_c9b:'5+ Tahun Pengalaman',
m_calc:'Kalkulator PLTS',
m_mkt:'Sektor',
proj_count_pre:'Menampilkan',
calc_reset:'Reset Kalkulator',
ct_hours_h:'Jam Operasional',
ct_hours_v:'Senin – Jumat, 08.00 – 17.00 WIB',
ct_resp_h:'Waktu Respons',
ct_resp_v:'Maks 1×24 jam via WhatsApp',
ct_cov_h:'Area Layanan',
ct_cov_v:'Jawa, Bali, Sumatera, Kalimantan & NTT',
ct_why_h:'Mengapa Magflow?',
ct_why1:'65+ proyek selesai — gardu induk hingga PLTS terapung',
ct_why2:'Bersertifikat ISO 9001, 14001, 45001 & BNSP',
ct_why3:'Bermitra dengan Siemens, PLN, PowerChina, Pertamina'},
en:{cert_d3:'International occupational health and safety standards — zero accident priority.',
nav_svc:'Services',
nav_calc:'PLTS Calculator',
nav_proj:'Projects',
nav_mkt:'Sectors',
nav_ct:'Contact',
calc_ey:'Estimation Calculator',
calc_sub:'Enter daily consumption and location details for panel capacity estimation, investment cost, and 10-year return projection.',
nav_cta:'Free Consultation',
hero_tag:'Innovative & Cooperative Since 2020',
h1a:'ELECTRICAL ENGINEERING',
h1b:'& SOLAR ENERGY',
h1c:'SOLUTIONS',
hero_p:'From 500 kV substations to a 145 MWac floating solar plant — we deliver every project in the field with BNSP-certified engineers and international standards.',
btn_wa:'Contact Us',
btn_proj:'View Projects',
hs1:'Projects Completed',
hs2:'Years Experience',
hs3:'Highest Voltage',
iso_lbl:'Certified & Standardized',
ss1:'Projects Completed',
ss2:'Years Experience',
ss3:'Highest Voltage',
ab_ey:'About the Company',
ab_h2:'EXPERIENCED IN\nHIGH VOLTAGE &\nSOLAR ENERGY',
ab_q:'"Since 2020, we have handled projects from 150 kV substations in Batam to the 145 MWac floating solar plant in Cirata — all executed directly in the field."',
ab_p:'Specialist contractor in high-voltage electrical, telecommunications, and solar energy since 2020. Experienced in national-scale projects with PLN, Siemens Energy, PowerChina, and Pertamina.',
ap1:'ISO 9001, 14001, and 45001 certified — quality, environmental, and OHS standards',
ap2:'Partners with Siemens Energy, PLN, PowerChina, Doosan, Huawei, and Bekaert',
ap3:'Handling projects from 70 kV to GITET 500 kV across Indonesia',
ap4:'BNSP-certified engineers, actively operating from Sumatra to NTT',
cert_ey:'Certifications & Legality',
cert_h2:'INTERNATIONAL STANDARDS\n& ACCREDITATION',
cert_p:'Operating under ISO 9001, 14001, and 45001 — international quality, environmental, and safety standards. All work adheres to PLN and ESDM technical regulations.',
vm_ey:'Company Direction',
vm_h2:'VISION & MISSION',
vis_h:'VISION',
mis_h:'MISSION',
vis_p:'To become a leading provider in high-voltage electrical, T&C, and solar energy — trusted by corporate clients and state-owned enterprises across Indonesia.',
mis_p:'To deliver full satisfaction and quality for every project, prioritizing K3 safety, on-time delivery, and the highest technical standards.',
m1:'Deliver high-quality services that exceed client expectations at every project stage.',
m2:'Continuously innovate processes, technology, and team competency — adopting the latest technical standards.',
m3:'Ensure K3 safety and client satisfaction through professional and fully documented execution.',
svc_ey:'Our Services',
svc_h2:'COMPLETE TECHNICAL\nSOLUTIONS',
svc_sub:'From planning to full commissioning — our specialist team handles the complete lifecycle of your electrical and solar energy projects.',
s1h:'Electrical & Mechanical Installation',
s1p:'Industrial-scale electrical and mechanical installation per PUIL 2011, SNI, and PLN technical regulations. Covers panel installation, power cables, grounding, and protection systems.',
s2h:'Testing & Commissioning',
s2p:'Comprehensive LV, MV, HV to EHV 500 kV system testing. Includes relay protection, power quality analysis, insulation testing, and functional tests per IEC and PLN standards.',
s3h:'Substation & Switchyard',
s3p:'Erection, installation, testing, and commissioning of 70–500 kV substations. Experienced in PLN GI, GITET, and industrial switchyards from Sumatra to Nusa Tenggara.',
s4h:'Solar Panel & PLTS',
s4p:'On-grid, off-grid, and hybrid solar PV installation for industrial and commercial needs. Including PLTS PdM services, rooftop solar, and large-scale floating solar.',
s5h:'Preventive Maintenance',
s5p:'Long-term preventive maintenance programs for power transformers, substations, and industrial electrical systems. Covers periodic inspections, condition testing, and component replacement.',
s6h:'Telecommunications & Consulting',
s6p:'Telecom network construction, SCADA/SAS system integration, technical engineering consulting, and electrical material procurement for large-scale projects.',
lm:'Consult',
lm2:'Details',
lm3:'Consult',
lm4:'Consult',
lm5:'Consult',
lm6:'Consult',
tc_ey:'Core Technical Expertise',
tc_h2:'ELECTRICAL TESTING\n& COMMISSIONING',
tc_p:'T&C process follows IEC 60364, IEEE, SNI PUIL, and PLN procedures. Every testing phase is documented in official auditable commissioning reports.',
ts1h:'Pre-Commissioning Inspection',
ts1p:'Verify all physical installations against SLD, technical specifications, and design documents before system energization.',
ts2h:'Electrical Testing & Measurement',
ts2p:'Insulation resistance, earth resistance, contact resistance, power quality, partial discharge, and infrared thermography.',
ts3h:'Energizing & Functional Test',
ts3p:'Staged energization, relay protection testing, setting configuration, and full control system functional testing.',
ts4h:'Acceptance & Handover',
ts4p:'Official handover minutes, as-built documents, complete T&C report, and operation manual delivered to client.',
tc_scope:'TESTING SCOPE',
tc_sp:'LV to EHV 500 kV systems.',
sol_ey:'Solar Energy',
sol_h2:'CIRATA 145 MWac\nFLOATING SOLAR\nPOWER PLANT',
sol_p:'Trusted by PT. PowerChina for PdM services at PLTS Cirata — the largest floating solar plant in Southeast Asia, 145 MWac on the Cirata Reservoir, West Java.',
sl1:'Capacity',
sl2:'Partner',
sl3:'Scope',
pr_ey:'Track Record',
pr_h2:'65+ PROJECTS\nCOMPLETED',
pr_sub:'Over 65 completed projects since 2020 — substation T&C, solar PV installation, and electrical maintenance across Indonesia.',
fa:'All',
fhv:'High Voltage',
fs:'Solar PV',
fm:'Maintenance',
fi:'Installation',
fo:'Ongoing',
clients_label:'Clients & Partners',
mkt_ey:'Target Market',
mkt_h2:'SECTORS WE SERVE',
mkt_sub:'Serving strategic national sectors — from power generation, PLN transmission, to oil & gas industry and commercial properties.',
mk1:'PLN & Utilities',
mk1p:'Substations, transmission, and high-voltage distribution for national power infrastructure.',
mk2:'Industry & Manufacturing',
mk2p:'Electrical installation and commissioning for factories, smelters, and large-scale industrial facilities.',
mk3:'Renewable Energy',
mk3p:'On-grid, off-grid, hybrid, and floating solar PV for utility-scale clean energy projects.',
mk4:'Infrastructure & Property',
mk4p:'M&E installation for commercial buildings, industrial estates, data centers, and public infrastructure.',
mk5:'Oil, Gas & Mining',
mk5p:'Electrical systems for oil & gas, mining, and industrial process facilities with high-safety standards.',
eq_ey:'Our Equipment',
eq_h2:'WORLD-CLASS\nTEST EQUIPMENT',
eq_sub:'Omicron CMC 356, Kocos ACTAS P260, and Megger DLRO 200 — international industry standard for the highest measurement accuracy.',
ct_ey:'Contact Us',
ct_h2:'READY TO BE YOUR\nPROJECT PARTNER',
ct_p:'Our technical team is ready to respond to your project needs. Free consultation, no obligation. Operating across Indonesia.',
cl1:'Phone / WhatsApp',
cl2:'Email',
cl3:'Office Hours',
cl4:'Website',
wa_cta:'Contact via WhatsApp',
frm_h:'Send a Message',
frm_p:'Fill in the form below and our team will contact you within 24 hours.',
fl1:'Full Name',
fl2:'WhatsApp Number',
fl3:'Company / Organization',
fl4:'Service',
fl5:'Project Details',
fo0:'Select Service',
fo1:'Electrical Installation',
fo2:'Testing & Commissioning',
fo3:'Solar Panel / PLTS',
fo4:'Substation',
fo5:'Preventive Maintenance',
fo6:'Technical Consulting',
fsub:'Send via WhatsApp →',
ft_desc:'Trusted partner for high-voltage electrical, telecommunications, and solar energy solutions. ISO 9001, 14001, and 45001 certified. Actively operating across Indonesia.',
fc_svc:'Services',
fc1:'Electrical Installation',
fc2:'Testing & Commissioning',
fc3:'Solar PV',
fc4:'Substation',
fc5:'Maintenance',
fc_co:'Company',
fca:'About',
fcb:'Vision & Mission',
fcc:'Projects',
fcd:'Equipment',
fc_ct:'Contact',
m_about:'About Us',
m_services:'Services',
m_projects:'Projects',
m_contact:'Contact',
cert_d2:'Responsible environmental management commitment in every construction process.',
cert_d1:'Internationally standardized quality management system for service consistency.',
cert_iso3:'Occupational Health &amp; Safety',
cert_iso2:'Environmental Management',
cert_iso1:'Quality Management System',
calc_h2a:'SOLAR PV',
calc_h2b:'SOLAR PV NEEDS',
nav_about:'About',
partners_ey:'Partner\'s Appreciation',
partners_h2:'RECOGNIZED BY<br><em style="font-style:normal;color:var(--red)">WORLD-CLASS PARTNERS</em>',
partners_p:'Trust from partners evidenced in official appreciation letters for successful project completions.',
eq_t1:'CMC 356 — Secondary Relay Tester',
eq_t2:'ACTAS P260 — Circuit Breaker Analyzer',
eq_t3:'DLRO 200 — Contact Resistance Meter',
eq_t4:'High Voltage Equipment Testing',
eq_t5:'Primary Current Injection — CPC 100',
eq_t6:'Relay Protection Configuration',
eq_av1:'Available — Rental / Mobilization',
eq_av2:'Available — On-Site Mobilization',
eq_fo:'FIELD OPERATIONS',
calc_l_input:'Input Parameters',
calc_l_kwh:'Daily Consumption',
calc_l_tagihan:'Estimate from bill',
calc_l_tarif:'PLN Electricity Rate',
calc_l_luas:'Roof Area',
calc_l_jenis:'System Type',
calc_l_eff:'Efficiency (%)',
calc_l_buf:'Buffer (%)',
calc_l_harga:'Price/kWp (Rp M)',
calc_l_esk:'Escalation %/yr',
calc_l_kap:'System Capacity',
calc_l_inv:'Investment Estimate',
calc_l_hemat:'Annual Savings',
calc_l_roi:'Break-even Period',
calc_l_co2:'CO₂ Reduction',
calc_l_proy:'10-Year Projection',
calc_l_th:'Total Savings',
calc_l_np:'Net Profit',
calc_l_cov:'Demand Coverage',
calc_yr1:'Yr 1',
calc_yr10:'Yr 10',
calc_wa_cta:'Free Consultation via WhatsApp',
proj_showing:'Showing',
proj_of:'of',
proj_done:'completed projects',
ct_addr_h:'Full Address',
ct_maps:'View on Google Maps',
unit_kwh:'kWh/day',
tarif_o0:'Rp 1,115 R-1',tarif_o1:'Rp 1,352 R-2',tarif_o2:'Rp 1,441 B-2',tarif_o3:'Rp 1,699 B-3',
tarif_1:'Rp 1,115 — R-1 Residential 900VA',tarif_d0:'Rp 1,115 — R-1 Residential 900VA',
tarif_2:'Rp 1,352 — R-1/R-2 Residential',tarif_d1:'Rp 1,352 — R-1/R-2 Residential',
tarif_3:'Rp 1,441 — B-2/I-2 Business/Industry',tarif_d2:'Rp 1,441 — B-2/I-2 Business/Industry',
tarif_4:'Rp 1,699 — B-3 Large Business',tarif_d3:'Rp 1,699 — B-3 Large Business',
tarif_5:'Rp 1,036 — S-2 Social',tarif_d4:'Rp 1,036 — S-2 Social',
calc_psh_lbl:'PSH',
reg_1:'West Java/Jabodetabek',loc_jabar:'West Java/Jabodetabek',
reg_2:'Central Java/DIY',loc_jateng:'Central Java/DIY',
reg_3:'East Java',loc_jatim:'East Java',
reg_4:'North Sumatra/Riau',loc_sumut:'North Sumatra/Riau',
reg_5:'South Sumatra/Lampung',loc_sumsel:'South Sumatra/Lampung',
reg_6:'Kalimantan',loc_kal:'Kalimantan',
reg_7:'Sulawesi',loc_sul:'Sulawesi',
reg_8:'Bali/NTB/NTT',loc_bali:'Bali/NTB/NTT',
reg_9:'Papua',loc_papua:'Papua',
sys_ongrid:'On-Grid',sys_hybrid:'Hybrid',sys_offgrid:'Off-Grid',
calc_ongrid:'On-Grid',calc_hybrid:'Hybrid',calc_offgrid:'Off-Grid',
calc_adv:'Advanced Parameters',
calc_unit_panel:'— solar panels',
calc_panel_sfx:'panels',
calc_l_ret:'Return',
calc_h2b:'SOLAR PV NEEDS',
cert_name1:'Quality Management System',
cert_name2:'Environmental Management',
cert_name3:'Occupational Health & Safety',
cert_name4:'Registered Business Entity',
cert_d4:'Officially registered with LPJK, holding SBU Power Transmission and IUJK Electrical Construction from the Ministry of PUPR.',
pd0:'Testing and Commissioning of 1 Bay 150 kV Transformer.',
pd1:'Installation &amp; Commissioning Service for high-voltage systems in Batam industrial zone — active project 2026.',
pd2:'Testing &amp; Commissioning of extra-high-voltage Relay Protection.',
pd3:'Long-term preventive maintenance contract for Bekaert GI &amp; PLN Teluk Jambe GI.',
pd4:'Grounding System installation for 500 kV GITET extra-high-voltage substation.',
pd5:'Installation of 500 kWp rooftop solar system with inverter integration &amp; real-time monitoring.',
pd6:'Testing and Commissioning of 7 Bay 150 kV GIS.',
pd7:'Complete installation of MV &amp; LV distribution panels, including bus duct and power cables.',
pd8:'Testing and Commissioning of HV Equipment at the substation.',
pd9:'Overhaul &amp; calibration of digital protection relays at 8 substations in West Java, including differential &amp; REF testing.',
pd10:'TC &amp; Relay Testing for high-voltage systems, distance &amp; differential protection testing.',
pd11:'Hybrid solar PV integration with diesel generator for remote station, 200 kWp + battery storage.',
pd12:'Pulling &amp; termination of 20 kV MV underground cable over 4.2 km.',
pd13:'Procurement, installation &amp; configuration of new SCADA systems with RTU at 5 substations in West Java.',
pd14:'Design &amp; installation of substation earthing system per IEC 61936 standard.',
pd15:'Disassembly, inspection, component replacement &amp; dielectric testing of 60 MVA power transformer.',
appr_proj_lbl:'Project',
cert_s_active:'Certified',
cert_s_reg:'Officially Registered',
topbar_tag:'Innovative & Cooperative',
calc_l_steps:'Calculation Steps',
calc_s1:'① kWh/day consumption',
calc_s2:'② Gross energy (÷ eff)',
calc_s3:'③ Min kWp (÷ PSH)',
calc_s4:'④ kWp + 25% buffer',
calc_s5:'⑤ Panel count (ceil)',
calc_s6:'⑥ Net production/day',
calc_def_eff:'Default 85%',
calc_def_buf:'Default 25%',
calc_def_harga:'Materials + installation',
calc_def_esk:'PLN rate increase',
calc_l_wil:'Region',
calc_l_panel:'Panel',
calc_disc:'* Panel sizing is independent of system type and PLN tariff — based purely on kWh/day, efficiency, buffer, panel Wp, and regional PSH. System type changes price/kWp; PLN tariff changes savings projection. The 10-year projection uses annual tariff escalation. Figures are estimates; consult Magflow for an official quote.',
ph_name:'Full name',
ph_wa:'+628xxxxxxxxx',
ph_company:'Company name (optional)',
ph_msg:'Tell us about your project needs...',
appr_h2b:'WORLD CLASS',
appr_date2:'January 22, 2024',
appr_badge1:'On Time Delivery',
appr_badge2:'Well Received',
ct_download:'Download Company Profile 2026',
ft_copy:'© 2026 PT. Magflow Elektrindo Persada. All rights reserved.',
ft_tagline:'Electrical · Solar · Commissioning · 2026',
ft_region:'West Java, Indonesia',
proj_cirata_p:'PdM of Cirata Floating Solar Onshore &amp; Offshore — largest in Southeast Asia. Predictive Maintenance of the 145 MWac floating solar array including drone inspection, IV curve, and thermography.',
sol_cap:'145 MWac — Largest in Southeast Asia',
tc_s1:'Insulation Resistance Test (Megger)',
tc_s2:'Earth / Ground Resistance Testing',
tc_s3:'Contact Resistance (Micro Ohm Meter)',
tc_s4:'Relay Protection Testing &amp; Setting',
tc_s5:'CT/PT Ratio Test (CTAnalyzer Omicron)',
tc_s6:'Circuit Breaker Timing Test (Kocos)',
tc_s7:'Primary Injection (CPC100 Omicron)',
tc_s8:'Secondary Injection (CMC 356 Omicron)',
tc_s9:'SF6 Gas Handling &amp; Filling',
tc_s10:'Power Quality Analysis',
eq1_title:'CMC 356 — Secondary Relay Tester',
eq1_s1:'Output current up to 3×64 A / voltage 3×300 V',
eq1_s2:'Test all relay types (distance, differential, overcurrent)',
eq1_s3:'Frequency 10 Hz – 3 kHz, time resolution 0.1 μs',
eq1_s4:'Compatible with IEC 61850, DNP3, GOOSE',
eq2_title:'ACTAS P260 — Circuit Breaker Analyzer',
eq2_s1:'CB open/close timing with ±0.1 ms accuracy',
eq2_s2:'Coil current measurement (trip &amp; close), bounce time',
eq2_s3:'Test 3–4 poles simultaneously, up to 16 input channels',
eq2_s4:'CB contact velocity recording (optional sensor)',
eq3_title:'DLRO 200 — Contact Resistance Meter',
eq3_s1:'DC injection up to 200 A with ±0.2% accuracy',
eq3_s2:'Measurement range 0.1 μΩ – 100 mΩ',
eq3_s3:'Test CB contacts, busbar joints, MV/HV cable connections',
eq3_s4:'Save &amp; export data via USB / PowerDB software',
eq4_title:'High Voltage Equipment Testing',
eq4_s1:'Withstand &amp; hipot test 6.6 kV – 500 kV',
eq4_s2:'Insulation resistance (IR) &amp; polarization index (PI)',
eq4_s3:'Partial discharge &amp; tan δ (dissipation factor)',
eq4_s4:'On-site testing of transformers, cables, and GIS',
eq5_title:'Primary Current Injection — CPC 100',
eq5_s1:'Primary current output up to 2,000 A (AC/DC)',
eq5_s2:'Output voltage 2 kV, power up to 10 kVA',
eq5_s3:'CT ratio, burden, CT saturation, turns ratio testing',
eq5_s4:'CP TD1 module for impedance &amp; capacitance testing',
eq6_title:'Relay Protection Configuration',
eq6_s1:'Setting &amp; configuration of Siemens, SEL, ABB, GE, Schneider relays',
eq6_s2:'Protection coordination for 20 kV – 500 kV systems',
eq6_s3:'Upload / download settings via official vendor software',
eq6_s4:'Logic verification, GOOSE, SAS integration (IEC 61850)',
iso_c1:'ISO 9001:2015 Quality Management',
iso_c2:'ISO 14001 Environmental',
iso_c3:'ISO 45001 Occupational Safety',
iso_c4:'SBU Power Transmission',
iso_c5:'IUJK — Electrical Construction',
iso_c6:'65+ Projects Completed',
iso_c7:'K3 Zero Accident',
iso_c8:'Java & Bali Coverage',
iso_c9b:'5+ Years Experience',
m_calc:'PLTS Calculator',
m_mkt:'Sectors',
proj_count_pre:'Showing',
calc_reset:'Reset Calculator',
ct_hours_h:'Operating Hours',
ct_hours_v:'Monday – Friday, 08:00 – 17:00 WIB',
ct_resp_h:'Response Time',
ct_resp_v:'Max 1×24 hours via WhatsApp',
ct_cov_h:'Service Area',
ct_cov_v:'Java, Bali, Sumatra, Kalimantan & NTT',
ct_why_h:'Why Magflow?',
ct_why1:'65+ completed projects — substations to floating solar',
ct_why2:'ISO 9001, 14001, 45001 & BNSP certified',
ct_why3:'Partners: Siemens, PLN, PowerChina, Pertamina'}
};
if(typeof CL==='undefined') var CL='id';
function setLang(l){
 document.documentElement.lang=(l==='en'?'en':'id');
 try{sessionStorage.setItem('magflow_lang',l);}catch(e){}
 document.title=l==='en'?'PT. Magflow Elektrindo Persada – T&C, Solar PV & Electrical':'PT. Magflow Elektrindo Persada – T&C, PLTS & Kelistrikan';
 CL=l;
 document.querySelectorAll('.lang-sw button').forEach((b,i)=>b.classList.toggle('on',i===(l==='id'?0:1)));
 document.querySelectorAll('[data-i]').forEach(el=>{
  const k=el.getAttribute('data-i');
  if(T[l]&&T[l][k]!==undefined){var v=T[l][k].replace(/\\n/g,'<br>');if(el.tagName==='OPTION'||el.tagName==='BUTTON'||el.tagName==='SPAN'||el.tagName==='LABEL')el.textContent=T[l][k];else el.innerHTML=v;}
 });
 document.querySelectorAll('[data-ph]').forEach(el=>{
  const k=el.getAttribute('data-ph');
  if(T[l]&&T[l][k]!==undefined) el.placeholder=T[l][k];
 });



 // Update aria-labels for language
 const mmBtn=document.querySelector('[onclick*="openMM"]');
 if(mmBtn) mmBtn.setAttribute('aria-label',l==='en'?'Open navigation menu':'Buka menu navigasi');
 const svcPrev=document.getElementById('svcPrev');
 if(svcPrev) svcPrev.setAttribute('aria-label',l==='en'?'Previous service':'Layanan sebelumnya');
 const svcNext=document.getElementById('svcNext');
 if(svcNext) svcNext.setAttribute('aria-label',l==='en'?'Next service':'Layanan berikutnya');
 // Format dates based on language
 document.querySelectorAll('[data-date]').forEach(el=>{
  const d=new Date(el.getAttribute('data-date'));
  if(isNaN(d)) return;
  el.textContent=d.toLocaleDateString(l==='en'?'en-GB':'id-ID',{day:'numeric',month:'long',year:'numeric'});
 });
 // Update WA links language
 const waMessages = {
  id: {
   wa1: 'Halo, saya ingin mengetahui lebih lanjut tentang layanan PT. Magflow Elektrindo Persada',
   wa4: 'Halo Magflow, saya ingin konsultasi estimasi PLTS.',
   wa5: 'Halo PT. Magflow Elektrindo Persada, saya ingin konsultasi',
  },
  en: {
   wa1: 'Hello, I would like to learn more about PT. Magflow Elektrindo Persada services',
   wa4: 'Hello Magflow, I would like to consult about solar PV estimation.',
   wa5: 'Hello PT. Magflow Elektrindo Persada, I would like a consultation',
  }
 };
 document.querySelectorAll('[data-wa-key]').forEach(el=>{
  const key=el.getAttribute('data-wa-key');
  const msgs=waMessages[l]||waMessages.id;
  if(msgs[key]){
   const base='https://wa.me/6281210616143?text=';
   el.href=base+encodeURIComponent(msgs[key]);
  }
 });
 if(typeof hitungPLTS==='function') hitungPLTS();
}function dismissLoader(){
 if(window._loaderTimer)clearTimeout(window._loaderTimer);
 const ld=document.getElementById('loader');
 if(ld&&!ld.classList.contains('gone')){
  ld.classList.add('gone');
  const hi=document.getElementById('heroImg');
  if(hi)hi.classList.add('loaded');
  try{const sl=sessionStorage.getItem('magflow_lang');if(sl&&sl!=='id')setLang(sl);}catch(e){}
 }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(dismissLoader,200));
function updateNav(){
 const s = scrollY > 80;
 const navEl = document.getElementById('nav');
 const tb = document.querySelector('.topbar');
 navEl.classList.toggle('on', s);
 if(tb){
 if(s){
 tb.style.transform = 'translateY(-100%)';
 navEl.style.top = '0';
 } else {
 tb.style.transform = '';
 navEl.style.top = tb.offsetHeight + 'px';
 }
 }
}
window.addEventListener('scroll', updateNav);
document.addEventListener('DOMContentLoaded', updateNav);
updateNav();
document.querySelectorAll('a[href^="#"]').forEach(link => {
 link.addEventListener('click', function(e) {
 const href = this.getAttribute('href');
 if (href === '#') return;
 const target = document.querySelector(href);
 if (!target) return;
 e.preventDefault();
 const mmenu = document.getElementById('mmenu');
 if (mmenu) mmenu.classList.remove('open');
 const navEl = document.getElementById('nav');
 const offset = navEl ? navEl.offsetHeight : 70;
 const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
 window.scrollTo({ top, behavior: 'smooth' });
 });
});
const ro=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');ro.unobserve(e.target);}}),{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv,.rv-l,.rv-r').forEach(el=>ro.observe(el));
function runCount(el,target){
 const sfx=el.querySelector('em')?el.querySelector('em').outerHTML:'';
 let s=0;const dur=1600;
 const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);el.innerHTML=Math.floor(p*target)+sfx;if(p<1)requestAnimationFrame(step);};
 requestAnimationFrame(step);
}
const co=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&e.target.dataset.count){runCount(e.target,+e.target.dataset.count);co.unobserve(e.target);}}),{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
function openMM(){document.getElementById('mmenu').classList.add('open');}
function closeMM(){document.getElementById('mmenu').classList.remove('open');}
document.getElementById('mmClose').onclick=closeMM;
function fProj(cat,btn){
  document.querySelectorAll('.proj-filter button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  var cards = document.querySelectorAll('.proj-card');
  var visible = 0;
  cards.forEach(function(c){
    var show = cat==='all' || c.dataset.cat===cat;
    c.classList.toggle('hide', !show);
    if(show) visible++;
  });
  var el = document.getElementById('projVisible');
  if(el) el.textContent = visible;
}

// ── WA FORM ───────────────────────────────────────────────
function sendWA(){
  const isEN = (typeof CL !== 'undefined' && CL === 'en');
  const n=document.getElementById('fn').value.trim();
  const w=document.getElementById('fw').value.trim();
  const c=document.getElementById('fc2').value.trim()||'-';
  const s=document.getElementById('fsel').value||'-';
  const m=document.getElementById('fmsg').value.trim()||'-';
  if(!n){
    const fnEl=document.getElementById('fn');
    fnEl.style.borderColor='#C0152A';
    fnEl.focus();
    fnEl.placeholder=isEN?'Name is required':'Nama wajib diisi';
    setTimeout(()=>{fnEl.style.borderColor='';fnEl.placeholder=isEN?'Full Name':'Nama lengkap';},3000);
    return;
  }
  if(!w||!/^(\+62|08)\d{8,12}$/.test(w.replace(/\s/g,''))){
    const fwEl=document.getElementById('fw');
    fwEl.style.borderColor='#C0152A';
    fwEl.focus();
    fwEl.placeholder=isEN?'Valid WA number required (08xx/+62xx)':'Nomor WA wajib diisi (08xx/+62xx)';
    setTimeout(()=>{fwEl.style.borderColor='';fwEl.placeholder='08xxxxxxxxxx';},3000);
    return;
  }
  const greeting = isEN
    ? `Hello PT. Magflow Elektrindo Persada,\n\n*Name:* ${n}\n*WA:* ${w}\n*Company:* ${c}\n*Service:* ${s}\n*Details:*\n${m}`
    : `Halo PT. Magflow Elektrindo Persada,\n\n*Nama:* ${n}\n*WA:* ${w}\n*Perusahaan:* ${c}\n*Layanan:* ${s}\n*Detail:*\n${m}`;
  const msg=encodeURIComponent(greeting);
  window.open('https://wa.me/6281210616143?text='+msg,'_blank');
  // Reset form
  ['fn','fw','fc2','fmsg'].forEach(id=>{
    var el=document.getElementById(id);
    if(el) el.value='';
  });
  var sel=document.getElementById('fsel');
  if(sel) sel.selectedIndex=0;
}

// ══════════════════════════════════════════════════════════
// TC CANVAS — Relay Protection Testing Animation
// CMC 356 Omicron → Relay → Trip Coil → Circuit Breaker

// ══════════════════════════════════════════════════════
// TC CANVAS — Relay Protection Testing (UPGRADED)

/* ---- Inline script block 4 ---- */
(function(){
  const cv=document.getElementById('tcCanvas');
  if(!cv||typeof cv.getContext!=='function')return;
  const ctx=cv.getContext('2d');
  function resize(){cv.width=cv.parentElement.clientWidth||520;cv.height=320;}
  resize();window.addEventListener('resize',resize);
  const TESTS=[
    {name:'OVERCURRENT',fn:'50/51',I:'2.50A',t:'350ms',col:'#38bdf8'},
    {name:'EARTH FAULT',fn:'50N/51N',I:'0.50A',t:'200ms',col:'#a78bfa'},
    {name:'DIFF PROT.',fn:'87T',I:'0.30A',t:'0ms',col:'#fb923c'},
    {name:'DISTANCE Z1',fn:'21',I:'5.00A',t:'80ms',col:'#4ade80'},
  ];
  const PD=[80,110,65,50,85,80,50];
  let phase=0,pt=0,cycle=0,frame=0,wOff=0,flash=0,pFlash=0,injParts=[],trSparks=[];
  class IP{constructor(x1,y1,x2,y2,c){this.x=x1;this.y=y1;this.tx=x2;this.ty=y2;this.c=c;this.t=0;this.s=.013+Math.random()*.007;this.r=2+Math.random()*1.5;}go(){this.t+=this.s;return this.t<=1;}draw(){const x=this.x+(this.tx-this.x)*this.t,y=this.y+(this.ty-this.y)*this.t;ctx.save();ctx.globalAlpha=(1-this.t)*.9;ctx.fillStyle=this.c;ctx.shadowBlur=10;ctx.shadowColor=this.c;ctx.beginPath();ctx.arc(x,y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
  class TS{constructor(x,y){this.x=x;this.y=y;const a=Math.random()*Math.PI*2,s=2+Math.random()*3;this.vx=Math.cos(a)*s;this.vy=Math.sin(a)*s;this.l=1;this.c=Math.random()>.5?'#fbbf24':'#f87171';this.r=1.5+Math.random()*2;}go(){this.x+=this.vx;this.y+=this.vy;this.vy+=.1;this.l-=.03;return this.l>0;}draw(){ctx.save();ctx.globalAlpha=this.l;ctx.fillStyle=this.c;ctx.shadowBlur=6;ctx.shadowColor=this.c;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
  function bx(x,y,w,h,fill,stroke,glow){ctx.save();ctx.shadowBlur=glow;ctx.shadowColor=stroke;ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,5);ctx.fill();ctx.stroke();ctx.restore();}
  function lb(s,x,y,sz,c,bold){ctx.save();ctx.fillStyle=c;ctx.font=(bold?'bold ':'')+sz+'px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y);ctx.restore();}
  function wr(x1,y1,x2,y2,c,off,glow){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.shadowBlur=glow||0;ctx.shadowColor=c;if(off!=null){ctx.setLineDash([6,6]);ctx.lineDashOffset=-off;}ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  function ld(x,y,c,on){ctx.save();if(on){ctx.shadowBlur=14;ctx.shadowColor=c;}ctx.fillStyle=on?c:'rgba(255,255,255,.1)';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.restore();}
  function wv(x,y,w,h,freq,amp,c,off,lbl,flat){ctx.save();ctx.fillStyle='rgba(0,0,0,.4)';ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x+2,y+h/2);ctx.lineTo(x+w-2,y+h/2);ctx.stroke();ctx.beginPath();ctx.strokeStyle=c;ctx.lineWidth=1.4;ctx.shadowBlur=5;ctx.shadowColor=c;for(let px=0;px<=w-4;px++){const py=flat?y+h/2:y+h/2-Math.sin((px/(w-4))*Math.PI*freq+off)*amp*(h*.36);px===0?ctx.moveTo(x+2+px,py):ctx.lineTo(x+2+px,py);}ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='6.5px "Barlow Condensed",sans-serif';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText(lbl,x+4,y+3);ctx.restore();}
  function br(x,y,w,h,pct,c){ctx.save();ctx.fillStyle='rgba(0,0,0,.4)';ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(x,y,w,h,2);ctx.fill();ctx.stroke();if(pct>0){ctx.fillStyle=c;ctx.shadowBlur=6;ctx.shadowColor=c;ctx.beginPath();ctx.roundRect(x+1,y+1,(w-2)*Math.min(pct,1),h-2,1);ctx.fill();}ctx.restore();}
  function draw(){
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#030916';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.016)';
    for(let gx=24;gx<W;gx+=30)for(let gy=20;gy<H;gy+=30){ctx.beginPath();ctx.arc(gx,gy,.7,0,Math.PI*2);ctx.fill();}
    const test=TESTS[cycle];
    const inj=phase>=1&&phase<=3,pick=phase>=2,trip=phase>=3,open=phase>=4,pass=phase===5;
    const Y=H*.50;
    const C={x:W*.09,y:Y,w:90,h:56},R={x:W*.36,y:Y,w:84,h:52},T={x:W*.63,y:Y,w:76,h:46},B={x:W*.87,y:Y,w:72,h:54};
    const ww=(W-24)/3,wh=H*.21,wy=7;
    wv(8,wy,ww-4,wh,4,inj?1:0,'rgba(56,189,248,.9)',wOff,'Ia',!inj);
    wv(8+ww,wy,ww-4,wh,4,inj?.9:0,'rgba(167,139,250,.9)',wOff+2.1,'Ib',!inj);
    wv(8+ww*2,wy,ww-4,wh,4,inj?.85:0,'rgba(251,146,60,.9)',wOff+4.2,'Ic',!inj);
    wr(C.x+C.w/2,C.y,R.x-R.w/2,R.y,inj?'rgba(56,189,248,.9)':'rgba(56,189,248,.15)',inj?-frame*.12:null,inj?12:0);
    wr(R.x+R.w/2,R.y,T.x-T.w/2,T.y,trip?'rgba(251,100,60,1)':pick?'rgba(250,204,21,.7)':'rgba(255,255,255,.1)',trip?-frame*.18:null,trip?16:pick?6:0);
    wr(T.x+T.w/2,T.y,B.x-B.w/2,B.y,open?'rgba(251,100,60,1)':'rgba(255,255,255,.1)',open?-frame*.15:null,open?14:0);
    bx(C.x,C.y,C.w,C.h,inj?'rgba(120,20,30,.85)':'rgba(70,10,18,.8)',inj?'#f87171':'rgba(130,20,28,.5)',inj?28:8);
    lb('CMC 356',C.x,C.y-12,9,'#fff',true);lb('OMICRON',C.x,C.y-1,7.5,'rgba(255,255,255,.55)',false);lb('INJECTOR',C.x,C.y+10,7,'rgba(251,146,60,.9)',false);ld(C.x+C.w/2-7,C.y-C.h/2+8,'#f87171',inj);
    const rb=trip?'#f87171':pick?'#fbbf24':'rgba(17,64,160,.55)';
    bx(R.x,R.y,R.w,R.h,pick?'rgba(100,48,5,.8)':'rgba(11,45,107,.85)',rb,pick?30:8);
    lb('RELAY PROT.',R.x,R.y-12,8.5,'#fff',true);lb(test.fn,R.x,R.y,8,'rgba(251,191,36,.9)',true);lb('IEC 60255',R.x,R.y+12,7,'rgba(255,255,255,.4)',false);ld(R.x+R.w/2-7,R.y-R.h/2+8,trip?'#f87171':'#fbbf24',pick);
    bx(T.x,T.y,T.w,T.h,trip?'rgba(140,30,10,.85)':'rgba(8,20,52,.85)',trip?'#f87171':'rgba(50,65,120,.5)',trip?28:5);
    lb('TRIP COIL',T.x,T.y-7,8.5,'#fff',true);lb('DC 110V',T.x,T.y+7,7.5,'rgba(255,255,255,.45)',false);ld(T.x+T.w/2-7,T.y-T.h/2+8,'#f87171',trip);
    bx(B.x,B.y,B.w,B.h,open?'rgba(30,14,4,.9)':'rgba(11,45,107,.85)',open?'#fbbf24':'rgba(17,64,160,.5)',open?22:5);
    lb('CB',B.x,B.y-15,9,'#fff',true);
    if(open){ctx.save();ctx.strokeStyle='#fbbf24';ctx.lineWidth=2.5;ctx.shadowBlur=10;ctx.shadowColor='#fbbf24';ctx.beginPath();ctx.moveTo(B.x-12,B.y-3);ctx.lineTo(B.x-3,B.y-3);ctx.stroke();ctx.beginPath();ctx.moveTo(B.x+3,B.y-3);ctx.lineTo(B.x+12,B.y-3);ctx.stroke();if(flash>.25){ctx.globalAlpha=flash*.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(B.x,B.y-3,6,Math.PI,0);ctx.stroke();}ctx.restore();lb('OPEN',B.x,B.y+10,8,'#fbbf24',true);}
    else{ctx.save();ctx.strokeStyle='rgba(56,189,248,.65)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(B.x-12,B.y-3);ctx.lineTo(B.x+12,B.y-3);ctx.stroke();ctx.restore();lb('CLOSED',B.x,B.y+10,8,'rgba(0,220,100,.85)',true);}
    ld(B.x+B.w/2-7,B.y-B.h/2+8,'#fbbf24',open);
    const PX=6,PY=H-82,PW=W-12,PH=74;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.45)';ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(PX,PY,PW,PH,4);ctx.fill();ctx.stroke();ctx.restore();
    ctx.save();ctx.fillStyle='rgba(255,255,255,.28)';ctx.font='6.5px "Barlow Condensed",sans-serif';ctx.textAlign='left';ctx.textBaseline='top';ctx.fillText('TEST SEQUENCE',PX+8,PY+7);ctx.fillStyle=test.col;ctx.font='bold 10px "Barlow Condensed",sans-serif';ctx.fillText(test.name,PX+8,PY+17);ctx.restore();
    lb('I-SET',PX+120,PY+12,7,'rgba(255,255,255,.3)',false);lb(test.I,PX+120,PY+24,9,'rgba(251,146,60,.9)',true);
    lb('t-OP',PX+174,PY+12,7,'rgba(255,255,255,.3)',false);lb(test.t,PX+174,PY+24,9,'rgba(250,204,21,.9)',true);
    lb('FN',PX+222,PY+12,7,'rgba(255,255,255,.3)',false);lb(test.fn,PX+222,PY+24,9,'rgba(167,139,250,.9)',true);
    const PHL=['READY','INJECTING','PICKUP','TRIP SIGNAL','CB OPENED','\u2713 PASS','RESETTING'];
    const PHC=['rgba(255,255,255,.3)','rgba(56,189,248,.9)','rgba(250,204,21,.9)','rgba(251,100,60,1)','rgba(251,100,60,1)','rgba(0,220,100,.9)','rgba(255,255,255,.4)'];
    ctx.save();ctx.fillStyle=PHC[phase];if(pass)ctx.shadowBlur=10,ctx.shadowColor='#00dc64';ctx.font='bold 9px "Barlow Condensed",sans-serif';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillText(PHL[phase],PX+PW-8,PY+7);ctx.restore();
    const tpct=(phase===1||phase===2)?pt/(PD[1]+PD[2]):(phase>=3?1:0);
    lb('OPERATE TIME',PX+PW/2,PY+38,7,'rgba(255,255,255,.28)',false);
    br(PX+8,PY+47,PW-16,8,tpct,pass?'rgba(0,220,100,.8)':'rgba(250,204,21,.7)');
    if(phase>=3){ctx.save();ctx.fillStyle='rgba(0,220,100,.85)';ctx.font='bold 8px "Barlow Condensed",sans-serif';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillText(Math.round((PD[1]+PD[2])/60*1000)+' ms',PX+PW-8,PY+44);ctx.restore();}
    if(flash>0){ctx.save();ctx.fillStyle='rgba(251,100,60,'+flash*.11+')';ctx.fillRect(0,0,W,H);ctx.restore();flash-=.045;}
    if(pFlash>0){ctx.save();ctx.fillStyle='rgba(0,220,100,'+pFlash*.13+')';ctx.fillRect(0,0,W,H);ctx.restore();pFlash-=.038;}
    for(let i=injParts.length-1;i>=0;i--){if(!injParts[i].go())injParts.splice(i,1);else injParts[i].draw();}
    for(let i=trSparks.length-1;i>=0;i--){if(!trSparks[i].go())trSparks.splice(i,1);else trSparks[i].draw();}
    if(inj&&frame%4===0)injParts.push(new IP(C.x+C.w/2,C.y,R.x-R.w/2,R.y,'rgba(56,189,248,.9)'));
    if(trip&&frame%5===0)injParts.push(new IP(R.x+R.w/2,R.y,T.x-T.w/2,T.y,'rgba(251,100,60,.9)'));
    if(open&&frame%5===0)injParts.push(new IP(T.x+T.w/2,T.y,B.x-B.w/2,B.y,'rgba(251,100,60,.9)'));
    pt++;if(pt>=PD[phase]){pt=0;phase=(phase+1)%7;if(phase===0){cycle=(cycle+1)%TESTS.length;flash=0;}if(phase===3){flash=1;for(let k=0;k<22;k++)trSparks.push(new TS(T.x,T.y));}if(phase===5)pFlash=1;}
    wOff+=.065;frame++;setTimeout(()=>requestAnimationFrame(draw),16);
  }
  draw();
})();

(function(){
  const cv=document.getElementById('solarCanvas');
  if(!cv||typeof cv.getContext!=='function')return;
  const ctx=cv.getContext('2d');
  function resize(){const p=cv.parentElement;cv.width=p.clientWidth||600;cv.height=380;}
  resize();window.addEventListener('resize',resize);
  class Pt{constructor(){this.reset();}reset(){const W=cv.width,H=cv.height;this.x=W*.5+(Math.random()-.5)*320;this.y=H*.3+Math.random()*80;this.vy=.5+Math.random()*1.2;this.vx=(Math.random()-.5)*.5;this.l=1;this.d=.007+Math.random()*.009;this.r=1+Math.random()*2.2;this.c=Math.random()>.5?'#F0A500':'#00C9A7';}step(){this.x+=this.vx;this.y+=this.vy;this.l-=this.d;if(this.l<=0)this.reset();}draw(){ctx.save();ctx.globalAlpha=this.l*.7;ctx.fillStyle=this.c;ctx.shadowBlur=7;ctx.shadowColor=this.c;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
  const pts=Array.from({length:50},()=>new Pt());
  pts.forEach(p=>{p.l=Math.random();});
  let t=0;
  function pnl(x,y,w,h,glow){ctx.save();ctx.shadowBlur=glow*9;ctx.shadowColor='rgba(0,201,167,.5)';ctx.fillStyle='rgba(0,26,55,'+(0.68+glow*.1)+')';ctx.strokeStyle='rgba(0,201,167,'+(0.28+glow*.48)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='rgba(0,201,167,'+(0.07+glow*.1)+')';ctx.lineWidth=.7;for(const frac of[1/3,2/3]){ctx.beginPath();ctx.moveTo(x+w*frac,y);ctx.lineTo(x+w*frac,y+h);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y+h*frac);ctx.lineTo(x+w,y+h*frac);ctx.stroke();}ctx.restore();}
  function draw(){
    const W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H*.52);sky.addColorStop(0,'#060e1a');sky.addColorStop(1,'#0b2236');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H*.52);
    const wat=ctx.createLinearGradient(0,H*.52,0,H);wat.addColorStop(0,'#0a2132');wat.addColorStop(1,'#061221');ctx.fillStyle=wat;ctx.fillRect(0,H*.52,W,H*.48);
    ctx.save();ctx.strokeStyle='rgba(0,180,230,.09)';ctx.lineWidth=1;for(let i=0;i<7;i++){const ry=H*.54+i*17+Math.sin(t*.013+i*.9)*4.5;ctx.beginPath();ctx.moveTo(0,ry);ctx.lineTo(W,ry);ctx.stroke();}ctx.restore();
    const sx=W*.82,sy=H*.1,r=25,pulse=1+.055*Math.sin(t*.022);
    const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,r*4.5*pulse);sg.addColorStop(0,'rgba(240,165,0,.22)');sg.addColorStop(1,'rgba(240,165,0,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,r*4.5*pulse,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.strokeStyle='rgba(240,165,0,.25)';ctx.lineWidth=1.4;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+t*.007;ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*(r+5)*pulse,sy+Math.sin(a)*(r+5)*pulse);ctx.lineTo(sx+Math.cos(a)*(r+19)*pulse,sy+Math.sin(a)*(r+19)*pulse);ctx.stroke();}ctx.restore();
    ctx.fillStyle='#F0A500';ctx.beginPath();ctx.arc(sx,sy,r*pulse,0,Math.PI*2);ctx.fill();
    const COLS=6,ROWS=3,PW=55,PH=34,GX=9,GY=8,totalW=COLS*(PW+GX)-GX,startX=(W-totalW)/2,startY=H*.26;
    ctx.save();ctx.globalAlpha=.12;ctx.transform(1,0,0,-1,0,H*.535*2);for(let r2=0;r2<ROWS;r2++)for(let c=0;c<COLS;c++){pnl(startX+c*(PW+GX),startY+r2*(PH+GY),PW,PH,.4+.6*Math.sin(t*.022+(r2+c)*.55));}ctx.restore();
    for(let r2=0;r2<ROWS;r2++)for(let c=0;c<COLS;c++){pnl(startX+c*(PW+GX),startY+r2*(PH+GY),PW,PH,.38+.62*Math.sin(t*.022+(r2+c)*.55));}
    ctx.save();ctx.strokeStyle='rgba(240,165,0,.28)';ctx.lineWidth=1.5;ctx.setLineDash([4,8]);ctx.lineDashOffset=-t*.038;ctx.beginPath();ctx.moveTo(sx,sy+r*pulse);ctx.lineTo(W/2,startY);ctx.stroke();ctx.restore();
    const midX=W/2,fromY=startY+ROWS*(PH+GY)+2,toY=H*.87;
    ctx.save();ctx.strokeStyle='rgba(0,201,167,.42)';ctx.lineWidth=2;ctx.setLineDash([4,8]);ctx.lineDashOffset=-t*.055;ctx.beginPath();ctx.moveTo(midX,fromY);ctx.lineTo(midX,toY);ctx.stroke();ctx.restore();
    const BW=170,BH=44,BX=midX-BW/2,BY=toY;ctx.shadowBlur=14;ctx.shadowColor='rgba(0,201,167,.28)';ctx.fillStyle='rgba(3,16,36,.93)';ctx.strokeStyle='rgba(0,201,167,.48)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(BX,BY,BW,BH,5);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font='bold 10px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.fillText('GRID-TIE INVERTER',midX,BY+15);
    ctx.fillStyle='rgba(0,201,167,.78)';ctx.font='9px "Barlow",sans-serif';ctx.fillText('OUTPUT: 20kV AC  |  145 MWac',midX,BY+30);
    const kwh=Math.min(t*.028,145).toFixed(1);ctx.fillStyle='rgba(0,0,0,.65)';ctx.beginPath();ctx.roundRect(W-116,H-47,110,39,5);ctx.fill();ctx.strokeStyle='rgba(240,165,0,.32)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='rgba(240,165,0,.95)';ctx.font='bold 12px "Barlow Condensed",sans-serif';ctx.textAlign='left';ctx.fillText('\u26a1 '+kwh+' MWh',W-109,H-31);ctx.fillStyle='rgba(240,165,0,.42)';ctx.font='8px "Barlow",sans-serif';ctx.fillText('ENERGY GENERATED',W-109,H-17);
    pts.forEach(p=>{p.step();p.draw();});t++;setTimeout(()=>requestAnimationFrame(draw),20);
  }
  draw();
})();

/* ---- Inline script block 5 ---- */
(function(){
  const cv=document.getElementById('heroCanvas');
  if(!cv||typeof cv.getContext!=='function')return;
  const ctx=cv.getContext('2d');
  function resize(){cv.width=cv.parentElement.offsetWidth;cv.height=cv.parentElement.offsetHeight;}
  resize();window.addEventListener('resize',resize);
  function bolt(sx,sy,ex,ey,d,segs){if(d<=0||segs<=1)return[{x:sx,y:sy},{x:ex,y:ey}];const mx=(sx+ex)/2+(Math.random()-.5)*(Math.abs(ex-sx)+Math.abs(ey-sy))*.38,my=(sy+ey)/2+(Math.random()-.5)*(Math.abs(ey-sy)+36)*.38;return[...bolt(sx,sy,mx,my,d-1,Math.floor(segs/2)),...bolt(mx,my,ex,ey,d-1,Math.floor(segs/2)).slice(1)];}
  class Bolt{constructor(){this.reset();}reset(){const W=cv.width,H=cv.height;this.on=false;this.cd=70+Math.floor(Math.random()*130);this.timer=0;this.life=0;this.maxLife=.85+Math.random()*.15;this.sx=W*(.25+Math.random()*.6);this.sy=-8;this.ex=this.sx+(Math.random()-.5)*320;this.ey=H*(.2+Math.random()*.5);this.pts=bolt(this.sx,this.sy,this.ex,this.ey,5,12);this.branches=[];for(let i=2;i<this.pts.length-2;i++){if(Math.random()<.28){this.branches.push({pts:bolt(this.pts[i].x,this.pts[i].y,this.pts[i].x+(Math.random()-.3)*160,this.pts[i].y+Math.random()*110,3,6),fade:.5+Math.random()*.4});}}this.col=Math.random()>.3?[170,215,255]:[255,215,110];}update(){this.timer++;if(!this.on&&this.timer>=this.cd){this.on=true;this.life=this.maxLife;this.pts=bolt(this.sx,this.sy,this.ex,this.ey,5,12);}if(this.on){this.life-=.055;if(this.life<=0)this.reset();}}line(pts,alpha,w,blur,col){if(pts.length<2)return;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='rgba('+col[0]+','+col[1]+','+col[2]+',1)';ctx.lineWidth=w;ctx.shadowBlur=blur;ctx.shadowColor='rgba('+col[0]+','+col[1]+','+col[2]+',.9)';ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);pts.forEach(p=>ctx.lineTo(p.x,p.y));ctx.stroke();ctx.restore();}draw(){if(!this.on||this.life<=0)return;const f=this.life,c=this.col;this.line(this.pts,f*.07,20,44,c);this.line(this.pts,f*.22,7,22,c);this.line(this.pts,f*.92,1.5,9,[235,248,255]);this.branches.forEach(b=>{this.line(b.pts,f*b.fade*.55,3.5,14,c);this.line(b.pts,f*b.fade,.9,4,[235,248,255]);});if(f>.45){ctx.save();ctx.globalAlpha=(f-.45)*2*.28;const g=ctx.createRadialGradient(this.ex,this.ey,0,this.ex,this.ey,58);g.addColorStop(0,'rgba('+c[0]+','+c[1]+','+c[2]+',1)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.ex,this.ey,58,0,Math.PI*2);ctx.fill();ctx.restore();}}}
  class Spark{constructor(){this.reset();}reset(){const W=cv.width,H=cv.height;this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.35;this.vy=-.18-Math.random()*.45;this.life=Math.random();this.decay=.0018+Math.random()*.0025;this.r=.5+Math.random()*1.1;}update(){this.x+=this.vx;this.y+=this.vy;this.life-=this.decay;if(this.life<=0||this.y<0)this.reset();}draw(){ctx.save();ctx.globalAlpha=this.life*.35;ctx.fillStyle=Math.random()>.5?'#93c5fd':'#fbbf24';ctx.shadowBlur=3;ctx.shadowColor='#93c5fd';ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}}
  const bolts=Array.from({length:5},()=>new Bolt());
  const sparks=Array.from({length:45},()=>new Spark());
  bolts.forEach((b,i)=>{b.timer=Math.floor(i*38);});
  function draw(){ctx.clearRect(0,0,cv.width,cv.height);sparks.forEach(s=>{s.update();s.draw();});bolts.forEach(b=>{b.update();b.draw();});setTimeout(()=>requestAnimationFrame(draw),20);}
  draw();
})();

/* ---- Inline script block 6 ---- */
/* ── Service Slider ── */
(function(){
  var vp = document.querySelector('.svc-slider-viewport');
  var track = document.getElementById('svcTrack');
  var prevBtn = document.getElementById('svcPrev');
  var nextBtn = document.getElementById('svcNext');
  var dotsWrap = document.getElementById('svcDots');
  var currEl = document.getElementById('svcCurr');
  if(!track) return;

  var slides = track.querySelectorAll('.svc-slide');
  var n = slides.length; // 6
  var cur = 0;

  // Build one dot per slide
  for(var i=0;i<n;i++){
    (function(idx){
      var d=document.createElement('button');
      d.className='svc-dot'+(idx===0?' on':'');
      d.addEventListener('click',function(){go(idx);});
      dotsWrap.appendChild(d);
    })(i);
  }

  function go(page){
    cur = Math.max(0, Math.min(page, n-1));
    // Each slide is 1/6 of total track width
    track.style.transform = 'translateX(-'+(cur*(100/n))+'%)';
    prevBtn.disabled = cur===0;
    nextBtn.disabled = cur===n-1;
    currEl.textContent = cur+1;
    dotsWrap.querySelectorAll('.svc-dot').forEach(function(d,i){
      d.classList.toggle('on', i===cur);
    });
  }

  prevBtn.addEventListener('click',function(){go(cur-1);});
  nextBtn.addEventListener('click',function(){go(cur+1);});

  // Touch swipe
  var sx=0;
  track.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40){dx<0?go(cur+1):go(cur-1);}
  });

  go(0);
})();

/* ── Back To Top ── */
(function(){
  var btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('show', window.scrollY > 400);
  }, {passive: true});
  btn.addEventListener('click', function(){
    window.scrollTo({top: 0, behavior: 'smooth'});
  });
})();

/* ---- Inline script block 7 ---- */
/* ── Counter Animasi Stats ── */
(function(){
  function animateCounter(el, target, suffix, duration){
    var start=0, startTime=null;
    function step(ts){
      if(!startTime) startTime=ts;
      var progress=Math.min((ts-startTime)/duration,1);
      var ease=1-Math.pow(1-progress,3);
      el.innerHTML=Math.floor(ease*target)+suffix;
      if(progress<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countersDone=false;
  var statsEl=document.querySelector('.hero-stats');
  if(!statsEl) return;
  var obs=new IntersectionObserver(function(entries){
    if(countersDone||!entries[0].isIntersecting) return;
    countersDone=true;
    document.querySelectorAll('.hs-n[data-count], .ss-n[data-count]').forEach(function(el){
      var target=parseInt(el.getAttribute('data-count'),10);
      var em=el.querySelector('em');
      var suffix=em?'<em>'+em.textContent+'</em>':'';
      animateCounter(el,target,suffix,1200);
    });
  },{threshold:0.5});
  obs.observe(statsEl);
})();

/* ── Progress Bar Scroll ── */
(function(){
  var bar=document.createElement('div');
  bar.id='scroll-progress';
  bar.style.cssText='position:fixed;top:0;left:0;height:3px;width:0%;background:#C0152A;z-index:10000;transition:width .1s linear;pointer-events:none';
  document.body.appendChild(bar);
  window.addEventListener('scroll',function(){
    var scrolled=window.scrollY;
    var total=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.width=(total>0?(scrolled/total*100):0)+'%';
  },{passive:true});
})();
