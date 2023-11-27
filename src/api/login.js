const { createHmac } = require('node:crypto');
const fs = require('fs');
module.exports.execute = function ({ res, arg, config  }) {
    if (arg.length != 1) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'missing argument'}));
        res.end();
        return;
    }
    let { login, password, email } = arg[0]
    //vérification des arguments
    if (!login || !password || !email) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'missing argument'}));
        res.end();
        return;
    }
    //chiffrement du mot de passe en sha256
    password = createHmac('sha256', password).digest('hex');
    //création de l'utilisateur   
    if (!fs.existsSync(config.path.custom.db)) {
        fs.writeFileSync(config.path.custom.db, JSON.stringify([]));
    }
    let users = fs.readFileSync(config.path.custom.db, 'utf8');
    users = JSON.parse(users);
    //vérification si l'utilisateur existe dans la base de données (login ou email && password)
    let userExist = false;
    users.forEach(user => {
        if (user.login == login || user.email == email && !userExist ) {
            if (user.password == password) {
               //crée un token a renvoyé au client
                let token = createHmac('sha256', user.login + user.email + user.password+Date.now()).digest('hex');
                //ajoute le token a l'utilisateur
                user.token = token;
                //reponse au client
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({status: 'success', message: 'user connected', token: token}));
                res.end();
                //sauvegarde de la base de données
                fs.writeFileSync(config.path.custom.db, JSON.stringify(users));
                userExist = true;
            }else{
                res.writeHead(400, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({status: 'error', message: 'wrong password'}));
                res.end();
            }
        }
    });
    if (!userExist) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'user not found'}));
        res.end();
    }
}
