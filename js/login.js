const formLogin = document.getElementById("formLogin");
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

if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (erroEl) {
            erroEl.textContent = "";
        }

        const payload = {
            email: document.getElementById("email").value.trim(),
            senha: document.getElementById("senha").value.trim()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const mensagem = await extractErrorMessage(response);
                throw new Error(mensagem || "Não foi possível entrar. Tente novamente.");
            }
            const data = await response.json();
            localStorage.setItem("barberfly_user", JSON.stringify(data));
            localStorage.setItem("barberfly_token", data.token || "");
            window.location.href = "pages/dashboard.html";
        } catch (err) {
            if (!erroEl) {
                return;
            }
            erroEl.textContent = err && err.message ? err.message : "Não foi possível entrar. Tente novamente.";
        }
    });
}
