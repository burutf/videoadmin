
//引入路由
const express = require('express');
const router = express.Router();

//导入校验函数
const verifydata = require('../utils/ossupload/verify')
//导入oss操作函数
const renameObject = require('../utils/ossupload/renameObject')
//导入数据库操作函数
const databashup = require('../utils/ossupload/databashup')


//视频、表单数据接收
router.post('/fullupload', async (req, res) => {
    const { filelist, formdata } = req.body
    //进行数据校验
    const isverify = await verifydata(filelist, formdata);
    //要是校验失败了就return出去，并返回校验结果
    if (!isverify.allisis) {
        res.status(401).json({
            code: 401,
            message: '校验失败',
            data: isverify
        })
        return
    }

    //进行oss文件操作(并返回videoid)
    const iscopy = await renameObject(filelist, formdata);
    //要是oss操作失败了就return出去，并返回校验结果
    if (!iscopy.isfull) {
        res.status(402).json({
            code: 402,
            message: 'oss文件操作失败',
            data: iscopy.data
        })
        return
    }
    //数据存储到数据库
    const isdb = await databashup(iscopy.videoid,formdata)
    console.log(isdb)


    res.status(200).json({
        code: 200,
        message: 'ok',
    })
})

module.exports = router