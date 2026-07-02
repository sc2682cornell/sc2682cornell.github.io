/* ============================================
   Populates the page from inline markdown content.
   Edit the <script type="text/markdown"> block
   in index.html to update all site content.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Read markdown from script tag ---------- */
  const script = document.getElementById('content-data');
  if (!script) return;
  const raw = script.textContent.trim();

  /* ---------- Parse YAML frontmatter ---------- */
  const parts = raw.split('---');
  const fm = {};
  if (parts.length >= 2) {
    parts[1].trim().split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    });
  }
  const body = parts.slice(2).join('---').trim();

  /* ---------- Split body into H1-level sections ---------- */
  const sections = {};
  const lines = body.split('\n');
  let key = null;
  let buf = [];

  for (const line of lines) {
    const m = line.match(/^# (.+)$/);
    if (m) {
      if (key) sections[key.toLowerCase()] = buf.join('\n').trim();
      key = m[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (key) sections[key.toLowerCase()] = buf.join('\n').trim();

  /* ---------- Populate About (photo, name, title, links) ---------- */

  // Photo
  const photoEl = document.getElementById('about-photo');
  if (fm.photo) {
    photoEl.src = fm.photo;
    photoEl.alt = fm.name || '';
    photoEl.onerror = function () { this.style.display = 'none'; };
  } else {
    photoEl.style.display = 'none';
  }

  // Name & title
  document.getElementById('about-name').textContent = fm.name || '';
  document.getElementById('about-title').textContent = fm.title || '';

  // Inline links under portrait: Scholar · Email · CV
  const linksEl = document.getElementById('about-links');
  const linkDefs = [];
  if (fm.email)   linkDefs.push(['Email', 'mailto:' + fm.email]);
  // if (fm.cv)      linkDefs.push(['CV', fm.cv]);
  if (fm.scholar) linkDefs.push(['Google Scholar', fm.scholar]);
  linksEl.innerHTML = linkDefs.map(([label, url]) =>
    `<a href="${url}" target="_blank">${label}</a>`
  ).join('');

  // Nav CV link (hidden if no element)
  const navCv = document.getElementById('nav-cv');
  if (navCv && fm.cv) navCv.href = fm.cv;

  // Bio text (before ##) vs. sub-sections (Education, Research Interests)
  const aboutRaw = sections['about'] || '';
  const subIdx = aboutRaw.indexOf('\n## ');
  const bioText = subIdx >= 0 ? aboutRaw.slice(0, subIdx).trim() : aboutRaw;
  const subText = subIdx >= 0 ? aboutRaw.slice(subIdx).trim() : '';

  document.getElementById('about-bio').innerHTML =
    bioText ? marked.parse(bioText) : '';
  document.getElementById('about-edu').innerHTML =
    subText ? marked.parse(subText) : '';

  /* ---------- Populate other sections ---------- */
  ['experience','publications','service','teaching'].forEach(key => {
    const el = document.getElementById('section-' + key);
    if (el && sections[key]) {
      el.innerHTML = '<div class="md-content">' + marked.parse(sections[key]) + '</div>';
    }
  });

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav__links');
  const toggle = document.querySelector('.nav__toggle');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    });
  });

  // Highlight active nav link on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav__link').forEach(link => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-60px 0px -50% 0px' });

  document.querySelectorAll('.section[id]').forEach(s => observer.observe(s));

  // Close nav on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav') && nav.classList.contains('active')) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
    }
  });
});
