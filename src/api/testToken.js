const { Log } = require('../../log.js');
const log = new Log();
module.exports.execute = function ({ res, arg, config , userDb}) {
    let { token } = arg[0]
    //test si le token existe dans la base de données
    const client = userDb
    client.query(`SELECT * FROM userdb WHERE token = '${token}'`)
        .then((user) => {
            user = user.rows
            if (user.length > 0){ 
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({message: 'token valide', status: true}));
                res.end();
            } else {
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.write(JSON.stringify({message: 'token invalide', status: false}));
                res.end();
            }
        })
        .catch((err) => {
            res.writeHead(400, {'Content-Type': 'text/json'});
            res.write(JSON.stringify({message: 'token invalide', status: false}));
            res.end();
        })
}