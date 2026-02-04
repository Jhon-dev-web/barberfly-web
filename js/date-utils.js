function getTodayIsoDate() {
    const now = new Date();
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const dia = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${mes}-${dia}`;
}
