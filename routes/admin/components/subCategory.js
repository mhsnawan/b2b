var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const config = require('../../../config');

router.use(function(req, res, next) {
  if(req.session.adminId == undefined) {
    res.redirect("/admin/login")
  }else {
    next();
  }
})

router.get('/add', function(req, res, next) {
  MongoClient.connect(config.mongodbHost, (err, dbConnect) => {
    const db = dbConnect.db(config.mongodbName);
    db.collection("categories").find({}).toArray((err, parentCategory) => {
      db.collection("sites").find({}).toArray((err, site) => {
        try {
          res.render('admin/index', {
            category: parentCategory,
            title: site[0].title+' - Admin SubCategory',
            logo: site[0].image,
            show: 'addSubCategory',
            footer: site[0].title
          });
          console.log('hey')
        }catch(err) {
          res.render('admin/index', {
            category: parentCategory,
            title: 'Blog - Admin Category',
            logo: 'vFR1Q.png',
            show: 'addSubCategory',
            footer: 'Blog'
          });
        }
      });
    });
  });
});

router.post('/add', function(req, res, next) {
  const parentId = req.body.parentcategoryid;
  const subCategory = req.body.subCategory;
  let response = {};

  MongoClient.connect(config.mongodbHost, (err, dbConnect) => {
    const db = dbConnect.db(config.mongodbName);
    
    saveCategory(db, parentId, subCategory, (subCategory) => {
      if(!subCategory) {
        response.success = false;
        response.message = 'Something wents wrong in server';
        return res.send(response);
      }
      response.success = true;
      response.message = 'Successfully Saved Category';
      res.send(response);
    })
  });
});

router.get('/view', function(req, res, next) {
  MongoClient.connect(config.mongodbHost, (err, dbConnect) => {
    const db = dbConnect.db(config.mongodbName);
    const collection = db.collection('subcategories');
    collection.find({}).toArray((err, result) => {
      db.collection("sites").find({}).toArray((err, site) => {
        try {
          res.render('admin/index', {
            title: site[0].title+' - Admin Category',
            logo: site[0].image,
            show: 'viewSubCategory',
            category: result,
            footer: site[0].title
          });
        }catch(err) {
          res.render('admin/index', {
            title: 'Blog - Admin Category',
            logo: 'vFR1Q.png',
            show: 'viewSubCategory',
            category: result,
            footer: 'Blog'
          });
        }
      });
    })
  });
});

router.get('/delete', function(req, res, next) {
  const categoryId  = req.query.id;

  let deleteObject = {
    _id: new mongodb.ObjectID(categoryId)
  }
  MongoClient.connect(config.mongodbHost, (err, dbConnect) => {
    const db = dbConnect.db(config.mongodbName);
    const collection = db.collection('subcategories');
    collection.deleteOne(deleteObject, (err, result) => {
      res.redirect('/admin/subcategory/view');
    })
  });
});

const saveCategory = (db, parentId, subCategory, callback) => {
  const collection = db.collection('subcategories');
  collection.insertOne({
    parentId,
    subCategory,
    created_date: new Date()
  }, (err, result) => {
    callback(result);
  })
}

module.exports = router;
