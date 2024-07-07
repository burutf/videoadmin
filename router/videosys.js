//引入路由
const express = require('express');
const router = express.Router();

const { findmongo, countdomongo,updatamongo } = require('../utils/mongoclient')
const { delinbatches } = require('../utils/delinbatches')

//获取视频列表
router.get('/getvideolist', async (req, res) => {
    //拿到用户信息
    const { isadmin, uuid } = req.userinfo
    //query拿到用户传来的配置信息（pramas是数字已经变成字符串了，做了下处理）
    const { page, pagesize,sortobj,datefiltle = [],titlesearch,statusff } = req.query.options
    //查找条件项
    let query = {
        uuid,
        //日期范围
        lastupdate:{$gte:new Date(datefiltle[0]),$lte:new Date(datefiltle[1])},
        //查找标题
        title:{$regex:titlesearch},
        //状态筛选
        status:statusff
    }
    //如果没有选择日期就删掉查日期范围的属性
    if (datefiltle.length===0) delete query.lastupdate
    //如果statusff没有传值就是不筛选此项
    if (!statusff) delete query.status


    //查找配置项
    const optobj = {
        //排序
        sort: sortobj,
        //隐藏字段
        projection: { _id: 0 },
        //分页
        //跳过这些条数
        skip: (page - 1) * pagesize,
        //查出这些条数
        limit: +pagesize
    }

    try {
        const arrlist = await findmongo(query, optobj)
        const sumpage = await countdomongo(query)

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
//删除列表中的一条
router.delete('/dellist', async (req, res) => {
    const { uuid } = req.userinfo
    const { videoid } = req.query
    try {
        await delinbatches(uuid, videoid, true)
        res.status(200).json({
            code: 200,
            message: '删除成功'
        })
    } catch (error) {
        res.status(error.code).json({
            code: error.code,
            message: error.message,
        })
    }
})

//批量删除
router.delete('/dellistbatch',async (req,res)=>{
    const { uuid } = req.userinfo
    const { videoidlist } = req.query


    try {
        //进行并发删除
        const alllist = videoidlist.map(async e=>{
            return await delinbatches(uuid,e,true)
        })
        await Promise.all(alllist)

        res.status(200).json({
            code: 200,
            message: '批量删除成功'
        })
    } catch (error) {
        res.status(error.code).json({
            code: error.code,
            message: error.message,
        })
    }


    
})

//更改视频列表
router.post('/updatalist', async(req, res) => {
    const { uuid } = req.userinfo
    const {videoid,setdata} = req.body
    try {
        await updatamongo({uuid,videoid},setdata)


        res.status(200).json({
            code:200,
            message:'ok'
        })
    } catch (error) {
        res.status(error.code).json({
            code: error.code,
            message: error.message,
        })
    }
})

module.exports = router