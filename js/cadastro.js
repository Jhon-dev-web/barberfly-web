const formCadastro = document.getElementById("formCadastro");
const erroEl = document.getElementById("erro");

if (formCadastro) {
    formCadastro.addEventListener("submit", async (event) => {
        event.preventDefault();
        erroEl.textContent = "";

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
                const mensagem = await response.text();
                throw new Error(mensagem || "Falha ao cadastrar");
            }
            const data = await response.json();
            localStorage.setItem("barberfly_user", JSON.stringify(data));
            localStorage.setItem("barberfly_token", data.token || "");
            window.location.href = "dashboard.html";
        } catch (err) {
            erroEl.textContent = err && err.message ? err.message : "Nao foi possivel criar a conta.";
        }
    });
}
