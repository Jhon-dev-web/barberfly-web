const API_URL = API_BASE_URL;
const form = document.getElementById("formCliente");
const lista = document.getElementById("listaClientes");
const sucessoEl = document.getElementById("sucesso");
const erroEl = document.getElementById("erro");
const usuarioLogado = window.BARBERFLY_AUTH ? window.BARBERFLY_AUTH.getUser() : null;
const EH_OWNER = usuarioLogado && String(usuarioLogado.role || "").toUpperCase() === "OWNER";

function renderClientes(clientes) {
    lista.innerHTML = "";
    clientes.forEach((cliente) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cliente.nome || "-"}</td>
            <td>${cliente.telefone || "-"}</td>
            <td>${cliente.email || "-"}</td>
        `;
        lista.appendChild(tr);
    });
}

async function carregarClientes() {
    erroEl.textContent = "";
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/clientes`);
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao listar clientes");
        }
        const data = await response.json();
        renderClientes(data);
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel carregar clientes.";
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    sucessoEl.textContent = "";
    erroEl.textContent = "";

    const payload = {
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim() || null
    };

    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/clientes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao salvar cliente");
        }
        form.reset();
        sucessoEl.textContent = "Cliente salvo com sucesso.";
        await carregarClientes();
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel salvar cliente.";
    }
});

if (EH_OWNER && form) {
    form.classList.add("is-hidden");
    sucessoEl.textContent = "Use o filtro da agenda para ver clientes por barbeiro.";
}

carregarClientes();
