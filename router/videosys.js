//引入路由
const express = require('express');
const router = express.Router();

const { findmongo,countdomongo } = require('../utils/mongoclient')
const {delinbatches} = require('../utils/delinbatches')

//获取视频列表
router.get('/getvideolist', async (req, res) => {
    //拿到用户信息
    const { isadmin, uuid } = req.userinfo
    //query拿到用户传来的配置信息（应该是pramas是数字已经变成字符串了，需要处理一下）
    const {page,pagesize} = req.query.options
    try {
        const arrlist = await findmongo({
            uuid
        }, {
            //根据最后一次修改降序排序
            sort:{lastupdate:-1},
            //隐藏字段
            projection:{_id:0},
            //分页
            //跳过这些条数
            skip:(page-1) * pagesize,
            //查出这些条数
            limit: +pagesize
        })
        const sumpage = await countdomongo({uuid})


        res.status(200).json({
            code: 200,
            data: {
                sumpage,
                arrlist
            }
        })
    } catch (error) {
        res.status(error.code).json({
            code: error.code,
            message: error.message,
        })
    }
    
})

router.delete('/dellist',async (req,res)=>{
    const {uuid} = req.userinfo
    const {videoid} = req.query
    try {
        await delinbatches(uuid,videoid,true)
        res.status(200).json({
            code:200,
            message:'删除成功'
        })
    } catch (error) {
        res.status(error.code).json({
            code:error.code,
            message:error.message,
        })
    }


    
})


module.exports = router