(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function runMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function runHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function runFilters() {
    selectAll("[data-filter-group]").forEach(function (group) {
      var buttons = selectAll("[data-filter]", group);
      var scope = group.parentElement || document;
      var cards = selectAll("[data-movie-card]", scope);
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var filter = button.getAttribute("data-filter");
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          cards.forEach(function (card) {
            var match = filter === "all" || card.getAttribute("data-year-group") === filter;
            card.classList.toggle("hidden", !match);
          });
        });
      });
    });
  }

  function cardHTML(item) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHTML(item.url) + '" aria-label="' + escapeHTML(item.title) + '">',
      '    <span class="poster-frame">',
      '      <img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
      '      <span class="score-pill">' + escapeHTML(item.rating) + '</span>',
      '    </span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta"><span>' + escapeHTML(item.year) + '</span><span>' + escapeHTML(item.region) + '</span></div>',
      '    <h2><a href="' + escapeHTML(item.url) + '">' + escapeHTML(item.title) + '</a></h2>',
      '    <p>' + escapeHTML(item.oneLine) + '</p>',
      '    <div class="tag-row"><span>' + escapeHTML(item.genre) + '</span><span>' + escapeHTML(item.category) + '</span></div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function renderSearch(container, query) {
    var data = window.movieSearchData || [];
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var items = data.filter(function (item) {
      if (!words.length) {
        return item.hot;
      }
      var haystack = [item.title, item.year, item.region, item.genre, item.tags, item.category, item.oneLine].join(" ").toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (!items.length) {
      container.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>可以尝试更短的片名、地区、年份或题材关键词。</p></div>';
      return;
    }

    var heading = query ? '搜索结果' : '热门影片';
    container.innerHTML = [
      '<div class="section-heading"><div><p class="eyebrow">影片搜索</p><h2>' + heading + '</h2></div></div>',
      '<div class="movie-grid">' + items.map(cardHTML).join("") + '</div>'
    ].join("");
  }

  function runSearchPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.movieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector('[data-search-form] input[name="q"]');
    if (input) {
      input.value = query;
    }
    renderSearch(container, query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    runMobileMenu();
    runHero();
    runFilters();
    runSearchPage();
  });
})();
