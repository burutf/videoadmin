//引入oss的配置
const client = require('../config/ossconfig');


async function getlistoss(strname){
    try {
        const reslist = await client.listV2({prefix:strname})
        return reslist.objects
    } catch (error) {
        return Promise.reject(error)
    }
}

module.exports = getlistoss