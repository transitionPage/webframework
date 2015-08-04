/**
 * column    字段对象
 *  name        字段名
 *  groupName   分组名
 *  colNum      占列
 *  hidden      隐藏
 *  label       标题
 *  xtype:      类型  static input combobox  checkbox radio  textarea 
 *  required    必填
 *  initials    初始化值[{value,label,check}]
 *  customHtml      自定义组件的方法，返回html代码，function(id, name, column, spanId)
 *  customWidget    自定义组件的方法，返回组件对象，function(id, name, pid, spanId)
 *  setCmpValue     自定义组组件赋值function(name, value, disvalue)
 *  getCmpValue     自定义获取组件的值 function(name)
 *  cmpValid    自定义校验方法，返回true/false，funciton(name, spanId)
 *
 *minLength = number;
 maxLength = number;
 onlyNumber = true/false;
 onlyInteger = true/false;
 onlyEmail = true/false;      //邮箱地址
 onlyIdCard = true/false;    //身份证号
 *
 * 分组ID
 * formid_0[1..n]_formbox
 formid_0_title
 formid_0_title_tools
 formid_0_title_tools_link
 formid_0_title_tools_link_up
 formid_0_content
 formid_0_content_row
 formid_0_content_row_horizontal
 字段name
 formid_name_col
 formid_name_col_group
 formid_name_col_group_label
 formid_name_col_group_label_col
 formid_name
 formid_name_span
 *
 * @param p
 */

