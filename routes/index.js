const express = require('express');

const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
// const { max } = require('moment');
const convertPagination = require('../modules/convertPagination');
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('/categories/');
const articlesRef = firebaseAdminDb.ref('/articles/');

/* GET home page. */
router.get('/', (req, res) => {
  const { id } = req.params; // 類別路徑
  // eslint-disable-next-line radix
  const currentPage = Number.parseInt(req.query.page) || 1; // 頁碼
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot) => {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      // 判斷是否為公開文章
      if (snapshotChild.val().status === 'public') {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    const data = convertPagination(articles, currentPage);
    res.render('index', {
      title: 'Express',
      articles: data.data,
      categories,
      striptags, // 去除 HTML 標籤套件
      moment, // 時間套件
      id,
      page: data.page,
    });
  });
});

/* 分類的頁面 */
router.get('/archives/:id', (req, res) => {
  const { id } = req.params; // 類別路徑
  // eslint-disable-next-line radix
  const currentPage = Number.parseInt(req.query.page) || 1; // 頁碼
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot) => {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      if (snapshotChild.val().status === 'public' && id === categories[snapshotChild.val().category].path) {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    const data = convertPagination(articles, currentPage);
    res.render('index', {
      title: 'express',
      articles: data.data,
      categories,
      striptags,
      moment, // 時間套件
      id,
      page: data.page,
    });
  });
});

/* 文章的頁面 */
router.get('/post/:id', (req, res) => {
  const { id } = req.params;
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.child(id).once('value');
  }).then((snapshot) => {
    const article = snapshot.val();
    if (!article) {
      return res.render('error', {
        title: '找不到該文章',
      });
    }
    articlesRef.child(id).update({ counter: article.counter + 1 }); // 觀看次數＋1
    return articlesRef.child(id).once('value');
  }).then((snapshot) => {
    const article = snapshot.val();
    res.render('post', {
      title: 'Express',
      article,
      categories,
      striptags,
      moment, // 時間套件
      id: categories[article.category].path,
    });
  });
});

module.exports = router;
