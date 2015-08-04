define(['../BaseFormWidget','css!../slider/SliderWidget.css','css!./TooltipWidget.css'], function (BaseFormWidget) {
    var xtype = "tooltip";
    var TooltipWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $target:"", //绑定tip的对象id
            $parentDom:null,
            $className:"bluetip", //组件提供bluetip,whitetip
            content:"",
            $opts:{
                showAfter: 100,
                position: "right",
                showOn: "mouseenter",//直接传给kendoTooltip组件，tips显示的交互事件
                autoHide: true,
                show:null
            }
        },
        tipObj:{},
        _getInputElement: function () {
            if(this.options.$target && this.options.$target != ""){
                var input = jQuery("#"+this.options.$target);
                return input;
            }else{
                return null;
            }
        },
        render: function (opts) {
            this.options.$opts["content"] = this.options.content;
            if(this.options.$className && this.options.$target && this.options.$target != ""){
                this.options.$opts["$target"] = this.options.$target;
                this.options.$opts["$className"] = this.options.$className;
                this.options.$opts.show = function(){
                    jQuery("#"+this.options.$target+"_tt_active").parent().addClass(this.options.$className);
                };
            }
            var p = jQuery.extend({}, this.options, opts || {});
            if(this._getInputElement()) {
                this._getInputElement().kendoTooltip(p.$opts);
                this.tipObj = this._getInputElement().data("kendoTooltip");
            }else if(this.options.$parentDom){
                $(this.options.$parentDom).kendoTooltip(p.$opts);
                this.tipObj = $(this.options.$parentDom).data("kendoTooltip");
            }
        },
        destroy:function(){
            this.tipObj.destroy();
            this.parent();
        },
        show:function(){
            this.tipObj.show();
        },
        hide:function(){
            this.tipObj.hide();
        },
        _contentChange:function(content,oldContent) {
            this.tipObj.options.content = content;
            this.tipObj.refresh();
            this.show();
        }

    });
    TooltipWidget.xtype = xtype;
    return TooltipWidget;
});