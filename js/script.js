// 🔹 АНІМАЦІЇ СЕКЦІЙ
function initAnimations() {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  // Якщо IntersectionObserver підтримується
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          const services = entry.target.querySelector('.services');
          if (services) {
            services.classList.add('visible');
          }
          // перестаємо спостерігати після відкриття
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    sections.forEach(section => observer.observe(section));
  } else {
    // Резервний варіант для застарілих браузерів
    sections.forEach(section => section.classList.add('visible'));
  }
}

// Забезпечення видимості при поверненні назад у браузері (bfcache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.add('visible');
    });
  }
});


// 🔹 SPA СЛАЙДЕР
function initSlider() {
  const slider = document.querySelector('.spa-slider');
  if (!slider) return null;

  const slides = slider.querySelectorAll('.slide');
  if (!slides.length) return null;

  const next = slider.querySelector('.next');
  const prev = slider.querySelector('.prev');

  let index = 0;
  let autoSlideTimer = null;
  let paused = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'slider-pause';
  pause.textContent = 'Пауза';
  pause.setAttribute('aria-label', 'Зупинити автоматичну зміну слайдів');
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.textContent = paused ? 'Відтворити' : 'Пауза';
    pause.setAttribute('aria-label', paused ? 'Увімкнути автоматичну зміну слайдів' : 'Зупинити автоматичну зміну слайдів');
    startAutoSlide();
  });
  slider.appendChild(pause);
  slider.addEventListener('mouseenter', stopAutoSlide);
  slider.addEventListener('mouseleave', startAutoSlide);
  slider.addEventListener('focusin', stopAutoSlide);
  slider.addEventListener('focusout', () => setTimeout(startAutoSlide, 0));
  reducedMotion.addEventListener('change', startAutoSlide);

  // Створення точок навігації (пагінації)
  let dotsContainer = slider.querySelector('.slider-dots');
  if (!dotsContainer) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Перейти до слайду ${i + 1}`);
      dot.addEventListener('click', () => {
        setSlide(i);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });
    slider.appendChild(dotsContainer);
  }

  const dots = dotsContainer.querySelectorAll('.dot');

  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', n === i ? 'false' : 'true');
    });
    dots.forEach((dot, n) => {
      dot.classList.remove('active');
      dot.setAttribute('aria-current', n === i ? 'true' : 'false');
    });

    slides[i].classList.add('active');
    if (dots[i]) dots[i].classList.add('active');
  }

  function setSlide(i) {
    index = (i + slides.length) % slides.length;
    showSlide(index);
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (document.hidden || paused || reducedMotion.matches || slider.matches(':hover, :focus-within') || slides.length < 2) return;
    autoSlideTimer = setInterval(() => {
      setSlide(index + 1);
    }, 4500);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  function resetAutoSlide() {
    startAutoSlide();
  }

  // Пауза слайдера коли вкладка неактивна для економії ресурсів RAM/CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  });

  if (next) {
    next.onclick = () => {
      setSlide(index + 1);
      resetAutoSlide();
    };
  }

  if (prev) {
    prev.onclick = () => {
      setSlide(index - 1);
      resetAutoSlide();
    };
  }

  showSlide(index);
  startAutoSlide();

  return {
    slider,
    slides,
    getIndex: () => index,
    setSlide: (i) => {
      setSlide(i);
      resetAutoSlide();
    }
  };
}



// 🔹 SWIPE ДЛЯ ТАЧ-ПРИСТРОЇВ
function initSwipe(sliderData) {
  if (!sliderData) return;

  const { slider, getIndex, setSlide } = sliderData;

  let startX = 0;
  let endX = 0;
  let startY = 0;
  let endY = 0;
  let touching = false;

  slider.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { touching = false; return; }
    touching = true;
    startX = e.touches[0].clientX;
    startY = endY = e.touches[0].clientY;
    endX = startX; // Скидаємо endX, щоб уникнути помилкового обчислення
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!touching || e.touches.length !== 1) { touching = false; return; }
    endY = e.touches[0].clientY;
    endX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchcancel', () => { touching = false; });
  slider.addEventListener('touchend', (event) => {
    if (!touching) return;
    touching = false;
    const touch = event.changedTouches[0];
    if (touch) { endX = touch.clientX; endY = touch.clientY; }
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold && Math.abs(diff) > Math.abs(startY - endY)) {
      let currentIndex = getIndex();
      if (diff > 0) {
        setSlide(currentIndex + 1);
      } else {
        setSlide(currentIndex - 1);
      }
    }
  });
}


// 🔹 LIGHTBOX (ПЕРЕГЛЯД ЗОБРАЖЕНЬ У ПОВНОМУ РОЗМІРІ)
function initLightbox() {
  const images = document.querySelectorAll('.gallery img, .schedule-image');
  if (!images.length) return;
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox-modal';
  lightbox.className = 'lightbox-modal';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Перегляд зображення');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = `<div class="lightbox-content">
    <button type="button" class="lightbox-close" aria-label="Закрити">&times;</button>
    <img class="lightbox-img" alt=""><p class="lightbox-caption"></p></div>`;
  document.body.appendChild(lightbox);
  const closeBtn = lightbox.querySelector('.lightbox-close');
  let trigger = null;
  let previousOverflow = '';
  let background = [];
  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    background.forEach(([element, wasInert]) => { element.inert = wasInert; });
    document.body.style.overflow = previousOverflow;
    trigger?.focus();
  }
  images.forEach(img => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = img.classList.contains('schedule-image') ? 'schedule-image-button' : 'gallery-image-button';
    button.setAttribute('aria-label', `Збільшити: ${img.alt}`);
    img.before(button);
    button.appendChild(img);
    button.addEventListener('click', () => {
      trigger = button;
      previousOverflow = document.body.style.overflow;
      const fullImage = lightbox.querySelector('.lightbox-img');
      fullImage.src = img.currentSrc || img.src;
      fullImage.alt = img.alt;
      lightbox.querySelector('.lightbox-caption').textContent = img.alt;
      background = [...document.body.children].filter(element => element !== lightbox).map(element => [element, element.inert]);
      background.forEach(([element]) => { element.inert = true; });
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    });
  });
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'Tab') { event.preventDefault(); closeBtn.focus(); }
  });
}


// 🔹 ФІКСОВАНА НАВІГАЦІЯ ТА БУРГЕР-МЕНЮ
function initNavbar() {
  const burgerToggle = document.getElementById('burger-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbar = document.getElementById('navbar');

  if (!burgerToggle || !navMenu) return;

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    burgerToggle.classList.toggle('open');
    burgerToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    burgerToggle.setAttribute('aria-label', isOpen ? 'Закрити меню' : 'Відкрити меню');

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    burgerToggle.classList.remove('open');
    burgerToggle.setAttribute('aria-expanded', 'false');
    burgerToggle.setAttribute('aria-label', 'Відкрити меню');
    document.body.style.overflow = '';
  }

  burgerToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Закриття кліком за межами
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !burgerToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Закриття через Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
      burgerToggle.focus();
    }
  });

  window.matchMedia('(max-width: 860px)').addEventListener('change', closeMenu);
  window.addEventListener('pageshow', closeMenu);

  // Ефект тіні навбару при скролі
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });
}


// 🔥 ІНІЦІАЛІЗАЦІЯ
document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add('js');
  initNavbar();
  initAnimations();

  const sliderData = initSlider();
  initSwipe(sliderData);

  initLightbox();
});
