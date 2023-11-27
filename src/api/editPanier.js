module.exports.execute = function ({ apiKeys, res, arg  }) {
    fetch('https://api.chec.io/v1/carts/'+arg[0]+'/items/' + arg[1], { 
        headers: {
            "X-Authorization": apiKeys,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
            quantity: parseInt(arg[2] || NaN)
        })
    })
        .then(res => res.json())
        .then(json => {
            //ecrit un console.log en vert avec le message de réussite
            //envoie la réponse au client
            res.send(json)
        })
        .catch(err => {
            //ecrit un console.log en rouge avec le message d'erreur
            console.error('\x1b[31m%s\x1b[0m' + err)
            //envoie la réponse au client
            res.send(err)
        }
        )
}