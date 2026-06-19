(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initNavigation();
        initHeroCarousel();
        initCardFilters();
        initSearchPage();
        initVideoPlayers();
    });

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var dotsWrap = document.querySelector("[data-hero-dots]");
        var activeIndex = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function renderDots() {
            if (!dotsWrap) {
                return;
            }

            dotsWrap.innerHTML = "";
            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换到第 " + (index + 1) + " 张");
                if (index === activeIndex) {
                    dot.classList.add("active");
                }
                dot.addEventListener("click", function () {
                    showSlide(index);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === activeIndex);
            });
            renderDots();
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    function initCardFilters() {
        var filterInput = document.querySelector("[data-card-filter]");
        var sortSelect = document.querySelector("[data-card-sort]");
        var container = document.querySelector("[data-card-container]");

        if (!container || (!filterInput && !sortSelect)) {
            return;
        }

        var items = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .rank-row"));
        var original = items.slice();

        function itemText(item) {
            return [
                item.getAttribute("data-title"),
                item.getAttribute("data-year"),
                item.getAttribute("data-region"),
                item.getAttribute("data-genre"),
                item.textContent
            ].join(" ").toLowerCase();
        }

        function yearValue(item) {
            var value = parseInt(item.getAttribute("data-year"), 10);
            return isNaN(value) ? 0 : value;
        }

        function apply() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var sortMode = sortSelect ? sortSelect.value : "default";
            var sorted = original.slice();

            if (sortMode === "year-desc") {
                sorted.sort(function (a, b) {
                    return yearValue(b) - yearValue(a);
                });
            }

            if (sortMode === "year-asc") {
                sorted.sort(function (a, b) {
                    return yearValue(a) - yearValue(b);
                });
            }

            if (sortMode === "title") {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            }

            sorted.forEach(function (item) {
                container.appendChild(item);
                item.classList.toggle("hidden-by-filter", keyword && itemText(item).indexOf(keyword) === -1);
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", apply);
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", apply);
        }
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");

        if (!form || !results || !status || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        var input = form.querySelector("input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (initialQuery) {
            input.value = initialQuery;
            runSearch(initialQuery);
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runSearch(input.value);
        });

        input.addEventListener("input", function () {
            if (input.value.trim().length >= 2) {
                runSearch(input.value);
            }
        });

        function runSearch(query) {
            var keyword = query.trim().toLowerCase();
            results.innerHTML = "";

            if (!keyword) {
                status.textContent = "请输入关键词开始搜索。";
                return;
            }

            var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
                return [item.title, item.year, item.region, item.genre, item.tags].join(" ").toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 80);

            status.textContent = "找到 " + matched.length + " 条结果，最多显示前 80 条。";

            matched.forEach(function (item) {
                var card = document.createElement("article");
                card.className = "movie-card";
                card.innerHTML = [
                    "<a class='movie-card-link' href='" + item.href + "'>",
                    "<div class='poster-frame'>",
                    "<img class='poster-img' src='" + item.cover + "' alt='" + escapeHtml(item.title) + "' loading='lazy' onerror=\"this.style.display='none';\">",
                    "<span class='poster-region'>" + escapeHtml(item.region) + "</span>",
                    "<span class='poster-year'>" + escapeHtml(item.year) + "</span>",
                    "<span class='poster-play'>▶</span>",
                    "</div>",
                    "<div class='movie-card-body'>",
                    "<h3>" + escapeHtml(item.title) + "</h3>",
                    "<p class='movie-meta'>" + escapeHtml(item.genre) + "</p>",
                    "<p class='movie-line'>" + escapeHtml(item.oneLine) + "</p>",
                    "</div>",
                    "</a>"
                ].join("");
                results.appendChild(card);
            });
        }
    }

    function initVideoPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-shell]"));

        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var start = shell.querySelector("[data-video-start]");

            if (!video || !start) {
                return;
            }

            start.addEventListener("click", function () {
                var source = video.getAttribute("data-m3u8");
                start.classList.add("hidden");

                if (!source) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        video.play().catch(function () {});
                    });
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
