from pathlib import Path
import re

root = Path("ai-visibility-radar")
index = root / "index.html"
css = root / "styles.css"
js = root / "app.js"

html = index.read_text(encoding="utf-8")
style = css.read_text(encoding="utf-8")
code = js.read_text(encoding="utf-8")

replacements = {
    '<a class="btn btn-primary nav-cta" href="#assessment">Ücretsiz Ön Değerlendirme</a>':
    '<a class="btn btn-primary nav-cta" href="#assessment">Ücretsiz Değerlendirme</a>',

    '<div class="hero-pills"><span>✓ 30+ ticari sorguya göre teşhis</span><span>✓ Kanıta dayalı rakip karşılaştırması</span><span>✓ Öncelikli düzeltme planı</span></div>':
    '<div class="hero-pills"><span>✓ 30+ ticari sorguya göre teşhis</span><span>✓ Kanıta dayalı rakip karşılaştırması</span><span>✓ Öncelikli düzeltme planı</span></div><p class="hero-proof-note">Eksik veriyi tahmin etmiyoruz. Yalnızca doğrulanabilir sinyalleri raporluyoruz.</p>',

    '<label><span>İşletme / Marka</span><input id="quick-brand" required autocomplete="organization" placeholder="Örn: Acme Coffee" /></label>':
    '<label><span>İşletme / Marka</span><input id="quick-brand" required autocomplete="organization" placeholder="Örn: Moda Kahve" /></label>',

    '<label><span>Şehir</span><input id="quick-city" required autocomplete="address-level1" placeholder="Örn: İstanbul" /></label>\n            <div class="quick-proof">':
    '<label><span>Şehir</span><input id="quick-city" required autocomplete="address-level1" placeholder="Örn: İstanbul" /></label>\n            <label><span>Web Sitesi Adresi <em>OPSİYONEL</em></span><input id="quick-website" type="text" inputmode="url" autocomplete="url" placeholder="ornek.com" /><small class="hint">Web siteniz yoksa boş bırakabilirsiniz.</small></label>\n            <div class="quick-proof">',

    '<div class="quick-proof"><span>✓ Ticari sorgu kapsamı belirlenir</span><span>✓ Aktif sağlayıcı kapsamı raporda belirtilir</span><span>✓ Eksik kanıt için tahmin üretilmez</span></div>':
    '<div class="quick-proof"><span>Sorgu kapsamı işletmenize göre belirlenir</span><span>Ölçülen AI kapsamı raporda açıkça gösterilir</span><span>Eksik veri için sonuç uydurulmaz</span></div>',

    '<div class="assessment-foot"><p>Bu alan canlı AI taraması başlatmaz. Bilgilerinizi ücretsiz ön değerlendirme talebine aktarır; gerçek ölçüm kapsamı değerlendirme sırasında netleştirilir.</p><button class="btn btn-primary" type="submit">Ücretsiz Ön Değerlendirmeye Geç →</button></div>':
    '<div class="assessment-foot"><p>Bilgileriniz yalnızca ücretsiz ön değerlendirme talebine aktarılır. Gerçek ölçüm kapsamı değerlendirme sırasında netleştirilir; bu sayfa canlı tarama başlatmaz.</p><button class="btn btn-primary" type="submit">Ücretsiz Ön Değerlendirmeye Geç →</button></div>',

    '<label><span>Web Sitesi <em>OPSİYONEL</em></span><input id="website" name="website" type="url" placeholder="https://ornek.com" /><small class="hint">Web sitesi zorunlu değildir.</small></label>':
    '<label><span>Web Sitesi Adresi <em>OPSİYONEL</em></span><input id="website" name="website" type="text" inputmode="url" autocomplete="url" placeholder="ornek.com" /><small class="hint">Opsiyonel — web siteniz yoksa boş bırakabilirsiniz.</small><small class="field-error" data-error="website"></small></label>'
}

for old, new in replacements.items():
    if old not in html:
        raise SystemExit(f"Expected HTML fragment not found: {old[:100]}")
    html = html.replace(old, new, 1)

if re.search(r'id="(?:quick-website|website)"[^>]*\brequired\b', html):
    raise SystemExit("Website field accidentally required")

old = """    const city = qs('#quick-city').value.trim();
    qs('#businessName').value = brand;
    qs('#category').value = category;
    qs('#city').value = city;"""
