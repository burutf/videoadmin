//引入路由
const express = require("express");
const router = express.Router();

//引入数据库函数
const {
  aggregatemongo,
  findmongo,
  countdomongo,
} = require("../../utils/mongoclient");

//引入oss签名函数
const { getsignatureurl } = require("../../utils/osssysutile");

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
      delete e.videolist;
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
      delete e.videolist;
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

//视频类型列表
router.get("/getclassifylist", (req, res) => {
  try {
    res.status(200).json({
      code: 200,
      message: "ok",
      data: [
        "热血",
        "穿越",
        "奇幻",
        "战斗",
        "搞笑",
        "日常",
        "科幻",
        "萌系",
        "治愈",
        "校园",
        "少儿",
        "泡面",
        "恋爱",
        "少女",
        "魔法",
        "冒险",
        "历史",
        "架空",
        "机战",
        "神魔",
        "声控",
        "运动",
        "励志",
        "音乐",
        "推理",
        "社团",
        "智斗",
        "催泪",
        "美食",
        "偶像",
        "乙女",
        "职场",
        "武侠",
      ],
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: "获取视频分类列表失败",
      data: error,
    });
  }
});

//获取视频列表（筛选加排序）
router.get("/getvideolistzs", async (req, res) => {
  //接收筛选、排序、查找条的数量和第几次查询，默认为0，不限制
  const { objvalue, sortobj, pagesize = 0, pageindex = 1 } = req.query;
  const { style, status, type } = objvalue;
  //查询
  const query = {
    classify: style,
    status,
    type,
  };
  //配置项
  const options = {
    //排序
    sort: sortobj,
    //隐藏字段
    projection: { _id: 0 },
    //分页
    //跳过这些条数
    skip: (pageindex - 1) * pagesize,
    //查出这些条数
    limit: +pagesize,
  };
  //值为全部就删除这个属性
  if (style === "全部") delete query.classify;
  if (status === "全部") delete query.status;
  if (type === "全部") delete query.type;

  try {
    //查出总共找出来了多少条
    const sumnum = await countdomongo(query);
    //数据
    const data = await findmongo(query, options);
    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
      delete e.videolist;
    });
    res.status(200).json({
      code: 200,
      message: "ok",
      data,
      sumnum,
    });
  } catch (error) {
    res.status(error.code || 500).json({
      code: error.code || 500,
      message: error.message,
    });
  }
});

//全局搜索建议
router.get("/searchallasdasd", async (req, res) => {
  const { text } = req.query;
  try {
    const reqdata = await findmongo(
      { title: { $regex: text } },
      {
        //隐藏字段
        projection: { title: 1, videoid: 1, _id: 0 },
      }
    );
    const data = reqdata.map((e) => {
      return {
        value: e.title,
        address: e.videoid,
      };
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

//获取搜索视频列表
router.get("/getsearchlist", async (req, res) => {
  const { text } = req.query;
  try {
    const data = await findmongo(
      { title: { $regex: text } },
      {
        //隐藏字段
        projection: { _id: 0 },
      }
    );

    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
      delete e.videolist;
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

//根据id获取视频信息
router.get("/getvideo", async (req, res) => {
  //拿到视频id
  const { videoid } = req.query;
  try {
    const data = await findmongo(
      { videoid },
      {
        //隐藏字段
        projection: { _id: 0 },
      }
    );

    res.status(200).json({
      code: 200,
      message: "ok",
      data: data[0],
    });
  } catch (error) {
    res.status(error.code || 500).json({
      code: error.code || 500,
      message: error.message,
    });
  }
});

//获取相关推荐
router.get("/getcorrelation", async (req, res) => {
  //拿到视频id
  const { videoid, pagesize = 10 } = req.query;
  try {
    //获取到风格数组
    const [{ classify }] = await findmongo(
      { videoid },
      {
        //隐藏字段
        projection: { classify: 1, _id: 0 },
      }
    );
    //根据风格数组来查询相关的
    const data = await findmongo(
      { classify: { $in: classify }, videoid: { $ne: videoid } },
      {
        //查出这些条数
        limit: +pagesize,
        //隐藏字段
        projection: { _id: 0 },
      }
    );

    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
      delete e.videolist;
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

//获取视频链接
router.post("/geturlvideo", async (req, res) => {
  const { videoid, serial } = req.body;
  try {
    //先找出这集的urlname
    const [{ videolist }] = await findmongo({ videoid });
    const { urlname } = videolist.find((e) => {
      return e.serial === serial;
    });

    //进行获取url
    let data = await getsignatureurl(urlname);
    //转成url对象，再重新拼接成使用自定义域名
    const URLdata = new URL(data);
    data = process.env.OSS_CN + URLdata.pathname + URLdata.search;

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

//获取收藏完整列表
router.get("/getmfavoritelist", async (req, res) => {
  const { arr } = req.query;
  try {

    const data = await findmongo(
      { videoid: { $in: arr } },
      {
        sort: { lastupdate: -1 }, //隐藏字段
        projection: { _id: 0 },
      }
    );

    //进行数据处理，根据每条数据添加上代表更新至多少回
    data.forEach((e) => {
      e.updatenum = e.videolist.length;
      delete e.videolist;
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
})

module.exports = router;
