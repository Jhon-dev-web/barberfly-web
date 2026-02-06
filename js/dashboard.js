/* Configuracao da API */
const API_URL = API_BASE_URL;

/* Elementos principais */
const faturamentoHojeEl = document.getElementById("faturamentoHoje");
const faturamentoMetaEl = document.getElementById("faturamentoMeta");
const quantidadeHojeEl = document.getElementById("quantidadeHoje");
const quantidadeMetaEl = document.getElementById("quantidadeMeta");
const proximoHorarioEl = document.getElementById("proximoHorario");
const proximoClienteEl = document.getElementById("proximoCliente");
const proximoNomeEl = document.getElementById("proximoNome");
const proximoInfoEl = document.getElementById("proximoInfo");
const proximoStatusEl = document.getElementById("proximoStatus");
const concluirProximoEl = document.getElementById("concluirProximo");
const agendaHojeEl = document.getElementById("agendaHoje");
const agendaMensagemEl = document.getElementById("agendaMensagem");
const agendaStatusEl = document.getElementById("agendaStatus");
const erroDashboardEl = document.getElementById("erroDashboard");
const atualizarDashboardEl = document.getElementById("atualizarDashboard");
const atualizarDashboardSideEl = document.getElementById("atualizarDashboardSide");
const nomeBarbeiroEl = document.getElementById("nomeBarbeiro");
const nomeBarbeariaEl = document.getElementById("nomeBarbearia");
const navEquipeEl = document.getElementById("navEquipe");
const novoAgendamentoDashboardEl = document.getElementById("novoAgendamentoDashboard");
const novoAgendamentoAgendaEl = document.getElementById("novoAgendamentoAgenda");
const modalAgendamentoDashboard = document.getElementById("modalAgendamentoDashboard");
const formAgendamentoDashboard = document.getElementById("formAgendamentoDashboard");
const fecharModalDashboardBtn = document.getElementById("fecharModalDashboard");
const sucessoModalDashboard = document.getElementById("sucessoModalDashboard");
const erroModalDashboard = document.getElementById("erroModalDashboard");
const clienteSelectDashboard = document.getElementById("clienteSelectDashboard");
const servicoSelectDashboard = document.getElementById("servicoSelectDashboard");
const novoClienteCamposDashboard = document.getElementById("novoClienteCamposDashboard");
const novoClienteNomeDashboard = document.getElementById("novoClienteNomeDashboard");
const novoClienteTelefoneDashboard = document.getElementById("novoClienteTelefoneDashboard");
const salvarNovoClienteDashboard = document.getElementById("salvarNovoClienteDashboard");
const erroNovoClienteDashboard = document.getElementById("erroNovoClienteDashboard");
const dataDashboard = document.getElementById("dataDashboard");
const horaInicioDashboard = document.getElementById("horaInicioDashboard");
const observacoesDashboard = document.getElementById("observacoesDashboard");

/* Identidade do usuario */
const usuarioLogado = window.BARBERFLY_AUTH ? window.BARBERFLY_AUTH.getUser() : null;
const PLANO_ATUAL = usuarioLogado && usuarioLogado.tipo ? usuarioLogado.tipo : "INDIVIDUAL";
const ROLE_ATUAL = usuarioLogado && usuarioLogado.role ? usuarioLogado.role : "";
const EH_OWNER = String(ROLE_ATUAL || "").toUpperCase() === "OWNER";
const NOME_BARBEIRO = usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Barbeiro";
const NOME_BARBEARIA = usuarioLogado && usuarioLogado.empresaNome ? usuarioLogado.empresaNome : "";
const BARBEIRO_PADRAO = usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Barbeiro";

function aplicarPlano() {
    const plano = (PLANO_ATUAL || "INDIVIDUAL").toUpperCase();
    const planoIndividual = plano === "INDIVIDUAL";

    if (navEquipeEl) {
        navEquipeEl.classList.toggle("is-hidden", !EH_OWNER);
    }

    if (planoIndividual) {
        nomeBarbeariaEl.textContent = "";
        nomeBarbeariaEl.classList.add("is-hidden");
    }

    if (EH_OWNER) {
        if (novoAgendamentoDashboardEl) {
            novoAgendamentoDashboardEl.classList.add("is-hidden");
        }
        if (novoAgendamentoAgendaEl) {
            novoAgendamentoAgendaEl.classList.add("is-hidden");
        }
    }
}

