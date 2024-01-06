//active le lien du menu correspondant à la page
function loadHeader() {
    //si on clique sur le menu openMenu, on affiche le menu
    const buttonPos = document.querySelector("#userButton").getBoundingClientRect();
    const openMenu = document.querySelector("#openMenu");
    const menu = document.querySelector(".header--menu");
    const UserData = document.querySelector("#UserData");
    UserData.style.left = buttonPos.left + "px";
    UserData.style.position = "absolute";
    const closeMenu = document.querySelector("#closeMenu");
    openMenu.addEventListener("click", () => {
        menu.classList.toggle("open");
    })
    closeMenu.addEventListener("click", () => {
        menu.classList.toggle("open");
    })
    //si on clique sur un lien du menu ou a l'exterieur du menu, on ferme le menu
    const links = document.querySelectorAll(".header--menu_link");
    links.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("open");
        })
    })
    //si la taille de l'ecran est inferieur a 1050px, on deplace le menu dans la div #header--menu
    const header = document.querySelector(".header--menu");
    const headerMenu = document.querySelector("#header--menu");
    if(window.innerWidth < 1050){
        headerMenu.appendChild(header);

    }
}
setTimeout( () => {
    loadHeader();
    const userButton = document.querySelector("#userButton");
    userButton.addEventListener("click", (e) => {
        const userMenu = document.querySelector("#UserData");
        function closeMenu(e){
            //iniore les clicks si on est apret la div #userButton dans le DOM
            if(e.target.closest("#UserData")){
                return;
            }
            // if(e.target != userMenu && e.target != userButton){
                userMenu.style.display = "none";
                document.removeEventListener("click", closeMenu);
            // }
        }
        if(userMenu.style.display == "none"){
            userMenu.style.display = "flex";
            setTimeout( () => {
                document.addEventListener("click", closeMenu);
            }, 100 );
        }

    })
}, 100 );