function deleteEnergyCompany(id){
    $.ajax({
        url: '/energy_companys/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};