//script
const serverUrl =""// "/api/redirect?url=http://82.67.25.177";
console.log("productsPreview", window.products);

function getCategories() {
    fetch(serverUrl+"/api/categories")
        .then(response => response.json())
        .then(data => {
            let categories = data.data;
            let categoriesDiv = document.getElementById("categories");
            categoriesDiv.innerHTML = "";
            console.log(categories, data);
            for (let i = 0; i < categories.length; i++) {
                let category = categories[i];
                //get image from category
                let image
                if (category.assets.length > 0) {
                    image = category.assets[0].url;
                }
                let categoryDiv = document.createElement("div");
                categoryDiv.classList.add("category");
                categoryDiv.onclick = function () {
                    getProducts(category.id);
                }
                categoryDiv.id = "category-" + category.id;
                categoryDiv.innerHTML = "<img src='" + image + "' alt='" + category.name + "' class='category--img'><h2>" + category.name + "</h2>"
                categoriesDiv.appendChild(categoryDiv);
            };
        });
}
function getProducts(categoryId = null) {
    displayLoading();
    //get products from api
    fetch(serverUrl+"/api/products" + (categoryId?"/"+categoryId:""))
        .then(response => response.json())
        .then(data => {
            clearLoading()
            console.log(data);
            let products = data.data;
            let productsDiv = document.getElementById("products");
            productsDiv.innerHTML = "";
            for (let i = 0; i < products.length; i++) {
                //crée des cartes pour chaque produit
                /*
                -----------
                |produitName|
                |produitImg |
                |produitPrice   quantité ajouter au panier|
                -----------
                */
                let productsContainer = document.createElement("div");
                productsContainer.innerHTML = `
                        <div class="products--container--body" id="product-${products[i].id}">
                            <img src="${products[i].image.url}" alt="${products[i].name}" class="products--container--img">
                            <div class="products--container--title">
                                <h2>${products[i].name}</h2>
                            </div>
                        </div>
                        `;
                //si on clique sur le produit sa le rajoute au panier
                console.log(0);
                productsContainer.onclick = function () {
                    console.log(1);
                    //crée un popup pour: afficher le produit, les details, la quantité, le prix, le bouton ajouter au panier
                    let product = products[i];
                    let popup = document.createElement("div");
                    popup.classList.add("popup");
                    popup.innerHTML = `
                        <div class="popup--container">
                            <div class="popup--container--header">
                                <h2>${product.name}</h2>
                            </div>
                            <div class="popup--container--body">
                                <img src="${product.image.url}" alt="${product.name}" class="popup--container--body--img">
                                <div class="popup--container--body--details">
                                    <p>${product.description}</p>
                                    <p>${products[i].price.formatted}€/${products[i].sku}</p>
                                    <div class="popup--container--body--details--quantity">
                                        <div class="products--container--quantity"> <input type="number" value="1" min="1" max="${products[i].inventory.available / 10}" id="quantity-${products[i].id}"> <label for="quantity-${products[i].id}">✗ 10 kg</label></div>
                                        <button class="add-to-cart" id="add-to-cart-${i}" img="${products[i].image.url}"><i class="fa-solid fa-cart-plus"></i></button>
                                    </div>
                                </div>
                            </div>
                            <style>
                            .popup{
                                position:absolute;
                                top:0;
                                left:0;
                                width:100%;
                                height:100%;
                                background-color:#00000050;
                            }
                            .popup--container{
                                position:absolute;
                                top:50%;
                                left:50%;
                                transform:translate(-50%,-50%);
                                width:80%;
                                height:80%;
                                background-color:white;
                                color:black;
                                border-radius:10px;
                                overflow:hidden;
                            }
                            /* Popup  container */
                            #page-Import div .popup--container{
                            flex-direction:column;
                            }

                            /* Popup  container  header */
                            .popup .popup--container--header{
                            display:flex;
                            justify-content:space-between;
                            width:100%;
                            }

                            /* Popup  container */
                            #productsPreview .popup .popup--container{
                            display:flex;
                            justify-content:normal;
                            align-items:center;
                            width:40%;
                            height:40%;
                            }

                            /* Popup  container  body */
                            .popup .popup--container--body{
                            width:100%;
                            display:flex;
                            flex-direction:column;
                            align-items:center;
                            }

                            /* Popup  container  body */
                            #page-Import div div #productsPreview .popup .popup--container .popup--container--body{
                            height:100% !important;
                            }

                            /* Image */
                            .popup .popup--container--body--img{
                            width:25%;
                            border-top-left-radius:30px;
                            border-top-right-radius:30px;
                            border-bottom-left-radius:30px;
                            border-bottom-right-radius:30px;
                            }

                            /* Image */
                            #page-Import div div #productsPreview .popup .popup--container .popup--container--body .popup--container--body--img{
                            height:auto !important;
                            }

                            /* Division */
                            .popup .popup--container--body--details{
                            margin-top:30px;
                            }


                        </div>
                        `;
                        console.log(popup);
                        document.getElementById("productsPreview").appendChild(popup);
                        let addToCartButton = document.getElementById("add-to-cart-"+i);
                        addToCartButton.onclick = function (event) {
                            console.log("add to cart");
                            let quantity = popup.querySelector(".products--container--quantity input").value * 10;
                            addInCart(products[i].id, quantity, event)
                            popup.remove();
                        }
                        popup.onclick = function (e) {
                            console.log(3);
                            if (e.target == popup) {
                                console.log("close");
                                popup.remove();
                            }
                        }
                        console.log(2);
                }
                productsContainer.classList.add("products--container");
                productsDiv.appendChild(productsContainer);
            }
        });
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

}
function addInCart(productId, quantity, event) {
    //crée une img qui va de la position de l'element cliquer a la position du panier
    //et le panier mange l'image
    let cartDiv = document.getElementById("panier");
    let productsPreview = document.getElementById("productsPreview");
    let productsPreviewPosition = productsPreview.getBoundingClientRect();
    let cartPosition = cartDiv.getBoundingClientRect();
    let img = document.createElement("img");
    console.log(event.target);
    img.src = event.target.getAttribute("img") || "https://s2.qwant.com/thumbr/474x355/d/b/15ac021101131d183d2e6f9a4cbcb9283c673e0af5e7df2913fe2dbad8c40b/th.jpg?u=https%3A%2F%2Ftse.mm.bing.net%2Fth%3Fid%3DOIP.rExqAS6nxccIjikCQQdfvQHaFj%26pid%3DApi&q=0&b=1&p=0&a=0"
    img.style.position = "absolute";
    img.style.top = (event.clientY - 50 - productsPreviewPosition.top) + "px"; 
    img.style.left = (event.clientX - 50 - productsPreviewPosition.left) + "px";
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.borderRadius = "50%";
    img.style.transition = "all 1s";
    productsPreview.appendChild(img);
    console.log(cartPosition, img);
    setTimeout(function () {
        img.style.top = (cartPosition.top + cartPosition.height / 2 - 5 - productsPreviewPosition.top) + "px";
        img.style.left = (cartPosition.left + cartPosition.width / 2 - 5 - productsPreviewPosition.left) + "px";
        img.style.width = "10px";
        img.style.height = "10px";
    }, 10);
    setTimeout(function () {
        img.remove();
    }, 1000);
    //quand l'image arrive au panier, le panier grossi
    cartDiv.style.transition = "all 0.1s";
    setTimeout(function () {
        cartDiv.style.transform = "scale(1.2)";
    },900);
    setTimeout(function () {
        cartDiv.style.transform = "scale(1)";
    },1000);
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
                addInCart(productId, quantity, event);
            }
        );
    } else {
//add product in cart
        fetch(serverUrl+"/api/addPanier/" + cartDiv + "/" + productId + "/" + quantity)
            .then(response => response.json())
            .then(data => {
                

            }
        );
    }
}

