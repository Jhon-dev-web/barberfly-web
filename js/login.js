const formLogin = document.getElementById("formLogin");
const erroEl = document.getElementById("erro");

if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();
        erroEl.textContent = "";

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
                const mensagem = await response.text();
                throw new Error(mensagem || "Falha ao entrar");
            }
            const data = await response.json();
            localStorage.setItem("barberfly_user", JSON.stringify(data));
            localStorage.setItem("barberfly_token", data.token || "");
            window.location.href = "pages/dashboard.html";
        } catch (err) {
            erroEl.textContent = err && err.message ? err.message : "Nao foi possivel entrar.";
        }
    });
}
