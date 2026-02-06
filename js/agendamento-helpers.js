async function handleJsonResponse(response, fallbackMessage) {
    if (!response.ok) {
        const mensagem = await response.text();
        const erro = new Error(mensagem || fallbackMessage);
        erro.status = response.status;
        throw erro;
    }
    return response.json();
}

function buildQueryString(options) {
    const params = new URLSearchParams();
    if (options && options.barbeiroId) {
        params.set("barbeiroId", options.barbeiroId);
    }
    const query = params.toString();
    return query ? `?${query}` : "";
}

async function fetchClientes(options = {}) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/clientes${buildQueryString(options)}`);
    return handleJsonResponse(response, "Falha ao carregar clientes");
}

async function fetchServicos(options = {}) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/servicos${buildQueryString(options)}`);
    return handleJsonResponse(response, "Falha ao carregar servicos");
}

async function criarCliente(payload, options = {}) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/clientes${buildQueryString(options)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return handleJsonResponse(response, "Falha ao criar cliente");
}

async function criarAgendamento(payload, options = {}) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/agendamentos${buildQueryString(options)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return handleJsonResponse(response, "Falha ao criar agendamento");
}

window.BARBERFLY_AGENDAMENTO = {
    fetchClientes,
    fetchServicos,
    criarCliente,
    criarAgendamento
};
