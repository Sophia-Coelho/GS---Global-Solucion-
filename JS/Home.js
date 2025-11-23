document.addEventListener("DOMContentLoaded", () => {

  // ====================== CAROUSEL + BARRA DE PROGRESSO ======================
  (function initCarousel() {
    const el = document.querySelector("#heroCarousel");
    const bar = document.querySelector(".carousel-progress-bar");

    if (!el || !bar) return;

    if (!window.bootstrap || !window.bootstrap.Carousel) {
      console.warn("Bootstrap Carousel não detectado — pulando inicialização do carousel.");
      return;
    }

    const tempo = Number(el.getAttribute("data-bs-interval")) || 12000;
    const carousel = window.bootstrap.Carousel.getOrCreateInstance(el, {
      interval: false,
      ride: false,
      pause: false,
      wrap: true,
      touch: true
    });

    let timerId = null;

    function animateBar() {
      bar.style.transition = "none";
      bar.style.width = "0%";
      /* force reflow */
      void bar.offsetHeight;
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

    el.querySelectorAll(".carousel-control-prev, .carousel-control-next").forEach(btn => {
      btn.addEventListener("click", () => {
        setTimeout(startCycle, 50);
      });
    });

    startCycle();
  })();



  // ====================== NAVBAR MOBILE (robusto + fallback) ======================
  (function initNavbar() {
    const toggler = document.querySelector(".navbar-toggler");
    const menu = document.querySelector("#navbarNav");
    const BP_MOBILE = 991; // ponto de corte (<= mobile)

    if (!toggler || !menu) {
      // nada a fazer
      return;
    }

    const hasBootstrap = !!(window.bootstrap && window.bootstrap.Collapse);

    // Funções utilitárias para fallback manual
    function manualOpen() {
      menu.classList.add("show");
      // define maxHeight exato para animação suave
      menu.style.maxHeight = menu.scrollHeight + "px";
      toggler.setAttribute("aria-expanded", "true");
    }

    function manualClose() {
      // força transição de fechamento
      menu.style.maxHeight = "0px";
      // remove .show só após pequena espera para evitar pular a animação
      setTimeout(() => menu.classList.remove("show"), 300);
      toggler.setAttribute("aria-expanded", "false");
    }

    function manualToggle() {
      if (menu.classList.contains("show")) manualClose();
      else manualOpen();
    }

    // Se Bootstrap presente: cria/obtém instância Collapse (toggle: false para não disparar no init)
    let collapseInstance = null;
    if (hasBootstrap) {
      try {
        collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
      } catch (err) {
        console.warn("Erro ao criar Collapse do Bootstrap:", err);
        collapseInstance = null;
      }
    }

    // Sincroniza atributos quando bootstrap dispara eventos
    if (hasBootstrap && collapseInstance) {
      menu.addEventListener("shown.bs.collapse", () => {
        toggler.setAttribute("aria-expanded", "true");
        // garante maxHeight correta (suaviza animação)
        menu.style.maxHeight = menu.scrollHeight + "px";
      });

      menu.addEventListener("hidden.bs.collapse", () => {
        toggler.setAttribute("aria-expanded", "false");
        menu.style.maxHeight = "";
      });
    }

    // Clique no toggler: sempre tenta usar a API do Bootstrap se disponível (no mobile),
    // caso contrário usa fallback manual.
    toggler.addEventListener("click", (e) => {
      // permitimos comportamento apenas em mobile para intervenção; em desktop deixamos o Bootstrap (se houver) cuidar
      if (window.innerWidth > BP_MOBILE) {
        // Em desktop, não impedimos comportamento nativo do Bootstrap
        // Mas ainda garantimos aria-expanded correta (por precaução)
        requestAnimationFrame(() => {
          toggler.setAttribute("aria-expanded", toggler.getAttribute("aria-expanded") || "false");
        });
        return;
      }

      // Mobile: intercepta e usa a API/fallback
      e.preventDefault();
      e.stopPropagation();

      if (hasBootstrap && collapseInstance) {
        collapseInstance.toggle();
      } else {
        manualToggle();
      }
    });

    // Fecha o menu ao clicar fora (apenas mobile)
    document.addEventListener("click", (e) => {
      if (window.innerWidth > BP_MOBILE) return;
      const clickedInside = menu.contains(e.target) || toggler.contains(e.target);
      if (!clickedInside) {
        if (hasBootstrap && collapseInstance) {
          // collapseInstance.hide() só se estiver aberto
          if (menu.classList.contains("show")) collapseInstance.hide();
        } else {
          if (menu.classList.contains("show")) manualClose();
        }
      }
    });

    // Ajustes no resize: limpa maxHeight para desktop, recalcula para mobile quando aberto
    window.addEventListener("resize", () => {
      if (!menu) return;
      if (window.innerWidth > BP_MOBILE) {
        menu.style.maxHeight = "";
      } else {
        if (menu.classList.contains("show")) {
          // recalcula altura caso o conteúdo tenha mudado
          menu.style.maxHeight = menu.scrollHeight + "px";
        }
      }
    });

    // Inicializa aria-expanded conforme estado inicial
    toggler.setAttribute("aria-expanded", menu.classList.contains("show") ? "true" : "false");
  })();

}); // end DOMContentLoaded
