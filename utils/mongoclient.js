//导入mongodb配置
const mongo = require("../config/mongoconfig");

//增
async function insertmongo(
  objs,
  database = process.env.MONGO_DB_VIDEO,
  datatable = process.env.MONGO_TB_USERVIDEO
) {
  try {
    //连接数据库
    await mongo.connect();
    //增
    const db = mongo.db(database).collection(datatable);
    const ress = await db.insertOne(objs);
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 403,
      message: "连接数据库或新增发生了错误" + error.message,
    });
  }
}
//查(默认连接的是存储着视频信息的集合)
async function findmongo(
  objs,
  options = {},
  database = process.env.MONGO_DB_VIDEO,
  datatable = process.env.MONGO_TB_USERVIDEO
) {
  try {
    //连接数据库
    await mongo.connect();
    //查
    const db = mongo.db(database).collection(datatable);
    const ress = await db.find(objs, options).toArray();
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 403,
      message: "连接数据库或查找语句错误" + error.message,
    });
  }
}

//多表联查
async function aggregatemongo(from, field, database, datatable,match={}) {
  try {
    //连接数据库
    await mongo.connect();
    //联查
    const db = mongo.db(database).collection(datatable);
    const ress = await db
      .aggregate([
        {
          $lookup: {
            from,//关联哪个表
            localField: field,//当前使用哪个字段关联
            foreignField: field,//用关联表的哪个字段
            as: "aggarr",//将关联来的数据用这个来接收
          },
        },
        {
          //这里是进行筛选
          $match:match
        },
        {
          $unwind: "$aggarr", // 将数组展开
        },
      ])
      .toArray();
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 403,
      message: "连接数据库或多表查找语句错误" + error.message,
    });
  }
}

//查符合条件的有几条
async function countdomongo(
  objs,
  database = process.env.MONGO_DB_VIDEO,
  datatable = process.env.MONGO_TB_USERVIDEO
) {
  try {
    //连接数据库
    await mongo.connect();
    //查
    const db = mongo.db(database).collection(datatable);
    const ress = await db.countDocuments(objs);
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: error.message,
    });
  }
}

//删除
async function delmongo(
  queryobj,
  database = process.env.MONGO_DB_VIDEO,
  datatable = process.env.MONGO_TB_USERVIDEO
) {
  try {
    //连接数据库
    await mongo.connect();
    //删
    const db = mongo.db(database).collection(datatable);
    const ress = await db.deleteOne(queryobj);
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 403,
      message: "连接数据库或删除出现错误" + error.message,
    });
  }
}

//更改
async function updatamongo(
  queryobj,
  setdata,
  currentdate = {},
  database = process.env.MONGO_DB_VIDEO,
  datatable = process.env.MONGO_TB_USERVIDEO
) {
  try {
    //连接数据库
    await mongo.connect();
    //改
    const db = mongo.db(database).collection(datatable);
    const ress = await db.updateOne(queryobj, {
      $currentDate: currentdate,
      $set: setdata,
    });
    return ress;
  } catch (error) {
    return Promise.reject({
      code: 403,
      message: "连接数据库或修改出现错误" + error.message,
    });
  }
}

module.exports = {
  insertmongo,
  findmongo,
  countdomongo,
  delmongo,
  updatamongo,
  aggregatemongo,
};
