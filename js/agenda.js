const API_URL = API_BASE_URL;
const listaEl = document.getElementById("lista");
const vazioEl = document.getElementById("vazio");
const sucessoEl = document.getElementById("sucesso");
const erroEl = document.getElementById("erro");
const dataEl = document.getElementById("data");
const carregarEl = document.getElementById("carregar");
const dataAtualEl = document.getElementById("dataAtual");
const filtroBarbeiroCampo = document.getElementById("filtroBarbeiroCampo");
const filtroBarbeiro = document.getElementById("filtroBarbeiro");
const modalAgendamento = document.getElementById("modalAgendamento");
const modalConclusao = document.getElementById("modalConclusao");
const formAgendamento = document.getElementById("formAgendamento");
const formConclusao = document.getElementById("formConclusao");
const sucessoModal = document.getElementById("sucessoModal");
const erroModal = document.getElementById("erroModal");
const sucessoConclusao = document.getElementById("sucessoConclusao");
const erroConclusao = document.getElementById("erroConclusao");
const novoAgendamentoBtn = document.getElementById("novoAgendamento");
const fecharModalBtn = document.getElementById("fecharModal");
const fecharConclusaoBtn = document.getElementById("fecharConclusao");
const clienteSelect = document.getElementById("clienteSelect");
const servicoSelect = document.getElementById("servicoSelect");
const barbeiroSelect = document.getElementById("barbeiroSelect");
const resumoConclusao = document.getElementById("resumoConclusao");
const novoClienteCampos = document.getElementById("novoClienteCampos");
const novoClienteNome = document.getElementById("novoClienteNome");
const novoClienteTelefone = document.getElementById("novoClienteTelefone");
const salvarNovoClienteBtn = document.getElementById("salvarNovoCliente");
const erroNovoCliente = document.getElementById("erroNovoCliente");
const toggleDiaBtn = document.getElementById("toggleDia");
const toggleSemanaBtn = document.getElementById("toggleSemana");
const diaView = document.getElementById("diaView");
const semanaView = document.getElementById("semanaView");
let modoSemana = false;
let agendamentosCache = [];
const usuarioLogado = window.BARBERFLY_AUTH ? window.BARBERFLY_AUTH.getUser() : null;
const ROLE_ATUAL = usuarioLogado && usuarioLogado.role ? usuarioLogado.role : "";
const EH_OWNER = String(ROLE_ATUAL || "").toUpperCase() === "OWNER";
const BARBEIRO_PADRAO = usuarioLogado && usuarioLogado.nome ? usuarioLogado.nome : "Barbeiro";
let barbeirosCache = [];

function statusClasse(status) {
    if (status === "CONCLUIDO") return "status success";
    if (status === "CANCELADO") return "status danger";
    return "status warning";
}

function formatarDataBR(dataIso) {
    const [ano, mes, dia] = dataIso.split("-");
    return `${dia}/${mes}/${ano}`;
}

function renderAgendaDia(itens) {
    listaEl.innerHTML = "";
    vazioEl.style.display = itens.length ? "none" : "block";

    itens
        .sort((a, b) => (a.dataHoraInicio || "").localeCompare(b.dataHoraInicio || ""))
        .forEach((item) => {
            const li = document.createElement("li");
            li.className = "list-item";
            const cliente = item.cliente ? item.cliente.nome : "Cliente";
            const servico = item.servico ? item.servico.nome : "Servico";
            const hora = item.dataHoraInicio ? item.dataHoraInicio.substring(11, 16) : "--:--";
            const barbeiro = item.barbeiro || "Barbeiro";
            li.innerHTML = `
                <div>
                    <strong>${hora} • ${cliente}</strong>
                    <span>${servico} • ${barbeiro}</span>
                </div>
                <div class="list-actions">
                    <span class="${statusClasse(item.status)}">${item.status}</span>
                </div>
            `;

            if (item.status === "AGENDADO") {
                const concluir = document.createElement("button");
                concluir.className = "primary-button small-button";
                concluir.textContent = "Concluir";
                concluir.type = "button";
                concluir.addEventListener("click", () => abrirConclusao(item));

                const cancelar = document.createElement("button");
                cancelar.className = "danger-button small-button";
                cancelar.textContent = "Cancelar";
                cancelar.type = "button";
                cancelar.addEventListener("click", () => cancelarAgendamento(item.id));

                const actions = li.querySelector(".list-actions");
                actions.appendChild(concluir);
                actions.appendChild(cancelar);
            }

            listaEl.appendChild(li);
        });
}

