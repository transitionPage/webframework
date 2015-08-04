/**
 * Created by qianqianyi on 15/4/23.
 */
define(['../BaseFormWidget', 'css!./TextareaWidget.css'], function (BaseFormWidget) {
    var xtype = "textarea";
    var TextareaWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $rows:3,//显示行数，默认3;列数不设置，采取自适应的方式
            $placeholder:null
        },
        _valueChange: function (value) {
            this.setAttr("display", value);
            this.validate();//即时校验
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find("textarea.form-widget-to-focus-class");
            return input;
        },
        focus: function () {
            //console to invoke this method is not ok...
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.focus();
            });
        },
        blur: function () {
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.blur();
            });
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.attr("ms-css-height", "$height").attr("ms-attr-rows","$rows").attr("ms-duplex", "value").attr("ms-attr-placeholder", "$placeholder")
                    .attr("ms-attr-readonly", "status=='readonly'").attr("ms-attr-disabled", "status=='disabled'").attr("ms-class", "form-text:status=='readonly'");
            }
        }
    });
    TextareaWidget.xtype = xtype;
    return TextareaWidget;
});