module.exports = function(){
    var express = require('express');
    var router = express.Router();


    /* Filter/search through rows in  energy_source */
    function getEnergySources(res, mysql, context, searched, filters_name, filters_arr, complete){
      if (searched === 0){
        var default_search ="";
        name_query = default_search.replace(";","");
        var inserts = ['renewable','alternative','hydrocarbon', 0, Math.pow(2,127)];
      }
      else{
        name_query = filters_name.replace(";","");//protect against stopping query
         var inserts;
         inserts = filters_arr;
         if (filters_arr[0] === "-"){
           var inserts = ['renewable','alternative','hydrocarbon', inserts[3], inserts[4]];
         }
      }
      var sql = "SELECT energy_source_id, energy_source_name, renewable, energy_cost FROM energy_source WHERE energy_source_name LIKE '%"+name_query+"%' AND renewable IN (?, ?, ?) AND (energy_cost>=? AND energy_cost<=?)";

        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_sources = results;
            complete();
        });
    }

    /* Get all rows in energy_source */
    function getEnergySource(res, mysql, context, id, complete){
        var sql = "SELECT energy_source_id, energy_source_name, renewable, energy_cost FROM energy_source WHERE energy_source.energy_source_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.energy_source = results[0];
            complete();
        });
    }


    /* Display all rows in energy_source. */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteEnergySource.js"];
        filters_name = req.query.search_string;
        filters_arr = [req.query.search_renewable, req.query.search_renewable, req.query.search_renewable, req.query.search_energy_cost_min, req.query.search_energy_cost_max];
        if (filters_name === undefined){//if un-initialized value when loading webpage
          var searched = 0;
        }
        else{
          var searched = 1;
        }
        var mysql = req.app.get('mysql');
        getEnergySources(res, mysql, context, searched, filters_name, filters_arr, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('energy_sources', context);
            }

        }
    });

    /* Display one row in energy source to update it */
    router.get('/:id', function(req, res){
		    callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateEnergySource.js"];
        var mysql = req.app.get('mysql');
        getEnergySource(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-energy_source', context);
            }

        }
    });

    /* Add a new row to energy_source */
    router.post('/', function(req, res){
		    var mysql = req.app.get('mysql');
        var sql = "INSERT INTO energy_source (energy_source_name, renewable, energy_cost) VALUES (?,?,?)";
        var inserts = [req.body.energy_source_name, req.body.renewable, req.body.energy_cost];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/energy_sources');
            }
        });
    });

    /* Update a row energy_source */
    router.put('/:id', function(req, res){
		    var mysql = req.app.get('mysql');
        var sql = "UPDATE energy_source SET energy_source_name=?, renewable=?, energy_cost=? WHERE energy_source_id=?";
        var inserts = [req.body.energy_source_name, req.body.renewable, req.body.energy_cost, req.params.id];
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

    /* Delete a row in energy_source, returns a 202 if successful. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM energy_source WHERE energy_source_id = ?";
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
