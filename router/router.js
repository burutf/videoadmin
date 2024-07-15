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
//视频管理相关的路由
const videosys = require('./videosys')
//用户管理的路由
const user = require('./user')
//echarts图表展示相关api
const echarts = require('./echarts')

module.exports = {
    stsoss,
    extras,
    ossupload,
    gettime,
    login,
    osssys,
    videosys,
    user,
    echarts
}