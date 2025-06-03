// Variáveis globais
let editandoIndex = null;
let dataAtual = new Date();
const mesesPtBr = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

// Elementos do DOM
const calendar = document.getElementById("calendar");
const mesAnoTitulo = document.getElementById("mesAno");
const btnPrev = document.getElementById("prev");
const btnNext = document.getElementById("next");
const btnFlutuante = document.getElementById('btnFlutuante');
const modal = document.getElementById('modalAgendamento');
const fecharModal = document.getElementById('fecharModal');
const formAgendamento = document.getElementById('formAgendamento');
const modalVisualizar = document.getElementById("modalVisualizar");
const fecharModalVisualizar = document.getElementById("fecharModalVisualizar");
const listaAgendamentos = document.getElementById("listaAgendamentos");
const modalEditar = document.getElementById("modalEditar");
const fecharModalEditar = document.getElementById("fecharModalEditar");
const formEditar = document.getElementById("formEditar");

// Função para gerar o calendário
function gerarCalendario(data) {
  calendar.innerHTML = "";
  const ano = data.getFullYear();
  const mes = data.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diaSemanaInicio = primeiroDia.getDay();
  const totalDias = ultimoDia.getDate();

  mesAnoTitulo.textContent = `${mesesPtBr[mes]} de ${ano}`;

  for (let i = 0; i < diaSemanaInicio; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("day", "empty");
    calendar.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const divDia = document.createElement("div");
    divDia.classList.add("day");
    divDia.innerText = dia;

    const agsDoDia = agendamentos.filter(a => {
  if (!a.data || typeof a.data !== 'string' || !a.data.includes('-')) return false;
  const [anoAg, mesAg, diaAg] = a.data.split("-").map(Number);
  return diaAg === dia && mesAg === mes + 1 && anoAg === ano;
});

    if (agsDoDia.length >= 6) divDia.classList.add("red");
    else if (agsDoDia.length >= 3) divDia.classList.add("yellow");
    else if (agsDoDia.length > 0) divDia.classList.add("green");

    divDia.addEventListener("click", () => exibirAgendamentosDia(dia, mes, ano));

    calendar.appendChild(divDia);
  }
}

// Exibe agendamentos do dia no modal
function exibirAgendamentosDia(dia, mes, ano) {
  const agsDoDia = agendamentos.filter(a => {
    const [anoAg, mesAg, diaAg] = a.data.split("-").map(Number);
    return diaAg === dia && mesAg === mes + 1 && anoAg === ano;
  });

  const dataSelecionadaTexto = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;
  document.getElementById("dataSelecionada").textContent = dataSelecionadaTexto;
  listaAgendamentos.innerHTML = "";

  if (agsDoDia.length === 0) {
    listaAgendamentos.innerHTML = "<p>Nenhum agendamento neste dia.</p>";
  } else {
    agsDoDia.forEach((ag) => {
      const index = agendamentos.findIndex(a =>
        a.nome === ag.nome &&
        a.data === ag.data &&
        a.hora === ag.hora &&
        a.whats === ag.whats
      );

      const item = document.createElement("div");
      item.classList.add("item-agendamento");

      const dataFormatada = new Date(ag.data).toLocaleDateString('pt-BR');

      item.innerHTML = `
        <div class="status-indicador ${ag.status === 'atendido' ? 'atendido' : 'pendente'}"></div>
        <p><strong>Status:</strong> ${ag.status === 'atendido' ? '<strong>Atendimento Realizado</strong>' : '<strong>Atendimento Não Realizado</strong>'}</p>
        <p><strong>Nome:</strong> ${ag.nome}</p>
        <p><strong>Serviço:</strong> ${ag.servico}</p>
        <p><strong>Endereço:</strong> ${ag.rua} <strong>Nº</strong> ${ag.numero}</p>
        <p><strong>Data:</strong> ${dataFormatada} <strong>Hora:</strong> ${ag.hora}</p>
        <p><strong>WhatsApp:</strong> ${ag.whats}</p>
        <div class="botoes-item">
          <button class="botao-editar" onclick="editarAgendamento(${index}, ${dia}, ${mes}, ${ano})">EDITAR</button>
          <button class="botao-finalizar" onclick="finalizarAgendamento(${index}, ${dia}, ${mes}, ${ano})">FINALIZAR</button>
          <button class="botao-excluir" onclick="excluirAgendamento(${index})">EXCLUIR</button>
        </div>
        <hr>
      `;
      listaAgendamentos.appendChild(item);
    });
  }

  modalVisualizar.style.display = "flex";
}

