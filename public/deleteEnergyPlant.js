function deleteEnergyPlant(id){
    $.ajax({
        url: '/energy_plants/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};