function updateEnergyCompany(id){
    $.ajax({
        url: '/energy_companys/' + id,
        type: 'PUT',
        data: $('#update-energy_company').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};