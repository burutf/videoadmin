//引入路由
const express = require('express');
const router = express.Router();
//引入oss配置
const OssClient = require('../config/ossconfig')
//引入oss操作函数
const {delfile,cancelupload} = require('../utils/osssysutile')

//删除文件
router.delete('/delossfile',async (req,res)=>{
    const {FileName,ismulti} = req.query
    try {
        await delfile(FileName,ismulti)
        res.status(200).json({
            code:200,
            message:'ok'
        })
    } catch (error) {
        res.status(error.code).json({
            code:error.code,
            message:error.message
        })
    }
})

//取消分片上传
router.post('/cancelupload',async (req,res)=>{
    const {FileName, uploadId} = req.body
    try {
        await cancelupload(FileName, uploadId)
        res.status(200).json({
            code:200,
            message:'ok'
        })
    } catch (error) {
        res.status(error.code).json({
            code:error.code,
            message:error.message
        })
    }
})

module.exports = router