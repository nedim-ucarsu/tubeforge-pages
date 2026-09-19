/**
 * check-aivr-product-truth.js
 * Zero-dependency static drift detection for AI Visibility Radar V1 public website.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const aivrDir = path.join(repoRoot, 'ai-visibility-radar');

let errors = [];

function check(assertion, message) {
  if (!assertion) {
    errors.push(message);
    console.error(`❌ FAIL: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('--- Checking product-truth.json ---');
const truthPath = path.join(aivrDir, 'product-truth.json');
check(fs.existsSync(truthPath), 'product-truth.json exists');

let truth = {};
try {
  truth = JSON.parse(fs.readFileSync(truthPath, 'utf8'));
  check(truth.product === 'AI Visibility Radar', 'Product name is "AI Visibility Radar"');
  check(truth.public_product_version === '1.8.6.9', 'Public product version is "1.8.6.9"');
  check(truth.capabilities && truth.capabilities.website_optional === true, 'Website is optional in product truth');
  check(truth.capabilities && truth.capabilities.evidence_not_fabricated === true, 'Evidence non-fabrication rule is declared');
  check(
    truth.capabilities &&
    ['json', 'markdown', 'html', 'pdf'].every(exp => truth.capabilities.exports.includes(exp)),
    'Exports list includes json, markdown, html, pdf'
  );
} catch (e) {
  errors.push(`Failed to parse product-truth.json: ${e.message}`);
}

console.log('\n--- Checking index.html ---');
const indexPath = path.join(aivrDir, 'index.html');
check(fs.existsSync(indexPath), 'index.html exists');

const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Version metadata check
check(indexHtml.includes('PUBLIC_PRODUCT_VERSION=1.8.6.9'), 'index.html includes PUBLIC_PRODUCT_VERSION=1.8.6.9 metadata');

// Website optional check
const websiteInputMatch = indexHtml.match(/<input[^>]*name=["']Web_Sitesi["'][^>]*>/i);
if (websiteInputMatch) {
  check(!websiteInputMatch[0].includes('required'), 'index.html: Web_Sitesi input does NOT have required attribute');
} else {
  check(false, 'index.html: Web_Sitesi input field found in form');
}

// Required fields check
const requiredFields = ['Marka', 'Kategori', 'Sehir', 'email'];
for (const field of requiredFields) {
  const fieldMatch = indexHtml.match(new RegExp(`<input[^>]*name=["']${field}["'][^>]*>`, 'i'));
  check(fieldMatch && fieldMatch[0].includes('required'), `index.html: ${field} input has required attribute`);
}

// Copy defect check
check(!indexHtml.includes('Önerilme Oranı Rate'), 'index.html does not contain defect "Önerilme Oranı Rate"');
check(!indexHtml.includes('AI Görünürlüğü Radar'), 'index.html uses consistent "AI Visibility Radar" branding');
check(!indexHtml.includes('\uFFFD'), 'index.html has clean encoding (no UTF-8 replacement characters)');

// Architectural and capability truth checks
check(indexHtml.includes('Eksik kanıt') || indexHtml.includes('eksik kanıt'), 'index.html explains evidence requirement (eksik kanıt)');
check(indexHtml.includes('EVIDENCE_PENDING'), 'index.html references EVIDENCE_PENDING state');
check(indexHtml.includes('REPORT_READY'), 'index.html references REPORT_READY state');
check(indexHtml.includes('JSON') && indexHtml.includes('Markdown') && indexHtml.includes('HTML') && indexHtml.includes('PDF'), 'index.html showcases JSON, Markdown, HTML, PDF exports');
check(indexHtml.includes('Report Center') || indexHtml.includes('Rapor Merkezi'), 'index.html showcases Report Center');
check(indexHtml.includes('TEMSİLİ') || indexHtml.includes('Temsili'), 'index.html marks demo/samples clearly as representative/temsili');

// Navigation check
check(indexHtml.includes('aria-expanded'), 'index.html mobile navigation has aria-expanded accessibility attribute');
check(indexHtml.includes('aria-controls'), 'index.html mobile navigation has aria-controls accessibility attribute');

console.log('\n--- Checking sample-report.html ---');
const samplePath = path.join(aivrDir, 'sample-report.html');
check(fs.existsSync(samplePath), 'sample-report.html exists');

const sampleHtml = fs.readFileSync(samplePath, 'utf8');
check(!sampleHtml.includes('Önerilme Oranı Rate'), 'sample-report.html does not contain defect "Önerilme Oranı Rate"');
check(!sampleHtml.includes('AI Görünürlüğü Radar'), 'sample-report.html uses consistent "AI Visibility Radar" branding');
check(!sampleHtml.includes('\uFFFD'), 'sample-report.html has clean encoding');
check(sampleHtml.includes('REPORT_READY'), 'sample-report.html includes REPORT_READY status badge');
check(sampleHtml.includes('TEMSİLİ') || sampleHtml.includes('Kurgusal') || sampleHtml.includes('kurgusal'), 'sample-report.html contains disclaimer (TEMSİLİ / KURGUSAL)');
check(sampleHtml.includes('JSON') && sampleHtml.includes('Markdown') && sampleHtml.includes('HTML') && sampleHtml.includes('PDF'), 'sample-report.html includes export toolbar mockup');

console.log('\n--- Checking thanks.html ---');
const thanksPath = path.join(aivrDir, 'thanks.html');
check(fs.existsSync(thanksPath), 'thanks.html exists');
const thanksHtml = fs.readFileSync(thanksPath, 'utf8');
check(!thanksHtml.includes('\uFFFD'), 'thanks.html has clean encoding');
check(thanksHtml.includes('AI Visibility Radar'), 'thanks.html has consistent brand name');

console.log('\n========================================');
if (errors.length > 0) {
  console.error(`❌ DRIFT CHECK FAILED with ${errors.length} error(s):`);
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log('✅ ALL PRODUCT TRUTH DRIFT CHECKS PASSED!');
  process.exit(0);
}
