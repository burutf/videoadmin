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

//引入获取权限列表
const authlist = require("../utils/authlist");

//获取所有用户的信息
router.get("/getmongodbusers", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;

  //query拿到用户传来的配置信息（pramas是数字已经变成字符串了）
  const {
    currentpage,
    pagesize,
    datefiltle = [],
    titlesearch,
    authfil,
    sortobj,
  } = req.query.options;
  //查询条件
  let query = {
    //只查比当前用户权限等级低的
    auth: { $lt: auth },
    //日期范围
    create_date: {
      $gte: new Date(datefiltle[0]),
      $lte: new Date(datefiltle[1]),
    },
    //查找标题
    username: { $regex: titlesearch },
  };

  //如果没有选择日期就删掉查日期范围的属性
  if (datefiltle.length === 0) delete query.create_date;
  //如果有传递筛选权限那么久执行下面这条
  //权限等级筛选
  if (authfil) query.auth = +authfil;

  //查找配置项
  const optobj = {
    //隐藏字段
    projection: { _id: 0, password: 0 },
    //分页
    //跳过这些条数
    skip: (currentpage - 1) * pagesize,
    //查出这些条数
    limit: +pagesize,
    //排序
    sort: sortobj,
  };

  try {
    //获取列表
    const arrlist = await findmongo(
      query,
      optobj,
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    //获取总条数
    const sumpage = await countdomongo(
      query,
      process.env.MONGO_DB_USER,
      process.env.MONGO_TB_USERS
    );
    res.status(200).json({
      code: 200,
      message: "获取用户成功",
      data: {
        sumpage,
        arrlist,
      },
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//获取权限列表
router.get("/getauthlist", async (req, res) => {
  //拿到用户信息
  const { auth } = req.userinfo;
  try {
    const data = await authlist(auth);

    res.status(200).json({
      code: 200,
      message: "获取权限列表成功",
      data,
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: "获取权限列表失败",
    });
  }
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

module.exports = router;
