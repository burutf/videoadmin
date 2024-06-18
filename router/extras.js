
//引入路由
const express = require('express');
const router = express.Router();
//视频类型列表
router.get('/getclassifylist', (req, res) => {
    try {
        res.status(200).json({
            code: 200,
            message: 'ok',
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
                "职场"
            ]
        })
    } catch (error) {
        res.status(400).json({
            code: 400,
            message: "获取视频分类列表失败",
            data: error
        })
    }

})

//获取用户信息
router.get('/getuserinfo',(req,res)=>{
    const {username,isadmin,uuid} = req.userinfo
    res.status(200).json({
        code:200,
        message:'ok',
        username
    })
})


module.exports = router