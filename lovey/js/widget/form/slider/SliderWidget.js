define(['../BaseFormWidget', 'text!./SliderWidget.html', 'css!./SliderWidget.css'], function (BaseFormWidget,template) {
    var xtype = "slider";
    var SliderWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $multi: false, //true时，有两个slider
            $opts:{
                min: 0,
                max: 10,
                smallStep: 1,
                largeStep: 5,
                orientation: "horizontal",
                increaseButtonTitle: "Increase",
                decreaseButtonTitle: "Decrease",
                dragHandleTitle: "drag", //$multi=false时，设置slider滑块标题
                leftDragHandleTitle: "drag", //$multi=true时，设置左边的slider滑块标题
                rightDragHandleTitle: "drag",//$multi=true时，设置右边的slider滑块标题
                tooltip: { format: "{0:#,#.##}" },
                tickPlacement: "both",
                showButtons: true,
                showTick:true//是否显示刻度线
            }
        },
        sliderObj:null,
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find(".sliderWidget");
            return input;
        },
        render: function (opts) {
            this.parent(opts);
            if(this.options.status != "readonly"){
                this._createSlider();
            }
        },
        getValue:function(){
            if(this.sliderObj){
                return this.sliderObj.value();
            }else{
                return this.getAttr('value');
            }
        },
        setValue:function(value){
            this.setAttr("value", value);
            this.setAttr("display", value);
            this.sliderObj && this.sliderObj.value(value);
            this.setAttr("$valueChanged", true);
        },
        _statusChange:function(value, oldValue, model){
            if(value !== oldValue){
                if((value === "edit" || value === "disabled") && !this.sliderObj){
                    this._createSlider();
                }
                if(value === "edit"){
                    this.sliderObj.enable();
                }else if(value === "disabled"){
                    this.sliderObj.disable();
                }
            }
        },
        _createSlider:function(){
            if(this.sliderObj) return;
            if(this.options.$multi){
                this.sliderObj = this._getInputElement().kendoRangeSlider(this.options.$opts).data("kendoRangeSlider");
            }else{
                this.sliderObj = this._getInputElement().kendoSlider(this.options.$opts).data("kendoSlider");
            }
            if(!this.options.$opts.showTick){
                this.sliderObj.wrapper.find(".k-tick").css({"background":"none"});
            }
            if(this.options.value){
                this.sliderObj.value(this.options.$multi?this.options.value.split(","):this.options.value);
            }
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.append(template);
            }
        }
    });
    SliderWidget.xtype = xtype;
    return SliderWidget;
});