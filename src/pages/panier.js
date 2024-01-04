
console.log("panier.js");
const serverUrl =""// "/api/redirect?url=http://82.67.25.177";
//affiche le prix total du panier
function panier({ productId, quantity} = {}) {
    displayLoading(true);
    console.log("panier");
    //get cart from cookie
    let cart = getCookie("panierid");
    if (!cart) {
        //create cart if not exist
        fetch(serverUrl+"/api/createPanier")
            .then(response => response.json())
            .then(data => {
                console.log(data);
                let cart = data.id;
                setCookie("panierid", cart);
                fetch(serverUrl+"/api/addPanier/" + cart + "/" + productId + "/" + quantity)
                    .then(response => response.json())
                    .then(data => {
                        //recupere le panier
                        fetch(serverUrl+"/api/getPanier/" + cart)
                        .then(response => response.json())
                        .then(data => {
                            displayPanier(data);
                        }
                    );
                    }
                );
            }
        );
    } else if (productId && quantity) {
        //add product in cart
        fetch(serverUrl+"/api/addPanier/" + cart + "/" + productId + "/" + quantity)
            .then(response => response.json())
            .then(data => {
                //recupere le panier
                fetch(serverUrl+"/api/getPanier/" + cart)
                    .then(response => response.json())
                    .then(data => {
                        displayPanier(data);
                    }
                );
            }
        );
    }
    else {
        //recupere le panier
        fetch(serverUrl+"/api/getPanier/" + cart)
            .then(response => response.json())
            .then(data => {
                displayPanier(data);
            }
        );
    }
}
function displayPanier(panier) {
    displayLoading(false);

    console.log(panier);
    const total = panier.subtotal.formatted + "€";
    const products = panier.line_items;
    let html = "";
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        html += `<div class="product">
                    <div class="product-image">
                        <img src="${product.image.url}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.line_total.formatted}€</p>
                        <p>${product.quantity}${product.sku}</p>
                    </div>
                    <div class="product-remove">
                        <button onclick="removeProduct(${product.id})">X</button>
                    </div>
                </div>`;
    }
    html += `<div class="total">
                <p>Total : ${total}</p>
            </div>`;
    document.querySelector('#products').innerHTML = html;

}
window.onload = () =>{
    const loadingStrings = ["---", "-o-","ooo", "oo0", "o0o", "0oo", "00o", "000", "o0o", "0o0", "o0o","-o-"];
    let index = 0;
    const loadingText = document.querySelector('.loading-text');
    const loadingDiv = document.querySelector('#loading');
    function changeLoadingText() {
        loadingText.textContent = loadingStrings[index];
        index = (index + 1) % loadingStrings.length;
        setTimeout(changeLoadingText, 250);
    }
    changeLoadingText();
    function displayLoading( toggle = true ) {
        if ( toggle ) {
            loadingDiv.style.display = 'block';
            return;
        } 
        if ( !toggle ) {
            loadingText.textContent = '';
            loadingDiv.style.display = 'none';
            return;
        }

    }
    globalThis.displayLoading = displayLoading;

    let darkMode = localStorage.getItem("darkMode") || "dark";
    let darkModeCss = `
        :root{
        --white1: #000000;
        --black1: #ffffff;
        --grey1: #494b43;
        --grey2: #e5e9e4;
        --mode: black;
        --green3: #b2e71e;
        }
    `;
    //si le darkMode est activé
    if (darkMode === "dark") {
        const body = document.body;
        body.setAttribute("data-dark-mode", true);
        //crée une balise style #dark-mode et lui ajoute le contenu de la variable darkModeCss
        let darkModeStyle = document.createElement("style");
        darkModeStyle.setAttribute("id", "dark-mode-style");
        darkModeStyle.textContent = darkModeCss;
        document.body.appendChild(darkModeStyle);
    }




    panier();
}
GSM.on("panier", (data) => {
    console.log(data);
    panier(data);
})

