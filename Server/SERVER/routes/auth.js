const express=require('express')
const router = express.Router()
const bodyParser=require('body-parser');
const mongoose =require('mongoose')

const User = mongoose.model("User")
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')
const {JWT_SECRET} =require('../keys')
const requireLogin =require('../middleware/requireLogin');
const { route } = require('./post');


router.get('/protected',requireLogin,function(req,res){
    res.send('helloUSer')
 })

router.get('/firstpage',(req,res)=>{
    res.send("hello")
})





router.post('/signup',function(req,res){
    const {name,email,password} = req.body
    if(!email || !password || !name){
       return res.status(422).json({error:"please add all the fields"})
    }
    
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exist"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message:"saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        
    })

        

    })
    .catch(err=>{
        console.log(err)
    })
   
})


router.post('/signin',function(req,res){
    const {email,password}=req.body
    if(!email || !password){
        return res.status(422).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(function(savedUser){
        if(!savedUser){
            return res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(function(doMatch){
            if(doMatch){
                //res.json({message:"Successfully signed in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email} = savedUser
                res.json({token,user:{_id,name,email}})
            }
            else{
                return res.status(422).json({error:"Invalid email or password"})
            }
        })
        .catch(function(err){
            console.log(err)
        })

    })
})




module.exports=router