// JS/tutor.js — versão corrigida e robusta
document.addEventListener("DOMContentLoaded", () => {

  const container = document.querySelector('.tutor-grid');
  if (!container) return;

  const aulasPublicadas = JSON.parse(localStorage.getItem("aulasPublicadas")) || [];

  aulasPublicadas.forEach(aula => {
    const card = gerarCardAula(aula);
    container.appendChild(card);
  });

  // container principal (onde há os cards estáticos e onde adicionaremos os dinâmicos)
  const track = document.getElementById("tutorGrid");

  // helper seguro para obter elemento e só anexar listener se existir
  function onIfExists(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
    return el;
  }

  // ========================= LOTTIES (DURAÇÕES IGUALADAS) =========================
  const DURACAO_PADRAO = 1.5;

  function playLottie(container, animRef, path, onComplete = null) {
    if (!container) return null;
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
      try {
        const frames = anim.totalFrames;
        const fps = anim.frameRate || 60;
        const duracaoOriginal = frames / fps;
        const novaVelocidade = duracaoOriginal / DURACAO_PADRAO;
        if (Number.isFinite(novaVelocidade) && novaVelocidade > 0) anim.setSpeed(novaVelocidade);
      } catch (e) {}
    });
    if (onComplete) anim.addEventListener("complete", onComplete);
    return anim;
  }

  let animCreditos = null;
  let animSelecione = null;
  let animSucesso = null;

  // só adiciona handlers se os elementos existirem (evita erros)
  onIfExists("modalCreditosEsgotados", "shown.bs.modal", () => {
    animCreditos = playLottie(document.getElementById("lottieCreditos"), animCreditos, "/assets/lottie/sad.json");
  });
  onIfExists("modalSelecioneHorario", "shown.bs.modal", () => {
    animSelecione = playLottie(document.getElementById("lottieSelecione"), animSelecione, "/assets/lottie/clock.json");
  });
  onIfExists("modalAgendado", "shown.bs.modal", () => {
    animSucesso = playLottie(document.getElementById("checkLottie"), animSucesso, "/assets/lottie/success.json");
  });

 // ========================= CONTROLE DE CRÉDITOS (corrigido) =========================
// Sempre resetar créditos para 5 ao recarregar a página
localStorage.setItem("creditos", "5");

// Elemento correto no seu HTML
const creditosNumberEl = document.getElementById("creditosNumber");

// Funções utilitárias
function getCreditos() {
  return parseInt(localStorage.getItem("creditos")) || 0;
}

function setCreditos(v) {
  localStorage.setItem("creditos", String(v));
  atualizarCreditos();
}

function atualizarCreditos() {
  // atualiza o elemento do DOM que realmente existe
  if (creditosNumberEl) creditosNumberEl.textContent = String(getCreditos());
}

// inicializa exibição
atualizarCreditos();




