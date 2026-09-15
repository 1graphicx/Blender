// Helper function to switch weapon stage views (8K Render, 3D WebGL, 2D Blueprint)
window.switchWeaponView = function(btn, mode) {
  const stage = btn.closest('.weapon-blueprint-stage');
  if (!stage) return;
  const tabs = stage.querySelectorAll('.view-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const allViews = stage.querySelectorAll('.stage-content');
  allViews.forEach(v => v.classList.remove('active'));
  const targetView = stage.querySelector(`.${mode}-view`);
  if (targetView) targetView.classList.add('active');
  if (mode === 'webgl') {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }
};

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Multi-page Topnav Active State ---------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const topProgress = document.getElementById('topProgress');
  function updateProgress() {
    if (!progressBar) return;
    const h = document.documentElement;
    const scrollMax = h.scrollHeight - h.clientHeight;
    const scrolled = scrollMax > 0 ? (h.scrollTop / scrollMax) * 100 : 0;
    const pct = Math.min(100, Math.max(0, scrolled));
    progressBar.style.width = pct + '%';
    if (topProgress) topProgress.textContent = Math.round(pct) + '% complété';
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
    if (!mod) return;
    const head = mod.querySelector('.module-head');
    const body = mod.querySelector('.module-body');
    if (!head || !body) return;
    mod.classList.toggle('open', open);
    head.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : null;
  }
  function toggleModule(mod) {
    const isOpen = mod.classList.contains('open');
    modules.forEach(m => { if (m !== mod) setModuleOpen(m, false); });
    setModuleOpen(mod, !isOpen);
  }
  modules.forEach(mod => {
    const head = mod.querySelector('.module-head');
    if (!head) return;
    head.addEventListener('click', () => toggleModule(mod));
    head.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        toggleModule(mod);
      }
    });
  });

  if (modules.length) {
    setModuleOpen(modules[0], true);
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  function setFaqOpen(item, open) {
    if (!item) return;
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
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
    if (!q) return;
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

  /* ---------- SPEED QUIZ GAME ---------- */
  const quizQuestions = [
    // RACCOURCIS (Shortcuts)
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet de basculer entre le Mode Objet et le Mode Édition ?",
      options: ["Shift + Tab", "Tab", "Espace", "Entrée"],
      answer: 1,
      expl: "La touche Tabulation (Tab) est le basculement fondamental Objet / Édition."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet de déplacer (Grab/Translate) une sélection ?",
      options: ["G", "M", "T", "D"],
      answer: 0,
      expl: "G pour Grab (Attraper) déplace les objets ou éléments géométriques."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet d'effectuer une rotation (Rotate) ?",
      options: ["T", "R", "O", "Shift + R"],
      answer: 1,
      expl: "R pour Rotate fait pivoter la sélection."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet de redimensionner (Scale) un objet ?",
      options: ["Z", "S", "Ctrl + S", "Alt + S"],
      answer: 1,
      expl: "S pour Scale modifie la taille de la sélection."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "En Mode Édition, quelle touche déclenche l'Extrusion (E) ?",
      options: ["Ctrl + E", "E", "Shift + E", "Alt + E"],
      answer: 1,
      expl: "E extrude les sommets, arêtes ou faces sélectionnées le long de leur normale."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci insère une nouvelle découpe de boucle (Loop Cut) ?",
      options: ["Ctrl + R", "Shift + L", "Alt + R", "Ctrl + L"],
      answer: 0,
      expl: "Ctrl + R insère une boucle d'arêtes tout autour du maillage."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet d'insérer une face à l'intérieur d'une autre (Inset) ?",
      options: ["F", "I", "Insert", "Shift + I"],
      answer: 1,
      expl: "I pour Inset crée une face concentrique à l'intérieur de la sélection."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci applique un biseau / chanfrein (Bevel) aux arêtes ?",
      options: ["Ctrl + B", "Alt + B", "B", "Shift + B"],
      answer: 0,
      expl: "Ctrl + B arrondit ou brise les arêtes sélectionnées."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quelle combinaison de touches ouvre le menu d'ajout d'objets (Add Menu) ?",
      options: ["Ctrl + A", "Shift + A", "A", "Alt + A"],
      answer: 1,
      expl: "Shift + A (Maj + A) ouvre le menu d'ajout (Mesh, Armature, Image...)."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci permet de fusionner des sommets sélectionnés (Merge) ?",
      options: ["F", "M", "Ctrl + M", "J"],
      answer: 1,
      expl: "M ouvre le menu Merge (At Center, At Last, By Distance...)."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci crée un duplicata lié (Linked Duplicate) ?",
      options: ["Shift + D", "Alt + D", "Ctrl + D", "D"],
      answer: 1,
      expl: "Alt + D duplique l'objet en partageant la même géométrie (mesh data)."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci réinitialise et applique l'Échelle/Rotation (Apply Transforms) ?",
      options: ["Ctrl + A", "Shift + A", "Alt + A", "Ctrl + T"],
      answer: 0,
      expl: "Ctrl + A ouvre le menu Apply pour figer l'échelle à 1.0 et la rotation à 0."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "En Mode Édition, quelles touches permettent de basculer entre Sommets, Arêtes et Faces ?",
      options: ["F1 / F2 / F3", "1 / 2 / 3", "Tab", "Shift + 1/2/3"],
      answer: 1,
      expl: "Touches 1 (Sommets), 2 (Arêtes), 3 (Faces) du clavier au-dessus des lettres."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quelle touche du pavé numérique passe en vue de face (Front View) ?",
      options: ["Num 3", "Num 1", "Num 7", "Num 0"],
      answer: 1,
      expl: "Num 1 aligne la caméra en vue de face orthographique."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quelle touche du pavé numérique bascule entre vue Perspective et Orthographique ?",
      options: ["Num 5", "Num 1", "Num 9", "Num 0"],
      answer: 0,
      expl: "Num 5 bascule la projection de la caméra."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci déplie les coordonnées UV d'un mesh (Unwrap) ?",
      options: ["Ctrl + U", "U", "Shift + U", "V"],
      answer: 1,
      expl: "U ouvre le menu de dépliage UV (Unwrap, Smart UV Project...)."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci masque les objets ou éléments sélectionnés (Hide) ?",
      options: ["Alt + H", "H", "Ctrl + H", "X"],
      answer: 1,
      expl: "H masque la sélection temporairement dans le Viewport."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci réaffiche tous les objets masqués (Unhide) ?",
      options: ["Shift + H", "Alt + H", "Ctrl + H", "H"],
      answer: 1,
      expl: "Alt + H fait réapparaître tous les éléments cachés."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci sépare des faces sélectionnées en un objet indépendant (Separate) ?",
      options: ["Ctrl + P", "P", "S", "Alt + P"],
      answer: 1,
      expl: "P en mode édition sépare la sélection en un nouvel objet."
    },
    {
      cat: 'shortcuts',
      catLabel: 'Raccourcis',
      q: "Quel raccourci active l'édition proportionnelle (Proportional Editing) ?",
      options: ["P", "O", "Shift + O", "Alt + O"],
      answer: 1,
      expl: "O active/désactive l'édition proportionnelle (champ d'influence doux)."
    },

    // VOCABULAIRE & LANGAGE TECHNIQUE
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Qu'est-ce que l'Extrusion en modélisation 3D ?",
      options: [
        "Appliquer une couleur sur un matériau",
        "Créer de la nouvelle géométrie en étirant des sommets/faces",
        "Fusionner deux objets distincts",
        "Calculer le rendu final des lumières"
      ],
      answer: 1,
      expl: "L'extrusion génère du volume 3D à partir d'une surface ou d'une arête."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "À quoi sert le modificateur Subdivision Surface ?",
      options: [
        "Réduire le nombre de polygones pour Roblox",
        "Lisser la surface en subdivisant dynamiquement le maillage",
        "Découper l'objet en cubes voxels",
        "Inverser l'orientation des faces"
      ],
      answer: 1,
      expl: "Subdivision Surface ajoute des divisions dynamiques pour arrondir les formes."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Quel est le rôle du modificateur Mirror ?",
      options: [
        "Créer un miroir réfléchissant dans le jeu",
        "Générer une symétrie automatique le long d'un axe",
        "Inverser l'échelle globale de l'objet",
        "Fusionner les matériaux de deux objets"
      ],
      answer: 1,
      expl: "Mirror reproduit automatiquement la moitié de l'objet de l'autre côté de l'axe."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Qu'est-ce que le Dépliage UV (UV Unwrapping) ?",
      options: [
        "Supprimer les faces inutiles à l'intérieur du mesh",
        "Projeter la surface 3D à plat sur une image 2D",
        "Convertir un mesh en squelette articulé",
        "Rendre l'objet transparent"
      ],
      answer: 1,
      expl: "L'UV mapping associe chaque point 3D du mesh à une coordonnée 2D sur la texture."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "À quoi sert l'option Shade Auto Smooth ?",
      options: [
        "Lisser les surfaces tout en gardant les arêtes vives selon un angle",
        "Augmenter automatiquement le nombre de triangles",
        "Calculer les ombres portées dans Roblox Studio",
        "Nettoyer les sommets doublons"
      ],
      answer: 0,
      expl: "Auto Smooth lisse l'ombrage visuel sans toucher la géométrie réelle."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Qu'est-ce qu'une 'Normale' de face (Face Normal) ?",
      options: [
        "Une couleur par défaut dans Blender",
        "Un vecteur perpendiculaire indiquant la direction vers laquelle pointe la face",
        "Le centre géométrique d'un objet",
        "La vitesse de rotation de la caméra"
      ],
      answer: 1,
      expl: "Les normales définissent la direction de la lumière et la distinction intérieur/extérieur."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "À quoi sert le modificateur Decimate ?",
      options: [
        "Créer des animations par images clés",
        "Réduire le nombre de triangles pour optimiser les performances",
        "Convertir un mesh en objet Roblox Part",
        "Ajouter une texture de bois automatique"
      ],
      answer: 1,
      expl: "Decimate allège la géométrie en fusionnant les triangles proches sans détruire la forme."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "En développement Roblox Studio, qu'est-ce qu'un 'Stud' ?",
      options: [
        "Un modificateur d'arête dans Blender",
        "L'unité de mesure de distance dans le moteur Roblox",
        "Un type de shader PBR",
        "Un raccourci clavier pour dupliquer"
      ],
      answer: 1,
      expl: "1 stud vaut environ 0.28m. Un personnage Roblox mesure environ 5 studs de haut."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Qu'est-ce que l'Origine d'un objet (Pivot point) ?",
      options: [
        "La première face créée lors du cube de départ",
        "Le point de référence central autour duquel s'effectuent G, R et S",
        "La caméra principale du viewport",
        "Le nom du fichier de sauvegarde"
      ],
      answer: 1,
      expl: "L'origine détermine le point de pivot pour les rotations et la position dans Roblox."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Quel est l'avantage principal du format FBX pour l'exportation vers Roblox ?",
      options: [
        "Il réduit la taille des fichiers audio",
        "Il conserve les objets séparés, les UV et les armatures d'animation",
        "Il remplace les matériaux par du code Lua",
        "Il est 100 fois plus rapide à charger qu'un OBJ"
      ],
      answer: 1,
      expl: "Le format FBX est le standard moderne pour transférer maillages, UV et squelettes."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Qu'est-ce que le 'Rigging' dans Blender ?",
      options: [
        "Nettoyer les doublons de sommets avec M",
        "Créer un squelette d'os (Armature) pour animer un personnage ou objet",
        "Déplier les UV pour peindre une texture",
        "Exporter le projet sur Vercel"
      ],
      answer: 1,
      expl: "Le Rigging prépare le squelette interne qui permettra de déformer et animer l'objet."
    },
    {
      cat: 'vocab',
      catLabel: 'Vocabulaire',
      q: "Que fait le mode 'Block' du modificateur Remesh ?",
      options: [
        "Bloquer la modification des sommets",
        "Mettre en forme le mesh sous forme de blocs voxels cubiques (style pixel/brain rot)",
        "Détruire toutes les faces internes",
        "Appliquer automatiquement tous les modificateurs"
      ],
      answer: 1,
      expl: "Remesh Block transforme tout maillage en une structure voxelisée stylisée."
    }
  ];

  // Synthesized Web Audio API sound effects
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (!audioCtx || audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch(e) { /* ignore audio errors */ }
  }

  // Quiz DOM elements
  const startScreen = document.getElementById('quizStartScreen');
  const gameScreen = document.getElementById('quizGameScreen');
  const resultsScreen = document.getElementById('quizResultsScreen');
  const startBtn = document.getElementById('startQuizBtn');
  const restartBtn = document.getElementById('restartQuizBtn');

  const catBtns = document.querySelectorAll('.quiz-cat-btn');
  const highScoreEl = document.getElementById('quizHighScore');
  const highStreakEl = document.getElementById('quizHighStreak');

  const qNumEl = document.getElementById('quizQNum');
  const catTagEl = document.getElementById('quizCatTag');
  const streakBadgeEl = document.getElementById('quizStreakBadge');
  const scoreValEl = document.getElementById('quizScoreVal');
  const timerBar = document.getElementById('quizTimerBar');
  const timerText = document.getElementById('quizTimerText');
  const questionText = document.getElementById('quizQuestionText');
  const optionsGrid = document.getElementById('quizOptionsGrid');
  const feedbackBox = document.getElementById('quizFeedbackBox');
  const feedbackStatus = document.getElementById('quizFeedbackStatus');
  const feedbackExpl = document.getElementById('quizFeedbackExpl');
  const nextBtn = document.getElementById('quizNextBtn');
  const quitBtn = document.getElementById('quizQuitBtn');
  const changeModeBtn = document.getElementById('changeModeBtn');

  const finalScoreEl = document.getElementById('quizFinalScore');
  const finalAccuracyEl = document.getElementById('quizFinalAccuracy');
  const finalStreakEl = document.getElementById('quizFinalStreak');
  const rankEmojiEl = document.getElementById('quizRankEmoji');
  const rankTitleEl = document.getElementById('quizRankTitle');
  const rankSubtitleEl = document.getElementById('quizRankSubtitle');
  const reviewListEl = document.getElementById('quizReviewList');

  // Quiz state variables
  let selectedCategory = 'all';
  let availablePool = [];
  let currentQData = null;
  let totalAnsweredCount = 0;
  let totalCorrectCount = 0;
  let currentScore = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let timerInterval = null;
  let timeLeft = 10;
  let missedQuestions = [];
  let isAnswered = false;

  // Local storage high scores
  let storedHighScore = parseInt(localStorage.getItem('blender_quiz_highscore') || '0', 10);
  let storedHighStreak = parseInt(localStorage.getItem('blender_quiz_highstreak') || '0', 10);

  function updateHighScoreDisplay() {
    if (highScoreEl) highScoreEl.textContent = storedHighScore + ' pts';
    if (highStreakEl) highStreakEl.textContent = storedHighStreak + ' 🔥';
  }
  updateHighScoreDisplay();

  // Category selection
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.cat;
    });
  });

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    availablePool = [];
    currentQData = null;
    totalAnsweredCount = 0;
    totalCorrectCount = 0;
    currentScore = 0;
    currentStreak = 0;
    maxStreak = 0;
    missedQuestions = [];

    if (startScreen) startScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    loadQuestion();
  }

  function loadQuestion() {
    isAnswered = false;
    clearInterval(timerInterval);
    if (feedbackBox) feedbackBox.classList.add('hidden');

    let pool = quizQuestions;
    if (selectedCategory !== 'all') {
      pool = quizQuestions.filter(q => q.cat === selectedCategory);
    }

    if (availablePool.length === 0) {
      availablePool = shuffle([...pool]);
    }

    const rawQ = availablePool.pop();
    const correctText = rawQ.options[rawQ.answer];
    const shuffledOptions = shuffle([...rawQ.options]);
    const newAnswerIdx = shuffledOptions.indexOf(correctText);

    currentQData = {
      ...rawQ,
      options: shuffledOptions,
      answer: newAnswerIdx
    };

    if (qNumEl) qNumEl.textContent = `Question ${totalAnsweredCount + 1}`;
    if (catTagEl) catTagEl.textContent = currentQData.catLabel;
    if (streakBadgeEl) streakBadgeEl.textContent = `🔥 x${currentStreak}`;
    if (scoreValEl) scoreValEl.textContent = `${currentScore} pts`;

    if (questionText) questionText.textContent = currentQData.q;

    // Render 4 options randomly shuffled
    if (optionsGrid) {
      optionsGrid.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      currentQData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span class="opt-letter">${letters[idx]}</span><span>${opt}</span>`;
        btn.addEventListener('click', () => handleAnswer(idx));
        optionsGrid.appendChild(btn);
      });
    }

    // Reset Timer 10s
    timeLeft = 10;
    updateTimerUI();

    const startTime = Date.now();
    const duration = 10000;

    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      timeLeft = remaining / 1000;

      updateTimerUI();

      if (remaining <= 0) {
        clearInterval(timerInterval);
        handleAnswer(-1); // Timeout!
      }
    }, 50);
  }

  function updateTimerUI() {
    if (!timerBar || !timerText) return;
    const pct = (timeLeft / 10) * 100;
    timerBar.style.width = pct + '%';
    timerText.textContent = Math.ceil(timeLeft) + 's';

    timerBar.classList.remove('warning', 'critical');
    if (timeLeft <= 3) {
      timerBar.classList.add('critical');
    } else if (timeLeft <= 5.5) {
      timerBar.classList.add('warning');
    }
  }

  function handleAnswer(selectedIdx) {
    if (isAnswered) return;
    isAnswered = true;
    clearInterval(timerInterval);

    totalAnsweredCount++;
    const qData = currentQData;
    const optionBtns = optionsGrid ? optionsGrid.querySelectorAll('.quiz-option-btn') : [];

    optionBtns.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedIdx === qData.answer);

    if (isCorrect) {
      totalCorrectCount++;
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      const timeBonus = Math.round(timeLeft * 15);
      const streakMultiplier = 1 + (currentStreak - 1) * 0.15;
      const pts = Math.round((100 + timeBonus) * streakMultiplier);

      currentScore += pts;
      if (scoreValEl) scoreValEl.textContent = `${currentScore} pts`;
      if (streakBadgeEl) streakBadgeEl.textContent = `🔥 x${currentStreak}`;

      if (optionBtns[selectedIdx]) optionBtns[selectedIdx].classList.add('correct');

      if (feedbackStatus) {
        feedbackStatus.textContent = `⚡ EXCELLENT ! +${pts} PTS`;
        feedbackStatus.className = 'feedback-status correct-text';
      }
      if (feedbackExpl) feedbackExpl.textContent = qData.expl;
      if (feedbackBox) feedbackBox.classList.remove('hidden');

      playSound('correct');
    } else {
      currentStreak = 0;
      if (streakBadgeEl) streakBadgeEl.textContent = `🔥 x0`;

      if (selectedIdx >= 0 && optionBtns[selectedIdx]) {
        optionBtns[selectedIdx].classList.add('wrong');
        if (feedbackStatus) {
          feedbackStatus.textContent = `❌ MAUVAISE RÉPONSE`;
          feedbackStatus.className = 'feedback-status wrong-text';
        }
      } else {
        if (feedbackStatus) {
          feedbackStatus.textContent = `⏱️ TEMPS ÉCOULÉ !`;
          feedbackStatus.className = 'feedback-status timeout-text';
        }
      }

      if (optionBtns[qData.answer]) {
        optionBtns[qData.answer].classList.add('correct');
      }

      if (feedbackExpl) feedbackExpl.textContent = `Bonne réponse : ${qData.options[qData.answer]}. ${qData.expl}`;
      if (feedbackBox) feedbackBox.classList.remove('hidden');

      missedQuestions.push({
        q: qData.q,
        correct: qData.options[qData.answer],
        userAns: selectedIdx >= 0 ? qData.options[selectedIdx] : 'Temps écoulé'
      });

      playSound('wrong');
    }

    if (nextBtn) {
      setTimeout(() => { nextBtn.focus(); }, 50);
    }
  }

  function advanceToNext() {
    if (!isAnswered) return;
    loadQuestion();
  }

  function showResults() {
    clearInterval(timerInterval);
    if (gameScreen) gameScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.remove('hidden');

    const total = totalAnsweredCount;
    const correctCount = totalCorrectCount;
    const accuracyPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    if (finalScoreEl) finalScoreEl.textContent = currentScore;
    if (finalAccuracyEl) finalAccuracyEl.textContent = `${accuracyPct}% (${correctCount}/${total})`;
    if (finalStreakEl) finalStreakEl.textContent = `${maxStreak} 🔥`;

    // High score save
    if (currentScore > storedHighScore) {
      storedHighScore = currentScore;
      localStorage.setItem('blender_quiz_highscore', storedHighScore.toString());
    }
    if (maxStreak > storedHighStreak) {
      storedHighStreak = maxStreak;
      localStorage.setItem('blender_quiz_highstreak', storedHighStreak.toString());
    }
    updateHighScoreDisplay();

    // Ranks
    if (rankEmojiEl && rankTitleEl && rankSubtitleEl) {
      if (total === 0) {
        rankEmojiEl.textContent = '👋';
        rankTitleEl.textContent = 'Partie interrompue';
        rankSubtitleEl.textContent = 'Tu as quitté avant d\'avoir répondu à une question.';
      } else if (accuracyPct === 100 && total >= 5) {
        rankEmojiEl.textContent = '👑';
        rankTitleEl.textContent = 'Légende de Blender !';
        rankSubtitleEl.textContent = 'Score parfait ! Tu possèdes la mémoire musculaire absolue des raccourcis 3D.';
      } else if (accuracyPct >= 80) {
        rankEmojiEl.textContent = '⚡';
        rankTitleEl.textContent = 'Modélisateur Pro';
        rankSubtitleEl.textContent = 'Impressionnant ! Tes réflexes en Mode Édition et raccourcis sont ultra-rapides.';
      } else if (accuracyPct >= 50) {
        rankEmojiEl.textContent = '🧊';
        rankTitleEl.textContent = 'Cadet en Progression';
        rankSubtitleEl.textContent = 'Beau travail ! Un peu plus d\'entraînement et les raccourcis deviendront automatiques.';
      } else {
        rankEmojiEl.textContent = '🔨';
        rankTitleEl.textContent = 'Apprenti Blender';
        rankSubtitleEl.textContent = 'Relis l\'aide-mémoire des raccourcis ci-dessus et réessaie pour consolider tes bases !';
      }
    }

    // Review list
    if (reviewListEl) {
      reviewListEl.innerHTML = '';
      if (missedQuestions.length === 0) {
        reviewListEl.innerHTML = total > 0
          ? '<div style="color:var(--axis-y);font-weight:600;">Aucune erreur ! Une session sans faute parfaite 🎯</div>'
          : '<div style="color:var(--ink-3);">Aucune question répondue.</div>';
      } else {
        missedQuestions.forEach(item => {
          const div = document.createElement('div');
          div.className = 'quiz-review-item';
          div.innerHTML = `
            <div class="review-q">${item.q}</div>
            <div class="review-ans">✓ Bonne réponse : <strong>${item.correct}</strong></div>
          `;
          reviewListEl.appendChild(div);
        });
      }
    }
  }

  function returnToStart() {
    clearInterval(timerInterval);
    if (gameScreen) gameScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (startScreen) startScreen.classList.remove('hidden');
  }

  if (startBtn) startBtn.addEventListener('click', startQuiz);
  if (restartBtn) restartBtn.addEventListener('click', startQuiz);
  if (nextBtn) nextBtn.addEventListener('click', advanceToNext);
  if (quitBtn) quitBtn.addEventListener('click', returnToStart);
  if (changeModeBtn) changeModeBtn.addEventListener('click', returnToStart);

  // Keyboard navigation: Enter/Space to advance, 1-4 or A-D to answer
  document.addEventListener('keydown', (e) => {
    if (!gameScreen || gameScreen.classList.contains('hidden')) return;

    if (isAnswered) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        advanceToNext();
      }
    } else {
      const key = e.key.toLowerCase();
      let idx = -1;
      if (key === '1' || key === 'a') idx = 0;
      else if (key === '2' || key === 'b') idx = 1;
      else if (key === '3' || key === 'c') idx = 2;
      else if (key === '4' || key === 'd') idx = 3;

      if (idx !== -1) {
        e.preventDefault();
        handleAnswer(idx);
      }
    }
  });

  /* ---------- ATELIER ARMES 3D ---------- */
  const wFilterBtns = document.querySelectorAll('.weapon-filter-btn');
  const weaponCards = document.querySelectorAll('.weapon-card[data-wcat]');

  wFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.wfilter;
      weaponCards.forEach(card => {
        if (filter === 'all' || card.dataset.wcat === filter) {
          card.classList.remove('hidden-weapon');
        } else {
          card.classList.add('hidden-weapon');
        }
      });
    });
  });

  const weaponCardsList = document.querySelectorAll('.weapon-card');
  weaponCardsList.forEach(card => {
    const weaponId = card.dataset.weaponId;
    const checkboxes = card.querySelectorAll('.wstep-checkbox');
    const badge = card.querySelector(`[data-wprog="${weaponId}"]`);

    function updateWeaponProgress() {
      const total = checkboxes.length;
      let done = 0;
      checkboxes.forEach((cb) => {
        const stepItem = cb.closest('.weapon-step-item');
        if (cb.checked) {
          done++;
          if (stepItem) stepItem.classList.add('completed');
        } else {
          if (stepItem) stepItem.classList.remove('completed');
        }
      });

      if (badge) {
        if (done === total && total > 0) {
          badge.textContent = `${done}/${total} étapes complétées ✓`;
          badge.classList.add('all-done');
        } else {
          badge.textContent = `${done}/${total} étapes validées`;
          badge.classList.remove('all-done');
        }
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', updateWeaponProgress);
    });

    updateWeaponProgress();
  });

  /* ---------- THREE.JS INTERACTIVE 3D WEAPON ENGINE (PHOTOREALISTIC AAA) ---------- */
  if (typeof THREE !== 'undefined') {
    const stageEls = document.querySelectorAll('[data-3d-model]');

    // Helper: Create Canvas Bump/Normal Map
    function createNoiseNormalMap(type) {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#8080ff'; ctx.fillRect(0, 0, 256, 256);

      if (type === 'stippling') {
        for (let i = 0; i < 3000; i++) {
          const x = Math.random() * 256;
          const y = Math.random() * 256;
          const r = Math.random() * 1.5 + 0.5;
          ctx.fillStyle = Math.random() > 0.5 ? '#9080ff' : '#7080ff';
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        }
      } else if (type === 'brushed') {
        for (let y = 0; y < 256; y += 2) {
          const val = Math.floor(128 + (Math.random() - 0.5) * 40);
          ctx.fillStyle = `rgb(128,${val},255)`;
          ctx.fillRect(0, y, 256, 1);
        }
      } else if (type === 'wood') {
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 8) {
          ctx.fillStyle = `rgba(160,128,255,0.25)`;
          ctx.fillRect(0, y, 256, 3);
        }
      }
      return new THREE.CanvasTexture(canvas);
    }

    const stippleBump = createNoiseNormalMap('stippling');
    const brushedBump = createNoiseNormalMap('brushed');
    const woodBump = createNoiseNormalMap('wood');
    stippleBump.wrapS = stippleBump.wrapT = THREE.RepeatWrapping;
    stippleBump.repeat.set(4, 4);
    brushedBump.wrapS = brushedBump.wrapT = THREE.RepeatWrapping;
    brushedBump.repeat.set(6, 2);
    woodBump.wrapS = woodBump.wrapT = THREE.RepeatWrapping;

    stageEls.forEach(stage => {
      const modelType = stage.dataset['3dModel'];
      const width = stage.clientWidth || 480;
      const height = 245;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0b0e);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      camera.position.set(0, 0.4, 4.2);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      stage.appendChild(renderer.domElement);

      // Studio Lighting
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x101118, 0.8);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
      keyLight.position.set(6, 9, 6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x5c9cff, 1.2);
      fillLight.position.set(-6, -2, -4);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xf08a34, 0.9);
      rimLight.position.set(0, -6, 5);
      scene.add(rimLight);

      // Shadow catcher plane
      const shadowPlaneGeo = new THREE.PlaneGeometry(20, 20);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.2;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      const weaponGroup = new THREE.Group();
      scene.add(weaponGroup);

      // Photorealistic PBR Materials
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x22242c, metalness: 0.92, roughness: 0.22, normalMap: brushedBump, normalScale: new THREE.Vector2(0.3, 0.3) });
      const polishedSteelMat = new THREE.MeshStandardMaterial({ color: 0xdde4ec, metalness: 0.98, roughness: 0.08 });
      const darkPolymerMat = new THREE.MeshStandardMaterial({ color: 0x14151a, metalness: 0.08, roughness: 0.6, normalMap: stippleBump, normalScale: new THREE.Vector2(0.5, 0.5) });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.18 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xc4b256, metalness: 0.88, roughness: 0.25 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, metalness: 0.02, roughness: 0.68, normalMap: woodBump, normalScale: new THREE.Vector2(0.4, 0.4) });
      const leatherMat = new THREE.MeshStandardMaterial({ color: 0x5a331c, metalness: 0.0, roughness: 0.75 });
      const tritiumMat = new THREE.MeshStandardMaterial({ color: 0x8bdc63, emissive: 0x8bdc63, emissiveIntensity: 1.5 });

      // Build High-Detail 3D Models
      if (modelType === 'm4a1') {
        // AK-47 Stamped Steel Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.44, 0.36), steelMat);
        receiver.position.set(0, 0.12, 0); receiver.castShadow = true;
        weaponGroup.add(receiver);

        // Curved Dust Cover (Couvercle de culasse)
        const dustCover = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.45, 12, 1, false, 0, Math.PI), steelMat);
        dustCover.rotation.z = Math.PI / 2;
        dustCover.position.set(-0.05, 0.34, 0); dustCover.castShadow = true;
        weaponGroup.add(dustCover);

        // Varnished Walnut Stock (Crosse bois)
        const stockShape = new THREE.Shape();
        stockShape.moveTo(0, 0); stockShape.lineTo(-1.3, -0.22); stockShape.lineTo(-1.35, -0.68); stockShape.lineTo(-0.15, -0.25); stockShape.closePath();
        const stockGeo = new THREE.ExtrudeGeometry(stockShape, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03 });
        const stock = new THREE.Mesh(stockGeo, woodMat);
        stock.position.set(-0.82, 0.18, -0.14); stock.castShadow = true;
        weaponGroup.add(stock);

        // Steel Buttplate (Plaque de couche)
        const buttplate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.32), steelMat);
        buttplate.position.set(-2.18, -0.28, 0);
        weaponGroup.add(buttplate);

        // Varnished Wood Pistol Grip (Poignée bois)
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.85, 0.28), woodMat);
        grip.rotation.z = -0.36; grip.position.set(-0.52, -0.55, 0); grip.castShadow = true;
        weaponGroup.add(grip);

        // Curved Banana Magazine 7.62x39mm (Chargeur courbé)
        const magShape = new THREE.Shape();
        magShape.moveTo(0, 0); magShape.lineTo(0.42, -0.15); magShape.lineTo(0.18, -1.25); magShape.lineTo(-0.25, -1.15); magShape.closePath();
        const magGeo = new THREE.ExtrudeGeometry(magShape, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
        const mag = new THREE.Mesh(magGeo, steelMat);
        mag.position.set(0.18, -0.15, -0.13); mag.castShadow = true;
        weaponGroup.add(mag);

        // Wood Lower & Upper Handguard (Garde-main bois)
        const lowerGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.25, 12), woodMat);
        lowerGuard.rotation.z = Math.PI / 2; lowerGuard.position.set(1.45, 0.08, 0); lowerGuard.castShadow = true;
        weaponGroup.add(lowerGuard);

        const upperGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.05, 12), woodMat);
        upperGuard.rotation.z = Math.PI / 2; upperGuard.position.set(1.42, 0.35, 0); upperGuard.castShadow = true;
        weaponGroup.add(upperGuard);

        // Gas Block Tube & Barrel (Tube emprunt gaz + canon)
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 2.4, 12), steelMat);
        barrel.rotation.z = Math.PI / 2; barrel.position.set(2.0, 0.12, 0); barrel.castShadow = true;
        weaponGroup.add(barrel);

        const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 12), steelMat);
        gasTube.rotation.z = Math.PI / 2; gasTube.position.set(1.5, 0.35, 0);
        weaponGroup.add(gasTube);

        // Slanted Muzzle Brake (Compensateur biseauté)
        const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.25, 10), steelMat);
        brake.rotation.z = Math.PI / 2; brake.position.set(3.22, 0.12, 0);
        weaponGroup.add(brake);

        // Front Sight Hood (Guidon protégé)
        const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.18), steelMat);
        frontSight.position.set(3.05, 0.32, 0);
        weaponGroup.add(frontSight);

        // Rear Tangent Sight (Hausse arrière)
        const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.1, 0.16), steelMat);
        rearSight.position.set(0.72, 0.38, 0);
        weaponGroup.add(rearSight);

        weaponGroup.position.set(-0.4, 0.1, 0);

      } else if (modelType === 'katana-aaa') {
        // Curved Blade (Shinogi-Zukuri)
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0); bladeShape.lineTo(3.2, 0.12); bladeShape.lineTo(3.4, 0.04); bladeShape.lineTo(3.2, -0.02); bladeShape.lineTo(0, -0.06); bladeShape.closePath();
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 });
        const blade = new THREE.Mesh(bladeGeo, polishedSteelMat);
        blade.position.set(0.1, 0.05, -0.02); blade.rotation.z = 0.04; blade.castShadow = true;
        weaponGroup.add(blade);

        // Habaki
        const habaki = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.08), brassMat);
        habaki.position.set(0.02, 0.02, 0); habaki.castShadow = true;
        weaponGroup.add(habaki);

        // Tsuba (Carved Guard)
        const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 24), steelMat);
        tsuba.rotation.z = Math.PI / 2; tsuba.position.set(-0.12, 0.01, 0); tsuba.castShadow = true;
        weaponGroup.add(tsuba);

        // Tsuka (Samegawa & Tsuka-ito)
        const tsuka = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.25, 12), darkPolymerMat);
        tsuka.rotation.z = Math.PI / 2; tsuka.position.set(-0.78, -0.02, 0); tsuka.castShadow = true;
        weaponGroup.add(tsuka);

        // Gold Menuki
        const menuki = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.16), goldMat);
        menuki.position.set(-0.75, -0.02, 0);
        weaponGroup.add(menuki);

        // Kashira End
        const kashira = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12), goldMat);
        kashira.rotation.z = Math.PI / 2; kashira.position.set(-1.42, -0.04, 0);
        weaponGroup.add(kashira);

        weaponGroup.position.set(-0.3, 0, 0);

      } else if (modelType === 'pistolet-aaa') {
        // Slide (Serrations)
        const slide = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.42, 0.36), steelMat);
        slide.position.set(0.1, 0.24, 0); slide.castShadow = true;
        weaponGroup.add(slide);

        // Polygon Frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.36, 0.34), darkPolymerMat);
        frame.position.set(0, -0.06, 0); frame.castShadow = true;
        weaponGroup.add(frame);

        // Stippled Grip
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.15, 0.32), darkPolymerMat);
        grip.rotation.z = -0.34; grip.position.set(-0.36, -0.68, 0); grip.castShadow = true;
        weaponGroup.add(grip);

        // Floating Barrel
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.45, 12), polishedSteelMat);
        barrel.rotation.z = Math.PI / 2; barrel.position.set(1.08, 0.24, 0);
        weaponGroup.add(barrel);

        // Trigger & Guard
        const guard = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 16, Math.PI), darkPolymerMat);
        guard.rotation.z = -Math.PI / 2; guard.position.set(0.22, -0.32, 0);
        weaponGroup.add(guard);

        // Tritium Night Sights
        const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), steelMat);
        rearSight.position.set(-0.75, 0.48, 0);
        weaponGroup.add(rearSight);

        const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.1), steelMat);
        frontSight.position.set(0.92, 0.48, 0);
        weaponGroup.add(frontSight);

        const tritiumDot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), tritiumMat);
        tritiumDot.position.set(0.92, 0.49, 0);
        weaponGroup.add(tritiumDot);

        weaponGroup.position.set(0.1, 0.2, 0);

      } else if (modelType === 'epee-aaa') {
        // Blade (Diamond Section)
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0.08); bladeShape.lineTo(3.5, 0.04); bladeShape.lineTo(3.7, 0); bladeShape.lineTo(3.5, -0.04); bladeShape.lineTo(0, -0.08); bladeShape.closePath();
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.01 });
        const blade = new THREE.Mesh(bladeGeo, polishedSteelMat);
        blade.position.set(0.1, 0, -0.025); blade.castShadow = true;
        weaponGroup.add(blade);

        // Crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.45, 0.14), steelMat);
        guard.position.set(0, 0, 0); guard.castShadow = true;
        weaponGroup.add(guard);

        // Leather Grip
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.05, 12), leatherMat);
        grip.rotation.z = Math.PI / 2; grip.position.set(-0.58, 0, 0); grip.castShadow = true;
        weaponGroup.add(grip);

        // Octagonal Pommel
        const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.22), steelMat);
        pommel.position.set(-1.18, 0, 0); pommel.castShadow = true;
        weaponGroup.add(pommel);

        weaponGroup.position.set(-0.2, 0, 0);

      } else if (modelType === 'marteau-aaa') {
        // Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 3.2, 12), woodMat);
        shaft.position.set(0, 0, 0); shaft.castShadow = true;
        weaponGroup.add(shaft);

        // Langets
        const langet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.24), steelMat);
        langet.position.set(0, 0.8, 0);
        weaponGroup.add(langet);

        // Hammer Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.52), steelMat);
        head.position.set(0.35, 1.35, 0); head.castShadow = true;
        weaponGroup.add(head);

        // Corbin Spike
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.75, 4), steelMat);
        spike.rotation.z = Math.PI / 2; spike.position.set(-0.48, 1.35, 0); spike.castShadow = true;
        weaponGroup.add(spike);

        weaponGroup.rotation.z = -Math.PI / 4;
        weaponGroup.position.set(0, -0.2, 0);

      } else if (modelType === 'hache-aaa') {
        // Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 3.1, 12), woodMat);
        shaft.position.set(0, 0, 0); shaft.castShadow = true;
        weaponGroup.add(shaft);

        // Bearded Axe Head
        const axeShape = new THREE.Shape();
        axeShape.moveTo(0, 0); axeShape.lineTo(0.95, 0.85); axeShape.lineTo(1.15, 0.05); axeShape.lineTo(0.85, -0.95); axeShape.closePath();
        const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
        const axeGeo = new THREE.ExtrudeGeometry(axeShape, extrudeSettings);
        const axeMesh = new THREE.Mesh(axeGeo, polishedSteelMat);
        axeMesh.position.set(0.05, 0.95, -0.06); axeMesh.castShadow = true;
        weaponGroup.add(axeMesh);

        weaponGroup.rotation.z = -Math.PI / 4;
        weaponGroup.position.set(-0.2, -0.2, 0);

      } else if (modelType === 'master-sword') {
        const royalPurpleMat = new THREE.MeshStandardMaterial({ color: 0x3d276b, metalness: 0.65, roughness: 0.32 });
        const tealGripMat = new THREE.MeshStandardMaterial({ color: 0x1b4d4b, metalness: 0.1, roughness: 0.72 });
        const glowingTriforceMat = new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffb700, emissiveIntensity: 1.2 });

        // Blade with fuller
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0.11); bladeShape.lineTo(3.3, 0.07); bladeShape.lineTo(3.6, 0); bladeShape.lineTo(3.3, -0.07); bladeShape.lineTo(0, -0.11); bladeShape.closePath();
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012 });
        const blade = new THREE.Mesh(bladeGeo, polishedSteelMat);
        blade.position.set(0.12, 0, -0.025); blade.castShadow = true;
        weaponGroup.add(blade);

        // Triforce Crest on Ricasso
        const triforce = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 3), glowingTriforceMat);
        triforce.rotation.z = -Math.PI / 2; triforce.position.set(0.45, 0, 0.03);
        weaponGroup.add(triforce);

        // Winged Purple Crossguard (Garde à ailes)
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0); wingShape.lineTo(-0.25, 0.85); wingShape.lineTo(-0.45, 0.6); wingShape.lineTo(-0.2, 0.15); wingShape.lineTo(0, 0);
        const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
        const leftWing = new THREE.Mesh(wingGeo, royalPurpleMat);
        leftWing.position.set(0.05, 0, -0.08); leftWing.castShadow = true;
        weaponGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, royalPurpleMat);
        rightWing.scale.y = -1;
        rightWing.position.set(0.05, 0, 0.08); rightWing.rotation.x = Math.PI; rightWing.castShadow = true;
        weaponGroup.add(rightWing);

        // Central Gold Diamond Crest
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), goldMat);
        gem.position.set(0, 0, 0);
        weaponGroup.add(gem);

        // Teal Grip
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.15, 16), tealGripMat);
        grip.rotation.z = Math.PI / 2; grip.position.set(-0.65, 0, 0); grip.castShadow = true;
        weaponGroup.add(grip);

        // Gold Ring Spacer
        const spacer = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), goldMat);
        spacer.rotation.z = Math.PI / 2; spacer.position.set(-0.12, 0, 0);
        weaponGroup.add(spacer);

        // Fluted Pommel
        const pommel = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 8), polishedSteelMat);
        pommel.rotation.z = Math.PI / 2; pommel.position.set(-1.38, 0, 0); pommel.castShadow = true;
        weaponGroup.add(pommel);

        weaponGroup.position.set(-0.2, 0, 0);

      } else if (modelType === 'karambit') {
        const darkTitaniumMat = new THREE.MeshStandardMaterial({ color: 0x181920, metalness: 0.92, roughness: 0.28 });
        const g10Mat = new THREE.MeshStandardMaterial({ color: 0x121316, metalness: 0.05, roughness: 0.82, normalMap: stippleBump });
        const silverScrewMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.15 });

        // Curved Hawkbill Blade
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0.4);
        bladeShape.bezierCurveTo(1.2, 0.6, 2.2, -0.2, 2.5, -1.3);
        bladeShape.bezierCurveTo(1.8, -0.6, 0.8, -0.1, 0, -0.2);
        bladeShape.closePath();
        const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
        const blade = new THREE.Mesh(bladeGeo, darkTitaniumMat);
        blade.position.set(0.2, 0.1, -0.04); blade.castShadow = true;
        weaponGroup.add(blade);

        // Razor Polished Edge
        const edgeShape = new THREE.Shape();
        edgeShape.moveTo(0.1, -0.18);
        edgeShape.bezierCurveTo(0.85, -0.1, 1.8, -0.6, 2.5, -1.3);
        edgeShape.lineTo(2.45, -1.25);
        edgeShape.bezierCurveTo(1.75, -0.55, 0.8, -0.05, 0.1, -0.12);
        edgeShape.closePath();
        const edgeGeo = new THREE.ExtrudeGeometry(edgeShape, { depth: 0.082, bevelEnabled: false });
        const edge = new THREE.Mesh(edgeGeo, polishedSteelMat);
        edge.position.set(0.2, 0.1, -0.041);
        weaponGroup.add(edge);

        // G10 Tactical Handle Scales
        const handleShape = new THREE.Shape();
        handleShape.moveTo(0.3, 0.45);
        handleShape.lineTo(-1.8, 0.25);
        handleShape.lineTo(-2.2, -0.2);
        handleShape.bezierCurveTo(-1.8, -0.45, -1.4, -0.15, -1.1, -0.4);
        handleShape.bezierCurveTo(-0.8, -0.15, -0.5, -0.4, -0.2, -0.2);
        handleShape.lineTo(0.3, -0.25);
        handleShape.closePath();
        const handleGeo = new THREE.ExtrudeGeometry(handleShape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 });
        const handle = new THREE.Mesh(handleGeo, g10Mat);
        handle.position.set(0, 0, -0.11); handle.castShadow = true;
        weaponGroup.add(handle);

        // Safety Finger Retention Ring
        const ringGeo = new THREE.TorusGeometry(0.38, 0.12, 16, 24);
        const ring = new THREE.Mesh(ringGeo, darkTitaniumMat);
        ring.position.set(-2.55, -0.05, 0); ring.castShadow = true;
        weaponGroup.add(ring);

        // 3 Torx Screws
        [-0.4, -1.1, -1.75].forEach(xPos => {
          const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.24, 12), silverScrewMat);
          screw.rotation.x = Math.PI / 2;
          screw.position.set(xPos, 0.02, 0);
          weaponGroup.add(screw);
        });

        weaponGroup.position.set(0.4, 0.2, 0);
      }

      // Drag to rotate controls
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      stage.addEventListener('mousedown', e => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => { isDragging = false; });

      stage.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const deltaMove = { x: e.clientX - previousMousePosition.x, y: e.clientY - previousMousePosition.y };

        weaponGroup.rotation.y += deltaMove.x * 0.015;
        weaponGroup.rotation.x += deltaMove.y * 0.015;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      // Touch events for mobile
      stage.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          isDragging = true;
          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }, { passive: true });

      stage.addEventListener('touchmove', e => {
        if (!isDragging || e.touches.length !== 1) return;
        const deltaMove = { x: e.touches[0].clientX - previousMousePosition.x, y: e.touches[0].clientY - previousMousePosition.y };

        weaponGroup.rotation.y += deltaMove.x * 0.015;
        weaponGroup.rotation.x += deltaMove.y * 0.015;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });

      stage.addEventListener('touchend', () => { isDragging = false; });

      // Wheel zoom
      stage.addEventListener('wheel', e => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.003;
        camera.position.z = Math.min(7.5, Math.max(2.0, camera.position.z));
      }, { passive: false });

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        if (!isDragging) {
          weaponGroup.rotation.y += 0.006; // Smooth rotation
        }
        renderer.render(scene, camera);
      }
      animate();

      // Window resize
      window.addEventListener('resize', () => {
        const w = stage.clientWidth || 480;
        camera.aspect = w / height;
        camera.updateProjectionMatrix();
        renderer.setSize(w, height);
      });
    });
  }


});


