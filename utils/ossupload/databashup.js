//导入mongodb新增函数
const { insertmongo } = require('../mongoclient')
//导入获取列表的函数
const getlistoss = require('../getlistoss')


//用户变量，后面做账号功能用
const prefix = 'video/'

//数据存储到数据库
async function upmongodb(videoid, formdata) {
    try {
        //获取视频列表
        const listoss = await getlistoss(prefix + process.env.USER_ID + '/' + videoid + '/')
        
        //进行数组整理，添加到数据库
        const listdisposal = disposal(listoss, formdata)

        //数据库进行新增
        const isis = await insertmongo(listdisposal)
        return isis.acknowledged
    } catch (error) {
        throw {
            code:403,
            message:error.message,
            data:error
        }
    }
}

function disposal(listoss, formdata) {
    const { title, desc, type, classify, status, soubdate } = formdata
    //封面,数组中第一个就是
    const cover = listoss[0]
    //视频，数组中除了第一个都是
    const videolist = listoss.filter((e, i) => i > 0)
    //加上编号
    videolist.forEach((e, i) => {
        e.serial = i + 1
    });
    return {
        title, desc, type, classify, status, soubdate,
        videolist,
        cover
    }
}



module.exports = upmongodb