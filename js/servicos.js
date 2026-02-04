const API_URL = API_BASE_URL;
const form = document.getElementById("formServico");
const lista = document.getElementById("listaServicos");
const sucessoEl = document.getElementById("sucesso");
const erroEl = document.getElementById("erro");
const modalServico = document.getElementById("modalServico");
const formServicoEdicao = document.getElementById("formServicoEdicao");
const erroModal = document.getElementById("erroModal");
const fecharModalBtn = document.getElementById("fecharModal");
let servicosCache = [];

function renderServicos(servicos) {
    lista.innerHTML = "";
    servicosCache = servicos;
    servicos.forEach((servico) => {
        const tr = document.createElement("tr");
        const preco = servico.preco ? Number(servico.preco).toFixed(2).replace(".", ",") : "0,00";
        const status = servico.ativo ? "Ativo" : "Inativo";
        tr.innerHTML = `
            <td>${servico.nome || "-"}</td>
            <td>${servico.duracaoMin || "-" } min</td>
            <td>R$ ${preco}</td>
            <td>${status}</td>
            <td>
                <button class="ghost-button small-button" type="button" data-acao="editar">Editar</button>
                <button class="ghost-button small-button" type="button" data-acao="toggle">
                    ${servico.ativo ? "Desativar" : "Ativar"}
                </button>
            </td>
        `;
        const botoes = tr.querySelectorAll("button[data-acao]");
        botoes.forEach((botao) => {
            const acao = botao.getAttribute("data-acao");
            botao.addEventListener("click", () => {
                if (acao === "editar") {
                    abrirEdicao(servico);
                } else {
                    alternarStatus(servico);
                }
            });
        });
        lista.appendChild(tr);
    });
}

async function carregarServicos() {
    erroEl.textContent = "";
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/servicos`);
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao listar servicos");
        }
        const data = await response.json();
        renderServicos(data);
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel carregar servicos.";
    }
}

function abrirEdicao(servico) {
    erroModal.textContent = "";
    formServicoEdicao.reset();
    document.getElementById("servicoId").value = servico.id;
    document.getElementById("nomeEdit").value = servico.nome || "";
    document.getElementById("descricaoEdit").value = servico.descricao || "";
    document.getElementById("duracaoEdit").value = servico.duracaoMin || 0;
    document.getElementById("precoEdit").value = servico.preco || 0;
    document.getElementById("ativoEdit").value = String(!!servico.ativo);
    modalServico.classList.remove("is-hidden");
}

function fecharEdicao() {
    modalServico.classList.add("is-hidden");
}

async function alternarStatus(servico) {
    try {
        const ativo = !servico.ativo;
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/servicos/${servico.id}/status?ativo=${ativo}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao atualizar");
        }
        await carregarServicos();
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel atualizar o servico.";
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    sucessoEl.textContent = "";
    erroEl.textContent = "";

    const payload = {
        nome: document.getElementById("nome").value.trim(),
        descricao: document.getElementById("descricao").value.trim() || null,
        duracaoMin: Number(document.getElementById("duracaoMin").value),
        preco: Number(document.getElementById("preco").value)
    };

    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/servicos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao salvar servico");
        }
        form.reset();
        sucessoEl.textContent = "Servico salvo com sucesso.";
        await carregarServicos();
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel salvar servico.";
    }
});

formServicoEdicao.addEventListener("submit", async (event) => {
    event.preventDefault();
    erroModal.textContent = "";
    const id = document.getElementById("servicoId").value;
    const payload = {
        nome: document.getElementById("nomeEdit").value.trim(),
        descricao: document.getElementById("descricaoEdit").value.trim() || null,
        duracaoMin: Number(document.getElementById("duracaoEdit").value),
        preco: Number(document.getElementById("precoEdit").value),
        ativo: document.getElementById("ativoEdit").value === "true"
    };

    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/servicos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao atualizar servico");
        }
        fecharEdicao();
        await carregarServicos();
    } catch (err) {
        erroModal.textContent = err && err.message ? err.message : "Nao foi possivel atualizar.";
    }
});

fecharModalBtn.addEventListener("click", fecharEdicao);
carregarServicos();
