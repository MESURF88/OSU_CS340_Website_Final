module.exports = function(){
    var express = require('express');
    var router = express.Router();


    /*Display home page */
    router.get('/', function(req, res){
        res.render('home');
    });

    return router;
}();
