//引入路由
const express = require("express");
const router = express.Router();

//引入数据库操作函数
const {
  findmongo,
  updatamongo,
  delmongo,
  insertmongo,
  countdomongo,
} = require("../utils/mongoclient");

//获取所有用户的信息
router.get("/getmongodbusers", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  try {
    const ress = await findmongo(
      {
        //只查比当前用户权限等级低的
        auth: { $lt: auth },
      },
      {
        //隐藏字段
        projection: { _id: 0, password: 0 },
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );

    res.status(200).json({
      code: 200,
      message: "获取用户成功",
      data: ress,
    });
  } catch (error) {
    res.status(200).json({
      code: 500,
      message: "获取用户失败",
    });
  }
});

//获取权限列表
router.get("/getauthlist", (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  //先写死了，后面有需要再改
  const list = [
    { label: "普通用户", value: 1 },
    { label: "管理员", value: 9 },
    { label: "超级管理员", value: 10 },
  ];
  //只返回比当前用户级别小的列表
  const data = list.filter((e) => {
    return e.value < auth;
  });

  res.status(200).json({
    code: 200,
    message: "获取权限列表成功",
    data,
  });
});

//更改用户信息
router.post("/updateuser", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  const { form, uptype } = req.body;
  //如果没有把要更改的用户权限传来就默认为0,
  const { auth: upauth = 0, password } = form;

  //如果要更改的用户权限比自己大，那就返回错误
  if (auth < upauth || upauth === 0) {
    res.status(500).json({
      code: 500,
      message: "出现意外的错误，你不能更改比自己权限大的用户",
    });
    return;
  }

  let updatedata = {};
  //更改权限
  if (uptype === "authitem") {
    updatedata = {
      auth: upauth,
    };
  }
  //更改密码
  if (uptype === "passitem" && password.length >= 3) {
    updatedata = {
      password,
    };
  } else if (uptype === "passitem") {
    res.status(500).json({
      code: 400,
      message: "密码长度不能小于3位",
    });
    return;
  }

  try {
    await updatamongo(
      { uuid: form.uuid },
      updatedata,
      {},
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );

    res.status(200).json({
      code: 200,
      message: "更改用户信息成功",
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: "更改用户信息失败；" + error.message,
    });
  }
});

//删除用户
router.delete("/deluser", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  //传来的要删除的用户id
  const { uuid } = req.query;

  try {
    //获取要删除用户的权限
    const userii = await findmongo(
      { uuid: +uuid },
      {},
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    //进行判断，是不是权限比要删除的用户权限大，否则不能删除
    if (userii[0].auth >= auth) {
      res.status(500).json({
        code: 500,
        message: "没有权限删除",
      });
      return;
    }
    //进行删除
    await delmongo(
      //转为数字类型
      { uuid: +uuid },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );

    res.status(200).json({
      code: 200,
      message: "删除用户成功",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "删除用户失败",
    });
  }
});

//新增用户
router.post("/adduser", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  //用户信息
  const { username, password, auth: addauth } = req.body;
  try {
    //查看目前用户最大的uuid是多少，+1就是这次新增用户的uuid
    //通过降序排序，再只返回一条
    const row = await findmongo(
      {},
      {
        //排序
        sort: { uuid: -1 },
        //查出这些条数
        limit: 1,
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );

    //新增
    await insertmongo(
      {
        username,
        password,
        auth: addauth,
        create_date: new Date(),
        uuid: row[0].uuid + 1,
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );

    res.status(200).json({
      code: 200,
      message: "新增用户成功",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "新增用户失败",
      error,
    });
  }
});

//总条数
router.get("/getusersum", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  try {
    const data = await countdomongo(
      {
        //只查比当前用户权限等级低的
        auth: { $lt: auth },
      },
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    res.status(200).json({
      code: 200,
      sum: data,
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: "统计用户总条数出错" + error.message,
    });
  }
});

module.exports = router;
