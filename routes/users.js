const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const logger = require('../logger');

// Load User model
const User = require('../models/User')
const Review=require('../models/Review')
const Course=require('../models/Course')
const Professor=require('../models/Professor')
var courses
const { ensureAuthenticated,forwardAuthenticated,ensureadminAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 ,stud_id} = req.body;
  let errors = [];

  if (!name || !email || !password || !password2 ||!stud_id) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
      stud_id
    });
  } else {
    User.findOne({ name: name }).then(user => {
      if (user) {
        errors.push({ msg: 'Username already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
          stud_id
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          stud_id
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );

                logger.logResponse(user, user ,"User registered successfully");
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });``
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  }
  
  
  )(req, res, next);

  var msg="user logged in "
  logger.logResponse(req.user, req.user ,msg);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});


//review a Course
router.get('/addReview', ensureAuthenticated,async (req, res) =>{
  //var query=Course.find().select('name')
  
  await Course.find({},'name', function(err,result){
    if(err)
    courses=['<no course found>']
    else
    courses=result
  })
  /*query.exec(function (err,course){
    if(err) 
    {}
    else
    courses=query
  }
  ) */ 
  res.render('addReview', {
    user: req.user,
    courses:courses
  })

});


router.post('/addReview', ensureAuthenticated,async(req,res)=>{
  var review1
var course_id
var course_rating
  let errors=[]
  var { course,rating,difficulty,comment,stud_id} = req.body;
  //validation
  if (!stud_id || rating<1|| rating>5 || difficulty<1 || difficulty>5 || course=="Choose Course") {
   // console.log("\n",course+rating1+rating2+rating3+rating4+rating5+net_rating+stud_id)
    errors.push({ msg: 'Please enter all fields correctly' });
  }

var review1id;
  if (errors.length > 0) {
    res.render('addReview', {
      errors,user: req.user,
      stud_id,courses,rating,difficulty,comment
    });
  } else {

    //console.log("\n",course+rating1+rating2+rating3+rating4+rating5+net_rating+stud_id)
    
         //get course._id
   
    student=req.user.name
    review1 = new Review()
     review1.rating=rating
     review1.difficulty=difficulty
    
    
     review1.comment=comment
     review1.student=student
     review1.course=course

    
    review1.save()
    logger.logResponse(req.user, review1 ,"Review created");

    review1id=review1._id;

  



  
   
    

     async function AddReviewToUser(){await User.findOneAndUpdate({ stud_id:stud_id  } ,{$addToSet:{Reviewed:review1id }} ,
        async function (err,result){
          if(err){
            errors.push({ msg: 'Cant find user id' })
            res.render('addReview', {
              errors,
              user: req.user,courses,student,rating,difficulty,comment
            });
          }

          else{

            req.flash(
              'success_msg',
              'Review added to user'
            );
           
          }
        });

      }
        
    var addReviewToUser= await AddReviewToUser()

 async function FindAllRatingOfCourse(){
  await Review.aggregate([

          {$match:{
            course:course
          }},
          {
            $group:{
    
              _id:null, 

             rating_avg:{$avg:"$rating"},
             difficulty_avg:{$avg:"$difficulty"},
    
          
    
            }
    
    
          }
    
    
  ], async function(err,result){
          if(err)
          {

          }
          else{
            console.log("\n",result)
          course_rating=result[0]
        console.log("course:",course_rating)
      }
        })
      }
var findAllRatingOfCourse=await FindAllRatingOfCourse()
console.log("\n",course_rating)


//update course
async function UpdateRatingOfCourse(){
  await Course.findOneAndUpdate({ name: course } ,{$addToSet:{Reviews:review1id },
    $set:{Rating:course_rating.rating_avg
    ,Difficulty:course_rating.difficulty_avg,
   
  }
    
    
    } ,
        async  function (err,result){
            if(err){
              errors.push({ msg: 'Cant find course' })
              Review.deleteOne({_id:review1id})
              res.render('addReview', {
                errors,
                user: req.user,courses,stud_id,rating,difficulty,comment
              });
            }
  
            else{
  
              req.flash(
                'success_msg',
                'Review added to course'
              );
              res.redirect('/dashboard');
            }
          });
      


        }   
        
        var updateRatingOfCourse=await UpdateRatingOfCourse()


      }
    





})

//add a Course

router.get('/addCourse',ensureAuthenticated, (req, res) =>{
  
  if(req.user.name!="admin")
  {
            
    req.flash(
      'err_msg',
      'Only admin can view the resource'
    );
    res.redirect('/dashboard');

  }
  else{
  res.render('addCourse', {
    user:req.user
  })}
})



router.post('/addCourse',(req,res)=>{

  
  
  let errors=[]
  const { name,sem,desc,Faculty} = req.body;
  //validation
  if (!name || !sem || !desc || !Faculty ) {
    errors.push({ msg: 'Please enter all fields' });
  }

  var Reviews_Count=0
  if (errors.length > 0) {
    res.render('addCourse', {
      errors,
      name,sem,desc,Faculty
    });
  } else {
    Rating="No Reviews"
    Difficulty="No Reviews"
    


    const course1 = new Course({
      name,sem,desc,Faculty,Rating,Difficulty
    });

/*
    

    



  */  
   


    course1.save()

    


    logger.logResponse(req.user, course1 ,"Course created successfully");
            
    req.flash(
      'success_msg',
      'Course added'
    );
    res.redirect('/dashboard');



}
})



router.get('/delCourse',ensureAuthenticated,async (req, res) =>{
  
  if(req.user.name!="admin")
  {
            
    req.flash(
      'err_msg',
      'Only admin can view the resource'
    );
    res.redirect('/dashboard');

  }
  else{

    await Course.find({},'name', function(err,result){
      if(err)
      courses=['<no course found>']
      else
      courses=result
    })


  res.render('delCourse', {
    user:req.user,
    courses:courses
  })}
})





router.post('/delCourse',(req,res)=>{

  
  
  let errors=[]
  const { course_name } = req.body;
  //validation
  if (course_name=="Choose Course" ) {
    errors.push({ msg: 'Please enter all fields' });
  }

  var Reviews_Count=0
  if (errors.length > 0) {
    res.render('delCourse', {
      errors,user: req.user,
      courses,
      });
  } else {
    
    Course.remove({ name: course_name }, function(err) {
      if (!err) {
        req.flash(
          'success_msg',
          'Course deleted'
        );
        res.redirect('/dashboard');
      }
      else {
        
        errors.push({ msg: 'Cant find course' })
        
        res.render('delCourse', {
          errors,
          user: req.user,courses
        });
      }
  });


/*
    
   
    



  */  
   

  


            
    



}
})


module.exports = router;