function atualizarIdentidade() {
    const nomeBarbeiro = (NOME_BARBEIRO || "").trim();
    const nomeBarbearia = (NOME_BARBEARIA || "").trim();

    nomeBarbeiroEl.textContent = nomeBarbeiro || "Barbeiro";

    if (nomeBarbearia && (PLANO_ATUAL || "").toUpperCase() === "EMPRESA") {
        nomeBarbeariaEl.textContent = nomeBarbearia;
        nomeBarbeariaEl.classList.remove("is-hidden");
    } else {
        nomeBarbeariaEl.textContent = "";
        nomeBarbeariaEl.classList.add("is-hidden");
    }
}

function hojeIso() {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
    const numero = Number(valor || 0);
    return `R$ ${numero.toFixed(2).replace(".", ",")}`;
}

function formatarHora(dataHora) {
    if (!dataHora) {
        return "--:--";
    }
    const data = new Date(dataHora);
    if (Number.isNaN(data.getTime())) {
        return "--:--";
    }
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getTodayIso() {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${mes}-${dia}`;
}

function getCurrentTime() {
    const now = new Date();
    const hora = String(now.getHours()).padStart(2, "0");
    const minuto = String(now.getMinutes()).padStart(2, "0");
    return `${hora}:${minuto}`;
}

function definirEstadoCarregando() {
    erroDashboardEl.classList.add("is-hidden");
    erroDashboardEl.textContent = "";
    faturamentoHojeEl.textContent = "R$ 0,00";
    quantidadeHojeEl.textContent = "0";
    proximoHorarioEl.textContent = "--:--";
    proximoClienteEl.textContent = "Carregando...";
    faturamentoMetaEl.textContent = "Carregando...";
    quantidadeMetaEl.textContent = "Carregando...";
    if (proximoStatusEl) {
        proximoStatusEl.textContent = "Carregando...";
    }
    if (proximoNomeEl) {
        proximoNomeEl.textContent = "--";
    }
    if (proximoInfoEl) {
        proximoInfoEl.textContent = "--";
    }
    if (concluirProximoEl) {
        concluirProximoEl.classList.add("is-hidden");
    }
    agendaStatusEl.textContent = "Carregando...";
    agendaMensagemEl.textContent = "";
    if (novoAgendamentoAgendaEl) {
        novoAgendamentoAgendaEl.classList.add("is-hidden");
    }
    agendaHojeEl.innerHTML = "";
}

function obterStatusInfo(status) {
    const statusNormalizado = (status || "AGENDADO").toUpperCase();
    if (statusNormalizado === "CONCLUIDO") {
        return { texto: "Concluido", classe: "success" };
    }
    return { texto: "Agendado", classe: "warning" };
}

async function carregarResumo() {
    const hoje = hojeIso();
    const inicio = `${hoje}T00:00:00`;
    const fim = `${hoje}T23:59:59`;
    const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/financeiro/resumo?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
    if (!response.ok) {
        throw new Error("Resumo indisponivel");
    }
    return response.json();
}

async function carregarAgendamentos() {
    const hoje = hojeIso();
    const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/agendamentos?data=${encodeURIComponent(hoje)}`);
    if (!response.ok) {
        throw new Error("Agenda indisponivel");
    }
    return response.json();
}

function abrirQuickAgendamento() {
    sucessoModalDashboard.textContent = "";
    erroModalDashboard.textContent = "";
    formAgendamentoDashboard.reset();
    erroNovoClienteDashboard.textContent = "";
    novoClienteCamposDashboard.classList.add("is-hidden");
    dataDashboard.value = getTodayIso();
    horaInicioDashboard.value = getCurrentTime();
    modalAgendamentoDashboard.classList.remove("is-hidden");
    carregarClientesDashboard();
    carregarServicosDashboard();
}

function fecharQuickAgendamento() {
    modalAgendamentoDashboard.classList.add("is-hidden");
}

function popularSelectClientesDashboard(clientes) {
    clienteSelectDashboard.innerHTML = "";
    if (!clientes.length) {
        clienteSelectDashboard.innerHTML = "<option value=''>Sem clientes cadastrados</option>";
        return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um cliente";
    clienteSelectDashboard.appendChild(placeholder);
    const novoOption = document.createElement("option");
    novoOption.value = "__novo__";
    novoOption.textContent = "+ Novo cliente";
    clienteSelectDashboard.appendChild(novoOption);
    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome || "Cliente";
        clienteSelectDashboard.appendChild(option);
    });
}

