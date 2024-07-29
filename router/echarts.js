//引入路由
const express = require("express");
const router = express.Router();
//引入日期格式化
const moment = require("moment");
//数据库操作函数
const { countdomongo } = require("../utils/mongoclient");

//引入获取权限列表
const authlist = require("../utils/authlist");

//引入获取oss存储空间状态的函数
const { bucketstatus, contentsszie } = require("../utils/ossbucket");

//引入中间件函数
const {verifytoken} = require('../middleware/verifytoken')

//获取视频状态列表（今日新增、今日修改、总条数）
router.get("/getvideostatus",verifytoken, async (req, res) => {
  //拿到用户信息
  const { uuid } = req.userinfo;
  try {
    //自己的视频总数
    const sumpage = await countdomongo({ uuid });

    //今日新增总数
    // 获取今天的开始和结束时间
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();
    const todayadd = await countdomongo({
      createddate: { $gte: startOfDay, $lte: endOfDay },
      uuid
    });

    //今日更新总数
    const todayupdate = await countdomongo({
      $and: [
        { lastupdate: { $gte: startOfDay, $lte: endOfDay } },
        { $expr: { $ne: ["$lastupdate", "$createddate"] } },
      ],
      uuid
    });

    res.status(200).json({
      code: 200,
      data: [
        {
          name: "总共有这些部视频",
          value: sumpage,
        },
        {
          name: "今天新加的部数",
          value: todayadd,
        },
        {
          name: "今天更新的部数",
          value: todayupdate,
        },
      ],
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//权限控制中间件（传入权限等级，同级及以上可以通过）
function authkk(authgrade) {
  return (req, res, next) => {
    //拿到用户信息
    const { auth } = req.userinfo;
    if (auth >= authgrade) {
      next();
    } else {
      res.status(403).json({
        code: 403,
        message: "权限不够访问该图表",
      });
    }
  };
}

//获取用户权限分布
async function mapauth(queryauth, name) {
  try {
    const sum = await countdomongo(
      { auth: queryauth },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    return {
      name,
      value: sum,
    };
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: name + ";获取数量出错",
    });
  }
}
//获取用户权限分布
router.get("/getuserauthsum", verifytoken,authkk(10), async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  try {
    const authlistdata = await authlist(auth);

    const allauth = authlistdata.map((e) => {
      return mapauth(e.value, e.label);
    });
    const data = await Promise.all(allauth);

    res.status(200).json({
      code: 200,
      data,
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//获取oss的存储状态
router.get("/getossbucketcharts",verifytoken, async (req, res) => {
  try {
    //获取bucket已经存储的总大小和最大支持大小
    const { storage, max } = await bucketstatus();
    //获取临时目录的大小
    let tem = await contentsszie(process.env.USER_TEM);
    //剩余空间大小
    let residual = max - storage;
    //去掉临时目录大小的已存储大小
    let officialsize = storage - tem


    //转为MB，保留两位小数
    tem = (tem/1024/1024).toFixed(2)
    residual = (residual/1024/1024).toFixed(2)
    officialsize = (officialsize/1024/1024).toFixed(2)


    res.status(200).json({
      code: 200,
      data: [
        
        { name: "已存储", value: officialsize },
        { name: "剩余空间", value: residual },
        { name: "临时目录", value: tem },
      ],
    });
  } catch (error) {
    console.log(error);
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

module.exports = router;
