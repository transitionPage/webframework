/**
 * Created by hhxu on 15/5/12.
 */
define(['../Base','text!./DialogWidget.html', 'css!./DialogWidget.css'], function (Base, template, art, artIframe) {
    var xtype = "dialog";
    var DialogWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,

            title:'提示',
            url:'',
            content:'',
            width:'',
            height:'',
            icon: null,
            skin: null,
            dbClickHide: true,
            showCloseIcon: true,
            left: '50%',				// X轴坐标
            top: '38.2%',				// Y轴坐标
            button:[],
            params:"",
            cancel: null,
            opacity: .5
        },
        dialogObj:null,
        render: function () {
            this.fireEvent("beforeRender", [this.vmodel]);
            var $this = this;
            var options = $this.options;
            var paramsstr = options.params;  //TODO 可能处理传入的参数
            var url = options.url+paramsstr;

            var dialogParams = {
                lock: true,
                title: options.title,
                url: options.url,
                button: options.button,
                icon: options.icon,
                skin: options.skin,
                opacity: options.opacity,
                dbClickHide: options.dbClickHide,
                showCloseIcon: options.showCloseIcon,
                cancel: options.cancel,
                left: options.left,				// X轴坐标
                top: options.top,				// Y轴坐标
                width: options.width!=""?options.width:undefined,
                height: options.height!=""?options.height:undefined
            };

            if(options.url){
                this.dialogObj = artDialog.open(url, dialogParams);
            }else{
                dialogParams.content = options.content;
                this.dialogObj = artDialog(dialogParams);
            }


            $this.fireEvent("afterRender", [this.vmodel]);
            if (this["_afterRender"]) {
                this["_afterRender"](this.vmodel);
            }
            return this;
        },
        removeButton: function(btnName) {
            if(btnName) {
                var listenerObj = this.dialogObj._listeners;
                var btn = listenerObj[btnName];
                if(btn) {
                    btn.elem.remove();
                    delete this.dialogObj._listeners[btnName];
                }
            }
        },
        addButton: function() {
            this.dialogObj.button.apply(this.dialogObj,arguments) ;
        },
        close: function() {
            this.dialogObj.close();
        },
        show: function() {
            this.dialogObj.show();
        },
        hide: function() {
            this.dialogObj.hide();
        },
        lock: function() {
            this.dialogObj.lock();
        },
        unlock: function() {
            this.dialogObj.unlock();
        },
        title: function(value) {
            this.dialogObj.title(value);
        },
        content: function(value) {
            this.dialogObj.content(value);
        },

        getTemplate: function(){
            return template;
        }
    });
    DialogWidget.xtype = xtype;
    return DialogWidget;
});