//导入nev环境变量
require('dotenv').config();
//引入express框架
const express = require('express');
const app = express();
//引入路由
const {stsoss,extras,ossupload,gettime,login,osssys,videosys,user,echarts,clientapi} = require('./router/router')
//引入body-parser，将body数据解析到res中
const bodyParser = require('body-parser')
//引入中间件函数
const {verifytoken} = require('./middleware/verifytoken')


//引入cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// 解析 url-encoded格式的表单数据
app.use(bodyParser.urlencoded({ extended: false }));
// 解析json格式的表单数据
app.use(bodyParser.json());



//登陆
app.use('/api',login)

//使用中间件，校验jwt，(verifytoken)
//路由
app.use('/api',gettime) //获取服务器时间
app.use('/api',verifytoken,stsoss)  //获取sts验证
app.use('/api',verifytoken,extras)  //额外的一些api
app.use('/api',verifytoken,ossupload) //oss上传的一些操作和校验
app.use('/api',verifytoken,osssys)  //oss的各种操作
app.use('/api',verifytoken,videosys)//视频管理相关的api
app.use('/api',verifytoken,user)    //用户相关的api
app.use('/api',verifytoken,echarts) //echarts图表展示api
//前台的路由
app.use('/clientapi',clientapi)

//404
app.use((req, res) => {
    res.status(404).json({
        code:404,
        message:'找不到所请求的url'
    })
})

app.listen(process.env.port, () => {
    console.log('成功开启node，端口号为' + process.env.port);
})
