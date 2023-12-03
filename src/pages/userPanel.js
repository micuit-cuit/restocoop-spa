setTimeout(function () {
    if (getCookie("token") != "") {
        if (testToken(getCookie("token"))) {
            //appelle le server et recupere les informations de l'utilisateur
            fetch('/api/getUserInfo?token=' + getCookie("token"))
                .then(response => response.json())
                .then(data => {
                    if (data.status) {
                        console.log(data);
                        //affiche les informations de l'utilisateur
                        document.getElementById("userName").value = data.message.login;
                        document.getElementById("userEmail").value = data.message.email;
                    } else {
                        //si le token est invalide on redirige vers /login
                        window.location.replace("/");
                    }
                });
        }
    }
}, 500);