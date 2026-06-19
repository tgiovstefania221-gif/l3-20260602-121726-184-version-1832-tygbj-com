document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            const isOpen = !mobilePanel.hasAttribute("hidden");
            mobilePanel.toggleAttribute("hidden", isOpen);
            menuButton.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    const topButton = document.querySelector(".to-top");
    if (topButton) {
        topButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    initHeroCarousel();
    initCardFilters();
    initSorting();
});

function initHeroCarousel() {
    const carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const previous = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === current);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    previous?.addEventListener("click", () => {
        show(current - 1);
        start();
    });

    next?.addEventListener("click", () => {
        show(current + 1);
        start();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            show(index);
            start();
        });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
}

function initCardFilters() {
    const inputs = document.querySelectorAll(".card-filter");

    inputs.forEach((input) => {
        const targetSelector = input.dataset.filterTarget || ".movie-card";
        const cards = Array.from(document.querySelectorAll(targetSelector));
        const count = document.querySelector(".filter-count");
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (query && !input.value) {
            input.value = query;
        }

        const apply = () => {
            const keyword = input.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.category,
                    card.innerText
                ].join(" ").toLowerCase();
                const matched = !keyword || haystack.includes(keyword);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} 部`;
            }
        };

        input.addEventListener("input", apply);
        apply();
    });
}

function initSorting() {
    const selects = document.querySelectorAll(".sort-select");

    selects.forEach((select) => {
        const grid = document.querySelector(select.dataset.sortGrid);
        if (!grid) {
            return;
        }

        const original = Array.from(grid.children);

        select.addEventListener("change", () => {
            const cards = Array.from(grid.children);
            const value = select.value;

            if (value === "default") {
                original.forEach((card) => grid.appendChild(card));
                return;
            }

            cards.sort((a, b) => {
                if (value === "title") {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                }
                if (value === "year-desc") {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (value === "rating-desc") {
                    const ratingA = Number((a.innerText.match(/★\s*([0-9.]+)/) || [0, 0])[1]);
                    const ratingB = Number((b.innerText.match(/★\s*([0-9.]+)/) || [0, 0])[1]);
                    return ratingB - ratingA;
                }
                return 0;
            });

            cards.forEach((card) => grid.appendChild(card));
        });
    });
}
