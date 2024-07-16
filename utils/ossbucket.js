//引入oss的配置
const client = require("../config/ossconfig");

//数据库操作函数
const { findmongo } = require("../utils/mongoclient");

//获取oss存储状态
async function bucketstatus() {
  try {
    //总大小
    const { stat } = await client.getBucketStat();
    //最大可存储大小
    const max = await maxsize();
    return {
      storage: +stat.Storage,
      max,
    };
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: "获取oss存储状态失败",
    });
  }
}

//获取当前设置的最大可存储量
async function maxsize() {
  try {
    const size = await findmongo(
      { name: "ossbucket" },
      {},
      undefined,
      "status"
    );
    return size[0].maxsize;
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: "获取最大可存储量失败",
    });
  }
}

//获取指定目录下所有文件的总大小
async function contentsszie(name) {
  try {
    //临时存储大小
    const {objects} = await client.listV2({
      prefix: name,
    });
    //累加每个文件的大小
    const temsize = objects.reduce((sum,add)=>sum+add.size,0)

    return temsize
  } catch (error) {
    return Promise.reject({
        code: 500,
        message: "获取临时存储大小失败",
      });
  }
}

module.exports = { bucketstatus, contentsszie };
