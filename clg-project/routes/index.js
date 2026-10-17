var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.json({
    status: 200,
    name: 'Agro Plantation API',
    health: '/api/health',
  });
});

module.exports = router;