async function carregarAgendamentos() {
    const data = dataEl.value;
    sucessoEl.textContent = "";
    erroEl.textContent = "";
    listaEl.innerHTML = "";
    vazioEl.style.display = "none";

    try {
        const params = new URLSearchParams();
        params.set("data", data);
        if (EH_OWNER && filtroBarbeiro && filtroBarbeiro.value) {
            params.set("barbeiroId", filtroBarbeiro.value);
        }
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/agendamentos?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Falha ao carregar agendamentos");
        }
        const itens = await response.json();
        agendamentosCache = Array.isArray(itens) ? itens : [];
        atualizarSelectBarbeiros(agendamentosCache);
        renderAgendaDia(itens);
    } catch (err) {
        erroEl.textContent = "Nao foi possivel carregar a agenda.";
    }
}

function obterInicioSemana(dataBase) {
    const data = new Date(`${dataBase}T00:00:00`);
    const dia = data.getDay();
    const diff = dia === 0 ? -6 : 1 - dia;
    data.setDate(data.getDate() + diff);
    return data;
}

function formatarDiaSemana(data) {
    return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit"
    });
}

function renderAgendaSemana(itens, inicioSemana) {
    semanaView.innerHTML = "";
    const dias = [];
    for (let i = 0; i < 7; i += 1) {
        const dia = new Date(inicioSemana);
        dia.setDate(inicioSemana.getDate() + i);
        dias.push(dia);
    }

    const itensPorDia = new Map();
    dias.forEach((dia) => {
        const chave = dia.toISOString().substring(0, 10);
        itensPorDia.set(chave, []);
    });

    itens.forEach((item) => {
        const dataItem = item.dataHoraInicio ? item.dataHoraInicio.substring(0, 10) : null;
        if (dataItem && itensPorDia.has(dataItem)) {
            itensPorDia.get(dataItem).push(item);
        }
    });

    dias.forEach((dia) => {
        const chave = dia.toISOString().substring(0, 10);
        const lista = itensPorDia.get(chave) || [];
        lista.sort((a, b) => (a.dataHoraInicio || "").localeCompare(b.dataHoraInicio || ""));

        const card = document.createElement("div");
        card.className = "week-day";

        const header = document.createElement("div");
        header.className = "week-day-header";

        const titulo = document.createElement("strong");
        titulo.textContent = formatarDiaSemana(dia);

        const acao = document.createElement("button");
        acao.className = "ghost-button small-button";
        acao.type = "button";
        acao.textContent = "Novo";
        acao.addEventListener("click", () => abrirFormularioAgendamento(chave));

        header.append(titulo, acao);
        card.appendChild(header);

        const ul = document.createElement("ul");
        ul.className = "week-day-list";

        if (!lista.length) {
            const li = document.createElement("li");
            li.textContent = "Sem agendamentos";
            ul.appendChild(li);
        } else {
            lista.forEach((item) => {
                const cliente = item.cliente ? item.cliente.nome : "Cliente";
                const servico = item.servico ? item.servico.nome : "Servico";
                const hora = item.dataHoraInicio ? item.dataHoraInicio.substring(11, 16) : "--:--";
                const li = document.createElement("li");
                li.textContent = `${hora} • ${cliente} • ${servico}`;
                ul.appendChild(li);
            });
        }

        card.appendChild(ul);
        semanaView.appendChild(card);
    });
}