var emapform = function(p) {
    //form的名称  整个页面必须唯一
    this.name = p.name;

    //form的id号   如果为空则等于name
    if (typeof(p.id) != "undefined") {
        this.id = p.id;
    } else {
        this.id = p.name + new Date().getTime();
    }

    //显示的列数，默认为2
    this.columnCount = 2;         //1 2 3
    if (typeof(p.columnCount) != "undefined") {
        this.columnCount = p.columnCount;
    }
    if (this.columnCount > 4) {
        this.columnCount = 4;
    }
    if (this.columnCount < 1) {
        this.columnCount = 1;
    }

    //字段定义
    this.columns = new Array();
    if (typeof(p.columns) != "undefined") {
        this.columns = p.columns;
    }

    //是否分组
    this.isGroup = false;
    if (typeof(p.isGroup) != "undefined") {
        this.isGroup = p.isGroup;
    }
    this._groupIndex = [];

    //只读
    this.readOnly = false;
    if (typeof(p.readOnly) != "undefined") {
        this.readOnly = p.readOnly;
    }

    this._cmps = {};
    
    this._setting = p.setting;
	
	this._dics = {};

    /**
     * 渲染form
     * @param divid
     * @param callback
     */
    emapform.prototype.render = function(divid, callback) {
        var htmls = "";
        if (this.isGroup == true) {
            var groupColumns = this._getGroups(this.columns);
            htmls = this._getGroupFormHtml(groupColumns);
        } else {
            htmls = this._getFormHtml(this.columns);
        }
        $("#" + divid).html(htmls);
        this.resetcollg();

        $('.collapse-link').click(function() {
            var ibox = $(this).closest('div.form-box');
            var button = $(this).find('i');
            var content = ibox.find('div.box-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            setTimeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        });

        this._initCustomWidget(callback);
        
        /*$('.input-group.date').datepicker({
            todayBtn: "linked",
            keyboardNavigation: false,
            forceParse: false,
            calendarWeeks: true,
            autoclose: true
        });*/

    };

    /**
     * 对于占三列的字段，需要重新计算一下label的宽度比
     */
    emapform.prototype.resetcollg = function() {
        if ($(window).width() < 1170) {
            $(".columnsthree .col-lg-12 .col-lg-2").removeClass("cus-lab-3");
            $(".columnsthree .col-lg-12 .col-lg-10").removeClass("cus-div-3");
        } else {
            $(".columnsthree .col-lg-12 .col-lg-2").addClass("cus-lab-3");
            $(".columnsthree .col-lg-12 .col-lg-10").addClass("cus-div-3");
        }
    };

    /**
     * 根据名称获取组件
     * @param name
     *  xtype： static input combobox  checkbox radio  textarea  custome  datepicker
     *  widget：自定义的组件对象
     */
    emapform.prototype.getCmp = function(name) {
        return this._cmps[name];
    };

    /**
     * 设置提示信息
     * @param name
     * @param msg
     * @param display
     */
    emapform.prototype.setCmpSpan = function(name, msg, display) {     //formid_name_span
        var spanid = this.id + "_" + name + "_span";
        $("#" + spanid).html(msg);
        if (display == true) {
            $("#" + spanid).css("display", "none");
        } else {
            $("#" + spanid).css("display", "block");
        }
    };

    /**
     * 设置某个为出错
     * @param name
     * @param status
     */
    emapform.prototype.setCmpError = function(name, status) {
        if (this._cmps[name]) {
            var cmp = this._cmps[name];
            var colgroupId = cmp.colGroupId;
            if (status && status == true) {
                $("#" + colgroupId).addClass("has-error");
            } else {
                $("#" + colgroupId).removeClass("has-error");
            }

        }
    };

    /**
     * 设置某个为成功
     * @param name
     * @param status
     */
    emapform.prototype.setCmpSucess = function(name, status) {
        if (this._cmps[name]) {
            var cmp = this._cmps[name];
            var colgroupId = cmp.colGroupId;
            if (status && status == true) {
                $("#" + colgroupId).addClass("has-success");
            } else {
                $("#" + colgroupId).removeClass("has-success");
            }

        }
    };

    /**
     * 设置某个为警告
     * @param name
     * @param status
     */
    emapform.prototype.setCmpWarning = function(name, status) {
        if (this._cmps[name]) {
            var cmp = this._cmps[name];
            var colgroupId = cmp.colGroupId;
            if (status && status == true) {
                $("#" + colgroupId).addClass("has-warning");
            } else {
                $("#" + colgroupId).removeClass("has-warning");
            }

        }
    };

    /**
     * 赋值
     * @param name
     * @param value
     * @param disvalue
     */
    emapform.prototype.setCmpValue = function(name, value, disvalue) {
        if (!value) {
            return false;
        }
        if (!disvalue) {
            disvalue = value;
        }
        if (this._cmps[name]) {
            var cmp = this._cmps[name];
            var xtype = cmp['xtype'];
            var id = cmp.id;
            var pid = cmp.pid;
            if (cmp.setCmpValue) {
                cmp.setCmpValue(name, value, disvalue);
                return;
            }
            if (xtype == 'static') {
                var staticId = cmp.staticId;
                $("#" + staticId).html(disvalue);
                $("#" + id).val(value);
            } else if (xtype == 'radio') {
                $("#" + pid + " input:radio").prop('checked', false);
                $("#" + pid + " input:radio[value='" + value + "']").prop('checked', true);
            } else if (xtype == 'checkbox') {
                $("#" + pid + " input:checkbox").prop('checked', false);
                var vary = value.split(',');
                for (var i = 0; i < vary.length; i ++) {
                    var vvalue = vary[i];
                    $("#" + pid + " input:checkbox[value='" + vvalue + "']").prop('checked', true);
                }
            } else if (xtype == 'combobox') {
            	if(!cmp['model'] || cmp['model']=="normal") {
            		if ($("#" + id + " option[value='" + value + "']").length <= 0) {
                        $("#" + id).append("<option value='" + value + "'>" + disvalue + "</option>");
                    }
                    $("#" + id).val(value);
            	}
            	else if(cmp['model']=="tree") {
            		PageMgr.manager.components[id].setValue({value: value, display: disvalue});
            	}
                
            } else {
                $("#" + id).val(value);
            }

        }
    };
    /**
     * 获取值
     * @param name
     */
    emapform.prototype.getCmpValue = function(name) {
        if (!this._cmps[name]) {
            return;
        }
        var cmp = this._cmps[name];
        if (cmp.getCmpValue) {
            return cmp.getCmpValue(name);
        } else {
            var id = cmp.id;
            var pid = cmp.pid;
            var xtype = cmp['xtype'];
            if (xtype == 'static') {
                return $("#" + id).val();
            } else if (xtype == 'radio') {
                return $("#" + pid + " input:radio[name='" + name + "']:checked").val();
            } else if (xtype == 'checkbox') {
                var values = "";
                $("#" + pid + " input:checkbox").each(function() {
                    if ($(this).prop('checked') == true) {
                        if (values == "") {
                            values = $(this).val();
                        } else {
                            values = values + "," + $(this).val();
                        }
                    }
                });
                return values;
            } else if(xtype == 'combobox' && cmp['model']=="tree") {
            	return PageMgr.manager.components[id].getValue();
            }else {
                return $("#" + id).val();
            }
        }
    };

    /**
     * 获取form上的值，取组织成key value形式
     */
    emapform.prototype.getFormDatas = function() {
        var datas = {};
        for (var name in this._cmps) {
            var cmp = this._cmps[name];
            var value = this.getCmpValue(name);
            if (value != undefined) {
                datas[name] = value;
            }
        }
        return datas;
    };

    /**
     * 组form赋值
     * @param datas
     */
    emapform.prototype.setFormDatas = function(datas) {
        for (var name in this._cmps) {
            var cmp = this._cmps[name];
            var value = datas[name];
            var disvalue = datas[name + "_DISPLAY"];
            if (value != undefined) {
                this.setCmpValue(name, value, disvalue);
            }
        }
    };

    /**
     * form校验
     */
    emapform.prototype.formValid = function() {
        var verifi = true;
        for (var name in this._cmps) {
            if (this.cmpValid(name) == false) {
                verifi = false;
            }
        }
        return verifi;
    };

    /**
     * 组件校验
     * @param name
     */
    emapform.prototype.cmpValid = function(name) {
        var cmp = this._cmps[name];
        if (!cmp) {
            return true;
        }
        var verifi = true;
        var xtype = cmp.xtype;


        var value = this.trim(this.getCmpValue(name));
        var required = cmp["required"];
        var spanId = cmp["spanId"];
        if (required == true) {
            verifi = this.requiredValid(name, value, true);
            if (verifi == false) {
                return verifi;
            }
        }
        if (cmp.cmpValid) {   //自定义校验
            var res = cmp.cmpValid(name, spanId);
            if (res == false) {
                verifi = res;
                if (verifi == false) {
                    return verifi;
                }
            }
        }
        var minLength = cmp["minLength"];
        var maxLength = cmp["maxLength"];
        var onlyNumber = cmp["onlyNumber"];
        var onlyInteger = cmp["onlyInteger"];
        var onlyEmail = cmp["onlyEmail"];      //邮箱地址
        var onlyIdCard = cmp["onlyIdCard"];    //身份证号

        if (minLength && minLength > 0) {
            verifi = this.minLengthValid(name, value, minLength, true);
            if (verifi == false) {
                return verifi;
            }
        }

        if (maxLength && maxLength > 0) {
            verifi = this.maxLengthValid(name, value, maxLength, true);
            if (verifi == false) {
                return verifi;
            }
        }

        if (onlyNumber && onlyNumber == true) {
            verifi = this.onlyNumberValid(name, value, true);
            if (verifi == false) {
                return verifi;
            }
        }

        if (onlyInteger && onlyInteger == true) {
            verifi = this.onlyIntegerValid(name, value, true);
            if (verifi == false) {
                return verifi;
            }
        }

        if (onlyEmail && onlyEmail == true) {
            verifi = this.onlyEmailValid(name, value, true);
            if (verifi == false) {
                return verifi;
            }
        }

        if (onlyIdCard && onlyIdCard == true) {   //onlyIdCard
            verifi = this.onlyIdCardValid(name, value, true);
            if (verifi == false) {
                return verifi;
            }
        }


        if (verifi == true) {
            this.setCmpSpan(name, "", true);
            this.setCmpError(name, false);
        }

        return verifi;
    };

    /**
     * 校验必填
     * @param name
     * @param value
     * @param span
     */
    emapform.prototype.requiredValid = function(name, value, span) {
        if (!value) {
            if (span) {
                this.setCmpSpan(name, "非空选项", false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 校验最小长度
     * @param name
     * @param value
     * @param minLength
     * @param span
     */
    emapform.prototype.minLengthValid = function(name, value, minLength, span) {
        var textlen = 0;
        var textval = value;
        for (var k = 0; k < textval.length; k ++) {     //计算字符串的长度，其中汉字占3位
            if (textval.charCodeAt(k) < 299) {
                textlen ++;
            } else {
                textlen += 3;
            }
        }
        if (textlen < minLength) {
            var prompty_inError = '长度不能少于' + minLength + '位(已输入' + textlen + '位，其中汉字占3位)';
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 校验最大长度
     * @param name
     * @param value
     * @param maxLength
     * @param span
     */
    emapform.prototype.maxLengthValid = function(name, value, maxLength, span) {
        var textlen = 0;
        var textval = value;
        for (var k = 0; k < textval.length; k ++) {     //计算字符串的长度，其中汉字占3位
            if (textval.charCodeAt(k) < 299) {
                textlen ++;
            } else {
                textlen += 3;
            }
        }
        if (textlen > maxLength) {
            var prompty_inError = '长度不能大于' + maxLength + '位(已输入' + textlen + '位，其中汉字占3位)';
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 校验纯数值
     * @param name
     * @param value
     * @param span
     */
    emapform.prototype.onlyNumberValid = function(name, value, span) {
        var regex = /^[0-9]+(.[0-9]{0,2})?$/;
        if (!regex.test(value)) {
            var prompty_inError = "只能输入数字！";
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 校验纯整数
     * @param name
     * @param value
     * @param span
     */
    emapform.prototype.onlyIntegerValid = function(name, value, span) {
        var regex = /^[0-9-]+$/;
        if (!regex.test(value)) {
            var prompty_inError = "只能输入整数！";
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 电子邮箱校验
     * @param name
     * @param value
     * @param span
     */
    emapform.prototype.onlyEmailValid = function(name, value, span) {
        var regex = /^[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+[.])+[a-zA-Z0-9]{2,4}$/;
        if (!regex.test(value)) {
            var prompty_inError = "格式不符合(xxx@yyy.com)！";
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        return true;
    };

    /**
     * 校验身份证号    校验码
     * 1、前17位数分别乘以不同的系数后相加。系数为7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2
     * 2、相加后的和对11取余。
     * 3、余数0 1 2 3 4 5 6 7 8 9 10 对应的校验码为1 0 X 9 8 7 6 5 4 3 2，其中10表示X
     * @param value
     */
    emapform.prototype.onlyIdCardValid = function(name, value, span) {
        if (value.length != 18 && value.length != 15) {
            var prompty_inError = "长度不符合(18/15)！";
            if (span) {
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
            }
            return false;
        }
        if (value.length != 18) {
            return true;
        }
        var xsh = 0;
        var xsary = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
        for (var xh = 0; xh < 17; xh ++) {
            var xhv = value.substring(xh, xh + 1);
            if (isNaN(xhv)) {
                var prompty_inError = "第" + (xh + 1) + "位只允许输入数字！";
                this.setCmpSpan(name, prompty_inError, false);
                this.setCmpError(name, true);
                return false;
            }
            xsh += xsary[xh] * xhv;
        }
        var ys = xsh % 11;
        var ysdy = new Array();
        ysdy[0] = '1';
        ysdy[1] = '0';
        ysdy[2] = 'X';
        ysdy[3] = '9';
        ysdy[4] = '8';
        ysdy[5] = '7';
        ysdy[6] = '6';
        ysdy[7] = '5';
        ysdy[8] = '4';
        ysdy[9] = '3';
        ysdy[10] = '2';
        var jyw = value.substring(17, 18).toUpperCase();
        if (jyw != ysdy[ys]) {
            var prompty_inError = "输入有误，请核实！";
            this.setCmpSpan(name, prompty_inError, false);
            this.setCmpError(name, true);
            return false;
        }
        return true;
    };


    /**
     * 初始化组件的数据
     * @param name
     * @param datas
     */
    emapform.prototype.initCmpDatas = function(name, idatas, callback) {
        var cmp = this._cmps[name];
        if (!cmp) {
            return;
        }
        var cvalue = this.getCmpValue(name);
        var disvalue = cvalue;

        var datas = idatas;
        var dataary = [];
        if (typeof idatas.length === 'number' && typeof idatas.splice === 'function') {
            datas = {};
            for (var i = 0; i < idatas.length; i ++) {
                var idata = idatas[i];
                var index = 0;
                var vary = [];
                for (var key in idata) {
                    vary[index ++] = idata[key];
                }
                dataary.push({
                 	key:  vary[0],
                 	value:vary[1]
                	});
                /*datas[vary[0]] = vary[1];*/
            }
        } else {
        	for (var key in datas) {
     			dataary.push({
             	key:  key,
             	value:datas[key]
            	});
     		}
        }

        var xtype = cmp.xtype;
        if (xtype == 'combobox') {
            disvalue = $("#" + cmp.id).text();
            $("#" + cmp.id + " option").remove();
            $("#" + cmp.id).append("<option value=''>--请选择--</option>");
            /*for (var key in datas) {
                var value = datas[key];
                var opt = $("<option value='" + key + "'>" + value + "</option>");
                $("#" + cmp.id).append(opt);
            }*/
            for(var i = 0; i < dataary.length; i ++){
              	var idata  = dataary[i];
              	var opt = $("<option value='" + idata.key + "'>" + idata.value + "</option>");
              	$("#" + cmp.id).append(opt);
             }
            if(callback) {
	           	 $("#" + cmp.id).change(function() {
	           		 callback(this);
	           	 });
            }
        } else if (xtype == 'checkbox') {
            var htmls = [];
            var idindex = 0;
            /*for (var key in datas) {
                var value = datas[key];
                htmls.push('<input type="checkbox" value="' + key + '" name="' + name + '" id = "' + cmp.id + "_" + idindex++ + '"/>');
                htmls.push(' ' + value + ' ');
            }*/
            for(var i = 0; i < dataary.length; i ++){
              	var idata  = dataary[i];
              	htmls.push('<input type="checkbox" value="' + idata.key + '" name="' + name + '" id = "' + cmp.id + "_" + idindex++ + '"/>');
                htmls.push(' ' + idata.value + ' ');
             }
            var pid = cmp.pid;
            $("#" + pid).html(htmls.join(''));

        } else if (xtype == 'radio') {
            var htmls = [];
            var idindex = 0;
            /*for (var key in datas) {
                var value = datas[key];
                htmls.push('<input type="radio" value="' + key + '" name="' + name + '" id = "' + cmp.id + "_" + idindex++ + '"/>');
                htmls.push(' ' + value + ' ');
            }*/
            for(var i = 0; i < dataary.length; i ++){
              	var idata  = dataary[i];
              	htmls.push('<input type="radio" value="' + idata.key + '" name="' + name + '" id = "' + cmp.id + "_" + idindex++ + '"/>');
                htmls.push(' ' + idata.value + ' ');
             }
            var pid = cmp.pid;
            $("#" + pid).html(htmls.join(''));
        }

        this.setCmpValue(name, cvalue, disvalue);
    };

    /**
     * icheck重新样式
     */
    emapform.prototype.icheck = function() {
        $('.i-checks').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green'
        });
    };

    /**
     * 去掉字符串前后空格
     * @param str
     */
    emapform.prototype.trim = function(str) {
        if (!str) {
            return str;
        }
        return str.replace(/(^\s*)|(\s*$)/g, "");
    };

    /**
     * 设置分组是否隐藏
     * @param index
     * @param display
     */
    emapform.prototype.setGroupDisplay = function(index, display) {
        var groupid = this.id + "_" + index + "_formbox";
        if (display == true) {
            $("#" + groupid).hide();
        } else {
            $("#" + groupid).show();
        }
    };

    /**
     * 设置组件是否隐藏
     * @param name
     * @param display
     */
    emapform.prototype.setCmpDisplay = function(name, display) {
        var divid = this.id + "_" + name + "_col";
        if (display == true) {
            $("#" + divid).hide();
        } else {
            $("#" + divid).show();
        }
    };

    emapform.prototype._getGroups = function(columns) {
        var nameobj = {};
        var hicolumns = [];
        var firstname = undefined;
        this._groupIndex = [];
        for (var i = 0; i < columns.length; i ++) {
            var column = columns[i];
            /*if (column['hidden'] == true) {
                hicolumns.push(column);
                continue;
            }*/
            var groupName = column['groupName'];
            if (groupName == undefined) {
                groupName = "其它";
            }
            groupName = this.trim(groupName);
            if (firstname == undefined) {
                firstname = groupName;
            }

            if (nameobj[groupName] == undefined) {
                var gary = [];
                gary.push(column);
                nameobj[groupName] = gary;
                this._groupIndex.push(groupName);
            } else {
                var gary = nameobj[groupName];
                gary.push(column);
            }

        }
        /*if (firstname != undefined) {
            var gary = nameobj[firstname];
            for (var i = 0; i < hicolumns.length; i ++) {
                var column = hicolumns[i];
                gary.push(column);
            }
            nameobj[firstname] = gary;
        }
*/
        return nameobj;
    };

    emapform.prototype._getFormHtml = function(columns) {
        var idindex = 0;
        var htmls = [];
        var id = this.id + "_" + idindex + "_formbox";
        htmls.push('<div class="form-box" id="' + id + '">');
        htmls.push(this._getContentHtml(columns, idindex));
        htmls.push('</div>');
        return htmls.join('');
    };

    emapform.prototype._getGroupFormHtml = function(groupColumns) {
        var idindex = 0;
        var htmls = [];
        //for (var groupname in groupColumns) {
        for(var i = 0; i < this._groupIndex.length; i ++){
        	var groupname = this._groupIndex[i];
            var columns = groupColumns[groupname];
            var id = this.id + "_" + idindex + "_formbox";
            htmls.push('<div class="form-box" id="' + id + '">');
            if (groupname) {
                htmls.push(this._getTitleHtml(groupname, idindex));
            }
            htmls.push(this._getContentHtml(columns, idindex));
            htmls.push('</div>');
            idindex ++;
        }
        return htmls.join('');
    };

    /**
     * 组织每个分组form的标题
     * @param groupname    分组名
     * @param groupindex   分组索引
     */
    emapform.prototype._getTitleHtml = function(groupname, groupindex) {
        var htmls = [];
        var id = this.id + "_" + groupindex + "_title";
        htmls.push('<div class="box-title" id="' + id + '">');
        htmls.push('<h5>');
        htmls.push('<span>' + groupname + '</span>');
        id = id + "_tools";
        htmls.push('<div class="box-tools" id="' + id + '">');
        id = id + "_link";
        htmls.push('<a class="collapse-link" id="' + id + '">');
        id = id + "_up";
        htmls.push('<i class="fa fa-chevron-up" id="' + id + '"></i>');
        htmls.push('</a>');
        htmls.push('</div>');
        htmls.push('</h5>');
        htmls.push('</div>');
        return htmls.join('');
    };

    /**
     * 组织每个分组form的主体
     * @param columns     分组内含的列
     * @param groupindex  分组索引
     */
    emapform.prototype._getContentHtml = function(columns, groupindex) {
        var htmls = [];
        var id = this.id + "_" + groupindex + "_content";

        htmls.push('<div class="box-content " id="' + id + '">');
        id = id + "_row";
        htmls.push('<div class="row" id="' + id + '">');

        id = id + "_horizontal";
        if (this.columnCount == 3) {
            htmls.push('<div class="form-horizontal columnsthree" id="' + id + '">');
        } else {
            htmls.push('<div class="form-horizontal" id="' + id + '">');
        }
        for (var i = 0; i < columns.length; i ++) {
            var column = columns[i];
            htmls.push(this._getColumnHtml(column));
        }
        htmls.push('</div>');
        htmls.push('</div>');
        htmls.push('</div>');
        return htmls.join('');
    };

    emapform.prototype._getColumnHtml = function(column) {
        if (column.colNum > this.columnCount) {
            column.colNum = this.columnCount;
        }
        if (column.colNum < 1) {
            column.colNum = 1;
        }
        var colpan = (12 / this.columnCount) * column.colNum;

        var htmls = [];
        var name = column.name;
        var cmp = column;
        var id = this.id + "_" + name + "_col";
        cmp["colId"] = id;
        if (this.columnCount == 3){
            if (column.colNum * 1 >= 3) {
                htmls.push('<div class="col-lg-12 col-md-12 col-sm-12" id = "' + id + '">');
            } else if (column.colNum * 1 == 2) {
                htmls.push('<div class="col-lg-8 col-md-12 col-sm-12" id = "' + id + '">');
            } else {
                htmls.push('<div class="col-lg-4 col-md-6 col-sm-12" id = "' + id + '">');
            }

        }else if (this.columnCount == 2) {
            if (column.colNum * 1 >= 2) {
                htmls.push('<div class="col-lg-12 col-md-12 col-sm-12" id = "' + id + '">');
            } else {
                htmls.push('<div class="col-lg-6 col-md-6 col-sm-12" id = "' + id + '">');
            }
        }else{
            htmls.push('<div class="col-lg-12 col-md-12 col-sm-12" id = "' + id + '">');
        }
        id = id + "_group";
        cmp["colGroupId"] = id;
        htmls.push('<div class="form-group" id="' + id + '">');
        var showLabel = cmp.showLabel;
        var divclass = "";
        if (showLabel != false) {
            var labelcloss = "";
            if (this.columnCount == 3) {
                if (colpan == 12) {
                    labelcloss = "col-lg-2 col-md-2 col-sm-4 control-label";
                    divclass = "col-lg-10 col-md-10 col-sm-8";
                } else if (colpan == 8) {
                    labelcloss = "col-lg-2 col-md-2 col-sm-4 control-label";
                    divclass = "col-lg-10 col-md-10 col-sm-8";
                } else {
                    labelcloss = "col-lg-4 col-md-4 col-sm-4 control-label";
                    divclass = "col-lg-8 col-md-8 col-sm-8";
                }
            } else if (this.columnCount == 2) {
                if (colpan == 12) {
                    labelcloss = "col-lg-2 col-md-2 col-sm-4 control-label";
                    divclass = "col-lg-10 col-md-10 col-sm-8";
                } else {
                    labelcloss = "col-lg-4 col-md-4 col-sm-4 control-label";
                    divclass = "col-lg-8 col-md-8 col-sm-8";
                }
            } else {
                labelcloss = "col-lg-3 col-md-3 col-sm-4 control-label";
                divclass = "col-lg-9 col-md-9 col-sm-8";
            }
            id = id + "_label";
            var label = column["label"];
            cmp["colGroupLabelId"] = id;
            htmls.push('<label class="' + labelcloss + '" id="' + id + '" title="' + label + '">');
            if (column['required'] == true && this.readOnly == false) {
                htmls.push('<font color="red">*</font>');
            }
            htmls.push(label);
            htmls.push('</label>');
        } else {
            divclass = "col-lg-12 col-md-12 col-sm-12";
        }
        id = id + "_col";
        cmp["colGroupColId"] = id;
        htmls.push('<div class="' + divclass + '" id="' + id + '">');
        if (this.readOnly == true) {                            //form只读
            cmp["xtype"] = "static";
            htmls.push(this._getStaticHtml(column, cmp));
        } else if (column['readonly'] == true) {               //字段只读
            cmp["xtype"] = "static";
            htmls.push(this._getStaticHtml(column, cmp));
        } else if (column.customWidget) {   //自定义对象
            cmp["xtype"] = "custom";
            cmp["id"] = this.id + "_" + column["name"];
            cmp["spanId"] = this.id + "_" + column["name"] + "_span";
            cmp["customWidget"] = column.customWidget;
        } else if (column.customHtml) {    //自定义html
            if (cmp["xtype"] == undefined) {
                cmp["xtype"] = "custom";
            }
            cmp["id"] = this.id + "_" + column["name"];
            cmp["spanId"] = this.id + "_" + column["name"] + "_span";
            htmls.push(column.customHtml(cmp.id, column["name"], column, cmp.spanId));
        } else {       //datepicker
            var xtype = column['xtype'];
            cmp["xtype"] = xtype;
            if (xtype == 'input') {
                htmls.push(this._getInputCmpHtml(column, cmp));
            } else if (xtype == 'combobox') {
                if(!cmp["model"] || cmp["model"]=='normal') {
                	htmls.push(this._getComboBoxCmpHtml(column, cmp));
                }
            	else {
            		htmls.push(this._getInputCmpHtml(column, cmp));
            	}
                
            } else if (xtype == 'checkbox') {
        		htmls.push(this._getCheckBoxCmpHtml(column, cmp));
            } else if (xtype == 'radio') {
                htmls.push(this._getRadioBoxCmpHtml(column, cmp));
            } else if (xtype == 'textarea') {
                htmls.push(this._getTextareaCmpHtml(column, cmp));
            } /*else if (xtype == 'datepicker') {
                htmls.push(this._getDatepickerCmpHtml(column, cmp));
            }*/ else if (xtype == 'static') {
                htmls.push(this._getStaticHtml(column, cmp));
            } else {    //找不到类型就认为是input  
                cmp["xtype"] = "input";
                htmls.push(this._getInputCmpHtml(column, cmp));
            }
        }
        htmls.push('</div>');

        htmls.push('</div>');
        htmls.push('</div>');
        this._cmps[name] = cmp;
        return htmls.join('');
    };

    /**
     * 获取Input输入框的html
     * @param column  
     */
    emapform.prototype._getInputCmpHtml = function(column, cmp) {
        var htmls = [];

        if (column['previousCharacter'] != undefined || column['nextCharacter'] != undefined) {
            htmls.push('<div class="input-group">');
        }

        if (column['previousCharacter'] != undefined) {
        	var previousCharacterId = this.id + "_" + name + "_previous";
        	cmp["previousCharacterId"] = previousCharacterId;
            htmls.push('<span class="input-group-addon" id = "' + previousCharacterId + '">');
            htmls.push(column['previousCharacter']);
            htmls.push('</span>');
        }

        var label = column["label"];
        var name = column["name"];
        var id = this.id + "_" + name;
        cmp["id"] = id;
        if(column["xtype"]=="combobox" ) {
        	 htmls.push('<input type="text" class="form-control pageSelect" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '"/>');
        }
        else {
        	htmls.push('<input type="text" class="form-control" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '"/>');
        }

        if (column['nextCharacter'] != undefined) {
        	var nextCharacterId = this.id + "_" + name + "_next";
        	cmp["nextCharacterId"] = nextCharacterId;
            htmls.push('<span class="input-group-addon" id = "' + nextCharacterId + '">');
           // htmls.push('<span class="input-group-addon">');
            htmls.push(column['nextCharacter']);
            htmls.push('</span>');
        }
        
        if (column['previousCharacter'] != undefined || column['nextCharacter'] != undefined) {
            htmls.push('</div>');
        }
        
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');

        
        return htmls.join('');
    };
    
    emapform.prototype._getDatepickerCmpHtml = function(column, cmp) {//
    	var htmls = [];
    	var format = column["format"];
    	if(!format){
    		format = "9999-99-99";
    	}
        /*htmls.push('<div class="input-group date">');*/
    	
    	column['nextCharacter'] = '<i class="fa fa-calendar"></i>';
    	return this._getInputCmpHtml(column, cmp);

        var label = column["label"];
        var name = column["name"];
        var id = this.id + "_" + name;
        cmp["id"] = id;
        htmls.push('<div class="input-group date" style="width: 100%">');
        htmls.push('<input type="text" class="form-control form-widget-to-focus-class" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '" />');
        var faid = id + "_fa";
        cmp["faId"] = faid;
        htmls.push('<span class="input-group-addon">');
        htmls.push('<i class="fa fa-calendar" id="' + faid + '" ');
        //htmls.push('onclick="WdatePicker({el:'+id+'})"');
        htmls.push(' ></i>');
        //htmls.push('<span class="input-group-addon"><i class="fa fa-calendar" id="' + faid + '" onclick="WdatePicker({el:');
        htmls.push('</span>');
        htmls.push('</div>');
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');

        
        return htmls.join('');
    };


    /**
     * 多行文本
     * @param column
     * @param cmp
     */
    emapform.prototype._getTextareaCmpHtml = function(column, cmp) {
        var htmls = [];
        var label = column["label"];
        var name = column["name"];
        var id = this.id + "_" + name;
        cmp["id"] = id;
        if (column["height"]) {
            htmls.push('<textarea class="form-control" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '", style="height:' + column["height"] + 'px;"></textarea>');
        } else {
            htmls.push('<textarea class="form-control" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '"></textarea>');
        }

        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');
        return htmls.join('');
    };


    /**
     * 获取下拉选择框
     * @param column
     * @param cmp
     */
    emapform.prototype._getComboBoxCmpHtml = function(column, cmp) {
        var htmls = [];
        var label = column["label"];
        var name = column["name"];
        var initials = column["initials"];
        var id = this.id + "_" + name;
        cmp["id"] = id;
        htmls.push('<select class="form-control" id="' + id + '" name="' + name + '">');
        htmls.push('<option value="">--请选择--</option>');
        if (initials) {
            for (var i = 0; i < initials.length; i ++) {
                var initial = initials[i];
                var value = initial["value"];
                var label = initial["label"];
                var check = initial["check"];
                if (check && check == true) {
                    htmls.push('<option selected=true value="' + value + '">' + label + '</option>');
                } else {
                    htmls.push('<option value="' + value + '">' + label + '</option>');
                }
                htmls.push(' ' + label + ' ');
            }
        }
        htmls.push('</select>');
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');
        return htmls.join('');
    };

    /**
     * 获取checkbox
     * @param column
     * @param cmp       pid, id
     */
    emapform.prototype._getCheckBoxCmpHtml = function(column, cmp) {
        var htmls = [];
        var label = column["label"];
        var name = column["name"];
        var initials = column["initials"];
        var id = this.id + "_" + name;
        var pid = this.id + "_parent_" + name;
        cmp["pid"] = pid;
        cmp["id"] = id;
        htmls.push('<div class="checkbox i-checks" id = "' + pid + '">');
        if (initials) {
            for (var i = 0; i < initials.length; i ++) {
                var initial = initials[i];
                var value = initial["value"];
                var label = initial["label"];
                var check = initial["check"];
                if (check && check == true) {
                    htmls.push('<input type="checkbox" checked=""  value="' + value + '" name="' + name + '" id = "' + id + '_' + i + '"/>');
                } else {
                    htmls.push('<input type="checkbox" value="' + value + '" name="' + name + '" id = "' + id + '_' + i + '"/>');
                }
                htmls.push(' ' + label + ' ');
            }
        }
        htmls.push('</div>');
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');
        return htmls.join('');
    };

    /**
     * 获取radioBox
     * @param column
     * @param cmp       pid, id
     */
    emapform.prototype._getRadioBoxCmpHtml = function(column, cmp) {
        var htmls = [];
        var name = column["name"];
        var id = this.id + "_" + name;
        var pid = this.id + "_parent_" + name;
        var initials = column["initials"];
        cmp["pid"] = pid;
        cmp["id"] = id;
        htmls.push('<div class="radio i-checks" id = "' + pid + '">');
        if (initials) {
            for (var i = 0; i < initials.length; i ++) {
                var initial = initials[i];
                var value = initial["value"];
                var label = initial["label"];
                var check = initial["check"];

                if (check && check == true) {
                    htmls.push('<input type="radio" checked=""  value="' + value + '" name="' + name + '" id = "' + id + '_' + i + '"/>');
                } else {
                    htmls.push('<input type="radio" value="' + value + '" name="' + name + '" id = "' + id + '_' + i + '"/>');
                }
                htmls.push(' ' + label);
            }
        }
        htmls.push('</div>');
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');
        return htmls.join('');
    };

    /**
     * 静态文本
     * @param column
     */
    emapform.prototype._getStaticHtml = function(column, cmp) {
        var htmls = [];
        var label = column["label"];
        var name = column["name"];
        var id = this.id + "_" + name;
        cmp["id"] = id;
        htmls.push('<input type="hidden" class="form-control" placeholder="请输入' + label + '" id="' + id + '" name="' + name + '"/>');
        id = id + "_static";
        cmp["staticId"] = id;
        htmls.push('<p class="form-control-static" id="' + id + '"></p>');
        id = id + "_span";
        cmp["spanId"] = id;
        htmls.push('<span class="help-block m-b-none" style="display:none;position:absolute;margin-top:0;" id="' + id + '"></span>');
        return htmls.join('');
    };

    /**
     * 初始化自定义字段
     */
    emapform.prototype._initCustomWidget = function(callback) {
        for (var name in this._cmps) {
            var cmp = this._cmps[name];
            var xtype = cmp['xtype'];
            if (xtype == "custom") {
                var pid = cmp["colGroupColId"];
                var customWidget = cmp["customWidget"];
                if (customWidget) {
                    cmp["widget"] = customWidget(cmp.id, cmp.name, pid, cmp.spanId);
                }
            }
            else if(xtype == "combobox" && cmp['model']=="tree") {
            	PageMgr.create("combobox", jQuery.extend(cmp, {
            		$parentId: cmp.id,
            		mainAlias: "code",
                    valueField: "id",
                    textField: "name"})).render();
            }
            var hidden = cmp['hidden'];
            if(hidden && hidden == true){
                $("#" + cmp.colId).hide();
            }
        }
        if (callback) {
            callback();
        }
    };

    /**
     * 注册组件方法
     * @param callback
     */
    emapform.prototype.registerCmpEvent = function(callback) {

        for (var name in this._cmps) {
            var cmp = this._cmps[name];
            var xtype = cmp['xtype'];
            if (xtype == "checkbox") {
                var pid = cmp.pid;
                $("#" + pid + " .icheckbox_square-green .iCheck-helper ").click({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onClick) {
                        e.data._cmp.onClick(e.data._cmp.name, e.data._form);
                    }
                });

            } else if (xtype == "radio") {
                var pid = cmp.pid;
                $("#" + pid + " .iradio_square-green .iCheck-helper ").click({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onClick) {
                        e.data._cmp.onClick(e.data._cmp.name, e.data._form);
                    }
                });
            } else if (xtype == "input" || xtype == "textarea") {
                $("#" + cmp.id).keypress({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onKeypress) {
                        e.data._cmp.onKeypress(e.data._cmp.name, e.data._form);
                    }
                });
                $("#" + cmp.id).blur({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onBlue) {
                        e.data._cmp.onBlue(e.data._cmp.name, e.data._form);
                    }
                });
                $("#" + cmp.id).focus({_cmp:cmp, _form:this}, function(e) {
                    //e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onFocus) {
                        e.data._cmp.onFocus(e.data._cmp.name, e.data._form);
                    }
                });
                var nextCharacterId = cmp["nextCharacterId"];
                if(nextCharacterId){
                	$("#" + nextCharacterId).click({_cmp:cmp, _form:this}, function(e) {
                        if (e.data._cmp.onNextCharacterClick) {
                            e.data._cmp.onNextCharacterClick(e.data._cmp,  e.data._form);
                        }
                    });
                }

            }else if (xtype == "datepicker") {
                $("#" + cmp.id).keypress({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onKeypress) {
                        e.data._cmp.onKeypress(e.data._cmp.name, e.data._form);
                    }
                });
                $("#" + cmp.id).blur({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onBlue) {
                        e.data._cmp.onBlue(e.data._cmp.name, e.data._form);
                    }
                });
                $("#" + cmp.id).focus({_cmp:cmp, _form:this}, function(e) {
                    //e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onFocus) {
                        e.data._cmp.onFocus(e.data._cmp.name, e.data._form);
                    }
                });
                var faId = cmp.faId;
                $("#" + faId).click({_cmp:cmp, _form:this}, function(e) {
                    if (e.data._cmp.onFaClick) {
                        e.data._cmp.onFaClick(e.data._cmp,  e.data._form);
                    }
                });
                var nextCharacterId = cmp["nextCharacterId"];
                if(nextCharacterId){
                	$("#" + nextCharacterId).click({_cmp:cmp, _form:this}, function(e) {
                        if (e.data._cmp.onNextCharacterClick) {
                            e.data._cmp.onNextCharacterClick(e.data._cmp,  e.data._form);
                        }
                    });
                }


            } else if (xtype == "combobox") {//
                $("#" + cmp.id).mouseover({_cmp:cmp, _form:this}, function(e) {
                    if (e.data._cmp.onMouseover) {
                        e.data._cmp.onMouseover(e.data._cmp.name, e.data._form);
                    }
                });
                $("#" + cmp.id).change({_cmp:cmp, _form:this}, function(e) {
                    e.data._form.cmpValid(e.data._cmp.name);
                    if (e.data._cmp.onChange) {
                        e.data._cmp.onChange(e.data._cmp.name, e.data._form);
                    }
                });
            }
        }
        if (callback) {
            callback();
        }
    };
    
    emapform.prototype.getAjaxData = function (url, params, code, success, fail) {
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
    
    emapform.prototype.subAjaxData = function (url, params, _self, success, fail) {
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
    
    
    emapform.prototype.initCmpDics = function(url, params, cmpname, dicname, _self, callback){
    	if(!dicname){
    		dicname = cmpname;
    	}
    	if(_self._dics[dicname]){
    		return false;
    	}
    	_self.getAjaxData(url, params, 'code', function(datas){
    		_self._dics[dicname] = datas;
    		if(callback){
    			callback(_self, cmpname, datas);
    		}
    	}, null)
    };

    
};