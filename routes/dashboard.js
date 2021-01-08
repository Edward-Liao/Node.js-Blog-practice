const express = require('express');

const router = express.Router();
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('/categories/');
const articlesRef = firebaseAdminDb.ref('/articles/');
// const userRef = firebaseAdminDb.ref('/user/');
const articlesLength = [];

articlesRef.once('value').then((snapshot) => {
  snapshot.forEach((snapshotChild) => {
    // 判斷是否為公開文章
    if (snapshotChild.val().status === 'public') {
      articlesLength.push(snapshotChild.val());
    }
  });
});

// dashboard頁面
router.get('/', (req, res) => {
  const messages = req.flash('error');
  res.render('dashboard/index', {
    title: '您好 ',
    // eslint-disable-next-line no-undef
    name: users.name,
    totalResult: articlesLength.length,
    currentPath: '/',
    hasErrors: messages.length > 0,
  });
});

// 文章管理頁面
router.get('/archives', (req, res) => {
  // eslint-disable-next-line radix
  const currentPage = Number.parseInt(req.query.page) || 1;
  let categories = {};
  const status = req.query.status || 'public';
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then((snapshot) => {
    const articles = [];
    snapshot.forEach((snapshotChild) => {
      if (status === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    });
    articles.reverse();
    const data = convertPagination(articles, currentPage);
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
router.get('/article/create', (req, res) => {
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/article', {
      title: 'Express',
      categories,
    });
  });
});

// 編輯文章頁面
router.get('/article/:id', (req, res) => {
  const { id } = req.params;
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.child(id).once('value');
  }).then((snapshot) => {
    const article = snapshot.val();
    // console.log(article);
    res.render('dashboard/article', {
      title: 'Express',
      categories,
      article,
    });
  });
});

// 新增文章post
router.post('/article/create', (req, res) => {
  const data = req.body;
  const articleRef = articlesRef.push();
  const { key } = articleRef;
  const updateTime = Math.floor(Date.now() / 1000);
  data.id = key;
  data.update_time = updateTime;
  data.counter = 0;
  // eslint-disable-next-line no-undef
  data.name = users.name;
  articleRef.set(data).then(() => {
    res.redirect('/dashboard/archives');
  });
});

// 修改文章post
router.post('/article/update/:id', (req, res) => {
  const data = req.body;
  const { id } = req.params;
  articlesRef.child(id).update(data).then(() => {
    res.redirect('/dashboard/archives');
  });
});

// 刪除文章post
router.post('/article/delete/:id', (req, res) => {
  const { id } = req.params;
  articlesRef.child(id).remove();
  req.flash('info', '文章已刪除');
  res.send('文章已刪除');
  res.end();
});

// 分類頁面
router.get('/categories', (req, res) => {
  const messages = req.flash('info');
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/categories', {
      title: 'Express',
      messages,
      hasInfo: messages.length > 0,
      categories,
    });
  });
});

// 新增分類選項post
router.post('/categories/create', (req, res) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  const { key } = categoryRef;
  data.id = key;
  // 判斷是否有重複名稱或路徑
  categoriesRef.orderByChild('path').equalTo(data.path).once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('info', '已有相同路徑或名稱');
        res.redirect('/dashboard/categories');
      } else {
        categoriesRef.orderByChild('name').equalTo(data.name).once('value')
          // eslint-disable-next-line no-shadow
          .then((snapshot) => {
            if (snapshot.val() !== null) {
              req.flash('info', '已有相同路徑或名稱');
              res.redirect('/dashboard/categories');
            } else {
              categoryRef.set(data).then(() => {
                res.redirect('/dashboard/categories');
              });
            }
          });
      }
    });
});

// 刪除分類選項post
router.post('/categories/delete/:id', (req, res) => {
  const { id } = req.params;
  categoriesRef.child(id).remove();
  req.flash('info', '欄位已刪除');
  res.redirect('/dashboard/categories');
});

module.exports = router;
