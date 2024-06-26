const { MongoClient } = require('mongodb')

//配置项
const options = {
    connectTimeoutMS:10000, //超时时间
    serverSelectionTimeoutMS: 10000,
}


const mongo = new MongoClient(process.env.MONGO_URL, options)

///////////////////
//交给程序去处理连接
//不手动控制了
//只在程序退出时清除连接
//////////////////


//ctrl-c执行清除连接
process.on('SIGINT',()=>{
    mongo.close().then(()=>process.exit(0))
})
//程序被中止，执行清除连接
process.on('SIGTERM',()=>{
    mongo.close().then(()=>process.exit(0))
})


module.exports = mongo