//随机id
const nanoid = require('nanoid')
//path
const path = require('path');
//引入oss的配置
const client = require('../../config/ossconfig');


//用户变量，后面做账号功能用
const prefix = 'video/'

//进行oss文件操作
async function renameObject(filelist, formdata) {
    //先固定的，后面要改成随机的
    const videoid = 'TFSqERBfSAxc'

    const alllist = disposal(filelist, formdata, videoid)
    const reslist = await Promise.all(alllist)

    const isis = reslist.every(e => {
        return e.status === 'success'
    })
    return {
        isfull: isis,
        videoid,
        data: reslist
    }
}
//整理promise并发数组
function disposal(filelist, formdata, videoid) {
    //拿到整理好的，添加了videoid和后缀的数组
    const arrlistvideo = disarrlistvideo(filelist, formdata, videoid)
    //创建promise数组
    const promiselist = arrlistvideo.map(onepromise)
    return promiselist
}
async function onepromise(e) {
    let rres;
    const videopath = prefix + process.env.USER_ID + '/' + e.videoid + '/' + 'video-' + e.serial + e.suffix
    const coverpath = prefix + process.env.USER_ID + '/' + e.videoid + '/' + 'cover' + e.suffix
    try {
        if (e.serial) {
            rres = await client.copy(videopath, e.urlname,)
            return {
                name: e.name,
                status: 'success',
                newurlname: videopath,
                type: 'video',
                videoid: e.videoid
            }
        } else {
            rres = await client.copy(coverpath, e.urlname)
            return {
                name: e.name,
                status: 'success',
                newurlname: coverpath,
                type: 'cover',
                videoid: e.videoid
            }
        }
    } catch (error) {
        return {
            name: e.name,
            status: 'error',
            errormessage: error
        }
    }
}


//数组格式整理
function disarrlistvideo(filelist, formdata, videoid) {
    //加上后缀属性和uuid
    //这是视频
    const arrlistvideo = filelist.map(e => {
        return {
            ...e,
            suffix: path.extname(e.urlname),
            videoid
        }
    })
    const { cover } = formdata
    //这是封面都组合在一个数组里
    arrlistvideo.push({
        ...cover,
        suffix: path.extname(cover.urlname),
        videoid
    })
    return arrlistvideo
}


module.exports = renameObject