async function carregarAgendaSemana() {
    const dataBase = dataEl.value;
    erroEl.textContent = "";
    semanaView.innerHTML = "";
    try {
        const inicioSemana = obterInicioSemana(dataBase);
        const inicio = inicioSemana.toISOString().substring(0, 10);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        const fim = fimSemana.toISOString().substring(0, 10);

        const params = new URLSearchParams();
        params.set("inicio", inicio);
        params.set("fim", fim);
        if (EH_OWNER && filtroBarbeiro && filtroBarbeiro.value) {
            params.set("barbeiroId", filtroBarbeiro.value);
        }
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/agendamentos?${params.toString()}`);
        if (!response.ok) {
            throw new Error("Falha ao carregar agendamentos");
        }
        const itens = await response.json();
        renderAgendaSemana(Array.isArray(itens) ? itens : [], inicioSemana);
    } catch (err) {
        erroEl.textContent = "Nao foi possivel carregar a agenda semanal.";
    }
}

async function carregarClientes() {
    try {
        const clientes = EH_OWNER && filtroBarbeiro && filtroBarbeiro.value
            ? await window.BARBERFLY_AGENDAMENTO.fetchClientes({ barbeiroId: filtroBarbeiro.value })
            : await window.BARBERFLY_AGENDAMENTO.fetchClientes();
        popularSelectClientes(Array.isArray(clientes) ? clientes : []);
    } catch (err) {
        clienteSelect.innerHTML = "<option value=''>Sem clientes cadastrados</option>";
    }
}

async function carregarServicos() {
    try {
        const servicos = EH_OWNER && filtroBarbeiro && filtroBarbeiro.value
            ? await window.BARBERFLY_AGENDAMENTO.fetchServicos({ barbeiroId: filtroBarbeiro.value })
            : await window.BARBERFLY_AGENDAMENTO.fetchServicos();
        popularSelectServicos(Array.isArray(servicos) ? servicos : []);
    } catch (err) {
        servicoSelect.innerHTML = "<option value=''>Sem servicos cadastrados</option>";
    }
}

function popularSelectClientes(clientes) {
    clienteSelect.innerHTML = "";
    if (!clientes.length) {
        clienteSelect.innerHTML = "<option value=''>Sem clientes cadastrados</option>";
        return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um cliente";
    clienteSelect.appendChild(placeholder);
    const novoOption = document.createElement("option");
    novoOption.value = "__novo__";
    novoOption.textContent = "+ Novo cliente";
    clienteSelect.appendChild(novoOption);
    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome || "Cliente";
        clienteSelect.appendChild(option);
    });
}

function popularSelectServicos(servicos) {
    servicoSelect.innerHTML = "";
    const ativos = servicos.filter((servico) => servico && servico.ativo);
    if (!ativos.length) {
        servicoSelect.innerHTML = "<option value=''>Sem servicos ativos</option>";
        return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um servico";
    servicoSelect.appendChild(placeholder);
    ativos.forEach((servico) => {
        const option = document.createElement("option");
        option.value = servico.id;
        option.textContent = servico.nome || "Servico";
        servicoSelect.appendChild(option);
    });
}

function atualizarSelectBarbeiros(itens) {
    if (EH_OWNER) {
        barbeiroSelect.innerHTML = "<option value=''>Selecione um barbeiro</option>";
        barbeirosCache.forEach((barbeiro) => {
            const option = document.createElement("option");
            option.value = barbeiro.id;
            option.textContent = barbeiro.nome || "Barbeiro";
            option.dataset.nome = barbeiro.nome || "Barbeiro";
            barbeiroSelect.appendChild(option);
        });
        return;
    }

    const nomes = new Set();
    nomes.add(BARBEIRO_PADRAO);
    itens.forEach((item) => {
        const nome = String(item.barbeiro || "").trim();
        if (nome) {
            nomes.add(nome);
        }
    });
    barbeiroSelect.innerHTML = "<option value=''>Padrao (Barbeiro)</option>";
    [...nomes].sort().forEach((nome) => {
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        barbeiroSelect.appendChild(option);
    });
}

function abrirFormularioAgendamento(dataHoraOpcional) {
    sucessoModal.textContent = "";
    erroModal.textContent = "";
    formAgendamento.reset();
    erroNovoCliente.textContent = "";
    novoClienteCampos.classList.add("is-hidden");
    if (dataHoraOpcional) {
        if (dataHoraOpcional.includes("T")) {
            const [data, hora] = dataHoraOpcional.split("T");
            document.getElementById("dataForm").value = data;
            document.getElementById("horaInicio").value = hora;
            document.getElementById("horaFim").value = "";
        } else {
            document.getElementById("dataForm").value = dataHoraOpcional;
        }
    } else {
        document.getElementById("dataForm").value = dataEl.value;
    }
    modalAgendamento.classList.remove("is-hidden");
}

function fecharFormularioAgendamento() {
    modalAgendamento.classList.add("is-hidden");
}

async function salvarAgendamento(event) {
    event.preventDefault();
    sucessoModal.textContent = "";
    erroModal.textContent = "";
    const clienteId = Number(clienteSelect.value) || null;
    const servicoId = Number(servicoSelect.value) || null;
    let barbeiroId = null;
    let barbeiro = BARBEIRO_PADRAO;
    if (EH_OWNER) {
        barbeiroId = Number(barbeiroSelect.value) || null;
        const selected = barbeiroSelect.options[barbeiroSelect.selectedIndex];
        barbeiro = selected && selected.dataset.nome ? selected.dataset.nome : "Barbeiro";
        if (!barbeiroId) {
            erroModal.textContent = "Selecione um barbeiro.";
            return;
        }
    } else {
        const barbeiroSelecionado = String(barbeiroSelect.value || "").trim();
        barbeiro = barbeiroSelecionado || BARBEIRO_PADRAO;
    }
    const data = document.getElementById("dataForm").value;
    const horaInicio = document.getElementById("horaInicio").value;
    const horaFim = document.getElementById("horaFim").value;
    const observacoes = document.getElementById("observacoes").value || null;

    if (clienteSelect.value === "__novo__") {
        erroModal.textContent = "Salve o novo cliente antes de agendar.";
        return;
    }
    if (!clienteId) {
        erroModal.textContent = "Selecione um cliente.";
        return;
    }
    const dataHoraInicio = `${data}T${horaInicio}:00`;
    const dataHoraFim = horaFim ? `${data}T${horaFim}:00` : null;

    try {
        await window.BARBERFLY_AGENDAMENTO.criarAgendamento({
            clienteId,
            servicoId,
            barbeiro,
            dataHoraInicio,
            dataHoraFim,
            observacoes
        }, EH_OWNER && barbeiroId ? { barbeiroId } : {});
        fecharFormularioAgendamento();
        await carregarAgendamentos();
        sucessoEl.textContent = "Agendamento criado com sucesso.";
    } catch (err) {
        if (err && err.status === 409) {
            erroModal.textContent = "Conflito de horario para este barbeiro.";
            return;
        }
        erroModal.textContent = err && err.message ? err.message : "Nao foi possivel salvar.";
    }
}

function abrirConclusao(agendamento) {
    sucessoConclusao.textContent = "";
    erroConclusao.textContent = "";
    formConclusao.reset();
    document.getElementById("agendamentoId").value = agendamento.id;
    const cliente = agendamento.cliente ? agendamento.cliente.nome : "Cliente";
    const servico = agendamento.servico ? agendamento.servico.nome : "Servico";
    const hora = agendamento.dataHoraInicio ? agendamento.dataHoraInicio.substring(11, 16) : "--:--";
    resumoConclusao.textContent = `${hora} • ${cliente} • ${servico}`;
    if (agendamento.servico && agendamento.servico.preco) {
        document.getElementById("precoFinal").value = agendamento.servico.preco;
    }
    modalConclusao.classList.remove("is-hidden");
}

function fecharConclusao() {
    modalConclusao.classList.add("is-hidden");
}

async function salvarConclusao(event) {
    event.preventDefault();
    sucessoConclusao.textContent = "";
    erroConclusao.textContent = "";
    const agendamentoId = Number(document.getElementById("agendamentoId").value);
    const precoFinal = Number(document.getElementById("precoFinal").value);
    const observacoes = document.getElementById("obsConclusao").value || null;

    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/atendimentos/concluir`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agendamentoId, precoFinal, observacoes })
        });
        if (!response.ok) {
            const mensagem = await response.text();
            if (response.status === 409) {
                throw new Error("Agendamento nao pode ser concluido.");
            }
            throw new Error(mensagem || "Falha ao concluir");
        }
        fecharConclusao();
        await carregarAgendamentos();
        sucessoEl.textContent = "Atendimento concluido com sucesso.";
    } catch (err) {
        erroConclusao.textContent = err && err.message ? err.message : "Nao foi possivel concluir.";
    }
}

