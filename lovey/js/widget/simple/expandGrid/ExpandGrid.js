/**
 * Created by qianqianyi on 15/5/8.
 *
 */
define(['../../Base',"../../../data/DataConstant", 'text!./ExpandGridWidget.html', 'css!./ExpandGridWidget.css'], function (Base,Constant,template) {
    var xtype = "expandGrid";
    var ExpandGridWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            tableClass:"table table-bordered",
            columns: [],/**
                         * 列信息,每列可配置属性如下：
                         *｛title:"性别",
                         * dataField:"sex",
                         * width:"4%",
                         * showDisplay:true,//showDisplay：显示Display字段，
                         * disabledEdit:true,
                         * sortDisabled:true,
                         * xtype:"combobox",
                         * editParams:编辑组件属性
                         * isOpColumn:true,//isOpColumn，自定义显示，
                         * template:""} //template：自定义显示的内容（html，可以是avalon片段），内容中可通过avalon访问grid信息，如，rowdata，行数据，col，列模型
                         */
            data: [],    //静态数据
            dataSetId: null,    //数据集ID，设置了dataSetId则data无效
            //queryParams:null, //默认查询条件，目前不需要，请设置到ds中
            idField:"wid",  //主键属性
            canSort:true,   //是否可排序
            canExpand:true,
            showCheckbox:true,  //是否显示复选框
            multiCheck:true,//是否多选
            checkboxWidth:"10%",    //复选框宽度
            allChecked: false,  //设置为true，则默认全部选中
            //分页信息
            usePager:true,  //是否分页
            pageIndex:1,    //默认当前页
            pageSize:15,    //默认每页条数
            totalNum:0, //总数据条数
            totalPage:0,    //总页数
            showPageIndexInput: true,   //显示跳转到某页输入框
            showPageSizeInput: true,    //显示每页条数输入框]
            showFirstPage: true,    //显示第一页按钮
            showLastPage: true, //显示最后一页按钮
            showPreviousAndNextPage: true,  //显示上一页和下一页按钮
            showPageDetail: true,   //显示分页详情
            showTipWhenNull:false,//没有数据时显示分页提示
            hidePagerWhenNull:true,//没有数据时隐藏提示
            noDataTip:"暂无数据",//无数据时分页区的提示信息
            //操作列
            opColumns:[],/**操作列信息
                         * 每列配置属性{title:"操作",width:'10%',position:2,template:''}
                         * position支持值为front、end和具体数字
                         */
            //事件
            onClickRow:null,//内置参数未：vm－grid模型,rowdata－行数据,rowObj－行dom
            beforeSetData:null, //设置数据前，参数：即将设置的数据datas
            afterSetData:null,  //设置数据后，参数：已经设置的数据datas
            beforeCheckRow:null,    //勾选行事件
            afterCheckRow:null, //勾选行后事件
            beforeChangeOrder:null, //改变排序前事件
            beforeChangePageNo:null,    //改变页码前事件

            //中间参数，不可初始化
            _idField:"_uuid",
            opColumnMap:{},
            allColumns:[],
            activedRow:null,    //激活的行
            activedRowDom:null, //行编辑Dom
            allClick: function (vid, element) {
                var vm = avalon.vmodels[vid];
                if(vm&&vm.multiCheck) {
                    vm.allChecked = !vm.allChecked;
                    var datas = vm.data;
                    for (var i = 0; i < datas.length; i++) {
                        datas[i]['checked'] = vm.allChecked;
                    }
                    //vm.data = datas;
                }
            },
            activeRow:function(vid,row,rowObj){
                var vm = avalon.vmodels[vid];
                vm.activedRow = row;
                vm.activedRowDom = rowObj;
                if(vm.onClickRow){
                    vm.onClickRow(vm,row,rowObj);
                }
            },
            checkRow: function (vid,row) {
                var vm = avalon.vmodels[vid];
                var grid = Page.manager.components[vid];
                if(!vm.multiCheck&&!row.checked&&grid.getCheckedRows().length>0){
                    for (var i = 0; i < vm.data.$model.length; i++) {
                        if (vm.data[i]) {
                            vm.data[i]['checked'] = false;
                        }
                    }
                }
                if(vm.beforeCheckRow&&row.checked){
                    vm.beforeCheckRow(row);//选中后事件
                }
                row.checked = !row.checked;
                if(vm.afterCheckRow&&row.checked){
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
            sortByCol:function(vid,col,orderType){
                if(orderType&&orderType=="unsort"){
                    orderType = null;
                }
                var vm = avalon.vmodels[vid];
                var cols = vm.columns;
                for(var s=0;s<cols.length;s++){
                    if(cols[s]==col||cols[s].dataField==col.dataField){
                        cols[s].orderType = orderType;
                    }
                }
                col.orderType = orderType;
                if(vm.beforeChangeOrder){
                    vm.beforeChangeOrder(vm,col,orderType);
                }else{
                    var grid = Page.manager.components[vid];
                    grid.reloadData();// 调用dataset接口进行查询
                }
            },
            getColTemplate:function(vid,row,col){
                var vm = avalon.vmodels[vid];
                if(col.template){
                    return col.template;
                }else if(col.templateGenerator&&vm[col.templateGenerator]){
                    return vm[col.templateGenerator](row,col);
                }
            },
            editRow:function(vid,row,rowDom){
                var vm = avalon.vmodels[vid];
                if(vm.editRowFunc){
                    vm.editRowFunc(vm,row,rowDom);
                }else{
                    var grid = Page.manager.components[vid];
                    grid._defaultEditRow(vm,row,rowDom);
                }
            },
            editField:function(vid,row,fieldName,fieldXtype,tdDom){
                var vm = avalon.vmodels[vid];
                if(vm.editFieldFunc){
                    vm.editFieldFunc(vm,row,fieldName,fieldXtype,tdDom);
                }else{
                    var grid = Page.manager.components[vid];
                    grid._defaultEditField(vm,row,fieldName,fieldXtype,tdDom);
                }
            },
            deleteRow: function (vid,row,real) {
                //删除行，remove掉
                var vm = avalon.vmodels[vid];
                var grid = Page.manager.components[vid];
                if(grid){
                    grid.deleteRow(row,real);
                }
            }
        },
        pagination:null,//分页条对象
        initialize: function (opts) {
            this.parent(this._formatOptions(opts));
        },
        render:function(){
            this.parent();
            var that = this;
            if(this.getAttr("usePager")){
                this.pagination = Page.create("pagination", {
                    $parentId: "pager_" + this.getAttr("vid"),
                    totalNum: this.getAttr("totalNum"),
                    pageIndex:this.getAttr("pageIndex"),
                    pageSize: this.getAttr("pageSize"),
                    showPageIndexInput: this.getAttr("showPageIndexInput"),//显示跳转到某页输入框
                    showPageSizeInput: this.getAttr("showPageSizeInput"),//显示每页条数输入框]
                    showFirstPage: this.getAttr("showFirstPage"),//显示第一页按钮
                    showLastPage: this.getAttr("showLastPage"),//显示最后一页按钮
                    showPreviousAndNextPage: this.getAttr("showPreviousAndNextPage"),//显示上一页和下一页按钮
                    showPageDetail: this.getAttr("showPageDetail"),//显示分页详情
                    showTipWhenNull: this.getAttr("showTipWhenNull"),//无数据时显示提示信息
                    hidePagerWhenNull:this.getAttr("hidePagerWhenNull"),
                    noDataTip: this.getAttr("noDataTip"),//无数据时显示提示信息

                    pageChangeEvent: function (pager) {
                        if(that.getAttr("beforeChangePageNo")){
                            that.getAttr("beforeChangePageNo")(pager,that);//参数为分页对象,grid对象
                        }
                        that.reloadData()// 调用dataset接口进行查询
                    },
                    //TODO 以下未生效
                    totalNumChange:function(totalNum){
                        that.setAttr("totalNum",totalNum);//参数为分页对象,grid对象
                    },
                    pageIndexChange:function(pageIndex){
                        that.setAttr("pageIndex",pageIndex);//参数为分页对象,grid对象
                    },
                    pageSizeChange:function(pageSize){
                        that.setAttr("pageSize",pageSize);//参数为分页对象,grid对象
                    }
                });
                this.pagination.render();
            }
            if(!this.getAttr("data")||this.getAttr("data").length<1){
                this.reloadData();
            }

        },
        reloadData:function(){
            var ds = this._getDataSet();
            if(!ds) return;
            //配置分页信息
            if(this.getAttr("usePager")){
                ds.setAttr(Constant.pageNo,this.pagination?this.pagination.getAttr("pageIndex"):this.getAttr("pageIndex"));
                //到底叫什么名字？待删除
                ds.setAttr("pageNo",this.pagination?this.pagination.getAttr("pageIndex"):this.getAttr("pageIndex"));
                ds.setAttr(Constant.pageSize,this.pagination?this.pagination.getAttr("pageSize"):this.getAttr("pageSize"));
            }
            //配置查询条件
            var fetchParams = {};
            //===合并ds缓存的查询条件===
            var fetchParamy = ds.getAttr("fetchParam");
            if(fetchParamy) {
                jQuery.extend(fetchParams, fetchParamy);
            }
            //===新设置的查询条件===
            var columns = this.getAttr("columns");
            if(columns&&columns.length>0){
                var orders = "";
                for(var k=0;k<columns.length;k++){
                    if(columns[k].orderType){
                        if(orders!=""){
                            orders += ",";
                        }
                        orders += columns[k].orderType=="desc"?"-"+columns[k].dataField:"+"+columns[k].dataField;
                    }
                }
                if(orders!=""){
                    fetchParams.order = orders;
                }
            }
            ds.setAttr("fetchParam",fetchParams);

            //发送获取数据请求
            var that = this;
            Promise.all([ds.fetch()]).then(function() {
                var newDatas = ds.getValue();
                if(that.getAttr("beforeSetData")){
                    that.getAttr("beforeSetData")(newDatas);
                }
                if(that.pagination){
                    that.pagination.setAttr("totalNum",ds.getTotalSize());
                    //that.pagination.setAttr("pageSize",ds.getPageSize());
                    //that.pagination.setAttr("pageIndex",ds.getPageNo());

                    that.setAttr("totalNum",that.pagination.getAttr("totalNum"),true);
                    that.setAttr("pageSize",that.pagination.getAttr("pageSize"),true);
                    that.setAttr("pageIndex",that.pagination.getAttr("pageIndex"),true);
                }
                that.setAttr("data",that._formatDatas(newDatas));
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
        getActiveRow:function(){
            return this.getAttr("activedRow");
        },
        getActiveRowDom:function(){
            return this.getAttr("activedRowDom");
        },
        getData:function(){
            return this.getAttr("data").$model;
        },
        /**
         * 选中某些行
         */
        checkRows: function (rows,checked) {
            if(checked==undefined){
                checked = true;
            }
            if(rows&&rows.length>0){
                for(var t=0;t<rows.length;t++){
                    var row = rows[t];
                    if(row){
                        row.checked = checked?checked:false;
                    }
                }
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 根据主键选中某些行
         */
        checkRowsByDataId: function (dataIds,checked) {
            if(checked==undefined){
                checked = true;
            }
            if(dataIds&&dataIds.length>0&&this.getAttr("idField")){
                var idField = this.getAttr("idField");
                var datas = this.getAttr("data");
                for (var i = 0; i < datas.length; i++) {
                    if(datas[i]&&datas[i][idField]){
                        for(var t=0;t<dataIds.length;t++){
                            var da = dataIds[t];
                            if(da&&da==datas[i][idField]){
                                datas[i].checked = checked?checked:false;
                            }
                        }
                    }
                }
                this._formArr(datas);
                //this.setAttr("data",this._formArr(datas));
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 新增一行数据
         */
        addRow:function(rowData,pos){//{}则表示新增空行,pos指新增位置，表示放到第几行，默认表示最后一行
            var datas = this.getAttr("data");
            var pSize = datas.length;
            var formatData = this._formatData(rowData);
            var ds = this._getDataSet();
            if(ds){
                ds.addRecord(formatData);
            }
            if(pos&&pos>0&&pos<(pSize+2)){
                var newDataArr = [];
                if(pSize<1){
                    newDataArr.push();
                }else{
                    for(var t=0;t<pSize;t++){
                        if(t==(pos-1)){
                            newDataArr.push(formatData);
                            if(datas[t]){
                                newDataArr.push(datas[t]);
                            }
                        }else if(datas[t]){
                            newDataArr.push(datas[t]);
                        }
                    }
                }

                this.setAttr("data",newDataArr);
            }else{
                this.getAttr("data").push(formatData);
            }
            this._updateAllCheckedByDatas();
        },
        /**
         * 删除某行
         */
        deleteRow: function (row,real) {
            //删除行，remove掉
            var ds = this._getDataSet();
            if(ds){
                ds.deleteRecord(row[this.options._idField],real);
            }
            row = null;
            var upFlag = false;
            var datas = this.getAttr("data");
            this.setAttr("data",this._formArr(datas));
            this._updateAllCheckedByDatas();
        },
        /**
         * 根据主键删除某行
         */
        deleteRowByDataId: function (dataId,real) {
            if(dataId&&this.getAttr("idField")){
                var idField = this.getAttr("idField");
                var datas = this.getAttr("data");
                for (var i = 0; i < datas.length; i++) {
                    if(datas[i]&&datas[i][idField]
                    &&datas[i][idField]==dataId){
                        var ds = this._getDataSet();
                        if(ds){
                            ds.deleteRecord(datas[i][this.options._idField],real);
                        }
                        datas[i] = null;

                    }
                }
                this._formArr(datas);
                //this.setAttr("data",this._formArr(datas));
            }
            //this._updateAllCheckedByDatas();
        },
        /**
         * 删除当前行
         */
        deleteActiveRow: function (real) {
            //删除行，remove掉
            var datas = this.getAttr("data");
            var acRow = this.getActiveRow();
            if(acRow){
                for(var s=0;s<datas.length;s++){
                    if(datas[s]&&acRow==datas[s]){
                        var ds = this._getDataSet();
                        if(ds){
                            ds.deleteRecord(datas[s][this.options._idField],real);
                        }
                        datas[s] = null;
                        this.setAttr("data",this._formArr(datas));
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
            for(var s=0;s<datas.length;s++){
                for (var i = 0; i < cdatas.length; i++) {
                    if(datas[s]&&cdatas[i]&&cdatas[i]==datas[s]){
                        var ds = this._getDataSet();
                        if(ds){
                            ds.deleteRecord(datas[s][this.options._idField],real);
                        }
                        datas[s] = null;
                    }
                }
            }
            this.setAttr("data",this._formArr(datas));
            this._updateAllCheckedByDatas();
        },
        /**
         * 跳转到某页
         */
        goPage: function(pageNo) {
            if(pageNo){
                this.pagination.setAttr("pageIndex",pageNo);
            }
        },
        getTemplate: function () {
            return template;
        },

        _getDataSet: function() {
            return Page.manager.components[this.getAttr("dataSetId")];
        },
        _getDataValuesByDataSet:function(){
            var dataValues = [];
            if(this._getDataSet()){
                var dataSet = this._getDataSet();
                if(dataSet.getAttr("_dataArray")){
                    var array = dataSet.getAttr("_dataArray");
                    for (var i = 0; i < array.length; i++) {
                        var value = array[i];
                        dataValues.push(value.getId());
                    }
                }
            }
            return dataValues;
        },
        _getDataValueIdByDataId:function(did){
            var dataSet = this._getDataSet();
            if(dataSet.getAttr("_dataMap")){
                return dataSet.getAttr("_dataMap")[did];
            }
            return null;
        },
        _updateAllCheckedByDatas:function(){
            var datas = this.getAttr("data");
            var all = true;
            for (var i = 0; i < datas.length; i++) {
                if (!datas[i]['checked']) {
                    all = false;
                    break;
                }
            }
            this.setAttr("allChecked",all);
        },
        _dataChange:function(){
            //this._updateAllCheckedByDatas();
            if(this.getAttr("afterSetData")){
                this.getAttr("afterSetData")(this.getAttr("data").$model);
            }
        },
        _formatOptions:function(opts){
            var d = opts.data||[];
            //是否默认全部勾选
            if(opts.allChecked){
                for (var i = 0; i < d.length; i++) {
                    if (d[i]) {
                        d[i].checked = true;
                        d[i].state = d[i].state?d[i].state:'readonly';
                        if(!d[i][this.options._idField]){
                            d[i][this.options._idField] = String.uniqueID();
                        }
                        if(this.getAttr("canExpand")){
                            if(!d[i]._customDetailShow){
                                d[i]._customDetailShow = false;
                            }
                            if(!d[i]._customDetail){
                                d[i]._customDetail = "";
                            }
                        }
                    }
                }
            }else{
                for (var i = 0; i < d.length; i++) {
                    if (d[i].checked == undefined) {
                        d[i].checked = false;//未设置，默认不选中
                        d[i].state = d[i].state?d[i].state:'readonly';
                        if(!d[i][this.options._idField]){
                            d[i][this.options._idField] = String.uniqueID();
                        }
                        if(this.getAttr("canExpand")){
                            if(!d[i]._customDetailShow){
                                d[i]._customDetailShow = false;
                            }
                            if(!d[i]._customDetail){
                                d[i]._customDetail = "";
                            }
                        }
                    }
                }
            }
            //列信息
            var cols = opts.columns;
            if(cols&&cols.length>0){
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i]) {
                        var coli = cols[i];
                        if(!coli.orderType){
                            coli.orderType = "";
                        }
                        if(!coli.xtype){
                            coli.xtype = "input";
                        }
                        if(coli.disabledEdit==undefined){
                            coli.disabledEdit = false;
                        }
                        if(coli.showDisplay==undefined){
                            coli.showDisplay = false;
                        }
                        if(coli.isOpColumn==undefined){
                            coli.isOpColumn = false;
                        }
                        if(coli.sortDisabled==undefined){
                            coli.sortDisabled = false;
                        }
                    }
                }
            }
            var allColumns = [];
            if(cols&&cols.length>0) {
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i]&&!cols[i].hidden) {
                        allColumns.push(cols[i]);
                    }
                }
            }
            var opCols = opts.opColumns;
            if(opCols&&opCols.length>0){
                var opColumnMap = {};
                for(var t=0;t<opCols.length;t++){
                    if(opCols[t]){
                        var positioni = opCols[t].position||"end";
                        if(typeof(positioni)=='number'&&positioni>(cols.length-1)){
                            positioni = "end";
                        }
                        if(typeof(positioni)=='number'){
                            for(var s=0;s<allColumns.length;s++){
                                if(allColumns[s]&&allColumns[s]==cols[positioni]){
                                    if(cols[positioni].hidden){
                                        positioni = positioni +1;
                                        if(positioni>cols.length-1){//达到最后一个时
                                            opColumnMap['op_end'].push(opCols[t]);
                                            break;
                                        }
                                    }else{
                                        opCols[t].isOpColumn = true;
                                        allColumns = this._pushIntoArr(allColumns,opCols[t],s);
                                        break;
                                    }
                                }
                            }
                        }
                        opCols[t].title = opCols[t].title?opCols[t].title:"操作";
                        if(!opColumnMap['op_'+positioni]){
                            opColumnMap['op_'+positioni] = [];
                        }
                        opColumnMap['op_'+positioni].push(opCols[t]);
                    }
                }
                opts.opColumnMap = opColumnMap;
            }
            opts.allColumns = allColumns;
            return opts;
        },
        _formatDatas:function(datas){
            //是否默认全部勾选
            if(datas){
                if(this.getAttr("allChecked")){
                    for (var i = 0; i < datas.length; i++) {
                        if (datas[i]) {
                            datas[i].checked = true;
                            datas[i].state = datas[i].state?datas[i].state:'readonly';
                            if(!datas[i][this.options._idField]){
                                datas[i][this.options._idField] = String.uniqueID();
                            }
                            if(this.getAttr("canExpand")){
                                if(!datas[i]._customDetailShow){
                                    datas[i]._customDetailShow = false;
                                }
                                if(!datas[i]._customDetail){
                                    datas[i]._customDetail = "";
                                }
                            }
                        }
                    }
                }else{
                    for (var i = 0; i < datas.length; i++) {
                        if(datas[i]){
                            datas[i].checked = (datas[i].checked==true||datas[i].checked=="true")?true:false;//未设置，默认不选中
                            datas[i].state = datas[i].state?datas[i].state:'readonly';
                            if(!datas[i][this.options._idField]){
                                datas[i][this.options._idField] = String.uniqueID();
                            }
                            if(this.getAttr("canExpand")){
                                if(!datas[i]._customDetailShow){
                                    datas[i]._customDetailShow = false;
                                }
                                if(!datas[i]._customDetail){
                                    datas[i]._customDetail = "";
                                }
                            }
                        }
                    }
                }
            }
            return datas;
        },
        _formatData:function(data){
            //是否默认全部勾选
            if(data){
                if(this.getAttr("allChecked")){
                    data.checked = true;
                }else{
                    data.checked = false;//未设置，默认不选中
                }
                data.state = data.state?data.state:'readonly';
                //TODO widgetContainer必须wid的处理，后续会删除
                if(!data[this.options._idField]){
                    data[this.options._idField] = String.uniqueID();
                }
                if(this.getAttr("canExpand")){
                    if(!data._customDetailShow){
                        data._customDetailShow = false;
                    }
                    if(!data._customDetail){
                        data._customDetail = "";
                    }
                }
            }
            return data;
        },
        _formArr:function(arr){
            if(arr){
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
        _pushIntoArr:function(arr,ele,position){
            if(arr&&ele&&position){
                var nArr = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        if(i==position){
                            nArr.push(ele);
                        }
                        nArr.push(arr[i]);
                    }
                }
                return nArr;
            }
            return arr;
        }
    });
    ExpandGridWidget.xtype = xtype;
    return ExpandGridWidget;
})