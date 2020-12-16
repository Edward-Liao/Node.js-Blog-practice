const express = require('express');
const firebaseClient = require('../connections/firebase_client');
const firebaseDb = require('../connections/firebase_admin');
const app = require('../app');
const { auth } = require('firebase-admin');
const router = express.Router();
const userRef = firebaseDb.ref('/user/');

// 註冊頁面
router.get('/signup', function(req, res) {
  const messages =req.flash('error');
    res.render('dashboard/signup', { 
      messages,
    hasErrors: messages.length > 0
   });
});

//註冊post
router.post('/signup',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  // console.log(firebaseClient.auth);

  firebaseClient.auth().createUserWithEmailAndPassword(email,password)
  .then((user)=>{
    console.log('註冊成功');
    const uid = userRef.push().key 
    userRef.push().set({'email':email,'uid':uid,'name':name});
    res.redirect('signin');
  })
  .catch((error)=>{
    console.log(error);
    req.flash('error',error.message);
    res.redirect('signup');
  });
})


  

// 登入頁面
  router.get('/signin', function(req, res) {

    if(req.session.uid){
      res.redirect('/dashboard');
    }else{
      const messages =req.flash('error');
      
    
      for(var prop in messages ){
        if(messages[prop] === 'The password is invalid or the user does not have a password.'){
          messages[prop] = "密碼錯誤 請重新輸入！";
        }else if(messages[prop] === 'There is no user record corresponding to this identifier. The user may have been deleted.'){
          messages[prop] = "電子郵件錯誤或使用者不存在！";
        }
      }

      res.render('dashboard/signin', { 
        messages,
      hasErrors: messages.length > 0
     });
    }

  });
  
// 登入post
  router.post('/signin',(req,res) =>{
    const email = req.body.email;
    const password = req.body.password;
    // console.log(firebaseClient.auth);

    firebaseClient.auth().signInWithEmailAndPassword(email, password)
    .then((user)=>{


      console.log('登入成功');
      // console.log(user);
      req.session.uid = firebaseClient.auth().currentUser.uid;
      req.session.mail = req.body.email;
      console.log('E-mail',req.session.mail);
      console.log('UID:',req.session.uid);

      userRef.once('value').then(function(snapshot){
        users = [];
        snapshot.forEach(function(snapshotChild){
          if(req.session.mail === snapshotChild.val().email ){
            users.push(snapshotChild.val());

            res.redirect('/dashboard');
          }  
         });
    
      });
    })
    .catch((error)=>{
      console.log(error);
      req.flash('error',error.message);
      res.redirect('/auth/signin');
    });
  });


  //登出
  router.get('/logout',(req,res)=>{
    req.session.uid = ""
    req.session.mail = ""
    console.log('您已登出！');
    res.redirect('/auth/signin');
  })


module.exports = router;