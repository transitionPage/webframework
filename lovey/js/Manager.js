define([], function () {
    var xtype = "manager";
    var fullName = "Manager";
    var Manager = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            xtype: xtype,
            fullName: fullName
        },
        initialize: function (opts) {
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = String.uniqueID();
            }
            this.components = {};
        },
        getId: function () {
            return this.options.$id;
        },
        add: function (key, value) {
            this.components[key] = value;
        },
        remove:function(id){
            delete this.components[id];
        },
        get: function(id){
            return this.components[id];
        }
    });
    Manager.xtype = xtype;
    return Manager;
});
