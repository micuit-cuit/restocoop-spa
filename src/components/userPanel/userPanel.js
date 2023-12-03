setTimeout(async function(){
    console.log("userPanel");
    //test si l'utilisateur est connecté (un cookie existe)
    let token = getCookie("token");
    let inioreToken
    console.log(token+" token");
    if (await testToken(token)) {
        console.log("user connected");
        //si l'utilisateur est connecté, on affiche le panel utilisateur
        document.getElementById("userPanelLink").style.display = "flex";
        document.getElementById("mainLogin").style.display = "none";
    }else{
        console.log("user not connected");
        //sinon on affiche le formulaire de connexion
        document.getElementById("userPanelLink").style.display = "none";
        document.getElementById("login").style.display = "block";
        //regarde si le block data est mis à jour, si oui on affiche le userPanelLink
        //test toute les 500ms
        let interval = setInterval(async function(){
            if (document.getElementById("userPanelLink").style.display == "none"){
                let token = getCookie("token");
                console.log(token+" token");
                if (token != "" && token != inioreToken){
                    console.log( await testToken(token));
                    if (await testToken(token)) {
                        console.log("user connected");
                        //si l'utilisateur est connecté, on affiche le panel utilisateur
                        document.getElementById("userPanelLink").style.display = "flex";
                        document.getElementById("mainLogin").style.display = "none";
                        console.log("clearInterval: "+interval);    
                        clearInterval(interval);
                    }else{
                        inioreToken = token
                    }
                }
            }
        },500);
    }
},500);
