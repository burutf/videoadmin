//导入mongodb配置
const mongo = require('../config/mongoconfig')

//增
async function insertmongo(objs,database,datatable) {
    try {
        //连接数据库
        await mongo.connect()
        //增
        const db = mongo.db(database).collection(datatable)
        const ress = await db.insertOne(objs)
        //关闭数据库
        mongo.close()
        return ress
    } catch (error) {
        //关闭数据库
        mongo.close()
        return Promise.reject({
            code:403,
            message:'连接数据库或新增发生了错误'
        })
    }
}
//查
async function findmongo(dbk,document,objs,projection) {
    try {
        //连接数据库
        await mongo.connect()
        //查
        const db = mongo.db(dbk).collection(document)
        const ress = await db.find(objs, {projection} ).toArray()
        //关闭数据库
        mongo.close()
        if (ress.length===0) {
            return Promise.reject({
                code:400,
                message:'未查到数据'
            })
        }
        return ress
    } catch (error) {
        //关闭数据库
        mongo.close()
        return Promise.reject({
            code:403,
            message:'连接数据库或查找语句错误'
        })
    }
}

module.exports = {
    insertmongo,
    findmongo
}