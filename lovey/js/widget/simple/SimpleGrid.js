/**
 *  Created by hhxu on 15/5/8.
 *  属性说明
 *  1. columns:数组，列信息
 *      每列可配置属性如下：
     *｛title:"性别",
     * dataField:"sex",
     * width:"4%",
     * titleAlign:'center',
     * textAlign:'left',
     * showDisplay:true,//showDisplay：显示Display字段，
     * disabledEdit:true,
     * sortDisabled:true,
     * xtype:"combobox",
     * editParams:编辑组件属性
     * isOpColumn:true,//isOpColumn，自定义显示，
     * template:""} //template：自定义显示的内容（html，可以是avalon片段），内容中可通过avalon访问grid信息，如，rowdata，行数据，col，列模型
    2. opColumns:数组， 操作列信息
     * 每列配置属性{title:"操作",width:'10%',position:2,template:''}
     * position支持值为front、end和具体数字
 */
define(['../Base',"../../data/DataConstant", 'text!./SimpleGridWidget.html', 'css!./SimpleGridWidget.css'], function (Base,Constant,template) {
    var xtype = "simpleGrid";
    var SimpleGridWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            /** ====================基础配置信息====================== */
            $tableClass: "table table-bordered table-hover table-striped",
            width: null,
            columns: [],//列信息
            data: [],    //静态数据
            $dataSetId: null,    //数据集ID，设置了dataSetId则data无效
            $idField: "WID",  //主键属性
            $isMerge: false,
            $canSort: true,   //是否可排序
            $canSortOpColumn: false,
            $multiSort: false,//复合排序
            $showIndex: false,  //是否显示序号
            $showCheckbox: true,  //是否显示复选框
            $multiCheck: true,  //是否多选
            allChecked: false,  //设置为true，则默认全部选中
            $mouseoverToActive: false,//鼠标经过时激活行，通过getActiveRow获取
            $clickToActive: true,//点击激活行，通过getActiveRow获取
            $canMoveDataUpandDown: false,//提供行排序
            /** ====================样式相关====================== */
            titleNoWrap: false,//标题不换行
            contentNoWrap: false,//内容不换行
            lineHeight: '40px',//行高，与全局样式有关，目前最小40
            defaultAlign: "left",//默认对齐方式，若column中未设置则采用默认
            defaultTitleAlign: "center",//默认对齐方式，若column中未设置则采用默认
            /** ====================分页配置信息====================== */
            $usePager: true,  //是否分页
            pageIndex: 1,    //默认当前页
            pageSize: 15,    //默认每页条数
            totalNum: 0, //总数据条数
            totalPage: 0,    //总页数
            $showPageIndexInput: true,   //显示跳转到某页输入框
            $showPageSizeInput: true,    //显示每页条数输入框]
            $showFirstPage: true,    //显示第一页按钮
            $showLastPage: true, //显示最后一页按钮
            $showPageBeforeAfterCount: 3, //显示最后一页按钮
            $showPreviousAndNextPage: true,  //显示上一页和下一页按钮
            $showPageDetail: true,   //显示分页详情
            $showTipWhenNull: false,//没有数据时显示分页提示
            $hidePagerWhenNull: true,//没有数据时隐藏提示
            $noDataTip: "暂无数据",//无数据时分页区的提示信息
            /** ====================操作列与扩展====================== */
            opColumns: [], /**操作列信息,
             * 每列配置属性{title:"操作",width:'10%',position:2,template:''}
             * position支持值为front、end和具体数字
             */
            /** ====================行编辑====================== */
            $canEdit: false,  //是否可编辑
            $dbClickToEditRow: false, //双击编辑行
            $clickToEditField: true, //单击编辑属性
            $editMultiRow: false, //同时编辑多行
            editRowFunc: null,   //编辑行事件
            editFieldFunc: null, //编辑单属性事件
            /** ====================自定义显示列====================== */
            $canCustomCols: false,
            fixedCols: [],
            customColFunc: null,
            $showCustomAllCheck: false,
            $fetchUrl: null,
            $metaDataObj: null,
            /** ====================表头分组控制====================== */
            grouping: false,
            /** ====================事件====================== */
            clickRowFunc: null,//内置参数未：vm－grid模型,rowdata－行数据,rowObj－行dom
            dbClickRowFunc: null,//内置参数未：vm－grid模型,rowdata－行数据,rowObj－行dom
            clickFieldFunc: null,//点击属性回调
            beforeSetData: null, //设置数据前，参数：即将设置的数据datas
            afterSetData: null,  //设置数据后，参数：已经设置的数据datas
            beforeCheckRow: null, //勾选行事件
            afterCheckRow: null, //勾选行后事件
            changeOrderFunc: null, //改变排序前事件
            beforeChangePageNo: null,//改变页码前事件
            /** ====================中间参数，不提供使用者初始化====================== */

            editFieldNow: null,//当前编辑的属性
            opColumnMap: {},//操作列
            editCompMap: {},//编辑组件
            allColumns: [],//全部列（columns+opColumns）
            tdSpans: {},//跨列数（isMerge为true时）
            dataChangedField: [],
            hasGroupTitle:false,
            groupTitleSpans:[],
            activedRow: null,//激活的行
            activedRowDom: null, //行编辑Dom
            allClick: function (vid, element) {
                var vm = avalon.vmodels[vid];
                if (vm && vm.$multiCheck) {
                    vm.allChecked = !vm.allChecked;
                    var datas = vm.data;
                    for (var i = 0; i < datas.length; i++) {
                        datas[i]['checked'] = vm.allChecked;
                    }
                }
            },
            dbClickRow: function (vid, row, rowObj) {
                var vm = avalon.vmodels[vid];
                if (vm.dbClickRowFunc) {
                    vm.dbClickRowFunc(vm, row, rowObj);
                }
                if (vm.$canEdit && vm.$dbClickToEditRow) {
                    vm.editRow(vid, row, rowObj);
                }
            },
            clickRow: function (vid, row, rowObj) {
                var vm = avalon.vmodels[vid];
                vm.activedRow = row;
                vm.activedRowDom = rowObj;
                if (vm.clickRowFunc) {
                    vm.clickRowFunc(vm, row, rowObj);
                }
            },
            clickField: function (vid, row, col, tdDom) {
                var vm = avalon.vmodels[vid];
                if (vm.clickFieldFunc) {
                    vm.clickFieldFunc(vm, row,col,tdDom);
                }
                if (vm.$canEdit && !col.disabledEdit && vm.$clickToEditField && !vm.$dbClickToEditRow) {
                    vm.editField(vid, row, col.dataField, col.xtype, tdDom);
                }
            },
            activeRow: function (vid, row, rowObj) {
                var vm = avalon.vmodels[vid];
                vm.activedRow = row;
                vm.activedRowDom = rowObj;
            },
            checkRow: function (vid, row) {
                var vm = avalon.vmodels[vid];
                var grid = Page.manager.components[vid];
                if (!vm.$multiCheck && !row.checked && grid.getCheckedRows().length > 0) {
                    for (var i = 0; i < vm.data.$model.length; i++) {
                        if (vm.data[i]) {
                            vm.data[i]['checked'] = false;
                        }
                    }
                }
                if (vm.beforeCheckRow && row.checked) {
                    vm.beforeCheckRow(row);//选中后事件
                }
                row.checked = !row.checked;
                if (vm.afterCheckRow && row.checked) {
                    vm.afterCheckRow(row);//选中后事件
                }
                var all = true;
                for (var i = 0; i < vm.data.$model.length; i++) {
                    if (!vm.data[i]['checked']) {
                        all = false;
                        break;
                    }
                }
                vm.allChecked = all;
            },
            sortByCol: function (vid, col, orderType, cols) {
                if (orderType && orderType == "unsort") {
                    orderType = "";
                }
                var vm = avalon.vmodels[vid];
                var grid = Page.manager.components[vid];
                if (cols && cols.length > 0) {
                    for (var s = 0; s < cols.length; s++) {
                        if (cols[s] == col || cols[s].dataField == col.dataField) {
                            cols[s].orderType = orderType;
                        } else if (!vm.$multiSort && cols[s]) {//其他字段恢复无排序状态
                            cols[s].orderType = "";
                        }
                    }
                }
                col.orderType = orderType;
                if (vm.changeOrderFunc) {
                    vm.changeOrderFunc(vm, col, orderType);
                } else {
                    grid.reloadData(col.dataField, orderType);// 调用dataset接口进行查询
                }
            },
            getColTemplate: function (vid, row, col) {
                var vm = avalon.vmodels[vid];
                if (col.template) {
                    return col.template;
                } else if (col.templateGenerator && vm[col.templateGenerator]) {
                    return vm[col.templateGenerator](row, col);
                }
            },
            editRow: function (vid, row, rowDom) {
                var vm = avalon.vmodels[vid];
                if (vm.editRowFunc) {
                    vm.editRowFunc(vm, row, rowDom);
                } else {
                    var grid = Page.manager.components[vid];
                    grid._defaultEditRow(vm, row, rowDom);
                }
            },
            editField: function (vid, row, fieldName, fieldXtype, tdDom) {
                var vm = avalon.vmodels[vid];
                if (vm.editFieldFunc) {
                    vm.editFieldFunc(vm, row, fieldName, fieldXtype, tdDom);
                } else {
                    var grid = Page.manager.components[vid];
                    grid._defaultEditField(vm, row, fieldName, fieldXtype, tdDom);
                }
            },
            moveDataUpAndDown: function (vid,upFlag) {
                var grid = Page.manager.components[vid];
                var row = null;
                if(grid.getCheckedRows()){
                    var cRows = grid.getCheckedRows();
                    if(cRows&&cRows.length>1){
                        Page.dialog.alert("只能勾选一条记录！");
                        return;
                    }
                    row =  grid.getCheckedRows()[0];
                }else{
                    Page.dialog.alert("只能勾选一条记录！");
                    return;
                }
                if (row && grid.getAttr("$idField")) {
                    var idField = grid.getAttr("$idField");
                    var datas = grid.getAttr("data");
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i] && datas[i][idField]
                            && datas[i][idField] == row[idField]) {
                            if(upFlag&&i>0){
                                datas[i] = datas[i-1];
                                datas[i-1] = row;
                            }else if(!upFlag&i<datas.length-1){
                                datas[i] = datas[i+1];
                                datas[i+1] = row;
                            }
                            break;
                        }
                    }
                    grid.setAttr("data", grid._formArr(datas));
                }
            },
            resetEditState: function (vid) {
                var grid = Page.manager.components[vid];
                grid._resetDataState();
            }
        },
        pagination: null,//分页条对象
        _idField: "_uuid",//前端唯一索引字段
        initialize: function (opts) {
            this.options.$multiSort = opts.multiSort;
            this.parent(this._formatOptions(opts));
        },
        _beforeInit: function (opts, columns) {
            if (opts.canCustomCols && opts.metaDataObj) {
                //后台取数据，更新columns显示列
                if (opts.fetchUrl) {
                    var path = document.location.pathname;
                    var contentPath = path.split("/")[1];
                    opts.fetchUrl = "/" + contentPath + "/sys/common/customPage/ymzjdz/select.do";
                }
                var metaData = opts.metaDataObj;
                var params = {};
                params.PAGEID = metaData.geFormId();//pageId
                params.COMPONENTID = opts.id || opts.$id;//componentId
                var syncRes = Page.utils.syncAjax(opts.fetchUrl, params);
                if (syncRes && syncRes.result && syncRes.result.datas
                    && syncRes.result.datas.select.rows
                    && syncRes.result.datas.select.rows.length > 0) {
                    var rowData = syncRes.result.datas.select.rows[0];
                    var setting = rowData.SETTING;
                    if (setting) {
                        try {
                            var settingObj = JSON.parse(setting);
                            if (settingObj.columns && settingObj.columns.length > 0) {
                                var settingCols = settingObj.columns;
                                if (columns && columns.length > 0) {
                                    for (var i = 0; i < columns.length; i++) {
                                        var coli = columns[i];
                                        if (coli && settingCols.contains(coli.dataField)) {
                                            coli.hidden = false;
                                        } else if (coli) {
                                            coli.hidden = true;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            return false;
                        }
                    }
                }
            }
            return columns;
        },
        render: function () {
            this.parent();
            var that = this;
            if (!this.getAttr("data") || this.getAttr("data").length < 1) {
                this.reloadData();
            } else {
                this._renderEditComp();
            }
            if (this.getAttr("$usePager")) {
                this.pagination = Page.create("pagination", {
                    $parentId: "pager_" + this.getAttr("vid"),
                    totalNum: this.getAttr("totalNum"),
                    pageIndex: this.getAttr("pageIndex"),
                    pageSize: this.getAttr("pageSize"),
                    showPageIndexInput: this.getAttr("$showPageIndexInput"),//显示跳转到某页输入框
                    showPageSizeInput: this.getAttr("$showPageSizeInput"),//显示每页条数输入框]
                    showFirstPage: this.getAttr("$showFirstPage"),//显示第一页按钮
                    showLastPage: this.getAttr("$showLastPage"),//显示最后一页按钮
                    showPreviousAndNextPage: this.getAttr("$showPreviousAndNextPage"),//显示上一页和下一页按钮
                    showPageDetail: this.getAttr("$showPageDetail"),//显示分页详情
                    showTipWhenNull: this.getAttr("$showTipWhenNull"),//无数据时显示提示信息
                    hidePagerWhenNull: this.getAttr("$hidePagerWhenNull"),
                    showPageBeforeAfterCount: this.getAttr("$showPageBeforeAfterCount"),
                    noDataTip: this.getAttr("$noDataTip"),//无数据时显示提示信息

                    pageChangeEvent: function (pager) {
                        if (that.getAttr("beforeChangePageNo")) {
                            that.getAttr("beforeChangePageNo")(pager, that);//参数为分页对象,grid对象
                        }
                        that.reloadData()// 调用dataset接口进行查询
                    },
                    totalNumChange: function (totalNum) {
                        that.setAttr("totalNum", totalNum);//参数为分页对象,grid对象
                    },
                    pageIndexChange: function (pageIndex) {
                        that.setAttr("pageIndex", pageIndex);//参数为分页对象,grid对象
                    },
                    pageSizeChange: function (pageSize) {
                        that.setAttr("pageSize", pageSize);//参数为分页对象,grid对象
                    }
                });
                this.pagination.render();
            }
            this.customColFunc = this.options.customColFunc;
        },
        reloadData: function (colName, orderType) {
            var ds = this._getDataSet();
            if (!ds) return;
            //配置分页信息
            if (this.getAttr("$usePager")) {
                ds.setAttr(Constant.pageNo, this.pagination ? this.pagination.getAttr("pageIndex") : this.getAttr("pageIndex"));
                ds.setAttr("pageNo", this.pagination ? this.pagination.getAttr("pageIndex") : this.getAttr("pageIndex"));
                ds.setAttr(Constant.pageSize, this.pagination ? this.pagination.getAttr("pageSize") : this.getAttr("pageSize"));
            }
            //配置查询条件
            var fetchParams = {};
            //===合并ds缓存的查询条件===
            var fetchParamy = ds.getAttr("fetchParam");
            if (fetchParamy) {
                jQuery.extend(fetchParams, fetchParamy);
            }
            //===新设置的查询条件===
            var columns = this.getAttr("columns");
            if (columns && columns.length > 0) {
                var orders = "";
                if (this.options.$multiSort) {
                    for (var k = 0; k < columns.length; k++) {
                        if (columns[k].orderType) {
                            if (orders != "") {
                                orders += ",";
                            }
                            orders += columns[k].orderType == "desc" ? "-" + columns[k].dataField : "+" + columns[k].dataField;
                        }
                    }
                } else if (colName && orderType) {
                    orders += (orderType == "desc" ? "-" + colName : "+" + colName);
                }
                if (orders != "") {
                    fetchParams.order = orders;
                }
            }
            ds.setAttr("fetchParam", fetchParams);

            //发送获取数据请求
            var that = this;
            Promise.all([ds.fetch()]).then(function () {
                var newDatas = ds.getValue();
                if (that.getAttr("beforeSetData")) {
                    that.getAttr("beforeSetData")(newDatas);
                }
                if (that.pagination) {
                    that.pagination.setAttr("totalNum", ds.getTotalSize());
                    that.setAttr("totalNum", that.pagination.getAttr("totalNum"), true);
                    that.setAttr("pageSize", that.pagination.getAttr("pageSize"), true);
                    that.setAttr("pageIndex", that.pagination.getAttr("pageIndex"), true);
                }
                that.setAttr("data", that._formatDatas(newDatas));
            });
        },
        /**
         * 获取勾选的行，数组
         */
        getCheckedRows: function () {
            var arr = [];
            var datas = this.getAttr('data');
            for (var i = 0; i < datas.length; i++) {
                if (datas[i]['checked']) {
                    arr.push(datas[i]);
                }
            }
            return arr;
        },
        /**
         * 获取当前激活的行，鼠标点击的行
         */
        getActiveRow: function () {
            return this.getAttr("activedRow");
        },
        /**
         * 获取当前激活的行，鼠标点击的行
         */
        getActiveRowDom: function () {
            return this.getAttr("activedRowDom");
        },
        /**
         * 获取全部数据，删除的数据没有
         * 通过dataSet获取的数据有删除的数据，状态为delete
         */
        getData: function () {
            return this.getAttr("data").$model;
        },
        /**
         * 根据索引号获取数据
         */
        getDataByIndex: function (index) {
            if (index) {
                var datas = this.getAttr("data");
                if (datas && index < datas.length && datas[index + 1]) {
                    return datas[index + 1].$model;
                }
            }
            return null;
        },
        /**
         * 选中（取消选中）某些行
         */
        checkRows: function (rows, checked) {
            if (checked == undefined) {
                checked = true;
            }
            if (rows && rows.length > 0) {
                for (var t = 0; t < rows.length; t++) {
                    var row = rows[t];
                    if (row) {
                        row.checked = checked ? checked : false;
                    }
                }
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 根据主键选中某些行
         */
        checkRowsByDataId: function (dataIds, checked) {
            if (checked == undefined) {
                checked = true;
            }
            if (dataIds && dataIds.length > 0 && this.getAttr("$idField")) {
                var idField = this.getAttr("$idField");
                var datas = this.getAttr("data");
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] && datas[i][idField]) {
                        for (var t = 0; t < dataIds.length; t++) {
                            var da = dataIds[t];
                            if (da && da == datas[i][idField]) {
                                datas[i].checked = checked ? checked : false;
                            }
                        }
                    }
                }
                this._formArr(datas);
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 新增一行数据
         */
        addRow: function (rowData, pos) {//{}则表示新增空行,pos指新增位置，表示放到第几行，默认表示最后一行
            if (!rowData) {
                rowData = {};
            }
            var datas = this.getAttr("data");
            var pSize = datas.length;
            var formatData = this._formatData(rowData);
            var ds = this._getDataSet();
            if (ds) {
                ds.addRecord(formatData);
            }
            if (pos && pos > 0 && pos < (pSize + 2)) {
                var newDataArr = [];
                if (pSize < 1) {
                    newDataArr.push(formatData);
                } else {
                    for (var t = 0; t < pSize; t++) {
                        if (t == (pos - 1)) {
                            newDataArr.push(formatData);
                            if (datas[t]) {
                                newDataArr.push(datas[t]);
                            }
                        } else if (datas[t]) {
                            newDataArr.push(datas[t]);
                        }
                    }
                }

                this.setAttr("data", newDataArr);
            } else {
                var nowData = this.getAttr("data");
                nowData.push(formatData);
                this.setAttr("data", nowData);
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 删除某行
         */
        deleteRow: function (row, real) {
            //删除行，remove掉
            var ds = this._getDataSet();
            if (ds) {
                ds.deleteRecord(row[this._idField], real);
            }
            row = null;
            var upFlag = false;
            var datas = this.getAttr("data");
            this.setAttr("data", this._formArr(datas));
            this._updateAllCheckedByDatas();
        },
        /**
         * 根据主键删除某行
         */
        deleteRowByDataId: function (dataId, real) {
            if (dataId && this.getAttr("$idField")) {
                var idField = this.getAttr("$idField");
                var datas = this.getAttr("data");
                for (var i = 0; i < datas.length; i++) {
                    if (datas[i] && datas[i][idField]
                        && datas[i][idField] == dataId) {
                        var ds = this._getDataSet();
                        if (ds) {
                            ds.deleteRecord(datas[i][this._idField], real);
                        }
                        datas[i] = null;

                    }
                }
                this.setAttr("data", this._formArr(datas));
            }
        },
        /**
         * 删除当前行
         */
        deleteActiveRow: function (real) {
            //删除行，remove掉
            var datas = this.getAttr("data");
            var acRow = this.getActiveRow();
            if (acRow) {
                for (var s = 0; s < datas.length; s++) {
                    if (datas[s] && acRow == datas[s]) {
                        var ds = this._getDataSet();
                        if (ds) {
                            ds.deleteRecord(datas[s][this._idField], real);
                        }
                        datas[s] = null;
                        this.setAttr("data", this._formArr(datas));
                        this._updateAllCheckedByDatas();
                        break;
                    }
                }
            }
        },
        /**
         * 删除选中的行
         */
        deleteCheckedRows: function (real) {
            //删除行，remove掉
            var datas = this.getAttr("data");
            var cdatas = this.getCheckedRows();
            for (var s = 0; s < datas.length; s++) {
                for (var i = 0; i < cdatas.length; i++) {
                    if (datas[s] && cdatas[i] && cdatas[i] == datas[s]) {
                        var ds = this._getDataSet();
                        if (ds) {
                            ds.deleteRecord(datas[s][this._idField], real);
                        }
                        datas[s] = null;
                    }
                }
            }
            this.setAttr("data", this._formArr(datas));
            this._updateAllCheckedByDatas();
        },
        /**
         * 批量为全部行设置数据:某列为统一的值
         */
        setAttrOfAll: function (fieldName, value) {
            if (fieldName) {
                var datas = this.getAttr("data") || [];
                for (var s = 0; s < datas.length; s++) {
                    if (datas[s]) {
                        datas[s][fieldName] = value;
                    }
                }
                this.setAttr("data", this._formArr(datas));
            }
        },
        /**
         * 批量为选择的行设置数据:某列为统一的值
         */
        setAttrOfChecedRows: function (fieldName, value) {
            if (fieldName) {
                var datas = this.getAttr("data");
                var cdatas = this.getCheckedRows();
                for (var s = 0; s < datas.length; s++) {
                    for (var i = 0; i < cdatas.length; i++) {
                        if (datas[s] && cdatas[i] && cdatas[i] == datas[s]) {
                            datas[s][fieldName] = value;
                        }
                    }
                }
                this.setAttr("data", this._formArr(datas));
            }
        },
        /**
         * 跳转到某页
         */
        goPage: function (pageNo) {
            if (pageNo) {
                this.pagination.setAttr("pageIndex", pageNo);
            }
        },
        getTemplate: function () {
            return template;
        },
        _renderEditComp: function () {
            var that = this;
            if (this.getAttr("$canEdit")) {
                var datas = this.getAttr("data").$model;
                var cols = this.getAttr("columns");
                var editCompMap = this.getAttr("editCompMap");
                var dsId = "ds_" + this.getAttr("vid");
                for (var i = 0; i < datas.length; i++) {
                    var data = datas[i];
                    if (data && data[this._idField] && data.state != 'readonly') {
                        var rowEditComps = [];
                        for (var t = 0; t < cols.length; t++) {
                            var col = cols[t];
                            if (col.dataField && col.xtype && !col.isOpColumn && !col.hidden) {
                                var fieldName = col.dataField;
                                var xtype = col.xtype || "input";
                                if (Page.manager.components['comp_' + fieldName + "_" + data[this._idField]]) {
                                    Page.manager.components['comp_' + fieldName + "_" + data[this._idField]].destroy();
                                }
                                if (that.options.$dbClickToEditRow || (that.getAttr("editFieldNow") == fieldName)) {
                                    var keyField = this._idField;
                                    (function (that, col, xtype, keyField, fieldName, data, rowEditComps) {
                                        var editParams = col.editParams ? col.editParams.$model : {};
                                        var baseParams = {
                                            $parentId: 'con_' + fieldName + "_" + data[that._idField],
                                            $id: 'comp_' + fieldName + "_" + data[that._idField],
                                            parentTpl: "inline",
                                            value: data[fieldName] || "",
                                            display: data[fieldName + "_DISPLAY"] || data[fieldName],
                                            showLabel: false,
                                            bindField: fieldName,
                                            disabledEdit: col.disabledEdit || col.readonly,
                                            validationRules: col.validationRules,
                                            showErrorMessage: true,
                                            bind: that._getDataSet() ? that._getDataValueIdByDataId(data[keyField]).getId() + "." + fieldName : null,
                                            onValueChange: function () {//针对大部分属性
                                                data[fieldName] = editField.getValue();
                                                if (editField.getDisplay) {
                                                    data[fieldName + "_DISPLAY"] = editField.getDisplay();
                                                    data.dataChanged = true;
                                                }
                                                //行背景，ms-class-simplegrid_datachange="rowdata.dataChanged"
                                                //属性背景
                                                that.getAttr("dataChangedField").push(data._uuid + fieldName);
                                            },
                                            status: "edit"
                                        };
                                        if (!col.width) {
                                            baseParams.width = "200px";
                                            $('#con_' + fieldName + "_" + data[that._idField]).css("width", "200px");
                                        }
                                        if (xtype == "combobox") {
                                            baseParams.selectedEvent = function () {//针对switch
                                                data[fieldName] = editField.getValue();
                                                if (editField.getDisplay) {
                                                    data[fieldName + "_DISPLAY"] = editField.getDisplay();
                                                }
                                            };
                                        }
                                        if (xtype == "switch") {
                                            baseParams.checked = (data[fieldName] == 1);
                                            baseParams.onValueChange = function () {//针对大部分属性
                                                data[fieldName] = editField.getValue();
                                                if (editField.getDisplay) {
                                                    data[fieldName + "_DISPLAY"] = editField.getDisplay();
                                                }
                                            },
                                                baseParams.valueChangeFunc = function () {//针对switch
                                                    data[fieldName] = editField.getValue();
                                                    if (editField.getDisplay) {
                                                        data[fieldName + "_DISPLAY"] = editField.getDisplay();
                                                        data.dataChanged = true;
                                                    }
                                                    //行背景，ms-class-simplegrid_datachange="rowdata.dataChanged"
                                                    //属性背景
                                                    that.getAttr("dataChangedField").push(data._uuid + fieldName);
                                                };
                                        }
                                        var allParams = jQuery.extend(baseParams, editParams);
                                        var editField = Page.create(xtype, allParams);

                                        editField.bindField = fieldName;
                                        //在属性中写displayChange无效，暂时用以下写法代替
                                        editField._displayChange = function () {
                                            data[fieldName] = editField.getValue();
                                        };
                                        rowEditComps.push(editField);
                                        new Promise(function () {
                                            editField.render();
                                        }).then(function () {
                                                if (xtype == "combobox") {
                                                    //dataBinder异常
                                                    editField.setAttr("display", data[fieldName + "_DISPLAY"], true);
                                                }
                                            });
                                    }(this, col, xtype, this._idField, fieldName, data, rowEditComps));
                                }
                            }
                        }
                        editCompMap[data[this._idField]] = rowEditComps;
                    } else {
                        for (var t = 0; t < cols.length; t++) {
                            var col = cols[t];
                            if (col.dataField && col.xtype && !col.isOpColumn && !col.hidden) {
                                var fieldName = col.dataField;
                                if (Page.manager.components['comp_' + fieldName + "_" + data[this._idField]]) {
                                    Page.manager.components['comp_' + fieldName + "_" + data[this._idField]].destroy();
                                }
                            }
                        }
                    }
                }
                this.widgetContainer = Page.create("widgetContainer", {
                    dataSourcesIds: this._getDataValuesByDataSet()
                });
            }
        },
        _reSetTdSpans: function () {
            if (this.options.$isMerge) {
                var columns = this.getAttr("columns").$model;
                var dataRows = this.getAttr("data").$model;
                if (columns && dataRows && dataRows.length > 0) {
                    var tdSpans = {};
                    for (var i = 0; i < dataRows.length; i++) {
                        for (var k = 0; k < columns.length; k++) {
                            tdSpans[dataRows[i]._uuid + [columns[k].dataField]] = 1;
                        }
                    }
                }
                var formerName = "";
                for (var k = 0; k < columns.length; k++) {
                    var column = columns[k];
                    var data_0 = dataRows[0];
                    var rowKey = column.dataField;
                    if (k > 0) {
                        var formerCol = columns[k - 1];
                        formerName = formerCol.dataField;
                    }
                    for (var t = 1; t < dataRows.length; t++) {
                        var dataRow = dataRows[t];
                        if (data_0[column.dataField] == dataRow[column.dataField]) {
                            if (k > 0) {
                                if (tdSpans[dataRow._uuid + formerName] == 0) {
                                    tdSpans[data_0._uuid + rowKey]++;
                                    tdSpans[dataRow._uuid + rowKey]--;
                                } else {
                                    data_0 = dataRow;
                                }
                            } else {
                                tdSpans[data_0._uuid + rowKey]++;
                                tdSpans[dataRow._uuid + rowKey]--;
                            }
                        } else {
                            data_0 = dataRow;
                        }
                    }
                }
                this.setAttr("tdSpans", tdSpans);
            }
        },
        _getDataSet: function () {
            return Page.manager.components[this.getAttr("$dataSetId")];
        },
        _getDataValuesByDataSet: function () {
            var dataValues = [];
            if (this._getDataSet()) {
                var dataSet = this._getDataSet();
                if (dataSet.getAttr("_dataArray")) {
                    var array = dataSet.getAttr("_dataArray");
                    for (var i = 0; i < array.length; i++) {
                        var value = array[i];
                        dataValues.push(value.getId());
                    }
                }
            }
            return dataValues;
        },
        _getDataValueIdByDataId: function (did) {
            var dataSet = this._getDataSet();
            if (dataSet && dataSet.getAttr("_dataMap")) {
                return dataSet.getAttr("_dataMap")[did];
            }
            return null;
        },
        _defaultEditRow: function (vm, row, rowDom) {
            var toStatus = (row.state && row.state == "readonly") ? "edit" : "readonly";
            //var editCompMap = this.getAttr("editCompMap");
            if (row.state == "readonly") {
                if (this.getAttr("$editMultiRow")) {
                    row.state = "edit";
                } else {
                    //校验，将其他编辑设置为只读,校验不通过不更改状态
                    var datas = this.getAttr("data");
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i] && datas[i][this._idField] != row[this._idField]) {
                            if (false) {//校验不通过
                                return null;//直接返回，不再进行后续逻辑
                            }
                            var otherToStatus = "readonly";
                            datas[i].state = otherToStatus;
                        }
                    }
                    row.state = "edit";
                }
            } else {
                row.state = "readonly";
            }
            this.setAttr("data", this._formArr(this.getAttr("data").$model));
        },
        //editMultiRow不生效，不允许多个组件同时编辑
        _defaultEditField: function (vm, row, fieldName, fieldXtype, tdDom) {
            if (row.state == 'edit' && fieldName == this.getAttr("editFieldNow")) {
                return;
            }
            this.setAttr("editFieldNow", fieldName);
            var toStatus = (row.state && row.state == "readonly") ? "edit" : "readonly";
            //校验，将其他编辑设置为只读,校验不通过不更改状态
            var datas = this.getAttr("data");
            for (var i = 0; i < datas.length; i++) {
                if (datas[i] && datas[i][this._idField] != row[this._idField]) {
                    if (false) {//校验不通过
                        return null;//直接返回，不再进行后续逻辑
                    }
                    var otherToStatus = "readonly";
                    datas[i].state = otherToStatus;
                }
            }
            row.state = "edit";
            this.setAttr("data", this._formArr(this.getAttr("data").$model));
            var editCompMap = this.getAttr("editCompMap");
            var editComps = editCompMap ? editCompMap[row[this._idField]] || [] : [];
            for (var t = 0; t < editComps.length; t++) {
                if (editComps[t] && editComps[t].bindField != fieldName) {
                    //editComps[t].switchStatus(otherToStatus);
                }
            }
        },
        _resetDataState: function (vm) {
            this.setAttr("editFieldNow", null);
            var toStatus = "readonly";
            //校验，将其他编辑设置为只读,校验不通过不更改状态
            var datas = this.getAttr("data");
            for (var i = 0; i < datas.length; i++) {
                datas[i].state = toStatus;
            }
            this.setAttr("data", this._formArr(this.getAttr("data").$model));
        },
        resetRowState: function (vm) {
            this.setAttr("editFieldNow", null);
            //校验，将其他编辑设置为只读,校验不通过不更改状态
            var datas = this.getAttr("data");
            for (var i = 0; i < datas.length; i++) {
                datas[i].state = "readonly";
                datas[i].dataChanged = false;
            }
            this.setAttr("data", this._formArr(this.getAttr("data").$model));
        },
        _updateAllCheckedByDatas: function () {
            var datas = this.getAttr("data");
            var all = true;
            for (var i = 0; i < datas.length; i++) {
                if (!datas[i]['checked']) {
                    all = false;
                    break;
                }
            }
            this.setAttr("allChecked", all);
        },
        _dataChange: function () {
            //this._updateAllCheckedByDatas();
            if (this.getAttr("afterSetData")) {
                this.getAttr("afterSetData")(this.getAttr("data").$model);
            }
            this._renderEditComp();
            this._reSetTdSpans();
        },
        _formatOptions: function (opts) {
            opts = opts || {};
            var d = opts.data || [];
            var columns = opts.columns || [];
            //是否合并
            if (opts.isMerge) {
                opts.canEdit = false;
            }
            if (opts.canCustomCols) {
                opts.canEdit = false;
            }
            if (!opts.customColFunc) {
                opts.customColFunc = this._defaultCustom;
            }
            //是否默认全部勾选
            if (opts.allChecked) {
                for (var i = 0; i < d.length; i++) {
                    if (d[i]) {
                        d[i].checked = true;
                        d[i].state = d[i].state ? d[i].state : 'readonly';
                        d[i].dataChanged = d[i].dataChanged || false;
                        if (!d[i][this._idField]) {
                            d[i][this._idField] = String.uniqueID();
                        }
                    }
                }
            } else {
                for (var i = 0; i < d.length; i++) {
                    if (d[i]) {
                        d[i].checked = d[i].checked || false;//未设置，默认不选中
                        d[i].state = d[i].state ? d[i].state : 'readonly';
                        d[i].dataChanged = d[i].dataChanged || false;
                        if (!d[i][this._idField]) {
                            d[i][this._idField] = String.uniqueID();
                        }
                    }
                }
            }
            if (columns && columns.length > 0) {
                for (var i = 0; i < columns.length; i++) {
                    var coli = columns[i];
                    coli.hidden = coli.hidden || false;
                }
            }
            columns = this._beforeInit(opts, columns);
            opts.columns = columns;
            opts.allColumns = this._calAllColumns(opts.columns, opts.opColumns, opts.grouping);
            //如果全部设置了像素宽度则将总宽度设置为列宽度之和
            if (opts.allColumns && opts.allColumns.length > 0 && !opts.width) {
                var widthCount = 0;
                var allColumns = opts.allColumns;
                var allPxFlag = true;
                for (var s = 0; s < allColumns.length; s++) {
                    if (allColumns[s] && allColumns[s].width && allColumns[s].width.contains("px")) {
                        try {
                            var widthStr = allColumns[s].width;
                            var widC = parseInt(widthStr.split("px")[0]);
                            widthCount += widC;
                        } catch (e) {
                            allPxFlag = false;
                            break;
                        }
                    } else {
                        allPxFlag = false;
                        break;
                    }
                }
                if (allPxFlag && widthCount > 0) {
                    opts.width = (widthCount + 40) + "px";
                }
            }
            return opts;
        },
        _columnsChange: function () {
            this.setAttr("allColumns", this._calAllColumns(this.options.columns, this.options.opColumns, this.options.grouping), true);
        },
        _calAllColumns: function (cols, opCols, grouping) {
            //列信息
            if (cols && cols.length > 0) {
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i]) {
                        var coli = cols[i];
                        if (!coli.orderType || !this.options.$multiSort) {
                            coli.orderType = "";
                        }
                        if (!coli.xtype) {
                            coli.xtype = "input";
                        }
                        if (coli.disabledEdit == undefined) {
                            coli.disabledEdit = false;
                        }
                        if (coli.showDisplay == undefined) {
                            coli.showDisplay = false;
                        }
                        if (coli.isOpColumn == undefined) {
                            coli.isOpColumn = false;
                        }
                        if (coli.sortDisabled == undefined) {
                            coli.sortDisabled = false;
                        }
                    }
                }
            }
            var allColumns = [];
            if (cols && cols.length > 0) {
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i] && !cols[i].hidden) {
                        allColumns.push(cols[i]);
                    }
                }
            }
            if (opCols && opCols.length > 0) {
                var opColumnMap = {};
                for (var t = 0; t < opCols.length; t++) {
                    if (opCols[t]) {
                        var positioni = opCols[t].position || "end";
                        if (typeof(positioni) == 'number' && positioni > (cols.length - 1)) {
                            positioni = "end";
                        }
                        if (typeof(positioni) == 'number') {
                            for (var s = 0; s < allColumns.length; s++) {
                                if (allColumns[s] && allColumns[s] == cols[positioni]) {
                                    if (cols[positioni].hidden) {
                                        positioni = positioni + 1;
                                        if (positioni > cols.length - 1) {//达到最后一个时
                                            opColumnMap['op_end'].push(opCols[t]);
                                            break;
                                        }
                                    } else {
                                        opCols[t].isOpColumn = true;
                                        allColumns = this._pushIntoArr(allColumns, opCols[t], s);
                                        break;
                                    }
                                }
                            }
                        }
                        opCols[t].title = opCols[t].title ? opCols[t].title : "操作";
                        if (!opColumnMap['op_' + positioni]) {
                            opColumnMap['op_' + positioni] = [];
                        }
                        opColumnMap['op_' + positioni].push(opCols[t]);
                    }
                }
                this.options.opColumnMap = opColumnMap;
            }
            var hasGroupTitle = false;
            if (allColumns && grouping) {
                var groupMap = [];
                if(this.options.opColumnMap&&this.options.opColumnMap['op_front']){
                    var frontGroup = {};
                    frontGroup.title = "操作";
                    frontGroup.tdSpan = this.options.opColumnMap['op_front'].length;
                    groupMap.push(frontGroup);
                }
                for (var i = 0; i < allColumns.length; i++) {
                    if (allColumns[i] && allColumns[i].groupName) {
                        hasGroupTitle = true;
                        var groupSet = this._getGroupByTitle(groupMap, allColumns[i].groupName);
                        if (groupSet) {
                            groupSet.cols.push(allColumns[i]);
                        } else {
                            var newGroup = {};
                            newGroup.title = allColumns[i].groupName;
                            newGroup.cols = [allColumns[i]];
                            groupMap.push(newGroup);
                        }
                    } else if (allColumns[i]) {
                        var groupSet = this._getGroupByTitle(groupMap, "未分组");
                        if (groupSet) {
                            groupSet.cols.push(allColumns[i]);
                        } else {
                            var newGroup = {};
                            newGroup.title = "未分组";
                            newGroup.cols = [allColumns[i]];
                            groupMap.push(newGroup);
                        }
                    }

                }
                if(this.options.opColumnMap&&this.options.opColumnMap['op_end']){
                    var endGroup = {};
                    endGroup.title = "操作";
                    endGroup.tdSpan = this.options.opColumnMap['op_end'].length;
                    groupMap.push(endGroup);
                }
                if (hasGroupTitle) {
                    var newColoumns = [];
                    for (var i = 0; i < groupMap.length; i++) {
                        if (groupMap[i] && groupMap[i].cols) {
                            groupMap[i].tdSpan = groupMap[i].cols?groupMap[i].cols.length : 0;
                            newColoumns = newColoumns.concat(groupMap[i].cols||[]);
                        }
                    }
                    allColumns = newColoumns;
                    //this.setAttr("groupTitleSpans", groupMap);
                    this.options.groupTitleSpans = groupMap;
                }
            }
            //this.setAttr("hasGroupTitle", hasGroupTitle);
            this.options.hasGroupTitle = hasGroupTitle;
            return allColumns;
        },
        _formatDatas: function (datas) {
            //是否默认全部勾选
            if (datas) {
                if (this.getAttr("allChecked")) {
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i]) {
                            datas[i].checked = true;
                            datas[i].state = datas[i].state ? datas[i].state : 'readonly';
                            if (!datas[i][this._idField]) {
                                datas[i][this._idField] = String.uniqueID();
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i]) {
                            datas[i].checked = (datas[i].checked == true || datas[i].checked == "true") ? true : false;//未设置，默认不选中
                            datas[i].state = datas[i].state ? datas[i].state : 'readonly';
                            if (!datas[i][this._idField]) {
                                datas[i][this._idField] = String.uniqueID();
                            }
                        }
                    }
                }
            }
            return datas;
        },
        _formatData: function (data) {
            //是否默认全部勾选
            if (data) {
                if (this.getAttr("allChecked")) {
                    data.checked = true;
                } else {
                    data.checked = false;//未设置，默认不选中
                }
                data.state = data.state ? data.state : 'readonly';
                //TODO widgetContainer必须wid的处理，后续会删除
                if (!data[this._idField]) {
                    data[this._idField] = String.uniqueID();
                }
            }
            return data;
        },
        _formArr: function (arr) {
            if (arr) {
                var nArr = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        nArr.push(arr[i]);
                    }
                }
                arr = nArr;
            }
            return arr;
        },
        _pushIntoArr: function (arr, ele, position) {
            if (arr && ele && position) {
                var nArr = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        if (i == position) {
                            nArr.push(ele);
                        }
                        nArr.push(arr[i]);
                    }
                }
                return nArr;
            }
            return arr;
        },
        _defaultCustom: function (objId) {
            var obj = null;
            if (objId && typeof(objId) == 'string') {
                obj = Page.manager.components[objId];
            } else {
                obj = objId;
            }
            if (obj && obj.options.$canCustomCols && obj.options.$metaDataObj) {
                var allColumns = [];
                var checkColumns = [];
                var colValues = [];
                var fixColumns = [];
                if (obj.options.columns) {
                    var cols = obj.options.columns;
                    for (var s = 0; s < cols.length; s++) {
                        var col = cols[s];
                        var colObj = {};
                        colObj.text = col.title;
                        colObj.value = col.dataField;
                        allColumns.push(colObj);
                        if (!col.hidden) {
                            checkColumns.push(colObj);
                            colValues.push(col.dataField);
                        }
                    }
                }
                var cusCols = Page.create("customColumns", {
                    items: allColumns,
                    value: colValues,
                    metaDataObj: obj.options.$metaDataObj,
                    showAllCheck: obj.options.$showCustomAllCheck,
                    fixItems: obj.options.fixedCols,
                    componentId: obj.getId(),
                    afterSave: function (cus) {
                        var checkedCols = cus.options.value;
                        if (checkedCols && obj.options.columns) {
                            var cols = obj.getAttr("columns");
                            for (var s = 0; s < cols.length; s++) {
                                var col = cols[s];
                                if (checkedCols.contains(col.dataField)) {
                                    //col.dataField;
                                    col.hidden = false;
                                } else {
                                    col.hidden = true;
                                }
                            }
                            //obj.setAttr("columns",cols);
                            obj.setAttr("allColumns", obj._calAllColumns(cols, obj.options.opColumns, obj.options.grouping), true);
                        }
                        return;
                    }
                });
                cusCols.render();
            }
        },
        _getGroupByTitle: function (groupObjs, title) {
            if (groupObjs && groupObjs.length>0) {
                for(var t=0;t<groupObjs.length;t++){
                    if(groupObjs[t]&&groupObjs[t].title==title){
                        return groupObjs[t];
                    }
                }
            }
            return null;
        }
    });
    SimpleGridWidget.xtype = xtype;
    return SimpleGridWidget;
})