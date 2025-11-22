document.addEventListener("DOMContentLoaded", () => {
const el = document.querySelector("#heroCarousel");
const bar = document.querySelector(".carousel-progress-bar");

if (!el || !bar || !window.bootstrap) return;

const tempo = Number(el.getAttribute("data-bs-interval")) || 12000;

const carousel = window.bootstrap.Carousel.getOrCreateInstance(el, {
    interval: false,   // <-- a chave
    ride: false,
    pause: false,
    wrap: true,
    touch: true
});

let timerId = null;

function animateBar() {
    bar.style.transition = "none";
    bar.style.width = "0%";
    bar.offsetHeight; // reflow

    bar.style.transition = `width ${tempo}ms linear`;
    bar.style.width = "100%";
}

function startCycle() {
    animateBar();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
    carousel.next();   
    animateBar();      
    }, tempo);
}

el.querySelectorAll(".carousel-control-prev, .carousel-control-next")
    .forEach(btn => {
    btn.addEventListener("click", () => {
        setTimeout(startCycle, 50);
    });
    });

startCycle();
});

document.addEventListener("DOMContentLoaded", () => {
const toggler = document.querySelector(".navbar-toggler");
const menu = document.querySelector("#navbarNav");

if (!toggler || !menu) return;

const BP_MOBILE = 991; 

const originalToggle = toggler.getAttribute("data-bs-toggle");
const originalTarget = toggler.getAttribute("data-bs-target");

function enableMobileBehavior() {
    toggler.removeAttribute("data-bs-toggle");
    toggler.removeAttribute("data-bs-target");

    menu.classList.remove("show");
    menu.style.maxHeight = "0px";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 250ms ease";
}

function disableMobileBehavior() {
    if (originalToggle) toggler.setAttribute("data-bs-toggle", originalToggle);
    if (originalTarget) toggler.setAttribute("data-bs-target", originalTarget);

    menu.classList.remove("show");
    menu.style.maxHeight = "";
    menu.style.overflow = "";
    menu.style.transition = "";
}

function openMenu() {
    menu.classList.add("show");
    menu.style.maxHeight = menu.scrollHeight + "px";
    toggler.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    menu.style.maxHeight = "0px";
    menu.classList.remove("show");
    toggler.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
    const isOpen = menu.classList.contains("show");
    if (isOpen) closeMenu();
    else openMenu();
}

toggler.addEventListener("click", (e) => {
    if (window.innerWidth > BP_MOBILE) return; 

    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener("click", (e) => {
    if (window.innerWidth > BP_MOBILE) return;

    const clickedInside = menu.contains(e.target) || toggler.contains(e.target);
    if (!clickedInside && menu.classList.contains("show")) {
    closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth <= BP_MOBILE) {
    enableMobileBehavior();
    if (menu.classList.contains("show")) {
        menu.style.maxHeight = menu.scrollHeight + "px";
    }
    } else {
    disableMobileBehavior();
    }
});

if (window.innerWidth <= BP_MOBILE) {
    enableMobileBehavior();
} else {
    disableMobileBehavior();
}
});




