define(["./Manager","./Validation","./Utils"],function(Manager,Validation,Utils) {
    var Page = new Class({
        Implements: [Events, Options],
        options:{
            components:[]
        },
        initialize:function(opts){
            this.classMap = {};
            this.options.components = opts;
            var that = this;
            Array.each(this.options.components, function (c, index) {
                if(c.xtype) {
                    that.add(c.xtype, c);
                }
            });
        },
        add:function(xtype, clazz){
            this.classMap[xtype] = clazz;
        },
        getAll: function () {
            return this.classMap;
        },
        create: function (xtype, config) {
            if (this.classMap[xtype] === undefined) {
                return;
            }
            var instance = new this.classMap[xtype](config);
            var id = instance.getId();
            PageMgr.manager.add(id, instance);
            return instance;
        },
        getCmpObj: function(vid) {
            return PageMgr.manager.get(vid);
        }
    });
    if (window["PageMgr"] == undefined) {
        Page.manager = new Manager();
        Page.validation = new Validation({onlyError: true});
        Page.utils = new Utils();
        window["PageMgr"] = Page;
    }
    return Page;
});