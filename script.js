/* =========================================================
   KEVIN & JOANA — PAGE-BY-PAGE NAVIGATION
   ========================================================= */

const container = document.getElementById("wedding");
const pages = [...document.querySelectorAll(".page")];
const dots = [...document.querySelectorAll(".dot")];
const currentPage = document.getElementById("currentPage");

let activeIndex = 0;
let locked = false;
let touchStartY = 0;
let touchStartX = 0;

/* Mark the first page visible immediately */
pages[0].classList.add("is-visible");

/* ---------------------------------------------------------
   Go to one page
   --------------------------------------------------------- */
function goToPage(index) {
  index = Math.max(0, Math.min(index, pages.length - 1));

  if (index === activeIndex && locked) return;

  activeIndex = index;
  locked = true;

  pages[index].scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  updateNavigation(index);

  window.setTimeout(() => {
    locked = false;
  }, 1050);
}

/* ---------------------------------------------------------
   Navigation UI
   --------------------------------------------------------- */
function updateNavigation(index) {
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
    dot.setAttribute("aria-current", i === index ? "page" : "false");
  });

  currentPage.textContent = String(index + 1).padStart(2, "0");

  history.replaceState(null, "", `#${pages[index].id}`);
}

/* ---------------------------------------------------------
   Detect the page currently in the viewport
   --------------------------------------------------------- */
const pageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
        const index = pages.indexOf(entry.target);
        if (index !== -1) {
          activeIndex = index;
          updateNavigation(index);
          entry.target.classList.add("is-visible");
        }
      }
    });
  },
  {
    root: container,
    threshold: [0.55, 0.75, 0.9]
  }
);

pages.forEach((page) => pageObserver.observe(page));

/* ---------------------------------------------------------
   Desktop mouse wheel:
   one wheel gesture = one page
   --------------------------------------------------------- */
container.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    if (locked) return;

    const delta = event.deltaY;

    if (Math.abs(delta) < 8) return;

    if (delta > 0 && activeIndex < pages.length - 1) {
      goToPage(activeIndex + 1);
    } else if (delta < 0 && activeIndex > 0) {
      goToPage(activeIndex - 1);
    }
  },
  { passive: false }
);

/* ---------------------------------------------------------
   Keyboard navigation
   --------------------------------------------------------- */
window.addEventListener("keydown", (event) => {
  const nextKeys = ["ArrowDown", "PageDown", " "];
  const prevKeys = ["ArrowUp", "PageUp"];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    if (!locked && activeIndex < pages.length - 1) {
      goToPage(activeIndex + 1);
    }
  }

  if (prevKeys.includes(event.key)) {
    event.preventDefault();
    if (!locked && activeIndex > 0) {
      goToPage(activeIndex - 1);
    }
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToPage(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToPage(pages.length - 1);
  }
});

/* ---------------------------------------------------------
   Touch / swipe navigation
   --------------------------------------------------------- */
container.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
  },
  { passive: true }
);

container.addEventListener(
  "touchend",
  (event) => {
    if (locked) return;

    const touch = event.changedTouches[0];
    const dy = touchStartY - touch.clientY;
    const dx = touchStartX - touch.clientX;

    /* Ignore mostly-horizontal gestures */
    if (Math.abs(dy) < 45 || Math.abs(dy) < Math.abs(dx)) return;

    if (dy > 0 && activeIndex < pages.length - 1) {
      goToPage(activeIndex + 1);
    } else if (dy < 0 && activeIndex > 0) {
      goToPage(activeIndex - 1);
    }
  },
  { passive: true }
);

/* ---------------------------------------------------------
   Dot navigation
   --------------------------------------------------------- */
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const index = Number(dot.dataset.page);
    goToPage(index);
  });
});

/* ---------------------------------------------------------
   URL hash support
   --------------------------------------------------------- */
function openHashPage() {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;

  const index = pages.findIndex((page) => page.id === hash);

  if (index >= 0) {
    activeIndex = index;

    /* Small delay allows the browser to finish loading first */
    setTimeout(() => {
      goToPage(index);
    }, 100);
  }
}

window.addEventListener("load", openHashPage);

/* Keep active page correct after resize */
window.addEventListener("resize", () => {
  pages[activeIndex].scrollIntoView({
    behavior: "auto",
    block: "start"
  });
});
