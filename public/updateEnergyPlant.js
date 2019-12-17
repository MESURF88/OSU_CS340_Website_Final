function updateEnergyPlant(id){
    $.ajax({
        url: '/energy_plants/' + id,
        type: 'PUT',
        data: $('#update-energy_plant').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};