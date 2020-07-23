const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const MONGO_DB_NAME = 'mobile-challenge';

const config = require('../config/config.js');

let _db;

class Mongo {

    async getDb() {

        if (!this._db) {

            let client = await MongoClient.connect(config.mongoUrl);

            this._db = client.db(MONGO_DB_NAME);

        }

        return this._db;

    }

    async find(options) {

        const db = await this.getDb();

        if (options && !options.limit) {
            options.limit = 10000;
        }

        return db.collection(options.collection).find(options.query || options).sort(options.sort || {}).skip(options.skip).limit(options.limit).toArray();
    }

    async findOne(options) {

        const db = await this.getDb();

        return db.collection(options.collection).findOne(options.query);
    }

    async findOneById(collection, id) {

        const db = await this.getDb();

        if(!ObjectId.isValid(id)){
            return null;
        }

        return db.collection(collection).findOne({
            _id: new ObjectId(id)
        });
    }

    async insert(options) {

        const db = await this.getDb();

        return db.collection(options.collection).insertOne(options.body);
    }

    async update(collection, id, body) {

        const db = await this.getDb();
        
        let record = await this.findOneById(collection, id);
        
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

    async delete(collection, id) {

        const db = await this.getDb();

        let record = await this.findOneById(collection, id);

        if (!record) {
            return null;
        }

        return db.collection(collection).deleteOne({ _id: new ObjectId(id) });
    }

}

module.exports = Mongo;