//script
console.log("panier.js");
setTimeout(function () {
    let deleteCart = document.getElementById("deleteCart");
    console.log(deleteCart);
    deleteCart.onclick = function () {
        fetch("/api/deletPanier/" + getCookie("panierid"))
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setCookie("panierid", "");
                updateMenu();
            }
            );
    }
}, 1000);
getPanier();
displayLoading();
function getPanier() {
    fetch("/api/getPanier/" + getCookie("panierid"))
        .then(response => response.json())
        .then(data => {
            clearLoading();
            document.getElementById("products").innerHTML = "";
            console.log(data);
            if(data.error){
                document.getElementById("products").innerHTML = `<h2>Votre panier na pas été trouvé, redirexion vers les produits...</h2>`;
                setTimeout(function(){
                    window.location.href = "/produits";
                }, 3000);
                return;
            }
            let line_items = data.line_items;
            line_items.forEach(line_item => {
                let product = document.createElement("div");
                product.classList.add("product");
                product.innerHTML = `
                <div class="product--image">
                    <img src="${line_item.image.url}" alt="${line_item.name}">
                </div>
                <div class="product--title">
                    <h2>${line_item.name}</h2>
                    <p>${line_item.price.formatted}€/${line_item.sku}</p>
                </div>
                <div class="product--quantity">
                    <input type="number" value="${/*modulo(*/line_item.quantity/*, 10)*/}" min="1" id="quantity-${line_item.id}"> <label for="quantity-${line_item.id}">✗ 10 kg</label>
                    <button class="product--quantity--delete" id="delete-${line_item.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
                `;
                document.getElementById("products").appendChild(product);
                document.getElementById("delete-" + line_item.id).onclick = function () {
                    fetch("/api/deleteLineItem/" + line_item.id)
                        .then(response => response.json())
                        .then(data => {
                            console.log(data);
                            getPanier();
                        });
                }
                document.getElementById("quantity-" + line_item.id).onchange = function () {
                    console.log(this.id.replace("quantity-", ""));
                    fetch("/api/editPanier/" + getCookie("panierid") + "/" + line_item.product_id + "/" + this.value)

                        .then(response => response.json())
                        .then(data => {
                            popUp("Le produit a bien été modifié");
                            getPanier();
                        });
                }
            });
        });
}
function modulo(a, b) {
    return a - Math.floor(a / b) * b;
}

function displayLoading() {
    let productsDiv = document.getElementById("products");
    productsDiv.innerHTML = `<h2>Loading...</h2>
    <style>
    #products h2{
        text-align:center;
        color:white;
        background-color:#0000002f;
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        display:flex;
        justify-content:center;
        align-items:center;
    </style>
    `
}
function clearLoading() {
    let productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";
}