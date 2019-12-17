module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* Search/filter through rows of buildings */
    function getBuildings(res, mysql, context, searched, filters_name, filters_arr, complete){
      if (searched === 0){
        var default_search ="";
        name_query = default_search.replace(";","");
        var inserts = ['[0-9]*', 0, Math.pow(2,127), 'industrial','residential','commercial', 0, Math.pow(2,127)];
      }
      else{
        name_query = filters_name.replace(";","");//protect against stopping query
         var inserts;
         inserts = filters_arr;
         if (filters_arr[3] === "-" && filters_arr[0] === "-"){
           inserts = ['[0-9]*', inserts[1], inserts[2], 'industrial','residential','commercial', inserts[6], inserts[7]];
         }
         else if (filters_arr[0] === "-") {
           inserts[0] = '[0-9]*';
         }
         else if (filters_arr[3] === "-") {
           inserts[3] = ['industrial'];
           inserts[4] = ['residential'];
           inserts[5] = ['commercial'];
         }
      }
      var sql = "SELECT building_id, building_name, energy_company_name, b_square_feet, build_date, _function, energy_consumption FROM building "
       + "INNER JOIN energy_company ON building.energy_company_id = energy_company.energy_company_id "
       + "AND building.energy_company_id REGEXP ?"
       +" AND (b_square_feet>=? AND b_square_feet<=?) AND building_name LIKE '%"+name_query+"%' AND _function IN (?, ?, ?) AND (energy_consumption>=? AND energy_consumption<=?)";
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.buildings = results;
            complete();
        });
    }

    /* Get all rows of buildings */
    function getBuilding(res, mysql, context, id, complete){
        var sql = "SELECT building_id, building_name, energy_company_id, b_square_feet, build_date, _function, energy_consumption FROM building WHERE building.building_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.building = results[0];
            complete();
        });
    }

    /* Get all rows of energy_company */
    function getEnergyCompanys(res, mysql, context, complete){
          mysql.pool.query("SELECT energy_company_id, energy_company_name, net_worth FROM energy_company", function(error, results, fields){
              if(error){
                  res.write(JSON.stringify(error));
                  res.end();
              }
              context.energy_companys = results;
              complete();
          });
      }

    /* Display all rows in buildings*/
    router.get('/', function(req, res){
		    var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteBuilding.js"];
        filters_name = req.query.search_string;
        filters_arr = [req.query.search_company, req.query.search_b_square_feet_min, req.query.search_b_square_feet_max, req.query.search_function,
        req.query.search_function, req.query.search_function, req.query.search_energy_cons_min, req.query.search_energy_cons_max];
        if (filters_name === undefined){//if un-initialized value when loading webpage
          var searched = 0;
        }
        else{
          var searched = 1;
        }
        var mysql = req.app.get('mysql');
        getBuildings(res, mysql, context, searched, filters_name, filters_arr, complete);
        getEnergyCompanys(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('buildings', context);
            }

        }
    });


    /* Display a building to update it */
    router.get('/:id', function(req, res){
		    callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateBuilding.js"];
        var mysql = req.app.get('mysql');
        getBuilding(res, mysql, context, req.params.id, complete);
        getEnergyCompanys(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-building', context);
            }

        }
    });

    /* Add new building*/
    router.post('/', function(req, res){
		    var mysql = req.app.get('mysql');
        var sql = "INSERT INTO building (building_name, energy_company_id, b_square_feet, build_date, _function, energy_consumption) VALUES (?,?,?,?,?,?)";
        var inserts = [req.body.building_name, req.body.energy_company_id, req.body.b_square_feet, req.body.build_date, req.body._function, req.body.energy_consumption];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/buildings');
            }
        });
    });

    /* Update a building */
    router.put('/:id', function(req, res){
		    var mysql = req.app.get('mysql');
        var sql = "UPDATE building SET building_name=?, energy_company_id=?, b_square_feet=?, build_date=?, _function=?, energy_consumption=? WHERE building_id=?";
        var inserts = [req.body.building_name, req.body.energy_company_id, req.body.b_square_feet, req.body.build_date, req.body._function, req.body.energy_consumption, req.params.id];
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

    /* Delete a building, returns a 202 if successful. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM building WHERE building_id = ?";
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
