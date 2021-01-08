const express = require('express');
// const { auth } = require('firebase-admin');
const firebaseClient = require('../connections/firebase_client');
const firebaseDb = require('../connections/firebase_admin');
// const app = require('../app');
const router = express.Router();
const userRef = firebaseDb.ref('/user/');

// 註冊頁面
router.get('/signup', (req, res) => {
  const messages = req.flash('error');
  res.render('dashboard/signup', {
    messages,
    hasErrors: messages.length > 0,
  });
});

// 註冊post
router.post('/signup', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const { name } = req.body;
  firebaseClient.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      // console.log('註冊成功');
      const uid = userRef.push().key;
      const userinfo = {};
      userinfo.email = email;
      userinfo.uid = uid;
      userinfo.name = name;
      userRef.push().set(userinfo);
      res.redirect('signin');
    })
    .catch((error) => {
      // console.log(error);
      req.flash('error', error.message);
      res.redirect('signup');
    });
});

// 登入頁面
router.get('/signin', (req, res) => {
  if (req.session.uid) {
    res.redirect('/dashboard');
  } else {
    const messages = req.flash('error');
    if (messages[0] === 'The password is invalid or the user does not have a password.') {
      messages[0] = '密碼錯誤 請重新輸入！';
    } else if (messages[0] === 'There is no user record corresponding to this identifier. The user may have been deleted.') {
      messages[0] = '電子郵件錯誤或使用者不存在！';
    }
    res.render('dashboard/signin', {
      messages,
      hasErrors: messages.length > 0,
    });
  }
});

// 登入post
router.post('/signin', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  firebaseClient.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
    // console.log('登入成功');
      req.session.uid = firebaseClient.auth().currentUser.uid;
      req.session.mail = req.body.email;

      userRef.once('value').then((snapshot) => {
        // 逐一對比資料庫內信箱
        snapshot.forEach((snapshotChild) => {
          if (req.session.mail === snapshotChild.val().email) {
            // eslint-disable-next-line no-undef
            users = snapshotChild.val();
            res.redirect('/dashboard');
          }
        });
      });
    })
    .catch((error) => {
    // console.log(error);
      req.flash('error', error.message);
      res.redirect('/auth/signin');
    });
});

// 登出
router.get('/logout', (req, res) => {
  firebaseClient.auth().signOut().then(() => {
    // Sign-out successful.
    req.session.uid = '';
    req.session.mail = '';
    // console.log('您已登出！');
    res.redirect('/auth/signin');
  })
    .catch((error) => {
    // An error happened.
      req.flash('error', error.message);
    });
});

module.exports = router;
