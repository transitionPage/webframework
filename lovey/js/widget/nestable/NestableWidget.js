/**
 * Created by hhxu on 15/5/12.
 */
define(['../Base', 'text!./NestableWidget.html', 'css!./NestableWidget.css'], function (Base, template) {
    var xtype = "eNestable";
    var DataTableWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype
            //其他nestable属性
        },
        nestableObj:null,
        render: function () {
            this.fireEvent("beforeRender", [this.vmodel]);
            this.nestableObj = this.getParentElement().nestable(this.options);//调用nestable
            this.fireEvent("afterRender", [this.vmodel]);
            if (this["_afterRender"]) {
                this["_afterRender"](this.vmodel);
            }
            return this;
        },
        getTemplate: function(){
            return template;
        },
        getData:function(){
            return this.getParentElement().nestable("serialize");
        }
    });
    DataTableWidget.xtype = xtype;
    return DataTableWidget;
});