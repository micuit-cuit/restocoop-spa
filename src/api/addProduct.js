module.exports.execute = function ({ apiKeys, res, arg , models }) {
    const { UserDB, Product , Category } = models;
    if (!arg[0]) {
        sendErrorResponse(res, 'missing data', 400);
        return;
    }
    const { token, sku, name, categoryID, quantity, poids, prix, fournisseur, imageUrl, description } = arg[0];
    // Vérification que le token correspond à l'utilisateur "admin"
    UserDB.findOne({ where: { token, userName: 'admin' } })
        .then(user => {
            if (user) {
                // Vérification des données
                if (!sku || !name || !categoryID || !quantity || !poids || !prix || !fournisseur || !imageUrl || !description) {
                    sendErrorResponse(res, 'missing data', 400);
                    return;
                } else if (sku.length < 1 || name.length < 3 || categoryID.length < 3 || fournisseur.length < 3 || imageUrl.length < 3 || description.length < 3) {
                    sendErrorResponse(res, 'data too short', 400);
                    return;
                } else if (sku.length > 20 || name.length > 20 || categoryID.length > 20 || fournisseur.length > 20 || imageUrl.length > 255 || description.length > 255) {
                    sendErrorResponse(res, 'data too long', 400);
                    return;
                } else if (sku.includes(' ')) {
                    sendErrorResponse(res, 'sku invalid', 400);
                    return;
                } else if (name.includes(' ')) {
                    sendErrorResponse(res, 'name invalid', 400);
                    return;
                } else if (categoryID.includes(' ')) {
                    sendErrorResponse(res, 'categoryID invalid', 400);
                    return;
                } else if (fournisseur.includes(' ')) {
                    sendErrorResponse(res, 'fournisseur invalid', 400);
                    return;
                } else if (imageUrl.includes(' ')) {
                    sendErrorResponse(res, 'imageUrl invalid', 400);
                    return;
                } else if (description.includes(' ')) {
                    sendErrorResponse(res, 'description invalid', 400);
                    return;
                }
                // Vérification que la catégorie existe
                Category.findOne({ where: { categoryID } })
                    .then(category => {
                        if (category) {
                            // Vérification que le produit n'existe pas déjà
                            Product.findOne({ where: { sku } })
                                .then(product => {
                                    if (product) {
                                        sendErrorResponse(res, 'product already exists', 400);
                                    } else {
                                        // Création du produit dans la base de données (product table)
                                        Product.create({
                                            sku: sku,
                                            name: name,
                                            categoryID: categoryID,
                                            quantity: quantity,
                                            poids: poids,
                                            prix: prix,
                                            fournisseur: fournisseur,
                                            imageUrl: imageUrl,
                                            description: description
                                        })
                                            .then(product => {
                                                if (product) {
                                                    sendSuccessResponse(res, 'product created', { product });
                                                }
                                            })
                                            .catch(error => {
                                                sendErrorResponse(res, error.message, 500);
                                            });
                                    }
                                })
                                .catch(error => {
                                    sendErrorResponse(res, error.message, 500);
                                });
                        } else {
                            sendErrorResponse(res, 'category not found', 404);
                        }
                    })
                    .catch(error => {
                        sendErrorResponse(res, error.message, 500);
                    });
            }
        }
        )
        .catch(error => {
            sendErrorResponse(res, error.message, 500);
        });
}
function sendErrorResponse(res, message, code) {
    res.status(code).json({
        status: 'error',
        message: message,
    });
}
function sendSuccessResponse(res, message, data) {
    res.status(200).json({
        status: 'success',
        message: message,
        data: data,
    });
}