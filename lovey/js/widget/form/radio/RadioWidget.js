define(['../BaseFormWidget', 'text!./RadioWidget.html', 'css!./RadioWidget.css'],function(BaseFormWidget, template){
    var xtype = "radio";
    var RadioWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            cols:null,
            value:null,

            display: null,
            $valueField: "value",//值字段
            $textField: "display",//显示字段
            $split: ",",
            dataSetId: null,
            url: null,
            mainAlias: null,
            beforeSelectEvent: null,
            selectedEvent: null,
            //showAllcheckBtn: false,//提供全选按钮
            items: [],//选项

            itemCheck: function (vid, el) {
                var vm = avalon.vmodels[vid];
                if(vm.status == 'readonly' || vm.status == 'disabled'){
                    return;
                }

                if(vm.beforeSelectEvent && "function"==typeof vm.beforeSelectEvent) {
                    var res = vm.beforeSelectEvent(el[vm.$valueField], el[vm.$textField], el.$model);
                    if(res == false) {
                        return;
                    }
                }

                if(!el.checked){
                    el.checked = true;
                    vm._setOthersUnCheck(vid,el);
                    vm.value = el[vm.$valueField];
                    vm.display = el[vm.$textField];
                }

                if(vm.selectedEvent && "function"==typeof vm.selectedEvent) {
                    var res = vm.selectedEvent(el[vm.$valueField], el[vm.$textField], el.$model);
                    if(res == false) {
                        return;
                    }
                }
            },
            _setOthersUnCheck:function(vid,el){
                var vm = avalon.vmodels[vid];
                for (var i = 0; i < vm.items.length; i++) {
                    var itemi = vm.items[i];
                    if (itemi.checked && itemi[vm.$valueField]!= el[vm.$valueField]) {
                        itemi.checked = false;
                    }
                }
            },
            _preProcessData: function() {
                var vm = this;
                var obj = vm.getCmpMgr();
                var ds = obj._getDataSet();
                if(ds) {
                    Promise.all([ds.fetch()]).then(function() {
                        var data = ds.getValue();
                        if(data) {
                            for(var i=0; i<data.length; i++) {
                                var el = data[i];
                                el.checked = false;
                                if(vm.value && vm.value == el[vm.$valueField]) {
                                    el.checked = true;
                                }
                            }
                            vm.items = data;
                        }
                    });
                }
            },
            getCmpMgr: function() {
                return PageMgr.manager.components[this.vid];
            }
        },
        initialize: function (opts) {
            if(opts) {
                if(opts.dataSetId && opts.url) {
                    PageMgr.dialog.alert("单选框组件中dataSetId和url属于互斥属性，只能设置一个！");
                    return;
                }
            }
            this.parent(opts);
        },
        render: function (parent) {
            this.parent(parent);
            //处理items的数据
            var vm = this._getCompVM();
            vm._preProcessData();
        },
        _getCompVM: function() {
            var vid = this.options.vid;
            return avalon.vmodels[vid]
        },
        _getDataSet: function() {
            if(this.options.dataSetId) {
                return PageMgr.manager.components[this.options.dataSetId];
            }
            else if(this.options.url) {
                if(!this.dataSet) {
                    this.dataSet = PageMgr.create("dataSet", {
                        fetchUrl: this.options.url,
                        model: {
                            mainAlias: this.options.mainAlias
                        }
                    });
                }
                return this.dataSet;
            }
        },
        getTemplate: function () {
            return template;
        },
        setValue: function (value, notFireFormValueChangeEvent) {
            //重写
            if(value&&this.getAttr("items")){
                var items = this.getAttr("items");
                //if(undefined == notFireFormValueChangeEvent) notFireFormValueChangeEvent = true;
                this.setAttr("value",value, notFireFormValueChangeEvent);
                //this._getCompVM().value = value;
                for (var i = 0; i < items.length; i++) {//清楚原选项
                    if(items[i]&&value==items[i][this.options.$valueField]){
                        items[i].checked = true;
                        var display = items[i][this.options.$textField];
                        if(display) {
                            this.setAttr("display",display, true);
                        }
                    }else{
                        items[i].checked = false;
                    }
                }
            }
        },
        _valueChange:function(){//值改变时校验
            this.validate();
        }
    });
    RadioWidget.xtype = xtype;
    return RadioWidget;
});
