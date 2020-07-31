const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const MONGO_DB_NAME = 'mobile-challenge';

const config = require('../config/config.js');

var _db = null;

class Mongo {

    static async getDb() {

        if (!_db) {

            console.log('vai abrir conexão');

            let client = await MongoClient.connect(config.mongoUrl);

            _db = client.db(MONGO_DB_NAME);

        }

        return _db;

    }

    static async find(options) {

        const db = await Mongo.getDb();

        if (options && !options.limit) {
            options.limit = 10000;
        }

        return db.collection(options.collection).find(options.query || options).sort(options.sort || {}).skip(options.skip).limit(options.limit).toArray();
    }

    static async findOne(options) {

        const db = await Mongo.getDb();

        return db.collection(options.collection).findOne(options.query);
    }

    static async findOneById(collection, id) {

        const db = await Mongo.getDb();

        if(!ObjectId.isValid(id)){
            return null;
        }

        return db.collection(collection).findOne({
            _id: new ObjectId(id)
        });
    }

    static async insert(options) {

        const db = await Mongo.getDb();

        return db.collection(options.collection).insertOne(options.body);
    }

    static async update(collection, id, body) {

        const db = await Mongo.getDb();
        
        let record = await Mongo.findOneById(collection, id);
        
        if(!record) {
            return null;
        }

        return db.collection(collection).replaceOne({
            
            _id: new ObjectId(id)

        }, body).then(result => {
            
            return result;

        }).catch(err => {

            throw err;

        });
    }

    static async delete(collection, id) {

        const db = await Mongo.getDb();

        let record = await Mongo.findOneById(collection, id);

        if (!record) {
            return null;
        }

        return db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    }

}

module.exports = Mongo;