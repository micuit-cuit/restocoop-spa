module.exports.execute = function ({ apiKeys, res, config }) {
    fetch('https://api.chec.io/v1/categories', {
        headers: {
            "X-Authorization": apiKeys
        }
    })
        .then(res => res.json())
        .then(json => {
            if (config.devMode) {
                res.send(json)
                return
            }
            //ecrit un console.log en vert avec le message de réussite
            //envoie la réponse au client
            //cache les catégories répertoriées dans le config.hiddenCategories
            for (let i = 0; i < config.hiddenCategories.length; i++) {
                for (let j = 0; j < json.data.length; j++) {
                    if (json.data[j].name == config.hiddenCategories[i]) {
                        json.data.splice(j, 1)
                    }
                }
            }
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