(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dotsWrap = hero.querySelector('.hero-dots');
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      if (dotsWrap) {
        Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement('button');
        dot.className = 'hero-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐');
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
        dotsWrap.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var list = panel.parentElement.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var search = panel.querySelector('.filter-search');
      var year = panel.querySelector('.filter-year');
      var type = panel.querySelector('.filter-type');
      var category = panel.querySelector('.filter-category');

      function getValue(el) {
        return el ? el.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = getValue(search);
        var yearValue = getValue(year);
        var typeValue = getValue(type);
        var categoryValue = getValue(category);

        cards.forEach(function (card) {
          var content = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.type,
            card.dataset.category
          ].join(' ').toLowerCase();
          var matchedKeyword = !keyword || content.indexOf(keyword) !== -1;
          var matchedYear = !yearValue || String(card.dataset.year).toLowerCase() === yearValue;
          var matchedType = !typeValue || String(card.dataset.type).toLowerCase() === typeValue;
          var matchedCategory = !categoryValue || String(card.dataset.category).toLowerCase() === categoryValue;
          card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType && matchedCategory));
        });
      }

      [search, year, type, category].forEach(function (field) {
        if (field) {
          field.addEventListener('input', apply);
          field.addEventListener('change', apply);
        }
      });
    });
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('[data-play-button]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-play');
    var attached = false;
    var hlsInstance = null;

    function hideButton() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function attachNative() {
      video.src = source;
      attached = true;
      return Promise.resolve();
    }

    function attachWithHls(Hls) {
      if (!Hls || !Hls.isSupported()) {
        return attachNative();
      }

      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      attached = true;
      return Promise.resolve();
    }

    function attach() {
      if (attached || !source) {
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        return attachNative();
      }

      return loadHlsLibrary().then(attachWithHls).catch(attachNative);
    }

    function play() {
      attach().then(function () {
        hideButton();
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', hideButton);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
