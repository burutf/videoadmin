//引入路由
const express = require('express');
const router = express.Router();

//引入数据库操作函数
const { findmongo } = require('../utils/mongoclient')

//引入jwt配置
const jwttoken = require('../config/jwtconfig')

//用户登录接口
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const finddata = await findmongo('user', 'users', {
            username,
            password
        }, {
            projection: {
                username: 1,
                uuid: 1,
                isadmin: 1,
                _id: 0
            }
        })
        console.log(finddata);
        const token = jwttoken(finddata[0])


        res.status(200).json({
            code: 200,
            token
        })

    } catch (error) {
        res.status(error.code).json({
            code: error.code,
            message: error.message
        })
    }
})




module.exports = router