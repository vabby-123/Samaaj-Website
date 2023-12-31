const express = require('express')
const router = express.Router()
const mongoose=require('mongoose')

const requireLogin=require('../middleware/requireLogin')
const Post=mongoose.model("Post")


router.get('/allpost',requireLogin,function(req,res){
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy","_id name")
    .then(function(posts){
        res.json({posts})
    })
    .catch(function(err){
        console.log(err)
    })
})





router.post('/createpost',requireLogin,function(req,res){
    const {title,body,pic} =req.body
    if(!title  || !body || !pic){
        return res.status(422).json({error:"Please add all the fields"})
    } 
    const post = new Post({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save().then(result => {
        res.json({post:result})
    }).catch(err => {
        console.log(err)
    });
})


router.get('/mypost',requireLogin,function(req,res)  //requireLogin then only we will be able to see protected user data
{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name")
    .then(function(mypost){
        res.json({mypost})
    })
    .catch(function(err)
    {
        console.log(err)
    })
})

router.put('/like',requireLogin, function(req,res){
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})


router.put('/unlike',requireLogin, function(req,res){
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    }).exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})


router.put('/comment',requireLogin, function(req,res){
    const comment={
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    }) .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    
    
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        else{
            res.json(result)
        }
    })
})

router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy" , "_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            }).catch(err=>{
                console.log(err)
            })

        }
    })
})

module.exports=router