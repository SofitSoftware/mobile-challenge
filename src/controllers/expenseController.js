'use strict';

const Mongo = require('../lib/Mongo.js');
const EXP_COLLECTION = 'expenses';

class BugsController {

    async getOne(request, h) {

        const mongo = new Mongo();

        let record = await mongo.findOneById( request.auth.credentials.email,  request.params.id );
        
        if(!record) {
            
            return h.response('Registro não encontrado').code(404);
        }

        return record;

    }

    async getAll(request, h) {

        const mongo = new Mongo();

        const page = request.query.page;
        const perPage = request.query.perPage;

        let records = await mongo.find({
            collection: request.auth.credentials.email,
            query: {},
            skip: (perPage * page) - perPage,
            limit: perPage
        });

        return records;

    }

    async insertOne(request, h) {

        const mongo = new Mongo();

        let result = await mongo.insert({
            collection: request.auth.credentials.email,
            body: request.payload
        });

        if(!result){
            return h.response('Erro ao processar requisição').code(400);
        }

        return h.response(result.insertedId).code(201);

    }

    async editOne(request, h) {

        const mongo = new Mongo();

        let result = await mongo.update(request.auth.credentials.email, request.params.id, request.payload);

        if (!result || result && result.n) {

            return h.response('Registro não encontrado').code(404);
        }

        return result;

    }

    async deleteOne(request, h) {

        const mongo = new Mongo();

        let result = await mongo.delete(request.auth.credentials.email, request.params.id);

        if (!result || result && result.n) {

            return h.response('Registro não encontrado').code(404);
        }

        return result;

    }

}

module.exports = new BugsController();