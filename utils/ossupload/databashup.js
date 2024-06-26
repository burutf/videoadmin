//导入mongodb新增函数
const { insertmongo } = require('../mongoclient')
//导入获取列表的函数
const {getlistoss} = require('../osssysutile')




//数据存储到数据库
async function upmongodb(videoid, formdata,uuid) {
    try {
        //获取视频列表(传入uuid和视频id)
        const listoss = await getlistoss(process.env.USER_PREFIX + uuid + '/' + videoid + '/')

        //进行数组整理，添加到数据库
        const listdisposal = disposal(listoss, formdata,uuid,videoid)
        //数据库进行新增(传入整理好要新增的数据，还有要存放的数据库和集合的名字)
        const isis = await insertmongo(listdisposal);
        return isis.acknowledged
    } catch (error) {
        return Promise.reject ({
            code:error.code,
            message:error.message,
            data:error.data,
            videoid
        })
    }
}

function disposal(listoss, formdata,uuid,videoid) {
    const { title, desc, type, classify, status, soubdate } = formdata
    //封面,数组中第一个就是
    const cover = listoss[0]
    //视频，数组中除了第一个都是
    const videolist = listoss.filter((e, i) => i > 0)
    //加上编号
    videolist.forEach((e, i) => {
        e.serial = i + 1
    });
    //获取当前的时间
    const date = new Date()
    return {
        title, desc, type, classify, status, soubdate,
        videolist,
        videoid,
        cover,
        uuid,
        createddate:date.toISOString(),
        lastupdate:date.toISOString()
    }
}



module.exports = upmongodb