(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;
  var heroTimer = null;

  function setHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(function() {
      setHeroSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function(dot, dotIndex) {
    dot.addEventListener('click', function() {
      setHeroSlide(dotIndex);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHeroTimer();
    });
  });

  startHeroTimer();

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterScope = document.querySelector('[data-filter-scope]');
  var emptyResult = document.querySelector('[data-empty-result]');

  if (filterPanel && filterScope) {
    var keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var items = Array.prototype.slice.call(filterScope.querySelectorAll('.filter-item'));

    function includesText(value, keyword) {
      return String(value || '').toLowerCase().indexOf(keyword) !== -1;
    }

    function applyFilters() {
      var keyword = String(keywordInput && keywordInput.value || '').trim().toLowerCase();
      var region = String(regionSelect && regionSelect.value || '').trim();
      var type = String(typeSelect && typeSelect.value || '').trim();
      var year = String(yearSelect && yearSelect.value || '').trim();
      var visibleCount = 0;

      items.forEach(function(item) {
        var text = [
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year,
          item.dataset.genre,
          item.dataset.tags
        ].join(' ');

        var matched = true;

        if (keyword && !includesText(text, keyword)) {
          matched = false;
        }

        if (region && item.dataset.region !== region) {
          matched = false;
        }

        if (type && item.dataset.type !== type) {
          matched = false;
        }

        if (year && item.dataset.year !== year) {
          matched = false;
        }

        item.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyResult) {
        emptyResult.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
}());
