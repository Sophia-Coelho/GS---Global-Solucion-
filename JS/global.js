function mostrarModalComContagem(segundos, mensagem, destino) {
  // Cria modal
  const modal = document.createElement("div");
  modal.id = "modalBloqueio";
  modal.style.cssText = `
    position: fixed; z-index: 9999; top:0; left:0; width:100%; height:100%;
    background-color: rgba(0,0,0,0.6); display:flex; justify-content:center; align-items:center;
  `;
  modal.innerHTML = `
    <div style="background:#fff; padding:2rem; border-radius:10px; text-align:center; max-width:400px; width:90%; font-family:sans-serif;">
      <h2 style="margin-bottom:1rem; color:#d9534f;">Atenção!</h2>
      <p style="margin-bottom:1rem;">${mensagem}</p>
      <p id="contadorModal" style="font-weight:bold; font-size:1.2rem; margin-top:1rem;">Redirecionando em ${segundos} segundos...</p>
    </div>
  `;
  document.body.appendChild(modal);

  // Atualiza contagem regressiva a cada segundo
  const contadorEl = document.getElementById("contadorModal");
  let restante = segundos;
  const intervalo = setInterval(() => {
    restante--;
    contadorEl.textContent = `Redirecionando em ${restante} segundos...`;
    if (restante <= 0) {
      clearInterval(intervalo);
      window.location.href = destino;
    }
  }, 1000);
}

// ==========================
// Bloqueio universal das páginas protegidas
// ==========================
const paginasProtegidas = ["tutor.html", "ofereca_aula.html", "agendamentos.html"];
let arquivoAtual = window.location.pathname.split("/").pop().split("?")[0].toLowerCase();
if (arquivoAtual === "") arquivoAtual = "index.html";

const nome = localStorage.getItem("nomeUsuario");

if (paginasProtegidas.includes(arquivoAtual) && !nome) {
  document.documentElement.style.display = "none";
  mostrarModalComContagem(3, "Você não tem acesso a esta página, estou te redirecionando para a tela de cadastro.", "/Cadastro.html");
  document.documentElement.style.display = "block";
}

// ==========================
// Sistema de Créditos
// ==========================
const CreditSystem = {
  key: 'creditos',

  get() {
    const value = Number(localStorage.getItem(this.key));
    return Number.isFinite(value) ? value : 0;
  },

  set(value) {
    const novoValor = Math.max(0, Number(value));
    localStorage.setItem(this.key, String(novoValor));
    this.updateBadge();
    return novoValor;
  },

  add(amount) { return this.set(this.get() + Number(amount)); },
  remove(amount) { return this.set(this.get() - Number(amount)); },

  updateBadge() {
    const valor = this.get();
    const elementos = [
      ...document.querySelectorAll('#creditos'),
      ...document.querySelectorAll('#contadorCreditos')
    ];
    elementos.forEach(el => el.textContent = valor);
  },

  init() { this.updateBadge(); }
};

window.CreditSystem = CreditSystem;
window.adicionarCreditos = qtd => CreditSystem.add(qtd);
window.removerCreditos = qtd => CreditSystem.remove(qtd);
window.setCreditos = qtd => CreditSystem.set(qtd);
window.getCreditos = () => CreditSystem.get();
document.addEventListener("DOMContentLoaded", () => CreditSystem.init());

// ==========================
// Função para botões de navegação com login
// ==========================
function verificarLogin(destino) {
  const nome = localStorage.getItem("nomeUsuario");

  if (!nome) {
    const modalExistente = document.getElementById("modalBloqueio");
    if (!modalExistente) {
      mostrarModalComContagem(4, "Você não tem acesso a esta página.", "/Cadastro.html");
    }
    return;
  }

  window.location.href = destino;
}



// ============================================================
// 🚀  NOVO BLOCO ADICIONADO (sem alterar nada do original)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {

  // ========= 1. DESTACAR LINK ATUAL =========
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("href") === currentPath) {
          link.classList.add("active-page");
      }
  });

  // ========= 2. ALTERAR "Cadastro" → "Perfil" =========
  const cadastroNav = document.getElementById("cadastroNav");
  const usuario = localStorage.getItem("nomeUsuario");

  if (cadastroNav) {
      if (usuario) {
          cadastroNav.textContent = "Perfil";
          cadastroNav.href = "/agendamentos.html";
      } else {
          cadastroNav.textContent = "Cadastro";
          cadastroNav.href = "/Cadastro.html";
      }
  }

  // ========= 3. MOSTRAR NOME DO USUÁRIO EM QUALQUER TELA =========
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay && usuario) {
      userNameDisplay.textContent = usuario;
  }

});
