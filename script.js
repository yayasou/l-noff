document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function updateHeaderState() {
        header.classList.toggle("scrolled", window.scrollY > 10);
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
});
