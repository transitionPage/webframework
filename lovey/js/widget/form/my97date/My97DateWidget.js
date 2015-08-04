define(['../BaseFormWidget'], function (BaseFormWidget) {
    var xtype = "datepicker";
    var My97DateWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            showIcon:true,
            $opts:{
                doubleCalendar: false,
                dateFmt:'yyyy-MM-dd',
                firstDayOfWeek:1,
                autoUpdateOnChanged:null,
                minDate:"1900-01-01 00:00:00",
                maxDate:"2099-12-31 23:59:59",
                startDate:"",
                alwaysUseStartDate:false,
                isShowClear:true,
                isShowToday:true,
                isShowOK:true,
                readOnly:false,
                errDealMode:0,
                qsEnabled:true,
                autoShowQS:false
            },
            showPanel: function(vid) {
                var vm = vid ? avalon.vmodels[vid] : this;
                var opt = Object.merge({}, vm.$opts);
                opt.el = "datePicker_"+vid;
                if(vm && (vm["status"] === "readonly" || vm["status"] === "disabled")){
                    return;
                }
                WdatePicker(opt);
            }
        },
        initialize: function (opts) {
            var $opts = {};
            var formOpt = PageMgr.create("baseFormWidget", {}).options;
            for(var key in opts) {
                if(!(key in formOpt) && key!="$id" && !this._startsWith(key,"on") && key!="showIcon") {
                    $opts[key] = opts[key];
                    if("formatDate" == key) {
                        $opts["dateFmt"] = opts[key];
                    }
                    delete opts[key];
                }
            }
            var that = this;
            $opts["onpicked"] = function(dp){
                that._getInputElement().blur();
            };
            opts.$opts = $opts;
            this.parent(opts);
        },
        render: function(parent) {
            this.parent(parent);

            var that = this;
            this._getInputElement().bind("focus",function(){
                WdatePicker(that.options.$opts);
            });
        },
        _valueChange: function (value) {
            this.setAttr("display", value);
            this.validate();//即时校验
        },
        getTemplate: function () {
            //return template;
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find("input.form-widget-to-focus-class");
            return input;
        },
        _startsWith:function(str, prefix){
            str = this._toString(str);
            prefix = this._toString(prefix);
            return str.indexOf(prefix) === 0;
        },
        _toString:function(val){
            return val == null ? '' : val.toString();
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.attr("ms-attr-id", "datePicker_{{vid}}").attr("ms-duplex", "value").attr("ms-duplex", "value").attr("ms-attr-placeholder", "placeholder")
                    .attr("ms-attr-readonly", "status=='readonly'").attr("ms-attr-disabled", "status=='disabled'");
            }
        }
    });
    My97DateWidget.xtype = xtype;
    return My97DateWidget;
});