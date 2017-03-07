module.exports = function(router, Passport, Article) {
  // 根据页码返回用户的文章列表信息
  // post username & pageNumber
  router.post('/get-articles-by-page-number', (req, res) => {
    // 基础校验
    if (req.body == null || req.body == undefined) {
      return res.json('INVALID_REQUEST');
    }

    // 按照时间的降序排序查找文章
    Passport.findOne({username: req.body.username}, function(err, passport_) {
      if (err) {
        return res.json('错误 011：出现异常，请联系管理员');
      } else {
        Article.find({author: passport_._id}, null, {sort: {date: -1}}, function(err, articles) {
          if (err) {
            return res.json('错误 012：出现异常，请联系管理员');
          } else {
            var pageNumber = Number(req.body.pageNumber);
            var articleNumber = articles.length;
            if (pageNumber < 0 || pageNumber > Math.ceil(articleNumber / 10)) {
              return res.json('页码错误')
            } else {
              let tempArticles = articles.slice(pageNumber * 10, Math.min(pageNumber * 10 + 10, articleNumber));
              for (let entry of tempArticles) {
                entry.tagName = [];
                entry.contents = [];
              }
              return res.json(tempArticles);
            }
          }
        });
      }
    });
  });

  // 根据文章标题返回用户的文章信息
  // post username & title
  router.post('/get-article-by-title', (req, res) => {
    // 基础校验
    if (req.body == null || req.body == undefined) {
      return res.json('INVALID_REQUEST');
    }

    Passport.findOne({username: req.body.username}, function(err, passport_) {
      if (err) {
        return res.json('错误 013：出现异常，请联系管理员');
      } else {
        Article.find({author: passport_._id, title: req.body.title}, function(err, article) {
          if (err) {
            return res.json('错误 014：出现异常，请联系管理员');
          } else {
            if (article.length != 1) return res.json('文章标题错误');
            else return res.json(article[0]);
          }
        });
      }
    });
  });

  // 获取文章数目
  // post username
  router.post('/get-articles-number', (req, res) => {
    // 基础校验
    if (req.body == null || req.body == undefined) {
      return res.json('INVALID_REQUEST');
    }

    // 返回文章数目
    Passport.findOne({username: req.body.username} , function(err, passport_) {
      if (err) {
        return res.json('错误 015：出现异常，请联系管理员');
      } else {
        Article.find({author: passport_._id}, function(err, articles) {
          if (err) return res.json('错误 016：出现异常，请联系管理员');
          else return res.json(articles.length);
        });
      }
    });
  });

  checkArticle = function(article) {
    // 文章元素的基础校验
    if (article.title == null || article.title == undefined ||
        article.tagName == null || article.tagName == undefined ||
        article.synopsis == null || article.synopsis == undefined ||
        article.contents == null || article.contents == undefined ||
        article.date == null || article.date == undefined)
      return '文章元素不存在';
    // 检查文章元素是否为空
    let reg = /[^\s]/g;
    let title = String(article.title).match(reg);
    let synopsis = String(article.synopsis).match(reg);
    let contents = String(article.contents).match(reg);
    if (title == null) return '文章标题为空';
    if (synopsis == null) return '文章摘要为空';
    if (contents == null) return '文章内容为空';

    // 检查文章的标签是不是为空
    if (article.tagName.length == 0) return '文章标签为空';
    for (let tag of article.tagName) {
      if (String(tag).match(reg).length <= 0) return '文章标签为空';
    }

    // 检查文章标签是否有重复
    if (article.tagName.length == 2 && article.tagName[0].localeCompare(article.tagName[1]) == 0)
      return '文章标签重复';
    if (article.tagName.length == 3 && (article.tagName[0].localeCompare(article.tagName[1]) == 0 ||
                                        article.tagName[0].localeCompare(article.tagName[2]) == 0 ||
                                        article.tagName[1].localeCompare(article.tagName[2]) == 0))
      return '文章标签重复';
    return 'true';
  }

  // 创建文章
  // post passport && article
  router.post('/create-article', (req, res) => {
    // 基础校验
    if (req.body == null || req.body == undefined) {
      return res.json('INVALID_REQUEST body');
    } else if (req.body.passport == null || req.body.passport == undefined ||
               req.body.article == null || req.body.article == undefined) {
      return res.json('INVALID_REQUEST');
    }

    // 文章校验
    let errString = checkArticle(req.body.article);
    if (errString != 'true') return res.json(errString);

    // 在 Article 数据库中增加新文章
    Passport.find({username: req.body.passport.username, encryptedPassword: req.body.passport.encryptedPassword}, function(err, passport_) {
      if (err) {
        return res.json('错误 017：出现异常，请联系管理员');
      } else {
        if (passport_.length != 1) {
          return res.json('该用户不存在！');
        } else {
          // 检验是否存在相同标题的文章
          Article.find({author: passport_[0]._id, title: req.body.article.title}, function(err, article_) {
            if (article_.length >= 1) return res.json('文章标题已经被占用');
          });
          var article = new Article({
            author: passport_[0]._id,  // 用户凭证的 _id
            date: req.body.article.date,
            image: req.body.article.image,
            title: req.body.article.title,
            synopsis: req.body.article.synopsis,
            tagName: req.body.article.tagName,
            contents: req.body.article.contents
          });
          // 创建新的文章
          article.save(function(err, article_) {
            if (err) return res.json('错误 018：出现异常，请联系管理员');
            else return res.json('true');
          });
        }
      }
    });
  });

  // 更新文章
  // post passport, article, originalTitle
  router.post('/update-article', (req, res) => {
    // 基础校验
    if (req.body == null || req.body == undefined) {
      return res.json('INVALID_REQUEST');
    } else if (req.body.passport == null || req.body.passport == undefined ||
               req.body.article == null || req.body.article == undefined) {
      return res.json('INVALID_REQUEST');
    }

    // 文章校验
    let errString = checkArticle(req.body.article);
    if (errString != 'true') return res.json(errString);

    // 在 Article 数据库中更新文章
    Passport.find({username: req.body.passport.username, encryptedPassword: req.body.passport.encryptedPassword}, function(err, passport_) {
      if (err) {
        return res.json('错误 019：出现异常，请联系管理员');
      } else {
        if (passport_.length != 1) {
          return res.json('该用户不存在！');
        } else {
          // 检查是否存在更新后的同名文章
          if (req.body.originalTitle != req.body.article.title) {
            Article.find({author: passport_[0]._id, title: req.body.article.title}, function(err, article_) {
              if (article_.length >= 1) return res.json('更改后的文章标题已经被占用');
            });
          }
          // 更新用户的文章信息
          Article.find({author: passport_[0]._id, title: req.body.originalTitle}, function(err, rawArticle){
            if (err) {
              return res.json('错误 020：出现异常，请联系管理员');
            } else {
              if (rawArticle.length != 1) {
                return res.json("原文章不存在");
              } else {
                Article.findByIdAndUpdate(rawArticle[0]._id,
                                          {$set: {date: req.body.article.date,
                                                  image: req.body.article.image,
                                                  title: req.body.article.title,
                                                  synopsis: req.body.article.synopsis,
                                                  tagName: req.body.article.tagName,
                                                  contents: req.body.article.contents}}, {new: true},
                                                  function(err, data) {
                                                    if (err) return res.json('错误 021：出现异常，请联系管理员');
                                                    else return res.json('true');
                                          });
              }
            }
          });
        }
      }
    });
  });

  return router;
}
