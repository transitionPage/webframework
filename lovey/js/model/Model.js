/**
 * Created by JKYANG on 15/5/18.
 */
/**
 *
 * meta :{
 *   mainAlias:'',
 *   refAlias:''
 *   children
 *
 * }
 *
 *
 *
 */
define([], function () {

    var xtype = "model";
    var Model = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $xtype: xtype,
            status: "default",
            name: "", //中文名称
            extendModelId: "", //继承至模型
            inputParams: {}, //输入参数 eg:[{name:'', value:'', scope:'request|session'},{}]
            outputParams: {}, //输出参数 eg:{a:function(){}, b:1}
            dataSource: {}, // dataSet, dataValue,可能有多个
            services: {}, //后台服务, id:url
            dataBinders: {}, //{$id:'',dsId:'', fieldId:''}
            layout: {},// eg: {$id:'page', xtype:'page', items: [{$id:'row1', xtype:'row'}]}
            _cache: {}//缓存
        },

        initialize: function (opts) {
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            this._wrapCache(this.options.layout);
        },

        _wrapCache: function (obj) {
            this.options._cache[obj.$id] = obj;
            if (obj.items) {
                for (var i = 0; i < obj.items.length; i++) {
                    this._wrapCache(obj.items[i]);
                }
            }
        },


        getId: function () {
            return this.options.$id;
        },

        getModel: function (id) {
            if (id && this.options._cache[id]) {
                return this.options._cache[id];
            }
            return null;
        }

    });
    Model.xtype = xtype;
    return Model;
});