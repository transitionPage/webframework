define(["./Utils"],function(Utils) {
    var xtype = "model";
    var Model = new Class({
        Implements: [Options],
        options:{
            xtype: xtype
        },
        initialize:function(opts){

        }

    });

    Model.xtype = xtype;
    return Model;
});