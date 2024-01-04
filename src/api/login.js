const { createHmac } = require('node:crypto');
const { Log } = require('../../log.js');
const log = new Log();

module.exports.execute = async function ({ res, arg, config, models }) {
    if (arg.length !== 1) {
        res.status(400).json({ status: 'error', message: 'missing argument' });
        return;
    }

    let { login, password, email } = arg[0];

    if (!(login || email) || !password) {
        res.status(400).json({ status: 'error', message: 'missing argument' });
        return;
    }
    console.log(models)
    const { UserDB } = models;

    try {
        password = createHmac('sha256', password).digest('hex');
        console.log(login, email, password)
        const user = await UserDB.findOne({
            where: {
                userName: login,
                password: password,
            },
        });
        console.log(user)

        if (user) {
            const token = createHmac('sha256', login + email + password + Date.now()).digest('hex');
            
            await user.update({ token: token });

            res.status(200).json({ status: 'success', message: 'user logged', token: token });
        } else {
            res.status(400).json({ status: 'error', message: 'user not logged' });
        }
    } catch (err) {
        log.error(err);
        res.status(500).json({ status: 'error', message: 'internal error' });
    }
};
