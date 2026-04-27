/* Robora Therapy Solutions — site JS
   Lightweight, no dependencies. Loaded with `defer` from every page. */

(function () {
  // ─── Mobile nav drawer ─────────────────────────────────────
  const toggle   = document.getElementById('navToggle');
  const links    = document.getElementById('navLinks');
  const backdrop = document.getElementById('navBackdrop');

  function openMenu(){
    links.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
  }
  function closeMenu(){
    links.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  }
  function isOpen(){ return links && links.classList.contains('is-open'); }

  if (toggle && links && backdrop) {
    toggle.addEventListener('click', () => { isOpen() ? closeMenu() : openMenu(); });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { if (isOpen()) closeMenu(); });
    });
    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 880 && isOpen()) closeMenu();
    });
  }

  // ─── Reveal-on-scroll ─────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), (i % 4) * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ─── Mark current page in nav ─────────────────────────────
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('is-current');
      a.setAttribute('aria-current', 'page');
    }
  });

  // ─── Form helpers ─────────────────────────────────────────
  // Generic "submit and show success" handler — used across all forms
  // until a real backend (Formspree / Basin / Netlify Forms) is wired up.
  window.handleFormStub = function(e, successMsg) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type=submit]');
    if (!btn) return;
    const original = btn.innerHTML;
    btn.innerHTML = successMsg || 'Sent with care · we will reply soon';
    btn.disabled = true;
    btn.style.background = 'var(--gold)';
    setTimeout(() => {
      form.reset();
      btn.innerHTML = original;
      btn.disabled = false;
      btn.style.background = '';
    }, 4000);
  };

  // Multi-step form helper for /book/
  // Looks for elements with class .step and progresses through them.
  window.initStepForm = function(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const steps = form.querySelectorAll('.step');
    if (steps.length < 2) return;

    let currentStep = 0;
    function show(i) {
      steps.forEach((s, idx) => {
        s.classList.toggle('is-active', idx === i);
        s.setAttribute('aria-hidden', idx === i ? 'false' : 'true');
      });
      // Update progress dots
      form.querySelectorAll('.step-dots span').forEach((d, idx) => {
        d.classList.toggle('is-active', idx === i);
        d.classList.toggle('is-done', idx < i);
      });
      // Focus the first input in the new step
      const firstInput = steps[i].querySelector('input, select, textarea, button');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
      currentStep = i;
    }

    form.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // Validate current step
        const step = steps[currentStep];
        const requiredInputs = step.querySelectorAll('[required]');
        let valid = true;
        requiredInputs.forEach(inp => {
          if (!inp.checkValidity()) {
            valid = false;
            inp.reportValidity();
          }
        });
        // Special case: if step has radio group, ensure one is selected
        const radios = step.querySelectorAll('input[type=radio]');
        if (radios.length > 0) {
          const groupNames = new Set();
          radios.forEach(r => groupNames.add(r.name));
          groupNames.forEach(name => {
            const checked = step.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
              valid = false;
              radios[0].setCustomValidity('Please pick one');
              radios[0].reportValidity();
            }
          });
        }
        if (valid && currentStep < steps.length - 1) show(currentStep + 1);
      });
    });

    form.querySelectorAll('[data-prev]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) show(currentStep - 1);
      });
    });

    show(0);
  };
})();
