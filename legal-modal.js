const legalModalContent = {
    mentions: {
        title: "Mentions légales",
        body: `
            <section>
                <h3>Éditeur du site</h3>
                <p>Le site www.lunoff.fr est édité par LÜN OFF, marque indépendante dédiée à la création et à la vente de vêtements en petites capsules.</p>
                <p>Contact : contact@lun-off.com</p>
            </section>
            <section>
                <h3>Hébergement</h3>
                <p>Le site est hébergé via GitHub Pages. Les contenus, visuels, textes, logos et éléments graphiques présents sur le site appartiennent à LÜN OFF sauf mention contraire.</p>
            </section>
            <section>
                <h3>Propriété intellectuelle</h3>
                <p>Toute reproduction, diffusion, modification ou utilisation des éléments du site sans autorisation préalable est interdite.</p>
            </section>
            <section>
                <h3>Données personnelles</h3>
                <p>Les informations envoyées via le formulaire servent uniquement au traitement des demandes de commande, à la vérification de disponibilité, à la livraison et au contact client.</p>
            </section>
        `
    },
    cgv: {
        title: "Conditions générales de vente",
        body: `
            <section>
                <h3>Commande</h3>
                <p>Chaque demande est vérifiée manuellement avant confirmation. Aucune commande n'est définitive tant que la disponibilité, la taille, le mode de réception et les informations client n'ont pas été validés.</p>
            </section>
            <section>
                <h3>Prix</h3>
                <p>Les prix indiqués sont affichés en euros. Les frais de livraison sont ajoutés selon le mode de réception choisi : point relais, livraison à domicile ou retrait en main propre lorsque disponible.</p>
            </section>
            <section>
                <h3>Paiement</h3>
                <p>Aucun paiement n'est demandé directement sur la page de formulaire. Les modalités de paiement sont communiquées après validation de la demande.</p>
            </section>
            <section>
                <h3>Livraison et retrait</h3>
                <p>La livraison est proposée en France selon les options disponibles au moment de la demande. Les délais peuvent varier selon le transporteur et la confirmation de commande.</p>
            </section>
            <section>
                <h3>Retours et échanges</h3>
                <p>Les retours et échanges sont étudiés après contact avec LÜN OFF, selon l'état de l'article, la disponibilité des tailles et les conditions applicables.</p>
            </section>
        `
    },
    contact: {
        title: "Contact",
        body: `
            <section>
                <h3>Service client</h3>
                <p>Pour une question sur une taille, une demande, une livraison ou une disponibilité, écris à contact@lun-off.com.</p>
            </section>
            <section>
                <h3>Réseaux sociaux</h3>
                <p>Tu peux aussi suivre LÜN OFF sur Instagram : @lunofc01.</p>
            </section>
            <section>
                <h3>Demandes de commande</h3>
                <p>Pour commander une pièce, passe par la page Demande afin que l'équipe puisse vérifier la disponibilité avant validation.</p>
            </section>
        `
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const triggers = document.querySelectorAll("[data-legal-modal]");
    if (!triggers.length) return;

    const overlay = document.createElement("div");
    overlay.className = "legal-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
        <div class="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" tabindex="-1">
            <button class="legal-close" type="button" aria-label="Fermer">×</button>
            <p class="eyebrow">LÜN OFF</p>
            <h2 id="legal-modal-title"></h2>
            <div class="legal-scroll"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const dialog = overlay.querySelector(".legal-dialog");
    const title = overlay.querySelector("#legal-modal-title");
    const content = overlay.querySelector(".legal-scroll");
    const closeButton = overlay.querySelector(".legal-close");

    function openModal(type) {
        const modal = legalModalContent[type];
        if (!modal) return;

        title.textContent = modal.title;
        content.innerHTML = modal.body;
        overlay.hidden = false;
        document.body.classList.add("legal-modal-open");
        dialog.focus();
    }

    function closeModal() {
        overlay.hidden = true;
        document.body.classList.remove("legal-modal-open");
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            openModal(trigger.dataset.legalModal);
        });
    });

    closeButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) closeModal();
    });
});
