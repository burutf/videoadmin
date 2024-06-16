//引入路由
const express = require('express');
const router = express.Router();
//jwt对象
const jwt = require('jsonwebtoken')
//引入数据库操作函数
const { findmongo } = require('../utils/mongoclient')

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const secret = 'tt_tingfeng@163.com'; // 保持安全的秘钥
        const finddata = await findmongo('user', 'users', {
            username,
            password
        },{
            username:1,
            uuid:1,
            isadmin:1,
            _id:0
        })
        const token = jwt.sign(finddata[0], secret, { expiresIn: '5h' }); // 有效期5小时

        res.status(200).json({
            code:200,
            token
        })

    } catch (error) {
        res.status(400).json({
            code: 400,
            message: '账号或密码错误'
        })
    }
})


module.exports = router