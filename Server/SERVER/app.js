const express=require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const PORT=3001
const {MONGOURI}=require('./keys')
const bodyParser=require('body-parser');



app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())

require('./models/user')
require('./models/post')

app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))
//app.use(bodyParser.urlencoded({extended:true}))


mongoose.connect(MONGOURI)

mongoose.connection.on('connected',()=>{
    console.log("Connected to mongo")
})

mongoose.connection.on('error',(err)=>{
    console.log("error",err)
})



app.listen(PORT,()=>{
    console.log("Server is running on",PORT)
})