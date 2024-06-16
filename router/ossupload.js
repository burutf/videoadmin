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

    try {
        //进行数据校验
        const isverify = await verifydata(filelist, formdata);

        //进行oss文件操作(并返回videoid)
        const iscopy = await renameObject(filelist, formdata);

        //数据存储到数据库
        const isdb = await databashup(iscopy,formdata)

        res.status(200).json({
            code: 200,
            message: 'ok',
            videoid:iscopy
        })
    } catch (error) {
        console.log(error);
        //错误处理，传回错误的操作
        const {code,message,data} = error
        res.status(error.code).json({code,message,data})
    }
})

module.exports = router