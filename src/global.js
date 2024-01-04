function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}
function setCookie(name, value, daysToExpire = 30, path = "/") {
    const expires = new Date();
    expires.setTime(expires.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const cookieValue = encodeURIComponent(value) + ((daysToExpire === null) ? '' : '; expires=' + expires.toUTCString()) + ((path === null) ? '' : '; path=' + path);
    document.cookie = name + '=' + cookieValue;
}

async function testToken(token){
    const response = await fetch('/api/testToken?token='+token);
    const data = await response.json();
    console.log(data);
    return data.status;
}
//GSM-TIF (Global System Messaging - Tabs and IFrames)
const GSM = {
    send: function(message, donnees) {
        localStorage.setItem(message, JSON.stringify(donnees));
    },
    on: function(message, callback) {
        window.addEventListener('storage', (event) => {
            if (event.key === message) {
                const donnees = JSON.parse(event.newValue);
                callback(donnees);
            }
        });
    }
};


/*
           ^
          / \
         / I \
        /  I  \
       /   *   \
      /_________\
 code de developpement
 attention, deleteCookie() est utilisé dans userPanel.html, bien pencé à le recoder plutard
*/
function deleteCookie() {
    document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.reload()
}