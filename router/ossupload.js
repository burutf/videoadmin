//引入路由
const express = require('express');
const router = express.Router();

//导入校验函数
const verifydata = require('../utils/ossupload/verify')
//导入oss操作函数
const renameObject = require('../utils/ossupload/renameObject')
//导入数据库操作函数
const databashup = require('../utils/ossupload/databashup')
//导入出现意外的错误时，执行的回退操作
//导入清除临时目录的函数
const {delinbatches,deltem} = require('../utils/delinbatches')
//导入删除文件函数
const {delfile} = require('../utils/osssysutile')



//视频、表单数据接收
router.post('/fullupload', async (req, res) => {
    //拿到用户所上传的视频列表和表单数据,还有临时上传的目录名字
    const { filelist, formdata,temid,videoid='',delvideolist=[] } = req.body;
    //拿到当前登录的用户id
    const { uuid } = req.userinfo;

    try {

        //进行数据校验
        const isverify = await verifydata(filelist, formdata);

        //进行oss文件操作(并返回videoid)
        //如果客户端传来了videoid，则表示这次不是新增，而是修改操作
        const iscopy = await renameObject(filelist, formdata, uuid,videoid);


        //数据存储到数据库
        const isdb = await databashup(iscopy, formdata, uuid,videoid)

        //如果有传来要删除的数组就
        if (delvideolist.length>0&&videoid) {
            //批量删除文件
            await delfile(delvideolist,true)
        }


        res.status(200).json({
            code: 200,
            message: 'ok',
            videoid: iscopy
        })
        //完成后清除临时目录
        try {
            const pathname = process.env.USER_TEM + uuid + '/'+temid+'/'
            await deltem(pathname)
        } catch (error) {}

    } catch (error) {
        //错误处理，传回错误的操作
        const { code, message, data, videoid:errvideoid } = error
        res.status(error.code).json({ code, message, data, videoid })

        //如果第一步校验出错，就是errvideoid还未存在的情况下不会执行回退
        //如果是更改的情况，就是客户端传来的videoid，存在的话，就是更改模式，这时也不需要进行回退
        if (!errvideoid || videoid) return
        console.log('执行回退');
        try {
            //执行回退
            //传入用户id和视频id，并也要删除数据库里有关的这条数据
            await delinbatches(uuid,errvideoid,true)
        } catch (error) { }
    }
})


module.exports = router