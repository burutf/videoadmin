//随机id
const nanoid = require('nanoid')
//path
const path = require('path');
//引入oss的配置
const client = require('../../config/ossconfig');


//进行oss资源操作
const prefix = 'video/'
const userid = '10001/' //用户id

//进行oss文件操作
async function renameObject(filelist, formdata) {

    const alllist = disposal(filelist, formdata)
    const reslist = await Promise.all(alllist)
    //获取文件列表
    const ids = reslist[0].videoid
    list(prefix+userid+ids)

    const isis = reslist.every(e => {
        return e.status === 'success'
    })
    return {
        isfull: isis,
        data: reslist
    }
}
//整理promise并发数组
function disposal(filelist, formdata) {
    //拿到整理好的，添加了videoid和后缀的数组
    const arrlistvideo = disarrlistvideo(filelist, formdata)
    //创建promise数组
    const promiselist = arrlistvideo.map(onepromise)
    return promiselist
}
async function onepromise(e) {
    let rres;
    const videopath = prefix + userid + e.videoid + '/' + 'video-' + e.serial + e.suffix
    const coverpath = prefix + userid + e.videoid + '/' + 'cover' + e.suffix
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
function disarrlistvideo(filelist, formdata) {
    const videoid = 'TF' + nanoid.nanoid(10)
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
//获取列表
async function list(prefix) {
    const result = await client.listV2({
        // 列举文件名中包含前缀`prefix`的文件。
        prefix: prefix
    });
    console.log(result);
}


module.exports = renameObject