//引入路由
const express = require("express");
const router = express.Router();

//引入数据库操作函数
const { findmongo } = require("../utils/mongoclient");

//引入jwt配置
const jwttoken = require("../config/jwtconfig");

//引入token校验中间件
// const { verifytoken, cookietoken } = require("../middleware/verifytoken");

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
        //筛选字段，0为不要的
        projection: {
          password: 0,
          _id: 0,
          create_date: 0,
        },
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    //直接返回给客户端的token
    const token = jwttoken(finddata[0], 1000 * 60 * 60 * 12); //12小时

    //存储到cookie的token(毫秒)
    //通过设置这个过期时间，使用户这些天内不登录需要重新登陆
    // const expiresjwt = 1000 * 60 * 60 * 24 * 3; //最后一个数字单位为天，即3天
    // const tokencookie = jwttoken(finddata[0], expiresjwt);
    // res.cookie("tjowkten", tokencookie, { maxAge: expiresjwt, httpOnly: true });

    res.status(200).json({
      code: 200,
      token,
      message: "登陆成功",
    });
  } catch (error) {
    res.status(error.code || 500).json({
      code: error.code || 500,
      message: error.message,
    });
  }
});

//重新获取token
// router.post("/refreshtoken", cookietoken, async (req, res) => {
//   //拿到用户信息
//   const { username, auth, uuid } = req.userinfo;
//   const userinfo = {
//     username,
//     auth,
//     uuid,
//   };
//   try {
//     const token = jwttoken(userinfo, 1000 * 60 * 15);

//     //存储到cookie的token(毫秒)
//     //通过设置这个过期时间，使用户这些天内不登录需要重新登陆
//     const expiresjwt = 1000 * 60 * 60 * 24 * 3; //最后一个数字单位为天，即3天
//     const tokencookie = jwttoken(userinfo, expiresjwt);
//     res.cookie("tjowkten", tokencookie, { maxAge: expiresjwt, httpOnly: true });

//     res.status(200).json({
//       code: 200,
//       token,
//     });
//   } catch (error) {
//     res.status(error.code || 500).json({
//       code: error.code || 500,
//       message: error.message,
//     });
//   }
// });

module.exports = router;