async function cancelarAgendamento(id) {
    if (!window.confirm("Deseja cancelar este agendamento?")) {
        return;
    }
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/agendamentos/${id}/cancelar`, {
            method: "PUT"
        });
        if (!response.ok) {
            const mensagem = await response.text();
            if (response.status === 409) {
                throw new Error("Agendamento nao pode ser cancelado.");
            }
            throw new Error(mensagem || "Falha ao cancelar");
        }
        await carregarAgendamentos();
        sucessoEl.textContent = "Agendamento cancelado.";
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel cancelar.";
    }
}

dataEl.value = new URLSearchParams(window.location.search).get("data") || getTodayIsoDate();
dataAtualEl.textContent = `Data: ${formatarDataBR(dataEl.value)}`;
dataEl.addEventListener("change", () => {
    dataAtualEl.textContent = `Data: ${formatarDataBR(dataEl.value)}`;
});
carregarEl.addEventListener("click", () => {
    if (modoSemana) {
        carregarAgendaSemana();
    } else {
        carregarAgendamentos();
    }
});
novoAgendamentoBtn.addEventListener("click", () => abrirFormularioAgendamento());
fecharModalBtn.addEventListener("click", fecharFormularioAgendamento);
fecharConclusaoBtn.addEventListener("click", fecharConclusao);
formAgendamento.addEventListener("submit", salvarAgendamento);
formConclusao.addEventListener("submit", salvarConclusao);

function ativarDia() {
    modoSemana = false;
    toggleDiaBtn.classList.add("is-active");
    toggleSemanaBtn.classList.remove("is-active");
    semanaView.classList.add("is-hidden");
    diaView.classList.remove("is-hidden");
    carregarAgendamentos();
}

function ativarSemana() {
    modoSemana = true;
    toggleSemanaBtn.classList.add("is-active");
    toggleDiaBtn.classList.remove("is-active");
    diaView.classList.add("is-hidden");
    semanaView.classList.remove("is-hidden");
    carregarAgendaSemana();
}

toggleDiaBtn.addEventListener("click", ativarDia);
toggleSemanaBtn.addEventListener("click", ativarSemana);
clienteSelect.addEventListener("change", () => {
    const selecionadoNovo = clienteSelect.value === "__novo__";
    novoClienteCampos.classList.toggle("is-hidden", !selecionadoNovo);
    if (!selecionadoNovo) {
        erroNovoCliente.textContent = "";
        novoClienteNome.value = "";
        novoClienteTelefone.value = "";
    }
});
salvarNovoClienteBtn.addEventListener("click", async () => {
    erroNovoCliente.textContent = "";
    const nome = String(novoClienteNome.value || "").trim();
    const telefone = String(novoClienteTelefone.value || "").trim();
    if (!nome || !telefone) {
        erroNovoCliente.textContent = "Informe nome e telefone.";
        return;
    }
    try {
        const cliente = await window.BARBERFLY_AGENDAMENTO.criarCliente(
            { nome, telefone },
            EH_OWNER && filtroBarbeiro && filtroBarbeiro.value ? { barbeiroId: filtroBarbeiro.value } : {}
        );
        if (cliente && cliente.id) {
            const option = document.createElement("option");
            option.value = cliente.id;
            option.textContent = cliente.nome || nome;
            clienteSelect.appendChild(option);
            clienteSelect.value = String(cliente.id);
        }
        await carregarClientes();
        novoClienteCampos.classList.add("is-hidden");
        novoClienteNome.value = "";
        novoClienteTelefone.value = "";
    } catch (err) {
        erroNovoCliente.textContent = err && err.message ? err.message : "Nao foi possivel salvar o cliente.";
    }
});
carregarClientes();
carregarServicos();
if (EH_OWNER && filtroBarbeiroCampo) {
    filtroBarbeiroCampo.classList.remove("is-hidden");
}
if (EH_OWNER && filtroBarbeiro) {
    filtroBarbeiro.addEventListener("change", () => {
        carregarClientes();
        carregarServicos();
        if (modoSemana) {
            carregarAgendaSemana();
        } else {
            carregarAgendamentos();
        }
    });
}
if (new URLSearchParams(window.location.search).get("view") === "semana") {
    ativarSemana();
} else {
    ativarDia();
}

async function carregarBarbeiros() {
    if (!EH_OWNER) {
        return;
    }
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/equipe/barbeiros`);
        if (!response.ok) {
            throw new Error("Falha ao carregar barbeiros");
        }
        barbeirosCache = await response.json();
        popularFiltroBarbeiros();
        atualizarSelectBarbeiros(agendamentosCache);
    } catch (err) {
        barbeirosCache = [];
    }
}

function popularFiltroBarbeiros() {
    if (!filtroBarbeiro) {
        return;
    }
    filtroBarbeiro.innerHTML = "<option value=''>Todos</option>";
    barbeirosCache.forEach((barbeiro) => {
        const option = document.createElement("option");
        option.value = barbeiro.id;
        option.textContent = barbeiro.nome || "Barbeiro";
        filtroBarbeiro.appendChild(option);
    });
}

carregarBarbeiros();
