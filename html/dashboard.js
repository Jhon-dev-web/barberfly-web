/* Configuracao da API */
const API_URL = window.BARBERFLY_API_BASE;

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
const menuToggleEl = document.getElementById("menuToggle");
const menuOverlayEl = document.getElementById("menuOverlay");

/* Identidade do usuario */
const usuarioLogado = window.BARBERFLY_AUTH ? window.BARBERFLY_AUTH.getUser() : null;
const PLANO_ATUAL = usuarioLogado && usuarioLogado.tipo ? usuarioLogado.tipo : "INDIVIDUAL";
const NOME_BARBEIRO = usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Barbeiro";
const NOME_BARBEARIA = "";

function aplicarPlano() {
    const plano = (PLANO_ATUAL || "INDIVIDUAL").toUpperCase();
    const planoIndividual = plano === "INDIVIDUAL";

    if (navEquipeEl) {
        navEquipeEl.classList.toggle("is-hidden", planoIndividual);
    }

    if (planoIndividual) {
        nomeBarbeariaEl.textContent = "";
        nomeBarbeariaEl.classList.add("is-hidden");
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

function configurarMenuMobile() {
    if (!menuToggleEl || !menuOverlayEl) {
        return;
    }
    menuToggleEl.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });
    menuOverlayEl.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
    });
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

function definirEstadoCarregando() {
    erroDashboardEl.classList.add("is-hidden");
    erroDashboardEl.textContent = "";
    faturamentoHojeEl.textContent = "R$ 0,00";
    quantidadeHojeEl.textContent = "0";
    proximoHorarioEl.textContent = "--:--";
    proximoClienteEl.textContent = "Carregando...";
    faturamentoMetaEl.textContent = "Carregando...";
    quantidadeMetaEl.textContent = "Carregando...";
    proximoStatusEl.textContent = "Carregando...";
    proximoNomeEl.textContent = "--";
    proximoInfoEl.textContent = "--";
    concluirProximoEl.classList.add("is-hidden");
    agendaStatusEl.textContent = "Carregando...";
    agendaMensagemEl.textContent = "";
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
        proximoNomeEl.textContent = "Sem atendimentos";
        proximoInfoEl.textContent = "Nenhum horario restante";
        proximoStatusEl.textContent = "";
        concluirProximoEl.classList.add("is-hidden");
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
        proximoNomeEl.textContent = "Sem pendencias";
        proximoInfoEl.textContent = "Agenda concluida";
        proximoStatusEl.textContent = "";
        concluirProximoEl.classList.add("is-hidden");
        return;
    }

    const cliente = proximo.cliente && proximo.cliente.nome ? proximo.cliente.nome : "Cliente";
    const servico = proximo.servico && proximo.servico.nome ? proximo.servico.nome : "Servico";
    proximoHorarioEl.textContent = formatarHora(proximo.dataHoraInicio);
    proximoClienteEl.textContent = cliente;
    proximoNomeEl.textContent = cliente;
    proximoInfoEl.textContent = `${formatarHora(proximo.dataHoraInicio)} • ${servico}`;
    proximoStatusEl.textContent = "Pronto para concluir";
    concluirProximoEl.classList.remove("is-hidden");
    const precoBase = proximo.servico && proximo.servico.preco ? Number(proximo.servico.preco) : null;
    concluirProximoEl.onclick = () => concluirAtendimento(proximo.id, concluirProximoEl, precoBase);
}

function atualizarAgenda(agendamentos) {
    agendaHojeEl.innerHTML = "";
    agendaMensagemEl.textContent = "";
    agendaStatusEl.textContent = "";

    const lista = Array.isArray(agendamentos)
        ? agendamentos.filter((item) => item && ["AGENDADO", "CONCLUIDO"].includes((item.status || "").toUpperCase()))
        : [];

    if (lista.length === 0) {
        agendaMensagemEl.textContent = "Sem atendimentos agendados para hoje.";
        return;
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
        faturamentoMetaEl.textContent = "Indisponivel";
        quantidadeMetaEl.textContent = "Indisponivel";
        proximoClienteEl.textContent = "Indisponivel";
        proximoStatusEl.textContent = "";
    }
}

atualizarDashboardEl.addEventListener("click", carregarDashboard);
atualizarDashboardSideEl.addEventListener("click", carregarDashboard);
aplicarPlano();
atualizarIdentidade();
configurarMenuMobile();
carregarDashboard();