function gerarCardAula(aula) {
    const card = document.createElement('div');
  card.classList.add('tutor-card');

  // atributos para popup e filtros
  card.dataset.area = aula.categoria || "geral";
  card.dataset.nome = aula.nomeTutor;
  card.dataset.descricao = aula.descricao;

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // CORREÇÃO FUNDAMENTAL — SEM ISSO HORÁRIOS NÃO APARECEM
  card.dataset.horarios = JSON.stringify(aula.horarios || []);
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // HTML interno — IDÊNTICO AO SEU CARD MODELO
  card.innerHTML = `
    <h5>${aula.nomeTutor}</h5>
    <p class="categoria-tutor">${aula.categoria}</p>
    <p class="descricao-tutor">${aula.assunto}</p>

    <div class="stars">⭐⭐⭐⭐</div>

    <button class="btn btn-agendar w-100 btn-agendar-dinamico">
      Agendar
    </button>

    <button class="btn btn-outline-primary w-100 mt-2 btn-descricao">
      Ver descrição
    </button>
  `;

  // Ações do botão de descrição (mesmo sistema usado nos outros cards)
  card.querySelector('.btn-descricao').addEventListener('click', () => {
    abrirModalDescricao(aula.nomeTutor, aula.assunto, aula.descricao);
  });

  // Ações do botão Agendar (idêntico aos outros)
  card.querySelector('.btn-agendar-dinamico').addEventListener('click', (e) => {
    abrirModalAgendamento(aula);
  });

  return card;
}



  
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
        const area = (card.getAttribute("data-area") || "");
        card.style.display = area.toLowerCase().includes(valor) ? "" : "none";
      });
    });
  }

  // ========================= FUNÇÕES DE HANDLERS =========================
  function attachDescricaoHandlers(root = document) {
    root.querySelectorAll(".btn-descricao").forEach(btn => {
      // remove listeners antigos (seguro) e adiciona novo
      btn.replaceWith(btn.cloneNode(true));
    });
    root.querySelectorAll(".btn-descricao").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const card = e.target.closest(".tutor-card");
        if (!card) return;
        const nome = card.dataset.nome || "Tutor";
        const descricao = card.dataset.descricao || "Sem descrição disponível.";
        const label = document.getElementById("descricaoModalLabel");
        const texto = document.getElementById("descricaoModalTexto");
        if (label) label.textContent = nome;
        if (texto) texto.textContent = descricao;
        const m = document.getElementById("descricaoModal");
        if (m) new bootstrap.Modal(m).show();
      });
    });
  }

  function attachAgendarHandlers(root = document) {
    root.querySelectorAll(".btn-agendar").forEach(btn => {
      btn.replaceWith(btn.cloneNode(true)); // remove duplicados de event listeners
    });
    root.querySelectorAll(".btn-agendar").forEach(btn => btn.addEventListener("click", onAgendarClick));
  }

  // ========================= CARREGAR AULAS DINÂMICAS (se houver) =========================
  function carregarAulasPublicadas() {
    const aulasPublicadas = JSON.parse(localStorage.getItem("aulasPublicadas")) || [];
    if (!track) return;
    aulasPublicadas.forEach(aula => {
      const col = document.createElement("div");
      col.className = "col-card";
      col.innerHTML = `
        <div class="tutor-card slide-up"
          data-area="${(aula.categoria || aula.assunto || '').replace(/"/g, '&quot;')}"
          data-horarios='${JSON.stringify(aula.horarios || [])}'
          data-nome="${(aula.nomeTutor || '').replace(/"/g, '&quot;')}"
          data-descricao="${(aula.descricao || 'Sem descrição disponível.').replace(/"/g, '&quot;')}">
          <h5>${aula.nomeTutor || 'Tutor'}</h5>
          <p><strong>${aula.assunto || ''}</strong></p>
          <p class="text-muted">${aula.categoria || ''}</p>
          <button class="btn btn-descricao btn-outline-secondary mt-2">Descrição</button>
          <button class="btn btn-agendar btn-primary mt-2">Agendar</button>
        </div>
      `;
      track.appendChild(col); // <<< importante: agora realmente anexa ao DOM
    });

    // attach handlers para novos elementos
    attachDescricaoHandlers(track);
    attachAgendarHandlers(track);
  }



  // ========================= AGENDA / HORÁRIOS =========================
  function onAgendarClick(e) {
    if (getCreditos() <= 0) {
      const m = document.getElementById("modalCreditosEsgotados");
      if (m) new bootstrap.Modal(m).show();
      return;
    }

    const card = e.target.closest(".tutor-card");
    if (!card) return;
    tutorAtual = card.getAttribute("data-nome") || card.querySelector("h5")?.textContent || "Tutor";
    horarioSelecionado = null;

    const horariosCard = JSON.parse(card.getAttribute("data-horarios") || "[]");

    // habilita/oculta botões de horário (se existirem)
    document.querySelectorAll(".horario-btn").forEach(btn => {
      const hora = btn.textContent.trim();
      btn.style.display = (!horariosCard.length || horariosCard.includes(hora)) ? "" : "none";
      btn.classList.remove("active");
      btn.disabled = false;
    });

    const tutorNomeSpan = document.getElementById("tutorNome");
    if (tutorNomeSpan) tutorNomeSpan.textContent = tutorAtual;

    atualizarHorariosBloqueados();

    const agendarModal = document.getElementById("agendarModal");
    if (agendarModal) new bootstrap.Modal(agendarModal).show();
  }

  // horário click
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
      } else {
        btn.classList.remove("ocupado");
        btn.disabled = false;
      }
    });
  }

  // confirmar agendamento (só se existir o botão)
  const btnConfirmar = document.getElementById("btnConfirmar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
      const modalAgendar = document.getElementById("agendarModal") ? bootstrap.Modal.getInstance(document.getElementById("agendarModal")) : null;

      if (!horarioSelecionado) {
        if (modalAgendar) modalAgendar.hide();
        const sel = document.getElementById("modalSelecioneHorario");
        if (sel) new bootstrap.Modal(sel).show();
        return;
      }

      if (getCreditos() <= 0) {
        if (modalAgendar) modalAgendar.hide();
        const m = document.getElementById("modalCreditosEsgotados");
        if (m) new bootstrap.Modal(m).show();
        return;
      }

      aulasAgendadas.push({ tutor: tutorAtual, horario: horarioSelecionado });
      localStorage.setItem("aulasAgendadas", JSON.stringify(aulasAgendadas));
      setCreditos(getCreditos() - 1);

      const conf = document.getElementById("confirmacaoHorario");
      if (conf) conf.innerText = `Aula com ${tutorAtual} agendada para ${horarioSelecionado}.`;

      const msg = document.getElementById("msgCreditoConsumido");
      if (msg) msg.style.display = "block";

      if (modalAgendar) modalAgendar.hide();
      const ag = document.getElementById("modalAgendado");
      if (ag) new bootstrap.Modal(ag).show();
    });
  }


  

  // finalmente: handlers para os cards estáticos presentes no HTML
  attachDescricaoHandlers(document);
  attachAgendarHandlers(document);

  // utility: se você tiver um carrossel posicionado, a função de updatePosition pode ficar aqui.
  // (deixei de fora por você pedir manutenção sem carousel)

}); // fim DOMContentLoaded
