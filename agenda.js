// Registrando manualmente o idioma pt-br para o FullCalendar
if (typeof FullCalendar !== "undefined" && FullCalendar.globalLocales) {
  FullCalendar.globalLocales.push({
    code: 'pt-br',
    week: { dow: 0, doy: 4 },
    buttonText: {
      prev: 'Anterior',
      next: 'Próximo',
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      list: 'Lista'
    },
    weekText: 'Sm',
    allDayText: 'dia inteiro',
    moreLinkText: 'mais',
    noEventsText: 'Não há eventos para mostrar'
  });
}

let indexParaEditar = null;
let diaParaEditar = null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agendamento");
  const logoutBtn = document.getElementById("logout");
  const listaDia = document.getElementById("lista-dia");
  const tituloDia = document.getElementById("dia-selecionado");
  const secaoDia = document.getElementById("agendamentos-dia");
  const modal = document.getElementById("modalAgendamentos");
  const modalEditar = document.getElementById("modalEditar");

  function bloquearScroll() {
    document.body.style.overflow = "hidden";
  }

  function liberarScroll() {
    document.body.style.overflow = "";
  }

  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
  let calendarioInstancia = null;
  let diaAtualSelecionado = null;

  function salvarEAtualizar() {
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
    atualizarCalendario();
    if (diaAtualSelecionado) {
      mostrarAgendamentosDoDia(diaAtualSelecionado);
    }
  }

  function atualizarCalendario() {
    const calendarEl = document.getElementById("calendar");

    if (calendarioInstancia) calendarioInstancia.destroy();

    const agendamentosPorDia = {};
    agendamentos.forEach(ag => {
      const data = new Date(ag.horario).toISOString().split('T')[0];
      if (!agendamentosPorDia[data]) agendamentosPorDia[data] = [];
      agendamentosPorDia[data].push(ag);
    });

    const eventos = Object.keys(agendamentosPorDia).map(data => {
      const ags = agendamentosPorDia[data];
      const total = ags.length;

      let cor = total >= 6 ? '#ff4d4d' : total >= 3 ? '#ffc107' : '#28a745';

      const horarios = ags.map(ag => {
        return new Date(ag.horario).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      });

      return {
        title: `${total} agendamento${total > 1 ? 's' : ''}`,
        start: data,
        allDay: true,
        display: 'block',
        classNames: ['evento-custom'],
        extendedProps: {
          horarios,
          corFundo: cor
        }
      };
    });

    const eventosIndividuais = agendamentos.map(ag => ({
      title: ag.cliente,
      start: new Date(ag.horario).toISOString(),
      allDay: false,
    }));

    const visualizacaoInicial = window.innerWidth < 768 ? 'timeGridDay' : 'dayGridMonth'; // <<<<<< ALTERAÇÃO AQUI

    calendarioInstancia = new FullCalendar.Calendar(calendarEl, {
      initialView: visualizacaoInicial,
      locale: 'pt-br',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      events: [...eventos, ...eventosIndividuais],
      eventContent: function(info) {
        const wrapper = document.createElement('div');
        const titleDiv = document.createElement('div');
        titleDiv.innerText = info.event.title;
        titleDiv.style.backgroundColor = info.event.extendedProps.corFundo;
        titleDiv.style.color = '#fff';
        titleDiv.style.padding = '2px 4px';
        titleDiv.style.borderRadius = '4px';
        titleDiv.style.fontWeight = 'bold';
        wrapper.appendChild(titleDiv);

        const horarios = info.event.extendedProps.horarios;
        if (horarios && horarios.length > 0) {
          horarios.forEach((hora, index) => {
            const horaDiv = document.createElement('div');
            horaDiv.innerText = hora;
            horaDiv.style.fontWeight = 'bold';
            horaDiv.style.fontSize = '0.75rem';
            horaDiv.style.color = '#000';
            horaDiv.style.padding = '2px 4px';
            horaDiv.style.borderBottom = (index < horarios.length - 1) ? '1px solid #ccc' : 'none';
            wrapper.appendChild(horaDiv);
          });
        }

        return { domNodes: [wrapper] };
      },
      dateClick(info) {
        diaAtualSelecionado = info.dateStr;
        mostrarAgendamentosDoDia(diaAtualSelecionado);
      }
    });

    calendarioInstancia.render();
  }

  function mostrarAgendamentosDoDia(diaClicado) {
    const listaModal = document.getElementById("listaAgendamentos");
    const agendamentosDoDia = agendamentos.filter(ag => {
      const data = new Date(ag.horario);
      return data.toISOString().split('T')[0] === diaClicado;
    });

    listaModal.innerHTML = "";
    agendamentosDoDia.forEach((ag, index) => {
      const li = document.createElement("li");
      const corStatus = ag.finalizado ? 'green' : 'red';

      li.innerHTML = `
        <div style="margin-bottom: 5px;">
          <span style="background-color: ${corStatus}; 
          width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px;"></span>
          ${formatarHorarioHoraMinuto(ag.horario)} ${ag.cliente}
          <br><small style="margin-left: 18px;">Serviço: ${ag.servico || 'Não informado'}</small>
          <br><small style="margin-left: 18px;">Endereço: ${ag.rua || '-'} Nº ${ag.nmrcasa || '-'}</small>
        </div>
        <div class="botoes-agendamento">
          <button class="editar" data-index="${index}">Editar</button>
          <button class="finalizar" data-index="${index}">${ag.finalizado ? "Reabrir" : "Finalizar"}</button>
          <button class="excluir" data-index="${index}">Excluir</button>
        </div>
      `;

      listaModal.appendChild(li);
    });

    listaModal.querySelectorAll(".finalizar").forEach(botao => {
      botao.addEventListener("click", e => {
        const i = parseInt(e.target.getAttribute("data-index"));
        agendamentosDoDia[i].finalizado = !agendamentosDoDia[i].finalizado;
        salvarEAtualizar();
      });
    });

    listaModal.querySelectorAll(".editar").forEach(botao => {
      botao.addEventListener("click", e => {
        indexParaEditar = parseInt(e.target.getAttribute("data-index"));
        diaParaEditar = diaClicado;

        const ag = agendamentosDoDia[indexParaEditar];
        document.getElementById("inputNovoHorario").value = new Date(ag.horario).toISOString().slice(0, 16);
        document.getElementById("inputNovoServico").value = ag.servico || '';
        document.getElementById("inputNovaRua").value = ag.rua || '';
        document.getElementById("inputNovoNumero").value = ag.nmrcasa || '';

        modalEditar.style.display = "flex";
        bloquearScroll();
      });
    });

    listaModal.querySelectorAll(".excluir").forEach(botao => {
      botao.addEventListener("click", e => {
        const i = parseInt(e.target.getAttribute("data-index"));
        const agGlobalIndex = agendamentos.findIndex(ag => ag === agendamentosDoDia[i]);
        if (agGlobalIndex > -1) {
          agendamentos.splice(agGlobalIndex, 1);
          salvarEAtualizar();
        }
      });
    });

    tituloDia.textContent = `(${diaClicado})`;
    modal.style.display = "flex";
    bloquearScroll();
  }

  document.getElementById("confirmarEdicao").addEventListener("click", () => {
    const novoValor = document.getElementById("inputNovoHorario").value;
    const novoServico = document.getElementById("inputNovoServico").value.trim();
    const novaRua = document.getElementById("inputNovaRua").value.trim();
    const novoNumero = document.getElementById("inputNovoNumero").value.trim();

    if (novoValor && indexParaEditar !== null && indexParaEditar !== undefined) {
      const ags = agendamentos.filter(ag => {
        const data = new Date(ag.horario);
        return data.toISOString().split('T')[0] === diaParaEditar;
      });

      ags[indexParaEditar].horario = new Date(novoValor).toISOString();
      ags[indexParaEditar].servico = novoServico;
      ags[indexParaEditar].rua = novaRua;
      ags[indexParaEditar].nmrcasa = novoNumero;

      salvarEAtualizar();
      modalEditar.style.display = "none";
      liberarScroll();
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cliente = document.getElementById("cliente").value.trim();
    const horario = document.getElementById("horario").value;
    const servico = document.getElementById("servico").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const nmrcasa = document.getElementById("nmrcasa").value.trim();

    if (!cliente || !horario) return;

    const horarioPadronizado = new Date(horario).toISOString();
    const jaExiste = agendamentos.some(ag =>
      ag.cliente === cliente && ag.horario === horarioPadronizado
    );

    if (jaExiste) {
      alert("Este horário já foi agendado para este cliente.");
      return;
    }

    agendamentos.push({
      cliente,
      horario: horarioPadronizado,
      servico,
      rua,
      nmrcasa,
      finalizado: false
    });

    salvarEAtualizar();
    modal.style.display = "none";
    liberarScroll();
    form.reset();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("logado");
      window.location.href = "index.html";
    });
  }

  atualizarCalendario();

  document.getElementById("fecharModal").addEventListener("click", () => {
    modal.style.display = "none";
    liberarScroll();
  });

  document.getElementById("cancelarEdicao").addEventListener("click", () => {
    modalEditar.style.display = "none";
    liberarScroll();
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal || e.target === modalEditar) {
      modal.style.display = "none";
      modalEditar.style.display = "none";
      liberarScroll();
    }
  });
});

function formatarHorarioHoraMinuto(dataHora) {
  const data = new Date(dataHora);
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}
