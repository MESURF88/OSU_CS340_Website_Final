function updateEnergySource(id){
    $.ajax({
        url: '/energy_sources/' + id,
        type: 'PUT',
        data: $('#update-energy_source').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};