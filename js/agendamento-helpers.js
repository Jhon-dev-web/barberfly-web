async function handleJsonResponse(response, fallbackMessage) {
    if (!response.ok) {
        const mensagem = await response.text();
        const erro = new Error(mensagem || fallbackMessage);
        erro.status = response.status;
        throw erro;
    }
    return response.json();
}

async function fetchClientes() {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/clientes`);
    return handleJsonResponse(response, "Falha ao carregar clientes");
}

async function fetchServicos() {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/servicos`);
    return handleJsonResponse(response, "Falha ao carregar servicos");
}

async function criarCliente(payload) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return handleJsonResponse(response, "Falha ao criar cliente");
}

async function criarAgendamento(payload) {
    const response = await window.BARBERFLY_AUTH.fetch(`${API_BASE_URL}/agendamentos`, {
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
