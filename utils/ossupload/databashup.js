//导入mongodb新增函数
const { insertmongo,updatamongo } = require('../mongoclient')
//导入获取列表的函数
const { getlistoss } = require('../osssysutile')




//数据存储到数据库
async function upmongodb(obj, formdata, uuid, isupdata) {
    const {videoid,reslist} = obj
    try {
        //获取视频列表(传入uuid和视频id)
        // const listoss = await getlistoss(process.env.USER_PREFIX + uuid + '/' + videoid + '/')


        //进行数组整理，添加到数据库
        const listdisposal = disposal(reslist, formdata, uuid, videoid)
        //如果是更改的话就执行更改操作
        if (isupdata) {
            const {title, desc, type, classify, status, soubdate,videolist,cover} = listdisposal
            await updatamongo({videoid,uuid},{
                title, desc, type, classify, status, soubdate,videolist,cover
            });
        } else {
            //数据库进行新增(传入整理好要新增的数据，还有要存放的数据库和集合的名字)
            const isis = await insertmongo(listdisposal);
            return isis.acknowledged
        }

        
    } catch (error) {
        return Promise.reject({
            code: error.code,
            message: error.message,
            data: error.data,
            videoid
        })
    }
}

function disposal(listoss, formdata, uuid, videoid) {
    const { title, desc, type, classify, status, soubdate } = formdata
    //封面,数组中第一个就是
    const cover = listoss.find(e=>e.type==='cover')
    //视频，数组中除了第一个都是
    const videolist = listoss.filter(e => e.type==='video')
    //获取当前的时间
    const date = new Date()
    return {
        title, desc, type, classify, status, soubdate,
        videolist,
        videoid,
        cover,
        uuid,
        createddate: date,
        lastupdate: date
    }
}



module.exports = upmongodb