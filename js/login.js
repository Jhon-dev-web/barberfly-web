const formLogin = document.getElementById("formLogin");
const erroEl = document.getElementById("login-error");

function getFriendlyMessageByStatus(status) {
    if (status === 401) {
        return "Email ou senha inválidos.";
    }
    if (status === 400) {
        return "Preencha os campos corretamente.";
    }
    return "";
}

async function extractErrorMessage(response) {
    const clone = response.clone();
    try {
        const data = await response.json();
        return data.message || data.detail || data.error || data.title || "";
    } catch (err) {
        try {
            const text = await clone.text();
            return text || "";
        } catch (textErr) {
            return "";
        }
    }
}

if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (erroEl) {
            erroEl.textContent = "";
            erroEl.hidden = true;
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
                const friendly = getFriendlyMessageByStatus(response.status);
                if (friendly) {
                    throw new Error(friendly);
                }
                const mensagem = await extractErrorMessage(response);
                throw new Error(mensagem || "Não foi possível concluir. Tente novamente.");
            }
            const data = await response.json();
            localStorage.setItem("barberfly_user", JSON.stringify(data));
            localStorage.setItem("barberfly_token", data.token || "");
            window.location.href = "pages/dashboard.html";
        } catch (err) {
            if (!erroEl) {
                return;
            }
            const mensagem = err && err.message ? err.message : "Não foi possível concluir. Tente novamente.";
            erroEl.textContent = mensagem;
            erroEl.hidden = false;
        }
    });
}
