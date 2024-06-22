//sts阿里云
const stsoss = require('./stsossa');
//额外信息(分类列表)
const extras = require('./extras');
//oss上传时的路由
const ossupload = require('./ossupload')
//服务器时间
const gettime = require('./time')
//登陆（jwt token）
const login = require('./login')
//oss各种操作的路由
const osssys = require('./osssys')

module.exports = {
    stsoss,
    extras,
    ossupload,
    gettime,
    login,
    osssys
}