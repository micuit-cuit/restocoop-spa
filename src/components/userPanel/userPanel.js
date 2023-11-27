setTimeout(async function(){
    console.log("userPanel");
    //test si l'utilisateur est connecté (un cookie existe)
    let token = getCookie("token");
    console.log(token+" token");
    if (await testToken(token)) {
        console.log("user connected");
        //si l'utilisateur est connecté, on affiche le panel utilisateur
        document.getElementById("userPanelLink").style.display = "block";
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
                if (token != ""){
                    console.log( await testToken(token));
                    if (await testToken(token)) {
                        console.log("user connected");
                        //si l'utilisateur est connecté, on affiche le panel utilisateur
                        document.getElementById("userPanelLink").style.display = "block";
                        document.getElementById("mainLogin").style.display = "none";
                        console.log("clearInterval: "+interval);    
                        clearInterval(interval);
                    }
                }
            }
        },500);
    }
},500);
async function testToken(token){
    const response = await fetch('/api/testToken?token='+token);
    const data = await response.json();
    console.log(data);
    return data.status;
}
/*
           ^
          / \
         / I \
        /  I  \
       /   *   \
      /_________\
 code de developpement
*/
function deleteCookie() {
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.reload()
}