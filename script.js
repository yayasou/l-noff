document.addEventListener("DOMContentLoaded", () => {
    // 1. GESTION DE LA SÉLECTION DES TAILLES
    const sizeButtons = document.querySelectorAll(".size-btn:not(.out-of-stock)");
    let selectedSize = localStorage.getItem("lun_selected_size") || "";

    function updateSelectedSize() {
        sizeButtons.forEach((button) => {
            button.classList.toggle("is-selected", button.textContent.trim() === selectedSize);
        });
    }

    sizeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedSize = button.textContent.trim();
            localStorage.setItem("lun_selected_size", selectedSize);
            updateSelectedSize();
        });
    });

    updateSelectedSize();

    // 2. SÉCURITÉ DU BOUTON AJOUTER AU PANIER
    const requestButton = document.querySelector(".add-to-cart-btn");
    if (requestButton) {
        requestButton.addEventListener("click", (event) => {
            if (!selectedSize) {
                event.preventDefault();
                alert("Sélectionnez une taille avant de faire une demande.");
            }
        });
    }

    // 3. REMPLISSAGE AUTOMATIQUE DE LA TAILLE DANS LE PANIER
    const orderForm = document.querySelector(".order-form");
    if (orderForm) {
        const sizeSelect = orderForm.querySelector('select[name="size"]');
        if (sizeSelect && selectedSize) {
            sizeSelect.value = selectedSize;
        }
    }

    // 4. MOTEUR DE RECHERCHE
    const searchInput = document.querySelector(".search-custom");
    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }

            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                return;
            }

            const routes = [
                { keywords: ["tee", "t-shirt", "shirt", "premier", "2026", "summer", "ete", "été", "drop"], url: "nouveautes.html#collection" },
                { keywords: ["archive", "archives", "automne", "hiver", "beta", "bêta"], url: "archives.html" },
                { keywords: ["commande", "demande", "contact", "mail", "email"], url: "panier.html#contact" }
            ];

            const match = routes.find((route) => route.keywords.some((keyword) => query.includes(keyword)));
            window.location.href = match ? match.url : "nouveautes.html";
        });
    }
});