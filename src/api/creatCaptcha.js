const canvas = require('@napi-rs/canvas');
const fs = require('fs');
module.exports.execute = function ({ res , req, config }) {
    //suprime la partie chemin du fichier activeCaptcha qui corespend au dossier api
    //utilise les variables de config pour les modifications
    let activeCaptchaPath = config.path.temp+'/activeCaptcha.json';
    let activeCaptchaPathRequire = config.path.temp+'/activeCaptcha.json';
    //crée un chemin absolu vers le fichier activeCaptcha.json
    activeCaptchaPath = require('path').resolve(activeCaptchaPath);
    //activeCaptchaPathRequire est un chemin relatif au fichier actuel par a port a activeCaptchaPath
    activeCaptchaPathRequire = require('path').relative(__dirname, activeCaptchaPathRequire);
    //test si le fichier activeCaptcha.json existe et le crée si il n'existe pas
    if (!fs.existsSync(activeCaptchaPath)) {
        fs.writeFileSync(activeCaptchaPath, '{}');
    }
    //crée un canvas de 100x50
    //say le contenu du dossier actuel
    canvas.GlobalFonts.registerFromPath(config.path.font+'/Cattie.ttf', 'Cattie');
    //definie la taille du canvas en fonction du nombre de caractère max du captcha config.captchaLongeur[1]
    const canvasLongeur = config.captchaLongeur[1] * 30;
    const captcha = canvas.createCanvas(canvasLongeur, 50);
    //crée un contexte 2d
    const ctx = captcha.getContext('2d');
    //définie la couleur de fond du canvas, aléatoirement entre le 100% et 75% de rouge, vert et bleu
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 50 + 50)}%, ${Math.floor(Math.random() * 50 + 50)}%, ${Math.floor(Math.random() * 50 + 50)}%)`;
    //remplie le canvas avec la couleur définie
    ctx.fillRect(0, 0, canvasLongeur, 50);
    //définie la couleur de la police, aléatoirement entre le 0% et 25% de rouge, vert et bleu
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 50)}%, ${Math.floor(Math.random() * 50)}%, ${Math.floor(Math.random() * 50)}%)`;
    //définie la police
    ctx.font = '30px Cattie';
    //définie le texte à afficher, une chaine de 5 a 10 caractères aléatoires, en majuscules, minuscules et chiffres
    let captchaText = '';
    const possible = config.captchaCaractere;
    //utilise la plage de caractère de config.captchaLongeur (en [8, 10]) pour définir la longeur du captcha
    for (let i = 0; i < Math.floor(Math.random() * (config.captchaLongeur[1] - config.captchaLongeur[0]) + config.captchaLongeur[0]); i++) {
        captchaText += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    //ecrit en bas du canvas "click to refresh"
    let captchaToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    //affiche le texte sur le canvas
    //centre le texte sur le canvas
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(captchaText, canvasLongeur/2, 25);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('click to refresh', canvasLongeur/2, 35);
    //sauvegarde le canvas en png dans le dossier captcha avec le nom du token
    const buffer = captcha.toBuffer('image/png');
    //crée le dossier captcha si il n'existe pas
    if (!fs.existsSync(config.path.media+'/img/captcha')) {
        fs.mkdirSync(config.path.media+'/img/captcha');
    }
    fs.writeFileSync(config.path.media+`/img/captcha/${captchaToken}.png`, buffer);
    //sauvegarde {token: captchaToken, text: captchaText, ip: req.ip} dans le fichier activeCaptcha.json
    const activeCaptcha = require(activeCaptchaPathRequire);
    activeCaptcha[captchaToken] = { text: captchaText, ip: req.ip , time: Date.now() , tentatives: 0, token: captchaToken };
    fs.writeFileSync(activeCaptchaPath, JSON.stringify(activeCaptcha));
    //envoie la réponse au client
    res.send({ token: captchaToken , img: `/media/img/captcha/${captchaToken}.png` });
    setTimeout(() => {
        if (fs.existsSync(config.path.media+`/img/captcha/${captchaToken}.png`)) {
            fs.unlinkSync(config.path.media+`/img/captcha/${captchaToken}.png`);
        }
        const activeCaptcha = require(activeCaptchaPathRequire);
        delete activeCaptcha[captchaToken];
        fs.writeFileSync(activeCaptchaPath, JSON.stringify(activeCaptcha));
    }, 600000);
}
