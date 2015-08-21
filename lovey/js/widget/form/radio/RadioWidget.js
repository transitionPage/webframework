define(['../BaseFormWidget', 'text!./RadioWidget.html', '../../../data/DataSet', 'css!./RadioWidget.css'], function (BaseFormWidget, tpl, DataSet) {
    var xtype = "radio";
    var RadioWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            $cols: null,//布局列数
            value: null,
            display: null,
            $valueField: "value",//值字段
            $textField: "display",//显示字段
            $split: ",",
            $dataSetId: null,
            $url: null,
            $mainAlias: null,
            beforeSelectEvent: null,
            selectedEvent: null,
            //showAllcheckBtn: false,//提供全选按钮

            items: [],//选项

            _preProcessData: function(resolve) {
                var vm = this;
                var obj = vm.getCmpMgr();
                var ds = obj._getDataSet();
                if(ds) {
                    Promise.all([ds.fetch()]).then(function() {
                        var data = ds.getValue();
                        if(data) {
                            vm.items = vm.process(data);
                            resolve(true);
                        }
                    });
                }
                else if(vm.items.length>0) {
                    vm.process(vm.items);
                    resolve(true);
                }
            },
            process: function(data) {
                var vm = this;
                for(var i=0; i<data.length; i++) {
                    var el = data[i];
                    el.checked = false;


                    if(vm.value && vm.value == el[vm.$valueField]) {
                        el.checked = true;
                    }
                }
                return data;
            },
            getCmpMgr: function() {
                return PageMgr.manager.components[this.$vid];
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
            //this.parent(parent);
            //处理items的数据
            var vm = this._getCompVM();
            var that = this;
            if(vm.status == "readonly") {
                that.parent(parent);
                that.readonlyObj = true;
            }
            else {
                new Promise(function(resolve){
                    vm._preProcessData(resolve);
                }).then(function() {
                        that._customRender(parent, vm);
                    });
                that.editObj = true;
            }
        },
        _customRender: function(widgetDom, vm) {
            this.fireEvent("beforeRender", [this.vmodel]);
            var $this = this;
            if (!widgetDom) {
                widgetDom = $this.getParentElement();
            }
            var e = jQuery(("<div></div>"));
            e.appendTo(widgetDom);

            var temp = $(tpl).text();
            jQuery(template.compile(temp)(vm)).appendTo(e).find("label").click(function() {
                var el = {
                    display : this.getAttribute("display"),
                    value : this.getAttribute("value"),
                    checked : $(this.children[0]).hasClass("checked")
                };
                $this.itemCheck(this, el, vm);
            });


            $this.$element = e;
            $this.element = e[0];


            $this.fireEvent("afterRender", [$this.vmodel]);
            if ($this["_afterRender"]) {
                $this["_afterRender"]($this.vmodel);
            }
            if ($this.options.$bind != '') {
                var bindField = $this.options.$bind;
                if (bindField) {
                    var f = bindField.split(".");
                    if (f.length != 2) {
                        throw new Error('$bind error' + bindField);
                    }
                    var dsId = f[0];
                    var dsField = f[1];
                    var ds = {
                        dataValueId: dsId,
                        fieldId: dsField,
                        widgetId: $this.getId()
                    };
                    var dbinder = PageMgr.create('dataBinder', ds);
                    $this.dataBind = dbinder;
                }
            }
            return this;
        },
        itemCheck: function (target, el, vm) {
            if(vm.status == 'readonly' || vm.status == 'disabled'){
                return;
            }
            if(vm.beforeSelectEvent && "function"==typeof vm.beforeSelectEvent) {
                var res = vm.beforeSelectEvent(el.value, el.display, el);
                if(res == false) {
                    return;
                }
            }

            var checkObj = $(target.children[0]);
            if(!el.checked){
                //把之前选中的选项设置成未选
                $(this.getParentElement()).find(".checked").removeClass("checked");
                vm.display = el.display;
                vm.value = el.value;
                checkObj.addClass("checked");
            }

            if(vm.selectedEvent && "function"==typeof vm.selectedEvent) {
                var res = vm.selectedEvent(el.value, el.display, el);
                if(res == false) {
                    return;
                }
            }
        },

        _getCompVM: function() {
            var $vid = this.options.$vid;
            return avalon.vmodels[$vid]
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
        refresh: function() {
            this.getParentElement().empty();
            this.render();
        },
        getValue: function () {
            var value =  this.parent();
            return value;
        },
        setValue: function (value, notFireFormValueChangeEvent) {
            if(value&&this.getAttr("items")){
                if(Object.prototype.toString.call(value) == "[object Object]") {
                    value = value.value.split(this.options.$split);
                }
                //if(undefined == notFireFormValueChangeEvent) notFireFormValueChangeEvent = true;
                this.setAttr("value",value, notFireFormValueChangeEvent);
                //this._getCompVM().value = value;

                $(this.getElement()).find(".checked").removeClass("checked");
                var labelArr = $(this.getElement()).find("label");
                for (var i = 0; i < labelArr.length; i++) {//清楚原选项
                    if(value == labelArr[i].getAttribute("value")){
                        var display = labelArr[i].getAttribute("display");
                        if(display) {
                            this.setAttr("display",display, true);
                        }
                        labelArr[i].children[0].classList.add("checked");
                    }
                }
            }
        },

        deCheckAll:function(){
            if(avalon.vmodels[this.options.$vid].status!="edit") return;
            var element = $(this.getElement());
            if(element.attr("avalonctrl")) {
                element = element.siblings();
            }
            element.find("label div").removeClass("checked");
            this.setAttr("value","");
            this.setAttr("display","");
        },
        validate: function () {
            //var valRes = PageMgr.validation.validateValue(this.getValue(),this.getAttr("validationRules"));
            var validateTool = PageMgr.create("validation", {onlyError: true});//后续由系统统一创建，只需调用即可

            var valRes = null;
            if (this.getAttr("required")) {//先判断是否必填
                valRes = validateTool.checkRequired(this.getValue());
            }
            if ((!valRes || valRes.result) && this.getAttr("validationRules")) {//再判断校验规则
                valRes = validateTool.validateValue(this.getValue(), this.getAttr("validationRules"));
            }
            if (valRes && !valRes.result) {//将错误信息赋值给属性
                this.setAttr("errorMessage", valRes.errorMsg);
            } else {//清空错误信息
                this.setAttr("errorMessage", "");
            }
        },
        _valueChange:function(){//值改变时校验
            this.validate();
        },
        switchStatus: function (status) {
            var that = this;
            var element = $(this.getElement());
            if(element.attr("avalonctrl")) {
                element = element.siblings();
            }
            if (status == 'edit') {
                this.setAttrs({
                    status: status,
                    $showErrorMessage: false,
                    $showMessage: true,
                    $showRequired: that.getAttr("$required")
                });
                if(!this.editObj) {
                    this.render();
                    this.editObj = true;
                }
                else {
                    //显示items
                    element.show();
                }
                //操作dom
                element.find("label div").removeClass("disabled");
            } else if (status == 'readonly') {
                this.setAttrs({
                    status: status,
                    $showErrorMessage: false,
                    $showMessage: false,
                    $showRequired: false
                });
                if(!this.readonlyObj) {
                    this.render();
                    this.readonlyObj = true;
                }
                element.hide();
            } else if (status == 'disabled') {
                this.setAttrs({
                    status: status,
                    $showErrorMessage: false,
                    $showMessage: false,
                    $showRequired: that.getAttr("$required")
                });
                if(!this.editObj) {
                    this.render();
                    this.editObj = true;
                }
                else {
                    element.show();
                }
                //操作dom设置为disabled
                element.find("label div").addClass("disabled");
            }else {
                window.console.error("unknown status, it should be in edit|readonly|ready2edit|disabled");
            }
        },
        handleDom: function(widgetDom) {
            widgetDom.append(jQuery('<input ms-if="status==\'readonly\'" class="form-control form-widget-to-focus-class form-text" ms-duplex="display"  readonly/>'));
        }
    });
    RadioWidget.xtype = xtype;
    return RadioWidget;
});
