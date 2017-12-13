var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fresh Onions' });
});

//freshOnions
router.get('/freshOnions',	function(req,	res)	{
		res.render('user');
    });

//	http://localhost:3000/formAngular
router.post('/freshOnions',	function(req,	res)	{


});


module.exports = router;
