//jwt对象
const jwt = require('jsonwebtoken')

const option = {
    // 有效期5小时
    expiresIn: '5h',
}

function jwttoken(load) {
    
    return jwt.sign(load, process.env.JWT_PASS, option)
}

module.exports = jwttoken