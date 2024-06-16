//引入oss的配置
const client = require('../config/ossconfig');


async function getlistoss(strname){
    try {
        const reslist = await client.listV2({prefix:strname})
        if (reslist.objects.length===0) {
            throw new Error ('列表没有文件')
        }
        return reslist.objects
    } catch (error) {
        throw new Error ('获取oss文件列表错误:'+error.message)
    }
}

module.exports = getlistoss