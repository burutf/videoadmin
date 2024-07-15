//引入路由
const express = require("express");
const router = express.Router();
//引入日期格式化
const moment = require("moment");
//数据库操作函数
const { countdomongo } = require("../utils/mongoclient");

//引入获取权限列表
const authlist = require("../utils/authlist");

//获取视频状态列表（今日新增、今日修改、总条数）
router.get("/getvideostatus", async (req, res) => {
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
    });

    //今日修改总数
    const todayupdate = await countdomongo({
      $and: [
        { lastupdate: { $gte: startOfDay, $lte: endOfDay } },
        { $expr: { $ne: ["$lastupdate", "$createddate"] } },
      ],
    });

    res.status(200).json({
      code: 200,
      data: [
        {
          name: "sumpage",
          value: sumpage,
        },
        {
          name: "todayadd",
          value: todayadd,
        },
        {
          name: "todayupdate",
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
            code:403,
            message:'权限不够访问该图表'
        })
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
router.get("/getuserauthsum", authkk(10), async (req, res) => {
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

module.exports = router;
