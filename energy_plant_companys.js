module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Get all rows of energy_plant_company */
    function getEnergyPlantCompanys(res, mysql, context, complete){
      var sql = "SELECT pc.energy_company_id, c.energy_company_name, pc.energy_plant_id, p.energy_plant_name FROM energy_plant_company AS pc "
      + "LEFT JOIN energy_plant AS p ON pc.energy_plant_id = p.energy_plant_id "
      + "LEFT JOIN energy_company AS c ON pc.energy_company_id = c.energy_company_id";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_plant_companys = results;
            complete();
        });
    }


    /* Display all rows of energy_plant_company */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getEnergyPlantCompanys(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('energy_plant_companys', context);
            }

        }
    });


    return router;
}();
