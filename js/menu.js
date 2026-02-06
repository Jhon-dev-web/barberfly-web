const menuToggle = document.getElementById("menuToggle");
const menuOverlay = document.getElementById("menuOverlay");
const mobileMenu = document.getElementById("mobileMenu");

function applyBranding() {
    if (!window.BARBERFLY_AUTH) {
        return;
    }
    const user = window.BARBERFLY_AUTH.getUser();
    let nomeMarca = "BARBERFLY";
    if (user && String(user.tipo || "").toUpperCase() === "EMPRESA" && user.empresaNome) {
        nomeMarca = user.empresaNome;
    }
    const brandEls = document.querySelectorAll("[data-brand-name]");
    brandEls.forEach((el) => {
        el.textContent = nomeMarca;
    });
}

function applyOwnerMenu() {
    if (!window.BARBERFLY_AUTH) {
        return;
    }
    const user = window.BARBERFLY_AUTH.getUser();
    const isOwner = user && String(user.role || "").toUpperCase() === "OWNER";
    const ownerOnlyEls = document.querySelectorAll("[data-owner-only]");
    ownerOnlyEls.forEach((el) => {
        el.classList.toggle("is-hidden", !isOwner);
    });
}

function closeMenu() {
    document.body.classList.remove("menu-open");
}

if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });
    menuOverlay.addEventListener("click", closeMenu);
}

if (mobileMenu) {
    mobileMenu.addEventListener("click", (event) => {
        if (event.target && event.target.tagName === "A") {
            closeMenu();
        }
    });
}

applyBranding();
applyOwnerMenu();
