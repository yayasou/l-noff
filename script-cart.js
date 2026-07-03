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

    // Récupération du panier depuis le localStorage
    const cart = JSON.parse(localStorage.getItem("lun_cart"));

    // Si le panier est vide, on s'arrête là
    if (!cart) return;

    const basePrice = cart.price;
    const userSelectedSize = cart.size ? cart.size.trim() : "";

    // ----------------------------------------------------
    // CORRECTION ÉTAPE 4 : Sélection automatique de la taille dans le formulaire HTML
    // ----------------------------------------------------
    const sizeSelect = document.querySelector('select[name="size"]');
    if (sizeSelect && userSelectedSize) {
        sizeSelect.value = userSelectedSize;
    }

    // Grill tarifaire des transporteurs
    const shippingPrices = {
        mondial_relay: 4.50,
        colissimo: 6.50,
        retrait_malakoff: 0
    };

    const shippingDisplay = document.getElementById("summary-shipping");
    const totalDisplay = document.getElementById("summary-total");
    const orderForm = document.querySelector(".order-form"); 
    const submitButton = document.querySelector(".order-form button[type='submit']");

    // ==========================================
    // VERIFICATION DU STOCK DE LA TAILLE DU PANIER
    // ==========================================
    if (userSelectedSize) {
        try {
            const productRef = doc(db, "products", "thI3NU9kSkaT22ZSc84m");
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const stockData = productSnap.data().stock;
                const realStockLeft = stockData[userSelectedSize] !== undefined ? stockData[userSelectedSize] : 0;

                if (realStockLeft <= 0) {
                    alert(`Désolé, la taille ${userSelectedSize} vient tout juste de tomber en rupture de stock.`);
                    
                    if (submitButton) {
                        submitButton.textContent = `Taille ${userSelectedSize} épuisée`;
                        submitButton.disabled = true;
                        submitButton.style.opacity = "0.5";
                        submitButton.style.pointerEvents = "none";
                    }
                }
            }
        } catch (error) {
            console.error("Erreur de vérification des stocks dans le panier :", error);
        }
    }

    // ==========================================
    // CALCUL DYNAMIQUE DES FRAIS DE PORT ET DU TOTAL
    // ==========================================
    function updateTotal() {
        const deliveryMethodEl = document.querySelector('input[name="delivery_method"]:checked');
        if (!deliveryMethodEl) return;

        const deliveryMethod = deliveryMethodEl.value;
        const shippingSubOptions = document.getElementById("shipping-sub-options"); 
        let shipping = 0;

        if (deliveryMethod === "livraison") {
            if (shippingSubOptions) shippingSubOptions.style.display = "flex";
            
            const selectedCarrier = document.querySelector('input[name="carrier"]:checked');
            if (selectedCarrier) {
                shipping = shippingPrices[selectedCarrier.value] || 0;
            }
        } else {
            if (shippingSubOptions) shippingSubOptions.style.display = "none";
            shipping = shippingPrices["retrait_malakoff"];
        }

        if (shippingDisplay) {
            shippingDisplay.textContent = shipping === 0 ? "Gratuit" : shipping.toFixed(2) + " €";
        }

        if (totalDisplay) {
            const total = basePrice + shipping;
            totalDisplay.textContent = total.toFixed(2) + " €";
        }
    }

    document.querySelectorAll('input[name="carrier"], input[name="delivery_method"]').forEach(input => {
        input.addEventListener("change", updateTotal);
    });

    // ==========================================
    // SOUMISSION SECURISEE ET DESCENTE DES STOCKS
    // ==========================================
    if (orderForm) {
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            // On récupère la taille finale choisie dans le formulaire au cas où l'utilisateur l'a changée
            const finalSize = sizeSelect ? sizeSelect.value : userSelectedSize;

            if (!finalSize) {
                alert("Erreur : Aucune taille sélectionnée.");
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Traitement en cours...";
            }

            try {
                const productRef = doc(db, "products", "thI3NU9kSkaT22ZSc84m");
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const stockData = productSnap.data().stock;
                    const realStockLeft = stockData[finalSize] !== undefined ? stockData[finalSize] : 0;

                    if (realStockLeft <= 0) {
                        alert("Action impossible : Ce vêtement n'est plus disponible dans cette taille.");
                        if (submitButton) {
                            submitButton.textContent = `Taille ${finalSize} épuisée`;
                        }
                        return;
                    }

                    const newStockValue = realStockLeft - 1;

                    await updateDoc(productRef, {
                        [`stock.${finalSize}`]: newStockValue
                    });

                    orderForm.submit();

                } else {
                    alert("Erreur : Produit introuvable.");
                    if (submitButton) submitButton.disabled = false;
                }
            } catch (err) {
                console.error("Erreur lors de la mise à jour du stock :", err);
                alert("Une erreur est survenue, veuillez réessayer.");
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Faire une demande";
                }
            }
        });
    }

    updateTotal();
});