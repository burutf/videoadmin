const { getlistoss, delfile } = require('./osssysutile')
const { delmongo } = require('./mongoclient')

//删除视频列表
//第三个参数可选（是不是要删除数据库里保存的这条）
async function delinbatches(uuid, videoid, isclearmongo) {
    try {
        //拿到oss里的文件列表
        const list = await getlistoss(process.env.USER_PREFIX + uuid + '/' + videoid + '/')
        //如果查出来没有文件就不执行删除了
        if (list.length !== 0) {
            //只找出文件名来
            const namelist = list.map(e => e.name)
            await delfile(namelist, true)
        }
        if (isclearmongo === true) {
            await delmongo({ uuid, videoid })
        }
        return 'ok'
    } catch (error) {
        return Promise.reject({
            code: error.code,
            message: '批量删除文件失败：' + error.message
        })
    }
}
//清除指定目录下的文件
async function deltem(pathname) {
    try {
        //拿到oss里的文件列表
        const list = await getlistoss(pathname)
        //只找出文件名来
        const namelist = list.map(e => e.name)
        await delfile(namelist, true)
        return 'ok'
    } catch (error) {
        return Promise.reject({
            code: error.code,
            message: '批量删除文件失败：' + error.message
        })
    }
}

module.exports = { delinbatches, deltem }