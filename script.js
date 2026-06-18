document.addEventListener("DOMContentLoaded", () => {
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

    const requestButton = document.querySelector(".add-to-cart-btn");
    if (requestButton) {
        requestButton.addEventListener("click", (event) => {
            if (!selectedSize) {
                event.preventDefault();
                alert("Sélectionnez une taille avant de faire une demande.");
            }
        });
    }

    const orderForm = document.querySelector(".order-form");
    if (orderForm) {
        const sizeSelect = orderForm.querySelector('select[name="size"]');
        if (sizeSelect && selectedSize) {
            sizeSelect.value = selectedSize;
        }

        orderForm.addEventListener("submit", (event) => {
            const isNetlifyForm = orderForm.hasAttribute("data-netlify");

            if (!isNetlifyForm || window.location.protocol === "file:") {
                event.preventDefault();
                orderForm.innerHTML = `
                    <div class="form-confirmation">
                        <p class="eyebrow">Demande préparée</p>
                        <h2>Merci. Pour recevoir les demandes par email, il faudra connecter ce formulaire à un service comme Netlify Forms, Formspree ou un backend.</h2>
                        <a href="index.html" class="request-btn">Retour à l'accueil</a>
                    </div>
                `;
            }
        });
    }

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
