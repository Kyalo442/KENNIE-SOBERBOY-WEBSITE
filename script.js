const scrollTopBtn = document.querySelector('.scroll-top');
const quoteModal = document.querySelector('.quote-modal');
const portfolioModal = document.querySelector('.portfolio-modal');
const themeToggles = document.querySelectorAll('.theme-toggle');
let modalContent = document.querySelector('.modal-project-content');
if (!modalContent && portfolioModal) {
  const panel = portfolioModal.querySelector('.modal-panel, .modal-detail-panel');
  if (panel) {
    modalContent = document.createElement('div');
    modalContent.className = 'modal-project-content';
    panel.appendChild(modalContent);
  }
}
const PLACEHOLDER_IMAGE = 'assets/images/placeholder.svg';
const THEME_STORAGE_KEY = 'kennie-theme';

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('light-theme', !isDark);
  themeToggles.forEach((button) => {
    button.textContent = isDark ? 'White' : 'Dark';
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute('aria-label', isDark ? 'Switch to white theme' : 'Switch to dark theme');
  });
}

function getInitialTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return document.body.classList.contains('dark-theme') ? 'dark' : 'light';
}

applyTheme(getInitialTheme());

themeToggles.forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      // Theme still changes for the current page when storage is unavailable.
    }
    applyTheme(nextTheme);
  });
});

function showModal(modal) { modal?.classList.add('active'); }
function hideModal(modal) { modal?.classList.remove('active'); }

document.querySelectorAll('.quote-trigger').forEach((button) => {
  button.addEventListener('click', () => showModal(quoteModal));
});

document.querySelectorAll('.mobile-menu-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const menu = document.querySelector('.mobile-menu');
    if (!menu) return;
    const isOpen = menu.classList.toggle('active');
    menu.setAttribute('aria-hidden', String(!isOpen));
  });
});

document.querySelectorAll('.modal-close').forEach((button) => {
  button.addEventListener('click', () => hideModal(button.closest('.modal')));
});

document.querySelectorAll('.modal').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) hideModal(modal);
  });
});

window.addEventListener('scroll', () => {
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 420);
});

scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Thank you. Your request has been received and Kennie Soberboy will contact you shortly.');
    form.reset();
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('reveal-visible');
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('reveal-visible'));
}

window.addEventListener('error', (event) => {
  const target = event.target;
  if (target && target.tagName === 'IMG' && !target.dataset.fallbackApplied) {
    target.dataset.fallbackApplied = 'true';
    target.src = PLACEHOLDER_IMAGE;
  }
}, true);

function allProjects() {
  if (typeof getAllProjects === 'function') return getAllProjects();
  return [];
}

function projectsFor(category) {
  if (category === 'all') return allProjects();
  if (category === 'featured' && typeof getFeaturedProjects === 'function') return getFeaturedProjects();
  if (typeof getProjectsByCategory === 'function') return getProjectsByCategory(category);
  return [];
}

function isVideoProject(project) {
  return project?.type === 'video' || /\.(mp4|webm|mov|m4v)$/i.test(project?.video || '');
}

function mediaMarkup(project) {
  if (isVideoProject(project)) {
    return `<video class="sample-video" muted playsinline loop preload="none" poster="${project.poster || project.image}" data-video-src="${project.video}" aria-label="${project.title}">
      <source data-src="${project.video}" type="video/mp4">
    </video>
    <span class="play-badge" aria-hidden="true">Play</span>`;
  }
  return `<img src="${project.image}" alt="${project.title}" loading="lazy">`;
}

