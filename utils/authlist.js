async function getauthlist(auth) {
  try {
    const list = [
      { label: "普通用户", value: 1 },
      { label: "管理员", value: 9 },
      { label: "超级管理员", value: 10 },
    ];
    const lists = list.filter((e) => {
        return e.value < auth;
      });
    return lists;
  } catch (error) {
    return Promise.reject({
        code:500,
        message:'获取用户权限列表失败'
    })
  }
}

module.exports = getauthlist;
