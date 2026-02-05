const formCadastro = document.getElementById("formCadastro");
const erroEl = document.getElementById("erro");

async function extractErrorMessage(response) {
    let text = "";
    try {
        text = await response.text();
    } catch (err) {
        return "";
    }
    if (!text) {
        return "";
    }
    try {
        const data = JSON.parse(text);
        return data.message || data.error || data.mensagem || text;
    } catch (err) {
        return text;
    }
}

if (formCadastro) {
    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (erroEl) {
            erroEl.textContent = "";
        }

        const payload = {
            nome: document.getElementById("nome").value.trim(),
            email: document.getElementById("email").value.trim(),
            senha: document.getElementById("senha").value.trim(),
            tipo: document.getElementById("tipo").value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const mensagem = await extractErrorMessage(response);
                throw new Error(mensagem || "Não foi possível criar a conta. Tente novamente.");
            }
            const data = await response.json();
            localStorage.setItem("barberfly_user", JSON.stringify(data));
            localStorage.setItem("barberfly_token", data.token || "");
            window.location.href = "dashboard.html";
        } catch (err) {
            if (!erroEl) {
                return;
            }
            erroEl.textContent = err && err.message ? err.message : "Não foi possível criar a conta. Tente novamente.";
        }
    });
}