new = """    const city = qs('#quick-city').value.trim();
    const website = qs('#quick-website')?.value.trim() || '';
    qs('#businessName').value = brand;
    qs('#category').value = category;
    qs('#city').value = city;
    if (qs('#website')) qs('#website').value = website;"""
if old not in code:
    raise SystemExit("Quick form JS fragment not found")
code = code.replace(old, new, 1)

old = """    const email = qs('#email');
    if (email?.value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value)) { error('email').textContent = 'Geçerli bir e-posta adresi girin.'; ok = false; }
    if (!qs('#kvkkConsent')?.checked)"""
new = """    const email = qs('#email');
    if (email?.value && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email.value)) { error('email').textContent = 'Geçerli bir e-posta adresi girin.'; ok = false; }
    const website = qs('#website');
    if (website?.value.trim()) {
      const raw = website.value.trim();
      const candidate = /^https?:\\/\\//i.test(raw) ? raw : `https://${raw}`;
      try {
        const parsed = new URL(candidate);
        if (!parsed.hostname || !parsed.hostname.includes('.')) throw new Error('invalid-host');
        website.value = parsed.href.replace(/\\/$/, '');
      } catch {
        error('website').textContent = 'Geçerli bir web sitesi adresi girin veya alanı boş bırakın.';
        ok = false;
      }
    }
    if (!qs('#kvkkConsent')?.checked)"""
if old not in code:
    raise SystemExit("Lead validation JS fragment not found")
code = code.replace(old, new, 1)

polish = r"""

/* AIVR landing UX polish — 2026-09-19 */
.truth-strip{min-height:24px;padding:4px 14px;font-size:10.5px}
.nav-wrap{height:62px;gap:20px}
.brand-mark{width:36px;height:36px;border-radius:11px}
.brand b{font-size:18px}
.desktop-nav{gap:22px}
.nav-cta{min-height:42px;padding:0 16px;font-size:12px;white-space:nowrap}
.hero{padding:48px 0 78px}
.hero h1{margin-top:18px}
.hero-lead{margin-top:20px;color:#c4cfdb}
.hero-pills{margin-top:22px}
.hero-proof-note{margin:11px auto 0;color:#8fa3b8;font-size:12px;line-height:1.55}
.hero-actions{margin-top:20px}
.assessment-card{max-width:1100px;margin-top:38px}
.assessment-head{padding:17px 22px;background:#0b1727}
.assessment-head small{color:#93a4b7}
.quick-form{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:22px}
.quick-form label span em{font-style:normal;font:700 9px/1 'JetBrains Mono',monospace;color:#7f91a6}
.quick-form input,.lead-card input{border-color:#26394f;background:#07111d}
.quick-form input::placeholder,.lead-card input::placeholder{color:#71849a;opacity:1}
.quick-proof{gap:10px;margin-top:4px}
.quick-proof span{position:relative;padding:10px 11px 10px 31px;color:#c0ccda;background:#08131f;border-color:#26384d;line-height:1.45}
.quick-proof span::before{content:'✓';position:absolute;left:11px;top:9px;color:var(--cyan);font-weight:800}
.assessment-foot{margin-top:6px}
.assessment-foot p{color:#93a6b9;font-size:12px;max-width:650px}
.assessment-foot .btn{white-space:nowrap;flex:0 0 auto}
.platform-strip{margin-top:40px}
.platform-strip p{color:#7d90a5}
.form-status{color:#8094a9}
.hint{color:#7f91a6}

@media(max-width:1120px){
  .quick-form{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:980px){
  .quick-form{grid-template-columns:repeat(2,minmax(0,1fr))}
  .nav-wrap{height:60px}
}
@media(max-width:700px){
  .hero{padding-top:34px}
  .assessment-card{margin-top:30px;border-radius:20px}
  .quick-form{grid-template-columns:1fr;padding:18px}
  .assessment-head{padding:16px 18px}
  .assessment-foot p{font-size:11.5px}
  .assessment-foot .btn{white-space:normal}
}
@media(max-width:390px){
  .shell,.narrow{width:min(100% - 22px,var(--max))}
  .truth-strip{font-size:9px;padding-inline:9px}
  .hero h1{font-size:31px}
  .hero-lead{font-size:14px;line-height:1.65}
  .hero-pills span{font-size:11px}
  .assessment-card{border-radius:18px}
  .lead-card{padding:17px}
}
"""
style += polish

index.write_text(html, encoding="utf-8")
css.write_text(style, encoding="utf-8")
js.write_text(code, encoding="utf-8")
