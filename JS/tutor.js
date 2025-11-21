document.addEventListener("DOMContentLoaded", () => {

  // ========================= LOTTIES (CORRIGIDOS E SINCRONIZADOS) =========================
  function playLottie(container, animRef, path, speed = 1, onComplete = null) {
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

    anim.setSpeed(speed);

    if (onComplete) {
      anim.addEventListener("complete", onComplete);
    }

    return anim;
  }

  let animCreditos = null;
  let animSelecione = null;
  let animSucesso = null;

  // Modal créditos esgotados
  document.getElementById("modalCreditosEsgotados").addEventListener("shown.bs.modal", () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalCreditosEsgotados"));

    animCreditos = playLottie(
      document.getElementById("lottieCreditos"),
      animCreditos,
      "/assets/lottie/sad.json",
      1,
      () => modal?.hide()
    );
  });

  // Modal selecione horário (abre → anima → fecha → retorna ao agendar)
  document.getElementById("modalSelecioneHorario").addEventListener("shown.bs.modal", () => {
    const modalSelec = bootstrap.Modal.getInstance(document.getElementById("modalSelecioneHorario"));

    animSelecione = playLottie(
      document.getElementById("lottieSelecione"),
      animSelecione,
      "/assets/lottie/clock.json",
      0.55,
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
      1,
      () => modalOk?.hide()
    );
  });

  // ========================= CONTROLE DE CRÉDITOS =========================
  function atualizarCreditos() {
    const c = CreditSystem.get();
    const span = document.querySelector("#creditos");
    if (span) span.textContent = c;
  }

  atualizarCreditos();

  // ========================= LOCALSTORAGE =========================
  // AGORA ESTÁ CORRETO ⬇⬇⬇
  let aulasAgendadas = JSON.parse(localStorage.getItem("aulasAgendadas")) || [];

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

  // ========================= CLICOU EM AGENDAR =========================
  document.querySelectorAll(".btn-agendar").forEach((btn) => {
    btn.addEventListener("click", function () {

      // Créditos esgotados
      if (creditos <= 0) {
        new bootstrap.Modal(document.getElementById("modalCreditosEsgotados")).show();
        return;
      }

      tutorAtual = this.parentElement.querySelector("h5").textContent;

      if (!agendamentos[tutorAtual]) {
        agendamentos[tutorAtual] = [];
      }

      // Reset
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

  // ========================= BLOQUEAR HORÁRIOS =========================
  function atualizarHorariosBloqueados() {
    const ocupados = aulasAgendadas
      .filter(a => a.tutor === tutorAtual)
      .map(a => a.horario);

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

  // ========================= CONFIRMAR =========================
  const btnConfirmar = document.getElementById("btnConfirmar");
  btnConfirmar.addEventListener("click", () => {

    const modalAgendar = bootstrap.Modal.getInstance(document.getElementById("agendarModal"));

    if (!horarioSelecionado) {
      modalAgendar?.hide();

      const modal = new bootstrap.Modal(document.getElementById("modalSelecioneHorario"));
      modal.show();

      animSelecione = playLottie(
        document.getElementById("lottieSelecione"),
        animSelecione,
        "/assets/lottie/clock.json",
        1
      );
      return;
    }

    // Sem créditos
    if (creditos <= 0) {
      modalAgendar?.hide();

      const modal = new bootstrap.Modal(document.getElementById("modalCreditosEsgotados"));
      modal.show();

      animCreditos = playLottie(
        document.getElementById("lottieCreditos"),
        animCreditos,
        "/assets/lottie/sad.json",
        1
      );
      return;
    }

    // Registrar horário
    creditos--;
    atualizarCreditos();

    // SALVAR FORMATADO
    aulasAgendadas.push({
      tutor: tutorAtual,
      horario: horarioSelecionado,
      categoria: tutorAtual,
      descricao: `Aula com ${tutorAtual}`
    });

    localStorage.setItem("aulasAgendadas", JSON.stringify(aulasAgendadas));

    document.getElementById("confirmacaoHorario").innerText =
      `Seu horário foi agendado para ${horarioSelecionado}.`;

    modalAgendar?.hide();

    const modal = new bootstrap.Modal(document.getElementById("modalAgendado"));
    modal.show();

    animSucesso = playLottie(
      document.getElementById("checkLottie"),
      animSucesso,
      "/assets/lottie/success.json",
      1
    );
  });

});
