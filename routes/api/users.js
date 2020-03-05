const Router = require("koa-router")
const router = new Router();
const User = require("../../models/User")
const bcrypt = require("bcryptjs")
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const passport = require('koa-passport')

// 测试接口连接
router.get("/test",async ctx => {
    ctx.status = 200
    ctx.body = {msg: "User work ....."}
})

// 注册接口
router.post("/register",async ctx => {
    let user = ctx.request.body
    let findResult = await User.find({email:user.email})
    console.log(findResult)
    if(findResult.length > 0){
        ctx.status = 500
        ctx.body = {msg:"邮箱被占用"}
    }
    else{
        const avatar = gravatar.url(user.email, {s: '200', r: 'pg', d: 'mm'});
        let newUser = new User({
            name:user.name,
            avatar,
            password: user.password,
            email: user.email
        })
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newUser.password, salt);
        newUser.password = hash
        console.log(newUser.password)
        await newUser.save().then(
            user=>{
                ctx.body = user
            }
        ).catch( error =>{
            console.log(error)
        })
    }
})

// 登录接口
router.post("/login",async ctx => {
    let username = ctx.request.body.name
    let password = ctx.request.body.password
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    const findResult = await User.find({name:username})
    if(findResult.length>0){
        let user = findResult[0]
        let result = await bcrypt.compareSync(password,findResult[0].password)
        if(result){
            // 返回token
            const payload= {id:user.id,name:user.name,avatar:user.avatar}
            const token = jwt.sign(payload,"secret",{expiresIn: 3600})
            ctx.status = 200
            ctx.body = {msg: "登录成功",token: "Bearer " + token}
        }
        else{
            ctx.status = 400
            ctx.body = {msg: "密码不正确"}
        }
    }
    else{
        ctx.body={msg: "用户不存在"}
    }
})

/**
 * @route Get api/users/current
 * @description 用户信息接口地址  返回用户信息
 * @access 接口是私密的
 */
router.get("/current",passport.authenticate('jwt',{session:false}), async ctx =>{
    ctx.body={
        id: ctx.state.user.id,
        name: ctx.state.user.name,
        email: ctx.state.user.email,
        avatar: ctx.state.user.avatar,
    }

})
module.exports = router.routes()