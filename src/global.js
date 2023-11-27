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