//随机id
const nanoid = require('nanoid')
//path
const path = require('path');
//引入oss的配置
const client = require('../../config/ossconfig');



//进行oss文件操作
async function renameObject(filelist, formdata, uuid, videoid) {
    //随机视频id,如果客户端没有传来videoid，则视为新增，随机一个id，有的话就不用了
    if (!videoid) {
        videoid = 'FX' + nanoid.nanoid(10)
    }
    //固定视频id
    // const videoid = 'FXawfawdawa'
    //传入视频id，和用户id
    const alllist = disposal(filelist, formdata, videoid, uuid)
    const reslist = await Promise.all(alllist)






    //传回videoid和整理好的将要保存到数据库的视频和封面列表
    return { videoid, reslist }

    // const isis = reslist.every(e => {
    //     return e.status === 'success'
    // })

    // if (isis) {
    //     return { videoid, reslist }
    // } else {
    //     throw ({
    //         code: 402,
    //         message: 'oss文件复制出错',
    //         data: {
    //             isfull: isis,
    //             videoid,
    //             data: reslist,
    //         },
    //         videoid
    //     })
    // }

}
//整理promise并发数组
function disposal(filelist, formdata, videoid, uuid) {
    //拿到整理好的，添加了videoid和后缀的数组
    const arrlistvideo = disarrlistvideo(filelist, formdata, videoid, uuid)
    //创建promise数组
    const promiselist = arrlistvideo.map(onepromise)
    return promiselist
}
async function onepromise(e) {

    const randomid = nanoid.nanoid(10)
    //准备复制到的视频的名字路径:视频前缀/用户id/视频id/vide-编号.mp4
    let videopath = process.env.USER_PREFIX + e.uuid + '/' + e.videoid + '/' + randomid + e.suffix
    //准备复制到的封面的名字路径:视频前缀/用户id/视频id/cover.jpg
    let coverpath = process.env.USER_PREFIX + e.uuid + '/' + e.videoid + '/' + 'cover' + e.suffix

    //如果之前上传过的就还用之前的urlname
    if (e.isbeforup) {
        videopath = e.urlname
        coverpath = e.urlname
    }

    try {
        //判断当前对象有没有编号，有编号就是视频，没有就是封面
        if (e.serial) {
            //不是之前创建过的就生成一个随机id，从临时目录copy到正式目录
            if (!e.isbeforup) {
                await client.copy(videopath, e.urlname);
            }
            return {
                name: e.name,
                status: 'success',
                urlname: videopath,
                type: 'video',
                videoid: e.videoid,
                size: e.size,
                serial: e.serial,
                isbeforup: true
            }
        } else {
            //封面
            //不是之前创建过的就生成一个随机id，从临时目录copy到正式目录
            if (!e.isbeforup) {
                await client.copy(coverpath, e.urlname)
            }
            return {
                name: 'cover' + e.suffix,
                status: 'success',
                url: process.env.OSS_CN + '/' + coverpath,
                urlname: coverpath,
                type: 'cover',
                size: e.size,
                videoid: e.videoid,
                isbeforup: true
            }
        }
    } catch (error) {
        let type;
        if(e.serial){
            type = 'video'
        } else{
            type = 'cover'
        }
        return {
            name: e.name,
            status: 'fail',
            videoid: e.videoid,
            size: e.size,
            type,
            serial: e.serial,
            isbeforup: true
        }
    }
}


//数组格式整理
function disarrlistvideo(filelist, formdata, videoid, uuid) {
    //加上后缀属性和uuid
    //这是视频
    const arrlistvideo = filelist.map(e => {
        return {
            ...e,
            suffix: path.extname(e.urlname),
            videoid,
            uuid
        }
    })
    const { cover } = formdata
    //这是封面都组合在一个数组里
    arrlistvideo.push({
        ...cover,
        suffix: path.extname(cover.urlname),
        videoid,
        uuid
    })
    return arrlistvideo
}


module.exports = renameObject