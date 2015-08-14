/**
 * Created by qianqianyi on 15/5/7.
 * 获取数据
 *     url | data
 *     list
 *        fields, orders, filters, page
 *     one
 *        fields
 *     parameter
 * 处理数据
 *     if has model -> to map model
 *     扩展：计算属性 TODO
 *
 * 返回数据
 *     过滤过，扩展过的数据
 *
 *  哪些组件会用DataSource 例如：grid, form, charts, combobox, tree etc..
 *  可以被扩展
 */
define(["./DataConstant", "./DataSource", "./DataValue"], function (Constant, DataSource, DataValue) {

    var xtype = "dataSet";
    var DataSet = new Class({
        Implements: [Events, Options, DataSource],
        options: {
            $id: "",
            $xtype: xtype,
            data: [],//[{wid:'1',name:''},{wid:'2',name:''}]
            _dataMap: {},
            _dataArray: [],
            fetchUrl: '',
            fetchParam: {},// pageSize, pageNo
            syncUrl: '',
            syncParam: {},
            autoSync: false,
            pageSize: 20,
            pageNo: 1,
            totalSize: -1,
            model: {
                id: '_uuid',
                mainAlias: '',
                operationId: null,
                status: Constant.status,
                notModify: Constant.notModify,
                add: Constant.add,
                update: Constant.update,
                remove: Constant.remove
            }
        },
        Page:null,
        mix$: function (opts) {
            var result = {};
            for (var o in opts) {
                if (o.slice(0, 1) != '$') {
                    if (this.options["$" + o] === undefined) {
                        result[o] = opts[o];
                    } else {
                        result["$" + o] = opts[o];
                    }
                } else {
                    result[o] = opts[o];
                }
            }
            return result;
        },

        initialize: function (opts) {
            PageMgr.classMap["dataValue"] = DataValue;
            this.Page = new PageMgr();
            opts = this.mix$(opts);
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            this._initData();

        },
        _formatDatas:function(data){
            if(data&&data.length>0){
                for (var i = 0; i < data.length; i++) {
                    this._formatData(data[i]);
                }
            }
            return data;
        },
        _formatData:function(data){
            if(data&&!data[this.options.model.id]){
                data[this.options.model.id] = String.uniqueID();
            }
            return data;
        },
        _otherFetchParam: function () {
            var page = {};
            page[Constant.pageNo] = this.options.pageNo;
            page[Constant.pageSize] = this.options.pageSize;
            //page[Constant.totalSize] = this.options.totalSize;
            return page;
        },

        _initData: function () {
            this._formatDatas(this.options.data);
            this.options._dataMap = {};
            this.options._dataArray = [];
            var $this = this;
            if (this.options.data && this.options.data.length > 0) {
                for (var i = 0; i < this.options.data.length; i++) {
                    var d = this.options.data[i];
                    var dv = this.Page.create("dataValue",{
                        data: d,
                        model: $this.options.model
                    });
                    this.options._dataMap[d[this.options.model.id]] = dv;
                    this.options._dataArray.push(dv);
                }
            }
        },

        getValue: function () {
            var o = [];
            var array = this.options._dataArray;
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                o.push(value.getValue());
            }
            return o;
        },

        getUploadValue: function (filterNotModify) {
            var o = [];
            var array = this.options._dataArray;
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                if (filterNotModify) {
                    if (value.options.data[this.options.model.status] == this.options.model.notModify) {

                    } else {
                        o.push(value.getUploadValue(filterNotModify));
                    }
                } else {
                    o.push(value.getUploadValue(filterNotModify));
                }
            }
            return o;
        },
        setData: function (data) {
            this.options.data = this._formatDatas(data);
            this._initData();
        },
        getModifiedValue: function () {
            var o = [];
            var array = this.options._dataArray;
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                if (value[this.options.model.notModify]) {
                    continue;
                }
                o.push(value.getModifiedValue());
            }
            return o;
        },
        getModifiedRows: function () {
            var o = [];
            var array = this.getValue();
            for (var i = 0; i < array.length; i++) {
                var value = array[i];
                if (value[this.options.model.status]==this.options.model.notModify) {
                    continue;
                }
                o.push(value);
            }
            return o;
        },
        getId: function () {
            return this.options.$id;
        },

        at: function (index) {
            return this.options._dataArray[index];
        },

        getPageNo: function () {
            return this.options.pageNo;
        },
        getPageSize: function () {
            return this.options.pageSize;
        },
        getTotalSize: function () {
            return this.options.totalSize;
        },

        readRecord: function (id) {
            if (id == undefined) {
                return this.options._dataArray;
            } else {
                return this.options._dataMap[id];
            }
        },
        /**
         *
         * @param id
         * @param real 是否真实删除
         */
        deleteRecord: function (id, real) {
            if (id) {
                var r = this.readRecord(id);
                if (r) {
                    var status = r.options.data[this.options.model.status];
                    this.fireEvent("beforeDeleteRecord", [r]);

                    if (status == this.options.model.add || real) {
                        //real delete
                        this.options._dataArray.erase(r);
                        delete this.options._dataMap[id];
                    } else {
                        r.changeStatus(this.options.model.remove);
                    }

                    this.fireEvent("afterDeleteRecord", [r]);
                    this._valueChanged();
                }
            } else {
                window.console.log("没有找到指定ID的纪录.");
            }
        },
        addRecord: function (record) {
            this._formatData(record);
            var vid = this.options.model.id;
            if (!vid) {
                //error
                window.console.log("纪录没有指定ID.");
                return;
            }
            var rid = record[this.options.model.id];
            //if (rid) {
            this.fireEvent("beforeAddRecord", [record]);
            if(record[this.options.model.status]) {

            }else {
                record[this.options.model.status] = this.options.model.add;
            }
            var dv = this.Page.create("dataValue",{
                data: record
            });
            this.options._dataMap[rid] = dv;
            this.options._dataArray.push(dv);
            this.options.data.push(record);
            this.fireEvent("afterAddRecord", [record]);
            this._valueChanged();
            //} else {
            //    window.console.log("纪录没有指定ID.");
            //}
        },
        updateRecord: function (record, notFireEvent) {
            var vid = this.options.model.id;
            if (!vid) {
                //error
                window.console.log("纪录没有指定ID.");
                return;
            }
            if (typeOf(record) == 'array') {
                var flag = false;
                for (var i = 0; i < record.length; i++) {
                    var re = record[i];
                    var r = this.readRecord(re[vid]);
                    if (r) {
                        r.updateRecord(re);
                        flag = true;
                    }
                }
                if (flag) {
                    this._valueChanged();
                }
            } else {
                //object
                var r = this.readRecord(record[vid]);
                if (r) {
                    r.updateRecord(record);
                    this._valueChanged();
                }
            }
        }
    });
    DataSet.xtype = xtype;
    return DataSet;
});