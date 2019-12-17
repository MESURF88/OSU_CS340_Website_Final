function updateBuilding(id){
    $.ajax({
        url: '/buildings/' + id,
        type: 'PUT',
        data: $('#update-building').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
