const OSS = require('ali-oss');

const client = new OSS({
  //自定义的域名
  endpoint: process.env.OSS_CN,
  cname: true,
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: process.env.OSS_REGION,
  // 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // 填写存储空间名称。
  bucket: process.env.OSS_BUCKET,
});

module.exports = client