var emapmeta = function(p){
	this.setting = p.setting;
	
	this.dics = {};
	
	emapmeta.prototype.getModels = function() {
        return this.setting.result.models;
    };

    emapmeta.prototype.getDatas = function() {
        return this.setting.result.datas;
    };

    /**
     * 获取子系统的ID号
     */
    emapmeta.prototype.getSys = function() {
        return this.setting.sys;
    };

    /**
     * 获取模块的ID号
     */
    emapmeta.prototype.getModule = function() {
        return this.setting.module;
    };



    /**
     * 获取页面的ID号
     */
    emapmeta.prototype.getPage = function() {
        return this.setting.page;
    };

   

    /**
     * 根据id获取模型的定义，含有的属性
     * name
     * id
     * xtype
     * caption
     * url
     */
    emapmeta.prototype.getModel = function(id) {
        var models = this.setting.result.models;
        for (var i = 0; i < models.length; i ++) {
            var model = models[i];
            if (id == model.id) {
                return  model;
            }
        }
        return undefined;
    };
    /**
     * 根据模型获取simpleGrid使用的columns定义
     */
    
    /**
     * 获取某个数据集的元数据定义，含有的属性
     * name
     * id
     * xtype
     * callback(column)
     */
    emapmeta.prototype.getMetaColumns = function(model, callback) {
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
            
            if(column['typeSize']){
            	column['maxLength'] = column['typeSize'];
            }
            
            
            if (typeof(callback) != "undefined") {
                callback(column);
            }

            if(column['hidden'] == true){
                this.hiddencount ++;
            }
            if(xtype == "datepicker"){//只提供static input combobox  checkbox radio  textarea 其他都扩展
            	column['xtype'] = "input";
            	column['nextCharacter'] = '<i class="fa fa-calendar"></i>';
            	column['onNextCharacterClick'] = function(cmp, form){
            		var format = cmp.format;
            		if(!format){
            			format = "yyyy-MM-dd";
            		}
            		WdatePicker({el:cmp.id,dateFmt:format});
            	}
            }

            columns.push(column);
        }
        return columns;
    };
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
    emapmeta.prototype.getMetaColumn = function(model, name, callback) {
    	
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
    };

    emapmeta.prototype.getChangeXtype = function(xtype) {
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
    };
    /**
     * 根据id获取一个工具条，含有的属性：
     * id
     * xtype
     */
    emapmeta.prototype.getToolBar = function(id) {
        var toolbars = this.setting.result.toolbars;
        for (var i = 0; i < toolbars.length; i ++) {
            var toolbar = toolbars[i];
            if (id == toolbar.id) {
                return  toolbar;
            }
        }
        return undefined;
    };
    /**
     * 获取工具条上一个按钮的定义，含有的属性
     * name
     * id
     * disabled：true/false
     * label
     * icon
     * dispatchUrl
     */
    emapmeta.prototype.getBar = function(toolbar, name) {
        var controls = toolbar.controls;
        for (var i = 0; i < controls.length; i ++) {
            var control = controls[i];
            if (name == control['name']) {
                return control;
            }
        }
        return undefined;
    };
    /**
     * 根据id取操作集定义
     * 含有的属性：id、url
     */
    emapmeta.prototype.getOperation = function(id) {
        var operations = this.setting.result.operations;
        for (var i = 0; i < operations.length; i ++) {
            var operation = operations[i];
            if (id == operation.id) {
                return  operation;
            }
        }
        return undefined;
    };
    /**
     * 把数组中的对象的值组织成参数
     */
    emapmeta.prototype.getQueryParam = function(formAry) {
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
    };
    
    
    
    /**
     * 获取数据
     * @param id
     */
    emapmeta.prototype.getData = function(id) {
        var datas = this.setting.result.datas;
        if (typeof(datas) == "undefined") {   //多条和单条，返回的元信息不一样。
            return undefined;
        }
        if (typeof(datas[id]) == "undefined") {
            return undefined;
        }
        return datas[id];
    };

    /**
     * 根据模型ID号获取数据。供form组件使用
     */
    emapmeta.prototype.getFormData = function(id) {
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
    };

    /**
     * 获取form组件使用的jsondata
     * @param id
     */
    emapmeta.prototype.getFormJsonData = function(id) {
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
    };

    /**
     * 获取一个查询集的系统唯一ID号
     * @param id
     */
    emapmeta.prototype.geFormId = function(id) {
        if (typeof(id) != "undefined") {
            return this.getSys() + "/" + this.getModule() + "/" + this.getPage() + "/" + id;
        } else {
            return this.getSys() + "/" + this.getModule() + "/" + this.getPage() + "/";
        }
    };
    /**
     * 去掉前后空格
     * @param str
     */
    emapmeta.prototype.trim = function(str){
        return str.replace(/(^\s*)|(\s*$)/g, "");
    };
    
    emapmeta.prototype.getAjaxData = function (url, params, code, success, fail) {
        jQuery.ajax({
            url: url,
            data: params,
            type:'POST',
            dataType: 'json',
            cache: false,
            success: function (ret) {
            	if(!code){
            		code = "code";
            	}
            	var result = ret['result'];
            	if(!result){
            		success(ret);
            		return false;
            	}
            	var datas = result['datas'];
            	if(!datas){
            		success(ret.result);
            		return false;
            	}
            	
            	var codedata = datas[code]; 
            	if(!code){
            		success(datas);
            		return false;
            	}
            	if(codedata["rows"]){
            		success(codedata["rows"]);
            	}else{
            		success(codedata);
            	}
            	return false;
                //TODO
                
            },
            error: fail
        });
    };
    
    emapmeta.prototype.subAjaxData = function (url, params, success, fail) {
        jQuery.ajax({
            url: url,
            data: params,
            type:'POST',
            dataType: 'json',
            cache: false,
            success: function (data) {
                //TODO
                success(data);
            },
            error: fail
        });
    };
    
    emapmeta.prototype.initCmpDics = function(url, params, cmpname, dicname, callback){
    	if(!dicname){
    		dicname = cmpname;
    	}
    	if(this.dics[dicname]){
    		return false;
    	}
    	this.subAjaxData(url, params, function(datas){
    		this.dics[dicname] = datas;
    		if(callback){
    			callback(cmpname, datas);
    		}
    	}, null)
    };
	
};