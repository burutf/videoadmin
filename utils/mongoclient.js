//导入mongodb配置
const mongoconfig = require('../config/mongoconfig')

const mongo = mongoconfig

async function insertmongo(objs) {
    try {
        //连接数据库
        await mongo.connect()
        //增
        const db = mongo.db(process.env.MONGO_DB).collection('u'+process.env.USER_ID)
        const test = await db.insertOne(objs)

        //关闭数据库
        mongo.close()
        return test
    } catch (error) {
        //关闭数据库
        mongo.close()
        console.log('连接数据库或新增发生了错误');
        return error
    }
    
}


module.exports = {
    insertmongo
}