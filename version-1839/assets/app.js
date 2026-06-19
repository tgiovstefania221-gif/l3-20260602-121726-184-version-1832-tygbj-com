(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.mobile-nav');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === active);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(active - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(active + 1);
      startHero();
    });
  }

  startHero();

  var filterInput = document.getElementById('filter-input');
  var filterGenre = document.getElementById('filter-genre');
  var filterYear = document.getElementById('filter-year');
  var filterCategory = document.getElementById('filter-category');
  var filterReset = document.getElementById('filter-reset');
  var scope = document.querySelector('.filter-scope');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyQueryParam() {
    if (!filterInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      filterInput.value = q;
    }
  }

  function filterCards() {
    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var keyword = normalize(filterInput && filterInput.value);
    var genre = normalize(filterGenre && filterGenre.value);
    var year = normalize(filterYear && filterYear.value);
    var category = normalize(filterCategory && filterCategory.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-category'));
      var cardGenre = normalize(card.getAttribute('data-genre'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (genre && cardGenre.indexOf(genre) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    var empty = scope.querySelector('.no-results');

    if (!visibleCount) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配内容';
        scope.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  }

  [filterInput, filterGenre, filterYear, filterCategory].forEach(function (item) {
    if (item) {
      item.addEventListener('input', filterCards);
      item.addEventListener('change', filterCards);
    }
  });

  if (filterReset) {
    filterReset.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }

      if (filterGenre) {
        filterGenre.value = '';
      }

      if (filterYear) {
        filterYear.value = '';
      }

      if (filterCategory) {
        filterCategory.value = '';
      }

      filterCards();
    });
  }

  applyQueryParam();
  filterCards();

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-video');
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function begin() {
      prepare();
      video.controls = true;
      player.classList.add('is-playing');

      if (overlay) {
        overlay.style.display = 'none';
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.style.display = 'flex';
          }
          player.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        begin();
      });
    }

    video.addEventListener('click', function () {
      if (!prepared) {
        begin();
      }
    });
  });
})();
