define(['../BaseFormWidget','../../../../../vendors/lib/jqueryui/ui/autocomplete','../../../data/DataSet'],
function (BaseFormWidget,autocomplete,DataSet) {
    var xtype = "autocomplete";
    var AutocompleteWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $searchKey:null,
            $url:null,
            $mainAlias: null,
            $dataSetId: null,
            $textField: "label",
            $valueField: "value",
            $data:null,
            $processData:function(data){
                var textField = this.$textField;
                var valueField = this.$valueField;
                var newData = $.map(data, function(item) {
                    return {
                        label: item[textField],
                        value: item[valueField]
                    }
                });
                return newData;
            },
            $opts:{
                minLength:1,
                change: null,
                close: null,
                create: null,
                focus: null,
                open: null,
                response: null,
                search: null,
                select: null
            }
        },
        initialize: function (opts) {
            var $opts = {};
            var formOpt = new BaseFormWidget({}).options;
            for(var key in opts) {
                if(!((key in formOpt) || ("$"+key in formOpt) || (key in this.options) || ("$"+key in this.options)) && key!="$id" && !this._startsWith(key,"on")) {
                    $opts[key] = opts[key];
                    delete opts[key];
                }
            }
            opts.$opts = $opts;
            this.parent(opts);
        },
        render: function (opts) {
            var that = this;
            this.parent(opts);
            var p = jQuery.extend({}, this.options, opts || {});
            if(p.$data){
                //本地数据做过滤
                p.$opts.source = function(request, response){
                    if(p.$processData){
                        var dataArr = p.$processData(p.$data);
                        response($.ui.autocomplete.filter(dataArr, request.term));
                    }
                };
            }else if(p.$url){
                //服务器端数据在后台做过滤
                p.$opts.source = function( request, response ) {
                    new Promise(function(resolve){
                        that._preProcessData(resolve,request.term);
                    }).then(function(data) {
                        var newData = data;
                        if(p.$processData){
                            newData = p.$processData(data);
                        }
                        response(newData);
                    });
                };
            }
            var autoCompleteObj = this.getParentElement().autocomplete(p.$opts);
            this.getParentElement().bind("focus",function(){
                autoCompleteObj.autocomplete("widget").show();
            });
        },
        _preProcessData:function(resolve,searchValue){
            var ds = this._getDataSet();
            if(ds) {
                if(this.options.$searchKey) {
                    var fetchParam = {};
                    fetchParam["searchKey"] = this.options.$searchKey;
                    fetchParam["searchValue"] = searchValue;
                    ds.setAttr("fetchParam", fetchParam);
                }
                else {
                    ds.setAttr("fetchParam", {});
                }
                Promise.all([ds.fetch()]).then(function() {
                    var data = ds.getValue();
                    if(data) {
                        resolve(data);
                    }
                });
            }
        },
        _getDataSet: function() {
            if(this.options.$dataSetId) {
                return PageMgr.manager.components[this.options.$dataSetId];
            }
            else if(this.options.$url) {
                if(!this.dataSet) {
                    this.dataSet = new DataSet({
                        fetchUrl: this.options.$url,
                        model: {
                            mainAlias: this.options.$mainAlias
                        }
                    });
                }
                return this.dataSet;
            }
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement());
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
                widgetDom.attr("ms-attr-readonly", "status=='readonly'")
                    .attr("ms-attr-disabled", "status=='disabled'").attr("ms-class", "form-text:status=='readonly'");
            }
        }
    });
    AutocompleteWidget.xtype = xtype;
    return AutocompleteWidget;
});