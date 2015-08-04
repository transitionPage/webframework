define(['../BaseFormWidget','text!./SwitchWidget.html','css!./SwitchWidget.css'], function (BaseFormWidget,template) {
    var xtype = "switch";//
    var TooltipWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            show:true,
            color: '#1AB394',
            checked:false,
            disabled: false
        },
        switchObj:{},
        render: function (opts) {
            this.parent();
            var inputObj = this.getParentElement().find(".e-switch")[0];
            if(inputObj){
                this.switchObj = new Switchery(inputObj,this.options);
                if(this.getAttr("checked")){
                    this.switchObj.setPosition(true);
                }
            }
        },
        getTemplate: function(){
            return template;
        },
        destroy:function(){
            this.switchObj.destroy()
            this.parent();
        },
        show:function(){
            this.switchObj.show();
        },
        hide:function(){
            this.switchObj.hide();
        },
        getValue:function(){
            return this.switchObj.isChecked();
        },
        setValue:function(checked){
            if(!checked){
                checked = false;
            }
            if(checked!=this.getAttr("checked")){
                this.switchObj.setPosition(true);
                this.setAttr("checked",checked,true);
            }
        }

    });
    TooltipWidget.xtype = xtype;
    return TooltipWidget;
});