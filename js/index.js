document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initActiveNavOnScroll();
  initPortfolioFilter();
  initTestimonialsCarousel();
  initSettingsSidebar();
  initScrollToTop();
});

/* ==========================================================================
   Helpers
   ========================================================================== */
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(null, args);
    }, delay);
  };
}

/* ==========================================================================
   1. Dark / Light Theme Switcher
   ========================================================================== */
function initThemeSwitcher() {
  var themeToggleBtn = document.getElementById('theme-toggle-button');
  var htmlElement = document.documentElement;
  var savedTheme = localStorage.getItem('ahmed_portfolio_theme') || 'dark';

  function setTheme(theme) {
    if (theme === 'dark') {
      htmlElement.setAttribute('data-bs-theme', 'dark');
      htmlElement.classList.add('dark', 'dark-mode');
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      htmlElement.setAttribute('data-bs-theme', 'light');
      htmlElement.classList.remove('dark', 'dark-mode');
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('ahmed_portfolio_theme', theme);
  }

  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      var currentTheme = htmlElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }
}

/* ==========================================================================
   2. Active Nav Link on Scroll
   ========================================================================== */
function initActiveNavOnScroll() {
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  function clearActiveState() {
    for (let i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.remove('text-primary', 'font-bold');
      navLinks[i].classList.add('text-slate-600', 'dark:text-slate-300');
    }
  }

  function setActiveLink(id) {
    clearActiveState();
    var activeLink = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (activeLink) {
      activeLink.classList.remove('text-slate-600', 'dark:text-slate-300');
      activeLink.classList.add('text-primary', 'font-bold');
    }
  }


  var observer = new IntersectionObserver(
    function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          setActiveLink(entries[i].target.id);
        }
      }
    },
    { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  for (let i = 0; i < sections.length; i++) {
    observer.observe(sections[i]);
  }
}

/* ==========================================================================
   3. Portfolio Filters (Vanilla JS Tabs)
   ========================================================================== */
function initPortfolioFilter() {
  var filterButtons = document.querySelectorAll('.portfolio-filter');
  var portfolioItems = document.querySelectorAll('.portfolio-item');
  if (!filterButtons.length || !portfolioItems.length) return;

  var inactiveClasses = [
    'bg-white',
    'dark:bg-slate-800',
    'text-slate-600',
    'dark:text-slate-300',
    'border',
    'border-slate-300',
    'dark:border-slate-700',
  ];
  var activeClasses = ['bg-linear-to-r', 'from-primary', 'to-secondary', 'text-white'];

  for (let i = 0; i < portfolioItems.length; i++) {
    portfolioItems[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }

  function setActiveButton(activeBtn) {
    for (let i = 0; i < filterButtons.length; i++) {
      var btn = filterButtons[i];
      var isActive = btn === activeBtn;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.remove.apply(btn.classList, activeClasses.concat(inactiveClasses));
      btn.classList.add.apply(btn.classList, isActive ? activeClasses : inactiveClasses);
    }
  }

  function applyFilter(filter) {
    for (let i = 0; i < portfolioItems.length; i++) {
      var item = portfolioItems[i];
      var matches = filter === 'all' || item.dataset.category === filter;

      if (matches) {
        item.style.display = '';
        void item.offsetWidth;
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.9)';
        (function (el) {
          setTimeout(function () {
            el.style.display = 'none';
          }, 300);
        })(item);
      }
    }
  }

  for (let i = 0; i < filterButtons.length; i++) {
    (function (button) {
      button.addEventListener('click', function () {
        setActiveButton(button);
        applyFilter(button.dataset.filter);
      });
    })(filterButtons[i]);
  }
}

/* ==========================================================================
   4. Testimonials Carousel (Vanilla JS)
   ========================================================================== */
