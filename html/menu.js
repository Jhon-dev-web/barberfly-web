const menuToggle = document.getElementById("menuToggle");
const menuOverlay = document.getElementById("menuOverlay");
const mobileMenu = document.getElementById("mobileMenu");

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
