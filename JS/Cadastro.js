document.addEventListener("DOMContentLoaded", function () {
    // elementos principais
    const profileWrapper = document.querySelector('.gradient-bg'); // bloco do formulário
    const escolhaWrapper = document.querySelector('.tela-escolha-bg'); // bloco escolha
    const nomeSpan = document.getElementById('nomeUsuario');

    const nome = document.getElementById("nome");
    const aprender = document.getElementById("aprender");
    const ensinar = document.getElementById("ensinar");
    const salvarBtn = document.getElementById("salvarBtn");

    const creditModalEl = document.getElementById('creditModal');
    const creditBadge = document.getElementById("creditos");

    let creditos = 0;

    // 🔄 SEMPRE COMEÇA NA TELA DO FORMULÁRIO
    if (profileWrapper) {
        profileWrapper.classList.remove('d-none');
        profileWrapper.classList.add('d-flex');
    }
    if (escolhaWrapper) {
        escolhaWrapper.style.display = 'none';
        escolhaWrapper.classList.add('d-none');
    }

    // Função para mostrar a tela de escolha
    function mostrarEscolha() {
        // atualiza o nome no título
        const n = localStorage.getItem("nomeUsuario") || "Usuário";
        if (nomeSpan) nomeSpan.textContent = n;

        // esconde formulário e mostra escolha
        if (profileWrapper) profileWrapper.classList.add('d-none');
        if (escolhaWrapper) {
            escolhaWrapper.style.display = '';
            escolhaWrapper.classList.remove('d-none');
            escolhaWrapper.classList.add('d-flex');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Botão salvar
    if (salvarBtn) {
        salvarBtn.addEventListener("click", function () {
            const campos = [nome, aprender, ensinar];
            let vazio = false;

            // limpa erros anteriores
            campos.forEach(c => c?.classList.remove("is-invalid"));

            // valida
            campos.forEach(c => {
                if (!c || c.value.trim() === "") {
                    c.classList.add("is-invalid");
                    vazio = true;
                }
            });

            if (vazio) {
                const primeiro = campos.find(c => c?.classList.contains("is-invalid"));
                if (primeiro) primeiro.focus();
                return;
            }

            // salva nome e créditos
            const nomeValor = nome.value.trim();
            localStorage.setItem("nomeUsuario", nomeValor);

            creditos = 5;
            localStorage.setItem("creditos", String(creditos));
            if (creditBadge) creditBadge.textContent = creditos;

            // mostra modal (caso exista)
            if (creditModalEl) {
                const modal = new bootstrap.Modal(creditModalEl);
                modal.show();

                creditModalEl.addEventListener('hidden.bs.modal', function handler() {
                    mostrarEscolha();
                    creditModalEl.removeEventListener('hidden.bs.modal', handler);
                });

            } else {
                mostrarEscolha();
            }
        });
    }

    // remove erro ao digitar
    ["nome", "aprender", "ensinar"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", function () {
                this.classList.remove("is-invalid");
            });
        }
    });
});
