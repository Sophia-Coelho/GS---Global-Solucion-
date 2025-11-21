// ofereca_aula.js

let horariosAulaSelecionados = [];

function setHorarioAula(element) {
  const horarioSelecionado = element.textContent.trim();
  const index = horariosAulaSelecionados.indexOf(horarioSelecionado);

  if (index > -1) {
    element.classList.remove('active'); // usar classe 'active' para o CSS
    horariosAulaSelecionados.splice(index, 1);
  } else {
    element.classList.add('active'); // usar classe 'active' para o CSS
    horariosAulaSelecionados.push(horarioSelecionado);
  }

  console.log('[ofereca_aula.js] horários:', horariosAulaSelecionados);
}

function publicarAula() {
  console.log('[ofereca_aula.js] publicarAula chamado');

  // Pegar valores do formulário
  const nomeTutor = document.getElementById('nomeTutor');
  const assuntoAula = document.getElementById('assuntoAula');
  const categoriaAula = document.getElementById('categoriaAula');
  const descricaoAula = document.getElementById('descricaoAula');

  // Resetar estados de erro
  [nomeTutor, assuntoAula, descricaoAula].forEach(input => {
    input.classList.remove('is-invalid');
  });

  let erro = false;

  if (!nomeTutor.value.trim()) { nomeTutor.classList.add('is-invalid'); erro = true; }
  if (!assuntoAula.value.trim()) { assuntoAula.classList.add('is-invalid'); erro = true; }
  if (!descricaoAula.value.trim()) { descricaoAula.classList.add('is-invalid'); erro = true; }

  if (erro) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  if (horariosAulaSelecionados.length === 0) {
    alert('Por favor, selecione pelo menos um horário!');
    return;
  }

  // Recuperar aulas já publicadas
  const aulasPublicadasArmazenadas = localStorage.getItem('aulasPublicadas');
  const aulasPublicadas = aulasPublicadasArmazenadas ? JSON.parse(aulasPublicadasArmazenadas) : [];

  const novaAula = {
    nomeTutor: nomeTutor.value.trim(),
    assunto: assuntoAula.value.trim(),
    categoria: categoriaAula.value,
    descricao: descricaoAula.value.trim(),
    horarios: [...horariosAulaSelecionados],
    publicadoEm: new Date().toISOString()
  };

  // Salvar no localStorage
  aulasPublicadas.push(novaAula);
  localStorage.setItem('aulasPublicadas', JSON.stringify(aulasPublicadas));
  console.log('[ofereca_aula.js] aula salva', novaAula);

  // Limpar formulário
  nomeTutor.value = '';
  assuntoAula.value = '';
  categoriaAula.selectedIndex = 0;
  descricaoAula.value = '';
  document.querySelectorAll('.slot-btn.active').forEach(btn => btn.classList.remove('active'));
  horariosAulaSelecionados = [];

  // Adicionar crédito
  try {
    if (typeof adicionarCreditos === 'function') {
      adicionarCreditos(1);
    } else if (window.CreditSystem && typeof window.CreditSystem.add === 'function') {
      window.CreditSystem.add(1);
    }
  } catch (err) {
    console.error('[ofereca_aula.js] erro ao adicionar crédito:', err);
  }

  alert('Aula publicada com sucesso! Você ganhou um crédito!');
}