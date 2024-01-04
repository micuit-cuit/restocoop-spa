const { Log } = require('../../log.js');
const log = new Log();
module.exports.execute = function ({ res, arg, config , client , models }) {
    const { UserDB } = models;
    let { token } = arg[0]
    UserDB.findOne({where: {token: token}})
        .then((user) => {
            if (!user) {
                throw new Error('token invalide');
            }
            //Si le token est valide on renvoie un status 200
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({message: 'token valide', status: true}));
            res.end();
        })
        .catch((err) => {
            //Si le token est invalide on renvoie un status 401
            res.writeHead(401, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({message: 'token invalide', status: false}));
            res.end();
        })}