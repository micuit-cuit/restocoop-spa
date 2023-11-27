module.exports.execute = function ({ apiKeys, res, arg }) {
    //récuperer la catégorie dans l'url
    fetch('https://api.chec.io/v1/products?' + (arg[0] ? 'category_id=' + arg[0] : ''), {
        headers: {
            "X-Authorization": apiKeys
        }
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