const jwt = require('jsonwebtoken')

function verifytoken(req,res,next){

    // 获取请求头中的 Authorization(就是token)
    const authorization = req.headers.authorization
    
    //没提供token，返回错误
    if (!authorization) {
        res.status(401).json({
            code:401,
            message:'未提供的令牌或失效'
        })
        return
    }

    //提供了token的话，开始验证有效性
    const token = authorization.split(' ')[1]
    jwt.verify(token,process.env.JWT_PASS,(err,decoded)=>{
        if (err) {
            res.status(401).json({
                code:401,
                message:'未提供的令牌或失效'
            })
        }else{
            // JWT 验证通过，保存解码的信息并继续处理请求
            req.userinfo = decoded;
            next();
        }
    })
}

//cookies中的token校验（用来刷新token）
// function cookietoken(req,res,next){
//     const token = req.cookies.tjowkten

//     //没提供token，返回错误
//     if (!token) {
//         res.status(401).json({
//             code:401,
//             message:'未提供的令牌或失效'
//         })
//         return
//     }


//     jwt.verify(token,process.env.JWT_PASS,(err,decoded)=>{
//         if (err) {
//             res.status(401).json({
//                 code:401,
//                 message:'未提供的令牌或失效'
//             })
//         }else{
//             // JWT 验证通过，保存解码的信息并继续处理请求
//             req.userinfo = decoded;
//             next();
//         }
//     })
// }

module.exports = {verifytoken}