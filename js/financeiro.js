const API_URL = API_BASE_URL;
const inicioEl = document.getElementById("inicio");
const fimEl = document.getElementById("fim");
const carregarEl = document.getElementById("carregar");
const totalEl = document.getElementById("total");
const quantidadeEl = document.getElementById("quantidade");
const erroEl = document.getElementById("erro");

function montarDataHora(data, hora) {
    return `${data}T${hora}`;
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
