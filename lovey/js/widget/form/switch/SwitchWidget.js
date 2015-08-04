define(['../BaseFormWidget','text!./SwitchWidget.html','css!./SwitchWidget.css'], function (BaseFormWidget,template) {
    var xtype = "switch";
    var SwitchWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            checked:false,
            $checkValue:1,// 选中的值，默认为1,
            $unCheckValue:0,// 未选中的值，默认为0
            $checkDisplay:"是",// 选中的显示（readonly时显示），默认为‘是’,
            $unCheckDisplay:"否",//选中的显示（readonly时显示），默认为‘否’,
            $valueField:"value",//调用setValue方法，value为对象时，值的key
            $textField:"display",//调用setValue方法，value为对象时，显示值的key
            $valueChangeFunc:null,
            $opts:{
                color: '#1AB394'
            }
        },
        switchObj:null,
        render:function(){
            this.parent();
            if(this.options.status != "readonly"){
                this._createSwitch();
            }else{
                if(this.options.value!=undefined) {
                    this.setAttr("display", (this.options.value === this.options.$checkValue)?this.options.$checkDisplay:this.options.$unCheckDisplay);
                }
            }
        },
        destroy:function(){
            this.switchObj && this.switchObj.destroy();
            this.parent();
        },
        show:function(){
            this.switchObj && this.switchObj.show();
        },
        hide:function(){
            this.switchObj && this.switchObj.hide();
        },
        getValue:function(){
            if(this.switchObj){
                return this.switchObj.isChecked()?this.options.$checkValue:this.options.$unCheckValue;
            }else{
                return this.options.value;
            }
        },
        getDisplay:function(){
            if(this.switchObj){
                return this.switchObj.isChecked()?this.options.$checkDisplay:this.options.$unCheckDisplay;
            }else{
                return (this.options.value === this.options.$checkValue)?this.options.$checkDisplay:this.options.$unCheckDisplay;
            }
        },
        setValue:function(value){
            if(value!=undefined){
                var val = null;
                if(typeof(value)=="object"){
                    val = value[this.options.$valueField];
                    this.options.value = value[this.options.$valueField];
                    this.options.display = value[this.options.$textField];
                }else{
                    val = value;
                }
                var checked = false;
                if(val==this.options.$checkValue){
                    checked = true;
                }
                if(this.switchObj && checked!=this.switchObj.isChecked()){
                    this.switchObj.setPosition(true);
                    this.setAttr("checked",checked,true);
                }
            }
        },
        switchStatus: function (status) {
            this.parent(status);
            if((status === "edit" || status === "disabled") && !this.switchObj){
                this._createSwitch();
            }
            this.setAttr("value",this.getValue());
            this.setAttr("display",this.getDisplay());
            if(status === 'edit'){
                if(this.switchObj){
                    this.switchObj.destroy();
                    this.switchObj.enable();
                }
            }else if(status === 'disabled'){
                this.switchObj && this.switchObj.disable();
            }
        },
        isChecked:function(){
            return this.switchObj && this.switchObj.isChecked();
        },
        check:function(){
            if(this.switchObj && !this.switchObj.isChecked()){
                this.switchObj.setPosition(true);
                this.setAttr("checked",true,true);
            }
        },
        _createSwitch:function(){
            if(this.switchObj) return;
            var inputObj = this.getParentElement().find(".e-switch")[0];
            if(inputObj){
                var that = this;
                if(this.options.status === "disabled"){
                    this.options.$opts["disabled"] = true;
                }
                var checked = false;
                if(this.options.value!=undefined && this.options.value==this.options.$checkValue){
                    this.setAttr("display",this.options.$checkDisplay);
                    //this.switchObj.setPosition(true);
                    checked = true;
                }else{
                    if(this.getAttr("checked")){
                        //this.switchObj.setPosition(true);
                        checked = true;
                    }else{
                        this.setAttr("display",this.options.$unCheckDisplay);
                    }
                }
                if(checked) {
                    //inputObj.setAttribute("checked", "checked");
                }
                this.switchObj = new Switchery(inputObj,this.options.$opts);
                var switcheryDom = this.getParentElement().find(".switchery");
                if(switcheryDom && switcheryDom[0] && that.options.$valueChangeFunc){
                    switcheryDom[0].onclick = function(){
                        that.setAttr("value",that.getValue());
                        that.setAttr("display",that.getDisplay());
                        that.options.$valueChangeFunc(that,that.switchObj);
                    }
                }
                this.setAttr("value",this.getValue());
            }
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.append(template);
            }
        }
    });
    SwitchWidget.xtype = xtype;
    return SwitchWidget;
});