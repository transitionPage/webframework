define(['../BaseFormWidget','text!./RicheditorWidget.html','css!./RicheditorWidget.css'], function (BaseFormWidget,template) {
    var xtype = "richeditor";
    var RicheditorWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $show:true,
            $simple:false,
            $contextPath:"",
            $opts:{
                minWidth : 200,//最小宽度
                minHeight : 100,//最小高度
                width:"100%",
                height:"100%"
            }
        },
        editorObj:null,
        _afterRender:function(){
            if(!window.contextPath){
                window.contextPath = this.options.$contextPath;
            }
            if(this.options.status != "readonly"){
                this._createRicheditor();
            }
        },
        destroy:function(){
            this.editorObj.destroy();
            this.parent();
        },
        show:function(){
            this.editorObj.show();
        },
        hide:function(){
            this.editorObj.hide();
        },
        getValue:function(){
            if(this.editorObj && this.editorObj.html){
                return this.editorObj.html();
            }
            return "";
        },
        setValue:function(htmlCon){
            var value = null;
            if(typeof(htmlCon)=="object"){
                value = htmlCon.value;
            }else{
                value = htmlCon;
            }
            if(this.editorObj && this.editorObj.html && value){
                this.editorObj.html(htmlCon);
            }
        },
        _createRicheditor:function(){
            var that = this;
            if(that.options.$simple){
                that.options.$opts.items = [
                    'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
                    'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
                    'insertunorderedlist', '|', 'emoticons', 'image', 'link'];
                //关键  同步KindEditor的值到textarea文本框   解决了多个editor的取值问题
                that.options.$opts.afterBlur = function(){
                    this.sync();
                };
            }
            //"#"+this.getParentElement().attr("id")
            that.editorObj = KindEditor.create("#tex_"+that.getId(),that.options.$opts);
            if(that.options.value){
                that.editorObj.html(that.options.value);
            }
            if(that.options.status == "disabled"){
                that.editorObj.readonly(true);
            }
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.append(template);
            }
        },
        _statusChange:function(value, oldValue, model){
            if(value !== oldValue){
                if((value === "edit" || value === "disabled") && !this.editorObj){
                    this._createRicheditor();
                }
                if(value === "edit"){
                    this.editorObj.readonly(false);
                }else if(value === "disabled"){
                    this.editorObj.readonly(true);
                }
            }
        }
    });
    RicheditorWidget.xtype = xtype;
    return RicheditorWidget;
});