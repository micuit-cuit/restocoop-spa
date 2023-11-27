fs = require('fs');
module.exports.execute = function ({ res, arg, config  }) {
    let { token } = arg[0]
    //test si le token existe dans la base de données
    let users = fs.readFileSync(config.path.custom.db, 'utf8');
    users = JSON.parse(users);
    let user = users.find(u => u.token == token)
    if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        let sendUser = {
            login: user.login,
            email: user.email,
        }
        res.end(JSON.stringify({ message: sendUser, status: true }));
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Token invalide", status: false }));
    }
}