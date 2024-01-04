const { createHmac } = require('node:crypto');
const { Log } = require('../../log.js');
const log = new Log();

module.exports.execute = async function ({ res, arg, config, client, models }) {
    const { login, password, email } = arg[0];
    const { UserDB } = models;
     
    // Vérification des données
    console.log(login, password, email, arg);
    if (!login || !password || !email) {
        sendErrorResponse(res, 'missing data', 400);
        return;
    } else if (login.length < 3 || password.length < 3 || email.length < 3) {
        sendErrorResponse(res, 'data too short', 400);
        return;
    } else if (login.length > 20 || password.length > 20 || email.length > 255) {
        sendErrorResponse(res, 'data too long', 400);
        return;
    } else if (!email.includes('@')) {
        sendErrorResponse(res, 'email invalid', 400);
        return;
    } else if (login.includes(' ')) {
        sendErrorResponse(res, 'login invalid', 400);
        return;
    } else if (password.includes(' ')) {
        sendErrorResponse(res, 'password invalid', 400);
        return;
    }

    // Chiffrement du mot de passe en sha256
    const hashedPassword = createHmac('sha256', password).digest('hex');
    const token = createHmac('sha256', login + email + hashedPassword + Date.now()).digest('hex');

    try {
        // Création de l'utilisateur dans la base de données (userdb table)
        const user = await UserDB.create({
            userName: login,
            password: hashedPassword,
            email: email,
            token: token,
        });

        if (user) {
            sendSuccessResponse(res, 'user created', { token });
        }
    } catch (error) {
        sendErrorResponse(res, error.message, 500);
    }
};

function sendErrorResponse(res, message, status) {
    res.writeHead(status, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify({ status: 'error', message }));
    res.end();
}

function sendSuccessResponse(res, message, data) {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write(JSON.stringify({ status: 'success', message, ...data }));
    res.end();
}
