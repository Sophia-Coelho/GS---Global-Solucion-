document.addEventListener("DOMContentLoaded", function () {
    // elementos principais
    const profileWrapper = document.querySelector('.gradient-bg'); // bloco do formulário
    const escolhaWrapper = document.querySelector('.tela-escolha-bg'); // bloco da escolha
    const nomeSpan = document.getElementById('nomeUsuario');

    const nome = document.getElementById("nome");
    const aprender = document.getElementById("aprender");
    const ensinar = document.getElementById("ensinar");
    const salvarBtn = document.getElementById("salvarBtn");
    const creditModalEl = document.getElementById('creditModal');
    const creditBadge = document.getElementById("creditos");

let creditos = 0;

// Função para mostrar a tela de escolha e preencher o nome
    function mostrarEscolha() {
    // atualiza o nome no título
    const n = localStorage.getItem("nomeUsuario") || "Usuário";
    if (nomeSpan) nomeSpan.textContent = n;

    // esconde formulario / mostra escolha
    if (profileWrapper) profileWrapper.classList.add('d-none');
    if (escolhaWrapper) {
      // remove display:none (CSS) e usa utilitários bootstrap para exibir
        escolhaWrapper.style.display = '';
        escolhaWrapper.classList.remove('d-none');
        escolhaWrapper.classList.add('d-flex');
    }
    // opcional: scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Se já tem nome salvo, mostrar a tela de escolha direto
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (nomeSalvo && nomeSalvo.trim() !== "") {
    // atualiza créditos se estiver salvo (opcional)
    const savedCredits = localStorage.getItem("creditos");
    if (savedCredits) {
        creditos = Number(savedCredits) || 0;
        if (creditBadge) creditBadge.textContent = creditos;
    }
    mostrarEscolha();
    } else {
    // garante que a tela de escolha esteja oculta (por segurança)
    if (escolhaWrapper) {
        escolhaWrapper.style.display = 'none';
        escolhaWrapper.classList.add('d-none');
    }
    if (profileWrapper) {
        profileWrapper.classList.remove('d-none');
        profileWrapper.classList.add('d-flex');
    }
}

// Handler do botão salvar
    if (salvarBtn) {
    salvarBtn.addEventListener("click", function () {
        const campos = [nome, aprender, ensinar];
        let vazio = false;

    // limpa erros antigos
    campos.forEach(c => {
        if (c) c.classList.remove("is-invalid");
    });

    // valida
    campos.forEach(c => {
        if (!c || c.value.trim() === "") {
            c.classList.add("is-invalid");
            vazio = true;
        }
    });

    if (vazio) {
        // foca no primeiro inválido
        const primeiro = campos.find(c => c && c.classList.contains("is-invalid"));
        if (primeiro) primeiro.focus();
        return;
    }

// salva nome e créditos
    const nomeValor = nome.value.trim();
    localStorage.setItem("nomeUsuario", nomeValor);

    creditos = 5;
    localStorage.setItem("creditos", String(creditos));
    if (creditBadge) creditBadge.textContent = creditos;

// mostra modal Bootstrap
    if (creditModalEl) {
        const modal = new bootstrap.Modal(creditModalEl);
        modal.show();

// ao fechar o modal mostramos a tela de escolha
    creditModalEl.addEventListener('hidden.bs.modal', function handler() {
        mostrarEscolha();
    // remove listener para não replicar
        creditModalEl.removeEventListener('hidden.bs.modal', handler);
    });
    } else {
        // sem modal, mostra direto
        mostrarEscolha();
    }
    });
}

// remove erro quando digita
    ["nome", "aprender", "ensinar"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("input", function () {
        this.classList.remove("is-invalid");
    });
    }
});
});
