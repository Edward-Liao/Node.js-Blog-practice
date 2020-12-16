const express = require('express');
const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');
const firebaseAdminDb = require('../connections/firebase_admin');
const { max } = require('moment');

const categoriesRef = firebaseAdminDb.ref('/categories/');
const articlesRef = firebaseAdminDb.ref('/articles/');

/* GET home page. */
router.get('/', function(req, res, next) {
  const id = req.param('id'); //類別路徑
  let currentPage = Number.parseInt(req.query.page) || 1; //頁碼
  let categories = {};
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then(function (snapshot){
    articles = [];
    snapshot.forEach(function(snapshotChild){
      // 判斷是否為公開文章
      if('public' === snapshotChild.val().status ){
        articles.push(snapshotChild.val());
      }
      
    });
    articles.reverse();

    const data = convertPagination(articles, currentPage)

    res.render('index', {
       title: 'Express',
        articles: data.data,
        categories,
        striptags,
        moment,
        id,
        page: data.page
    });
  });

});

/* 分類的頁面 */
router.get('/archives/:id',function(req,res,next){
  const id = req.param('id'); //類別路徑
  let currentPage = Number.parseInt(req.query.page) || 1; //頁碼
  let categories = {};
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val();
    
    return articlesRef.orderByChild('update_time').once('value');
    
  }).then(function (snapshot){
    articles = [];

    snapshot.forEach(function(snapshotChild){
      if('public' === snapshotChild.val().status &&   id === categories[snapshotChild.val().category].path){
        articles.push(snapshotChild.val());
      
      }
      
    });
    articles.reverse();

    const data = convertPagination(articles, currentPage)
  
    res.render('index', {
       title:'express',
        articles: data.data,
        categories,
        striptags,
        moment,
        id,
        page: data.page
    });
  });

});


/* 文章的頁面 */
router.get('/post/:id', function(req, res, next) {

  const id = req.param('id');
    let categories = {};
    categoriesRef.once('value').then(function(snapshot){
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
      }).then(function(snapshot){

        const article = snapshot.val();

        if(!article){
          return res.render('error',{
            title: '找不到該文章'
          });
        }
        articlesRef.child(id).update({'counter':article.counter+1}); //觀看次數＋1
           return articlesRef.child(id).once('value');
      }).then(function(snapshot){

        article = snapshot.val();
        // console.log(categories[article.category].path);
        // console.log(article.counter); //顯示觀看次數
        res.render('post', { 
          title: 'Express',
          article,
          categories,
          striptags,
          moment,
          id:categories[article.category].path
           });

      });

});


module.exports = router;
