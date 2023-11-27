window.onload = function() {
    let mouse = document.querySelector('#mouse');
    //si on clique sur le bouton "mouse" on lance la fonction
    mouse.addEventListener('click', function() {
        let products = document.querySelector('#products');
        //on scroll jusqu'à l'élément "products"
        products.scrollIntoView({
            behavior: 'smooth'
        });
    }
    );
}