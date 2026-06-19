(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function() {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });

        showSlide(0);
        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function(panel) {
        var input = panel.querySelector('[data-filter-input]');
        var yearSelect = panel.querySelector('[data-year-filter]');
        var categorySelect = panel.querySelector('[data-category-filter]');
        var scope = panel.closest('.page-shell') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var empty = scope.querySelector('[data-empty-state]');

        function matchYear(card, selectedYear) {
            if (!selectedYear) {
                return true;
            }

            var year = Number(card.getAttribute('data-year') || 0);
            var selected = Number(selectedYear);

            if (selected === 2020 || selected === 2010) {
                return year >= selected;
            }

            return year === selected;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = yearSelect ? yearSelect.value : '';
            var selectedCategory = categorySelect ? categorySelect.value : '';
            var visibleCount = 0;

            cards.forEach(function(card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-genre') || '',
                    card.closest('[data-category-name]') ? card.closest('[data-category-name]').getAttribute('data-category-name') : ''
                ].join(' ').toLowerCase();

                var categoryName = card.closest('[data-category-name]') ? card.closest('[data-category-name]').getAttribute('data-category-name') : '';
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                var yearMatched = matchYear(card, selectedYear);
                var categoryMatched = !selectedCategory || categoryName === selectedCategory;
                var visible = keywordMatched && yearMatched && categoryMatched;

                card.style.display = visible ? '' : 'none';

                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, yearSelect, categorySelect].forEach(function(control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