window.onload = function () {
    //si window.products est un objet html alors on le remplace par undefined
    if (window.products instanceof HTMLElement) {
        window.products = undefined;
    }
    let fullScreen = document.getElementById("fullScreen");
    let panier = document.getElementById("panier");
    if (window.products != undefined) {
        fullScreen.style.display = "none";
        panier.style.display = "none";
    }
    let fullScreenToggle = false;
    fullScreen.onclick = function () {
        //met en plainne ecrant #productsPreview 
        let productsPreview = document.getElementById("productsPreview");
        //utilise le systhem natif de full screen
        if (fullScreenToggle) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullScreenToggle = false;
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
                fullScreenToggle = false;
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
                fullScreenToggle = false;
            }
            //change l'icone
            fullScreen.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M200 32H56C42.7 32 32 42.7 32 56V200c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79L73 295c-6.9-6.9-17.2-8.9-26.2-5.2S32 302.3 32 312V456c0 13.3 10.7 24 24 24H200c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H456c13.3 0 24-10.7 24-24V312c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2V56c0-13.3-10.7-24-24-24H312c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S209.7 32 200 32z"/></svg>`;
        }else{
            if (productsPreview.requestFullscreen) {
                productsPreview.requestFullscreen();
                fullScreenToggle = true;
            } else if (productsPreview.webkitRequestFullscreen) {
                productsPreview.webkitRequestFullscreen();
                fullScreenToggle = true;
            } else if (productsPreview.msRequestFullscreen) {
                productsPreview.msRequestFullscreen();
                fullScreenToggle = true;
            }
            //change l'icone
            fullScreen.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M456 224H312c-13.3 0-24-10.7-24-24V56c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l40 40L442.3 5.7C446 2 450.9 0 456 0s10 2 13.7 5.7l36.7 36.7C510 46 512 50.9 512 56s-2 10-5.7 13.7L433 143l40 40c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8zm0 64c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-40 40 73.4 73.4c3.6 3.6 5.7 8.5 5.7 13.7s-2 10-5.7 13.7l-36.7 36.7C466 510 461.1 512 456 512s-10-2-13.7-5.7L369 433l-40 40c-6.9 6.9-17.2 8.9-26.2 5.2s-14.8-12.5-14.8-22.2V312c0-13.3 10.7-24 24-24H456zm-256 0c13.3 0 24 10.7 24 24V456c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-40-40L69.7 506.3C66 510 61.1 512 56 512s-10-2-13.7-5.7L5.7 469.7C2 466 0 461.1 0 456s2-10 5.7-13.7L79 369 39 329c-6.9-6.9-8.9-17.2-5.2-26.2s12.5-14.8 22.2-14.8H200zM56 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l40-40L5.7 69.7C2 66 0 61.1 0 56s2-10 5.7-13.7L42.3 5.7C46 2 50.9 0 56 0s10 2 13.7 5.7L143 79l40-40c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2V200c0 13.3-10.7 24-24 24H56z"/></svg>`
        }
        //ecrit une fonction qui faire une alerte avec la taille de l'ecrant
    }
    if (window.products != undefined) {
        fullScreen.style.display = "none";
        panier.style.display = "none";
        console.log("recherche de produits:", window.products);
        const categories = document.getElementById("categories");
        //recupere la taille x de categories en js pure
        const products = document.getElementById("products");
        //ajoute la taille x de categories a products
        products.style.width = (categories.getBoundingClientRect().width + products.getBoundingClientRect().width) + "px"; 
        categories.style.display = "none";
        getProducts(window.products);

    }else{
        console.log("recherche de catégories + produits");
        getCategories();
        getProducts();
    }
}