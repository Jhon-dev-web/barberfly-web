const AUTH_API_URL = window.BARBERFLY_API_BASE;

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("barberfly_user") || "null");
    } catch (err) {
        return null;
    }
}

function getStoredToken() {
    return localStorage.getItem("barberfly_token") || "";
}

function clearAuth() {
    localStorage.removeItem("barberfly_user");
    localStorage.removeItem("barberfly_token");
}

async function validateAuth() {
    const token = getStoredToken();
    if (!token) {
        return false;
    }
    try {
        const response = await fetch(`${AUTH_API_URL}/auth/me`, {
            headers: { "X-Auth-Token": token }
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        localStorage.setItem("barberfly_user", JSON.stringify(data));
        return true;
    } catch (err) {
        return false;
    }
}

function requireAuth() {
    const pagina = (window.location.pathname || "").toLowerCase();
    if (pagina.includes("login.html") || pagina.includes("cadastro.html")) {
        return;
    }
    const user = getStoredUser();
    const token = getStoredToken();
    if (!user || !token) {
        window.location.href = "login.html";
        return;
    }
    validateAuth().then((ok) => {
        if (!ok) {
            clearAuth();
            window.location.href = "login.html";
        }
    });
}

function attachLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) {
        return;
    }
    btn.addEventListener("click", () => {
        clearAuth();
        window.location.href = "login.html";
    });
}

function authFetch(url, options = {}) {
    const token = getStoredToken();
    const headers = Object.assign({}, options.headers || {});
    if (token) {
        headers["X-Auth-Token"] = token;
    }
    return fetch(url, Object.assign({}, options, { headers })).then((response) => {
        if (response.status === 401) {
            clearAuth();
            window.location.href = "login.html";
        }
        return response;
    });
}

window.BARBERFLY_AUTH = {
    getUser: getStoredUser,
    getToken: getStoredToken,
    fetch: authFetch
};

requireAuth();
attachLogout();
