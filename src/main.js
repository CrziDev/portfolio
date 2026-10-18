/*
 * Renders the page from PORTFOLIO (src/data.js), then wires up the theme
 * toggle and the GitHub contribution graph.
 */
(() => {
  'use strict';

  const { profile, skills, projects, experience, education } = PORTFOLIO;
  const $ = (selector) => document.querySelector(selector);

  // Full class names (not built from strings) so Tailwind's scanner picks them up.
  const CONTRIB_LEVELS = ['bg-contrib-0', 'bg-contrib-1', 'bg-contrib-2', 'bg-contrib-3', 'bg-contrib-4'];
  const CONTRIB_API = 'https://github-contributions-api.jogruber.de/v4';

  const imageIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round" class="size-6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>`;

  // The image when one is configured, otherwise a dashed placeholder of the same shape.
  function imageSlot(src, label, className) {
    if (src) {
      return `<img src="${src}" alt="${label}" loading="lazy" class="${className} object-cover">`;
    }
    return `
      <div role="img" aria-label="${label}"
        class="${className} flex flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface px-4 text-center text-fg-muted">
        ${imageIcon}
        <span class="text-sm">${label}</span>
      </div>`;
  }

  function link(href, text, className = 'text-accent hover:underline') {
    const external = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}" class="${className}"${external}>${text}</a>`;
  }

  function renderBrand() {
    $('#brand').innerHTML = `
      <span class="grid size-7 place-items-center rounded-md bg-fg font-medium text-canvas">${profile.initials}</span>
      <span class="text-fg-muted">${profile.handle}</span>
      <span class="text-line-strong">/</span>
      <span class="font-medium">portfolio</span>`;
  }

  function renderSidebar() {
    const { email, github, linkedin } = profile;
    const contactLinks = [
      [`mailto:${email}`, email],
      [`https://github.com/${github}`, `github.com/${github}`],
      [`https://www.linkedin.com/in/${linkedin}`, `linkedin.com/in/${linkedin}`],
    ];

    $('#sidebar').innerHTML = `
      ${imageSlot(profile.photo, 'Profile photo', 'aspect-square w-32 rounded-full sm:w-40 md:w-full')}

      <h1 class="mt-4.5 text-2xl leading-tight font-semibold">${profile.name}</h1>
      <p class="font-mono leading-5 text-fg-muted">${profile.handle}</p>

      ${link(
        `mailto:${email}`,
        'Get in touch',
        'mt-4 flex h-8 items-center justify-center rounded-md border border-line bg-surface text-sm font-medium transition-colors hover:bg-surface-hover',
      )}

      <p class="mt-4 flex items-center gap-2 text-sm text-fg-muted">
        <span class="size-2 rounded-full bg-success" aria-hidden="true"></span>
        ${profile.status}
      </p>

      <ul class="mt-2.5 text-sm leading-6">
        <li>${profile.location}</li>
        <li class="text-fg-muted">${profile.phone}</li>
        ${contactLinks.map(([href, text]) => `<li>${link(href, text)}</li>`).join('')}
      </ul>

      <div class="mt-3 border-t border-line pt-4">
        <h2 class="font-semibold">Education</h2>
        <p class="mt-1.5 text-sm font-medium">${education.degree}</p>
        <p class="text-sm text-fg-muted">${education.school} · ${education.year}</p>
      </div>`;
  }

  function renderReadme() {
    $('#readme').innerHTML = `
      <div class="border-b border-line bg-surface px-4 py-2 font-mono text-[13px] leading-5 text-fg-muted">
        ${profile.handle} / README.md
      </div>
      <div class="p-5 sm:px-8 sm:py-6">
        <h2 class="border-b border-line pb-1.5 text-2xl font-semibold">${profile.greeting}</h2>
        <p class="mt-4">${profile.tagline}</p>
      </div>`;
  }

  function renderSkills() {
    const chips = (items) =>
      items
        .map((item) => `<li class="rounded-full bg-chip px-2.5 py-0.5 font-mono text-xs leading-4 text-accent">${item}</li>`)
        .join('');

    $('#skills').innerHTML = skills
      .map(
        ({ label, items }) => `
          <div class="grid gap-2 sm:grid-cols-[158px_1fr] sm:gap-0">
            <dt class="text-[13px] leading-5 text-fg-muted">${label}</dt>
            <dd><ul class="flex flex-wrap gap-2">${chips(items)}</ul></dd>
          </div>`,
      )
      .join('');
  }

  function projectCard(project) {
    return `
      <article class="flex flex-col rounded-md border border-line p-3">
        ${imageSlot(project.image, `${project.name} screenshot`, 'aspect-[3/2] w-full rounded-md')}
        <div class="mt-3 flex items-center gap-2">
          <h3 class="truncate text-sm font-semibold text-accent">
            ${project.url ? link(project.url, project.name, 'hover:underline') : project.name}
          </h3>
          <span class="shrink-0 rounded-full border border-line px-2 text-xs leading-[18px] text-fg-muted">${project.type}</span>
        </div>
        <p class="mt-2 text-xs leading-snug text-fg-muted">${project.description}</p>
        <p class="mt-auto pt-3 font-mono text-xs text-fg-muted">${project.stack.join(' · ')}</p>
      </article>`;
  }

  // Projects show two rows at a time; the arrows slide between pages.
  // Column counts mirror the page grid's sm:grid-cols-2 lg:grid-cols-3.
  function initProjects() {
    const ROWS = 2;
    const lg = matchMedia('(min-width: 64rem)');
    const sm = matchMedia('(min-width: 40rem)');
    const track = $('#projects');
    const prev = $('#projects-prev');
    const next = $('#projects-next');

    let page = 0;
    let perPage = 0;
    let pageCount = 1;

    function show(index) {
      page = Math.min(Math.max(index, 0), pageCount - 1);
      // Each page is 100% of the track wide, plus the track's 1rem (gap-4) gap.
      track.style.transform = `translateX(calc(${page} * (-100% - 1rem)))`;
      [...track.children].forEach((el, i) => (el.inert = i !== page));
      $('#projects-page').textContent = `${page + 1} / ${pageCount}`;
      prev.disabled = page === 0;
      next.disabled = page === pageCount - 1;
    }

    function layout() {
      const firstVisible = page * perPage;
      perPage = (lg.matches ? 3 : sm.matches ? 2 : 1) * ROWS;
      pageCount = Math.ceil(projects.length / perPage);

      track.innerHTML = Array.from(
        { length: pageCount },
        (_, i) => `
          <div class="grid w-full shrink-0 content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${projects.slice(i * perPage, (i + 1) * perPage).map(projectCard).join('')}
          </div>`,
      ).join('');

      $('#projects-nav').hidden = pageCount <= 1;
      show(Math.floor(firstVisible / perPage)); // keep the same projects in view after a resize
    }

    prev.addEventListener('click', () => show(page - 1));
    next.addEventListener('click', () => show(page + 1));
    lg.addEventListener('change', layout);
    sm.addEventListener('change', layout);
    layout();
  }

  function renderExperience() {
    $('#experience').innerHTML = experience
      .map(
        ({ org, meta, roles, highlights }) => `
          <article class="px-5 py-4">
            <p class="text-[13px] leading-[22px] text-fg-muted">${[org, meta].filter(Boolean).join(' · ')}</p>
            ${roles
              .map(
                ({ title, period }) => `
                  <div class="flex flex-wrap items-baseline justify-between gap-x-4 leading-[22px]">
                    <h3 class="text-sm font-semibold">${title}</h3>
                    <span class="font-mono text-xs text-fg-muted">${period}</span>
                  </div>`,
              )
              .join('')}
            <ul class="mt-1.5 list-disc space-y-1 pl-[18px] text-[13px] leading-5">
              ${highlights.map((item) => `<li>${item}</li>`).join('')}
            </ul>
          </article>`,
      )
      .join('');
  }

  const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });

  function contribCell({ date, count, level }) {
    const title = date
      ? ` title="${count || 'No'} contribution${count === 1 ? '' : 's'} on ${dayFormat.format(new Date(date))}"`
      : '';
    return `<span class="size-2.5 rounded-[2px] ${CONTRIB_LEVELS[level]}"${title}></span>`;
  }

  function drawGraph(days) {
    // Pad the first column so every column runs Sunday → Saturday.
    const offset = days[0].date ? new Date(days[0].date).getUTCDay() : 0;
    $('#contrib-graph').innerHTML = '<span></span>'.repeat(offset) + days.map(contribCell).join('');

    // On narrow screens, start scrolled to the most recent weeks.
    const scroller = $('#contrib-scroller');
    scroller.scrollLeft = scroller.scrollWidth;
  }

  async function renderContributions() {
    const title = $('#contrib-title');

    $('#contrib-legend').innerHTML = `
      <span class="mr-1">Less</span>
      ${CONTRIB_LEVELS.map((level) => `<span class="size-2.5 rounded-[2px] ${level}"></span>`).join('')}
      <span class="ml-1">More</span>`;

    // Empty grid while loading, so the layout doesn't jump.
    drawGraph(Array.from({ length: 53 * 7 }, () => ({ level: 0 })));

    try {
      const response = await fetch(`${CONTRIB_API}/${profile.github}?y=last`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const { total, contributions } = await response.json();
      title.textContent = `${total.lastYear.toLocaleString('en-US')} contributions in the last year`;
      drawGraph(contributions);
    } catch {
      title.innerHTML = `Couldn't load contributions. ${link(`https://github.com/${profile.github}`, 'View them on GitHub')}`;
    }
  }

  function initThemeToggle() {
    const root = document.documentElement;
    const button = $('#theme-toggle');
    const syncLabel = () => {
      button.textContent = root.dataset.theme === 'light' ? 'Dark mode' : 'Light mode';
    };

    button.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', root.dataset.theme);
      } catch {}
      syncLabel();
    });
    syncLabel();
  }

  renderBrand();
  renderSidebar();
  renderReadme();
  renderSkills();
  initProjects();
  renderExperience();
  renderContributions();
  initThemeToggle();
})();
