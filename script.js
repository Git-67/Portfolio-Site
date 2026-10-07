/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   1. NAVBAR — scroll state + active link highlighting
   ---------------------------------------------------------- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ----------------------------------------------------------
   2. MOBILE MENU toggle
   ---------------------------------------------------------- */
(function initMobileMenu() {
  const toggle  = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!toggle || !navMenu) return;

  function closeMenu() {
    navMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when a nav link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMenu();
  });

  const navbar = document.querySelector('.navbar');
})();

/* ----------------------------------------------------------
   3. ACTIVE NAV LINK — highlight based on scroll position
   ---------------------------------------------------------- */
function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  let currentId = '';
  const offset  = window.innerHeight * 0.4;

  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= offset) {
      currentId = section.id;
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === currentId) {
      link.style.color = 'var(--text-primary)';
    } else {
      link.style.color = '';
    }
  });
}

/* ----------------------------------------------------------
   4. TYPEWRITER EFFECT
   ---------------------------------------------------------- */
(function initTypewriter() {
  const el = document.querySelector('.typewriter');
  if (!el) return;

  const phrases = [
    'AI & Data Analytics Student',
    'Python Enthusiast',
    'Data Explorer',
    'Aspiring ML Engineer',
    'Problem Solver',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let isPaused    = false;

  const TYPING_SPEED   = 70;   // ms per character
  const DELETING_SPEED = 35;
  const PAUSE_AFTER    = 1800; // ms before deleting
  const PAUSE_BEFORE   = 400;  // ms before typing next

  function tick() {
    const current = phrases[phraseIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(tick, isDeleting ? PAUSE_BEFORE : PAUSE_AFTER);
      return;
    }

    if (isDeleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        isDeleting  = false;
        isPaused    = true;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        isDeleting = true;
        isPaused   = true;
      }
    }

    const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;
    setTimeout(tick, speed);
  }

  // Small initial delay so the page settles first
  setTimeout(tick, 800);
})();

/* ----------------------------------------------------------
   5. SCROLL REVEAL — IntersectionObserver
   ---------------------------------------------------------- */
(function initScrollReveal() {
  // Add .reveal class to elements we want to animate
  const targets = [
    '.skill-card',
    '.project-card',
    '.timeline-item',
    '.about-grid',
    '.contact-grid',
    '.section-header',
  ];

  targets.forEach((selector, groupIndex) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger cards within the same group
      if (i < 4) {
        el.classList.add(`reveal-delay-${i + 1}`);
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ----------------------------------------------------------
   6. (Contact form removed — links only)
   ---------------------------------------------------------- */

/* ----------------------------------------------------------
   7. SMOOTH SCROLL — polyfill for older browsers
   ---------------------------------------------------------- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ----------------------------------------------------------
   8. ACTIVE SECTION — update document title on scroll
   ---------------------------------------------------------- */
(function initTitleUpdater() {
  const sectionTitles = {
    home:         'Home',
    about:        'About',
    skills:       'Skills',
    experience:   'Experience',
    projects:     'Projects',
    hackathons:   'Hackathons',
    education:    'Education',
    certificates: 'Certificates',
    contact:      'Contact',
  };

  const BASE_TITLE = document.title;

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    let currentId  = 'home';
    const offset   = window.innerHeight * 0.4;

    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= offset) {
        currentId = section.id;
      }
    });

    const label = sectionTitles[currentId];
    if (label) {
      document.title = `${label} | ${BASE_TITLE.split('|')[1]?.trim() || 'Portfolio'}`;
    }
  }, { passive: true });
})();

/* ----------------------------------------------------------
   9. DYNAMIC STUDY YEAR
   Rules:
     2026        → Year 1
     2027        → Year 2
     2028        → Year 3
     2029+       → Graduate
   ---------------------------------------------------------- */
(function initStudyYear() {
  const START_YEAR  = 2026;
  const currentYear = new Date().getFullYear();
  const yearDiff    = currentYear - START_YEAR; // 0, 1, 2, 3+

  let studyLabel;
  if (yearDiff <= 0)      studyLabel = 'Year 1';
  else if (yearDiff === 1) studyLabel = 'Year 2';
  else if (yearDiff === 2) studyLabel = 'Year 3';
  else                     studyLabel = 'Graduate';

  const isGrad = studyLabel === 'Graduate';

  // ── 1. Hero sub-paragraph ─────────────────────────────────
  document.querySelectorAll('.hero-sub').forEach(el => {
    el.innerHTML = el.innerHTML.replace(/Year \d+(?= student)/, studyLabel);
  });

  // ── 2. About fact "Year 1, 2026" ─────────────────────────
  const yearFact = document.getElementById('about-year-fact');
  if (yearFact) {
    yearFact.textContent = isGrad
      ? `Graduate, ${currentYear}`
      : `${studyLabel}, ${currentYear}`;
  }

  // ── 3. About paragraph body ───────────────────────────────
  document.querySelectorAll('.about-text p').forEach(el => {
    el.innerHTML = el.innerHTML.replace(
      /Year \d+ student/g,
      isGrad ? 'Graduate' : `${studyLabel} student`
    );
  });

  // ── 4. Avatar badge ───────────────────────────────────────
  document.querySelectorAll('.avatar-badge').forEach(el => {
    el.textContent = isGrad ? 'NYP Graduate' : `NYP ${currentYear}`;
  });

  // ── 5. Education timeline paragraph ──────────────────────
  const eduP = document.getElementById('edu-current-year');
  if (eduP) {
    if (isGrad) {
      eduP.innerHTML = eduP.innerHTML.replace(
        /Currently in Year \d+,/,
        'Graduated, having studied'
      );
    } else {
      eduP.innerHTML = eduP.innerHTML.replace(
        /Currently in Year \d+/,
        `Currently in ${studyLabel}`
      );
    }
  }

  // ── 6. Projects note ─────────────────────────────────────
  const projNote = document.getElementById('projects-note');
  if (projNote) {
    projNote.textContent = isGrad
      ? 'More projects coming soon — check back regularly!'
      : `More projects coming soon — currently building cool things in ${studyLabel}!`;
  }

  // ── 7. Footer year ────────────────────────────────────────
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = currentYear;

  // ── 8. Meta description ──────────────────────────────────
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      `Personal portfolio of Jing Heng — NYP ${studyLabel} AI & Data Analytics${isGrad ? '.' : ' student.'}`
    );
  }
})();

/* ----------------------------------------------------------
   10. BACK TO TOP — shows after scrolling past hero
   ---------------------------------------------------------- */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const hero = document.getElementById('home');

  function onScroll() {
    // Show once the user has scrolled past the hero section height
    const heroH = hero ? hero.offsetHeight : window.innerHeight;
    if (window.scrollY > heroH * 0.6) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
