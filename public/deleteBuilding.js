function deleteBuilding(id){
    $.ajax({
        url: '/buildings/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
