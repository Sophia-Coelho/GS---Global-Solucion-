document.addEventListener("DOMContentLoaded", () => {

  // ========================= LOTTIES (DURAÇÕES IGUALADAS) =========================
  const DURACAO_PADRAO = 1.5;

  function playLottie(container, animRef, path, onComplete = null) {
    if (animRef) {
      try { animRef.destroy(); } catch (e) {}
    }

    const anim = lottie.loadAnimation({
      container: container,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: path
    });

    anim.addEventListener("DOMLoaded", () => {
      const frames = anim.totalFrames;
      const fps = anim.frameRate;
      const duracaoOriginal = frames / fps;
      const novaVelocidade = duracaoOriginal / DURACAO_PADRAO;
      anim.setSpeed(novaVelocidade);
    });

    if (onComplete) anim.addEventListener("complete", onComplete);

    return anim;
  }

  let animCreditos = null;
  let animSelecione = null;
  let animSucesso = null;
  
  // ========== MODAIS AGORA SÓ FECHAM PELO BOTÃO ==========

  // Créditos esgotados
  document.getElementById("modalCreditosEsgotados").addEventListener("shown.bs.modal", () => {
    animCreditos = playLottie(
      document.getElementById("lottieCreditos"),
      animCreditos,
      "/assets/lottie/sad.json",
      null // ❌ remove o fechamento automático
    );
  });

  // Selecione horário
  document.getElementById("modalSelecioneHorario").addEventListener("shown.bs.modal", () => {
    animSelecione = playLottie(
      document.getElementById("lottieSelecione"),
      animSelecione,
      "/assets/lottie/clock.json",
      null // ❌ remove o fechamento automático
    );
  });

  // Sucesso
  document.getElementById("modalAgendado").addEventListener("shown.bs.modal", () => {
    animSucesso = playLottie(
      document.getElementById("checkLottie"),
      animSucesso,
      "/assets/lottie/success.json",
      null // ❌ remove o fechamento automático
    );
  });

  // ========================= CONTROLE DE CRÉDITOS =========================
  localStorage.setItem("creditos", 5); // sempre reinicia com 5
  const creditosSpan = document.querySelector("#creditos");

  function getCreditos() {
    return Number(localStorage.getItem("creditos") || 0);
  }

  function setCreditos(v) {
    localStorage.setItem("creditos", v);
    atualizarCreditos();
  }

  function atualizarCreditos() {
    if (creditosSpan) creditosSpan.textContent = getCreditos();
  }

  atualizarCreditos();

  // ========================= LOCALSTORAGE AGENDAMENTOS =========================
  let aulasAgendadas = JSON.parse(localStorage.getItem("aulasAgendadas")) || [];
  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};
  let tutorAtual = null;
  let horarioSelecionado = null;

  // ========================= FILTRO DE TUTORES =========================
  const searchInput = document.getElementById("area");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const valor = this.value.toLowerCase();
      document.querySelectorAll(".tutor-card").forEach(card => {
        const area = card.getAttribute("data-area") || "";
        card.style.display = area.toLowerCase().includes(valor) ? "block" : "none";
      });
    });
  }

  // ========================= CARROSSEL =========================
  const track = document.getElementById("carouselTrack");
  const leftBtn = document.getElementById("carouselLeft");
  const rightBtn = document.getElementById("carouselRight");
  let currentIndex = 0;

  function calcVisibleCount() {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function updateCarouselPosition() {
    const cards = [...track.children];
    if (!cards.length) return;

    const visible = calcVisibleCount();
    const gap = parseFloat(getComputedStyle(track).gap) || 18;
    const cardWidth = cards[0].getBoundingClientRect().width + gap;

    const maxIndex = Math.max(0, cards.length - visible);

    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
  }

  leftBtn?.addEventListener("click", () => { currentIndex--; updateCarouselPosition(); });
  rightBtn?.addEventListener("click", () => { currentIndex++; updateCarouselPosition(); });
  window.addEventListener("resize", updateCarouselPosition);
  updateCarouselPosition();

  // ========================= CARREGAR AULAS PUBLICADAS =========================
  function carregarAulasPublicadas() {
    const aulasPublicadas = JSON.parse(localStorage.getItem("aulasPublicadas")) || [];

    aulasPublicadas.forEach(aula => {
      const col = document.createElement("div");
      col.className = "col-card";

      col.innerHTML = `
        <div class="tutor-card slide-up"
          data-area="${aula.categoria || aula.assunto}"
          data-horarios='${JSON.stringify(aula.horarios || [])}'
          data-nome="${aula.nomeTutor}">
          <h5>${aula.nomeTutor}</h5>
          <p>${aula.assunto}</p>
          <p>${aula.categoria || aula.assunto}</p>
          <p>⭐ ⭐ ⭐</p>
          <button class="btn btn-agendar">Agendar</button>
        </div>
      `;

      track.appendChild(col);
    });

    attachAgendarHandlers();
    updateCarouselPosition();
  }

  carregarAulasPublicadas();

  // ========================= AGENDA =========================
  function attachAgendarHandlers() {
    document.querySelectorAll(".btn-agendar").forEach(btn => {
      btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll(".btn-agendar").forEach(btn => {
      btn.addEventListener("click", onAgendarClick);
    });
  }

  function onAgendarClick(e) {
    if (getCreditos() <= 0) {
      new bootstrap.Modal(document.getElementById("modalCreditosEsgotados")).show();
      return;
    }

    const card = e.target.closest(".tutor-card");
    tutorAtual = card?.getAttribute("data-nome");
    horarioSelecionado = null;

    const horariosCard = JSON.parse(card.getAttribute("data-horarios") || "[]");

    document.querySelectorAll(".horario-btn").forEach(btn => {
      const hora = btn.textContent.trim();
      btn.style.display = (!horariosCard.length || horariosCard.includes(hora)) ? "inline-block" : "none";
      btn.classList.remove("active");
      btn.disabled = false;
    });

    document.getElementById("tutorNome").textContent = tutorAtual;

    atualizarHorariosBloqueados();

    new bootstrap.Modal(document.getElementById("agendarModal")).show();
  }

  document.querySelectorAll(".horario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      horarioSelecionado = btn.textContent.trim();
    });
  });

  function atualizarHorariosBloqueados() {
    const ocupados = aulasAgendadas.filter(a => a.tutor === tutorAtual).map(a => a.horario);

    document.querySelectorAll(".horario-btn").forEach(btn => {
      const hora = btn.textContent.trim();
      if (ocupados.includes(hora)) {
        btn.classList.add("ocupado");
        btn.disabled = true;
      }
    });
  }

  // ========================= CONFIRMAR =========================
  const btnConfirmar = document.getElementById("btnConfirmar");

  btnConfirmar.addEventListener("click", () => {
    const modalAgendar = bootstrap.Modal.getInstance(document.getElementById("agendarModal"));

    if (!horarioSelecionado) {
      modalAgendar?.hide();
      new bootstrap.Modal(document.getElementById("modalSelecioneHorario")).show();
      return;
    }

    if (getCreditos() <= 0) {
      modalAgendar?.hide();
      new bootstrap.Modal(document.getElementById("modalCreditosEsgotados")).show();
      return;
    }

    // grava agendamento
    aulasAgendadas.push({
      tutor: tutorAtual,
      horario: horarioSelecionado
    });

    localStorage.setItem("aulasAgendadas", JSON.stringify(aulasAgendadas));

    // remove 1 crédito
    setCreditos(getCreditos() - 1);

    document.getElementById("confirmacaoHorario").innerText =
      `Seu horário foi agendado para ${horarioSelecionado}.`;

    modalAgendar?.hide();
    new bootstrap.Modal(document.getElementById("modalAgendado")).show();
  });

});

