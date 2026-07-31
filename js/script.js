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

  // Створення точок навігації (пагінації)
  let dotsContainer = slider.querySelector('.slider-dots');
  if (!dotsContainer) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'slider-dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
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
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slides[i].classList.add('active');
    if (dots[i]) dots[i].classList.add('active');
  }

  function setSlide(i) {
    index = (i + slides.length) % slides.length;
    showSlide(index);
  }

  function startAutoSlide() {
    stopAutoSlide();
    if (document.hidden) return;
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

  const { slider, slides, getIndex, setSlide } = sliderData;

  let startX = 0;
  let endX = 0;

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    endX = startX; // Скидаємо endX, щоб уникнути помилкового обчислення
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
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

  // Створення елементів модального вікна
  let lightbox = document.getElementById('lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox-modal';
    lightbox.className = 'lightbox-modal';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-label', 'Перегляд зображення');
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Закрити">&times;</button>
        <img class="lightbox-img" src="" alt="Збільшене зображення">
        <p class="lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function openLightbox(src, altText) {
    lightboxImg.src = src;
    lightboxImg.alt = altText || '';
    lightboxCaption.textContent = altText || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
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
    }
  });

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
  initNavbar();
  initAnimations();

  const sliderData = initSlider();
  initSwipe(sliderData);

  initLightbox();
});
