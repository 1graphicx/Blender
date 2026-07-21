// ============================================================
// BLENDER MASTERCLASS — interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const topProgress = document.getElementById('topProgress');
  function updateProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    const pct = Math.min(100, Math.max(0, scrolled));
    progressBar.style.width = pct + '%';
    topProgress.textContent = Math.round(pct) + '% complété';
  }
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Modules accordion ---------- */
  const modules = document.querySelectorAll('.module');
  function setModuleOpen(mod, open) {
    const head = mod.querySelector('.module-head');
    const body = mod.querySelector('.module-body');
    mod.classList.toggle('open', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : null;
  }
  function toggleModule(mod) {
    const isOpen = mod.classList.contains('open');
    // close all others
    modules.forEach(m => { if (m !== mod) setModuleOpen(m, false); });
    setModuleOpen(mod, !isOpen);
  }
  modules.forEach(mod => {
    const head = mod.querySelector('.module-head');
    head.addEventListener('click', () => toggleModule(mod));
    head.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        toggleModule(mod);
      }
    });
  });

  // open first module by default
  if (modules.length) {
    setModuleOpen(modules[0], true);
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  function setFaqOpen(item, open) {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    item.classList.toggle('open', open);
    q.setAttribute('aria-expanded', open ? 'true' : 'false');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : null;
  }
  function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    faqItems.forEach(i => { if (i !== item) setFaqOpen(i, false); });
    setFaqOpen(item, !isOpen);
  }
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => toggleFaq(item));
    q.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        toggleFaq(item);
      }
    });
  });

  /* ---------- Smooth anchor scroll offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (ev) {
      const targetId = this.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (target) {
        ev.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 76;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Signature visual: rotating wireframe cube (Blender viewport look) ---------- */
  const svg = document.getElementById('cubeSvg');
  if (svg) {
    const W = 380, H = 360, CX = W / 2, CY = H / 2 + 10;
    const size = 78;

    // Cube vertices in local space
    const verts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    // Build persistent SVG elements
    const ns = 'http://www.w3.org/2000/svg';

    // Grid floor (subtle)
    const gridGroup = document.createElementNS(ns, 'g');
    gridGroup.setAttribute('opacity', '0.16');
    for (let i = -4; i <= 4; i++) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', CX - 150);
      line.setAttribute('x2', CX + 150);
      line.setAttribute('y1', CY + 120 + i * 14);
      line.setAttribute('y2', CY + 120 + i * 14);
      line.setAttribute('stroke', '#5b5c68');
      line.setAttribute('stroke-width', '1');
      gridGroup.appendChild(line);
    }
    svg.appendChild(gridGroup);

    // Axis gizmo (small, top-right-ish of stage handled separately in HUD)
    // Cube edges group
    const edgeEls = edges.map(() => {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('stroke', '#f08a34');
      line.setAttribute('stroke-width', '1.6');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      return line;
    });

    // Vertex dots
    const vertEls = verts.map(() => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('r', '3');
      c.setAttribute('fill', '#ffcf9e');
      svg.appendChild(c);
      return c;
    });

    // Axis indicator lines from center (X/Y/Z)
    const axisDefs = [
      { v: [1.6, 0, 0], color: '#ff5d5d', label: 'X' },
      { v: [0, 1.6, 0], color: '#8bdc63', label: 'Y' },
      { v: [0, 0, 1.6], color: '#5c9cff', label: 'Z' }
    ];
    const axisEls = axisDefs.map(a => {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('stroke', a.color);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('opacity', '0.85');
      svg.appendChild(line);
      return line;
    });

    let angleY = 0.6;
    let angleX = -0.35;
    let autoRotate = true;

    function project([x, y, z]) {
      // rotate around Y
      let cosY = Math.cos(angleY), sinY = Math.sin(angleY);
      let x1 = x * cosY - z * sinY;
      let z1 = x * sinY + z * cosY;
      // rotate around X
      let cosX = Math.cos(angleX), sinX = Math.sin(angleX);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      const persp = 1 / (1 + (z2 + 2.2) * 0.12);
      const px = CX + x1 * size * persp;
      const py = CY + y1 * size * persp;
      return [px, py, z2, persp];
    }

    function render() {
      const projected = verts.map(project);

      edges.forEach(([a, b], i) => {
        const [ax, ay] = projected[a];
        const [bx, by] = projected[b];
        edgeEls[i].setAttribute('x1', ax);
        edgeEls[i].setAttribute('y1', ay);
        edgeEls[i].setAttribute('x2', bx);
        edgeEls[i].setAttribute('y2', by);
      });

      projected.forEach(([x, y, , persp], i) => {
        vertEls[i].setAttribute('cx', x);
        vertEls[i].setAttribute('cy', y);
        vertEls[i].setAttribute('r', 2.6 * persp);
      });

      const origin = project([0, 0, 0]);
      axisDefs.forEach((a, i) => {
        const p = project(a.v);
        axisEls[i].setAttribute('x1', origin[0]);
        axisEls[i].setAttribute('y1', origin[1]);
        axisEls[i].setAttribute('x2', p[0]);
        axisEls[i].setAttribute('y2', p[1]);
      });
    }

    function loop() {
      if (autoRotate) {
        angleY += 0.0038;
      }
      render();
      requestAnimationFrame(loop);
    }
    render();
    requestAnimationFrame(loop);

    // Drag to orbit like a real viewport (bonus interactivity)
    let dragging = false, lastX = 0, lastY = 0;
    const stage = document.getElementById('viewportStage');
    stage.style.cursor = 'grab';
    stage.addEventListener('pointerdown', (e) => {
      dragging = true;
      autoRotate = false;
      lastX = e.clientX; lastY = e.clientY;
      stage.style.cursor = 'grabbing';
    });
    window.addEventListener('pointerup', () => {
      dragging = false;
      stage.style.cursor = 'grab';
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      angleY += dx * 0.008;
      angleX += dy * 0.008;
      angleX = Math.max(-1.4, Math.min(1.4, angleX));
      lastX = e.clientX; lastY = e.clientY;
    });
  }

  /* ---------- FPS counter flavor (cosmetic, feels alive) ---------- */
  const fpsEl = document.getElementById('fpsCounter');
  if (fpsEl) {
    setInterval(() => {
      const fps = (23 + Math.random() * 2).toFixed(0);
      fpsEl.textContent = fps + ' fps';
    }, 1400);
  }

  /* ---------- Parcours d'exercices : suivi de progression ---------- */
  // Remarque : la progression vit uniquement en mémoire pendant la session
  // (pas de localStorage ici) — un rafraîchissement de page remet les cases à zéro.
  const exoCheckboxes = document.querySelectorAll('[data-exo-checkbox]');
  const exoModules = [...new Set(Array.from(exoCheckboxes).map(cb => cb.closest('[data-exo-module]').dataset.exoModule))];

  function updateModuleProgress(moduleId) {
    const badge = document.querySelector(`[data-exo-progress="${moduleId}"]`);
    if (!badge) return;
    const boxes = document.querySelectorAll(`[data-exo-checkbox^="${moduleId}-"]`);
    const done = Array.from(boxes).filter(b => b.checked).length;
    const total = boxes.length;
    badge.textContent = `${done}/${total} fait${done > 1 ? 's' : ''}`;
    badge.classList.toggle('all-done', done === total && total > 0);
  }

  function updateGlobalProgress() {
    const total = exoCheckboxes.length;
    const done = Array.from(exoCheckboxes).filter(cb => cb.checked).length;
    const globalText = document.getElementById('globalExoText');
    const globalBar = document.getElementById('globalExoBar');
    if (globalText) globalText.textContent = `${done}/${total} exercices complétés`;
    if (globalBar) globalBar.classList.toggle('all-done', done === total && total > 0);
  }

  exoCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const moduleId = cb.closest('[data-exo-module]').dataset.exoModule;
      updateModuleProgress(moduleId);
      updateGlobalProgress();
      // keep the accordion height correct if the module is open (dimmed text can reflow)
      const mod = cb.closest('.module');
      if (mod && mod.classList.contains('open')) {
        const body = mod.querySelector('.module-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  exoModules.forEach(updateModuleProgress);
  updateGlobalProgress();

  // Recalculer la hauteur du module ouvert quand un indice (<details>) se déplie/replie
  document.querySelectorAll('.exo-hint').forEach(hint => {
    hint.addEventListener('toggle', () => {
      const mod = hint.closest('.module');
      if (mod && mod.classList.contains('open')) {
        const body = mod.querySelector('.module-body');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  const resetBtn = document.getElementById('resetExoBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      exoCheckboxes.forEach(cb => { cb.checked = false; });
      exoModules.forEach(updateModuleProgress);
      updateGlobalProgress();
    });
  }

});
