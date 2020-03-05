const koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const db = require('./src/config/db')
const users = require('./routes/api/users')
const bodyParser = require('koa-bodyparser')
const passport = require('koa-passport')


//实例化koa
const app = new koa()
app.use(bodyParser());
const router = new Router()

router.get("/", async ctx => {
    ctx.body = {msg:"hello koa"}
})
// mongodb+srv://root:<password>@cluster0-f99sp.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect(db.dburl,{useUnifiedTopology: true,useNewUrlParser: true })
.then(()=>{
    console.log("MongoDB conneted....")
}) 
.catch(error =>{
    console.log("MongoDB conneted Erro")
})

app.use(passport.initialize())
app.use(passport.session())
require("./src/config/passport")(passport)
router.use('/api/users',users)
//配置路由
app.use(router.routes()).use(router.allowedMethods())

const port = process.env.port || 5000
app.listen(port, () => {
    console.log("hello koa")
})
