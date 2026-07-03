// ==========================================
// CONFIGURATION ET CONNEXION FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    console.log("Système synchronisé prêt.");
    
    const sizeButtons = document.querySelectorAll(".size-btn");
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    const stockIndicator = document.getElementById("stock-indicator");
    const mainImg = document.querySelector(".main-product-image");
    const thumbBtns = document.querySelectorAll(".thumb-btn");
    
    let selectedSize = "";
    // Valeurs temporaires locales en attendant la réponse du serveur
    let globalStockData = { "S": 5, "M": 5, "L": 5, "XL": 5 }; 

    localStorage.removeItem("lun_selected_size");

    // ==========================================
    // FONCTION MISE À JOUR VISUELLE DES BOUTONS DE TAILLE
    // ==========================================
    function applyStockRestrictions() {
        sizeButtons.forEach(btn => {
            const sizeName = btn.textContent.trim();
            const currentStock = (globalStockData && globalStockData[sizeName] !== undefined) ? globalStockData[sizeName] : 0;

            if (currentStock <= 0) {
                btn.classList.add("out-of-stock");
                btn.disabled = true;
                btn.style.opacity = "0.3";
                btn.style.textDecoration = "line-through";
                btn.style.pointerEvents = "none";
            } else {
                // Réactive le bouton si le stock est revenu dans Firebase
                btn.classList.remove("out-of-stock");
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.textDecoration = "none";
                btn.style.pointerEvents = "auto";
            }
        });
    }

    // Applique d'abord le visuel par défaut
    applyStockRestrictions();

    // ==========================================
    // CONNEXION REELLE FIREBASE EN DIRECT
    // ==========================================
    try {
        const productRef = doc(db, "products", "thI3NU9kSkaT22ZSc84m");
        const productSnap = await getDoc(productRef);

        if (productSnap.exists() && productSnap.data().stock) {
            // CONNEXION REUSSIE : On remplace les fausses données par la bdd réelle
            globalStockData = productSnap.data().stock;
            console.log("Connecté à la base de données ! Stocks réels :", globalStockData);
            
            // On met à jour les boutons selon le vrai stock Firebase
            applyStockRestrictions();
        } else {
            console.warn("Connecté à Firebase, mais le document ou le champ 'stock' est introuvable.");
        }
    } catch (error) {
        console.error("Erreur de liaison Firebase :", error);
    }

    // ==========================================
    // CLIC SUR LES TAILLES AVEC AFFICHAGE DU VRAI STOCK
    // ==========================================
    sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.classList.contains("out-of-stock")) return;

            selectedSize = btn.textContent.trim();
            localStorage.setItem("lun_selected_size", selectedSize);
            
            sizeButtons.forEach(b => b.classList.remove("is-selected"));
            btn.classList.add("is-selected");
            
            if (stockIndicator) {
                stockIndicator.classList.remove("show");

                setTimeout(() => {
                    if (globalStockData && globalStockData[selectedSize] !== undefined) {
                        const stockQuantity = parseInt(globalStockData[selectedSize], 10);
                        
                        if (stockQuantity === 1) {
                            stockIndicator.textContent = `Dépêchez-vous, il ne reste plus qu'une seule pièce en taille ${selectedSize}`;
                            stockIndicator.style.color = "#ff4d4d";
                        } else if (stockQuantity <= 5) {
                            stockIndicator.textContent = `Attention, il ne reste plus que ${stockQuantity} pièces en taille ${selectedSize}`;
                            stockIndicator.style.color = "#ff9900";
                        } else {
                            stockIndicator.textContent = `Stock disponible : ${stockQuantity} pièces en taille ${selectedSize}`;
                            stockIndicator.style.color = "#333333";
                        }
                    }
                    stockIndicator.classList.add("show");
                }, 150);
            }
        });
    });

    // ==========================================
    // CARROUSEL / IMAGES AUTOMATIQUES
    // ==========================================
    let currentImgIndex = 0;
    let autoScrollInterval;

    function changeImage(index) {
        if (!mainImg || thumbBtns.length === 0) return;
        if (index >= thumbBtns.length) index = 0;
        currentImgIndex = index;

        // 1. Déclenche la disparition lente et le léger zoom
        mainImg.classList.add("fade-out");

        // 2. On attend la moitié de la transition (400ms) pour changer l'image en arrière-plan
        setTimeout(() => {
            thumbBtns.forEach(b => b.classList.remove("is-active"));
            if (thumbBtns[currentImgIndex]) {
                thumbBtns[currentImgIndex].classList.add("is-active");
            }

            const newSrc = thumbBtns[currentImgIndex].getAttribute("data-src");
            if (newSrc) mainImg.src = newSrc;
        }, 400);

        // 3. Une fois l'image changée, on la fait réapparaître en douceur
        setTimeout(() => {
            mainImg.classList.remove("fade-out");
        }, 450);
    }

    if (thumbBtns.length > 0) {
        thumbBtns.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                changeImage(index);
                clearInterval(autoScrollInterval);
                startAutoScroll();
            });
        });
    }

    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            currentImgIndex++;
            changeImage(currentImgIndex);
        }, 4000);
    }

    startAutoScroll();

    // ==========================================
    // PANIER & REDIRECTION
    // ==========================================
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            if (!selectedSize) {
                alert("Veuillez sélectionner une taille avant de continuer.");
                return;
            }

            const itemToCart = {
                name: "Le premier",
                price: 25.00,
                size: selectedSize,
                image: "tshirt-face.PNG"
            };

            localStorage.setItem("lun_cart", JSON.stringify(itemToCart));
            alert(`Taille ${selectedSize} ajoutée au panier !`);
            window.location.href = "panier.html";
        });
    }
});