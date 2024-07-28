//引入路由
const express = require("express");
const router = express.Router();

//引入数据库函数
const { aggregatemongo, findmongo } = require("../../utils/mongoclient");

//引入日期格式化
const moment = require("moment");

//获取轮播图列表
router.get("/getbslideshow", async (req, res) => {
  try {
    const list = await aggregatemongo(
      process.env.MONGO_TB_USERVIDEO,
      "videoid",
      process.env.MONGO_DB_VIDEO,
      process.env.MONGO_TB_SLIDESHOW,
      {
        isstart: true,
        coverurl: { $ne: "" },
      }
    );

    res.status(200).json({
      code: 200,
      message: "OK",
      data: list,
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//获取今日更新的视频列表
router.get("/gettodaylist", async (req, res) => {
  //接收查找条的数量，默认为0，不限制
  const { pagesize = 0 } = req.query;
  // 获取今天的开始和结束时间
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();
  try {
    //查出更新日期是今天的数据
    const data = await findmongo(
      {
        lastupdate: { $gte: startOfDay, $lte: endOfDay },
      },
      {
        //隐藏字段
        projection: { _id: 0 },
        //查出这些条数
        limit: +pagesize,
      }
    );
    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
    });

    res.status(200).json({
      code: 200,
      message: "ok",
      data,
    });
  } catch (error) {
    res.status(error.code || 500).json({
      code: error.code || 500,
      message: error.message,
    });
  }
});

//获取猜你喜欢列表（要获取除去今日更新的列表）
router.get("/getlikelist", async (req, res) => {
  //接收查找条的数量和第几次查询，默认为0，不限制
  const { pagesize = 0, pageindex = 1 } = req.query;
  // 获取今天的开始和结束时间
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();
  try {
    const data = await findmongo(
      {
        lastupdate: { $lt: startOfDay },
      },
      {
        //隐藏字段
        projection: { _id: 0 },
        //分页
        //跳过这些条数
        skip: (pageindex - 1) * pagesize,
        //查出这些条数
        limit: +pagesize,
      }
    );

    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
    });

    res.status(200).json({
      code: 200,
      message: "ok",
      data,
    });
  } catch (error) {
    res.status(error.code || 500).json({
      code: error.code || 500,
      message: error.message,
    });
  }
});

module.exports = router;
