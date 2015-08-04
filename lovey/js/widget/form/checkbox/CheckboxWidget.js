define(['../BaseFormWidget', 'text!./CheckboxWidget.html', 'css!./CheckboxWidget.css'], function (BaseFormWidget, tpl) {
    var xtype = "checkbox";
    var CheckboxWidget = new Class({
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
                            for(var i=0; i<data.length; i++) {
                                var el = data[i];
                                el.checked = false;
                                if(vm.value) {
                                    var valueArr;
                                    if(Object.prototype.toString.call(vm.value) == "[object Array]") {
                                        valueArr = vm.value;
                                    }
                                    else {
                                        valueArr = vm.value.split(vm.$split);
                                    }
                                    for(var j=0; j<valueArr.length; j++) {
                                        if(el[vm.$valueField] == valueArr[j]) {
                                            el.checked = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            vm.items = data;
                            resolve(true);
                        }
                    });
                }
            },
            getCmpMgr: function() {
                return PageMgr.manager.components[this.$vid];
            }
        },
        initialize: function (opts) {
            if(opts) {
                if(opts.dataSetId && opts.url) {
                    PageMgr.dialog.alert("复选框组件中dataSetId和url属于互斥属性，只能设置一个！");
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

            if ("inline" == $this.options
                    .$parentTpl && (this.getAttr("$showMessage") || this.getAttr("$showErrorMessage"))) {
                var msgs = "";
                if (this.getAttr("$showMessage")) {
                    msgs += this.getAttr("$message");
                }
                if (this.getAttr("$showErrorMessage") && this.getAttr("$errorMessage")) {
                    msgs += this.getAttr("$errorMessage") + " ";
                }
                if (msgs) {
                    this.toolTip = PageMgr.create("tooltip", {
                        $target: this.options.$parentId,
                        $parentDom:this.getParentElement()||this.getElement(),
                        content: msgs,
                        $opts:{
                            position: this.options.$tipPosition,
                            autoHide: false
                        }
                    });
                    this.toolTip.render();
                    this.toolTip.show();
                }
            }
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
            if(el.checked) {
                checkObj.removeClass("checked");
            }
            else {
                checkObj.addClass("checked");
            }
            this._computeValue(vm);

            if(vm.selectedEvent && "function"==typeof vm.selectedEvent) {
                var res = vm.selectedEvent(el.value, el.display, el);
                if(res == false) {
                    return;
                }
            }
        },
        _computeValue: function(vm) {
            var checkArr = $(this.getParentElement()).find(".checked");
            var value = [], display=[];
            checkArr.each(function() {
                var label = this.parentElement;
                value.push(label.getAttribute("value"));
                display.push(label.getAttribute("display"));
            });
            vm.value = value;
            vm.display = display.join(vm.$split);
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
                    this.dataSet = PageMgr.create("dataSet", {
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
            if("string" == typeof value) {
                value = value.split(this.options.$split);
            }
            return value;
        },
        setValue: function (valueArr, notFireFormValueChangeEvent) {
            if(valueArr&&this.getAttr("items")){
                var items = this.getAttr("items");
                this.setAttr("value",valueArr, notFireFormValueChangeEvent);

                $(checkbox.getElement()).find(".checked").removeClass("checked");
                var displayArr = [];
                var labelArr = $(checkbox.getElement()).find("label");
                for (var t = 0; t < valueArr.length; t++) {//设置新的值
                    var valueT = valueArr[t];
                    for (var i = 0; i < labelArr.length; i++) {
                        var value = labelArr[i].getAttribute("value");
                        var display = labelArr[i].getAttribute("display");
                        if (valueT==value) {
                            labelArr[i].children[0].classList.add("checked");
                            displayArr.push(display);
                        }
                    }
                }
                if(displayArr.length>0) {
                    this.setAttr("display",displayArr.join(this.options.$split), true);
                }
            }
        },
        checkAll:function(){
            $(this.getElement()).find("label div").addClass("checked");
            var items = this.getAttr("items");
            var values = [], display=[];
            for (var i = 0; i < items.length; i++) {
                values.push(items[i][this.options.$valueField]);
                display.push(items[i][this.options.$textField]);
            }
            this.setAttr("value",values);
            this.setAttr("value",display.join(this.options.$split));
        },
        deCheckAll:function(){
            $(this.getElement()).find("label div").removeClass("checked");
            this.setAttr("value",[]);
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
            if (status == 'edit' || status == 'disabled') {
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
                    $(this.getElement()).siblings().show();
                }
                //操作dom
                $(this.getElement()).find("label div").removeClass("disable");
            } else if (status == 'readonly') {
                this.setAttrs({
                    status: status,
                    $showErrorMessage: false,
                    $showMessage: false,
                    $showRequired: false
                });
                if(!this.readOnly) {
                    this.render();
                    this.readOnly = true;
                }
                $(this.getElement()).siblings().hide();
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
                    $(this.getElement()).siblings().show();
                }
                //操作dom设置为disabled
                $(this.getElement()).find("label div").addClass("disable");
            }else {
                window.console.error("unknown status, it should be in edit|readonly|ready2edit|disabled");
            }
        },
        handleDom: function(widgetDom) {
            widgetDom.append(jQuery('<input ms-if="status==\'readonly\'" class="form-control form-widget-to-focus-class form-text" ms-duplex="display"  readonly/>'));
        }
    });
    CheckboxWidget.xtype = xtype;
    return CheckboxWidget;
});
