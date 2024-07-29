//引入路由
const express = require("express");
const router = express.Router();
//引入中间件函数
const {verifytoken} = require('../middleware/verifytoken')

const {
  findmongo,
  countdomongo,
  updatamongo,
  insertmongo,
  delmongo,
  aggregatemongo,
} = require("../utils/mongoclient");
const { delinbatches } = require("../utils/delinbatches");

const { headandcopyanddel, delfile } = require("../utils/osssysutile");



//获取视频列表
router.get("/getvideolist",verifytoken, async (req, res) => {
  //拿到用户信息
  const { auth, uuid } = req.userinfo;
  //query拿到用户传来的配置信息（pramas是数字已经变成字符串了，做了下处理）
  const {
    currentpage,
    pagesize,
    sortobj,
    datefiltle = [],
    titlesearch,
    statusff,
  } = req.query.options;
  //查找条件项
  let query = {
    uuid,
    //日期范围
    lastupdate: {
      $gte: new Date(datefiltle[0]),
      $lte: new Date(datefiltle[1]),
    },
    //查找标题
    title: { $regex: titlesearch },
    //状态筛选
    status: statusff,
  };
  //如果没有选择日期就删掉查日期范围的属性
  if (datefiltle.length === 0) delete query.lastupdate;
  //如果statusff没有传值就是不筛选此项
  if (!statusff) delete query.status;

  //查找配置项
  const optobj = {
    //排序
    sort: sortobj,
    //隐藏字段
    projection: { _id: 0 },
    //分页
    //跳过这些条数
    skip: (currentpage - 1) * pagesize,
    //查出这些条数
    limit: +pagesize,
  };

  try {
    const arrlist = await findmongo(query, optobj);
    const sumpage = await countdomongo(query);

    res.status(200).json({
      code: 200,
      message: "获取视频列表成功",
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

//删除列表中的一条
router.delete("/dellist",verifytoken, async (req, res) => {
  const { uuid } = req.userinfo;
  const { videoid } = req.query;
  try {
    await delinbatches(uuid, videoid, true);
    res.status(200).json({
      code: 200,
      message: "删除成功",
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//批量删除
router.delete("/dellistbatch",verifytoken, async (req, res) => {
  const { uuid } = req.userinfo;
  const { videoidlist } = req.query;

  try {
    //进行并发删除
    const alllist = videoidlist.map(async (e) => {
      return await delinbatches(uuid, e, true);
    });
    await Promise.all(alllist);

    res.status(200).json({
      code: 200,
      message: "批量删除成功",
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//更改视频列表
router.post("/updatalist",verifytoken, async (req, res) => {
  const { uuid } = req.userinfo;
  const { videoid, setdata } = req.body;
  try {
    await updatamongo({ uuid, videoid }, setdata, {
      lastupdate: true,
    });

    res.status(200).json({
      code: 200,
      message: "ok",
    });
  } catch (error) {
    res.status(error.code).json({
      code: error.code,
      message: error.message,
    });
  }
});

//设置轮播图展示
router.post("/setslideshow",verifytoken, async (req, res) => {
  //接收视频id和布尔值
  const { videoid, settingobj } = req.body;
  try {
    //设置轮播图展示
    await updatamongo({ videoid }, { setting: settingobj });

    //看看是要添加还是移除
    if (settingobj.isslideshow) {
      //看看有没这条
      const count = await countdomongo(
        { videoid },
        undefined,
        process.env.MONGO_TB_SLIDESHOW
      );
      //进行判断
      if (count === 0) {
        //没有的话，就添加
        //加入到轮播图集合
        await insertmongo(
          {
            //绑定的视频id
            videoid,
            //图片的url
            coverurl: "",
            isstart: true,
            //上传日期
            date: new Date(),
          },
          undefined,
          process.env.MONGO_TB_SLIDESHOW
        );
      } else {
        //有的话就通过设置属性为true
        await updatamongo(
          { videoid },
          { isstart: true },
          {},
          undefined,
          process.env.MONGO_TB_SLIDESHOW
        );
      }
    } else {
      //进行删除判断（有设置过图片地址就设置属性为false，没有就直接删除）
      await delslfn(videoid);
    }

    res.status(200).json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(error.code).json({
      code: error.code,
      message: code.message,
    });
  }
});

//获取轮播图列表
router.get("/getslideshowlist",verifytoken, async (req, res) => {
  try {
    const data = await aggregatemongo(
      process.env.MONGO_TB_USERVIDEO,
      "videoid",
      process.env.MONGO_DB_VIDEO,
      process.env.MONGO_TB_SLIDESHOW,
      {
        isstart: true,
      }
    );

    res.status(200).json({
      code: 200,
      message: "OK",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(error.code).json({
      code: error.code,
      message: code.message,
    });
  }
});

//删除轮播图中的一条
router.delete("/delslideshowlist",verifytoken, async (req, res) => {
  const { videoid } = req.query;
  try {
    //设置轮播图展示清除
    await updatamongo({ videoid }, { "setting.isslideshow": false });
    //进行删除判断（有设置过图片地址就设置属性为false，没有就直接删除）
    await delslfn(videoid);

    res.status(200).json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(error.code).json({
      code: error.code,
      message: code.message,
    });
  }
});

//进行删除判断
async function delslfn(videoid) {
  //查出这条有没有设置图片地址
  const [{coverurl}] = await findmongo(
    { videoid },
    {},
    undefined,
    process.env.MONGO_TB_SLIDESHOW
  );
  if (coverurl) {
    //如果有设置图片地址的话不直接删除，通过设置开关，关闭掉
    await updatamongo(
      { videoid },
      { isstart: false },
      {},
      undefined,
      process.env.MONGO_TB_SLIDESHOW
    );
  } else {
    //从轮播图集合删除这条(没有设置的话就直接删除)
    await delmongo({ videoid }, undefined, process.env.MONGO_TB_SLIDESHOW);
  }
}

//更改轮播图中的图片
router.post("/updateslideshowimg",verifytoken, async (req, res) => {
  //拿到用户信息
  const { uuid } = req.userinfo;
  const { imgobj, videoid, coverurl } = req.body;
  try {
    //删除之前上传的文件(之前没有的话就不删除)
    if (coverurl) await delfile(coverurl);

    //copy到的位置，使用时间戳命名
    const movepath =
      "/video/" +
      uuid +
      "/" +
      videoid +
      "/" +
      new Date().getTime() +
      "slideshow.jpg";

    //单文件组合操作（检验》复制+删除原文件）
    const newurl = await headandcopyanddel(movepath, imgobj.urlname);
    //将地址更新到数据库中
    await updatamongo(
      { videoid },
      { coverurl: newurl },
      {},
      undefined,
      process.env.MONGO_TB_SLIDESHOW
    );

    res.status(200).json({
      code: 200,
      message: "OK",
    });
  } catch (error) {
    console.log(error);
    res.status(error.code).json({
      code: error.code,
      message: code.message,
    });
  }
});

module.exports = router;
