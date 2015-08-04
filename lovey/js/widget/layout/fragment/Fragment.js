/**
 * Created by JKYANG on 15/5/20.
 * 做数据的绑定动作
 */
define(['../BaseLayout', 'text!./Fragment.html'], function (BaseLayout, tpl) {
    var xtype = "fragment";
    var Fragment = new Class({
        Extends: BaseLayout,
        options: {
            $xtype: xtype,
            status: "default",
            dataSources: {}, // dataSet, dataValue,可能有多个,{ds1:{type:'', options:{}}}
            dataSourcesIds: [],
            dataBinders: {} //{db1:{componentId:'',dsId:'', fieldId:''}}
        },

        getTemplate: function () {
            return tpl;
        },

        getElementToAppend: function () {
            return this.$element;
        },

        _beforLayoutRender: function () {
            var ds = this.options.dataSources;
            var db = this.options.dataBinders;
            var dsId = this.options.dataSourcesIds;
            this._widgetContainer = Page.create("widgetContainer", {
                dataSources: ds,
                dataBinders: db,
                dataSourcesIds:dsId
            });
        },

        /**
         * @param id
         * @param ds {ds1:{type:'', options:{}}}
         */
        addDataSource: function (id, ds) {
            this._widgetContainer.addDataBinder(id, ds);
        },

        /**
         * @param id
         * @param ds
         */
        addDataBinder: function (id, ds) {
            this._widgetContainer.addDataBinder(id, ds);
        },

        getDataSource: function (id) {
            return this._widgetContainer.getDataSource(id);
        },

        getDataSources: function () {
            return this._widgetContainer.getDataSources();
        },


        destroy: function () {
            this.parent();
            this._widgetContainer.destroy();
        }

    });
    Fragment.xtype = xtype;
    return Fragment;
});