module.exports.execute = function ({ res, arg, config , client}) {
    let { token } = arg[0]
    //test si le token existe dans la base de données
    client.query(`SELECT * FROM userdb WHERE token = '${token}'`)
        .then((user) => {
            user = user.rows
            if (user.length > 0){ 
                //renvoie les informations de l'utilisateur (sauf le mot de passe)
                res.writeHead(200, {'Content-Type': 'text/json'});
                let {username, email} = user[0]
                res.write(JSON.stringify({message: {login:username, email}, status: true}));
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