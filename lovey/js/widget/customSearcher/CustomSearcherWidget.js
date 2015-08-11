/**
 * Created by BIKUI on 15/4/23.
 * todo 1、查询视图的更新，如果视图名已存在，则发送更新请求;
 */
define(['../Base', 'text!./CustomSearcherWidget.html'
    , '../../data/DataSet', '../layout/fragment/Fragment', '../form/input/InputWidget.js', '../form/checkbox/CheckboxWidget.js', 'css!./CustomSearcherWidget.css', 'css!./chosen.css'], function (Base, template, DataSet, Fragment, Input, Checkbox) {
    var xtype = "customSearcher";
    var CustomSearcherWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            $value: null,
            dataSetId: null,
            groupOper: "and", //条件分组之间的连接符
            matchAllFields: false,//查询条件是否匹配所有字段
            $showDropIcon: true,  //是否显示下拉小图标
            controls: [],
            builderLists: null,
            dataSetId: null,
            $fetchUrl: null,
            $syncUrl: null,
            $dsModel: {
                id: 'viewId',
                operationId: "searchView"
            },
            autoSubmit: true, //自动提交查询条件
            searchSubmit: null,
            $showGroupOper: false,

            focused: false,
            quickSearchArr: [],  //快速查询的选中项
            viewSearchArr: [],  //视图查询选中项
            customSearchArr: [], //自定义查询选中项
            tipsArr: [],
            fragmentArr: [],
            viewsArr: [], //查询视图的数据
            viewSelectedIndex: null,


            showPanel: "",   // quickPanel | viewPanel
            $firstLoad: true,
            showTips: false,  //查询条件详情面板显示控制
            customSearchPanel: true, //控制自定义查询区域面板
            saveViewPanel: true,  //控制保存视图区域面板

            searchValue: "", //查询输入值
            inputWidth: 25, //查询输入框的宽度
            iconShowIndex: null,  //删除图标显示控制
            viewIconShowIndex: null,
            QuickSearchShow: false,
            customSearchShow: false,
            clearShow: false,  //清空图标是否显示


            $objIdArr: [],   //组件中所创建的子组件Id集合，用于销毁



            searcherFocus: function ($vid, span) {
                var vm = avalon.vmodels[$vid];
                vm.focused = true;
                jQuery(this).find('input').focus();

            },
            inputFocus: function($vid, $event) {
                var vm = avalon.vmodels[$vid];
                vm.focused = true;
                vm.clickItem = false;

            },
            showClearIcon: function($vid, $event) {
                var vm = avalon.vmodels[$vid];
                vm.clearShow = true;
            },
            displayClearIcon: function($vid, $event) {
                var vm = avalon.vmodels[$vid];
                vm.clearShow = false;
            },
            showRemoveIcon: function($vid, index, $event, type) {
                var vm = avalon.vmodels[$vid];

                if(type=='view') {
                    vm.viewIconShowIndex = index;
                }
                else {
                    vm.iconShowIndex = index;
                }

            },
            displayRemoveIcon: function($vid, $event, type) {
                var vm = avalon.vmodels[$vid];
                if(type=='view') {
                    vm.viewIconShowIndex = null;
                }
                else {
                    vm.iconShowIndex = null;
                }
            },
            keyDown: function ($vid, e) {
                var vm = avalon.vmodels[$vid];
                //删除已选项（如果是删除且输入区域为字符串长度为1）  键按下触发优先于值改变 vm.searchValue.length==1
                if (e.keyCode == 8 && vm.searchValue=="" ) {
                    var cmpMgr = vm.getCmpMgr();

                    //删除选中的快速查询项|视图查询项|自定义查询项
                    if(vm.quickSearchArr.length > 0) {
                        var el = vm.quickSearchArr.pop();
                    }
                    else {
                       vm.viewSearchArr.clear();
                        vm.viewSelectedIndex = null;
                    }
                    vm.callSubmit();
                    vm.showPanel = "";
                }
                else {
                    if(vm.customSearchArr.length == 0) {
                        vm.showPanel = "quickPanel";
                    }
                }
                vm.showTips = false;
                //var selected = jQuery(this).parent().find("div");
                //var maxWidth = jQuery(this).parent().parent().width();
                //for (var i = 0, len = selected.length; i < len; i++) {
                //    maxWidth = maxWidth - selected[i].offsetWidth - 8;
                //}
                //
                ////var inputWidth = jQuery(this).val().length * 7 + 25;
                //var inputWidth = vm.searchValue && vm.searchValue.length * 15 + 25;
                //if (inputWidth > maxWidth) {
                //    inputWidth = maxWidth;
                //}
                //vm.inputWidth = inputWidth;
            },
            changeInputWidth: function() {
                var vm = this;
                var selected = jQuery(event.target).parent().find("div");
                var maxWidth = jQuery(event.target).parent().parent().width();
                for (var i = 0, len = selected.length; i < len; i++) {
                    maxWidth = maxWidth - selected[i].offsetWidth - 8;
                }

                //var inputWidth = jQuery(this).val().length * 7 + 25;
                var inputWidth = vm.searchValue && vm.searchValue.length * 12 + 25;
                if (inputWidth > maxWidth) {
                    inputWidth = maxWidth;
                }
                vm.inputWidth = inputWidth;
            },
            toggleViewPanel: function($vid, event) {
                var vm = avalon.vmodels[$vid];
//                vm.searchValue = "";
                if("viewPanel" == vm.showPanel) {
                    vm.showPanel = null;
                }
                else {
                    vm.showPanel = "viewPanel";
                    vm.showTips = false;
                }
                //第一次展开视图查询面板时加载
                if(vm.$firstLoad) {
                    //vm.saveViewPanel = false;
                    //渲染自定义条件区域
                    var viewData = vm.viewData;
                    var customFilterArr = [];
                    if(viewData && viewData.viewValue) {
                        customFilterArr = viewData.viewValue;
                    }
                    else if(vm.$value) {
                        customFilterArr = vm.$value;
                    }
                    else if(vm.$initShowArr) {
                        customFilterArr = vm.$initShowArr;
                    }
                    for(var i=0; i<customFilterArr.length; i++) {
                        vm.addCustomFilter(vm.$vid, customFilterArr[i]);
                    }
                    //创建字段选择的下拉框DS
                    new DataSet( {
                        $id: 'fieldSelectDs_'+vm.$vid,
                        data: vm.$fieldSelectData
                    });
                    vm.$objIdArr.push('fieldSelectDs_'+vm.$vid);

                    //渲染保存视图面板
                    new Input({
                        $parentId: 'viewName_'+vm.$vid,
                        $id: 'viewName_'+vm.$vid,
                        value: viewData ? viewData.viewName:"",
                        parentTpl: "inline",
                        required: true,
                        showRequired: true,
                        showLabel: false,
                        showErrorMessage: true,
                        validationRules: {
                            length: {
                                maxLen: 15
                            }
                        }
                    }).render();
                    new Checkbox({
                        $parentId: 'defaultView_'+vm.$vid,
                        $id: 'defaultView_'+vm.$vid,
                        parentTpl: "inline",
                        required: false,
                        showErrorMessage: false,
                        items: [{
                            value: '1',
                            display: '默认方案',
                            checked: viewData ? true:false
                        }]
                    }).render();
                    vm.$objIdArr.push('viewName_'+vm.$vid);
                    vm.$objIdArr.push('defaultView_'+vm.$vid);

                    vm.$firstLoad = false;
                    event.stopPropagation();
                }
            },
            selectQuickItem: function($vid, el, event) {
                var vm = avalon.vmodels[$vid];
                var searchValue = vm.searchValue;
                if(!searchValue) return;
                var inArr = false;
                //如果字段已被选中，则追加value即可；否则新增
                for(var i=0; i<vm.quickSearchArr.length; i++) {
                    if(vm.quickSearchArr[i].bindField == el.bindField) {
                        vm.quickSearchArr[i].value.push(searchValue);
                        inArr = true;
                        break;
                    }
                }
                if(!inArr) {
                    vm.quickSearchArr.push({
                        label: el.label,
                        fieldName: el.fieldName,
                        bindField: el.bindField,
                        value: [searchValue]
                    });
                }
                vm.callSubmit();
                vm.showPanel = "";
                vm.focused = false;
                vm.searchValue = "";
                vm.inputWidth = 25;
            },

            removeItem: function($vid, type, event, item, index) {
                var vm = avalon.vmodels[$vid];
                if("quickSearch" == type) {
                    vm.quickSearchArr.removeAt(index);
                }
                else if("viewSearch" == type) {
                    vm.viewSearchArr.clear();
                    vm.viewSelectedIndex = null;
                }
                else {
                    vm.customSearchArr.clear();
                }
                vm.showTips = false;

                vm.callSubmit();
                event.stopPropagation();
            },
            removeAll: function($vid, event) {
                event && event.stopPropagation();
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.quickSearchArr.clear();
                vm.viewSearchArr.clear();
                vm.customSearchArr.clear();
                vm.showTips = false;
                vm.viewSelectedIndex = null;

                vm.callSubmit();
            },
            showTipsPanel: function($vid, type, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                if(vm.showPanel=="viewPanel") return;   //如果视图面板展开了，Tips
                if("viewSearch" == type) {
                    vm.tipsArr = vm.viewSearchArr[0].viewValue;
                }
                else if("customSearch" == type) {
                    vm.tipsArr = vm.customSearchArr;
                }
                vm.showTips = true;
            },

            selectView: function($vid, el, index, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.customSearchArr.clear();
                vm.viewSearchArr = [el.$model];
                vm.viewSelectedIndex = index;

                var viewData = el;
                //清空原有有的自定义条件

                if(vm.fragmentArr.length>0) {
                    var arr = jQuery.extend([],  vm.fragmentArr.$model);   //克隆一个数组，因为要操作vm.fragmentArr，长度会发生变化
                    for(var i=arr.length-1; i>=0; i--) {
                        var el = arr[i];
                        vm.removeCustomFilter(vm.$vid, el, i);
                    }
                }
                //渲染视图对应的自定义条件
                if(viewData.viewValue) {
                    for(var i=0; i<viewData.viewValue.length; i++) {
                        vm.addCustomFilter(vm.$vid, viewData.viewValue[i]);
                    }
                }

                vm.callSubmit();
                event.stopPropagation();
            },
            deleteView: function($vid, el, index, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                //发送删除查询方案请求
                var ds = vm._getDataSet();
                ds.deleteRecord(el.viewId, false);
                Promise.all([ds.sync(true, true)]).then(function(data) {
                    if("true" == data) {
                        if(vm.viewSearchArr.length>0 && vm.viewSearchArr[0].viewName == el.viewName) {
                            vm.viewSearchArr.clear();
                            vm.viewSelectedIndex = null;
                            vm.callSubmit();
                        }
                        vm.viewsArr.removeAt(index);
                        //切换选中项，数组长度发生变化
                        if(vm.viewSelectedIndex == index) {
                            vm.viewSelectedIndex = null;
                        }
                        else if(vm.viewSelectedIndex > index) {
                            vm.viewSelectedIndex--;
                        }
                    }
                    else {
                        PageMgr.dialog.alert("删除查询方案失败！");
                    }
                });

                event.stopPropagation();
            },
            saveView: function($vid, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                var viewNameObj = PageMgr.manager.components['viewName_'+vm.$vid];
                var defaultViewObj = PageMgr.manager.components['defaultView_'+vm.$vid];

                if(!viewNameObj.isValid()) {
                    return;
                }
                var viewName = viewNameObj.getValue();
                var defaultView = "0";
                var checkBoxArr = defaultViewObj.getValue();
                if(checkBoxArr &&  checkBoxArr.length>0) {
                    defaultView = "1";
                }
                var viewValue = vm._getCustomFilter();
                if(!viewValue) return;
                var viewStr = JSON.stringify(viewValue);
                //判断是否有相同条件的方案存在
                if(vm.viewsArr) {
                    for(var i=0; i<vm.viewsArr.length; i++) {
                        var tempArr = vm.viewsArr[i].$model.viewValue;
                        if(JSON.stringify(tempArr) === viewStr) {
                            PageMgr.dialog.alert("已存在相同条件的查询方案，不予保存！");
                            return;
                        }
                    }
                }


                var param = {
                    viewName: viewName,
                    defaultView: defaultView,
                    viewValue: viewStr,
                    searchId: $vid
                };
                var ds = vm._getDataSet();
                ds.addRecord(param);
                Promise.all([ds.sync(true, true)]).then(function(data) {
                    if(data && data.length>0 && data[0].code!="500") {
                        var viewId = data[0];
                        //修改ds中对应行数据的dataMap中key,以及状态和viewId;因为删除时，readRecord从dataMap中获取
                        ds.options._dataMap[viewId] = ds.options._dataMap[param.viewId];
                        delete ds.options._dataMap[param.viewId];
                        ds.options._dataMap[viewId].options.data.$status$ = "$notModify$";
                        ds.options._dataMap[viewId].options.data.viewId = viewId;
                        //param与ds中的行数据共享引用，修改其，便可修改ds行数据。添加多条数据时initData会根据options.data修改_dataMap
                        param.$status$ = "$notModify$";
                        param.viewId = viewId;
                        param.viewValue = viewValue;
                        vm.viewsArr.push(param);
                    }
                    else {
                        PageMgr.dialog.alert("保存查询方案失败！");
                    }
                });
            },
            toggleCustomPanel: function($vid, type, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                if('customPanel' == type) {
                    vm.customSearchPanel = !vm.customSearchPanel;
                }
                else if("saveViewPanel" == type) {
                    vm.saveViewPanel = !vm.saveViewPanel;
                }
            },
            _renderView: function() {
                var ds = this._getDataSet();
                if(!ds) return;
                //发送获取数据请求
                var that = this;
                ds.setAttr("fetchParam", {searchId: this.$vid});
                Promise.all([ds.fetch()]).then(function() {

                    that._preProcessView();
                });
            },
            _preProcessView: function() {
                var ds = this._getDataSet();
                var vm = this;
                var views = ds.getValue();
                var viewData;
                if(views && views.length>0) {
                    //处理defaultView
                    for(var i=0; i<views.length; i++) {
                        //处理defaultView
                        if(views[i].defaultView == "1") {
                            viewData = views[i];
                            vm.viewSearchArr.push(views[i]);
                            vm.viewSelectedIndex = i;
                            vm.callSubmit();
                            break;
                        }
                    }
                    vm.viewsArr = views;
                    vm.viewData = viewData;
                    //渲染自定义查询
                    /*if(viewData.viewValue) {
                        for(var i=0; i<viewData.viewValue.length; i++) {
                            vm.addCustomFilter(vm.$vid, viewData.viewValue[i]);
                        }
                    }*/

                }
                //是否有初始条件
                else {
                    vm.renderInitFilter();
                }

            },
            renderInitFilter: function() {
                if(this.$value) {
                    this.customSearchArr = this.$value;
                    this.callSubmit();
                }
            },
            addCustomFilter: function($vid, initData) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                if(undefined == vm.filterIndex)
                    vm.filterIndex = 0;
                var index = vm.filterIndex++;
                var fragmentId = "filterIndex_"+index+"_"+$vid;
                var operDSId = 'operSelectDs_'+index+"_"+$vid;
                var fieldObjId = 'field_'+index+"_"+$vid;
                var operObjId = 'oper_'+index+"_"+$vid;
                var valueObjId = 'value_'+index+"_"+$vid;
                vm.fragmentArr.push(fragmentId);            //控制生成的行Dom
                //创建DS
                new DataSet( {
                    $id: operDSId
                });

                //增加行片段
                var fragment = new Fragment({
                    $id: fragmentId,
                    $parentId: fragmentId,
                    items: [{
                        $xtype: 'col',
                        md: 4,
                        sm: 4,
                        xs: 4,
                        lg: 4,
                        items: [{
                            $id: fieldObjId,
                            $xtype: 'combobox',
                            parentTpl: "inline",
                            multi: false,
                            value: "",
                            display: "",
                            dataSetId: 'fieldSelectDs_'+vm.$vid,
                            showErrorMessage:true,
                            required:true,
                            tipPosition:"top",
                            selectedEvent: function(value, display, obj) {
                                //重新刷新操作符的下拉面板数据
                                var fieldModel = vm.$fieldMap[value];
                                var operSelectDs = vm.getCmpMgr(operDSId);
                                operSelectDs.setData(vm.builderLists[fieldModel.builderList].$model);
                                var operObj = PageMgr.manager.components[operObjId];
                                operObj.clearSelect();
                                operObj.reloadSelectData();
                                //重新渲染值选择
                                var rowObj = PageMgr.manager.components[fragmentId];
                                var valColObj = PageMgr.manager.components[rowObj.itemsArr[2]];
                                if(valColObj.itemsArr.length>0) {
                                    valColObj.removeItem(0);
                                }

                                fieldModel.$id = valueObjId;
                                fieldModel.parentTpl = 'inline';
                                fieldModel.tipPosition = 'top';
                                if(undefined == PageMgr.classMap[fieldModel.$xtype]) {
                                    fieldModel.$xtype = 'input';
                                }
                                valColObj.addItem(fieldModel);
                            }
                        }]
                    },{
                        $xtype: 'col',
                        md: 4,
                        sm: 4,
                        xs: 4,
                        lg: 4,
                        items: [{
                            $id: operObjId,
                            $xtype: 'combobox',
                            parentTpl: "inline",
                            multi: false,
                            searchable: false,
                            value: "",
                            display: "",
                            valueField: "name",
                            textField: "caption",
                            dataSetId: operDSId,
                            showErrorMessage:true,
                            required:true,
                            tipPosition:"top",
                            selectedEvent: function(value, display, obj) {
                                var valueObj = PageMgr.manager.components[valueObjId];
                                var xtype = valueObj.options.$xtype;
                                if("combobox" === xtype) {
                                    var multi = valueObj._getCompVM().multi;
                                    if("m_value_include" == value || "m_value_equal" === value) {
                                        if(!multi) {
                                            valueObj._getCompVM().multi = true;
                                        }
                                    }
                                    else{
                                        if(multi) {
                                            valueObj._getCompVM().multi = false;
                                        }
                                    }
                                }
                            }
                        }]
                    },{
                        $xtype: 'col',
                        md: 4,
                        sm: 4,
                        xs: 4,
                        lg: 4,
                        items: initData ? [] : [{
                            $id: valueObjId,
                            $xtype: 'input',
                            tipPosition:"top",
                            parentTpl: "inline"}]
                    }]
                }).render();

                vm.$objIdArr.push(operDSId);
                vm.$objIdArr.push(fragmentId);

                //初始化值
                if(!initData) return;
                var fieldObj = PageMgr.manager.components[fieldObjId];
                fieldObj.setValue({value: initData.name, display: initData.nameDisplay});
                var operObj = PageMgr.manager.components[operObjId];
                operObj.setValue({value: initData.builder, display: initData.builderDisplay});
                var valueObj = PageMgr.manager.components[valueObjId];
                valueObj.setValue({value: initData.value, display: initData.valueDisplay});
            },
            removeCustomFilter: function($vid, el, index, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.fragmentArr.removeAt(index);
//                vm.removeFilter = true;
                //销毁行内所有组件
                vm.getCmpMgr(el).destroy();

                event && event.stopPropagation();
            },
            addCustomSearch: function($vid, $event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.viewSearchArr.clear();
                vm.quickSearchArr.clear();
                var res = vm._getCustomFilter();
                if(res) {
                    vm.customSearchArr = res;
                    vm.callSubmit();
                    vm.showPanel = "";
                }
            },
            _getCustomFilter: function() {
                var result = [];
                var vm = this;
                if(vm.fragmentArr.length>0) {
                    var allFields = "";
                    for(var i=0; i<vm.fragmentArr.length; i++) {
                        var rowId = vm.fragmentArr[i];
                        var index = rowId.split("_")[1];
                        var fieldObjId = 'field_'+index+"_"+vm.$vid;
                        var operObjId = 'oper_'+index+"_"+vm.$vid;
                        var valueObjId = 'value_'+index+"_"+vm.$vid;

                        var fieldObj = vm.getCmpMgr(fieldObjId);
                        var operObj = vm.getCmpMgr(operObjId);
                        var valueObj = vm.getCmpMgr(valueObjId);
                        //校验一下
                        if(!fieldObj.isValid() || !operObj.isValid() || !valueObj.isValid()) {
                            return;
                        }
                        var item = {};
                        //计算show属性
                        var bindField = fieldObj.getValue();
                        if(allFields.indexOf(bindField)>-1) {
                            item.show = false;
                        }
                        else {
                            allFields += bindField +",";
                        }

                        item.name = fieldObj.getValue();
                        item.nameDisplay = fieldObj.getDisplay();
                        item.builder = operObj.getValue();
                        item.builderDisplay = operObj.getDisplay();
                        item.value = valueObj.getValue();
                        item.valueDisplay = valueObj.getDisplay();
                        if(i!=0) {
                            item.linkOpt = vm.groupOper;
                        }

                        result.push(item);
                    }
                }
                return result;
            },
            callSubmit: function(isClick) {
                var vm = this;
                var searchValue = vm.getSearchValue();
                if(isClick) {
                    vm.searchSubmit && "function"==typeof vm.searchSubmit && vm.searchSubmit(searchValue);
                }
                else {
                    if(this.autoSubmit) {
                        vm.searchSubmit && "function"==typeof vm.searchSubmit && vm.searchSubmit(searchValue);
                    }
                }
            },
            sendSearch: function($vid, event){
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.callSubmit(true);
                event.stopPropagation();
            },
            getSearchValue: function($vid) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                var res = [];
                if(vm.customSearchArr.length>0) {
                    res = vm.customSearchArr.$model;
                }
                else {
                    if(vm.viewSearchArr.length>0) {
                        res.push(vm.viewSearchArr[0].viewValue.$model);
                    }
                    for(var i=0; i<vm.quickSearchArr.length; i++) {
                        var quickSearch = vm.quickSearchArr[i];
                        var item = {
                            linkOpt: "and",
                            name: quickSearch.bindField,
                            nameDisplay: quickSearch.label,
                            value: quickSearch.value.join(","),
                            valueDisplay: quickSearch.value.join(","),
                            builder: "m_value_include",
                            builderDisplay: "多值包含"
                        };
                        res.push(item);
                    }
                }
                return res;
            },
            emptySearchValue: function($vid) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                vm.customSearchArr.clear();
                vm.viewSearchArr.clear();
                vm.quickSearchArr.clear();
            },
            _getDataSet: function() {
                var cmpMgr = this.getCmpMgr();
                return cmpMgr._getDataSet();
            },
            getCmpMgr: function($vid) {
                return PageMgr.manager.components[$vid ? $vid:this.$vid];
            }


        },
        initialize: function (opts) {
            if(opts) {
                if(opts.dataSetId && opts.fetchUrl) {
                    PageMgr.dialog.alert("自定义查询组件中dataSetId和url属于互斥属性，只能设置一个！");
                    return;
                }
                this._setUrl(opts);
            }

            //处理Control模型数据：1、判断哪些字段可以快速查询
            this._handleControlsData(opts);
            this.parent(opts);

            var that = this;
            //点击其它区域，隐藏掉下拉面板
            jQuery(document).click(function(event) {
                var name = "CustomSearcherWidget_"+that.options.$vid;
                if(!jQuery(event.target).closest("[name='"+name+"']").length) {
                    var hasCombox = false;
                    $('[id^="comboBox_panel_value"]').each(function() {
                        if(this.style.display == "block") {
                            hasCombox = true;
                        }
                    });
                    if(hasCombox) return;

                    var vm = that._getCompVM();
//                    if(!vm || vm.removeFilter) {
//                        vm.removeFilter = false;
//                        return;
//                    }
                    if(!vm)  return;
                    vm.showPanel = "";
                    vm.focused = false;
                    vm.inputWidth = 25;
                    vm.showTips = false;
                    vm.searchValue = "";
                }
            });

            this._watchSearchValue(this.vmodel);
        },

        _watchSearchValue: function(vm) {
            vm.$watch("searchValue", function (newValue, oldValue)  {
                vm.changeInputWidth();
            });
        },
        _setUrl: function(opts){
            if(!opts.dataSetId) {
                var path = document.location.pathname;
                var contentPath = path.split("/")[1];
                if(!opts.fetchUrl) {
                    opts.fetchUrl = "/"+contentPath+"/emap/web/getSearchViewsInfo";
                }
                if(!opts.syncUrl) {
                    opts.syncUrl = "/"+contentPath+"/emap/web/updateSearchView";
                }
            }
//
//            //TODO test
//            opts.fetchUrl = 'Data.demo.json';
//            opts.syncUrl = "Update.demo.json";
        },
        _afterRender: function() {
            var vm = this._getCompVM();
            vm._renderView();
        },
        _handleControlsData: function(opts) {
            if(opts.controls) {
                var quickType = ["input", "textarea", "slider"];
                opts.$fieldMap = {};
                opts.$fieldSelectData = [];     //vm.$fieldSelectData直接调用
                opts.$initShowArr = [];   //初始化时，如果没有查询方案或者初始条件，则默认创建自定义条件项
                for(var i=0; i<opts.controls.length; i++) {
                    var fieldModel = opts.controls[i];
                    //过滤隐藏字段
                    if(fieldModel.hidden) {
                        continue;
                    }
                    //没有设定xtype的，则默认为input显示类型
                    if(undefined == fieldModel.$xtype) {
                        fieldModel.$xtype = 'input';
                    }
                    //判断哪些字段可用于快速查询
                    if(undefined == fieldModel.quickSearch) {
                        if(quickType.contains(fieldModel.$xtype)) {
                            fieldModel.quickSearch = true;
                        }
                    }
                    //判断哪些字段是初始化时默认加入自定义条件项中
                    if(fieldModel.initShow) {
                        opts.$initShowArr.push({
                            "name": fieldModel["bindField"],
                            "nameDisplay": fieldModel["label"]
                        });
                    }
                    var bindField = fieldModel.bindField;
                    var label = fieldModel.label;
                    opts.$fieldSelectData.push({
                        value: bindField,
                        display: label
                    });
                    opts.$fieldMap[fieldModel.bindField] = fieldModel;

                }
            }
        },
        _getCompVM: function() {
            var $vid = this.options.$vid;
            return avalon.vmodels[$vid]
        },
        _getDataSet: function() {
            if(this.options.dataSetId) {
                return PageMgr.manager.components[this.options.dataSetId];
            }
            else if(this.options.$fetchUrl && this.options.$syncUrl) {
                if(!this.dataSet) {
                    this.dataSet = new DataSet( {
                        fetchUrl: this.options.$fetchUrl,
                        syncUrl: this.options.$syncUrl,
                        model: this.options.$dsModel
                    });
                    this.options.$objIdArr.push(this.dataSet.getId());
                }
                return this.dataSet;
            }
        },
        getSearchValue: function() {
            return this._getCompVM().getSearchValue();
        },
        emptySearchValue: function() {
            return this._getCompVM().emptySearchValue();
        },
        getTemplate: function () {
            return template;
        },

        _valueChange: function (value) {
            this.setAttr("display", value);
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find('input');
            return input;
        },
        focus: function () {
            //console to invoke this method is not ok...
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.focus();
            });
            this._getCompVM().focused = true;
        },
        blur: function () {
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.blur();
            });
            this._getCompVM().focused = false;
        },
        _valueChange:function(){//值改变时校验
            this.validate();
        },
        destroy: function() {
            //销毁组件所创建的DataSet
            for(var i=0; i<this.options.$objIdArr.length; i++) {
                var id = this.options.$objIdArr[i];
                var obj = PageMgr.manager.components[id];
                if(obj) {
                    obj.destroy();
                }
            }
            this.parent();
        }
    });
    CustomSearcherWidget.xtype = xtype;
    return CustomSearcherWidget;
});