function initTestimonialsCarousel() {
  var track = document.getElementById('testimonials-carousel');
  var nextBtn = document.getElementById('next-testimonial');
  var prevBtn = document.getElementById('prev-testimonial');
  var indicatorsWrap = document.querySelector('[aria-label="مؤشرات التوصيات"]');
  if (!track) return;

  var cards = track.querySelectorAll('.testimonial-card');
  var totalCards = cards.length;
  if (!totalCards) return;

  var isRTL = getComputedStyle(document.documentElement).direction === 'rtl';
  var sign = isRTL ? 1 : -1; // direction the track moves when advancing

  var itemsPerView = getItemsPerView();
  var currentIndex = 0;
  var autoplayTimer = null;

  function getItemsPerView() {
    var w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - itemsPerView);
  }

  function buildIndicators() {
    if (!indicatorsWrap) return;
    indicatorsWrap.innerHTML = '';
    var maxIndex = getMaxIndex();
    for (let i = 0; i <= maxIndex; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel-indicator w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer';
      btn.dataset.index = String(i);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', 'التوصية ' + (i + 1));
      (function (index) {
        btn.addEventListener('click', function () {
          goToSlide(index);
          restartAutoplay();
        });
      })(i);
      indicatorsWrap.appendChild(btn);
    }
    updateIndicators();
  }

  function updateIndicators() {
    if (!indicatorsWrap) return;
    var indicators = indicatorsWrap.querySelectorAll('.carousel-indicator');
    for (let i = 0; i < indicators.length; i++) {
      var isActive = i === currentIndex;
      indicators[i].classList.toggle('bg-accent', isActive);
      indicators[i].classList.toggle('bg-slate-400', !isActive);
      indicators[i].classList.toggle('dark:bg-slate-600', !isActive);
      indicators[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
  }

  function updateTrack() {
    var offset = currentIndex * (100 / itemsPerView) * sign;
    track.style.transform = 'translateX(' + offset + '%)';
    updateIndicators();
  }

  function goToSlide(index) {
    var maxIndex = getMaxIndex();
    currentIndex = Math.min(Math.max(index, 0), maxIndex);
    updateTrack();
  }

  function nextSlide() {
    var maxIndex = getMaxIndex();
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateTrack();
  }

  function prevSlide() {
    var maxIndex = getMaxIndex();
    currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
    updateTrack();
  }

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextSlide();
      restartAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prevSlide();
      restartAutoplay();
    });
  }

  var carouselWrapper = track.closest('.relative');
  if (carouselWrapper) {
    carouselWrapper.addEventListener('mouseenter', stopAutoplay);
    carouselWrapper.addEventListener('mouseleave', startAutoplay);
  }

  window.addEventListener(
    'resize',
    debounce(function () {
      var newItemsPerView = getItemsPerView();
      if (newItemsPerView !== itemsPerView) {
        itemsPerView = newItemsPerView;
        currentIndex = Math.min(currentIndex, getMaxIndex());
        buildIndicators();
        updateTrack();
      }
    }, 200)
  );

  buildIndicators();
  updateTrack();
  startAutoplay();
}

/* ==========================================================================
   5. Settings Sidebar (Font + Theme Color Customization)
   ========================================================================== */
