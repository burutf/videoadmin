
//引入路由
const express = require('express');
const router = express.Router();
//获取服务器时间
router.get('/gettime',(req,res)=>{
    const time = new Date().getTime()
    res.status(200).json({
        code:200,
        time
    })
})

module.exports = router