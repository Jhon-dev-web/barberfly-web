const API_URL = API_BASE_URL;
const formEquipe = document.getElementById("formEquipe");
const sucessoEl = document.getElementById("sucesso");
const erroEl = document.getElementById("erro");
const listaEl = document.getElementById("listaBarbeiros");
const modeloRepasseEl = document.getElementById("modeloRepasse");
const campoAluguel = document.getElementById("campoAluguel");
const campoComissao = document.getElementById("campoComissao");

const usuarioLogado = window.BARBERFLY_AUTH ? window.BARBERFLY_AUTH.getUser() : null;
const EH_OWNER = usuarioLogado && String(usuarioLogado.role || "").toUpperCase() === "OWNER";

if (!EH_OWNER) {
    window.location.href = "dashboard.html";
}

function atualizarCamposRepasse() {
    const modelo = String(modeloRepasseEl.value || "").toUpperCase();
    const isComissao = modelo === "COMISSAO";
    campoComissao.classList.toggle("is-hidden", !isComissao);
    campoAluguel.classList.toggle("is-hidden", isComissao);
}

function formatarRepasse(barbeiro) {
    if (!barbeiro) {
        return "-";
    }
    const modelo = String(barbeiro.modeloRepasse || "").toUpperCase();
    if (modelo === "COMISSAO") {
        const percentual = Number(barbeiro.percentualComissao || 0).toFixed(2).replace(".", ",");
        return `${percentual}%`;
    }
    if (modelo === "ALUGUEL") {
        const valor = Number(barbeiro.valorAluguelMensal || 0).toFixed(2).replace(".", ",");
        return `R$ ${valor}`;
    }
    return "-";
}

function renderBarbeiros(barbeiros) {
    listaEl.innerHTML = "";
    barbeiros.forEach((barbeiro) => {
        const tr = document.createElement("tr");
        const status = barbeiro.ativo ? "Ativo" : "Inativo";
        tr.innerHTML = `
            <td>${barbeiro.nome || "-"}</td>
            <td>${barbeiro.email || "-"}</td>
            <td>${barbeiro.modeloRepasse || "-"}</td>
            <td>${formatarRepasse(barbeiro)}</td>
            <td>${status}</td>
            <td>
                <button class="ghost-button small-button" type="button" data-id="${barbeiro.id}">
                    Desativar
                </button>
            </td>
        `;
        const botao = tr.querySelector("button[data-id]");
        if (botao) {
            botao.disabled = !barbeiro.ativo;
            botao.addEventListener("click", () => desativarBarbeiro(barbeiro.id));
        }
        listaEl.appendChild(tr);
    });
}

async function carregarBarbeiros() {
    erroEl.textContent = "";
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/equipe/barbeiros`);
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao listar barbeiros");
        }
        const data = await response.json();
        renderBarbeiros(Array.isArray(data) ? data : []);
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel carregar a equipe.";
    }
}

async function desativarBarbeiro(id) {
    if (!window.confirm("Deseja desativar este barbeiro?")) {
        return;
    }
    try {
        const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/equipe/barbeiros/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            const mensagem = await response.text();
            throw new Error(mensagem || "Falha ao desativar barbeiro");
        }
        await carregarBarbeiros();
    } catch (err) {
        erroEl.textContent = err && err.message ? err.message : "Nao foi possivel desativar.";
    }
}

function getFriendlyError(status) {
    if (status === 409) {
        return "Limite de barbeiros atingido ou email ja cadastrado.";
    }
    if (status === 400) {
        return "Preencha os campos corretamente.";
    }
    return "";
}

if (formEquipe) {
    formEquipe.addEventListener("submit", async (event) => {
        event.preventDefault();
        sucessoEl.textContent = "";
        erroEl.textContent = "";

        const modelo = String(modeloRepasseEl.value || "").toUpperCase();
        const payload = {
            nome: document.getElementById("nomeBarbeiro").value.trim(),
            email: document.getElementById("emailBarbeiro").value.trim(),
            senha: document.getElementById("senhaBarbeiro").value.trim(),
            modeloRepasse: modelo,
            percentualComissao: null,
            valorAluguelMensal: null
        };

        if (modelo === "COMISSAO") {
            payload.percentualComissao = Number(document.getElementById("percentualComissao").value);
        } else {
            payload.valorAluguelMensal = Number(document.getElementById("valorAluguelMensal").value);
        }

        try {
            const response = await window.BARBERFLY_AUTH.fetch(`${API_URL}/equipe/barbeiros`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const friendly = getFriendlyError(response.status);
                if (friendly) {
                    throw new Error(friendly);
                }
                const mensagem = await response.text();
                throw new Error(mensagem || "Falha ao adicionar barbeiro");
            }
            formEquipe.reset();
            atualizarCamposRepasse();
            sucessoEl.textContent = "Barbeiro adicionado com sucesso.";
            await carregarBarbeiros();
        } catch (err) {
            erroEl.textContent = err && err.message ? err.message : "Nao foi possivel adicionar barbeiro.";
        }
    });
}

if (modeloRepasseEl) {
    modeloRepasseEl.addEventListener("change", atualizarCamposRepasse);
}

atualizarCamposRepasse();
carregarBarbeiros();
