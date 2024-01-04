module.exports.execute = function ({ apiKeys, res, arg, models }) {
    const { UserDB, Category } = models;
    if (!arg[0]) {
        sendErrorResponse(res, 'missing data', 400);
        return;
    }
    const { token, name, description, imageUrl } = arg[0];

    // Check if the token corresponds to the "admin" user
    UserDB.findOne({ where: { token, userName: 'admin' } })
        .then(user => {
            if (user) {
                // Check for missing or invalid data
                if (!name || !imageUrl) {
                    sendErrorResponse(res, 'missing data', 400);
                    return;
                } else if (name.length < 3 || imageUrl.length < 3 || name.length > 20 || imageUrl.length > 255 || name.includes(' ') || imageUrl.includes(' ')) {
                    sendErrorResponse(res, 'invalid data', 400);
                    return;
                }

                // Check if the category already exists
                Category.findOne({ where: { name } })
                    .then(existingCategory => {
                        if (existingCategory) {
                            sendErrorResponse(res, 'category already exists', 400);
                        } else {
                            // Create the category in the database
                            Category.create({
                                name: name,
                                description: description,
                                imageUrl: imageUrl,
                            })
                            .then(newCategory => {
                                if (newCategory) {
                                    sendSuccessResponse(res, 'category created', { category: newCategory });
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
                sendErrorResponse(res, 'unauthorized', 401);
            }
        })
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