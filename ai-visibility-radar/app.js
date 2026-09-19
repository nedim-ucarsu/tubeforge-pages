/** AI Visibility Radar public landing page — v1.8.6.9 */
document.addEventListener('DOMContentLoaded', () => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

  // Mobile navigation
  const menuBtn = qs('#menu-btn');
  const mobileNav = qs('#mobile-nav');
  const setMenu = (open) => {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    mobileNav.classList.toggle('open', open);
  };
  menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  qsa('#mobile-nav a, #mobile-nav button').forEach(el => el.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (mobileNav?.classList.contains('open') && !mobileNav.contains(e.target) && !menuBtn?.contains(e.target)) setMenu(false); });

  // Quick assessment → prefill real lead form
  const quickForm = qs('#quick-form');
  quickForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (!quickForm.checkValidity()) return quickForm.reportValidity();
    const brand = qs('#quick-brand').value.trim();
    const category = qs('#quick-category').value.trim();
    const city = qs('#quick-city').value.trim();
    const website = qs('#quick-website')?.value.trim() || '';
    qs('#businessName').value = brand;
    qs('#category').value = category;
    qs('#city').value = city;
    if (qs('#website')) qs('#website').value = website;
    setSelectedPlan('Ücretsiz Ön Değerlendirme');
    qs('#lead-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => qs('#email')?.focus(), 450);
  });

  // Benchmark toggle
  const benchmarkData = {
    before: [['AI görünürlük örneği','%18'],['Önerilme örneği','%7'],['Kaynak görünürlüğü','4 / 14'],['Kritik kör noktalar','15 sorgu']],
    after: [['AI görünürlük örneği','%46'],['Önerilme örneği','%23'],['Kaynak görünürlüğü','10 / 14'],['Kritik kör noktalar','6 sorgu']]
  };
  const renderBenchmark = key => {
    qsa('.bench-tab').forEach(b => b.classList.toggle('active', b.dataset.benchmark === key));
    const grid = qs('#metric-grid');
    if (grid) grid.innerHTML = benchmarkData[key].map(([l,v]) => `<div class="metric-card"><b>${v}</b><span>${l}</span></div>`).join('');
    const title = qs('#benchmark-title');
    if (title) title.textContent = key === 'after' ? 'Düzeltmeler sonrası ölçüm örneği' : 'Başlangıç görünürlük örneği';
  };
  qsa('.bench-tab').forEach(btn => btn.addEventListener('click', () => renderBenchmark(btn.dataset.benchmark)));
  renderBenchmark('after');

  // Pricing → lead form
  let selectedPlan = 'Ücretsiz Ön Değerlendirme';
  function setSelectedPlan(plan) {
    selectedPlan = plan;
    const el = qs('#selected-plan');
    if (el) { el.hidden = false; el.textContent = `Seçilen talep: ${plan}`; }
  }
  qsa('.plan-btn').forEach(btn => btn.addEventListener('click', () => {
    setSelectedPlan(btn.dataset.plan || 'Ücretsiz Ön Değerlendirme');
    qs('#lead-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Accessible modals
  let lastFocused = null;
  const sampleModal = qs('#sample-modal');
  const thanksModal = qs('#thanks-modal');
  const openModal = modal => {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => qs('.modal-close', modal)?.focus(), 0);
  };
  const closeModal = modal => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  };
  qsa('[data-open-report]').forEach(b => b.addEventListener('click', () => openModal(sampleModal)));
  qsa('[data-close-report]').forEach(b => b.addEventListener('click', () => closeModal(sampleModal)));
  qsa('[data-close-thanks]').forEach(b => b.addEventListener('click', () => closeModal(thanksModal)));
  qs('[data-thanks-report]')?.addEventListener('click', () => { closeModal(thanksModal); openModal(sampleModal); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (thanksModal?.classList.contains('open')) closeModal(thanksModal);
    else if (sampleModal?.classList.contains('open')) closeModal(sampleModal);
  });

  // Lead form: real HTTP delivery, no fake success
  const form = qs('#lead-form');
  const submit = qs('#lead-submit');
  const status = qs('#form-status');
  const error = name => qs(`[data-error="${name}"]`);
  const clearErrors = () => qsa('.field-error').forEach(e => e.textContent = '');
  const validate = () => {
    clearErrors();
    let ok = true;
    const required = [['businessName','İşletme / marka adı zorunludur.'],['category','Sektör / kategori zorunludur.'],['city','Şehir zorunludur.'],['email','E-posta zorunludur.']];
    required.forEach(([id,msg]) => { const el = qs(`#${id}`); if (!el?.value.trim()) { error(id).textContent = msg; ok = false; } });
    const email = qs('#email');
    if (email?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { error('email').textContent = 'Geçerli bir e-posta adresi girin.'; ok = false; }
    const website = qs('#website');
    if (website?.value.trim()) {
      const raw = website.value.trim();
      const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      try {
        const parsed = new URL(candidate);
        if (!parsed.hostname || !parsed.hostname.includes('.')) throw new Error('invalid-host');
        website.value = parsed.href.replace(/\/$/, '');
      } catch {
        error('website').textContent = 'Geçerli bir web sitesi adresi girin veya alanı boş bırakın.';
        ok = false;
      }
    }
    if (!qs('#kvkkConsent')?.checked) { error('kvkkConsent').textContent = 'Aydınlatma ve gizlilik metnini okuyup onaylamanız gerekir.'; ok = false; }
    return ok;
  };
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    submit.disabled = true;
    submit.textContent = 'Talebiniz Gönderiliyor…';
    status.className = 'form-status sending';
    status.textContent = 'Talebiniz güvenli bağlantıyla iletiliyor…';
    const inbox = ['upw','amzn','@gmail.com'].join('');
    const payload = {
      _subject: `AIVR Ön Değerlendirme Talebi — ${qs('#businessName').value.trim()}`,
      _template: 'table', _captcha: 'false',
      'İşletme / Marka': qs('#businessName').value.trim(),
      'Sektör / Kategori': qs('#category').value.trim(),
      'Şehir': qs('#city').value.trim(),
      'İlçe': qs('#district').value.trim() || 'Belirtilmedi',
      'Web Sitesi': qs('#website').value.trim() || 'Belirtilmedi',
      'Rakipler': qs('#competitors').value.trim() || 'Belirtilmedi',
      'E-posta': qs('#email').value.trim(),
      'Talep / Paket': selectedPlan,
      'KVKK / Gizlilik Onayı': 'Evet',
      'Kaynak': 'AI Visibility Radar GitHub Pages'
    };
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${inbox}`, { method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body:JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      status.className = 'form-status';
      status.textContent = 'Kredi kartı gerekmez. Başvuru yalnızca ön değerlendirme talebidir; canlı denetim bu sayfada başlatılmaz.';
      qs('#thanks-copy').innerHTML = `<strong>${escapeHtml(payload['İşletme / Marka'])}</strong> için ön değerlendirme talebiniz başarıyla iletildi. Sonraki adımlar <strong>${escapeHtml(payload['E-posta'])}</strong> adresine gönderilecek.`;
      form.reset();
      setSelectedPlan('Ücretsiz Ön Değerlendirme');
      openModal(thanksModal);
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = 'Talebiniz şu anda iletilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Ücretsiz Değerlendirme Talebini Gönder';
    }
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));
  }
});
