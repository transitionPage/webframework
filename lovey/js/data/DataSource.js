/**
 * Created by qianqianyi on 15/5/12.
 *
 * define dataSet or dataValue' id & remote service address
 *
 * options:
 *  auto sync
 * methods:
 *  fetch
 *  sync
 */
define(["./DataConstant"], function (Constant) {
    var DataSource = new Class({
        isAutoSync: function () {
            return this.options.autoSync;
        },
        _valueChanged: function () {
            if (this.isAutoSync()) {
                window.console.log("auto sync.");
                this.sync();
            }
        },

        getFetchParam: function () {
            var other = this._otherFetchParam();
            var fp = this.options.fetchParam
            if (other) {
                Object.merge(fp, other);
            }
            return fp;
        },

        getSyncParam: function (filterNotModify) {
            var p = {};
            var value = this.getUploadValue(filterNotModify);
            Object.merge(p, {data: value});
            Object.merge(p, this.options.syncParam);
            return p;
        },

        fetch: function () {
            var $this = this;
            return new Promise(function (resolve) {
                $this.fireEvent("beforeFetch");
                var params = $this.getFetchParam();
                if(!$this.options.fetchUrl) {
                    $this._initData();
                    resolve();
                }else {
                    PageMgr.utils.ajax($this.options.fetchUrl, params, function (data) {
                        var result = data.result;

                        ///***************wrap for emp start *****************************
                        result = result[Constant.data];
                        if ($this.options.model.mainAlias && $this.options.model.mainAlias != '') {
                            if (result[$this.options.model.mainAlias]) {
                                result = result[$this.options.model.mainAlias];
                            }
                        }
                        if ($this.options.model.childAlias && $this.options.model.childAlias.length > 0) {
                            for (var i = 0; i < $this.options.model.childAlias.length; i++) {
                                var calias = $this.options.model.childAlias[i];
                                result[calias] = ((data.result)[Constant.data])[calias];
                            }
                        }
                        ///***************wrap for emp end *****************************

                        if ("dataSet" === $this.options.$xtype) {
                            $this.options.data = result[Constant.rows];
                            $this.options.pageSize = result[Constant.pageSize];
                            $this.options.pageNo = result[Constant.pageNo];
                            $this.options.totalSize = result[Constant.totalSize];
                        }
                        else {
                            $this.options.data = result;
                        }
                        $this.fireEvent("afterUpdateRecord", [$this.options.data, true]);
                        $this._initData();
                        if ($this.setStatus) {
                            $this.setStatus($this.options.model.notModify);
                        }
                        resolve();
                    }, null);
                }
            });

        },
        sync: function (filterNotModify, uploadString) {
            var $this = this;
            return new Promise(function (resolve,error) {
                var params = $this.getSyncParam(filterNotModify);
                //if (uploadString) {
                //    params.data = JSON.stringify(params.data);
                //}

                if("dataSet" === $this.options.$xtype) {
                    //数据格式为： {操作数据集名称：JSON.stringify([]), $jsonType: 1}
                    if(!$this.options.model.operationId) {
                        throw new error("数据源没有设置操作集Id，无法进行同步操作！");
                    }
                    var val = {$jsonType: 1};
                    val[$this.options.model.operationId] = JSON.stringify(params.data);    //operationId不能为data啊！
                    avalon.mix(val, params);
                    delete val.data;
                    params = val;
                }
                else {
                    if(params) {
                        avalon.mix(params, params.data);
                        delete params.data;
                    }

                }

                PageMgr.utils.ajax($this.options.syncUrl, params, function (data) {
                    //TODO reset $status$ 返回ID ??
                    $this._initData(true);
                    resolve(data);

                }, function(){
                    error();
                });
            });
        },
        getAttr: function (key) {
            return this.options[key];
        },
        setAttr: function (key, value) {
            var oldValue = this.options[key];
            this.options[key] = value;
            var privateMethod2Invoke = '_' + key + "Change";
            if (this[privateMethod2Invoke]) {
                // old value, new value, vm.model
                this[privateMethod2Invoke](value, oldValue);
            }
            this.fireEvent(key + "Change", [value, oldValue]);
            return this;
        },
        destroy: function () {
            PageMgr.manager.remove(this.getId());
        }
    });
    return DataSource;
});