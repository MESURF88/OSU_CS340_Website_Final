function deleteEnergySource(id){
    $.ajax({
        url: '/energy_sources/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};