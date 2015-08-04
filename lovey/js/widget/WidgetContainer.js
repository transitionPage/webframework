/**
 * Created by JKYANG on 15/5/20.
 * 做数据的绑定动作
 */
define(['./Base'], function (Base) {
    var xtype = "widgetContainer";
    var WidgetContainer = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $xtype: xtype,
            dataSources: {}, // dataSet, dataValue,可能有多个,{ds1:{type:'', options:{}}}
            dataSourcesIds:[],
            dataBinders: {} //{db1:{componentId:'',dsId:'', fieldId:''}}
        },

        mix$: function (opts) {
            var result = {};
            for (var o in opts) {
                if (o.slice(0, 1) != '$') {
                    if (this.options["$" + o] === undefined) {
                        result[o] = opts[o];
                    } else {
                        result["$" + o] = opts[o];
                    }
                } else {
                    result[o] = opts[o];
                }
            }
            return result;
        },

        getId: function () {
            return this.options.$id;
        },

        initialize: function (opts) {
            opts = this.mix$(opts);
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            //1. createDataSources
            //2. createDataBinders
            this.DS = {};
            this.DB = {};
            for (var d in this.options.dataSources) {
                var ds = this.options.dataSources[d];
                this.addDataSource(d, ds);
            }
            for(var i=0; i<this.options.dataSourcesIds.length; i++){
                var id = this.options.dataSourcesIds[i];
                this.DS[id] = Page.manager.components[id];
            }
            /*
            for (var d in this.options.dataBinders) {
                var ds = this.options.dataBinders[d];
                this.addDataBinder(d, ds);
            }
            */
        },

        /**
         * @param id
         * @param ds {ds1:{type:'', options:{}}}
         */
        addDataSource: function (id, ds) {
            var dataSource = Page.create(ds['type'], Object.merge(ds['options'], {$id: id}));
            this.DS[id] = dataSource;
        },

        /**
         * @param id
         * @param ds
         */
        addDataBinder: function (id, ds) {
            var dataBind = Page.create('dataBinder', ds);
            this.DB[id] = dataBind;
        },

        getDataSource: function (id) {
            return this.DS[id];
        },
        getDataSources: function () {
            return this.DS;
        },

        destroy: function () {
            //删除DS，DB
            Object.each(this.DB, function (value, key) {
                value.destory();
            });
            Object.each(this.DS, function (value, key) {
                value.destory();
            });
        }

    });
    WidgetContainer.xtype = xtype;
    return WidgetContainer;
});