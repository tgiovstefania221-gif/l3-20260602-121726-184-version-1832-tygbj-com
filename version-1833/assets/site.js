(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (next) {
      slides[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = next;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  var input = document.querySelector('[data-card-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';
  var params = new URLSearchParams(window.location.search);

  var apply = function () {
    if (!input || !cards.length) {
      return;
    }
    var keyword = input.value.trim().toLowerCase();
    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-category') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var matchedText = keyword === '' || content.indexOf(keyword) !== -1;
      var matchedFilter = activeFilter === '' || content.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchedText && matchedFilter));
    });
  };

  if (input) {
    var initial = params.get('q') || '';
    input.value = initial;
    input.addEventListener('input', apply);
    apply();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      activeFilter = chip.getAttribute('data-filter-value') || '';
      apply();
    });
  });
})();
