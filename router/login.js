//引入路由
const express = require("express");
const router = express.Router();

//引入数据库操作函数
const { findmongo } = require("../utils/mongoclient");

//引入jwt配置
const jwttoken = require("../config/jwtconfig");

//用户登录接口
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const finddata = await findmongo(
      {
        username,
        password,
      },
      {
        projection: {
          password: 0,
          _id: 0,
        },
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    const token = jwttoken(finddata[0]);

    res.status(200).json({
      code: 200,
      token,
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

module.exports = router;
