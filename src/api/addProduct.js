module.exports.execute = function ({ apiKeys, res, arg , models }) {
    const { UserDB, Produit , Category } = models;
    if (!arg[0]) {
        sendErrorResponse(res, 'missing data', 400);
        return;
    }
    let { token, sku, name, categoryID, quantity, poids, prix, fournisseurID, imageUrl, description } = arg[0];
    // Vérification que le token correspond à l'utilisateur "admin"
    UserDB.findOne({ where: { token, userName: 'admin' } })
        .then(user => {
            if (user) {
                // Vérification des données
                if (!sku || !name || !categoryID || !quantity || !poids || !prix || !fournisseurID || !imageUrl || !description) {
                    sendErrorResponse(res, 'missing data', 400);
                    return;
                } else {
                    //decode uri les elements
                    sku = decodeURIComponent(sku);
                    name = decodeURIComponent(name);
                    categoryID = decodeURIComponent(categoryID);
                    quantity = decodeURIComponent(quantity);
                    poids = decodeURIComponent(poids);
                    prix = decodeURIComponent(prix);
                    fournisseurID = decodeURIComponent(fournisseurID);
                    imageUrl = decodeURIComponent(imageUrl);
                    description = decodeURIComponent(description);

                }
                
                if (sku.length < 1 || name.length < 3  || imageUrl.length < 3 || description.length < 3) {
                    sendErrorResponse(res, 'data too short', 400);
                    return;
                } else if (sku.length > 20 || name.length > 20 || imageUrl.length > 255 || description.length > 1024) {
                    sendErrorResponse(res, 'data too long', 400);
                    return;
                } else if (sku.includes(' ')) {
                    sendErrorResponse(res, 'sku invalid', 400);
                    return;
                } else if (categoryID.includes(' ')) {
                    sendErrorResponse(res, 'categoryID invalid', 400);
                    return;
                } else if (fournisseurID.includes(' ')) {
                    sendErrorResponse(res, 'fournisseurID invalid', 400);
                    return;
                } else if (imageUrl.includes(' ')) {
                    sendErrorResponse(res, 'imageUrl invalid', 400);
                    return;
                }
                // Vérification que la catégorie existe
                Category.findOne({ where: { id: categoryID } })
                    .then(category => {
                        if (category) {
                            console.log(Produit)
                            // Création du produit dans la base de données (product table)
                            Produit.create({
                                sku: sku,
                                name: name,
                                categoryID: categoryID,
                                quantity: quantity,
                                poids: poids,
                                prix: prix,
                                fournisseurID: fournisseurID,
                                imageUrl: imageUrl,
                                description: description
                            })
                            .then(newProduct => {
                                if (newProduct) {
                                    sendSuccessResponse(res, 'product created', { product: newProduct });
                                }
                            }
                            )
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