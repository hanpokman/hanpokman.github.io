// Page interactions work independently of the optional WebGL enhancement.
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let savedMotion = null;
try { savedMotion = localStorage.getItem('nathan-motion'); } catch (_) { /* Storage is optional. */ }
let reducedMotion = savedMotion ? savedMotion === 'reduced' : motionQuery.matches;
const motionToggle = document.querySelector('#motion-toggle');
function applyMotion() {
  document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full';
  motionToggle.setAttribute('aria-pressed', String(reducedMotion));
  document.querySelector('#motion-label').textContent = reducedMotion ? 'Motion off' : 'Motion on';
  motionToggle.setAttribute('aria-label', reducedMotion ? 'Enable 3D motion' : 'Reduce 3D motion');
  document.dispatchEvent(new CustomEvent('motionchange', {detail: {reduced: reducedMotion}}));
}
applyMotion();
motionToggle.addEventListener('click', () => {
  reducedMotion = !reducedMotion;
  savedMotion = reducedMotion ? 'reduced' : 'full';
  try { localStorage.setItem('nathan-motion', savedMotion); } catch (_) { /* Keep working without storage. */ }
  applyMotion();
});
motionQuery.addEventListener('change', event => {
  if (!savedMotion) { reducedMotion = event.matches; applyMotion(); }
});

// Personal content comes from the supplied CV. Models are conceptual illustrations.
const projects = {
  quantum: {
    label: 'RESEARCH / UNIVERSITY OF MACAU · JUN–AUG 2026',
    title: 'Latent Hamiltonian Quantum Propagator',
    tags: ['Independent model development', 'Quantum dynamics', 'Sequence modeling'],
    body: `<p>During my research internship in Prof. Wang Peng’s lab at the University of Macau, I investigated stochastic diffusion models and independently developed LHQP, a physics-structured sequence model.</p><h3>The question</h3><p>Can partial observations reveal the evolving dynamics of a small superconducting-qubit system? LHQP infers time-varying Pauli-Hamiltonian coefficients to forecast coherent drift and crosstalk.</p><h3>The study</h3><ul><li>Evaluated 17 comparison models across 9,150 completed synthetic runs.</li><li>Achieved horizon-mean fidelities of 0.9731 for diagonal drift and 0.9078 for interacting dynamics.</li><li>Ablation studies showed that the prescribed interaction terms were necessary for performance.</li></ul><h3>What comes next</h3><p>This is a state-vector feasibility study, not a hardware-validated result. Proposed validation uses Ramsey and spectroscopy measurements, readout features, and control telemetry, with dissipative dynamics as a future extension.</p>`,
    href: './assets/Han_Pok_Man_CV.pdf', link: 'View research résumé'
  },
  vessel: {
    label: 'ROBOTICS / JAN 2023–AUG 2024',
    title: 'Aquatic Environment Surveillance Autonomous Surface Vehicle',
    tags: ['Software lead', 'Three-person team', 'Edge AI'],
    body: `<p>A purpose-built autonomous surface vehicle for surveying invasive species, water-quality fluctuations, and litter in Macau’s lakes.</p><h3>Above and below the surface</h3><p>The system combines an edge-AI computer-vision pipeline with a custom 20-meter underwater lowering platform, extending observation beneath the water’s surface.</p><h3>My contribution</h3><ul><li>Served as software lead on a three-person team and owned the edge-AI computer-vision pipeline.</li><li>Engineered the underwater lowering mechanism.</li><li>Coordinated mechanical integration and the project timeline.</li></ul><p>The 3D vessel on this website is a conceptual illustration, not a reconstruction of the original vehicle.</p>`,
    href: './assets/Han_Pok_Man_CV.pdf', link: 'View project résumé'
  },
  mapping: {
    label: 'COMPUTER VISION / SEP 2022–OCT 2023 · PUBLISHED 2024',
    title: 'Streamlining Navigation: Depth-Informed Item Mapping',
    tags: ['Sole author', 'Lead developer', 'ACCTCS 2024'],
    body: `<p>A mapping method for enhanced home-service robotics, using RGB-D data, geometric transformations, and 2D pose estimation for indoor localization and item tracking.</p><h3>A lighter way to navigate</h3><p>The approach locates and tracks items without a computationally intensive full-SLAM pipeline. I formulated the transformations and validated robustness through field testing, working as sole author and lead developer under faculty guidance.</p><h3>Publication</h3><p>P. Han, “Streamlining Navigation: Depth-Informed Item Mapping for Enhanced Home Service Robotics,” Proceedings of the 4th Asia-Pacific Conference on Communications Technology and Computer Science (ACCTCS), 2024, pp. 587–591.</p><p>DOI: 10.1109/ACCTCS61748.2024.00109</p>`,
    href: 'https://doi.org/10.1109/ACCTCS61748.2024.00109', link: 'Read the publication'
  }
};
const dialog = document.querySelector('#project-dialog');
const dialogContent = document.querySelector('#dialog-content');
let lastTrigger = null;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    lastTrigger = button;
    dialogContent.innerHTML = `<p class="eyebrow">${project.label}</p><h2 id="dialog-title">${project.title}</h2><div class="detail-meta">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div>${project.body}<a class="button button-dark" href="${project.href}" target="_blank" rel="noopener noreferrer">${project.link} <span aria-hidden="true">↗</span></a>`;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  lastTrigger?.focus({preventScroll: true});
});
document.querySelector('#year').textContent = new Date().getFullYear();

// A small reading-progress rule echoes the 3D model's scroll-driven rotation.
let scrollPending = false;
const research = document.querySelector('#research');
function updateProgress() {
  const bounds = research.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (bounds.height + innerHeight)));
  document.documentElement.style.setProperty('--research-progress', progress.toFixed(4));
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); }
}, {passive: true});
window.addEventListener('resize', updateProgress);
updateProgress();

// Relative, locally bundled modules keep GitHub project URLs and offline preview working.
import('./scenes.js').catch(() => {
  // The static illustrations stay visible if WebGL or JavaScript modules are unavailable.
  document.documentElement.dataset.webgl = 'unavailable';
});
