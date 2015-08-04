/**
 * Created by hhxu on 15/6/28.
 *
 */
define(['../Base','text!./CustomProgressWidget.html', 'css!./CustomProgressWidget.css'
    ,'../../../lib/kendoui/js/kendo.progressbar'], function (Base,template,cssObj,progress) {
    var xtype = "customProgress";
    var CustomProgressWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            //======kendo属性======
            value: 0,//默认
            type: "percent",//percent,chunk、value
            reverse: false,//反向
            enable: true,//可用
            showStatus: true,//显示状态,只在large的情形会显示
            showDetail:true,
            detailTemplate:null,
            animation: true,//动画
            chunkCount: 100,//type为chunk时
            min: 0,//type为chunk时
            max: 100,//type为chunk时
            orientation: "horizontal",//方向 horizontal，vertical
            change:null,//进度改变事件，参数e
            complete: null, //完成回调方法
            //======扩展属性======
            isVertical:false,//orientation的便捷设置
            sceneType:"large",//large:20px;middle:10px;small:5px;
            themeType:"green",//green、blue、stripe（条纹）、
            barHeight:"20",//bar高度，由场景确定
            verticalBarHeight:"100"//vertical时高度
        },
        progressObj:null,
        initialize:function(opts){
            this.parent(opts);
            if(this.options.isVertical){
                this.options.orientation = "vertical";
            }
            if(this.options.sceneType){
                if(this.options.sceneType=='small'){
                    this.setAttr("barHeight",5);
                    this.setAttr("showStatus",false);
                    this.options.showStatus = false;
                }else if(this.options.sceneType=='middle'){
                    this.setAttr("barHeight",10);
                    this.setAttr("showStatus",false);
                    this.options.showStatus = false;
                }else{
                    this.options.barHeight = "20";
                }
            }
        },
        render: function (opts) {
            this.parent(opts);
            var p = jQuery.extend({}, this.options, opts || {});
            if(this._getInputElement()) {
                this._getInputElement().kendoProgressBar(p);
                this.progressObj = this._getInputElement().data("kendoProgressBar");
            }else if(this._getParentDom()){
                this._getParentDom().kendoProgressBar(p);
                this.progressObj = this._getParentDom().data("kendoProgressBar");
            }
            //样式
            if(this.options.sceneType){
                if(this.options.sceneType=='small'){
                    this.progressObj.progressWrapper.css({
                        "background-color": "#1ab394",
                        "top":"0px",
                        "border-width": "0px"
                    });
                }else if(this.options.sceneType=='middle'){
                    this.progressObj.progressWrapper.css({
                        "background-color": "#1ab394",
                        "top":"0px",
                        "border-width": "0px"
                    });
                }else{
                    if(this.options.themeType=="stripe"){
                        this.progressObj.progressWrapper.css({
                            "background-color": "#1ab394",
                            "background-image": "-webkit-gradient(linear, 0 100%, 100% 0, color-stop(0.25, rgba(255, 255, 255, 0.15)), color-stop(0.25, transparent), color-stop(0.5, transparent), color-stop(0.5, rgba(255, 255, 255, 0.15)), color-stop(0.75, rgba(255, 255, 255, 0.15)), color-stop(0.75, transparent), to(transparent))",
                            "background-image": "-webkit-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                            "background-image": "-moz-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                            "background-image": "-o-linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                            "background-image": "linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)",
                            "-webkit-background-size": "40px 40px",
                            "-moz-background-size": "40px 40px",
                            "-o-background-size": "40px 40px",
                            "background-size": "40px 40px",
                            "top":"0px",
                            "border-width": "0px"
                        });
                    }else if(this.options.themeType=="blue"){
                        this.progressObj.progressWrapper.css({
                            "background-color": "#1c84c6",
                            "top":"0px",
                            "border-width": "0px"
                        });
                    }else{
                        this.progressObj.progressWrapper.css({
                            "background-color": "#1ab394",
                            "top":"0px",
                            "border-width": "0px"
                        });
                    }
                }
            }
            if(this.options.showStatus){
                this.progressObj.progressStatus.css({
                    "line-height":"normal"
                });
            }
        },
        setValue:function(value){
            this.progressObj.value(value);
        },
        getValue:function(){
            return this.progressObj.value();
        },
        setIndeterminate:function(){
            return this.progressObj.value(false);
        },
        disable:function(){
            return this.progressObj.enable(false);
        },
        enable:function(){
            return this.progressObj.enable(true);
        },
        destroy: function() {
            this.progressObj.destroy();
            this.parent();
        },
        setProgressWrapperCss:function(cssDetail){//{"background-image": "none","border-image": "none"}格式
            if(cssDetail){
                this.progressObj.progressWrapper.css(cssDetail);
            }
        },
        setProgressStatusText:function(text){
            this.progressObj.progressStatus.text(text);
        },
        getTemplate: function(){
            return template;
        },
        _getInputElement: function () {
            var inputObj = null;
            if(this.getParentElement()&&this.getParentElement().find(".e-progress")&&this.getParentElement().find(".e-progress")){
                inputObj = this.getParentElement().find(".e-progress");
            }
            return inputObj;
        },
        _getParentDom:function(){
            return this.getParentElement()||this.getElement();
        }
    });
    CustomProgressWidget.xtype = xtype;
    return CustomProgressWidget;
})