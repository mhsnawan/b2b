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
    db.collection("sites").find({}).toArray((err, site) => {
      db.collection("categories").find({}).toArray((err, categories) => {
        try {
          res.render('admin/index', {
            title: site[0].title+' - Admin SubCategory',
            logo: site[0].image,
            show: 'addSubCategory',
            categories: categories,
            footer: site[0].title
          });
        }catch(err) {
          res.render('admin/index', {
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
  const name = req.body.subcategoryName;
  const description = req.body.description;
  let response = {};

  MongoClient.connect(config.mongodbHost, (err, dbConnect) => {
    const db = dbConnect.db(config.mongodbName);
    
    saveCategory(db, name, description, (subCategory) => {
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
            show: 'viewCategory',
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

const saveCategory = (db, name, description, callback) => {
  const collection = db.collection('subcategories');
  collection.insertOne({
    name,
    description,
    created_date: new Date()
  }, (err, result) => {
    callback(result);
  })
}

module.exports = router;
