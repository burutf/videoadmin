//引入oss的配置
const client = require("../config/ossconfig");

//获取签名url
async function getsignatureurl(urlname) {
  try {
    const url = client.signatureUrl(urlname, {
      // 设置过期时间为3600s。
      expires: 3600,
    });
    return url;
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: "获取签名失败",
      messerr: error.message,
    });
  }
}

//获取文件列表
async function getlistoss(strname) {
  try {
    const reslist = await client.listV2({ prefix: strname });
    // if (reslist.objects.length === 0) {
    //     return Promise.reject ({
    //         code:400,
    //         message:strname+'文件列表为空'
    //     })
    // }
    return reslist.objects;
  } catch (error) {
    // throw new Error('获取oss文件列表错误:' + error.message)
    return Promise.reject({
      code: 500,
      message: "获取文件列表出错",
      messerr: error.message,
    });
  }
}

//单个文件是否存在
async function listjy(e) {
  try {
    const objtest = await client.head(e);
    return { name: e, exist: true };
  } catch (error) {
    if (error.code === "NoSuchKey") {
      return { name: e, exist: false };
    } else {
      return { name: e, exist: error.message };
    }
  }
}

//删除文件
async function delfile(FileName, ismulti) {
  try {
    //如果ismulti是true就要传数组
    if (ismulti) {
      const rere = await client.deleteMulti(FileName);
      return rere;
    } else {
      const rere = await client.delete(FileName);
      return rere;
    }
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: "删除文件时出现意外的错误" + error.message,
    });
  }
}

//取消分片上传
async function cancelupload(FileName, uploadId) {
  try {
    await client.abortMultipartUpload(FileName, uploadId);
    return "ok";
  } catch (error) {
    return Promise.reject({
      code: 500,
      message: "取消分片上传时出现意外的错误" + error.message,
    });
  }
}

//单文件组合操作（检验》复制+删除原文件）
async function headandcopyanddel(movepath, urlname) {
  try {
    const isex = await listjy(urlname);
    if (!isex.exist) {
      return Promise.reject({
        code: 500,
        message: "文件不存在",
      });
    }
    await client.copy(movepath, urlname);
    delfile(urlname);
    return movepath;
  } catch (error) {
    return Promise.reject({
      code: error.code,
      message: error.message,
    });
  }
}

module.exports = {
  getsignatureurl,
  getlistoss,
  listjy,
  delfile,
  cancelupload,
  headandcopyanddel,
};
