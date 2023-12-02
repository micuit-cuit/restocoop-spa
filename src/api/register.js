const { createHmac } = require('node:crypto');
const { Log } = require('../../log.js');
const log = new Log();
module.exports.execute = function ({ res, arg, config , userDb}) {
    let { login, password, email } = arg[0]
    //vérification des données
    console.log (login, password, email, arg);
    if (!login || !password || !email) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'missing data'}));
        res.end();
        return;
    }else if (login.length < 3 || password.length < 3 || email.length < 3) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'data too short'}));
        res.end();
        return;
    } else if (login.length > 20 || password.length > 20 || email.length > 20) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'data too long'}));
        res.end();
        return;
    } else if (!email.includes('@')) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'email invalid'}));
        res.end();
        return;
    } else if (login.includes(' ')) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'login invalid'}));
        res.end();
        return;
    } else if (password.includes(' ')) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'password invalid'}));
        res.end();
        return;
    }
    //chiffrement du mot de passe en sha256
    password = createHmac('sha256', password).digest('hex');
    let token = createHmac('sha256', login + email + password+Date.now()).digest('hex');
    //création de l'utilisateur dans la base de données (userdb table)

    const client = userDb
    //test si l'utilisateur existe déjà dans la base de données en sql
    //création de l'utilisateur dans la base de données (userdb table)
    client.query(`INSERT INTO userdb (username, password, email, token) VALUES ('${login}', '${password}', '${email}', '${token}')`)
        .then((user) => {
            if (user) {
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({status: 'success', message: 'user created', token: token}));
                res.end();
            }
        })
        .catch((err) => {
            res.writeHead(400, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({status: 'error', message: 'user already exists'}));
            res.end();
        })
}
