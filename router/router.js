//sts阿里云
const stsoss = require('./stsossa');
//额外信息(分类列表)
const extras = require('./extras');
//oss操作路由
const ossupload = require('./ossupload')
//服务器时间
const gettime = require('./time')

//登陆（jwt token）
const login = require('./login')

module.exports = {
    stsoss,
    extras,
    ossupload,
    gettime,
    login
}