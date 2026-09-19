/**
 * AI VISIBILITY RADAR — Client-side Interactions
 * Public Product Version: 1.8.6.9
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------
  // 1. Accessible Mobile Navigation
  // ------------------------------------------------------------
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    function toggleMenu(open) {
      const isOpen = open !== undefined ? open : navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        navLinks.classList.add('open');
      } else {
        navLinks.classList.remove('open');
      }
    }

    navToggle.addEventListener('click', () => toggleMenu());

    // Close when clicking a navigation link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
        navToggle.focus();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !navToggle.contains(e.target) &&
        !navLinks.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });
  }

  // ------------------------------------------------------------
  // 2. Interactive Product Demo Tabs (AUDIT, EVIDENCE, REPORT)
  // ------------------------------------------------------------
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoPanels = document.querySelectorAll('.demo-panel');

  if (demoTabs.length > 0 && demoPanels.length > 0) {
    function activateTab(targetTab) {
      const tabKey = targetTab.getAttribute('data-tab');

      demoTabs.forEach(tab => {
        const isTarget = tab === targetTab;
        tab.setAttribute('aria-selected', String(isTarget));
        tab.tabIndex = isTarget ? 0 : -1;
      });

      demoPanels.forEach(panel => {
        if (panel.getAttribute('data-panel') === tabKey) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    }

    demoTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));

      // Arrow navigation
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        if (e.key === 'ArrowRight') {
          newIndex = (index + 1) % demoTabs.length;
        } else if (e.key === 'ArrowLeft') {
          newIndex = (index - 1 + demoTabs.length) % demoTabs.length;
        }

        if (newIndex !== index) {
          e.preventDefault();
          demoTabs[newIndex].focus();
          activateTab(demoTabs[newIndex]);
        }
      });
    });
  }

  // ------------------------------------------------------------
  // 3. Lead Form Safe Delivery & State Handling
  // ------------------------------------------------------------
  const form = document.getElementById('audit-form');
  const statusEl = document.getElementById('form-status');

  if (form) {
    const inbox = ['upw', 'amzn', '@gmail.com'].join('');
    form.action = 'https://formsubmit.co/' + inbox;

    form.addEventListener('submit', (e) => {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Ön değerlendirme iletiliyor…';
      }
      if (statusEl) {
        statusEl.textContent = 'Güvenli gönderim başlatıldı. Lütfen bekleyin…';
        statusEl.style.color = 'var(--accent)';
      }
    });
  }

  // ------------------------------------------------------------
  // 4. Sample Export Toolbar Tooltips / Feedback
  // ------------------------------------------------------------
  const exportButtons = document.querySelectorAll('.export-btn[data-export]');
  const exportNotice = document.getElementById('export-notice');

  exportButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const format = btn.getAttribute('data-export');
      if (exportNotice) {
        exportNotice.textContent = `Temsili demo: ${format.toUpperCase()} formatı gerçek denetim tamamlandığında oluşturulur.`;
        exportNotice.style.display = 'block';
        setTimeout(() => {
          exportNotice.style.display = 'none';
        }, 4000);
      }
    });
  });

  // ------------------------------------------------------------
  // 5. Direct View Navigation (?view=sample-report or #sample-report)
  // ------------------------------------------------------------
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const hash = window.location.hash;
    if (viewParam === 'sample-report' || hash === '#sample-report') {
      if (!window.location.pathname.endsWith('sample-report.html')) {
        window.location.replace('./sample-report.html');
      }
    }
  } catch (e) {
    // Ignore in non-browser environments
  }
});