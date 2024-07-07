
//引入路由
const express = require('express');
const router = express.Router();
//获取服务器时间
router.get('/gettime', (req, res) => {
    try {
        const time = new Date().getTime()
        res.status(200).json({
            code: 200,
            time
        })
    } catch (error) {
        res.status(500).json({
            code: 500,
            message:'获取时间出错'
        })
    }

})

module.exports = router