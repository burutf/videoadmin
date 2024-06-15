const { MongoClient } = require('mongodb')

//配置项
const options = {
    connectTimeoutMS:10000, //超时时间
    serverSelectionTimeoutMS: 10000
}


const mongo = new MongoClient(process.env.MONGO_URL, options)
mongo.close()

module.exports = mongo