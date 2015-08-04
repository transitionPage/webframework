/**
 * 数据集的操作类
 */
define(['./widget/Base'], function (Base) {
    var xtype = "metadata";
    var Metadata = new Class({
        Extends: Base,
        options: {
            setting:{}
        },
        hiddencount : 0,
        getModels: function() {
            return this.options.setting.result.models;
        },

        getDatas : function() {
            return this.options.setting.result.datas;
        },

        /**
         * 获取子系统的ID号
         */
        getSys : function() {
            return this.options.setting.sys;
        },

        /**
         * 获取模块的ID号
         */
        getModule : function() {
            return this.options.setting.module;
        },



        /**
         * 获取页面的ID号
         */
        getPage : function() {
            return this.options.setting.page;
        },

        /**
         * 获取一个查询集的系统唯一ID号
         * @param id
         */
        geCustomSearchId : function(id) {
            if (typeof(id) != "undefined") {
                return this.getSys() + "_" + this.getModule() + "_" + this.getPage() + "_" + id;
            } else {
                return this.getSys() + "_" + this.getModule() + "_" + this.getPage() + "_";
            }
        },

        /**
         * 获取自定义查询的条件定义
         * @param model
         */
        getCustomSearchControls : function(model, callback) {
        	var newcolumns = [];
        	var columns = this.getMetaColumns(model);
        	for(var i = 0; i < columns.length; i ++){
        		var column = columns[i];
        		if (typeof(column['builderList']) == "undefined") {
                    column['builderList'] = "cbl_Other";
                }
                if (typeof(column['filterName']) == "undefined") {
                    column['filterName'] = column['name'];
                }
                if (typeof(column['bindField']) == "undefined") {
                    column['bindField'] = column['name'];
                }
                if (column['name'] == "WID") {
                    column['hidden'] = true;
                }
                if(column['typeSize']){//length
                	column['oracleLength'] = column['typeSize'];
                	column['length'] = column['typeSize'];
                }
                var url = column['url'];
                if (typeof(url) != "undefined") {
                    column["textField"] = "name";
                    column["valueField"]  = "id";
                    column["mainAlias"]  = "code";
                }
                if(callback){
                    callback(column);
                }
                newcolumns.push(column);
        	}
        	return newcolumns;
        },

        /**
         * 获取自定义查询的条件范围定义
         * @param model
         */
        getCustomSearchBuilderLists : function(model) {
            var builderLists = model.builderLists;      //
            if (typeof(builderLists) == "undefined") {
                builderLists = {};
            }
            if (typeof(builderLists['cbl_Other']) == "undefined") {
                var cboOther = [];
                cboOther.push({"name":"equal","caption":"等于"});
                cboOther.push({"name":"notEqual","caption":"不等于"});
                cboOther.push({"name":"more","caption":"大于"});
                cboOther.push({"name":"less","caption":"小于"});
                cboOther.push({"name":"moreEqual","caption":"大于等于"});
                cboOther.push({"name":"lessEqual","caption":"小于等于"});
                builderLists['cbl_Other'] = cboOther;
            }
            return builderLists;
        },

        /**
         * 根据id获取模型的定义，含有的属性
         * name
         * id
         * xtype
         * caption
         * url
         */
        getModel : function(id) {
            var models = this.options.setting.result.models;
            for (var i = 0; i < models.length; i ++) {
                var model = models[i];
                if (id == model.id) {
                    return  model;
                }
            }
            return undefined;
        },
        /**
         * 根据模型获取simpleGrid使用的columns定义
         */
        getSimpleGridColumns : function(model, callback) {
        	var newcolumns = [];
        	var gcolomns = this.getMetaColumns(model);
            var columnsum = gcolomns.length - this.hiddencount;
            var width = 100/columnsum;
        	for(var i = 0; i < gcolomns.length; i ++){
        		var column = gcolomns[i];
        		var editParams = {};
        		for (var attr in column) {
            		editParams[attr] = column[attr];
                }
        		editParams["id"] = undefined;
        		var url = column['url'];
                if (typeof(url) != "undefined") {
                	editParams["textField"] = "name";
                	editParams["valueField"]  = "id";
                	editParams["mainAlias"]  = "code";
                }
                column["editParams"] = editParams;
                column["width"] = width + "%";
                if(callback){
                    callback(column);
                }
                newcolumns.push(column);
        	}
            return gcolomns;
        },
        /**
         * 获取某个数据集的元数据定义，含有的属性
         * name
         * id
         * xtype
         * callback(column)
         */
        getMetaColumns : function(model, callback) {
            var controls = model.controls;
            var columns = new Array();
            this.hiddencount = 0;
            for (var i = 0; i < controls.length; i ++) {
                var control = controls[i];
                var column = {};
                for (var attr in control) {
                    column[attr] = control[attr];
                }
                if (typeof(control['title']) != "undefined") {   //多条和单条，返回的元信息不一样。
                    column['title'] = control['title'];
                } else {
                    column['title'] = control['label'];
                }
                column['label'] = column['title'];
                column['dataField'] = control['name'];     //

                var xtype = this.getChangeXtype(control['xtype']);
                column['xtype'] = xtype;
                column['$xtype'] = xtype;

                if (xtype == "combobox" || xtype == "checkbox" || xtype == "radio") {
                    column['showDisplay'] = true;
                }
                
                
                if (typeof(callback) != "undefined") {
                    callback(column);
                }

                if(column['hidden'] == true){
                    this.hiddencount ++;
                }

                columns.push(column);
            }
            return columns;
        },
        /**
         * 获取某个数据集中一列的元数据定义，含有的性性
         * name
         * id
         * callback(column)
         * bindField
         * label
         * xtype
         * hidden：true/false
         * format：yyyy-MM-dd
         */
        getMetaColumn : function(model, name, callback) {
        	
            var columns = this.getMetaColumns(model);
            for (var i = 0; i < columns.length; i ++) {
                var column = columns[i];
                if(callback){
                	callback(column);
                }
                if (name == column['name']) {
                    return column;
                }
            }
            return undefined;
        },

        getChangeXtype : function(xtype) {
            if (xtype == "inputItem") {
                return "input";
            } else if (xtype == "comboBoxItem") {
                return "combobox";
            } else if (xtype == "textareaItem") {
                return "textarea";
            } else if (xtype == "dateEditorItem") {
                return "datepicker";
            } else if (xtype == "checkBox") {
                return "checkbox";
            } else if (xtype == "radioBox") {
                return "radio";
            } else if (typeof(xtype) == "undefined") {
                return "input";
            }
            return xtype;
        },
        /**
         * 根据id获取一个工具条，含有的属性：
         * id
         * xtype
         */
        getToolBar : function(id) {
            var toolbars = this.options.setting.result.toolbars;
            for (var i = 0; i < toolbars.length; i ++) {
                var toolbar = toolbars[i];
                if (id == toolbar.id) {
                    return  toolbar;
                }
            }
            return undefined;
        },
        /**
         * 获取工具条上一个按钮的定义，含有的属性
         * name
         * id
         * disabled：true/false
         * label
         * icon
         * dispatchUrl
         */
        getBar : function(toolbar, name) {
            var controls = toolbar.controls;
            for (var i = 0; i < controls.length; i ++) {
                var control = controls[i];
                if (name == control['name']) {
                    return control;
                }
            }
            return undefined;
        },
        /**
         * 根据id取操作集定义
         * 含有的属性：id、url
         */
        getOperation : function(id) {
            var operations = this.options.setting.result.operations;
            for (var i = 0; i < operations.length; i ++) {
                var operation = operations[i];
                if (id == operation.id) {
                    return  operation;
                }
            }
            return undefined;
        },
        /**
         * 把数组中的对象的值组织成参数
         */
        getQueryParam: function(formAry) {
            var param = [];
            formAry.each(function (c) {
                if (c.getValue() != "" && c.getValue() != undefined) {
                    var obj = {
                        name: c.getId(),
                        value: c.getValue(),
                        group: "1"
                    };
                    param.push(obj);
                }

            });
            return param;
        },
        
        /**
         * 把widgets进行分组。分组名为key，内容为数组，存放此分组下的列定义
         */
        getModelGroups: function(widgets){//groupName
        	var nameobj = {};
        	var hicolumns = [];
        	var firstname = undefined;
        	for(var i = 0; i < widgets.length; i ++){
        		var column = widgets[i];
        		if(column['hidden'] == true){
        			hicolumns.push(column);
        			continue;
        		}
        		var groupName = column['groupName']; 
        		if(groupName == undefined){
        			groupName = "其它";
        		}
        		groupName = this.trim(groupName); 
        		if(firstname == undefined){
        			firstname = groupName;
        		}
        		
        		if(nameobj[groupName] == undefined){
        			var gary = [];
        			gary.push(column);
        			nameobj[groupName] = gary;
        		}else{
        			var gary = nameobj[groupName];
        			gary.push(column);
        		}
        		
        	}
        	if(firstname != undefined){
	        	var gary = nameobj[firstname];
	        	for(var i = 0; i < hicolumns.length; i ++){
	        		var column = hicolumns[i];
	        		gary.push(column);
	        	}
	        	nameobj[firstname] = gary;
        	}
        	
        	return nameobj;
        },
        
        /**
         * 根据模型获取form组件上的widgets
         */
        getFormWidgets : function(model, dsname, callback) {
        	var newcolumns = [];
            var columns = this.getMetaColumns(model);
            for(var i = 0; i < columns.length; i ++){
            	var column = columns[i];
            	if (typeof(column['$id']) == "undefined") {
                    column['$id'] = column['name'];
                }
                column['bind'] = dsname + "." + column['name'];
                if(column['hidden'] == true){
                	column['show'] = false;
                }else{
                	column['show'] = true;
                }
                var url = column['url'];
                if (typeof(url) != "undefined") {
                    /*var ds = Page.create("dataSet", {
                        $id: "ds_" + column['$id'],
                        fetchUrl:url,
                        model:{
                            mainAlias:'code'
                        }
                    });
                    column["dataSetId"] = "ds_" + column['$id'];*/
                    column["textField"] = "name";
                    column["valueField"]  = "id";
                    column["mainAlias"]  = "code";
                    //column['url'] = undefined;
                }
            	if(callback){
                    callback(column) ;
                }
            	newcolumns.push(column);
            }
            return columns;
        },
        /**
         * 获取数据
         * @param id
         */
        getData : function(id) {
            var datas = this.options.setting.result.datas;
            if (typeof(datas) == "undefined") {   //多条和单条，返回的元信息不一样。
                return undefined;
            }
            if (typeof(datas[id]) == "undefined") {
                return undefined;
            }
            return datas[id];
        },

        /**
         * 根据模型ID号获取数据。供form组件使用
         */
        getFormData : function(id) {
            var data = this.getData(id);
            if (typeof(data) == "undefined") {
                data = {};
                var model = this.getModel(id);
                var columns = this.getMetaColumns(model);
                for (var i = 0; i < columns.length; i ++) {
                    var column = columns[i];
                    data[column["name"]] = "";
                }
            }
            return data;
        },

        /**
         * 获取form组件使用的jsondata
         * @param id
         */
        getFormJsonData : function(id) {
            var data = this.getData(id);
            if (typeof(data) == "undefined") {
                data = {};
                var model = this.getModel(id);
                var columns = this.getMetaColumns(model);
                for (var i = 0; i < columns.length; i ++) {
                    var column = columns[i];
                    data[column[name]] = "";
                }
            }
            var datas = {};
            datas["rows"] = data;
            var result = {};
            result["datas"] = datas;
            var json = {};
            json["result"] = result;
        },

        /**
         * 获取一个查询集的系统唯一ID号
         * @param id
         */
        geFormId : function(id) {
            if (typeof(id) != "undefined") {
                return this.getSys() + "/" + this.getModule() + "/" + this.getPage() + "/" + id;
            } else {
                return this.getSys() + "/" + this.getModule() + "/" + this.getPage() + "/";
            }
        },
        /**
         * 去掉前后空格
         * @param str
         */
        trim : function(str){
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }

    });
    Metadata.xtype = xtype;
    return Metadata;
});