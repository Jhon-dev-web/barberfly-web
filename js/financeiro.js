const API_URL = API_BASE_URL;
const inicioEl = document.getElementById("inicio");
const fimEl = document.getElementById("fim");
const carregarEl = document.getElementById("carregar");
const totalEl = document.getElementById("total");
const quantidadeEl = document.getElementById("quantidade");
const erroEl = document.getElementById("erro");
const registrarAtendimentoEl = document.getElementById("registrarAtendimento");
const modalAtendimentoAvulso = document.getElementById("modalAtendimentoAvulso");
const fecharModalAvulso = document.getElementById("fecharModalAvulso");
const formAtendimentoAvulso = document.getElementById("formAtendimentoAvulso");
const servicoAvulsoEl = document.getElementById("servicoAvulso");
const valorAvulsoEl = document.getElementById("valorAvulso");
const clienteAvulsoEl = document.getElementById("clienteAvulso");
const dataHoraAvulsoEl = document.getElementById("dataHoraAvulso");
const erroModalAvulsoEl = document.getElementById("erroModalAvulso");

function montarDataHora(data, hora) {
    return `${data}T${hora}`;
}

function getNowLocalDateTime() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}

function popularServicosAvulso(servicos) {
    servicoAvulsoEl.innerHTML = "";
    const ativos = servicos.filter((servico) => servico && servico.ativo);
    if (!ativos.length) {
        servicoAvulsoEl.innerHTML = "<option value=''>Sem servicos ativos</option>";
        return;
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione um servico";
    servicoAvulsoEl.appendChild(placeholder);
    ativos.forEach((servico) => {
        const option = document.createElement("option");
        option.value = servico.id;
        option.textContent = servico.nome || "Servico";
        option.dataset.preco = servico.preco != null ? String(servico.preco) : "";
        servicoAvulsoEl.appendChild(option);
    });
}

function popularClientesAvulso(clientes) {
    clienteAvulsoEl.innerHTML = "<option value=''>Cliente avulso</option>";
    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome || "Cliente";
        clienteAvulsoEl.appendChild(option);
    });
}

async function carregarDadosAvulso() {
    try {
        const [servicos, clientes] = await Promise.all([
            window.BARBERFLY_AGENDAMENTO.fetchServicos(),
            window.BARBERFLY_AGENDAMENTO.fetchClientes()
        ]);
        popularServicosAvulso(Array.isArray(servicos) ? servicos : []);
        popularClientesAvulso(Array.isArray(clientes) ? clientes : []);
    } catch (err) {
        servicoAvulsoEl.innerHTML = "<option value=''>Sem servicos ativos</option>";
        clienteAvulsoEl.innerHTML = "<option value=''>Cliente avulso</option>";
    }
}

function abrirModalAvulso() {
    erroModalAvulsoEl.textContent = "";
    formAtendimentoAvulso.reset();
    dataHoraAvulsoEl.value = getNowLocalDateTime();
    modalAtendimentoAvulso.classList.remove("is-hidden");
    carregarDadosAvulso();
}

function fecharModalAvulsoCard() {
    modalAtendimentoAvulso.classList.add("is-hidden");
}

async function carregarResumo() {
    erroEl.textContent = "";
    const inicio = inicioEl.value;
    const fim = fimEl.value;
    if (!inicio || !fim) {
        erroEl.textContent = "Informe inicio e fim.";
        return;
    }

    const inicioDT = montarDataHora(inicio, "00:00:00");
    const fimDT = montarDataHora(fim, "23:59:59");

    try {
        const inicioParam = encodeURIComponent(inicioDT);
        const fimParam = encodeURIComponent(fimDT);
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/financeiro/resumo?inicio=${inicioParam}&fim=${fimParam}`);
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao carregar resumo");
        }
        const data = await response.json();
        const total = Number(data.totalFaturado || 0).toFixed(2).replace(".", ",");
        totalEl.textContent = `R$ ${total}`;
        quantidadeEl.textContent = data.quantidadeAtendimentos || 0;
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel carregar o resumo.";
    }
}

inicioEl.value = getTodayIsoDate();
fimEl.value = getTodayIsoDate();
carregarEl.addEventListener("click", carregarResumo);
carregarResumo();

if (registrarAtendimentoEl) {
    registrarAtendimentoEl.addEventListener("click", abrirModalAvulso);
}
if (fecharModalAvulso) {
    fecharModalAvulso.addEventListener("click", fecharModalAvulsoCard);
}
if (servicoAvulsoEl) {
    servicoAvulsoEl.addEventListener("change", () => {
        const selected = servicoAvulsoEl.options[servicoAvulsoEl.selectedIndex];
        if (selected && selected.dataset.preco) {
            valorAvulsoEl.value = Number(selected.dataset.preco).toFixed(2);
        }
    });
}
if (formAtendimentoAvulso) {
    formAtendimentoAvulso.addEventListener("submit", async (event) => {
        event.preventDefault();
        erroModalAvulsoEl.textContent = "";

        const servicoId = Number(servicoAvulsoEl.value) || null;
        const clienteId = Number(clienteAvulsoEl.value) || null;
        const precoFinal = Number(valorAvulsoEl.value);
        const dataHora = dataHoraAvulsoEl.value;

        if (!servicoId) {
            erroModalAvulsoEl.textContent = "Selecione um servico.";
            return;
        }
        if (!precoFinal || precoFinal <= 0) {
            erroModalAvulsoEl.textContent = "Informe um valor valido.";
            return;
        }
        if (!dataHora) {
            erroModalAvulsoEl.textContent = "Informe data e hora.";
            return;
        }

        try {
            const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/atendimentos/avulso`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    servicoId,
                    clienteId,
                    precoFinal,
                    dataHora
                })
            });
            if (!response.ok) {
                const mensagem = await response.text();
                throw new Error(mensagem || "Falha ao registrar atendimento");
            }
            fecharModalAvulsoCard();
            await carregarResumo();
        } catch (err) {
            erroModalAvulsoEl.textContent = err && err.message ? err.message : "Nao foi possivel registrar.";
        }
    });
}
