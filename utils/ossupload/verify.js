//引入oss的配置
const client = require('../../config/ossconfig')
//引入oss操作函数(判断单个文件是否存在)
const {listjy} = require('../osssysutile')

/////////////////////////////////////////////////////////
//进行数据校验(返回false校验失败终止上传)
async function verifydata(filelist, formdata) {
    if (filelist.length===0) {
        throw {
            code:401,
            message:'filelist不能为空',
        }
    }



    //视频列表和封面校验
    const isexist = await fileverify(filelist, formdata)
    //表单校验
    const isform = formverify(formdata)

    if (isexist.allexist && isform) {
        return {
            allisis: true,
            isexist,
            isform
        }
    }
    //抛出错误信息
    throw {
        code:401,
        message:'校验失败',
        data: {
            isexist,
            isform
        }
    }
    
}
/////////////
//提取名字列表
function filename(filelist, formdata) {
    const filename = [];
    //提取视频列表里的名字
    filelist.forEach(element => {
        filename.push(element.urlname)
    });
    //提取封面的名字
    filename.push(formdata.cover.urlname)
    return filename
}

//视频列表和封面校验
async function fileverify(filelist, formdata) {
    //提取名字列表
    const filenamelist = filename(filelist, formdata)
    //创建一个数组，通过listjy模板并发
    const allfilename = filenamelist.map(listjy)
    //并发
    const islist = await Promise.all(allfilename)
    //进行判断是不是返回的对象exist都是true
    const isis = islist.every(e => {
        return e.exist === true
    })
    return { allexist: isis, data: islist }
}

////////////////////////////

///////////////////////////
//表单校验
function formverify(formdata) {
    const { classify, cover, desc, title, soubdate, status, type } = formdata
    if (classify.lenth === 0 || cover.urlname === '' || title === '' || status === '' || type === '') {
        return false
    } else {
        return true
    }
}

/////////////////////////////////////////////////////////


module.exports = verifydata