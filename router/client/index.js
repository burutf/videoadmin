//引入路由
const express = require("express");
const router = express.Router();

//引入数据库函数
const { aggregatemongo } = require("../../utils/mongoclient");


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


module.exports = router