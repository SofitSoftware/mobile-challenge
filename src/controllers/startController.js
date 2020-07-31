'use strict';

const Mongo = require('../lib/Mongo.js');
var jwt = require('jsonwebtoken');

class StartController {

    async getToken(request, reply) {

        let email = request.params.email;

        let userToken = await Mongo.findOne({
            collection: 'token',
            query: {
                email: email
            },
            limit: 1
        });

        if(!userToken) {
            userToken = {
                email: email,
                token: jwt.sign( { email: email }, 'shhhhh')
            };

            await Mongo.insert({
                collection: 'token',
                body: userToken
            });
        }

        return userToken;

    }

}

module.exports = new StartController();