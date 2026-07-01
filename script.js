document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. GESTION DES TAILLES ET DU PANIER
    // ==========================================
    const sizeButtons = document.querySelectorAll(".size-btn:not(.out-of-stock)");
    let selectedSize = localStorage.getItem("lun_selected_size") || "";

    function updateSizeUI() {
        sizeButtons.forEach(btn => {
            btn.classList.toggle("is-selected", btn.textContent.trim() === selectedSize);
        });
    }

    sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedSize = btn.textContent.trim();
            localStorage.setItem("lun_selected_size", selectedSize);
            updateSizeUI();
            const formSelect = document.querySelector('.order-form select[name="size"]');
            if (formSelect) formSelect.value = selectedSize;
        });
    });

    updateSizeUI();

    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", (e) => {
            if (!selectedSize) {
                e.preventDefault();
                alert("Sélectionnez une taille avant de faire une demande.");
            }
        });
    }

    // ==========================================
    // 2. ANIMATION DU HEADER AU SCROLL
    // ==========================================
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.site-header');
        if (header) {
            if (window.scrollY > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // ==========================================
    // 3. GALERIE SANS BUG (MANUELLE + AUTO)
    // ==========================================
    const thumbnails = document.querySelectorAll('.thumb-btn');
    const mainImage = document.querySelector('.main-product-image');
    let currentIndex = 0;
    let autoSlideInterval;

    function changeSlide(index) {
    if (!thumbnails[index] || !mainImage) return;

    currentIndex = index;

    thumbnails.forEach(t => t.classList.remove('is-active'));
    thumbnails[currentIndex].classList.add('is-active');

    const newSrc = thumbnails[currentIndex].getAttribute('data-src');

    // FADE OUT
    mainImage.classList.add("is-fading");

    setTimeout(() => {
        mainImage.src = newSrc;

        // FADE IN
        mainImage.classList.remove("is-fading");
    }, 300);
}

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            let nextIndex = (currentIndex + 1) % thumbnails.length;
            changeSlide(nextIndex);
        }, 4000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Clic manuel
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            stopAutoSlide();
            changeSlide(index);
            startAutoSlide();
        });
    });

    // Lancement automatique si les éléments existent
    if (thumbnails.length > 0 && mainImage) {
        startAutoSlide();
    }
});
// ==========================================
// 4. MISE À JOUR DES FRAIS DE PORT + TOTAL
// ==========================================

const shippingDisplay = document.getElementById("summary-shipping");
const totalDisplay = document.getElementById("summary-total");
const shippingSubOptions = document.getElementById("shipping-sub-options");

const basePrice = 25;

// Prix transport
const shippingPrices = {
    mondial_relay: 4.50,
    colissimo: 6.50,
    retrait_malakoff: 0
};

function updateTotal() {
    const deliveryMethod = document.querySelector('input[name="delivery_method"]:checked').value;
    let shipping = 0;

    if (deliveryMethod === "livraison") {
        // Si c'est une livraison, on affiche les sous-options et on prend le prix du transporteur sélectionné
        if (shippingSubOptions) shippingSubOptions.style.display = "flex";
        
        const selectedCarrier = document.querySelector('input[name="carrier"]:checked');
        if (selectedCarrier) {
            shipping = shippingPrices[selectedCarrier.value] || 0;
        }
    } else {
        // Si c'est un retrait à Malakoff, on cache les sous-options et les frais de port tombent à 0
        if (shippingSubOptions) shippingSubOptions.style.display = "none";
        shipping = shippingPrices["retrait_malakoff"];
    }

    // Mise à jour de l'affichage textuel
    if (shippingDisplay) {
        shippingDisplay.textContent = shipping === 0 ? "Gratuit" : shipping.toFixed(2) + " €";
    }

    if (totalDisplay) {
        const total = basePrice + shipping;
        totalDisplay.textContent = total.toFixed(2) + " €";
    }
}

// Écoute des changements sur TOUS les boutons radio du bloc de livraison
document.querySelectorAll('input[name="carrier"], input[name="delivery_method"]').forEach(input => {
    input.addEventListener("change", updateTotal);
});

// Initialisation au chargement de la page
updateTotal();