const { getlistoss, delfile } = require('./osssysutile')

async function delinbatches(pathname) {
    try {
        //拿到oss里的文件列表
        const list = await getlistoss(pathname)
        //只找出文件名来
        const namelist = list.map(e => e.name)
        await delfile(namelist, true)
        return 'ok'
    } catch (error) {
        return Promise.reject({
            code:error.code,
            message:'批量删除文件失败：'+error.message
        })
    }
}

module.exports = delinbatches