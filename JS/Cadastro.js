document.addEventListener("DOMContentLoaded", function () {

    const profileWrapper = document.querySelector('.gradient-bg'); 
    const escolhaWrapper = document.querySelector('.tela-escolha-bg'); 
    const nomeSpan = document.getElementById('nomeUsuario');

    const nome = document.getElementById("nome");
    const aprender = document.getElementById("aprender");
    const ensinar = document.getElementById("ensinar");
    const salvarBtn = document.getElementById("salvarBtn");

    const creditModalEl = document.getElementById('creditModal');
    const creditBadge = document.getElementById("creditos");

    // =========================
    // Função para atualizar badge e disparar alert se 0
    // =========================
    function atualizarBadge() {
        const creditos = Number(localStorage.getItem("creditos") || 0);
        if (creditBadge) creditBadge.textContent = creditos;

        if (creditos <= 0) {
            alert("Você ficou sem Skills Coins! Para continuar aprendendo, ofereça aulas.");
        }
    }

    // =========================
    // Funções para adicionar/remover créditos
    // =========================
    function adicionarCreditos(qtd) {
        let creditos = Number(localStorage.getItem("creditos") || 0);
        creditos += qtd;
        localStorage.setItem("creditos", creditos);
        atualizarBadge();
    }

    function removerCreditos(qtd) {
        let creditos = Number(localStorage.getItem("creditos") || 0);
        creditos = Math.max(0, creditos - qtd);
        localStorage.setItem("creditos", creditos);
        atualizarBadge();
    }

    // Inicializa créditos
    if (localStorage.getItem("creditos") === null) {
        localStorage.setItem("creditos", "0");
    }
    atualizarBadge();

    // =========================
    // Função para mostrar tela de escolha
    // =========================
    function mostrarEscolha() {
        const n = localStorage.getItem("nomeUsuario") || "Usuário";
        if (nomeSpan) nomeSpan.textContent = n;

        if (profileWrapper) profileWrapper.classList.add('d-none');
        if (escolhaWrapper) {
            escolhaWrapper.style.display = '';
            escolhaWrapper.classList.remove('d-none');
            escolhaWrapper.classList.add('d-flex');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Verifica se já existe cadastro
    const jaCadastrado = !!localStorage.getItem("nomeUsuario");

    if (jaCadastrado) {
        if (profileWrapper) profileWrapper.classList.add('d-none');
        mostrarEscolha();
    }

    // =========================
    // Salvar cadastro
    // =========================
    if (salvarBtn) {
        salvarBtn.addEventListener("click", function () {

            const campos = [nome, aprender, ensinar];
            let vazio = false;

            campos.forEach(c => c?.classList.remove("is-invalid"));

            campos.forEach(c => {
                if (!c || c.value.trim() === "") {
                    c.classList.add("is-invalid");
                    vazio = true;
                }
            });

            if (vazio) {
                const primeiro = campos.find(c => c.classList.contains("is-invalid"));
                primeiro?.focus();
                return;
            }

            // Verifica se o usuário existia antes
            const usuarioExistiaAntes = !!localStorage.getItem("nomeUsuario");

            // Salva nome do usuário
            localStorage.setItem("nomeUsuario", nome.value.trim());

            // =========================
            // Só adiciona 5 créditos se nunca existiu antes
            // =========================
            if (!usuarioExistiaAntes && localStorage.getItem("creditos") === "0") {
                localStorage.setItem("creditos", "5");
                if (creditModalEl) {
                    const modal = new bootstrap.Modal(creditModalEl);
                    modal.show();
                }
            }

            atualizarBadge();
            mostrarEscolha();
        });
    }

    // Remove aviso de erro ao digitar
    ["nome", "aprender", "ensinar"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => el.classList.remove("is-invalid"));
    });

    // =========================
    // Disponibiliza funções globalmente
    // =========================
    window.adicionarCreditos = adicionarCreditos;
    window.removerCreditos = removerCreditos;

});