function initSettingsSidebar() {
  var toggleBtn = document.getElementById('settings-toggle');
  var closeBtn = document.getElementById('close-settings');
  var sidebar = document.getElementById('settings-sidebar');
  var resetBtn = document.getElementById('reset-settings');
  var fontOptions = document.querySelectorAll('.font-option');
  var colorsGrid = document.getElementById('theme-colors-grid');
  if (!sidebar) return;

  var FONT_KEY = 'ahmed_portfolio_font';
  var COLOR_KEY = 'ahmed_portfolio_color';
  var DEFAULT_FONT = 'tajawal';
  var DEFAULT_COLOR = 'indigo';

  var fontClassMap = {
    alexandria: 'font-alexandria',
    tajawal: 'font-tajawal',
    cairo: 'font-cairo',
  };
  var fontClassList = ['font-alexandria', 'font-tajawal', 'font-cairo'];

  var themeColors = [
    { id: 'indigo', name: 'إنديجو', primary: '#6366f1', secondary: '#8b5cf6', accent: '#ec4899' },
    { id: 'blue', name: 'أزرق', primary: '#3b82f6', secondary: '#06b6d4', accent: '#0ea5e9' },
    { id: 'emerald', name: 'أخضر', primary: '#10b981', secondary: '#14b8a6', accent: '#22c55e' },
    { id: 'rose', name: 'وردي', primary: '#f43f5e', secondary: '#ec4899', accent: '#f97316' },
    { id: 'amber', name: 'كهرماني', primary: '#f59e0b', secondary: '#f97316', accent: '#eab308' },
    { id: 'violet', name: 'بنفسجي', primary: '#8b5cf6', secondary: '#a855f7', accent: '#d946ef' },
    { id: 'teal', name: 'تركواز', primary: '#14b8a6', secondary: '#06b6d4', accent: '#0891b2' },
    { id: 'red', name: 'أحمر', primary: '#ef4444', secondary: '#f97316', accent: '#dc2626' },
  ];

  function applyFont(fontKey) {
    document.body.classList.remove.apply(document.body.classList, fontClassList);
    document.body.classList.add(fontClassMap[fontKey] || fontClassMap[DEFAULT_FONT]);

    for (let i = 0; i < fontOptions.length; i++) {
      var btn = fontOptions[i];
      var isActive = btn.dataset.font === fontKey;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('border-primary', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    }

    localStorage.setItem(FONT_KEY, fontKey);
  }

  function findColor(colorId) {
    for (let i = 0; i < themeColors.length; i++) {
      if (themeColors[i].id === colorId) return themeColors[i];
    }
    return themeColors[0];
  }

  function applyColor(colorId) {
    var color = findColor(colorId);
    var root = document.documentElement;

    root.style.setProperty('--color-primary', color.primary, 'important');
    root.style.setProperty('--color-secondary', color.secondary, 'important');
    root.style.setProperty('--color-accent', color.accent, 'important');
    root.dataset.themeColor = colorId; 

    if (colorsGrid) {
      var swatches = colorsGrid.querySelectorAll('.color-option');
      var isDark = document.documentElement.classList.contains('dark');
      for (let i = 0; i < swatches.length; i++) {
        var swatch = swatches[i];
        var isActive = swatch.dataset.color === colorId;
        swatch.style.borderColor = isActive ? (isDark ? '#ffffff' : '#1e293b') : 'transparent';
        swatch.style.boxShadow = isActive
          ? '0 0 0 2px ' + (isDark ? '#0f172a' : '#ffffff') + ', 0 0 0 4px ' + color.primary
          : 'none';
      }
    }

    localStorage.setItem(COLOR_KEY, colorId);
  }

  function buildColorsGrid() {
    if (!colorsGrid) return;
    colorsGrid.innerHTML = '';

    for (let i = 0; i < themeColors.length; i++) {
      var color = themeColors[i];

      
      var swatch = document.createElement('div');
      swatch.className = 'color-option';
      swatch.dataset.color = color.id;
      swatch.setAttribute('role', 'button');
      swatch.setAttribute('tabindex', '0');
      swatch.setAttribute('aria-label', color.name);
      swatch.title = color.name;

      swatch.style.cssText =
        'width: 100%;' +
        'aspect-ratio: 1 / 1;' +
        'border-radius: 0.75rem;' +
        'cursor: pointer;' +
        'border: 2px solid transparent;' +
        'transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;' +
        'background: linear-gradient(135deg, ' + color.primary + ', ' + color.secondary + ');';

      (function (swatchEl, colorId) {
        swatchEl.addEventListener('mouseenter', function () {
          swatchEl.style.transform = 'scale(1.1)';
        });
        swatchEl.addEventListener('mouseleave', function () {
          swatchEl.style.transform = 'scale(1)';
        });
        swatchEl.addEventListener('click', function () {
          applyColor(colorId);
        });
        swatchEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            applyColor(colorId);
          }
        });
      })(swatch, color.id);

      colorsGrid.appendChild(swatch);
    }
  }

  function openSidebar() {
    sidebar.classList.remove('translate-x-full');
    sidebar.setAttribute('aria-hidden', 'false');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.add('translate-x-full');
    sidebar.setAttribute('aria-hidden', 'true');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function isSidebarOpen() {
    return !sidebar.classList.contains('translate-x-full');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      if (isSidebarOpen()) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

  document.addEventListener('click', function (e) {
    var clickedToggle = toggleBtn ? toggleBtn.contains(e.target) : false;
    if (isSidebarOpen() && !sidebar.contains(e.target) && !clickedToggle) {
      closeSidebar();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isSidebarOpen()) closeSidebar();
  });

  for (let i = 0; i < fontOptions.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        applyFont(btn.dataset.font);
      });
    })(fontOptions[i]);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      localStorage.removeItem(FONT_KEY);
      localStorage.removeItem(COLOR_KEY);
      // Remove the inline overrides entirely so the stylesheet defaults show again
      var root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-accent');
      delete root.dataset.themeColor;
      applyFont(DEFAULT_FONT);
      applyColor(DEFAULT_COLOR);
    });
  }

  buildColorsGrid();
  applyFont(localStorage.getItem(FONT_KEY) || DEFAULT_FONT);
  applyColor(localStorage.getItem(COLOR_KEY) || DEFAULT_COLOR);
}

/* ==========================================================================
   6. Scroll To Top Button
   ========================================================================== */
function initScrollToTop() {
  var btn = document.getElementById('scroll-to-top');
  if (!btn) return;

  function toggleVisibility() {
    var shouldShow = window.scrollY > 400;
    btn.classList.toggle('opacity-0', !shouldShow);
    btn.classList.toggle('invisible', !shouldShow);
    btn.classList.toggle('opacity-100', shouldShow);
    btn.classList.toggle('visible', shouldShow);
  }

  window.addEventListener('scroll', debounce(toggleVisibility, 50));
  toggleVisibility();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}