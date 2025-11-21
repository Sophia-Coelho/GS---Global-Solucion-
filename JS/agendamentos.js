function excluirAulaAgendada(index) {
  if (confirm("Tem certeza que deseja cancelar esta aula?")) {
    const aulasAgendadas =
      JSON.parse(localStorage.getItem("aulasAgendadas")) || [];
    aulasAgendadas.splice(index, 1);
    localStorage.setItem("aulasAgendadas", JSON.stringify(aulasAgendadas));

    // --- AQUI: PERDE 1 CRÉDITO IGUAL A AULA PUBLICADA ---
    removerCreditos(1);

    agendarAula();

    alert("Você perdeu um crédito!");
  }
}

function excluirAulaPublicada(index) {
  if (confirm("Tem certeza que deseja excluir esta aula publicada?")) {
    const aulasPublicadas =
      JSON.parse(localStorage.getItem("aulasPublicadas")) || [];
    aulasPublicadas.splice(index, 1);
    localStorage.setItem("aulasPublicadas", JSON.stringify(aulasPublicadas));

    removerCreditos(1);

    carregarAulas();

    alert("Você perdeu um crédito!");
  }
}

function agendarAula() {
  const aulasAgendadas =
    JSON.parse(localStorage.getItem("aulasAgendadas")) || [];
  const agendamentoAulasEl = document.getElementById("agendamentoAulas");

  if (!agendamentoAulasEl) return;

  if (aulasAgendadas.length === 0) {
    agendamentoAulasEl.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <i class="bi bi-info-circle"></i> Você ainda não agendou nenhuma aula
      </div>`;
    return;
  }

  agendamentoAulasEl.innerHTML = "";

  aulasAgendadas.forEach((aula, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5 class="text-primary mb-2">
            <i class="bi bi-person-circle"></i> ${aula.tutor || "Tutor"}
          </h5>
          ${
            aula.descricao
              ? `<p class="mb-1 text-muted">${aula.descricao}</p>`
              : ""
          }
          ${
            aula.categoria
              ? `<span class="badge bg-secondary mb-2">${aula.categoria}</span>`
              : ""
          }
          <p class="mb-0">
            <strong><i class="bi bi-clock"></i> Horários:</strong> ${
              aula.horario || "Não definido"
            }
          </p>
          ${
            aula.dataAgendamento
              ? `<small class="text-muted">Agendado em: ${aula.dataAgendamento}</small>`
              : ""
          }
          <div class="mt-2">
            <button class="btn btn-danger btn-sm" onclick="excluirAulaAgendada(${index})">
              <i class="bi bi-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>`;
    agendamentoAulasEl.appendChild(div);
  });
}

function carregarAulas() {
  const aulasPublicadas =
    JSON.parse(localStorage.getItem("aulasPublicadas")) || [];
  const aulasPublicadasEl = document.getElementById("aulasPublicadas");
  aulasPublicadasEl.innerHTML = "";

  if (aulasPublicadas.length === 0) {
    aulasPublicadasEl.innerHTML = `
      <div class="alert alert-warning" role="alert">
        <i class="bi bi-info-circle"></i> Você ainda não publicou nenhuma aula
      </div>`;
    return;
  }

  aulasPublicadas.forEach((aula, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="text-danger mb-2">${aula.categoria}</h5>
          <p class="mb-1 text-muted">${aula.descricao}</p> 
          <p class="mb-0">
            <strong><i class="bi bi-clock"></i> Horários:</strong>
            ${aula.horarios ? aula.horarios.join(" | ") : "Não definido"}
          </p>

          <button class="btn btn-danger btn-sm mt-2" onclick="excluirAulaPublicada(${index})">
            <i class="bi bi-trash"></i> Excluir
          </button>
        </div>
      </div>`;
    aulasPublicadasEl.appendChild(div);
  });
}

agendarAula();
carregarAulas();
