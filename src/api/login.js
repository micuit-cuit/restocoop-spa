const { createHmac } = require('node:crypto');
const { Log } = require('../../log.js');
const log = new Log();
module.exports.execute = function ({ res, arg, config, userDb }) {
    if (arg.length != 1) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'missing argument'}));
        res.end();
        return;
    }
    let { login, password, email } = arg[0]
    //vérification des arguments
    if (!(login || email) || !password) {
        res.writeHead(400, {'Content-Type': 'text/json'});
        res.write(JSON.stringify({status: 'error', message: 'missing argument'}));
        res.end();
        return;
    }
    //chiffrement du mot de passe en sha256
    password = createHmac('sha256', password).digest('hex');
    const client = userDb
    //login l'utilisateur
    client.query(`SELECT * FROM userdb WHERE (username = '${login}' OR email = '${email}') AND password = '${password}'`)
        .then((user) => {
            user = user.rows
            if (user.length > 0){ 
                //création du token
                let token = createHmac('sha256', login + email + password+Date.now()).digest('hex');
                //mise à jour du token dans la base de données
                client.query(`UPDATE userdb SET token = '${token}' WHERE (username = '${login}' OR email = '${email}') AND password = '${password}'`)
                    .then((user) => {
                        if (user) {
                            res.writeHead(200, {'Content-Type': 'text/json'});
                            res.write(JSON.stringify({status: 'success', message: 'user logged', token: token}));
                            res.end();
                        }
                    })
                    .catch((err) => {
                        log.error(err);
                        res.writeHead(400, {'Content-Type': 'text/json'});
                        res.write(JSON.stringify({status: 'error', message: 'internal error'}));
                        res.end();
                    })
            } else {
                res.writeHead(400, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({status: 'error', message: 'user not logged'}));
                res.end();
            }
        })
        .catch((err) => {
            res.writeHead(400, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({status: 'error', message: 'user not logged'}));
            res.end();
        })
}
