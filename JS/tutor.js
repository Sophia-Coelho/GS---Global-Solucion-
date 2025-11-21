// JS/tutor.js
document.addEventListener("DOMContentLoaded", () => {

  // ========================= LOTTIES (DURAÇÕES IGUALADAS) =========================
  // Todas as animações vão durar exatamente 1.5s — mesma duração do success.json
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

    // Quando a Lottie carregar, recalculamos automaticamente a velocidade
    anim.addEventListener("DOMLoaded", () => {
      const frames = anim.totalFrames;
      const fps = anim.frameRate;

      const durOriginal = frames / fps;
      const novaSpeed = durOriginal / DURACAO_PADRAO;

      anim.setSpeed(novaSpeed);
    });

    if (onComplete) {
      anim.addEventListener("complete", onComplete);
    }

    return anim;
  }

  let animCreditos = null;
  let animSelecione = null;
  let animSucesso = null;

  // ========== MODAIS FECHAM SOMENTE APÓS A LOTTIE TERMINAR ==========

  // Modal créditos esgotados
  document.getElementById("modalCreditosEsgotados").addEventListener("shown.bs.modal", () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalCreditosEsgotados"));

    animCreditos = playLottie(
      document.getElementById("lottieCreditos"),
      animCreditos,
      "/assets/lottie/sad.json",
      () => modal?.hide()
    );
  });

  // Modal selecione horário
  document.getElementById("modalSelecioneHorario").addEventListener("shown.bs.modal", () => {
    const modalSelec = bootstrap.Modal.getInstance(document.getElementById("modalSelecioneHorario"));

    animSelecione = playLottie(
      document.getElementById("lottieSelecione"),
      animSelecione,
      "/assets/lottie/clock.json",
      () => {
        modalSelec.hide();
        new bootstrap.Modal(document.getElementById("agendarModal")).show();
      }
    );
  });

  // Modal agendado (sucesso)
  document.getElementById("modalAgendado").addEventListener("shown.bs.modal", () => {
    const modalOk = bootstrap.Modal.getInstance(document.getElementById("modalAgendado"));

    animSucesso = playLottie(
      document.getElementById("checkLottie"),
      animSucesso,
      "/assets/lottie/success.json",
      () => modalOk?.hide()
    );
  });

  // ========================= CONTROLE DE CRÉDITOS =========================
  let creditos = 5;
  const creditBox = document.querySelector(".credit-box");

  function atualizarCreditos() {
    creditBox.textContent = `CRÉDITOS DISPONÍVEIS: ${creditos}`;
  }

  atualizarCreditos();

  // ========================= LOCALSTORAGE =========================
  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || {};
  let tutorAtual = null;
  let horarioSelecionado = null;

  // ========================= FILTRO =========================
  const searchInput = document.getElementById("area");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const value = this.value.toLowerCase();
      document.querySelectorAll(".tutor-card").forEach((card) => {
        const area = card.getAttribute("data-area") || "";
        card.style.display = area.includes(value) ? "block" : "none";
      });
    });
  }

  // ========================= BOTÃO AGENDAR =========================
  document.querySelectorAll(".btn-agendar").forEach((btn) => {
    btn.addEventListener("click", async function () {

      if (creditos <= 0) {
        new bootstrap.Modal(document.getElementById("modalCreditosEsgotados")).show();
        return;
      }

      tutorAtual = this.parentElement.querySelector("h5").textContent;

      if (!agendamentos[tutorAtual]) {
        agendamentos[tutorAtual] = [];
      }

      horarioSelecionado = null;
      document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("active"));

      document.getElementById("tutorNome").textContent = tutorAtual;

      atualizarHorariosBloqueados();

      new bootstrap.Modal(document.getElementById("agendarModal")).show();
    });
  });

  // ========================= MARCAR HORÁRIO =========================
  document.querySelectorAll(".horario-btn").forEach((botao) => {
    botao.addEventListener("click", function () {
      if (this.disabled) return;

      document.querySelectorAll(".horario-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      horarioSelecionado = this.textContent.trim();
    });
  });

  // ========================= BLOQUEIOS =========================
  function atualizarHorariosBloqueados() {
    const ocupados = agendamentos[tutorAtual] || [];

    document.querySelectorAll(".horario-btn").forEach(btn => {
      const hora = btn.textContent.trim();

      if (ocupados.includes(hora)) {
        btn.classList.add("ocupado");
        btn.disabled = true;
      } else {
        btn.classList.remove("ocupado");
        btn.disabled = false;
      }
    });
  }

  const btnConfirmar = document.getElementById("btnConfirmar");

  // ========================= CONFIRMAR AGENDAMENTO =========================
  btnConfirmar.addEventListener("click", async () => {
    const modalAgendar = bootstrap.Modal.getInstance(document.getElementById("agendarModal"));

    if (!horarioSelecionado) {
      modalAgendar?.hide();
      new bootstrap.Modal(document.getElementById("modalSelecioneHorario")).show();
      return;
    }

    if (creditos <= 0) {
      modalAgendar?.hide();
      new bootstrap.Modal(document.getElementById("modalCreditosEsgotados")).show();
      return;
    }

    creditos--;
    atualizarCreditos();

    if (!agendamentos[tutorAtual]) agendamentos[tutorAtual] = [];

    if (!agendamentos[tutorAtual].includes(horarioSelecionado)) {
      agendamentos[tutorAtual].push(horarioSelecionado);
      localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    }

    document.getElementById("confirmacaoHorario").innerText =
      `Seu horário foi agendado para ${horarioSelecionado}.`;

    modalAgendar?.hide();

    new bootstrap.Modal(document.getElementById("modalAgendado")).show();
  });

});
