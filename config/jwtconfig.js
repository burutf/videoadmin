//jwt对象
const jwt = require('jsonwebtoken')

// const option = {
    // 有效期15分钟
    // expiresIn: 1000 * 60 *15,
// }

function jwttoken(load,expiresIn) {
    
    return jwt.sign(load, process.env.JWT_PASS, {expiresIn})
}

module.exports = jwttoken