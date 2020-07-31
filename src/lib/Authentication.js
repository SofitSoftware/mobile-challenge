const config = require('../config/config.js');
const Mongo = require('../lib/Mongo.js');

const users = config.users;

class Authentication {

    async validate(request, token, h) {

        const validToken = await Mongo.findOne({
            collection: 'token',
            query: {
                token: token
            }
        });

        if (!validToken) {
            return {
                credentials: null,
                isValid: false
            };
        }

        const credentials = {
            email: validToken.email,
            token: validToken.token
        };

        return {
            isValid: true,
            credentials
        };
    };

};

module.exports = new Authentication();