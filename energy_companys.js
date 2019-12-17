module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Search/filter rows of energy_company */
    function getEnergyCompanys(res, mysql, context, searched, filters_name, filters_arr, complete){
      if (searched === 0){
        var default_search ="";
        name_query = default_search.replace(";","");
        var inserts = ['[0-9]*', 0, Math.pow(2,127)];
      }
      else{
        name_query = filters_name.replace(";","");//protect against stopping query
         var inserts;
         inserts = filters_arr;
         if (filters_arr[0] === "-"){
           inserts[0] = '[0-9]*';
         }
      }
      var sql = "SELECT DISTINCT c.energy_company_id, c.energy_company_name, c.net_worth FROM energy_company AS c "
      + "LEFT JOIN energy_plant_company AS pc ON c.energy_company_id = pc.energy_company_id "
      + "WHERE pc.energy_plant_id REGEXP ? AND c.energy_company_name LIKE '%"+name_query+"%' AND (c.net_worth>=? AND c.net_worth<=?)";
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_companys = results;
            complete();
        });
    }

    /* Get all rows of energy_company */
    function getEnergyCompany(res, mysql, context, id, complete){
        var sql = "SELECT energy_company_id, energy_company_name, net_worth FROM energy_company WHERE energy_company.energy_company_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_company = results[0];
            complete();
        });
    }

    /* Get all rows of energy_plant*/
    function getEnergyPlants(res, mysql, context, complete){
        mysql.pool.query("SELECT energy_plant_id, energy_plant_name, power_output, p_square_feet, transmission, maintenance_cost, energy_price FROM energy_plant", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_plants = results;
            complete();
        });
    }


    /*Display all rows of energy_company.*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteEnergyCompany.js"];
        filters_name = req.query.search_string;
        filters_arr = [req.query.search_plant, req.query.search_net_worth_min, req.query.search_net_worth_max];
        if (filters_name === undefined){//if un-initialized value when loading webpage
          var searched = 0;
        }
        else{
          var searched = 1;
        }
        var mysql = req.app.get('mysql');
        getEnergyCompanys(res, mysql, context, searched, filters_name, filters_arr, complete);
        getEnergyPlants(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('energy_companys', context);
            }

        }
    });

    /* Display one energy company for updating it */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateEnergyCompany.js"];
        var mysql = req.app.get('mysql');
        getEnergyCompany(res, mysql, context, req.params.id, complete);
        getEnergyPlants(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-energy_company', context);
            }

        }
    });

    /* Add a new energy company */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO energy_company (energy_company_name, net_worth) VALUES (?,?)";
        var inserts = [req.body.energy_company_name, req.body.net_worth];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
              sql = mysql.pool.query("INSERT INTO energy_plant_company (energy_company_id, energy_plant_id) VALUES (?,?)",[results.insertId, req.body.energy_plant_id],function(error, results, fields){
                  if(error){
                      res.write(JSON.stringify(error));
                      res.end();
                  }else{
                      res.redirect('/energy_companys');
                  }
                  });
            }
        });
    });

    /* Update an energy company */
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE energy_company SET energy_company_name=?, net_worth=? WHERE energy_company_id=?; UPDATE energy_plant_company SET energy_plant_id=? WHERE energy_company_id=?";
        var inserts = [req.body.energy_company_name, req.body.net_worth, req.params.id, req.body.energy_plant_id, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    /* Delete energy company, returns a 202 if successful. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM energy_company WHERE energy_company_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    });

    return router;
}();