// Navegação
btnPrev.addEventListener("click", () => {
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  gerarCalendario(dataAtual);
});

btnNext.addEventListener("click", () => {
  dataAtual.setMonth(dataAtual.getMonth() + 1);
  gerarCalendario(dataAtual);
});

// Modais
btnFlutuante.addEventListener('click', () => modal.style.display = 'flex');
if (fecharModal) fecharModal.addEventListener('click', () => modal.style.display = 'none');
fecharModalVisualizar.addEventListener("click", () => modalVisualizar.style.display = "none");
fecharModalEditar.addEventListener("click", () => {
  modalEditar.style.display = "none";
  editandoIndex = null;
});
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === modalVisualizar) modalVisualizar.style.display = 'none';
  if (e.target === modalEditar) modalEditar.style.display = 'none';
});

// Novo agendamento
formAgendamento.addEventListener('submit', e => {
  e.preventDefault();

  const dados = {
    nome: formAgendamento.nome.value,
    servico: formAgendamento.servico.value,
    rua: formAgendamento.rua.value,
    numero: formAgendamento.numero.value,
    data: formAgendamento.data.value,
    hora: formAgendamento.hora.value,
    whats: formAgendamento.whats.value,
    status: 'pendente'
  };

  agendamentos.push(dados);
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

  alert(`Agendado:\nNome: ${dados.nome}\nServiço: ${dados.servico}\nRua: ${dados.rua}, Nº ${dados.numero}\nData: ${dados.data} ${dados.hora}\nWhatsApp: ${dados.whats}`);

  modal.style.display = 'none';
  formAgendamento.reset();
  gerarCalendario(dataAtual);
});

// Finalizar agendamento
function finalizarAgendamento(index, dia, mes, ano) {
  agendamentos[index].status = 'atendido';
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
  gerarCalendario(dataAtual);
  exibirAgendamentosDia(dia, mes, ano);
}

// Excluir agendamento
function excluirAgendamento(index) {
  if (confirm("Tem certeza que deseja excluir este agendamento?")) {
    const agendamentoExcluido = agendamentos[index];
    agendamentos.splice(index, 1);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    const [ano, mes, dia] = agendamentoExcluido.data.split("-").map(Number);
    gerarCalendario(dataAtual);
    exibirAgendamentosDia(dia, mes - 1, ano);
  }
}

// Editar agendamento
function editarAgendamento(index, dia, mes, ano) {
  const agendamento = agendamentos[index];
  document.getElementById("editarNome").value = agendamento.nome;
  document.getElementById("editarServico").value = agendamento.servico;
  document.getElementById("editarRua").value = agendamento.rua;
  document.getElementById("editarNumero").value = agendamento.numero;
  document.getElementById("editarData").value = agendamento.data;
  document.getElementById("editarHora").value = agendamento.hora;
  document.getElementById("editarWhats").value = agendamento.whats;

  editandoIndex = { index, dia, mes, ano };
  modalEditar.style.display = "flex";
}

// Salvar edição
formEditar.addEventListener("submit", (e) => {
  e.preventDefault();

  if (editandoIndex !== null) {
    const { index, dia, mes, ano } = editandoIndex;

    agendamentos[index] = {
      ...agendamentos[index],
      nome: document.getElementById("editarNome").value,
      servico: document.getElementById("editarServico").value,
      rua: document.getElementById("editarRua").value,
      numero: document.getElementById("editarNumero").value,
      data: document.getElementById("editarData").value,
      hora: document.getElementById("editarHora").value,
      whats: document.getElementById("editarWhats").value
    };

    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    modalEditar.style.display = "none";
    editandoIndex = null;
    gerarCalendario(dataAtual);
    exibirAgendamentosDia(dia, mes, ano);
  }
});

// Inicializar calendário
gerarCalendario(dataAtual);