function projectCard(project) {
  return `<article class="sample-card" data-category="${project.category}" data-project-id="${project.id}">
    <div class="sample-media">
      ${mediaMarkup(project)}
      <span>${project.subcategory}</span>
    </div>
    <div class="sample-content">
      <p class="sample-label">${project.category}</p>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="sample-meta">
        <span>${project.clientIndustry || 'Client project'}</span>
        <span>${project.timeline || 'Fast delivery'}</span>
        <span>${project.tools || 'Professional tools'}</span>
      </div>
      <blockquote>${project.testimonial || 'Professional delivery and clear communication.'}</blockquote>
      <div class="sample-actions">
        <button class="sample-btn sample-btn-preview" type="button">Preview</button>
        <a class="sample-btn" href="contact.html#quote-form">Enquire</a>
        <a class="sample-btn" href="contact.html#quote-form">Request Similar Service</a>
      </div>
    </div>
  </article>`;
}

function renderGrid(container, category = 'all') {
  if (!container) return;
  const projects = projectsFor(category);
  container.innerHTML = projects.map(projectCard).join('');
  setupLazyVideos(container);
  container.querySelectorAll('.sample-card').forEach((card) => {
    const video = card.querySelector('video');
    if (video) {
      card.addEventListener('mouseenter', () => {
        hydrateVideo(video);
        video.currentTime = 0;
        video.play().catch(() => {});
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }
    card.addEventListener('click', (event) => {
      if (event.target.closest('a')) return;
      openProjectModal(card.dataset.projectId);
    });
  });
}

function hydrateVideo(video) {
  const source = video?.querySelector('source[data-src]');
  if (!video || !source) return;
  source.src = source.dataset.src;
  source.removeAttribute('data-src');
  video.load();
}

function setupLazyVideos(scope = document) {
  const videos = scope.querySelectorAll('video[data-video-src]');
  if (!videos.length) return;
  if (!('IntersectionObserver' in window)) {
    videos.forEach(hydrateVideo);
    return;
  }
  const videoObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      hydrateVideo(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '240px 0px' });
  videos.forEach((video) => videoObserver.observe(video));
}

function brochureName(category) {
  if (category === 'websites') return 'web';
  if (category === 'repairs') return 'it';
  return category;
}

function openProjectModal(projectId) {
  const project = allProjects().find((item) => item.id === projectId);
  if (!project || !portfolioModal || !modalContent) return;
  const modalMedia = isVideoProject(project)
    ? `<video class="modal-detail-video" controls playsinline preload="metadata" poster="${project.poster || project.image}">
        <source src="${project.video}" type="video/mp4">
        Your browser does not support this video.
      </video>`
    : `<img class="modal-detail-image" src="${project.image}" alt="${project.title}" loading="lazy">`;
  modalContent.innerHTML = `
    <p class="eyebrow">${project.category} case study</p>
    <h2>${project.title}</h2>
    ${modalMedia}
    <p>${project.description}</p>
    <div class="modal-detail-meta">
      <span><strong>Tools Used</strong>${project.tools || 'Professional workflow'}</span>
      <span><strong>Client Industry</strong>${project.clientIndustry || 'Business'}</span>
      <span><strong>Delivery Timeline</strong>${project.timeline || 'Custom timeline'}</span>
      <span><strong>Project Outcome</strong>${project.outcome || 'Ready-to-use delivery'}</span>
    </div>
    <blockquote>${project.testimonial || 'Reliable, premium delivery.'}</blockquote>
    <div class="modal-detail-actions">
      <a class="btn btn-primary" href="contact.html#quote-form">Request Similar Service</a>
      <a class="btn btn-secondary" href="assets/portfolio-${brochureName(project.category)}.svg" download>Download Sample Brochure</a>
    </div>`;
  showModal(portfolioModal);
}

function setupPortfolioFilters() {
  document.querySelectorAll('[data-portfolio]').forEach((container) => {
    renderGrid(container, container.dataset.portfolio || 'all');
  });

  document.querySelectorAll('.portfolio-filters').forEach((group) => {
    const targetGrid = group.parentElement?.querySelector('[data-portfolio], #portfolio-grid, #recent-work-gallery');
    group.querySelectorAll('.filter-btn').forEach((button) => {
      button.addEventListener('click', () => {
        group.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        renderGrid(targetGrid, button.dataset.filter || 'all');
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', setupPortfolioFilters);
