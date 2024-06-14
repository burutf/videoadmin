//导入nev环境变量
require('dotenv').config();
//引入express框架
const express = require('express');
const app = express();
//引入路由
const {stsoss,extras,ossupload,gettime} = require('./router/router')
//引入body-parser，将body数据解析到res中
const bodyParser = require('body-parser')


// 解析 url-encoded格式的表单数据
app.use(bodyParser.urlencoded({ extended: false }));
// 解析json格式的表单数据
app.use(bodyParser.json());


//路由
app.use('/api',gettime) //获取服务器时间
app.use('/api',stsoss)  //获取sts验证
app.use('/api',extras)  //额外的一些api
app.use('/api',ossupload) //oss上传的一些操作和校验



app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(process.env.port, () => {
    console.log('成功开启node，端口号为' + process.env.port);
})
