const express = require('express');
const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('/categories/');
const articlesRef = firebaseAdminDb.ref('/articles/');
const userRef = firebaseAdminDb.ref('/user/');

articlesRef.once('value').then(function(snapshot){
  articles = [];
  snapshot.forEach(function(snapshotChild){
    // 判斷是否為公開文章
    if('public' === snapshotChild.val().status ){
      articles.push(snapshotChild.val());
    }
   });
  });

  

// dashboard頁面
router.get('/', function(req, res) {
  const messages =req.flash('error');
  
  console.log(users);


    res.render('dashboard/index', { 
      title: "您好 ",
      name: users[0].name,
      totalResult:articles.length,
      currentPath:'/',
      hasErrors: messages.length > 0
   });
  });

// 文章管理頁面
router.get('/archives', function(req, res, next) {
    let currentPage = Number.parseInt(req.query.page) || 1;
    let categories = {};
    const status = req.query.status || 'public';
    categoriesRef.once('value').then(function(snapshot){
      categories = snapshot.val();
      return articlesRef.orderByChild('update_time').once('value');
    }).then(function (snapshot){
      articles = [];
      snapshot.forEach(function(snapshotChild){
        // console.log('child', snapshotChild.val());
        if(status === snapshotChild.val().status ){
          articles.push(snapshotChild.val());
        }
        
      });
      articles.reverse();

      const data = convertPagination(articles, currentPage)

      console.log(data.page);      

      res.render('dashboard/archives', {
         title: 'Express',
         status,
         page: data.page,
          articles: data.data,
          categories,
          striptags,
          moment,
           });
    });
  });
  
// 新增文章頁面
router.get('/article/create', function(req, res, next) {
    
    categoriesRef.once('value').then(function(snapshot){
      const categories = snapshot.val();
      res.render('dashboard/article', { 
        title: 'Express',
        categories });
    })
});

// 編輯文章頁面
router.get('/article/:id', function(req, res, next) {
    const id = req.param('id');
    let categories = {};
    categoriesRef.once('value').then(function(snapshot){
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
      }).then(function(snapshot){
        const article = snapshot.val();
        console.log(article);
        res.render('dashboard/article', { 
          title: 'Express',
          categories,
          article });
      })
});


// 新增文章post
router.post('/article/create',function(req , res){
    console.log(req.body);
    const data = req.body;
    const articleRef = articlesRef.push();
    const key = articleRef.key;
    const updateTime = Math.floor(Date.now() / 1000);
    data.id = key;
    data.update_time = updateTime;
    data.counter = 0;
    data.name = users[0].name;
    console.log(data);
    articleRef.set(data).then(function(){
      res.redirect(`/dashboard/archives`);
    });
    
});

// 修改文章post
router.post('/article/update/:id',function(req , res){
    const data = req.body;
    const id = req.param('id');
    console.log(data);
    articlesRef.child(id).update(data).then(function(){
      res.redirect(`/dashboard/archives`);
    });
});

// 刪除文章post
router.post('/article/delete/:id',function(req , res){
    const id = req.param('id');
    articlesRef.child(id).remove();
    req.flash('info','文章已刪除');
    res.send('文章已刪除');
    res.end();
});


// 分類頁面
router.get('/categories', function(req, res, next) {
  const messages = req.flash('info');
  categoriesRef.once('value').then(function(snapshot){
    const categories = snapshot.val();
    console.log(categories);
    res.render('dashboard/categories', {
        title: 'Express',
        messages,
        hasInfo: messages.length >0 ,
        categories,
      });
  });
});

//新增分類選項post
  router.post('/categories/create',function(req , res){
    const data = req.body;
    console.log(data);
    const categoryRef = categoriesRef.push();
    const key = categoryRef.key;
    data.id = key;
    // 判斷是否有重複名稱或路徑
    categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then(function(snapshot){
      if (snapshot.val() !== null){
        req.flash('info','已有相同路徑或名稱');
        res.redirect('/dashboard/categories');
      }else{

        categoriesRef.orderByChild('name').equalTo(data.name).once('value')
        .then(function(snapshot){
          if (snapshot.val() !== null){
            req.flash('info','已有相同路徑或名稱');
            res.redirect('/dashboard/categories');
          }else{
    
            categoryRef.set(data).then(function(){
              res.redirect('/dashboard/categories');
            });
          }
        });

      }
    });

  });

  //刪除分類選項post
  router.post('/categories/delete/:id',function(req , res){
    const id = req.param('id');
    categoriesRef.child(id).remove();
    req.flash('info','欄位已刪除');
    res.redirect('/dashboard/categories');
  });

module.exports = router;