//引入路由
const express = require("express");
const router = express.Router();

//引入数据库函数
const { aggregatemongo } = require("../../utils/mongoclient");

//引入日期格式化
const moment = require("moment");

// 获取今天的开始和结束时间
const startOfDay = moment().startOf("day").toDate();
const endOfDay = moment().endOf("day").toDate();


//获取轮播图列表
router.get("/getbslideshow", async (req, res) => {
  try {
    const list = await aggregatemongo(
      process.env.MONGO_TB_USERVIDEO,
      "videoid",
      process.env.MONGO_DB_VIDEO,
      process.env.MONGO_TB_SLIDESHOW,
      {
        isstart:true,
        coverurl:{$ne:""}
      }
    );

    res.status(200).json({
      code: 200,
      message: "OK",
      data:list
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});


//获取今日更新的视频列表


module.exports = router