'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const config = require('./src/config/config.js');
const Path = require('path');
const AuthBearer = require('hapi-auth-bearer-token');

const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');

const startController = require('./src/controllers/startController.js');
const expenseController = require('./src/controllers/expenseController.js');

const authentication = require('./src/lib/Authentication.js');

const init = async () => {

    const server = Hapi.server({
        port: config.port,
        host: config.host,
        routes: {
            cors: true
        }
    });

    await server.register(AuthBearer);

    server.auth.strategy('simple', 'bearer-access-token', {
        validate: authentication.validate
    });

    server.auth.default('simple');

    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: {
                info: {
                    title: 'SOFIT Mobile Challenge API Docs'
                },
                securityDefinitions: {
                    'Bearer': {
                        'type': 'apiKey',
                        'name': 'Authorization',
                        'in': 'header'
                    }
                },
                security: [{
                    Bearer: []
                }],
            }
        }
    ]);

    server.route({
        method: 'GET',
        path: '/start/{email}',
        options: {
            description: 'API inicial',
            notes: 'Retorna o token de autenticação a ser usado nas requisições',
            auth: { 
                mode: 'optional' 
            },
            validate: {
                params: Joi.object({
                    email: Joi.string().email()
                })
            },
            tags: ['api']
        },
        handler: (request, h) => { 
            return startController.getToken(request, h);
        }
    });

    server.route({
        method: 'POST',
        path: '/expenses',
        options: {
            description: 'Cria uma despesa',
            notes: 'Insere uma despesa com os parâmetros especificados no payload',
            validate: {
                payload: Joi.object({
                    date: Joi.date().required(),
                    item: Joi.string().required(),
                    value: Joi.number().required(),
                    additionalInfo: Joi.object().optional()
                })
            },
            tags: ['api'],
        },
        handler: (request, h) => {
            return expenseController.insertOne(request, h);
        }
    });

    server.route({
        method: 'GET',
        path: '/expenses',
        options: {
            description: 'Busca a lista de despesas',
            notes: 'Retorna um array de `expenses`',
            validate: {
                query: Joi.object({
                    page: Joi.number().required(),
                    perPage: Joi.number().required().min(1).max(20)
                })
            },
            tags: ['api']
        },
        handler: (request, h) => {
            return expenseController.getAll(request, h);
        }
    });

    server.route({
        method: 'GET',
        path: '/expenses/{id}',
        options: {
            description: 'Busca uma despesa',
            notes: 'Retorna uma despesa especificada pelo `id` enviado.',
            validate: {
                params: Joi.object({
                    id: Joi.string()
                })
            },
            tags: ['api']
        },
        handler: (request, h) => {
            return expenseController.getOne(request, h);
        }
    });

    server.route({
        method: 'PUT',
        path: '/expenses/{id}',
        options: {
            description: 'Edita uma despesa',
            notes: 'Realiza o update de uma despesa definida pelo `id` enviado com os parâmetros especificados no payload.',
            validate: {
                params: Joi.object({
                    id: Joi.string()
                }),
                payload: Joi.object({
                    date: Joi.date().required(),
                    item: Joi.string().required(),
                    value: Joi.number().required(),
                    additionalInfo: Joi.object().optional()
                })
            },
            tags: ['api']
        },
        handler: (request, h) => {
            return expenseController.editOne(request, h);
        }
    });

    server.route({
        method: 'DELETE',
        path: '/expenses/{id}',
        options: {
            description: 'Deleta uma despesa',
            notes: 'Realiza a exclusão de uma despesa definida pelo `id` enviado.',
            validate: {
                params: Joi.object({
                    id: Joi.string()
                })
            },
            tags: ['api']
        },
        handler: (request, h) => {
            return expenseController.deleteOne(request, h);
        }
    });

    await server.start();

    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();