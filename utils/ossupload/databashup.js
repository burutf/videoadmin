//导入mongodb新增函数
const { insertmongo, updatamongo } = require("../mongoclient");
//导入获取列表的函数
const { getlistoss } = require("../osssysutile");

//数据存储到数据库
async function upmongodb(obj, formdata, uuid, isupdata) {
  const { videoid, reslist } = obj;
  try {
    //获取视频列表(传入uuid和视频id)
    // const listoss = await getlistoss(process.env.USER_PREFIX + uuid + '/' + videoid + '/')

    //进行数组整理，添加到数据库
    const listdisposal = disposal(reslist, formdata, uuid, videoid);

    //如果是更改的话就执行更改操作
    if (isupdata) {
      //筛选出所有这次上传的列表
      const isis = reslist.filter((e) => !e.isbeforup);
      let update = {
        //这次上传的列表不是空的话，就说明有更新了，同时更新日期
        lastupdate: true
      }
      //如果这次上传的列表为空的话，就不更新日期字段
      if (isis.length===0) {
        delete update.lastupdate
      }

      //删掉对象的日期属性，防止冲突
      delete listdisposal.lastupdate;
      delete listdisposal.createddate
      await updatamongo(
        { videoid, uuid },
        {
          ...listdisposal,
        },
        update
      );
    } else {
      //数据库进行新增(传入整理好要新增的数据，还有要存放的数据库和集合的名字)
      const isis = await insertmongo(listdisposal);
      return isis.acknowledged;
    }
  } catch (error) {
    return Promise.reject({
      code: error.code,
      message: error.message,
      data: error.data,
      videoid,
    });
  }
}

function disposal(listoss, formdata, uuid, videoid) {
  //封面,没有编号的
  const cover = listoss.find((e) => !e.serial);
  //视频，有编号的
  const videolist = listoss.filter((e) => e.serial);
  //获取当前的时间
  const date = new Date();
  return {
    ...formdata,
    videolist,
    videoid,
    cover,
    uuid,
    createddate: date,
    lastupdate: date,
  };
}

module.exports = upmongodb;
