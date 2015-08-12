define(['../BaseFormWidget','../../../../../vendors/lib/kendoui/js/kendo.maskedtextbox.js'], function (BaseFormWidget,maskedtextbox) {
    var xtype = "maskedtextbox";
    var MaskedtextboxWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $opts:{
                promptChar: "_",
                clearPromptChar:false,
                rules: {},
                value: "",
                mask: "",
                change:function(){
                    var vid = this.options.$vid;
                    var cmp = PageMgr.manager.components[vid];
                    cmp._valueChange(this.value());
                }
            }
        },
        maskedObj:null,
        render: function (opts) {
            var p = jQuery.extend({}, this.options, opts || {});
            this.parent(opts);
            p.$opts["$vid"] = this.options.$vid;
            this.getParentElement().kendoMaskedTextBox(p.$opts);
            this.maskedObj = this.getParentElement().data("kendoMaskedTextBox");
        },
        getValue:function(){
            var _value = "";
            if(this.maskedObj){
                _value = this.maskedObj.value();
            }
            return _value;
        },
        setValue: function (value, notFireFormValueChangeEvent) {
            if (typeOf(value) == 'string' || typeOf(value) == 'number') {
                this.maskedObj.value(value);
                this.setAttr("display", value);
                this.setAttr("valueChanged", true);
            } else if (typeOf(value) == 'object') {
                if (value['value'] != undefined) {
                    this.maskedObj.value(value['value']);
                    if (value['display']) {
                        this.setAttr("display", value['display']);
                    } else {
                        this.setAttr("display", value['value']);
                    }
                }
                this.setAttr("valueChanged", true);
            } else {
                window.console.log('set value error,unknown structure ...' + value);
            }
        },
        _valueChange: function (value) {
            this.setAttr("display", value);
            this.validate();//即时校验
        },
        _statusChange:function(value, oldValue, model){
            if(value !== oldValue){
                if(value === "readonly"){
                    this.maskedObj && this.maskedObj.readonly(true);
                }else if(value === "edit"){
                    this.maskedObj && this.maskedObj.readonly(false);
                }else if(value === "disabled"){
                    this.maskedObj && this.maskedObj.enable(false);
                }
            }
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement());
            return input;
        },
        focus: function () {
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
        validate: function () {
            //var valRes = PageMgr.validation.validateValue(this.getValue(),this.getAttr("validationRules"));
            var validateTool = PageMgr.validation;//后续由系统统一创建，只需调用即可

            var valRes = null;
            if (this.getAttr("$required")) {//先判断是否必填
                valRes = validateTool.checkRequired(this.getValue());
            }
            if ((!valRes || valRes.result) && this.getAttr("$validationRules")) {//再判断校验规则
                valRes = validateTool.validateValue(this.getValue(), this.getAttr("$validationRules"));
            }
            if (valRes && !valRes.result) {//将错误信息赋值给属性
                this.setAttr("$errorMessage", valRes.errorMsg);
            } else {//清空错误信息
                this.setAttr("$errorMessage", "");
            }
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.attr("ms-attr-readonly", "status=='readonly'")
                    .attr("ms-attr-disabled", "status=='disabled'").attr("ms-class", "form-text:status=='readonly'");
            }
        }
    });
    MaskedtextboxWidget.xtype = xtype;
    return MaskedtextboxWidget;
});