function popularSelectServicosDashboard(servicos) {
    servicoSelectDashboard.innerHTML = "";
    const ativos = servicos.filter((servico) => servico && servico.ativo);
    if (!ativos.length) {
        servicoSelectDashboard.innerHTML = "<option value=''>Sem servicos ativos</option>";
        return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um servico";
    servicoSelectDashboard.appendChild(placeholder);
    ativos.forEach((servico) => {
        const option = document.createElement("option");
        option.value = servico.id;
        option.textContent = servico.nome || "Servico";
        servicoSelectDashboard.appendChild(option);
    });
}

async function carregarClientesDashboard() {
    try {
        const clientes = await window.BARBERFLY_AGENDAMENTO.fetchClientes();
        popularSelectClientesDashboard(Array.isArray(clientes) ? clientes : []);
    } catch (err) {
        clienteSelectDashboard.innerHTML = "<option value=''>Sem clientes cadastrados</option>";
    }
}

async function carregarServicosDashboard() {
    try {
        const servicos = await window.BARBERFLY_AGENDAMENTO.fetchServicos();
        popularSelectServicosDashboard(Array.isArray(servicos) ? servicos : []);
    } catch (err) {
        servicoSelectDashboard.innerHTML = "<option value=''>Sem servicos cadastrados</option>";
    }
}

async function salvarNovoClienteDashboardClick() {
    erroNovoClienteDashboard.textContent = "";
    const nome = String(novoClienteNomeDashboard.value || "").trim();
    const telefone = String(novoClienteTelefoneDashboard.value || "").trim();
    if (!nome || !telefone) {
        erroNovoClienteDashboard.textContent = "Informe nome e telefone.";
        return;
    }
    try {
        const cliente = await window.BARBERFLY_AGENDAMENTO.criarCliente({ nome, telefone });
        if (cliente && cliente.id) {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = cliente.nome || nome;
            clienteSelectDashboard.appendChild(option);
            clienteSelectDashboard.value = String(cliente.id);
        }
        await carregarClientesDashboard();
        novoClienteCamposDashboard.classList.add("is-hidden");
        novoClienteNomeDashboard.value = "";
        novoClienteTelefoneDashboard.value = "";
    } catch (err) {
        erroNovoClienteDashboard.textContent = err && err.message ? err.message : "Nao foi possivel salvar o cliente.";
    }
}

async function salvarAgendamentoDashboard(event) {
    event.preventDefault();
    sucessoModalDashboard.textContent = "";
    erroModalDashboard.textContent = "";

    const clienteId = Number(clienteSelectDashboard.value) || null;
    const servicoId = Number(servicoSelectDashboard.value) || null;
    const data = dataDashboard.value;
    const horaInicio = horaInicioDashboard.value;
    const observacoes = observacoesDashboard.value || null;

    if (clienteSelectDashboard.value === "__novo__") {
        erroModalDashboard.textContent = "Salve o novo cliente antes de agendar.";
        return;
    }
    if (!clienteId) {
        erroModalDashboard.textContent = "Selecione um cliente.";
        return;
    }
    if (!servicoId) {
        erroModalDashboard.textContent = "Selecione um servico.";
        return;
    }
    if (!data || !horaInicio) {
        erroModalDashboard.textContent = "Informe data e hora.";
        return;
    }

    const dataHoraInicio = `${data}T${horaInicio}:00`;

    try {
        await window.BARBERFLY_AGENDAMENTO.criarAgendamento({
            clienteId,
            servicoId,
            barbeiro: BARBEIRO_PADRAO,
            dataHoraInicio,
            dataHoraFim: null,
            observacoes
        });
        fecharQuickAgendamento();
        await carregarDashboard();
        sucessoModalDashboard.textContent = "Agendamento criado com sucesso.";
    } catch (err) {
        if (err && err.status === 409) {
            erroModalDashboard.textContent = "Conflito de horario para este barbeiro.";
            return;
        }
        erroModalDashboard.textContent = err && err.message ? err.message : "Nao foi possivel salvar.";
    }
}

async function concluirAtendimento(agendamentoId, botao, precoFinal) {
    if (!agendamentoId) {
        return;
    }
    botao.disabled = true;
    const textoOriginal = botao.textContent;
    botao.textContent = "Concluindo...";
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/atendimentos/concluir`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                agendamentoId,
                precoFinal: typeof precoFinal === "number" ? precoFinal : null
            })
        });
        if (!response.ok) {
            throw new Error("Falha ao concluir atendimento");
        }
        await carregarDashboard();
    } catch (err) {
        botao.disabled = false;
        botao.textContent = textoOriginal;
        erroDashboardEl.textContent = "Nao foi possivel concluir o atendimento agora.";
        erroDashboardEl.classList.remove("is-hidden");
    }
}

function atualizarResumo(resumo, agendamentos) {
    const total = resumo && resumo.totalFaturado ? resumo.totalFaturado : 0;
    const quantidade = resumo && resumo.quantidadeAtendimentos ? resumo.quantidadeAtendimentos : 0;
    faturamentoHojeEl.textContent = formatarMoeda(total);
    quantidadeHojeEl.textContent = quantidade;
    faturamentoMetaEl.textContent = "Baseado nos atendimentos concluidos";
    quantidadeMetaEl.textContent = "Contagem do financeiro de hoje";
}

function atualizarProximo(agendamentos) {
    if (!Array.isArray(agendamentos) || agendamentos.length === 0) {
        proximoHorarioEl.textContent = "--:--";
        proximoClienteEl.textContent = "Sem atendimentos hoje";
        if (proximoNomeEl) {
            proximoNomeEl.textContent = "Sem atendimentos";
        }
        if (proximoInfoEl) {
            proximoInfoEl.textContent = "Nenhum horario restante";
        }
        if (proximoStatusEl) {
            proximoStatusEl.textContent = "";
        }
        if (concluirProximoEl) {
            concluirProximoEl.classList.add("is-hidden");
        }
        return;
    }

    const agora = new Date();
    const pendentes = agendamentos
        .filter((item) => item && (item.status || "").toUpperCase() === "AGENDADO")
        .sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio));

    const proximo = pendentes.find((item) => new Date(item.dataHoraInicio) >= agora) || pendentes[0];
    if (!proximo) {
        proximoHorarioEl.textContent = "--:--";
        proximoClienteEl.textContent = "Sem atendimentos pendentes";
        if (proximoNomeEl) {
            proximoNomeEl.textContent = "Sem pendencias";
        }
        if (proximoInfoEl) {
            proximoInfoEl.textContent = "Agenda concluida";
        }
        if (proximoStatusEl) {
            proximoStatusEl.textContent = "";
        }
        if (concluirProximoEl) {
            concluirProximoEl.classList.add("is-hidden");
        }
        return;
    }

    const cliente = proximo.cliente && proximo.cliente.nome ? proximo.cliente.nome : "Cliente";
    const servico = proximo.servico && proximo.servico.nome ? proximo.servico.nome : "Servico";
    proximoHorarioEl.textContent = formatarHora(proximo.dataHoraInicio);
    proximoClienteEl.textContent = cliente;
    if (proximoNomeEl) {
        proximoNomeEl.textContent = cliente;
    }
    if (proximoInfoEl) {
        proximoInfoEl.textContent = `${formatarHora(proximo.dataHoraInicio)} • ${servico}`;
    }
    if (proximoStatusEl) {
        proximoStatusEl.textContent = "Pronto para concluir";
    }
    if (concluirProximoEl) {
        concluirProximoEl.classList.remove("is-hidden");
        const precoBase = proximo.servico && proximo.servico.preco ? Number(proximo.servico.preco) : null;
        concluirProximoEl.onclick = () => concluirAtendimento(proximo.id, concluirProximoEl, precoBase);
    }
}

function atualizarAgenda(agendamentos) {
    agendaHojeEl.innerHTML = "";
    agendaMensagemEl.textContent = "";
    agendaStatusEl.textContent = "";

    const lista = Array.isArray(agendamentos)
        ? agendamentos.filter((item) => item && ["AGENDADO", "CONCLUIDO"].includes((item.status || "").toUpperCase()))
        : [];

    if (lista.length === 0) {
        agendaMensagemEl.textContent = "Nenhum atendimento agendado para hoje.";
        if (novoAgendamentoAgendaEl) {
            novoAgendamentoAgendaEl.classList.remove("is-hidden");
        }
        return;
    }
    if (novoAgendamentoAgendaEl) {
        novoAgendamentoAgendaEl.classList.add("is-hidden");
    }

    const ordenados = [...lista].sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio));
    ordenados.forEach((agendamento) => {
        const cliente = agendamento.cliente && agendamento.cliente.nome ? agendamento.cliente.nome : "Cliente";
        const hora = formatarHora(agendamento.dataHoraInicio);
        const statusInfo = obterStatusInfo(agendamento.status);

        const item = document.createElement("li");
        item.className = "list-item";

        const horaEl = document.createElement("strong");
        horaEl.textContent = hora;

        const detalhes = document.createElement("div");
        const nomeEl = document.createElement("strong");
        nomeEl.textContent = cliente;
        const infoEl = document.createElement("span");
        infoEl.textContent = "Agenda do dia";
        detalhes.append(nomeEl, infoEl);

        const acoes = document.createElement("div");
        acoes.className = "list-actions";

        const statusEl = document.createElement("span");
        statusEl.className = `status ${statusInfo.classe}`;
        statusEl.textContent = statusInfo.texto;

        acoes.appendChild(statusEl);

        if ((agendamento.status || "").toUpperCase() === "AGENDADO") {
            const botao = document.createElement("button");
            botao.className = "ghost-button";
            botao.type = "button";
            botao.textContent = "Concluir";
            const precoBase = agendamento.servico && agendamento.servico.preco ? Number(agendamento.servico.preco) : null;
            botao.addEventListener("click", () => concluirAtendimento(agendamento.id, botao, precoBase));
            acoes.appendChild(botao);
        }

        item.append(horaEl, detalhes, acoes);
        agendaHojeEl.appendChild(item);
    });
}

async function carregarDashboard() {
    definirEstadoCarregando();
    try {
        const [resumo, agendamentos] = await Promise.all([
            carregarResumo(),
            carregarAgendamentos()
        ]);
        atualizarResumo(resumo, agendamentos);
        atualizarProximo(agendamentos);
        atualizarAgenda(agendamentos);
    } catch (err) {
        erroDashboardEl.textContent = "Nao foi possivel carregar o dashboard agora. Tente novamente.";
        erroDashboardEl.classList.remove("is-hidden");
        agendaMensagemEl.textContent = "Nao foi possivel carregar a agenda de hoje.";
        agendaStatusEl.textContent = "";
        if (novoAgendamentoAgendaEl) {
            novoAgendamentoAgendaEl.classList.add("is-hidden");
        }
        faturamentoMetaEl.textContent = "Indisponivel";
        quantidadeMetaEl.textContent = "Indisponivel";
        proximoClienteEl.textContent = "Indisponivel";
        if (proximoStatusEl) {
            proximoStatusEl.textContent = "";
        }
    }
}

atualizarDashboardEl.addEventListener("click", carregarDashboard);
if (atualizarDashboardSideEl) {
    atualizarDashboardSideEl.addEventListener("click", carregarDashboard);
}
if (novoAgendamentoDashboardEl) {
    novoAgendamentoDashboardEl.addEventListener("click", abrirQuickAgendamento);
}
if (novoAgendamentoAgendaEl) {
    novoAgendamentoAgendaEl.addEventListener("click", abrirQuickAgendamento);
}
if (fecharModalDashboardBtn) {
    fecharModalDashboardBtn.addEventListener("click", fecharQuickAgendamento);
}
if (formAgendamentoDashboard) {
    formAgendamentoDashboard.addEventListener("submit", salvarAgendamentoDashboard);
}
if (clienteSelectDashboard) {
    clienteSelectDashboard.addEventListener("change", () => {
        const selecionadoNovo = clienteSelectDashboard.value === "__novo__";
        novoClienteCamposDashboard.classList.toggle("is-hidden", !selecionadoNovo);
        if (!selecionadoNovo) {
            erroNovoClienteDashboard.textContent = "";
            novoClienteNomeDashboard.value = "";
            novoClienteTelefoneDashboard.value = "";
        }
    });
}
if (salvarNovoClienteDashboard) {
    salvarNovoClienteDashboard.addEventListener("click", salvarNovoClienteDashboardClick);
}
aplicarPlano();
atualizarIdentidade();
carregarDashboard();
