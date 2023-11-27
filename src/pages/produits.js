//test si l'utilisateur est connecté (un cookie existe et est valide)
//si oui on redirige vers /produitAll
if (getCookie("token") != "") {
    if (testToken(getCookie("token"))) {
        window.location.replace("/produitAll");
    }
}