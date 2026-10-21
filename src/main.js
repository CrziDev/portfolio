/*
 * Renders the page from the portfolio API (API_URL, src/config.js), then wires
 * up the theme toggle, section tabs, tooltips, command palette and the GitHub
 * contribution graph. After signing in at /admin, pencil buttons edit the content.
 */
(async () => {
  'use strict';

  // Filled by load(), and again after every edit.
  let profile, skills, projects, experience, education;
  const $ = (selector) => document.querySelector(selector);

  // Full class names (not built from strings) so Tailwind's scanner picks them up.
  const CONTRIB_LEVELS = ['bg-contrib-0', 'bg-contrib-1', 'bg-contrib-2', 'bg-contrib-3', 'bg-contrib-4'];
  const LANGUAGE_DOTS = {
    PHP: 'bg-lang-php',
    Go: 'bg-lang-go',
    Python: 'bg-lang-python',
    JavaScript: 'bg-lang-javascript',
  };

  const CONTRIB_API = 'https://github-contributions-api.jogruber.de/v4';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const githubUrl = () => `https://github.com/${profile.github}`;
  const linkedinUrl = () => `https://www.linkedin.com/in/${profile.linkedin}`;

  // Page sections in page order, shared by the tabs and the command palette.
  const SECTIONS = [
    { id: 'projects', label: 'Projects', count: () => projects.length },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience', count: () => experience.length },
    { id: 'activity', label: 'Activity' },
  ];

  const imageIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" class="size-6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>`;

  // Inner markup of Lucide icons, drawn by icon().
  const ICONS = {
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
    check: '<path d="M20 6 9 17l-5-5" />',
    sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />',
    plus: '<path d="M5 12h14M12 5v14" />',
    logOut: '<path d="m16 17 5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />',
    mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />',
  };

  function icon(paths, className = 'size-4') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round" class="${className}" aria-hidden="true">${paths}</svg>`;
  }

  // A sidebar contact line: a muted icon followed by its content, like GitHub's profile sidebar.
  function contactRow(paths, content) {
    return `<li class="flex items-center gap-2">${icon(paths, 'size-4 shrink-0 text-fg-muted')}${content}</li>`;
  }

  // Uploaded images are stored as /uploads/… paths on the API.
  const assetUrl = (src) => (src?.startsWith('/uploads/') ? API_URL + src : src);

  // The image when one is configured, otherwise a dashed placeholder of the same shape.
  function imageSlot(src, label, className) {
    if (src) {
      return `<img src="${escapeHtml(assetUrl(src))}" alt="${escapeHtml(label)}" loading="lazy" class="${className} object-cover">`;
    }
    return `
      <div role="img" aria-label="${escapeHtml(label)}"
        class="${className} flex flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface px-4 text-center text-fg-muted">
        ${imageIcon}
        <span class="text-sm">${escapeHtml(label)}</span>
      </div>`;
  }

  function link(href, text, className = 'text-accent hover:underline') {
    const external = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${escapeHtml(href)}" class="${className}"${external}>${escapeHtml(text)}</a>`;
  }

  // Content comes from the edit forms, so every value goes through this before it reaches innerHTML.
  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  const languageDot = (language) => LANGUAGE_DOTS[language] ?? 'bg-line-strong';
  const isLight = () => document.documentElement.dataset.theme === 'light';

  // ---- Tooltip: one shared element for every [data-tip], like GitHub's ----

  let tipTarget = null;

  function showTooltip(target, text = target.dataset.tip) {
    const tip = $('#tooltip');
    tipTarget = target;
    tip.textContent = text;
    tip.hidden = false;

    const box = target.getBoundingClientRect();
    const left = box.left + box.width / 2 - tip.offsetWidth / 2;
    const top = box.top - tip.offsetHeight - 6;
    tip.style.left = `${Math.min(Math.max(left, 8), innerWidth - tip.offsetWidth - 8)}px`;
    tip.style.top = `${top < 8 ? box.bottom + 6 : top}px`; // flip below when there's no room above
  }

  function hideTooltip() {
    tipTarget = null;
    $('#tooltip').hidden = true;
  }

  function initTooltip() {
    const onEnter = (event) => {
      const target = event.target.closest('[data-tip]');
      if (target) showTooltip(target);
    };

    document.addEventListener('pointerover', onEnter);
    document.addEventListener('focusin', onEnter);
    document.addEventListener('pointerout', (event) => {
      if (tipTarget && !tipTarget.contains(event.relatedTarget)) hideTooltip();
    });
    document.addEventListener('focusout', hideTooltip);
    // Capture so scrolling inside any scroller (e.g. the contribution graph) hides it too.
    document.addEventListener('scroll', hideTooltip, { capture: true, passive: true });
  }

  // ---- Tabs, sidebar ----

  function renderTabs() {
    $('#tabs').innerHTML = SECTIONS.map(
      ({ id, label, count }) => `
        <a href="#${id}"
          class="group relative flex h-12 shrink-0 items-center text-sm after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full aria-[current=true]:after:bg-tab-active">
          <span class="flex items-center gap-2 rounded-md px-2 py-1 transition-colors group-hover:bg-surface-hover">
            ${label}
            ${count ? `<span class="rounded-full bg-line px-1.5 text-xs leading-[18px]">${count()}</span>` : ''}
          </span>
        </a>`,
    ).join('');
  }

  // Underlines the tab of the last section whose top has scrolled up under the sticky tabs.
  // Returns the update, to run again after the tabs re-render.
  function initScrollSpy() {
    const sections = SECTIONS.map(({ id }) => document.getElementById(id));
    let frame = 0;

    function update() {
      frame = 0;
      const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const active = atBottom
        ? sections.length - 1
        : Math.max(0, sections.findLastIndex((section) => section.getBoundingClientRect().top <= 100));
      [...$('#tabs').children].forEach((tab, i) => tab.setAttribute('aria-current', i === active));
    }

    addEventListener('scroll', () => (frame ||= requestAnimationFrame(update)), { passive: true });
    addEventListener('resize', update);
    return update;
  }

  const sidebarBlock = (title, body) => `
    <div class="mt-4 border-t border-line pt-4">
      <h2 class="font-semibold">${title}</h2>
      ${body}
    </div>`;

  function renderSidebar() {
    const { email, github, linkedin } = profile;

    $('#sidebar').innerHTML = `
      ${imageSlot(profile.photo, 'Profile photo', 'aspect-square w-32 rounded-full sm:w-40 md:w-full')}

      <div class="mt-4.5 flex items-start justify-between gap-2">
        <h1 class="text-2xl leading-tight font-semibold">${escapeHtml(profile.name)}</h1>
        ${editButton('profile', null, 'Edit profile')}
      </div>
      <p class="font-mono leading-5 text-fg-muted">${escapeHtml(profile.handle)}</p>
      ${profile.tagline ? `<p class="mt-3 text-sm">${escapeHtml(profile.tagline)}</p>` : ''}

      ${link(
        `mailto:${email}`,
        'Get in touch',
        'mt-4 flex h-8 items-center justify-center rounded-md border border-line bg-surface text-sm font-medium transition-colors hover:bg-surface-hover',
      )}

      <p class="mt-4 flex items-center gap-2 text-sm text-fg-muted">
        <span class="size-2 rounded-full bg-success" aria-hidden="true"></span>
        ${escapeHtml(profile.status)}
      </p>

      <ul class="mt-2.5 text-sm leading-6">
        ${contactRow(ICONS.mapPin, escapeHtml(profile.location))}
        ${contactRow(ICONS.phone, `<span class="text-fg-muted">${escapeHtml(profile.phone)}</span>`)}
        ${contactRow(
          ICONS.mail,
          `<span class="flex min-w-0 items-center gap-1">
            ${link(`mailto:${email}`, email, 'truncate text-accent hover:underline')}
            <button id="copy-email" type="button" aria-label="Copy email" data-tip="Copy email"
              class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg">
              ${icon(ICONS.copy, 'size-3.5')}
            </button>
          </span>`,
        )}
        ${contactRow(ICONS.github, link(githubUrl(), `github.com/${github}`, 'truncate text-accent hover:underline'))}
        ${contactRow(ICONS.linkedin, link(linkedinUrl(), `linkedin.com/in/${linkedin}`, 'truncate text-accent hover:underline'))}
      </ul>

      ${sidebarBlock(
        'Education',
        `<p class="mt-1.5 text-sm font-medium">${escapeHtml(education.degree)}</p>
        <p class="text-sm text-fg-muted">${escapeHtml([education.school, education.year].filter(Boolean).join(' · '))}</p>`,
      )}`;

    // Like GitHub's clipboard-copy: the icon turns into a check for a moment.
    // The tip text lives in data-tip, since swapping the icon under the pointer re-triggers the tooltip.
    const copyButton = $('#copy-email');
    const setCopyState = (copied) => {
      copyButton.innerHTML = copied ? icon(ICONS.check, 'size-3.5 text-success') : icon(ICONS.copy, 'size-3.5');
      copyButton.dataset.tip = copied ? 'Copied!' : 'Copy email';
      if (tipTarget === copyButton || copied) showTooltip(copyButton);
    };
    copyButton.addEventListener('click', async () => {
      if (!(await copyText(email))) return;
      setCopyState(true);
      setTimeout(() => setCopyState(false), 2000);
    });
  }

  // ---- Main column ----

  function renderSkills() {
    const chips = (items) =>
      items
        .map((item) => `<li class="rounded-full bg-chip px-2.5 py-0.5 font-mono text-xs leading-4 text-accent">${escapeHtml(item)}</li>`)
        .join('');

    $('#skills-list').innerHTML = skills
      .map(
        ({ id, label, items }) => `
          <div class="grid gap-2 sm:grid-cols-[158px_1fr] sm:gap-0">
            <dt class="flex items-start gap-1 text-[13px] leading-5 text-fg-muted">
              ${escapeHtml(label)}
              ${editButton('skill', id, `Edit ${label}`, '-my-0.5 size-6')}
            </dt>
            <dd><ul class="flex flex-wrap gap-2">${chips(items)}</ul></dd>
          </div>`,
      )
      .join('');
  }

  function projectCard(project) {
    const stack = project.stack.filter((item) => item !== project.language);
    // The repo link as a GitHub icon; grayed out when the project has no link yet.
    const repoClass = 'ml-auto -my-1 grid size-6 shrink-0 place-items-center rounded-md text-fg-muted';
    const repo = project.url
      ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(project.name)} on GitHub"
          data-tip="View on GitHub" class="${repoClass} transition-colors hover:bg-surface-hover hover:text-fg">${icon(ICONS.github)}</a>`
      : `<span role="img" aria-label="No GitHub link" data-tip="No link yet" class="${repoClass} opacity-40">${icon(ICONS.github)}</span>`;
    return `
      <article class="flex flex-col rounded-md border border-line p-3">
        <div class="relative">
          ${imageSlot(project.image, `${project.name} screenshot`, 'aspect-[3/2] w-full rounded-md')}
          <button type="button" data-star="${project.id}" aria-pressed="${starState.starred.has(project.id)}"
            class="absolute top-2 right-2 flex h-7 cursor-pointer items-center gap-1 rounded-md border border-line bg-canvas/90 px-2 text-xs text-fg-muted shadow-sm backdrop-blur-sm transition-colors hover:bg-surface-hover hover:text-fg">
            ${starContent(project)}
          </button>
        </div>
        <div class="mt-3 flex items-center gap-2">
          ${icon(ICONS.book, 'size-4 shrink-0 text-fg-muted')}
          <h3 class="truncate text-sm font-semibold text-accent">
            ${project.url ? link(project.url, project.name, 'hover:underline') : escapeHtml(project.name)}
          </h3>
          ${project.type ? `<span class="shrink-0 rounded-full border border-line px-2 text-xs leading-[18px] text-fg-muted">${escapeHtml(project.type)}</span>` : ''}
          ${repo}
          ${editButton('project', project.id, `Edit ${project.name}`, '-my-1 size-6')}
        </div>
        <p class="mt-2 text-xs leading-snug text-fg-muted">${escapeHtml(project.description)}</p>
        <div class="mt-auto flex items-center gap-1.5 pt-3 text-xs text-fg-muted">
          ${
            project.language
              ? `<span class="size-3 shrink-0 rounded-full ${languageDot(project.language)}" aria-hidden="true"></span>
                 <span class="mr-2">${escapeHtml(project.language)}</span>`
              : ''
          }
          <span class="truncate font-mono">${escapeHtml(stack.join(' · '))}</span>
        </div>
      </article>`;
  }

  // ---- Stars: like GitHub's, any visitor can star a project once ----

  const STARS_KEY = 'portfolio-stars';

  // This browser's random visitor ID, which the API counts once per project, and the projects it starred.
  const starState = loadStars();
  const starsInFlight = new Set();

  function loadStars() {
    try {
      const saved = JSON.parse(localStorage.getItem(STARS_KEY));
      if (saved?.visitor) return { visitor: saved.visitor, starred: new Set(saved.starred) };
    } catch {}
    return { visitor: crypto.randomUUID(), starred: new Set() };
  }

  function saveStars() {
    try {
      localStorage.setItem(STARS_KEY, JSON.stringify({ visitor: starState.visitor, starred: [...starState.starred] }));
    } catch {}
  }

  function starContent(project) {
    const starred = starState.starred.has(project.id);
    return `
      ${icon(ICONS.star, starred ? 'size-3.5 fill-current text-star' : 'size-3.5')}
      <span class="sr-only">Star ${escapeHtml(project.name)}:</span>
      <span class="tabular-nums">${project.stars ?? 0}</span>`;
  }

  // Shows the change right away, then undoes it if the API refuses.
  async function toggleStar(id) {
    const project = projects.find((p) => p.id === id);
    if (!project || starsInFlight.has(id)) return;
    const starred = !starState.starred.has(id);

    const show = (on, count) => {
      on ? starState.starred.add(id) : starState.starred.delete(id);
      project.stars = count;
      saveStars();
      document.querySelectorAll(`[data-star="${id}"]`).forEach((button) => {
        button.setAttribute('aria-pressed', on);
        button.innerHTML = starContent(project);
      });
    };

    const before = project.stars ?? 0;
    show(starred, Math.max(0, before + (starred ? 1 : -1)));
    starsInFlight.add(id);
    try {
      const result = await api(`/api/projects/${id}/star`, { method: 'POST', body: { visitor: starState.visitor, starred } });
      show(starred, result.stars);
    } catch {
      show(!starred, before);
    } finally {
      starsInFlight.delete(id);
    }
  }

  // Projects show three rows at a time; the arrows (above and below the cards) slide between pages.
  // Column counts mirror the page grid's sm:grid-cols-2.
  // Returns `layout`, to re-render the cards, and `reveal`, which slides to the page holding a given project.
  function initProjects() {
    const ROWS = 3;
    const sm = matchMedia('(min-width: 40rem)');
    const track = $('#projects-track');
    const all = (selector) => [...document.querySelectorAll(selector)];

    let page = 0;
    let perPage = 0;
    let pageCount = 1;

    function show(index) {
      page = Math.min(Math.max(index, 0), pageCount - 1);
      // Each page is 100% of the track wide, plus the track's 1rem (gap-4) gap.
      track.style.transform = `translateX(calc(${page} * (-100% - 1rem)))`;
      [...track.children].forEach((el, i) => (el.inert = i !== page));
      all('[data-projects-page]').forEach((el) => (el.textContent = `${page + 1} / ${pageCount}`));
      all('[data-projects-prev]').forEach((button) => (button.disabled = page === 0));
      all('[data-projects-next]').forEach((button) => (button.disabled = page === pageCount - 1));
    }

    function layout() {
      const firstVisible = page * perPage;
      perPage = (sm.matches ? 2 : 1) * ROWS;
      pageCount = Math.max(1, Math.ceil(projects.length / perPage));

      track.innerHTML = Array.from(
        { length: pageCount },
        (_, i) => `
          <div class="grid w-full shrink-0 content-start gap-4 sm:grid-cols-2">
            ${projects.slice(i * perPage, (i + 1) * perPage).map(projectCard).join('')}
          </div>`,
      ).join('');

      all('[data-projects-nav]').forEach((nav) => (nav.hidden = pageCount <= 1));
      show(Math.floor(firstVisible / perPage)); // keep the same projects in view after a resize
    }

    // The bottom arrows also bring the top of the new page into view.
    for (const nav of all('[data-projects-nav]')) {
      const go = (step) => {
        show(page + step);
        if ('scroll' in nav.dataset) $('#projects').scrollIntoView({ block: 'start' });
      };
      nav.querySelector('[data-projects-prev]').addEventListener('click', () => go(-1));
      nav.querySelector('[data-projects-next]').addEventListener('click', () => go(1));
    }
    track.addEventListener('click', (event) => {
      const button = event.target.closest('[data-star]');
      if (button) toggleStar(Number(button.dataset.star));
    });
    sm.addEventListener('change', layout);

    return { layout, reveal: (index) => show(Math.floor(index / perPage)) };
  }

  // CalVer-style tag from a role's start month: 'Aug 2025 – Present' → 'v2025.08'.
  // Empty when the period doesn't start with a month and year.
  function releaseTag(period) {
    const [month, year] = period.split(/\s+[–-]\s+/)[0].split(' ');
    const index = MONTHS.indexOf(month);
    return index < 0 || !/^\d{4}$/.test(year) ? '' : `v${year}.${String(index + 1).padStart(2, '0')}`;
  }

  // Each employer is laid out like an entry on a GitHub Releases page.
  function renderExperience() {
    $('#experience-list').innerHTML = experience
      .map(
        ({ id, org, meta, roles: [latest, ...previous], highlights }) => `
          <article class="grid gap-2 lg:grid-cols-[9rem_1fr] lg:gap-4">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 lg:flex-col lg:items-start lg:pt-4">
              <span class="flex items-center gap-1.5 font-mono text-sm">
                ${icon(ICONS.tag, 'size-4 text-fg-muted')}
                ${releaseTag(latest.period)}
              </span>
              <span class="font-mono text-xs text-fg-muted">${escapeHtml(latest.period)}</span>
            </div>
            <div class="rounded-md border border-line px-5 py-4">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-base font-semibold">${escapeHtml(latest.title)}</h3>
                ${
                  latest.period.endsWith('Present')
                    ? '<span class="rounded-full border border-success px-2 text-xs leading-[18px] font-medium text-success">Latest</span>'
                    : ''
                }
                ${editButton('experience', id, `Edit ${org}`, 'ml-auto -my-1 size-6')}
              </div>
              <p class="text-[13px] leading-[22px] text-fg-muted">${escapeHtml([org, meta].filter(Boolean).join(' · '))}</p>
              ${previous
                .map(
                  ({ title, period }) => `
                    <p class="mt-1 text-xs text-fg-muted">
                      Previously <span class="text-fg">${escapeHtml(title)}</span> ·
                      ${[releaseTag(period) && `<span class="font-mono">${releaseTag(period)}</span>`, escapeHtml(period)].filter(Boolean).join(' · ')}
                    </p>`,
                )
                .join('')}
              <ul class="mt-3 list-disc space-y-1 pl-[18px] text-[13px] leading-5">
                ${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </div>
          </article>`,
      )
      .join('');
  }

  // ---- Contribution graph ----

  const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
  const isoDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  function contribCell({ date, count, level }) {
    const tip = date
      ? ` data-tip="${count || 'No'} contribution${count === 1 ? '' : 's'} on ${dayFormat.format(new Date(date))}"`
      : '';
    return `<span class="size-2.5 rounded-[2px] ${CONTRIB_LEVELS[level]}"${tip}></span>`;
  }

  function drawGraph(days) {
    // Pad the first column so every column runs Sunday → Saturday.
    const offset = days[0]?.date ? new Date(days[0].date).getUTCDay() : 0;
    $('#contrib-graph').innerHTML = '<span></span>'.repeat(offset) + days.map(contribCell).join('');

    // On narrow screens, start scrolled to the most recent weeks.
    const scroller = $('#contrib-scroller');
    scroller.scrollLeft = scroller.scrollWidth;
  }

  async function renderContributions() {
    const title = $('#contrib-title');
    const yearButtons = $('#contrib-years');

    $('#contrib-legend').innerHTML = `
      <span class="mr-1">Less</span>
      ${CONTRIB_LEVELS.map((level) => `<span class="size-2.5 rounded-[2px] ${level}"></span>`).join('')}
      <span class="ml-1">More</span>`;

    // Empty grid while loading, so the layout doesn't jump.
    drawGraph(Array.from({ length: 53 * 7 }, () => ({ level: 0 })));

    let data;
    try {
      // Without `?y=`, the API returns every year at once, so switching years needs no more requests.
      const response = await fetch(`${CONTRIB_API}/${profile.github}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    } catch {
      title.innerHTML = `Couldn't load contributions. ${link(githubUrl(), 'View them on GitHub')}`;
      return;
    }

    // Years arrive newest first and each runs to Dec 31, so sort by date and drop future days.
    const today = isoDate(new Date());
    const days = data.contributions.filter(({ date }) => date <= today).sort((a, b) => a.date.localeCompare(b.date));
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const since = isoDate(yearAgo);

    const views = [
      { key: 'last', label: 'Last year', heading: 'the last year', days: days.filter(({ date }) => date > since) },
      ...Object.keys(data.total)
        .sort()
        .reverse()
        .map((year) => ({ key: year, label: year, heading: year, days: days.filter(({ date }) => date.startsWith(year)) })),
    ];

    function select(view) {
      const total = view.days.reduce((sum, { count }) => sum + count, 0);
      title.textContent = `${total.toLocaleString('en-US')} contributions in ${view.heading}`;
      drawGraph(view.days);
      [...yearButtons.children].forEach((button) => button.setAttribute('aria-pressed', button.dataset.key === view.key));
    }

    yearButtons.innerHTML = views
      .map(
        ({ key, label }) => `
          <button type="button" data-key="${key}" aria-pressed="false"
            class="h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg aria-pressed:bg-accent aria-pressed:text-white">
            ${label}
          </button>`,
      )
      .join('');
    yearButtons.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (button) select(views.find(({ key }) => key === button.dataset.key));
    });
    select(views[0]);
  }

  // ---- Footer and theme ----

  function renderFooter() {
    const linkClass = 'hover:text-accent hover:underline';
    $('#footer').innerHTML = `
      <div class="mx-auto flex max-w-[1144px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-fg-muted sm:px-6">
        <p class="flex items-center gap-2">
          <span class="grid size-6 place-items-center rounded-md bg-fg font-mono text-[11px] font-medium text-canvas">${escapeHtml(profile.initials)}</span>
          © ${new Date().getFullYear()} ${escapeHtml(profile.name)}
        </p>
        <ul class="flex flex-wrap gap-x-4 gap-y-1">
          <li>${link(githubUrl(), 'GitHub', linkClass)}</li>
          <li>${link(linkedinUrl(), 'LinkedIn', linkClass)}</li>
          <li>${link(`mailto:${profile.email}`, 'Email', linkClass)}</li>
          <li>${link('#', 'Back to top', linkClass)}</li>
        </ul>
      </div>`;
  }

  function syncThemeLabel() {
    // The icon shows the theme a click switches to, like GitHub's.
    const button = $('#theme-toggle');
    const label = `Switch to ${isLight() ? 'dark' : 'light'} mode`;
    button.innerHTML = icon(isLight() ? ICONS.moon : ICONS.sun);
    button.setAttribute('aria-label', label);
    button.dataset.tip = label;
    if (tipTarget === button) showTooltip(button);
  }

  function toggleTheme() {
    const root = document.documentElement;
    root.dataset.theme = isLight() ? 'dark' : 'light';
    try {
      localStorage.setItem('theme', root.dataset.theme);
    } catch {}
    syncThemeLabel();
  }

  function initThemeToggle() {
    $('#theme-toggle').addEventListener('click', toggleTheme);
    syncThemeLabel();
  }

  // ---- Command palette: "/" or Ctrl/⌘+K, like GitHub's search ----

  function initPalette(revealProject) {
    const dialog = $('#palette');
    const input = $('#palette-input');
    const list = $('#palette-list');
    // The tabs stay pinned to the top, so feedback for palette actions shows just under them.
    const nav = $('#section-nav');
    const openTab = (url) => open(url, '_blank', 'noopener');
    const goTo = (id) => document.getElementById(id).scrollIntoView();

    let commands = [];
    let matches = [];
    let active = 0;

    // Rebuilt on every open, so labels like the theme switch stay current.
    function buildCommands() {
      return [
        ...SECTIONS.map(({ id, label }) => ({ group: 'Pages', icon: ICONS.hash, label, run: () => goTo(id) })),
        ...projects.map((project, i) => ({
          group: 'Repositories',
          icon: ICONS.book,
          label: project.name,
          hint: `${project.type}${project.url ? ' ↗' : ''}`,
          keywords: [project.language, ...project.stack].join(' '),
          run: () => {
            if (project.url) return openTab(project.url);
            revealProject(i);
            goTo('projects');
          },
        })),
        {
          group: 'Actions',
          icon: ICONS.copy,
          label: 'Copy email',
          hint: profile.email,
          run: async () => {
            if (await copyText(profile.email)) {
              showTooltip(nav, 'Email copied!');
              setTimeout(() => tipTarget === nav && hideTooltip(), 2000);
            }
          },
        },
        {
          group: 'Actions',
          icon: ICONS.zap,
          label: `Switch to ${isLight() ? 'dark' : 'light'} theme`,
          keywords: 'mode appearance',
          run: toggleTheme,
        },
        { group: 'Actions', icon: ICONS.zap, label: 'Open GitHub profile', hint: `github.com/${profile.github}`, run: () => openTab(githubUrl()) },
        { group: 'Actions', icon: ICONS.zap, label: 'Open LinkedIn', hint: `in/${profile.linkedin}`, run: () => openTab(linkedinUrl()) },
        { group: 'Actions', icon: ICONS.zap, label: 'Send email', run: () => (location.href = `mailto:${profile.email}`) },
        ...(admin ? [{ group: 'Actions', icon: ICONS.logOut, label: 'Sign out', keywords: 'admin edit', run: signOut }] : []),
      ];
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      matches = commands.filter(({ label, hint = '', keywords = '' }) =>
        `${label} ${hint} ${keywords}`.toLowerCase().includes(query),
      );

      // Keep the grouped order, but preselect the best match: label prefix, then label, then hint/keywords.
      const score = ({ label }) => {
        const text = label.toLowerCase();
        return text.startsWith(query) ? 0 : text.includes(query) ? 1 : 2;
      };
      active = matches.reduce((best, command, i) => (score(command) < score(matches[best]) ? i : best), 0);

      if (!matches.length) {
        list.innerHTML = `<li class="px-3 py-6 text-center text-sm text-fg-muted">No results for “${escapeHtml(input.value)}”</li>`;
        input.removeAttribute('aria-activedescendant');
        return;
      }

      list.innerHTML = matches
        .map((command, i) => {
          const heading =
            command.group === matches[i - 1]?.group
              ? ''
              : `<li role="presentation" aria-hidden="true" class="px-3 pt-2 pb-1 text-xs font-semibold text-fg-muted">${command.group}</li>`;
          return `${heading}
            <li id="palette-option-${i}" role="option" data-index="${i}" aria-selected="${i === active}"
              class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm aria-selected:bg-surface-hover aria-selected:shadow-[inset_2px_0_0_var(--color-accent)]">
              ${icon(command.icon, 'size-4 shrink-0 text-fg-muted')}
              <span class="truncate">${escapeHtml(command.label)}</span>
              ${command.hint ? `<span class="ml-auto shrink-0 font-mono text-xs text-fg-muted">${escapeHtml(command.hint)}</span>` : ''}
            </li>`;
        })
        .join('');
      input.setAttribute('aria-activedescendant', `palette-option-${active}`);
    }

    function setActive(index) {
      $(`#palette-option-${active}`).setAttribute('aria-selected', 'false');
      active = (index + matches.length) % matches.length;
      const option = $(`#palette-option-${active}`);
      option.setAttribute('aria-selected', 'true');
      option.scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', option.id);
    }

    function run(index) {
      const command = matches[index];
      if (!command) return;
      dialog.close();
      command.run();
    }

    function openPalette() {
      if (document.querySelector('dialog[open]')) return; // also not over the editor
      commands = buildCommands();
      input.value = '';
      render();
      dialog.showModal();
      input.focus();
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', (event) => {
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && matches.length) {
        event.preventDefault();
        setActive(active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        run(active);
      }
    });
    list.addEventListener('click', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option) run(Number(option.dataset.index));
    });
    list.addEventListener('pointermove', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option && Number(option.dataset.index) !== active) setActive(Number(option.dataset.index));
    });
    // A click outside the panel lands on the <dialog> itself (its backdrop).
    dialog.addEventListener('click', (event) => event.target === dialog && dialog.close());
    // With nothing to hand focus back to, it stays on the hidden input, and "/" would then count as typing.
    // The close event is queued, so skip it if the palette has already been reopened.
    dialog.addEventListener('close', () => !dialog.open && document.activeElement === input && input.blur());

    document.addEventListener('keydown', (event) => {
      // The palette's own input doesn't count, as focus can linger on it just after closing.
      const typing = event.target !== input && event.target.closest('input, textarea, select, [contenteditable="true"]');
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        openPalette();
      }
    });
  }

  // ---- Content from the API, and the sign-in made at /admin ----

  let token = readToken();
  let admin = false;

  function readToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  function forgetToken() {
    token = null;
    admin = false;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }

  // Calls the API, signed in when there's a token. Resolves to the JSON body (null for 204)
  // and rejects with the API's error message.
  async function api(path, { method = 'GET', body } = {}) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (body !== undefined && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const response = await fetch(API_URL + path, { method, headers, body });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (response.status === 401 && token) {
      // Expired, or signed out on another device: leave edit mode.
      forgetToken();
      render();
      throw new Error('Your session has expired. Sign in again at /admin.');
    }
    if (!response.ok) throw new Error(data?.error ?? `Request failed (HTTP ${response.status})`);
    return data;
  }

  async function load() {
    ({ profile, skills, projects, experience, education } = await api('/api/portfolio'));
  }

  // Reloads the content after an edit and redraws everything that shows it.
  async function refresh() {
    await load();
    render();
  }

  async function signOut() {
    try {
      await api('/api/logout', { method: 'POST' });
    } catch {} // the token is dropped either way
    forgetToken();
    render();
  }

  function renderLoadError() {
    $('#status').innerHTML = `
      <div class="p-5 sm:px-8 sm:py-6">
        <h2 class="text-base font-semibold">Couldn't load the portfolio</h2>
        <p class="mt-2 text-sm text-fg-muted">The content server didn't respond. Please try again in a moment.</p>
      </div>`;
    document.querySelectorAll('main > section:not(#status)').forEach((section) => (section.hidden = true));
  }

  // ---- Edit mode: each pencil opens a form for one piece of content ----

  const smallButton =
    'flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-line px-2 text-xs font-medium text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg';
  const inputClass =
    'mt-1.5 block w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent';

  // A pencil that opens the editor for one item; nothing for visitors.
  function editButton(kind, id, label, className = 'size-6') {
    if (!admin) return '';
    return `
      <button type="button" data-edit="${kind}" data-id="${id ?? ''}" aria-label="${escapeHtml(label)}" data-tip="${escapeHtml(label)}"
        class="${className} grid shrink-0 cursor-pointer place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg">
        ${icon(ICONS.pencil, 'size-3.5')}
      </button>`;
  }

  function renderEditControls() {
    const addButton = (kind, label) =>
      admin ? `<button type="button" data-edit="${kind}" class="${smallButton}">${icon(ICONS.plus, 'size-3.5')} ${label}</button>` : '';
    $('#projects-add').innerHTML = addButton('project', 'New project');
    $('#skills-add').innerHTML = addButton('skill', 'Add group');
    $('#experience-add').innerHTML = addButton('experience', 'Add experience');
    $('#sign-out').hidden = !admin;
  }

  // The API saves the profile and education together, so fields a form doesn't show are sent unchanged.
  function saveProfile({ degree = education.degree, school = education.school, year = education.year, ...changes }) {
    return api('/api/profile', {
      method: 'PUT',
      body: { profile: { ...profile, ...changes }, education: { degree, school, year } },
    });
  }

  // Field types other than plain text: how a value is shown in its input and read back.
  const splitBy = (separator) => (text) =>
    text
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  const FIELD_TYPES = {
    list: { show: (items) => items.join(', '), read: splitBy(',') },
    lines: { show: (items) => items.join('\n'), read: splitBy('\n') },
    roles: {
      show: (roles) => roles.map(({ title, period }) => `${title} | ${period}`).join('\n'),
      read: (text) =>
        splitBy('\n')(text).map((line) => {
          const [title, ...period] = line.split('|');
          return { title: title.trim(), period: period.join('|').trim() };
        }),
    },
  };

  // What each pencil edits. Kinds with a `path` are lists, edited one item at a time;
  // the others are parts of the profile.
  const FORMS = {
    profile: {
      title: 'Edit profile',
      values: () => ({ ...profile, ...education }),
      save: saveProfile,
      fields: [
        { name: 'photo', label: 'Photo', type: 'image' },
        { name: 'name', label: 'Name', required: true },
        { name: 'handle', label: 'Handle' },
        { name: 'tagline', label: 'Description', type: 'textarea', rows: 4 },
        { name: 'initials', label: 'Initials', hint: 'Shown in the footer and on the 404 page' },
        { name: 'status', label: 'Status' },
        { name: 'location', label: 'Location' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'github', label: 'GitHub username', hint: 'Also loads the contribution graph' },
        { name: 'linkedin', label: 'LinkedIn username' },
        { name: 'degree', label: 'Degree' },
        { name: 'school', label: 'School' },
        { name: 'year', label: 'Graduation year' },
      ],
    },
    project: {
      noun: 'project',
      path: '/api/projects',
      items: () => projects,
      added: () => projectView.reveal(projects.length - 1), // new projects go last
      fields: [
        { name: 'image', label: 'Screenshot', type: 'image' },
        { name: 'name', label: 'Name', required: true },
        { name: 'type', label: 'Type', hint: 'For example Work, Freelance or Personal' },
        { name: 'language', label: 'Main language', hint: 'Sets the colored dot' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'stack', label: 'Stack', type: 'list', hint: 'Comma-separated' },
        { name: 'url', label: 'Link', type: 'url', placeholder: 'https://github.com/…' },
      ],
    },
    skill: {
      noun: 'skill group',
      path: '/api/skills',
      items: () => skills,
      fields: [
        { name: 'label', label: 'Group', required: true },
        { name: 'items', label: 'Skills', type: 'list', hint: 'Comma-separated' },
      ],
    },
    experience: {
      noun: 'experience',
      path: '/api/experience',
      items: () => experience,
      fields: [
        { name: 'org', label: 'Organization', required: true },
        { name: 'meta', label: 'Details', hint: 'For example Remote or Part-time' },
        {
          name: 'roles',
          label: 'Roles',
          type: 'roles',
          required: true,
          hint: 'One per line, newest first: Title | Aug 2025 – Present',
        },
        { name: 'highlights', label: 'Highlights', type: 'lines', rows: 6, hint: 'One per line' },
      ],
    },
  };

  function fieldMarkup({ name, label, type = 'text', hint, rows = 3, required, placeholder }) {
    if (type === 'image') {
      return `
        <div data-image>
          <span class="text-sm font-medium">${label}</span>
          <input type="hidden" name="${name}">
          <div class="mt-1.5 flex flex-wrap items-center gap-3">
            <img alt="" class="size-16 rounded-md border border-line object-cover">
            <label class="${smallButton} has-focus-visible:ring-2 has-focus-visible:ring-accent">
              Upload image
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" class="sr-only">
            </label>
            <button type="button" data-remove class="${smallButton}">Remove</button>
            <span data-status class="text-xs text-fg-muted" aria-live="polite"></span>
          </div>
          <span class="mt-1 block text-xs text-fg-muted">JPEG, PNG, GIF or WebP, up to 5 MB</span>
        </div>`;
    }
    const attributes = `name="${name}"${required ? ' required' : ''}${placeholder ? ` placeholder="${placeholder}"` : ''}`;
    const control = ['textarea', 'lines', 'roles'].includes(type)
      ? `<textarea ${attributes} rows="${rows}" class="${inputClass} resize-y"></textarea>`
      : `<input ${attributes} type="${type === 'list' ? 'text' : type}" class="${inputClass}">`;
    const note = hint ? `<span class="mt-1 block text-xs text-fg-muted">${hint}</span>` : '';
    return `<label class="block"><span class="text-sm font-medium">${label}</span>${control}${note}</label>`;
  }

  // The value lives in a hidden input. Picking a file uploads it right away and stores the returned path.
  function initImageField(wrapper, setUploading) {
    const value = wrapper.querySelector('input[type=hidden]');
    const preview = wrapper.querySelector('img');
    const file = wrapper.querySelector('input[type=file]');
    const remove = wrapper.querySelector('[data-remove]');
    const status = wrapper.querySelector('[data-status]');

    const show = (src) => {
      value.value = src;
      preview.hidden = !src;
      remove.hidden = !src;
      if (src) preview.src = assetUrl(src);
    };
    show(value.value);

    remove.addEventListener('click', () => show(''));
    file.addEventListener('change', async () => {
      const body = new FormData();
      body.append('file', file.files[0]);
      status.textContent = 'Uploading…';
      setUploading(1);
      try {
        show((await api('/api/uploads', { method: 'POST', body })).url);
        status.textContent = '';
      } catch (error) {
        status.textContent = error.message;
      } finally {
        file.value = '';
        setUploading(-1);
      }
    });
  }

  function initEditor() {
    const dialog = $('#editor');
    const form = $('#editor-form');
    const fields = $('#editor-fields');
    const errorLine = $('#editor-error');
    const saveButton = $('#editor-save');
    const deleteButton = $('#editor-delete');

    let spec; // the FORMS entry being edited
    let item; // the list item being edited; undefined when adding one
    let uploading = 0;
    let busy = false;

    const sync = () => {
      saveButton.disabled = busy || uploading > 0;
      deleteButton.disabled = busy;
    };
    const setUploading = (change) => {
      uploading += change;
      sync();
    };
    const showError = (message) => {
      errorLine.textContent = message;
      errorLine.hidden = !message;
    };

    function open(kind, id) {
      spec = FORMS[kind];
      item = spec.items?.().find((entry) => entry.id === id);
      const values = spec.items ? (item ?? {}) : spec.values();

      $('#editor-title').textContent = spec.title ?? `${item ? 'Edit' : 'New'} ${spec.noun}`;
      fields.innerHTML = spec.fields.map(fieldMarkup).join('');
      for (const { name, type } of spec.fields) {
        const show = FIELD_TYPES[type]?.show;
        form.elements.namedItem(name).value = show ? show(values[name] ?? []) : (values[name] ?? '');
      }
      fields.querySelectorAll('[data-image]').forEach((wrapper) => initImageField(wrapper, setUploading));

      deleteButton.hidden = !item;
      uploading = 0;
      showError('');
      sync();
      dialog.showModal();
      fields.querySelector('input:not([type=hidden], [type=file]), textarea')?.focus();
    }

    // Runs a save or delete, then redraws the page. Errors stay in the dialog. Resolves to whether it worked.
    async function commit(action) {
      busy = true;
      sync();
      showError('');
      try {
        await action();
        await refresh();
        dialog.close();
        return true;
      } catch (error) {
        showError(error.message);
        return false;
      } finally {
        busy = false;
        sync();
      }
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(
        spec.fields.map(({ name, type }) => {
          const read = FIELD_TYPES[type]?.read ?? ((text) => text.trim());
          return [name, read(form.elements.namedItem(name).value)];
        }),
      );
      const { path, items, added } = spec;
      const editing = item;

      const saved = await commit(() => {
        if (!items) return spec.save(values);
        return editing
          ? api(`${path}/${editing.id}`, { method: 'PUT', body: values })
          : api(path, { method: 'POST', body: values });
      });
      if (saved && items && !editing) added?.();
    });

    deleteButton.addEventListener('click', () => {
      if (!confirm(`Delete this ${spec.noun}? This can't be undone.`)) return;
      commit(() => api(`${spec.path}/${item.id}`, { method: 'DELETE' }));
    });

    dialog.addEventListener('click', (event) => event.target.closest('[data-close]') && dialog.close());
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-edit]');
      if (button) open(button.dataset.edit, Number(button.dataset.id) || undefined);
    });
    $('#sign-out').addEventListener('click', signOut);
  }

  // ---- Start ----

  // Draws everything that shows content; runs again after each edit.
  function render() {
    renderTabs();
    renderSidebar();
    renderSkills();
    projectView.layout();
    renderExperience();
    renderFooter();
    renderEditControls();
    updateScrollSpy();
  }

  initThemeToggle();
  initTooltip();

  let session;
  try {
    [, session] = await Promise.all([load(), token ? api('/api/session').catch(() => null) : null]);
  } catch {
    renderLoadError();
    return;
  }
  // A token the API no longer accepts (expired, or signed out elsewhere) just means no edit mode.
  admin = Boolean(session?.admin);
  if (session?.admin === false) forgetToken();

  const projectView = initProjects();
  const updateScrollSpy = initScrollSpy();
  $('#status').remove();
  render();
  renderContributions();
  initPalette(projectView.reveal);
  initEditor();
})();
