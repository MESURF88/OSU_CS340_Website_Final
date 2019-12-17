module.exports = function(){
    var express = require('express');
    var router = express.Router();

      /* Search/filter rows of energy_plant, validate query*/
    function getEnergyPlants(res, mysql, context, searched, filters_name, filters_arr, complete){
      var null_or_not = null;
      if (searched === 0){
        var default_search ="";
        name_query = default_search.replace(";","");
        var inserts = ['[0-9]*','[0-9]*', 0, Math.pow(2,127), 0, Math.pow(2,127), 'overhead','underground','subtransmission', 0, Math.pow(2,127), 0, Math.pow(2,127)];
      }
      else{
         null_or_not = null;
         name_query = filters_name.replace(";","");//protect against stopping query
         var inserts;
         inserts = filters_arr;
         if (filters_arr[6] === "-" && filters_arr[1] === "-" && filters_arr[0] === "-"){
           inserts[0] = ['[0-9]*']; inserts[1] = '[0-9]*'; inserts[6] = ['overhead']; inserts[7] = ['underground']; inserts[8] = ['subtransmission'];
         }
         else if (filters_arr[6] === "-" && filters_arr[1] === "-") {
           inserts[1] = '[0-9]*'; inserts[6] = ['overhead']; inserts[7] = ['underground']; inserts[8] = ['subtransmission'];
         }
         else if (filters_arr[6] === "-" && filters_arr[0] === "-") {
           inserts[0] = '[0-9]*'; inserts[6] = ['overhead']; inserts[7] = ['underground']; inserts[8] = ['subtransmission'];
         }
         else if (filters_arr[1] === "-" && filters_arr[0] === "-") {
            inserts[0] = '[0-9]*'; inserts[1] = '[0-9]*';
         }
         else if (filters_arr[6] === "-") {
            inserts[6] = ['overhead']; inserts[7] = ['underground']; inserts[8] = ['subtransmission'];
         }
         else if (filters_arr[1] === "-") {
            inserts[1] = '[0-9]*';
         }
         else if (filters_arr[0] === "-") {
            inserts[0] = '[0-9]*';
         }
      }
      var sql = "SELECT DISTINCT p.energy_plant_id, p.energy_plant_name, s.energy_source_name, p.power_output, p.p_square_feet, p.transmission, p.maintenance_cost, p.energy_price FROM energy_plant AS p "
       + "LEFT JOIN energy_plant_company AS pc ON p.energy_plant_id = pc.energy_plant_id "
       + "LEFT JOIN energy_source AS s ON p.energy_source_id = s.energy_source_id "
       + "WHERE pc.energy_plant_id REGEXP ? AND ((p.energy_source_id IS "+null_or_not+") OR (p.energy_source_id REGEXP ?))"
       +"AND (power_output>=? AND power_output<=?) AND (p_square_feet>=? AND p_square_feet<=?) "
       +"AND transmission IN (?, ?, ?) AND (maintenance_cost>=? AND maintenance_cost<=?) AND (energy_price>=? AND energy_price<=?) "
       +"AND energy_plant_name LIKE '%"+name_query+"%'";
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_plants = results;
            complete();
        });
    }

    /* Get all rows of energy_plant */
    function getEnergyPlant(res, mysql, context, id, complete){
        var sql = "SELECT energy_plant_id, energy_plant_name, energy_source_id, power_output, p_square_feet, transmission, maintenance_cost, energy_price FROM energy_plant WHERE energy_plant.energy_plant_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_plant = results[0];
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

    /* Get all rows of energy_source */
    function getEnergySources(res, mysql, context, complete){
        mysql.pool.query("SELECT energy_source_id, energy_source_name, renewable, energy_cost FROM energy_source", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_sources = results;
            complete();
        });
    }


    /* Display all rows in energy_plant.*/
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteEnergyPlant.js"];
        filters_name = req.query.search_string;
        filters_arr = [req.query.search_company, req.query.search_source, req.query.search_power_min, req.query.search_power_max, req.query.search_p_square_feet_min,
          req.query.search_p_square_feet_max, req.query.search_transmission, req.query.search_transmission, req.query.search_transmission, req.query.search_maintenance_min,
          req.query.search_maintenance_max, req.query.search_energy_price_min, req.query.search_energy_price_max];
        if (filters_name === undefined){//if un-initialized value when loading webpage
          var searched = 0;
        }
        else{
          var searched = 1;
        }
        var mysql = req.app.get('mysql');
        getEnergyPlants(res, mysql, context, searched, filters_name, filters_arr, complete);
        getEnergyCompanys(res, mysql, context, complete);
        getEnergySources(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('energy_plants', context);
            }

        }
    });

    /* Display one row in energy plant to update it */
    router.get('/:id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateEnergyPlant.js"];
        var mysql = req.app.get('mysql');
        getEnergyPlant(res, mysql, context, req.params.id, complete);
        getEnergyCompanys(res, mysql, context, complete);
        getEnergySources(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-energy_plant', context);
            }

        }
    });

    /* Add a new row to energy_plant */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO energy_plant (energy_plant_name, energy_source_id, power_output, p_square_feet, transmission, maintenance_cost, energy_price) VALUES (?,?,?,?,?,?,?)";
        var inserts = [req.body.energy_plant_name, req.body.energy_source_id, req.body.power_output, req.body.p_square_feet, req.body.transmission, req.body.maintenance_cost, req.body.energy_price];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
              sql = mysql.pool.query("INSERT INTO energy_plant_company (energy_company_id, energy_plant_id) VALUES (?,?)",[req.body.energy_company_id, results.insertId],function(error, results, fields){
                  if(error){
                      res.write(JSON.stringify(error));
                      res.end();
                  }else{
                      res.redirect('/energy_plants');
                  }
                  });
            }
        });
    });

    /* Update a row of energy_plant */
    router.put('/:id', function(req, res){
        var energy_id_insert = 0;
        if (req.body.energy_source_id === "empty"){
          energy_id_insert = null;
        }
        else{
          energy_id_insert = req.body.energy_source_id;
        }
        var mysql = req.app.get('mysql');
        var sql = "UPDATE energy_plant SET energy_plant_name=?, energy_source_id="+energy_id_insert+", power_output=?, p_square_feet=?, transmission=?, maintenance_cost=?, energy_price=? WHERE energy_plant_id=?; UPDATE energy_plant_company SET energy_company_id=? WHERE energy_plant_id=?";
        var inserts = [req.body.energy_plant_name, req.body.power_output, req.body.p_square_feet, req.body.transmission, req.body.maintenance_cost, req.body.energy_price, req.params.id, req.body.energy_company_id, req.params.id];
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

    /* Delete a row in energy_plant, returns a 202 if successful. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM energy_plant WHERE energy_plant_id = ?";
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
