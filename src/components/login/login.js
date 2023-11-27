window.onload = function() {
    const username = document.getElementById("username");
    const password = document.getElementById("password");    
    const loginBt = document.getElementById("loginBt");
    const remember = document.getElementById("remember");
    const registerBtShow = document.getElementById("registerBtShow");
    const loginBtShow = document.getElementById("loginBtShow");

    const registerUsername = document.getElementById("register-username");
    const registerPassword = document.getElementById("register-password");
    const registerEmail = document.getElementById("register-email");
    const registerBt = document.getElementById("registerBt");

    console.log(loginBt, registerBt);
    loginBt.onclick = function() {
        console.log(username.value, password.value);
        fetch('/api/login?login='+username.value+'&password='+password.value)
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.token){
                let tokenStorage = document.getElementById("tokenStorage")
                tokenStorage.innerText=data.token
                setCookie("token",data.token,remember.checked?1:30)
            }
        });
    }
    registerBt.onclick = function() {
        console.log(registerUsername.value, registerPassword.value, registerEmail.value);
        fetch('/api/register?login='+registerUsername.value+'&password='+registerPassword.value+'&email='+registerEmail.value)
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.token){
                let tokenStorage = document.getElementById("tokenStorage")
                tokenStorage.innerText=data.token
                setCookie("token",data.token,1)
            }
        });
    }
    registerBtShow.onclick = function() {
        document.getElementById("login").style.transform = "translateX(-15vw)";
        document.getElementById("register").style.transform = "translateX(0)"
    }
    loginBtShow.onclick = function() {
        document.getElementById("login").style.transform = "translateX(0vw)";
        document.getElementById("register").style.transform = "translateX(15vw)";
    }
}