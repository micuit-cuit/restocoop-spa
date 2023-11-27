const serverUrl =""// "/api/redirect?url=http://82.67.25.177";

function displayCaptcha() {    
    fetch(serverUrl+'/api/creatCaptcha')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById('captcha-image').src = data.img;
        document.querySelector('input[name="captchaId"]').value = data.token;
    });
}
//change le captcha toutes les 10 minutes
setInterval(displayCaptcha, 600000);

window.onload = function() {
    document.getElementById('captcha-image').onclick = displayCaptcha;
    displayCaptcha();
    let submit = document.getElementById('submit');
submit.onclick = function (e) {
    e.preventDefault();
    let name = document.querySelector('input[name="name"]').value;
    let email = document.querySelector('input[name="email"]').value;
    let message = document.querySelector('textarea[name="message"]').value;
    let captcha = document.querySelector('input[name="captcha"]').value;
    let captchaId = document.querySelector('input[name="captchaId"]').value;
    fetch(serverUrl+'/api/newMessage?name=' + name + '&email=' + email + '&message=' + message + '&captcha=' + captcha + '&captchaId=' + captchaId)
    .then(response => response.json())
    .then(data => {
        //si il y a une erreur, créer une popup avec le message d'erreur
        let error = data.error;
        let code = data.code;
        //reinisialise le captcha si le code d'erreu est 234
        if (code === 2 || code === 3 || code === 4) {
            displayCaptcha();
        }
        if (error) {
            let popup = document.createElement('div');
            popup.classList.add('popup');
            popup.style = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: black;
                border-radius: 10px;
                border: solid red;
                border-width: 0 0 0 10px;
                padding: 10px;
                color: white;
            `
            popup.innerHTML = error;
            document.body.appendChild(popup);
            setTimeout(() => {
                popup.remove();
            }, 5000);
            return;
        }else{
            //si il n'y a pas d'erreur, créer une popup avec le message de succès
            let popup = document.createElement('div');
            popup.classList.add('popup');
            popup.style = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: black;
                border-radius: 10px;
                border: solid green;
                border-width: 0 0 0 10px;
                padding: 10px;
                color: white;
            `
            popup.innerHTML = 'Message envoyé avec succès.';
            document.body.appendChild(popup);
            setTimeout(() => {
                popup.remove();
            }, 5000);
        }
    })
}
}