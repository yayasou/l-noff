// ==========================================
// CONFIGURATION ET CONNEXION FIREBASE (Unique et propre)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVbsNAD1MfD_H2VtYjQPmRJzk58bIT7BA",
  authDomain: "lun-off.firebaseapp.com",
  projectId: "lun-off",
  storageBucket: "lun-off.firebasestorage.app",
  messagingSenderId: "305018698522",
  appId: "1:305018698522:web:75a666993ce8ef3b950b7b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {

    const cart = JSON.parse(localStorage.getItem("lun_cart"));
    if (!cart) return;

    const basePrice = cart.price;
    const userSelectedSize = cart.size ? cart.size.trim() : "";

    const sizeSelect = document.querySelector('select[name="size"]');
    if (sizeSelect && userSelectedSize) {
        sizeSelect.value = userSelectedSize;
    }

    const shippingPrices = {
        mondial_relay: 4.50,
        colissimo: 6.50,
        retrait_malakoff: 0
    };

    const shippingDisplay = document.getElementById("summary-shipping");
    const totalDisplay = document.getElementById("summary-total");
    const orderForm = document.querySelector(".order-form");
    const submitButton = document.querySelector(".order-form button[type='submit']");

    // STOCK CHECK
    if (userSelectedSize) {
        try {
            const productRef = doc(db, "products", "thI3NU9kSkaT22ZSc84m");
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const stockData = productSnap.data().stock;
                const realStockLeft = stockData[userSelectedSize] ?? 0;

                if (realStockLeft <= 0) {
                    alert(`Désolé, taille ${userSelectedSize} indisponible.`);

                    if (submitButton) {
                        submitButton.textContent = "Épuisé";
                        submitButton.disabled = true;
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function updateTotal() {
        const deliveryMethodEl = document.querySelector('input[name="delivery_method"]:checked');
        if (!deliveryMethodEl) return;

        const deliveryMethod = deliveryMethodEl.value;
        const shippingSubOptions = document.getElementById("shipping-sub-options");

        let shipping = 0;

    if (deliveryMethod === "livraison") {
    if (shippingSubOptions) shippingSubOptions.style.display = "block"; // <-- Modifié "flex" par "block"

    const selectedCarrier = document.querySelector('input[name="carrier"]:checked');
    if (selectedCarrier) {
        shipping = shippingPrices[selectedCarrier.value] || 0;
    }
} else {
    if (shippingSubOptions) shippingSubOptions.style.display = "none";
}

        if (shippingDisplay) {
            shippingDisplay.textContent = shipping === 0 ? "Gratuit" : shipping.toFixed(2) + " €";
        }

        if (totalDisplay) {
            totalDisplay.textContent = (basePrice + shipping).toFixed(2) + " €";
        }
    }

    document.querySelectorAll('input[name="carrier"], input[name="delivery_method"]')
        .forEach(i => i.addEventListener("change", updateTotal));

    updateTotal();

    // SUBMIT
    if (orderForm) {

        orderForm.addEventListener("submit", async (e) => {
    // 1. AJOUTE ÇA TOUT EN HAUT DU SUBMIT :
    if (!orderForm.checkValidity()) {
        // Si le HTML dit qu'il manque un champ, on laisse le comportement normal du navigateur afficher les alertes
        return; 
    }

    // On bloque l'envoi classique seulement si le formulaire est valide, pour pouvoir faire le traitement Firebase
    e.preventDefault();

    const btn = submitButton;
    if (!btn || btn.disabled) return;
    
    // ... tout le reste de ton code Firebase actuel ...

            btn.disabled = true;
            btn.textContent = "Traitement...";

            const method = document.querySelector('input[name="delivery_method"]:checked')?.value;
            const carrier = document.querySelector('input[name="carrier"]:checked');
            const relayInput = document.getElementById("input-relais");

            // RELAIS OBLIGATOIRE
            if (
                method === "livraison" &&
                carrier?.value === "mondial_relay" &&
                relayInput.value.trim() === ""
            ) {
                alert("Merci de renseigner votre Point Relais");

                btn.disabled = false;
                btn.textContent = "Envoyer la demande";
                relayInput.focus();
                return;
            }

            try {

                const shipping =
                    method === "livraison"
                        ? (shippingPrices[carrier?.value] || 0)
                        : 0;

                const prixHidden = document.getElementById("prix-hidden");
                const shippingHidden = document.getElementById("shipping-hidden");
                const totalHidden = document.getElementById("total-hidden");
                const carrierHidden = document.getElementById("carrier-hidden");

                if (prixHidden) prixHidden.value = basePrice;
                if (shippingHidden) shippingHidden.value = shipping;
                if (totalHidden) totalHidden.value = basePrice + shipping;
                if (carrierHidden) carrierHidden.value = carrier?.value || "";

                const ref = doc(db, "products", "thI3NU9kSkaT22ZSc84m");
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const stock = snap.data().stock;
                    const size = document.querySelector('select[name="size"]').value;

                    if (!stock || stock[size] <= 0) {
                        alert("Produit indisponible");

                        btn.disabled = false;
                        btn.textContent = "Envoyer la demande";
                        return;
                    }

                    await updateDoc(ref, {
                        [`stock.${size}`]: stock[size] - 1
                    });
                }

                orderForm.submit(); 

        } catch (err) {
                console.error(err);

                alert("Erreur");

                btn.disabled = false;
                btn.textContent = "Envoyer la demande";
            }
        });
    }
});