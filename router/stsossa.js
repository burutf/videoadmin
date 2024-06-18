/*
阿里云的OSS服务做的sts验证
*/

const { STS } = require('ali-oss');

//引入路由
const express = require('express');
const router = express.Router();

const sts = new STS({
    // 填写创建的RAM用户AccessKey
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET
});
router.get('/sts', async (req, res) => {

    try {
        const { credentials } = await sts.assumeRole('acs:ram::1550100793613587:role/ramoss', '', '3600', 'sessiontest')
        //返回token
        res.status(200).json({
            code: 200,
            message: "成功",
            data: credentials
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "sts这个get接口出错了",
            data: error
        })
    }

})


module.exports = router