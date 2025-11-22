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

    // Inicializa créditos
    if (!localStorage.getItem("creditos")) {
        localStorage.setItem("creditos", "0");
    }

    // Atualiza badge de créditos
    function atualizarBadge() {
        const creditos = Number(localStorage.getItem("creditos") || 0);
        if (creditBadge) creditBadge.textContent = creditos;
    }

    // Mostra alerta de 0 coins se necessário
    function verificarZeroCredits() {
        const creditos = Number(localStorage.getItem("creditos") || 0);
        if (creditos <= 0) {
            alert(
                "Se você gostou da experiência e quer continuar consumindo os conteúdos,\n" +
                "pode conseguir mais Skill Coins oferecendo aulas!"
            );
        }
    }

    atualizarBadge();
    verificarZeroCredits();

    // Mostra tela de escolha
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

    // Se já cadastrado, mostra tela de escolha
    const jaCadastrado = !!localStorage.getItem("nomeUsuario");
    if (jaCadastrado) {
        if (profileWrapper) profileWrapper.classList.add('d-none');
        mostrarEscolha();
    }

    // Salvar cadastro
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

            const usuarioExistiaAntes = !!localStorage.getItem("nomeUsuario");

            // Salva nome
            localStorage.setItem("nomeUsuario", nome.value.trim());

            // Só adiciona 5 créditos se nunca existiu antes
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

    // Remove erro ao digitar
    ["nome", "aprender", "ensinar"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", () => el.classList.remove("is-invalid"));
    });

    // Funções globais para adicionar/remover créditos
    window.adicionarCreditos = qtd => {
        const creditos = Number(localStorage.getItem("creditos") || 0) + qtd;
        localStorage.setItem("creditos", creditos);
        atualizarBadge();
    };

    window.removerCreditos = qtd => {
        let creditos = Number(localStorage.getItem("creditos") || 0) - qtd;
        if (creditos < 0) creditos = 0;
        localStorage.setItem("creditos", creditos);
        atualizarBadge();
        verificarZeroCredits(); // <<-- chama o alert imediatamente ao zerar
    };

});
