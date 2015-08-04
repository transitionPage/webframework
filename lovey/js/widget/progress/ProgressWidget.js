define(['../Base', '../../../lib/pace/pace','text!./ProgressWidget.html', 'css!./ProgressWidget.css'], function (Base, pace, template) {
    var xtype = "progress";
    var ProgressWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            $opts:{
                label:"当前已完成："
            }
        },
        progressObj:null,
        render: function (opts) {
            var p = jQuery.extend({}, this.options, opts || {});
            if (this.options.$parentId != null) {
                p.$opts["target"] = "#"+this.options.$parentId;
            }
            this.fireEvent("beforeRender", [this.vmodel]);
            this.progressObj = pace.start(p.$opts);
            this.fireEvent("afterRender", [this.vmodel]);
            if (this["_afterRender"]) {
                this["_afterRender"](this.vmodel);
            }
            return this;
        },
        getTemplate: function(){
            return template;
        }
    });
    ProgressWidget.xtype = xtype;
    return ProgressWidget;
});