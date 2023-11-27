const fs = require('fs');
module.exports.execute = function ({ res , req ,arg, config }) {
    let activeCaptchaPath = config.path.temp+'activeCaptcha.json';
    let activeCaptchaPathRequire = config.path.temp+'activeCaptcha.json';
    activeCaptchaPath = require('path').resolve(activeCaptchaPath);
    activeCaptchaPathRequire = require('path').relative(__dirname, activeCaptchaPathRequire);
    let messagePath = config.path.message
    let messagePathRequire = config.path.message
    messagePath = require('path').resolve(messagePath);
    messagePathRequire = require('path').relative(__dirname, messagePathRequire);
    //si le fichier message.json n'existe pas, le crée
    if (!fs.existsSync(messagePath)) {
        fs.writeFileSync(messagePath, '[]');
    }

    let {name, email, message, captcha, captchaId} = arg[0];
    //vérifie que les champs sont remplis
    if (!name || !email || !message || !captcha || !captchaId) {
        res.send({ error: 'Veuillez remplir tous les champs.', code: 1 });
        return;
    }
    //vérifie que le captcha est valide
    const activeCaptcha = require(activeCaptchaPathRequire);
    if (!activeCaptcha[captchaId]) {
        res.send({ error: 'Captcha inexistant.', code: 2 });
        return;
    }
    if (activeCaptcha[captchaId].text !== captcha) {
        //ajoute une tentative au captcha
        activeCaptcha[captchaId].tentatives++;
        res.send({ error: 'Captcha invalide.', code: 3 });
        return;
    }
    //verifie que l'ip correspond
    if (activeCaptcha[captchaId].ip !== req.ip) {
        res.send({ error: 'Captcha invalide.', code: 3 });
        return;
    }
    //vérifie que les tentatives ne sont pas supérieures à 3
    if (activeCaptcha[captchaId].tentatives > 3) {
        res.send({ error: 'Trop de tentatives.', code: 4 });
        //supprime le captcha
        delete activeCaptcha[captchaId];
        fs.writeFileSync(activeCaptchaPath, JSON.stringify(activeCaptcha));

        //supprime le fichier
        if (fs.existsSync(config.path.media+`/img/captcha/${captchaId}.png`)) {
            fs.unlinkSync(config.path.media+`/img/captcha/${captchaId}.png`);
        }
        return;
    }
    //vérifie que l'email est valide (regex)
    const emailRex = new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$');
    if (!emailRex.test(email)) {
        res.send({ error: 'Email invalide.', code: 5 });
        return;
    }
    //save les messages dans un fichier json
    const messages = require(messagePathRequire)
    messages.push({ name, email, message, time: Date.now() });
    fs.writeFileSync(messagePath, JSON.stringify(messages));
    //delete le captcha
    delete activeCaptcha[captchaId];
    fs.writeFileSync(activeCaptchaPath, JSON.stringify(activeCaptcha));
    //supprime le fichier
    if (fs.existsSync(config.path.media+`/img/captcha/${captchaId}.png`)) {
        fs.unlinkSync(config.path.media+`/img/captcha/${captchaId}.png`);
    }
    //renvoie une réponse au client
    res.send({ error: null, code: 0 });
}
