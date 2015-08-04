define('src/Manager',[], function () {
    var xtype = "manager";
    var fullName = "Manager";
    var Manager = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            xtype: xtype,
            fullName: fullName
        },
        initialize: function (opts) {
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = String.uniqueID();
            }
            this.components = {};
        },
        getId: function () {
            return this.options.$id;
        },
        add: function (key, value) {
            this.components[key] = value;
        },
        remove:function(id){
            delete this.components[id];
        },
        get: function(id){
            return this.components[id];
        }
    });
    Manager.xtype = xtype;
    return Manager;
});

/**
 * Created by qianqianyi on 15/5/6.
 */
define('src/Validation',[], function () {
    var Validation = new Class({
        Implements: [Options],
        options: {
            $id:"",
            defaultRules:{},//预置规则
            customRules:{},//扩展规则
            onlyError:false,//只返回第一个错误，用于validateValue方法和validateObject的每个属性
            errInterval:";"//错误间的分隔符
        },
        allRules:{},//用于存放全部规则的临时变量
        initialize: function (opts) {
            if (!this.options || this.options.$id == "") {
                this.options.$id = String.uniqueID();
            }
            this.options.defaultRules = this._priRules();
            this.setOptions(opts);
            jQuery.extend(this.allRules,this.options.defaultRules);
        },
        getId:function(){
            return this.options.$id;
        },
        //～～～～～～基本校验工具方法～～～～～～
        checkRequired: function (value,customErrMsg) {
            if (!value||(typeof(value)=="object"&&value.length<1)) {
                return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("required")};
            }else{
                return {"result":true};
            }
        },
        checkLength: function (value,minLen,maxLen,customErrMsg) {
            var fieldLength = this._getLength(value);
            var errMsg = "";
            if(minLen||maxLen){
                if(minLen&&typeof(minLen)!="number"){
                    minLen = eval(minLen);
                }
                if(maxLen&&typeof(maxLen)!="number"){
                    maxLen = eval(maxLen);
                }
                if(minLen&&maxLen){
                    if ((minLen&&fieldLength < minLen) || (maxLen&&fieldLength > maxLen)) {
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("length","errorMsg_bt1")+minLen
                        +this._getErrMsg("length","errorMsg_bt2")+maxLen
                        +this._getErrMsg("length","errorMsg_bt3"));
                    }
                }else if(minLen){
                    if (minLen&&fieldLength < minLen) {
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("length","errorMsg_min")+minLen);
                    }
                }else if(maxLen){
                    if (maxLen&&fieldLength > maxLen){
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("length","errorMsg_max")+maxLen);
                    }
                }
            }
            if(errMsg){
                return {"result":false,"errorMsg":errMsg};
            }
            return {"result":true};
        },
        checkOracleLength: function (value,minLen,maxLen,customErrMsg) {
            var oracleValue = value.replace(/[^\x00-\xff]/g,"123");
            return this.checkLength(oracleValue,minLen,maxLen,customErrMsg);
        },
        checkLengthFix: function (value,fixLen,customErrMsg) {
            var fieldLength = this._getLength(value);
            if(fixLen&&typeof(fixLen)!="number"){
                fixLen = eval(fixLen);
            }
            if (fixLen&&typeof(fixLen)=="number") {
                if(fixLen!=fieldLength){
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("lengthFix")+fixLen};
                }
            }
            return {"result":true};
        },
        checkRegex: function(value,regexStr,customErrMsg){
            if(value&&value!=""&&regexStr){
                var regPattern = eval(regexStr);
                if (!regPattern.test(value)) {
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("regex")};
                }
            }
            return {"result":true};
        },
        checkLimit: function(value,min,max,customErrMsg){
            var errMsg = "";
            if(value!=null&&typeof(value)!="number"){
                try{
                    value = eval(value);
                }catch (e){
                    return {"result":true};
                }
            }
            if(value!=null&&(min||max)){
                if(min&&typeof(min)!="number"){
                    min = eval(min);
                }
                if(max&&typeof(max)!="number"){
                    max = eval(max);
                }
                if(min&&max){
                    if ((min&&value < min) || (max&&value > max)) {
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("limit","errorMsg_bt1")+min
                            +this._getErrMsg("limit","errorMsg_bt2")+max
                            +this._getErrMsg("limit","errorMsg_bt3"));
                    }
                }else if(min){
                    if (min&&value < min) {
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("limit","errorMsg_min")+min);
                    }
                }else if(max){
                    if (max&&value > max){
                        errMsg += customErrMsg?customErrMsg:(this._getErrMsg("limit","errorMsg_max")+max);
                    }
                }
            }
            if(errMsg){
                return {"result":false,"errorMsg":errMsg};
            }
            return {"result":true};
        },
        checkEqualValue: function(value,evalue,customErrMsg){
            if(value!=evalue){
                return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("equalValue")+evalue};
            }
            return {"result":true};
        },
        checkNotEqualValue: function(value,nqvalue,customErrMsg){
            if(value==nqvalue){
                return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("notEqualValue")+nqvalue};
            }
            return {"result":true};
        },
        checkFunCall:function(value,fn,params){
            if (typeof(fn) == 'function') {
                //函数返回true则不允许提交，返回false则允许提交
                var fn_result = fn(value,params);
                return fn_result;//要求格式与validation返回一致
            }
            return {"result":true};
        },
        checkAjax:function(value,url,valueKey,params){
            if(url){
                if(!valueKey){
                    valueKey = "value";
                }
                Promise.all($.ajax({
                    url: url,
                    type: params.type||"post",
                    dataType:params.dataType||"json",
                    success: function(res) {
                        return res;
                    }
                })).then(function (element) {
                    return {"result":true};
                });
            }
            //return ajax返回结果
        },
        checkEqualField:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(obj[fieldName1]&&obj[fieldName1]){
                    //都有值时
                    if((obj[fieldName1]!=obj[fieldName2])){
                        return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("equalField")};
                    }
                }else if(obj[fieldName1]||obj[fieldName1]){
                    //有一个为空，则肯定不一致
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("equalField")};
                }else{
                    //都为空则默认一致
                }
            }
            return {"result":true};
        },
        checkNotEqualField:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(obj[fieldName1]&&obj[fieldName1]){
                    //都有值时
                    if((obj[fieldName1]==obj[fieldName2])){
                        return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("notEqualField")};
                    }
                }
            }
            return {"result":true};
        },
        checkNotBothNull:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(!obj[fieldName1]&&!obj[fieldName1]){
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("notBothNull")};
                }
            }
            return {"result":true};
        },
        checkNotBothSelect:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(obj[fieldName1]&&obj[fieldName1]){
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("notBothSelect")};
                }
            }
            return {"result":true};
        },
        checkGreaterThan:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(obj[fieldName1]&&obj[fieldName1]){
                    //都有值时
                    if(!(obj[fieldName1]>obj[fieldName2])){
                        return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("greaterThan")};
                    }
                }
            }
            return {"result":true};
        },
        checkLessThan:function(obj,fieldName1,fieldName2,customErrMsg){
            if(obj&&fieldName1&&fieldName2){
                if(obj[fieldName1]&&obj[fieldName1]){
                    //都有值时
                    if(!(obj[fieldName1]<obj[fieldName2])){
                        return {"result":false,"errorMsg":customErrMsg?customErrMsg:this._getErrMsg("lessThan")};
                    }
                }
            }
            return {"result":true};
        },

        /**
         * 校验值＋一组规则
         * valRules:
         * {
         *  required:true,
            length: {
                maxLen: 10,
                minLen: 2
            },
            regex:{
                regexStr:""
            }
         */
        validateValue: function (value,valRules,customErrMsg) {
            if(valRules&&typeof(valRules) == "object"){
                var errMsg = "";
                //调用各工具方法
                //错误信息组合（；区隔）
                for(var p in valRules) {
                    var valRes = null;
                    if(valRules[p]&&this.allRules[p]){//valRules[p]为false时直接不处理
                        var valRule = this.allRules[p];
                        if(valRule.validateFunc){
                            if(typeof(valRule.validateFunc) == "string"&&this[valRule.validateFunc]){
                                valRes = this[valRule.validateFunc](value,valRules[p]);
                            }else if(typeof(valRule.validateFunc) == "function"){
                                valRes = valRule.validateFunc(value,valRules[p]);
                            }
                        }else if(valRule.regex){
                            valRes = this.checkRegex(value,valRule.regex,valRule.errorMsg);
                        }
                    }
                    if(valRes&&!valRes.result){
                        errMsg += (valRes.errorMsg+(this.options.onlyError?"":this.options.errInterval));
                        if(this.options.onlyError&&errMsg){
                            return {"result":false,"errorMsg":errMsg};
                        }
                    }
                }
                if(errMsg){
                    return {"result":false,"errorMsg":customErrMsg?customErrMsg:errMsg};
                }
            }
            //return {"result":false,"errorMsg":"校验错误测试"};
            return {"result":true};
        },
        /**
         * 校验对象＋一组规则
         * valRules:
         * {
            username: {
                length: {
                    maxLen: 10,
                    minLen: 2
                },
                regex:{
                    regexStr:""
                }
            },
            age: {
                limit: {
                    min: 18
                }
            },
            "_global": [
                 {
                     "ruleId": "equalField",
                     "fields": [
                         "pass",
                         "repass"
                     ]
                 },
                 {
                     "ruleId": "timeAfter",
                     "field1": "startTime",
                     "field2": "endTime"
                 }
             ]
         }
         */
        validateObject: function (obj,valRules,customErrMsg) {
            var errorMsg = null;
            if(obj&&valRules&&typeof(valRules) == "object"){
                //调用各工具方法
                //错误信息组合（；区隔）
                for(var p in valRules) {
                    if(p=="_global"&&valRules[p]){//联合校验
                        var complexErr = this.validateGlobalRules(obj,valRules[p]);
                        if(complexErr&&!complexErr.result){
                            errorMsg._global = complexErr.errorMsg;
                        }
                    }else if(valRules[p]){
                        var fieldValRes = this.validateValue(obj[p],valRules[p]);
                        if(fieldValRes&&!fieldValRes.result){
                            if(!errorMsg){
                                errorMsg = {};
                            }
                            errorMsg[p] = fieldValRes.errorMsg;
                        }
                    }
                }
            }
            if(errorMsg){
                return {"result":false,"errorMsg":customErrMsg?customErrMsg:errorMsg};
            }else{
                return {"result":true};
            }
        },
        validateGlobalRules:function(obj,complexRules,customErrMsg){
            var complexErrMsg = "";
            //var complexRules = valRules[p];
            if(complexRules&&complexRules.length>0) {
                //调用各工具方法
                //错误信息组合（；区隔）
                for(var t=0;t<complexRules.length;t++) {
                    var valRes = null;
                    if (complexRules[t]) {//complexRules[t]为false时直接不处理
                        var ruleName = complexRules[t].ruleId;
                        if(ruleName&& this.allRules[ruleName]){
                            var valRule = this.allRules[ruleName];
                            if (valRule.validateFunc) {//联合校验全部使用函数实现
                                if (typeof(valRule.validateFunc) == "string" && this[valRule.validateFunc]) {
                                    valRes = this[valRule.validateFunc](obj, complexRules[t]);
                                } else if (typeof(valRule.validateFunc) == "function") {
                                    valRes = valRule.validateFunc(obj, complexRules[t]);
                                }
                            }
                        }
                    }
                    if (valRes && !valRes.result) {
                        complexErrMsg += (valRes.errorMsg)+this.options.errInterval;
                    }
                }
            }
            if(complexErrMsg){
                return {"result":false,"errorMsg":customErrMsg?customErrMsg:complexErrMsg};
            }
            return {"result":true};
        },
        /**
         * 扩展校验规则
         * ruleSetting:
         * {
         *  validateFunc:[fun], //校验处理方法
         *  regex:"",   //正则表达式，不配置validateFunc也能自动生效，若配置了validateFunc，则由validateFunc调用
         *  errorMsg:[error Message] //错误提示
         * }
         */
        addCustomRule: function (ruleName,ruleSetting) {
            if (this.options.defaultRules&& this.options.defaultRules[ruleName]) {
                return {"result": false, "errorMsg": "系统预置规则中已有同名规则" + ruleName};//预置规则不容许重写
            }else{
                this.options.customRules[ruleName] = ruleSetting;//自定义规则可被重写
                this.allRules[ruleName] = ruleSetting;//同样刷新全部集合中的定义
                return {"result":true};
            }
        },
        //获取自定义规则
        getCustomRule:function(ruleName){
            if(ruleName){
                return this.options.customRules[ruleName];
            }
            return this.options.customRules;
        },
        //＝＝＝＝＝＝＝＝＝＝＝＝＝＝以下为私有方法＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
        //～～～～～～d单项校验类～～～～～～
        _valRegex:function(value,params){
            if(value&&params&&params.regexStr){
                return this.checkRegex(value,params.regexStr,params.customErrMsg);
            }
            return {"result":true};
        },
        _valRequired:function(value,isOpen){
            if(isOpen){ //支持关闭，其实在入口时已经屏蔽掉false的情形
                return this.checkRequired(value);
            }
        },
        _valLength:function(value,params){
            if(value&&(params.minLen||params.maxLen)){
                return this.checkLength(value,params.minLen,params.maxLen,params.customErrMsg);
            }
            return {"result":true};
        },
        _valOracleLength:function(value,params){
            if(value&&(params.minLen||params.maxLen)){
                return this.checkOracleLength(value,params.minLen,params.maxLen,params.customErrMsg);
            }
            return {"result":true};
        },
        _valLengthFix:function(value,params){
            if(value&&params.fixLen){
                return this.checkLengthFix(value,params.fixLen,params.customErrMsg);
            }
            return {"result":true};
        },
        _valLimit:function(value,params){
            if(value!=null&&value!=""&&params&&(params.min||params.max)){
                return this.checkLimit(value,params.min,params.max,params.customErrMsg);
            }
            return {"result":true};
        },
        _valFunCall:function(value,params){
            if(value&&params&&params.fun){
                return this.checkFunCall(value,params.fun,params.customErrMsg);
            }
            return {"result":true};
        },
        _valAjax:function(value,params){
            if(value&&params&&params.url){
                return this.checkAjax(value,params.url,params,params.customErrMsg);
            }
            return {"result":true};
        },
        _valEqualValue:function(value,params){
            if(value&&params&&params.eValue){
                return this.checkEqualValue(value,params.eValue,params.customErrMsg);
            }
            return {"result":true};
        },
        _valNotEqualValue:function(value,params){
            if(value&&params&&params.nqValue){
                return this.checkNotEqualValue(value,params.nqValue,params.customErrMsg);
            }
            return {"result":true};
        },
        //～～～～～～联合查询类～～～～～～
        _valEqualField:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkEqualField(obj,params.field1,params.field2,params.customErrMsg);
            }
            return {"result":true};
        },
        _valNotEqualField:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkNotEqualField(obj,params.field1,params.field2,params.customErrMsg);//多值
            }
            return {"result":true};
        },
        _valNotBothNull:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkNotBothNull(obj,params.field1,params.field2,params.customErrMsg);//多值
            }
            return {"result":true};
        },
        _valNotBothSelect:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkNotBothSelect(obj,params.field1,params.field2,params.customErrMsg);//多值
            }
            return {"result":true};
        },
        _valGreaterThan:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkGreaterThan(obj,params.field1,params.field2,params.customErrMsg);//多值
            }
            return {"result":true};
        },
        _valLessThan:function(obj,params){
            if(obj&&params&&params.field1&&params.field2){
                return this.checkLessThan(obj,params.field1,params.field2,params.customErrMsg);//多值
            }
            return {"result":true};
        },

        //～～～～～～工具方法～～～～～～
        _getErrMsg:function(ruleName,errMsgName){
            if(!errMsgName){
                errMsgName = "errorMsg";
            }
            if(this.allRules&&this.allRules[ruleName]){
                return this.allRules[ruleName][errMsgName];
            }
            return null;
        },
        _getRuleSetting:function(ruleName){
            if(this.allRules){
                return this.allRules[ruleName];
            }
            return null;
        },
        _getLength:function(value){
            var fieldLength = 0;
            if(value){
                if(typeof(value)=="object"){
                    fieldLength = value.length;
                }else{
                    fieldLength = value?String(value).length:0;
                }
            }
            return fieldLength;
        },
        _priRules:function(){
            return {
                //单值校验
                "regex": {
                    "validateFunc": "_valRegex",//系统中的方法可以直接传方法名
                    "errorMsg": "格式不符合要求"
                },
                "required": {
                    "validateFunc": "_valRequired",//与this.checkRequired同效
                    "errorMsg": "非空选项"
                },
                "length": {
                    "validateFunc": "_valLength",
                    "errorMsg_min": "长度必须大于",
                    "errorMsg_max": "长度必须小于",
                    "errorMsg_bt1": "长度必须在 ",
                    "errorMsg_bt2": "－",
                    "errorMsg_bt3": " 之间"
                },
                "oracleLength": {
                    "validateFunc": "_valOracleLength",
                    "errorMsg_min": "长度必须大于",
                    "errorMsg_max": "长度必须小于",
                    "errorMsg_bt1": "长度必须在 ",
                    "errorMsg_bt2": "－",
                    "errorMsg_bt3": " 之间"
                },
                "lengthFix": {
                    "validateFunc": "_valLengthFix",
                    "errorMsg": "长度必须为"
                },
                "limit": {
                    "validateFunc": "_valLimit",
                    "errorMsg_min": "大小必须大于",
                    "errorMsg_max": "大小必须小于",
                    "errorMsg_bt1": "大小必须在 ",
                    "errorMsg_bt2": "－",
                    "errorMsg_bt3": " 之间"
                },
                "funCall":{
                    "validateFunc": "_valFunCall",
                    "errorMsg": "前端校验失败"
                },
                "ajax":{
                    "validateFunc": "_valAjax",
                    "errorMsg": "服务端校验失败"
                },
                "equalValue": {
                    "validateFunc": "_valEqualValue",
                    "errorMsg": "必须等于"
                },
                "notEqualValue": {
                    "validateFunc": "_valNotEqualValue",
                    "errorMsg": "不能等于"
                },
                "telephone": {
                    "regex": "/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/",
                    "errorMsg": "非有效的电话号码,如:010-29292929"
                },
                "mobilePhone": {
                    "regex": "/(^0?[1][3458][0-9]{9}$)/",
                    "errorMsg": "非有效的手机号码"
                },
                "phone": {
                    "regex": "/^((\\(\\d{2,3}\\))|(\\d{3}\\-))?(\\(0\\d{2,3}\\)|0\\d{2,3}-)?[1-9]\\d{6,7}(\\-\\d{1,4})?$/",
                    "errorMsg": "非有效的联系号码"
                },
                "email": {
                    "regex": "/^[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}$/",
                    "errorMsg": "非有效的邮件地址"
                },
                "date": {
                    "regex": "/^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/",
                    "errorMsg": "非有效的日期,如:2008-08-08"
                },
                "ip": {
                    "regex": "/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/",
                    "errorMsg": "非有效的IP"
                },
                "accept": {
                    "regex": "none",
                    "errorMsg": "非有效的文件格式"
                },
                "chinese": {
                    "regex": "/^[\u4e00-\u9fa5]+$/",
                    "errorMsg": "必须为中文"
                },
                "url": {
                    "regex": "/^((https|http|ftp|rtsp|mms)?:\\/\\/)?"
                    + "(([0-9]{1,3}.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
                    + "|" // 允许IP和DOMAIN（域名）
                    + "([0-9a-z_!~*'()-]+\\.)*" // 域名- www.
                    + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\." // 二级域名
                    + "[a-z]{2,6})" // first level domain- .com or .museum
                    + "(:[0-9]{1,5})?" // 端口- :80,最多5位
                    + "[\\/a-zA-Z0-9\\/]{0,}"
                    + "(\\/[0-9a-zA-Z\\.\\?\\-\\&=]{0,})?$/",
                    "errorMsg": "非有效的网址."},
                "domain": {
                    "regex": "/^([\\w-]+\\.)+((com)|(net)|(org)|(gov\\.cn)|(info)|(cc)|(com\\.cn)|(net\\.cn)|(org\\.cn)|(name)|(biz)|(tv)|(cn)|(mobi)|(name)|(sh)|(ac)|(io)|(tw)|(com\\.tw)|(hk)|(com\\.hk)|(ws)|(travel)|(us)|(tm)|(la)|(me\\.uk)|(org\\.uk)|(ltd\\.uk)|(plc\\.uk)|(in)|(eu)|(it)|(jp))$/",
                    "errorMsg": "非有效的域名."},
                "zipCode": {
                    "regex": "/^[1-9]\\d{5}$/",
                    "errorMsg": "非有效的邮政编码."},
                "idCard": {
                    //对身份证的验证：15位和18位数字或者17位数字+X
                    "regex": "/(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)/",
                    "errorMsg": "非有效的身份证号码."},
                "mp3": {
                    "regex": "/^(http(s)?:\\/\\/)[\\w\\W]+(\.(mp|MP)3)$/",
                    "errorMsg": "非有效的mp3链接地址"},
                "qq": {
                    "regex": "/^[1-9]\\d{4,9}$/",
                    "errorMsg": "非有效的QQ号码."},
                "onlyInteger": {
                    "regex": "/^[0-9-]+$/",
                    "errorMsg": "必须为整数"},
                "onlyNumber": {
                    "regex": "/^\\-?[0-9\\,]*\\.?\\d*$/",
                    "errorMsg": "必须为数字"},
                "points": {
                    "regex": "/^[1-9]\\d{0,2}$/",
                    "errorMsg": "必须为1~999的整数"},
                "awardTimes": {
                    "regex": "/^[1-9]\\d{0,4}$/",
                    "errorMsg": "必须为1~99999的整数"},
                "notZero": {
                    "regex": "/^[1-9]\\d*$/",
                    "errorMsg": "必须大于零整数"},
                "oneToNine": {
                    "regex": "/^[1-9]{1}$/",
                    "errorMsg": "必须为1-9的整数"},
                "onlyLetter": {
                    "regex": "/^[a-zA-Z]+$/",
                    "errorMsg": "必须为英文字母"},
                "noSpecialCharacters": {
                    "regex": "/^[0-9a-zA-Z]+$/",
                    "errorMsg": "必须为英文字母和数字"},
                "imageCharacters": {
                    "regex": "/^[0-9]+(%|px)$/",
                    "errorMsg": "非百分数或者像素值，例如15%或者15px"},
                "onlyFile": {
                    "regex": "/^[0-9a-zA-Z]+\\.*[a-zA-Z]{0,4}$/",
                    "errorMsg": "目录或者文件名不合法"
                },
                //联合校验
                "equalField": {
                    "validateFunc": "_valEqualField",
                    "errorMsg": "两次输入不一致"
                },
                "notEqualField": {
                    "validateFunc": "_valNotEqualField",
                    "errorMsg": "两者不能相同"
                },
                "notBothNull": {
                    "validateFunc": "_valNotBothNull",
                    "errorMsg": "两者不能同时为空"
                },
                "notBothSelect": {
                    "validateFunc": "_valNotBothSelect",
                    "errorMsg": "两者不能同时选择"
                },
                "greaterThan": {
                    "validateFunc": "_valGreaterThan",
                    "errorMsg": "前者必须大于后者"
                },
                "lessThan": {
                    "validateFunc": "_valLessThan",
                    "errorMsg": "前者必须小于后者"
                }
            };
        }
    });
    Validation.xtype = "validation";
    return Validation;
});
/**
 * Created by qianqianyi on 15/5/6.
 */
define('src/Utils',[], function () {
    var Utils = new Class({
        uuid: function () {
            return String.uniqueID();
        },
        ajax: function (url, params, success, fail) {
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
        },
        syncAjax: function (url, params) {
            var result = null;
            jQuery.ajax({
                url: url,
                async:false,
                data: params,
                type:'POST',
                dataType: 'json',
                cache: false,
                success: function (data) {
                    result = data;
                },
                error: function() {}
            });
            return result;
        }
    });
    return Utils;
});
define('src/data/DataConstant',[], function (Constant) {
    var constant = {
        status: "$status$",
        notModify: "$notModify$",
        add: "add",
        update: "update",
        remove: "delete",
        //pageSize:'pageSize',
        //pageNo:'pageNo',
        //totalSize:'totalSize',
        //data:'data'
        pageSize:'pageSize',
        pageNo:'pageNumber',
        totalSize:'totalSize',
        data:'datas',
        rows:'rows'
    }
    //sync data send ds1={name:xxx}
    /*
    {
        result:{
            datas:{
                ds1:{
                    name:'',
                        age:'',
                        $status$:''
                },
                ds2:{
                    rows:[],
                    pageSize:1,
                    pageNumber:1,
                    totalCount:1000
                }
            }
        }
    }
    */
    return constant;
});
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
define('src/data/DataSource',["./DataConstant"], function (Constant) {
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
                    Page.utils.ajax($this.options.fetchUrl, params, function (data) {
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

                Page.utils.ajax($this.options.syncUrl, params, function (data) {
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
            Page.manager.remove(this.getId());
        }
    });
    return DataSource;
});
/**
 *
 * meta :{
 *   mainAlias:'',
 *
 *
 *
 * }
 *
 *
 *
 */
define('src/data/DataValue',["./DataConstant", "./DataSource"], function (Constant, DataSource) {

    var xtype = "dataValue";
    var DataValue = new Class({
        Implements: [Events, Options, DataSource],
        options: {
            $id: "",
            $xtype: xtype,
            data: {},
            fetchUrl: '',
            fetchParam: {},
            syncUrl: '',
            syncParam: {},
            autoSync: false,
            model: {
                modelId: '',// 根据ID获取模型
                id: 'wid',
                mainAlias:'',
                childAlias: [],
                refAlias: [],
                status: Constant.status,
                notModify: Constant.notModify,
                add: Constant.add,
                update: Constant.update,
                remove: Constant.remove
            }
        },

        initialize: function (opts) {
            this.childDS = {};
            this.refDS = {};

            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            this._initData();

        },

        getId: function () {
            return this.options.$id;
        },

        setStatus:function(status){
            this.options.data[this.options.model.status] = status;
        },

        _initData: function (forceNotModify) {
            var $this = this;
            if(this.options.data) {
                
            }
            if (!this.options.data[this.options.model.status] || forceNotModify) {
                this.options.data[this.options.model.status] = this.options.model.notModify;
            }

            this.options.model.childAlias.each(function (v, i) {
                if ($this.options.data[v]) {
                    var child = Page.create("dataSet", {
                        data: $this.options.data[v]
                    });
                    $this.childDS[v] = child;
                    delete $this.options.data[v];
                }
            });
            this.options.model.refAlias.each(function (v, i) {
                if ($this.options.data[v]) {
                    var ref = Page.create("dataValue", {
                        data: $this.options.data[v]
                    });
                    $this.refDS[v] = ref;
                    delete $this.options.data[v];
                }
            });
            this.dataStack = [];
            if(this.options.data[this.options.model.status] == this.options.model.add){
                var obj = {}
                Object.merge(obj, this.options.data);
                delete obj[this.options.model.status];
                this.dataStack.push(obj);
            }

        },

        _otherFetchParam: function () {
            var page = {};
            return page;
        },

        getChildDS: function (alias) {
            return this.childDS[alias];
        },
        getRefDS: function (alias) {
            return this.refDS[alias];
        },
        changeStatus: function (status) {
            this.options.data[this.options.model.status] = status;
        },
        getStatus: function () {
            return this.options.data[this.options.model.status];
        },
        getValue: function () {
            var value = {};
            var $this = this;
            Object.merge(value, this.options.data);
            this.options.model.childAlias.each(function (v, i) {
                if ($this.childDS[v]) {
                    var cvalue = $this.childDS[v].getValue();
                    value[v] = cvalue;
                }
            });
            this.options.model.refAlias.each(function (v, i) {
                if ($this.refDS[v]) {
                    var cvalue = $this.refDS[v].getValue();
                    value[v] = cvalue;
                }

            });
            return value;
        },

        getUploadValue:function(filterNotModify){
            var value = {};
            var $this = this;
            if(filterNotModify) {
                Object.merge(value, this.getModifiedValue());
            }else {
                Object.merge(value, this.options.data);
            }

            this.options.model.childAlias.each(function (v, i) {
                if ($this.childDS[v]) {
                    var cvalue = $this.childDS[v].getUploadValue(filterNotModify);
                    value[v] = cvalue;
                }
            });
            this.options.model.refAlias.each(function (v, i) {
                if ($this.refDS[v]) {
                    var cvalue = $this.refDS[v].getUploadValue(filterNotModify);
                    value[v] = cvalue;
                }
            });
            return value;
        },

        updateRecord: function (value, notFireEvent) {
            var r = this.options.data;
            if (!notFireEvent) {
                this.fireEvent("beforeUpdateRecord", [value, r]);
            }
            Object.merge(r, value);
            this.dataStack.push(value);
            if (r[this.options.model.status] != this.options.model.add) {
                r[this.options.model.status] = this.options.model.update;
            }
            if (!notFireEvent) {
                this.fireEvent("afterUpdateRecord", [value]);
            }
            this.fireEvent("recordUpdated", r);
            this._valueChanged();
        },

        deleteRecord: function () {
            var r = this.options.data;
            r[this.options.model.status] = this.options.model.remove;
            this._valueChanged();
        },

        getModifiedValue: function () {
            var arr = {};
            arr[this.options.model.id] = this.options.data[this.options.model.id];
            this.dataStack.each(function (v) {
                Object.merge(arr, v);
            });
            arr[this.options.model.status] = this.options.data[this.options.model.status];
            var $this = this;
            this.options.model.childAlias.each(function (v, i) {
                if ($this.options.data[v]) {
                    arr[v] = $this.getChildDS(v).getModifiedValue();
                }
            });
            this.options.model.refAlias.each(function (v, i) {
                if ($this.options.data[v]) {
                    arr[v] = $this.getRefDS(v).getModifiedValue();
                }
            });
            arr[this.options.model.id] = $this.options.data[this.options.model.id];
            return arr;
        }
    });
    DataValue.xtype = xtype;
    return DataValue;
});
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
define('src/data/DataSet',["./DataConstant", "./DataSource"], function (Constant, DataSource) {

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
                    var dv = Page.create("dataValue", {
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
            var dv = Page.create("dataValue", {
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
/**
 * Created by JKYANG on 15/5/12.
 */
define('src/data/DataBinder',[], function () {
    var xtype = "dataBinder";
    var DataBinder = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $xtype: xtype,
            dataValueId: null,// 可以为dataValue  也可以为dataSet
            fieldId: null, //如果为空，则widget要实现绑定机制,即setValue，getValue,参数为对象
            widgetId: null
        },
        initialize: function (opts) {
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            this.bind();
        },
        bind: function () {
            var dataValue = Page.manager.components[this.options.dataValueId];
            var widget = Page.manager.components[this.options.widgetId];
            var $this = this;
            var v = dataValue.getValue();
            if ($this.options.fieldId) {
                var value = v[$this.options.fieldId] ? v[$this.options.fieldId]:"";
                var display = v[$this.options.fieldId+"_DISPLAY"];
                widget.setValue({value: value, display: display},true);
            }

            this.widgetValueChangeCallback = function (value) {
                var fieldId = $this.options.fieldId;
                var val = {};
                if (fieldId) {
                    val[fieldId] = value;
                } else {
                    val = value;
                }
                dataValue.updateRecord(val, true);
            }
            this.dataValueChangeCallback = function (record) {
                var fieldId = $this.options.fieldId;
                var v = record[fieldId];
                if(!v) {
                    v = "";
                }
                var display = record[fieldId+"_DISPLAY"];
                widget.setValue({value: v, display: display}, true);
            }
            widget.addEvent("valueChange", this.widgetValueChangeCallback);
            dataValue.addEvent("afterUpdateRecord", this.dataValueChangeCallback);
        },
        getId: function () {
            return this.options.$id;
        },

        destroy: function () {
            var dataValue = Page.manager.components[this.options.dataValueId];
            var widget = Page.manager.components[this.options.widgetId];
            dataValue.removeEvent("afterUpdateRecord", this.dataValueChangeCallback);
            widget.removeEvent("valueChange", this.widgetValueChangeCallback);
        }
    });
    DataBinder.xtype = xtype;
    return DataBinder;
});
/**
 * Created by JKYANG on 15/4/23.
 */
/**
 * configs
 * properties
 * methods
 * events
 * css_var
 */
define('src/widget/Base',[], function () {
    var xtype = "base";
    var fullName = "Base";
    var baseURL = "./widget/";
    var Base = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            vid: "",
            uuid: "",
            $xtype: xtype,
            $fullName: fullName,
            $parentId: null,
            $appendEl: null,
            show: true,
            _addWrapDiv: true//是否在组件外边套DIV（ms－controller）
        },
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
            opts = this.mix$(opts);
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
            if (this.options.vid == '') {
                this.options.vid = this.options.$id;
            }
            if (this.options.uuid == '') {
                this.options.uuid = String.uniqueID();
            }
            var that = this;
            this.vmodel = avalon.define(this.options);
            this.vmodel.$watch("$all", function (name, newValue, oldValue) {
                var notFire = false ;
                //var n = newValue + "";
                //if(n.slice(0,2) == '@F') {
                //    notFire = true ;
                //    newValue = newValue.slice(2);
                //
                //}
                //that.setAttr(name, newValue, notFire);

                if(this[name+"_fromInterface"]!=true) {
                    this[name+"_fromWatch"]=true;
                    that.setAttr(name, newValue);
                }
                else {
                    this[name+"_fromInterface"]=false;
                }


            });
        },

        getId: function () {
            return this.vmodel.$id;
        },
        getAttr: function (key) {
            return this.vmodel[key];
        },
        setAttr: function (key, value, notFireEvent) {
            var oldValue = this.vmodel[key];
            //if(typeOf(value) == 'string' || typeOf(value) == 'number') {
            //    this.vmodel[key] = notFireEvent ? "@F"+ value : value;
            //}else {
            //    this.vmodel[key] = value;
            //}

            if(this.vmodel[key+"_fromWatch"] != true) {
                //if(this.options[key] != value) {
                if(this.vmodel[key] !== value) {
                    this.vmodel[key+"_fromInterface"] = true;
                }
                this.vmodel[key] = value;
            }
            else {
                this.vmodel[key+"_fromWatch"] = false;
            }


            if(notFireEvent)  {

            }else {
                var privateMethod2Invoke = '_' + key + "Change";
                if (this[privateMethod2Invoke]) {
                    this[privateMethod2Invoke](value, oldValue, this.vmodel.model);
                    // old value, new value, vm.model
                }
                this.fireEvent(key + "Change", [value, oldValue, this.vmodel.model]);
            }
            return this;
        },
        setAttrs: function (opts) {
            //todo
            for (var o in opts) {
                this.setAttr(o, opts[o]);
            }
        },
        render: function (parent) {
            this.fireEvent("beforeRender", [this.vmodel]);
            if (this["_beforeRender"]) {
                this["_beforeRender"](this.vmodel);
            }
            //var element = this.getElement();
            var $this = this;
            var tmp = this.getTemplate();

            var e = jQuery("<div></div>");
            if (!this.options._addWrapDiv) {
                e = jQuery(tmp);
            } else {
                e.append(tmp);
            }
            e.addClass("page_" + $this.getAttr('$xtype')).attr("ms-important", $this.getId());
            var parentDOM = parent;
            if (!parentDOM) {
                parentDOM = $this.getParentElement();
            }
            //parentDOM.append(e);
            $this.$element = e;
            $this.element = e[0];
            //avalon.nextTick(function(){
                //avalon.scan(parentDOM[0],this.vmodel);
                avalon.scan($this.element,this.vmodel);
                $this.fireEvent("afterRender", [this.vmodel]);
                if (this["_afterRender"]) {
                    this["_afterRender"](this.vmodel);
                }
                parentDOM.append(e);
            //});


            return this;
        },

        getElement: function () {
            return this.element;
        },

        refresh: function () {
            this.element = null;
            this.render();
        },

        /*
         getTemplate: function () {
         var $this = this;
         return new Promise(function (resolve) {
         if (!$this.element) {
         $this.element = new Element("div." + $this.getAttr('$xtype'));
         $this.element.set("ms-controller", $this.getId());
         //TODO 合并后代码模版获取方式可能发生变化
         require(['text!' + baseURL + $this.getAttr('$fullName') + ".html", 'css!' + baseURL + $this.getAttr('$fullName') + ".css"], function (template) {
         $this.element.appendHTML(template);
         avalon.scan($this.element);
         resolve($this.element);
         });
         } else {
         resolve($this.element);
         }
         });
         },
         */
        getParentElement: function () {
            if (this.options.$parentId == null) {
                return jQuery(document.body);
            } else {
                return jQuery("#" + this.options.$parentId);
            }
        },
        show: function () {
            this.setAttr("show", true);
            var pw = this.getAttr("parentLayoutWidgetId");
            if(pw){
                var widget = Page.manager.components[pw];
                if(widget){
                    widget.show();
                }
            }
        },
        hide: function () {
            this.setAttr("show", false);
            var pw = this.getAttr("parentLayoutWidgetId");
            if(pw){
                var widget = Page.manager.components[pw];
                if(widget){
                    widget.hide();
                }
            }
        },
        destroy: function () {
            if(this.$element){
                this.$element.remove();
            }
            Page.manager.remove(this.getId());
            delete avalon.vmodels[this.getId()];
        }
    });
    Base.xtype = xtype;
    return Base;
});

/**
 * Created by qianqianyi on 15/4/23.
 */
define('src/widget/form/BaseFormWidget',['../Base'], function (Base, formTpl, inlineTpl) {
    var xtype = "baseFormWidget";
    var BaseFormWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            status: 'edit',//default = edit |edit|readonly|disabled

            parentTpl: "form",  //组件的父模板类型 default=form |form|inline
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            initValue: '',// 初始值
            initDisplay: '',

            value: '', // 具体值
            display: '',//显示值

            valueChanged: false, //初始值发生了变化
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            label: '未设置标题', //标题
            showLabel: true,
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

            hasMessageBar: {
                get: function() {
                    return this.showMessage || this.showErrorMessage;
                }
            },

            message: '',
            showMessage: true,

            errorMessage: '',
            showErrorMessage: false,
            tipPosition:"bottom",

            glyphicon: '',//eg:glyphicon-ok
            showGlyphicon: false,

            required: false,
            showRequired: true,

            validationRules: {},

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            labelSpan: 4,
            $rowNum: 1,
            $colNum: 1,
            height: null,
            controlPadding: '0',

            //data binding
            bind: '',

            parentLayoutWidgetId:''//在表单布局的时候使用

        },
        initialize: function (opts) {
            if (opts['display'] == undefined) {
                opts['display'] = opts['value'];
            }
            if (opts['value'] != undefined) {
                opts['initValue'] = opts['value'];
            }
            if (opts['display'] != undefined) {
                opts['initDisplay'] = opts['display'];
            }
            this.parent(opts);
        },
        render: function (widgetDom) {
            this.fireEvent("beforeRender", [this.vmodel]);
            var $this = this;
            var tmp = this.getTemplate();

            var widgetType = $this.options.$xtype;


            if (!widgetDom) {
                widgetDom = $this.getParentElement();
            }
            this.handleDom(widgetDom);

            /*

             var compTemp = formTpl;
             if ("inline" == $this.options.parentTpl) {
             compTemp = inlineTpl;  //待扩展，设置为表格的模板 gridTpl
             }
             //替换模板中的子模板名称
             //            compTemp = compTemp.replace(/\{\{TEMPLATENAME\}\}/g, widgetType+"_temp_"+$this.options.uuid);
             //替换模板中的子模板内容
             compTemp = compTemp.replace(/\{\{TEMPLATEVALUE\}\}/g, tmp);
             //compTemp = tmp;
             */


            var e = jQuery("<div></div>").addClass("page_" + $this.getAttr('$xtype')).attr("ms-important", $this.getId());
            //e.append(compTemp);

            var parentDom = widgetDom.parent();
            e.append(widgetDom);
            parentDom.append(e);

            $this.$element = e;
            $this.element = e[0];

            if ("inline" == $this.options.parentTpl && (this.getAttr("showMessage") || this.getAttr("showErrorMessage"))) {
                var msgs = "";
                if (this.getAttr("showMessage")) {
                    msgs += this.getAttr("message");
                }
                if (this.getAttr("showErrorMessage") && this.getAttr("errorMessage")) {
                    msgs += this.getAttr("errorMessage") + " ";
                }
                if (msgs) {
                    this.toolTip = Page.create("tooltip", {
                        content: msgs,
                        target: this.options.$parentId,
                        parentDom:this.getParentElement()||this.getElement(),
                        position: this.options.tipPosition,
                        autoHide: false
                    });
                    this.toolTip.render();
                    this.toolTip.show();
                }
            }


            //avalon.nextTick(function(){
            //setTimeout(function(){
            //avalon.scan($this.getParentElement()[0], $this.vmodel);
            avalon.scan($this.element);

            //var e = $('<div class="page_combobox" avalonctrl="sex1"><div><table class="form-horizontal-table"><tbody><tr><td class="form-label col-md-4 col-xs-4 col-sm-4 col-lg-4">        <span class="ampS-required-asterisk" style="display: none;">        *</span>        <label class="control-label">学院（多选）</label>        </td>        <td class="col-xs-7 col-sm-7 col-md-7 col-lg-7" style="padding: 0px;">            <!--调用组件模板-->        <div class="form-group" style=" margin-bottom: 0px;" name="ComboBoxWidget_sex1">        <div class="input-group chosen-container chosen-with-drop chosen-container-multi" style="width: 100%;">            <!--多选区域-->        <div style="border: 1px solid #CBD5DD;  border-radius: 2px;min-height: 34px;" title="">        <ul class="chosen-choices" style="border: 0px;">            <!--repeat481977894902--><li class="search-choice">        <span>计算机学院</span>        <a class="search-choice-close" data-option-array-index="105"></a>        </li><!--repeat481977894902--><li class="search-choice">        <span>经管学院</span>        <a class="search-choice-close" data-option-array-index="105"></a>        </li><!--repeat481977894902--><!--repeat481977894902:end-->        <li class="search-field">        <input type="text" autocomplete="off" tabindex="4" style="width: 25px;">        </li>        </ul>        </div>            <!--单选可搜索-->            <!--ms-if-->            <!--单选不可搜索-->            <!--ms-if-->            <!--下拉面板区域-->            <!--ms-if-->        </div>        </div>            <!--ms-if-->        </td>        <td class="form-icon-container  col-xs-1 col-sm-1 col-md-1 col-lg-1">        <span class="glyphicon" style="display: none;"></span>        </td>        </tr>        <tr class="form-horizontal-message">        <td></td>        <td class="text-muted" colspan="2" style="padding: 0px;">        <span>  </span>        <span></span>        </td>        </tr>        </tbody></table>        </div></div>');
            //var e = $('<div class="page_input" avalonctrl="username"><div>            <table class="form-horizontal-table">            <tbody><tr>            <td class="form-label col-md-2 col-xs-2 col-sm-2 col-lg-2">            <span class="ampS-required-asterisk" style="display: none;">            *            </span>            <label class="control-label">您的姓名</label>            </td>            <td class="col-xs-9 col-sm-9 col-md-9 col-lg-9" style="padding: 0px;">                <!--调用组件模板-->            <input class="form-control form-widget-to-focus-class form-text" readonly="true">            </td>            <td class="form-icon-container  col-xs-1 col-sm-1 col-md-1 col-lg-1">            <span class="glyphicon glyphicon-ok" style="display: none;"></span>            </td>            </tr>            <tr class="form-horizontal-message">            <td></td>            <td class="text-muted" colspan="2" style="padding: 0px;">            <span> 请输入2-5个汉字 </span>            <span></span>            </td>            </tr>            </tbody></table>            </div></div>');
            //parentDOM.append(e);

            $this.fireEvent("afterRender", [$this.vmodel]);
            if ($this["_afterRender"]) {
                $this["_afterRender"]($this.vmodel);
            }
            if ($this.options.bind != '') {
                var bindField = $this.options.bind;
                if (bindField) {
                    var f = bindField.split(".");
                    if (f.length != 2) {
                        throw new Error('bind error' + bindField);
                    }
                    var dsId = f[0];
                    var dsField = f[1];
                    var ds = {
                        dataValueId: dsId,
                        fieldId: dsField,
                        widgetId: $this.getId()
                    };
                    var dbinder = Page.create('dataBinder', ds);
                    $this.dataBind = dbinder;
                }
            }
            //}, 0);



            return this;
        },
        getValue: function () {
            return this.getAttr('value');
        },
        getDisplay: function () {
            return this.getAttr("display");
        },
        setValue: function (value, notFireFormValueChangeEvent) {
            //if(undefined == notFireFormValueChangeEvent) notFireFormValueChangeEvent = true;
            if (typeOf(value) == 'string' || typeOf(value) == 'number') {
                this.setAttr("value", value, notFireFormValueChangeEvent);
                this.setAttr("display", value);
                this.setAttr("valueChanged", true);
            } else if (typeOf(value) == 'object') {
                if (value['value'] != undefined) {
                    this.setAttr("value", value['value'], notFireFormValueChangeEvent);
                    if (value['display']) {
                        this.setAttr("display", value['display']);
                    } else {
                        this.setAttr("display", value['value']);
                    }
                }
                this.setAttr("valueChanged", true);
            } else {
                window.console.log('set value error,unknown structure ...' + value);
            }

        },
        getInitValue: function () {
            return this.getAttr("initValue");
        },
        getInitDisplay: function () {
            return this.getAttr("initDisplay");
        },
        reset: function () {
            var that = this;
            this.setValue({
                value: that.getInitValue(),
                display: that.getInitDisplay()
            })
        },
        switchStatus: function (status) {
            //readonly | edit | ready2edit ?
            var that = this;
            if (status == 'edit') {
                this.setAttrs({
                    status: status,
                    showErrorMessage: false,
                    showMessage: true,
                    showRequired: that.getAttr("required")
                });
            } else if (status == 'readonly') {
                this.setAttrs({
                    status: status,
                    showErrorMessage: false,
                    showMessage: false,
                    showRequired: false
                });
            } else if (status == 'disabled') {
                this.setAttrs({
                    status: status,
                    showErrorMessage: false,
                    showMessage: false,
                    showRequired: that.getAttr("required")
                });
            }else if (status == 'ready2edit') {

            } else {
                window.console.error("unknown status, it should be in edit|readonly|ready2edit|disabled");
            }
        },
        focus: function () {
            //todo every form widget to extend
            window.console.error("need to be extended.");
        },
        blur: function () {
            //todo every form widget to extend
            window.console.error("need to be extended.");
        },
        validate: function () {
            //var valRes = Page.validation.validateValue(this.getValue(),this.getAttr("validationRules"));
            var validateTool = Page.create("validation", {onlyError: true});//后续由系统统一创建，只需调用即可

            var valRes = null;
            if (this.getAttr("required")) {//先判断是否必填
                valRes = validateTool.checkRequired(this.getValue());
            }
            if ((!valRes || valRes.result) && this.getAttr("validationRules")) {//再判断校验规则
                valRes = validateTool.validateValue(this.getValue(), this.getAttr("validationRules"));
            }
            if (valRes && !valRes.result) {//将错误信息赋值给属性
                this.setAttr("errorMessage", valRes.errorMsg);
                this.setAttr("showErrorMessage", true);
            } else {//清空错误信息
                this.setAttr("errorMessage", "");
                this.setAttr("showErrorMessage", false);
            }
        },
        isValid: function (notShowMessage) {
            var validateTool = Page.create("validation", {onlyError: true});//后续由系统统一创建，只需调用即可

            var valRes = null;
            if (this.getAttr("required")) {//先判断是否必填
                valRes = validateTool.checkRequired(this.getValue());
            }
            if ((!valRes || valRes.result) && this.getAttr("validationRules")) {//再判断校验规则
                valRes = validateTool.validateValue(this.getValue(), this.getAttr("validationRules"));
            }
            if (valRes && !valRes.result) {//将错误信息赋值给属性
                if (notShowMessage) {

                } else {
                    this.setAttr("errorMessage", valRes.errorMsg);
                    this.setAttr("showErrorMessage", true);
                }
                return false;
            } else {//清空错误信息
                if (notShowMessage) {

                } else {
                    this.setAttr("errorMessage", "");
                    this.setAttr("showErrorMessage", false);
                }
                return true;
            }
        },
        isFormWidget: function () {
            return true;
        },

        destroy: function () {
            this.parent();
            if (this.dataBind) {
                this.dataBind.destroy();
            }
        },
        _showMessageChange:function(){
            this._errorMessageChange();
        },
        _showErrorMessageChange:function(){
            this._errorMessageChange();
        },
        _errorMessageChange: function () {
            var msgs = "";

            if (this.getAttr("showErrorMessage") && this.getAttr("errorMessage")) {
                msgs = this.getAttr("errorMessage");
            }else if(this.getAttr("showMessage")) {
                msgs = this.getAttr("message");
            }
            if (msgs === "") {
                if (this.toolTip) {
                    this.toolTip.destroy();
                    this.toolTip = null;
                }
            } else if ("inline" == this.options.parentTpl && (this.getAttr("showMessage") || this.getAttr("showErrorMessage"))) {
                if(this.toolTip) {
                    this.toolTip.setAttr("content", msgs||"");
                }else{
                    this.toolTip = Page.create("tooltip", {
                        content: msgs,
                        target: this.options.$parentId,
                        parentDom:this.getElement(),
                        position:this.options.tipPosition,
                        autoHide: false
                    });
                    this.toolTip.render();
                    this.toolTip.show();
                }
            } else if (this.toolTip) {
                this.toolTip.destroy();
            }

        }
    });
    BaseFormWidget.xtype = xtype;
    return BaseFormWidget;
});
/**
 * @license RequireJS text 2.0.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.14',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!src/widget/form/input/InputWidget.html',[],function () { return '<input ms-css-height="height" class="form-control form-widget-to-focus-class" ms-duplex="value" ms-attr-placeholder="placeholder"\r\n       ms-attr-readonly="status==\'readonly\'" ms-attr-disabled="status==\'disabled\'" ms-class="form-text:status==\'readonly\'"/>\r\n';});

/*
 * css.normalize.js
 *
 * CSS Normalization
 *
 * CSS paths are normalized based on an optional basePath and the RequireJS config
 *
 * Usage:
 *   normalize(css, fromBasePath, toBasePath);
 *
 * css: the stylesheet content to normalize
 * fromBasePath: the absolute base path of the css relative to any root (but without ../ backtracking)
 * toBasePath: the absolute new base path of the css relative to the same root
 * 
 * Absolute dependencies are left untouched.
 *
 * Urls in the CSS are picked up by regular expressions.
 * These will catch all statements of the form:
 *
 * url(*)
 * url('*')
 * url("*")
 * 
 * @import '*'
 * @import "*"
 *
 * (and so also @import url(*) variations)
 *
 * For urls needing normalization
 *
 */

define('normalize',[],function() {
  
  // regular expression for removing double slashes
  // eg http://www.example.com//my///url/here -> http://www.example.com/my/url/here
  var slashes = /([^:])\/+/g
  var removeDoubleSlashes = function(uri) {
    return uri.replace(slashes, '$1/');
  }

  // given a relative URI, and two absolute base URIs, convert it from one base to another
  var protocolRegEx = /[^\:\/]*:\/\/([^\/])*/;
  var absUrlRegEx = /^(\/|data:)/;
  function convertURIBase(uri, fromBase, toBase) {
    if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
      return uri;
    uri = removeDoubleSlashes(uri);
    // if toBase specifies a protocol path, ensure this is the same protocol as fromBase, if not
    // use absolute path at fromBase
    var toBaseProtocol = toBase.match(protocolRegEx);
    var fromBaseProtocol = fromBase.match(protocolRegEx);
    if (fromBaseProtocol && (!toBaseProtocol || toBaseProtocol[1] != fromBaseProtocol[1] || toBaseProtocol[2] != fromBaseProtocol[2]))
      return absoluteURI(uri, fromBase);
    
    else {
      return relativeURI(absoluteURI(uri, fromBase), toBase);
    }
  };
  
  // given a relative URI, calculate the absolute URI
  function absoluteURI(uri, base) {
    if (uri.substr(0, 2) == './')
      uri = uri.substr(2);

    // absolute urls are left in tact
    if (uri.match(absUrlRegEx) || uri.match(protocolRegEx))
      return uri;
    
    var baseParts = base.split('/');
    var uriParts = uri.split('/');
    
    baseParts.pop();
    
    while (curPart = uriParts.shift())
      if (curPart == '..')
        baseParts.pop();
      else
        baseParts.push(curPart);
    
    return baseParts.join('/');
  };


  // given an absolute URI, calculate the relative URI
  function relativeURI(uri, base) {
    
    // reduce base and uri strings to just their difference string
    var baseParts = base.split('/');
    baseParts.pop();
    base = baseParts.join('/') + '/';
    i = 0;
    while (base.substr(i, 1) == uri.substr(i, 1))
      i++;
    while (base.substr(i, 1) != '/')
      i--;
    base = base.substr(i + 1);
    uri = uri.substr(i + 1);

    // each base folder difference is thus a backtrack
    baseParts = base.split('/');
    var uriParts = uri.split('/');
    out = '';
    while (baseParts.shift())
      out += '../';
    
    // finally add uri parts
    while (curPart = uriParts.shift())
      out += curPart + '/';
    
    return out.substr(0, out.length - 1);
  };
  
  var normalizeCSS = function(source, fromBase, toBase) {

    fromBase = removeDoubleSlashes(fromBase);
    toBase = removeDoubleSlashes(toBase);

    var urlRegEx = /@import\s*("([^"]*)"|'([^']*)')|url\s*\((?!#)\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/ig;
    var result, url, source;

    while (result = urlRegEx.exec(source)) {
      url = result[3] || result[2] || result[5] || result[6] || result[4];
      var newUrl;
      newUrl = convertURIBase(url, fromBase, toBase);
      var quoteLen = result[5] || result[6] ? 1 : 0;
      source = source.substr(0, urlRegEx.lastIndex - url.length - quoteLen - 1) + newUrl + source.substr(urlRegEx.lastIndex - quoteLen - 1);
      urlRegEx.lastIndex = urlRegEx.lastIndex + (newUrl.length - url.length);
    }
    
    return source;
  };
  
  normalizeCSS.convertURIBase = convertURIBase;
  normalizeCSS.absoluteURI = absoluteURI;
  normalizeCSS.relativeURI = relativeURI;
  
  return normalizeCSS;
});
;
/*
 * Require-CSS RequireJS css! loader plugin
 * 0.1.2
 * Guy Bedford 2013
 * MIT
 */

/*
 *
 * Usage:
 *  require(['css!./mycssFile']);
 *
 * Tested and working in (up to latest versions as of March 2013):
 * Android
 * iOS 6
 * IE 6 - 10
 * Chome 3 - 26
 * Firefox 3.5 - 19
 * Opera 10 - 12
 * 
 * browserling.com used for virtual testing environment
 *
 * Credit to B Cavalier & J Hann for the IE 6 - 9 method,
 * refined with help from Martin Cermak
 * 
 * Sources that helped along the way:
 * - https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
 * - http://www.phpied.com/when-is-a-stylesheet-really-loaded/
 * - https://github.com/cujojs/curl/blob/master/src/curl/plugin/css.js
 *
 */

define('css',[],function() {
  if (typeof window == 'undefined')
    return { load: function(n, r, load){ load() } };

  var head = document.getElementsByTagName('head')[0];

  var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;

  // use <style> @import load method (IE < 9, Firefox < 18)
  var useImportLoad = false;
  
  // set to false for explicit <link> load checking when onload doesn't work perfectly (webkit)
  var useOnload = true;

  // trident / msie
  if (engine[1] || engine[7])
    useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
  // webkit
  else if (engine[2] || engine[8])
    useOnload = false;
  // gecko
  else if (engine[4])
    useImportLoad = parseInt(engine[4]) < 18;

  //main api object
  var cssAPI = {};

  cssAPI.pluginBuilder = './css-builder';

  // <style> @import load method
  var curStyle, curSheet;
  var createStyle = function () {
    curStyle = document.createElement('style');
    head.appendChild(curStyle);
    curSheet = curStyle.styleSheet || curStyle.sheet;
  }
  var ieCnt = 0;
  var ieLoads = [];
  var ieCurCallback;
  
  var createIeLoad = function(url) {
    ieCnt++;
    if (ieCnt == 32) {
      createStyle();
      ieCnt = 0;
    }
    curSheet.addImport(url);
    curStyle.onload = function(){ processIeLoad() };
  }
  var processIeLoad = function() {
    ieCurCallback();
 
    var nextLoad = ieLoads.shift();
 
    if (!nextLoad) {
      ieCurCallback = null;
      return;
    }
 
    ieCurCallback = nextLoad[1];
    createIeLoad(nextLoad[0]);
  }
  var importLoad = function(url, callback) {
    if (!curSheet || !curSheet.addImport)
      createStyle();

    if (curSheet && curSheet.addImport) {
      // old IE
      if (ieCurCallback) {
        ieLoads.push([url, callback]);
      }
      else {
        createIeLoad(url);
        ieCurCallback = callback;
      }
    }
    else {
      // old Firefox
      curStyle.textContent = '@import "' + url + '";';

      var loadInterval = setInterval(function() {
        try {
          curStyle.sheet.cssRules;
          clearInterval(loadInterval);
          callback();
        } catch(e) {}
      }, 10);
    }
  }

  // <link> load method
  var linkLoad = function(url, callback) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    if (useOnload)
      link.onload = function() {
        link.onload = function() {};
        // for style dimensions queries, a short delay can still be necessary
        setTimeout(callback, 7);
      }
    else
      var loadInterval = setInterval(function() {
        for (var i = 0; i < document.styleSheets.length; i++) {
          var sheet = document.styleSheets[i];
          if (sheet.href == link.href) {
            clearInterval(loadInterval);
            return callback();
          }
        }
      }, 10);
    link.href = url;
    head.appendChild(link);
  }

  cssAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 4, 4) == '.css')
      name = name.substr(0, name.length - 4);

    return normalize(name);
  }

  cssAPI.load = function(cssId, req, load, config) {

    (useImportLoad ? importLoad : linkLoad)(req.toUrl(cssId + '.css'), load);

  }

  return cssAPI;
});


define('css!src/widget/form/input/InputWidget',[],function(){});
/**
 * Created by qianqianyi on 15/4/23.
 */
define('src/widget/form/input/InputWidget',['../BaseFormWidget', 'text!./InputWidget.html', 'css!./InputWidget.css'], function (BaseFormWidget, template) {
    var xtype = "input";
    var InputWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            placeholder:null
        },
        getTemplate: function () {
            return template;
        },
        _valueChange: function (value) {
            this.setAttr("display", value);
            this.validate();//即时校验
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find("input.form-widget-to-focus-class");
            return input;
        },
        focus: function () {
            //console to invoke this method is not ok...
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.focus();
            });
        },
        blur: function () {
            var input = this._getInputElement();
            avalon.nextTick(function () {
                input.blur();
            });
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.attr("ms-css-height", "height").attr("ms-duplex", "value").attr("ms-duplex", "value").attr("ms-attr-placeholder", "placeholder")
                    .attr("ms-attr-readonly", "status=='readonly'").attr("ms-attr-disabled", "status=='disabled'").attr("ms-class", "form-text:status=='readonly'");
            }
        }


    });
    InputWidget.xtype = xtype;
    return InputWidget;
});
define('src/widget/form/my97date/My97DateWidget',['../BaseFormWidget'], function (BaseFormWidget) {
    var xtype = "datepicker";
    var My97DateWidget = new Class({
        Extends: BaseFormWidget,
        options: {
            $xtype: xtype,
            showIcon:true,
            $opts:{
                doubleCalendar: false,
                dateFmt:'yyyy-MM-dd',
                firstDayOfWeek:1,
                autoUpdateOnChanged:null,
                minDate:"1900-01-01 00:00:00",
                maxDate:"2099-12-31 23:59:59",
                startDate:"",
                alwaysUseStartDate:false,
                isShowClear:true,
                isShowToday:true,
                isShowOK:true,
                readOnly:false,
                errDealMode:0,
                qsEnabled:true,
                autoShowQS:false
            },
            showPanel: function(vid) {
                var vm = vid ? avalon.vmodels[vid] : this;
                var opt = Object.merge({}, vm.$opts);
                opt.el = "datePicker_"+vid;
                if(vm && (vm["status"] === "readonly" || vm["status"] === "disabled")){
                    return;
                }
                WdatePicker(opt);
            }
        },
        initialize: function (opts) {
            var $opts = {};
            var formOpt = Page.create("baseFormWidget", {}).options;
            for(var key in opts) {
                if(!(key in formOpt) && key!="$id" && !this._startsWith(key,"on") && key!="showIcon") {
                    $opts[key] = opts[key];
                    if("formatDate" == key) {
                        $opts["dateFmt"] = opts[key];
                    }
                    delete opts[key];
                }
            }
            var that = this;
            $opts["onpicked"] = function(dp){
                that._getInputElement().blur();
            };
            opts.$opts = $opts;
            this.parent(opts);
        },
        render: function(parent) {
            this.parent(parent);

            var that = this;
            this._getInputElement().bind("focus",function(){
                WdatePicker(that.options.$opts);
            });
        },
        _valueChange: function (value) {
            this.setAttr("display", value);
            this.validate();//即时校验
        },
        getTemplate: function () {
            //return template;
        },
        _getInputElement: function () {
            var input = jQuery(this.getElement()).find("input.form-widget-to-focus-class");
            return input;
        },
        _startsWith:function(str, prefix){
            str = this._toString(str);
            prefix = this._toString(prefix);
            return str.indexOf(prefix) === 0;
        },
        _toString:function(val){
            return val == null ? '' : val.toString();
        },
        handleDom: function(widgetDom) {
            if(widgetDom) {
                widgetDom.attr("ms-attr-id", "datePicker_{{vid}}").attr("ms-duplex", "value").attr("ms-duplex", "value").attr("ms-attr-placeholder", "placeholder")
                    .attr("ms-attr-readonly", "status=='readonly'").attr("ms-attr-disabled", "status=='disabled'");
            }
        }
    });
    My97DateWidget.xtype = xtype;
    return My97DateWidget;
});
/**
 *

var componentAlias = [
    "./Manager",
    "./Validation",
    "./Utils",
    "./widget/Base",
    "./widget/form/BaseFormWidget",
    "./widget/form/input/InputWidget",
    "./widget/form/combobox/ComboboxWidget",
    "./widget/layout/BaseLayout"
];
 */

define('src/Factory',[
    "./Manager",
    "./Validation",
    "./Utils",
    "./data/DataValue",
    "./data/DataSet",
    "./data/DataBinder",
    "./widget/Base",

    "./widget/form/BaseFormWidget",
    "./widget/form/input/InputWidget",
    //"./widget/form/combobox/ComboboxWidget",
    "./widget/form/my97date/My97DateWidget"
    //"./widget/form/maskedtextbox/MaskedtextboxWidget",
    //"./widget/customprogress/CustomProgress",
    //"./widget/pagination/PaginationWidget",
    //"./widget/WidgetContainer",
    //"./widget/layout/BaseLayout",
    //"./widget/layout/panel/Panel",
    //"./widget/layout/row/Row",
    //"./widget/layout/col/Col",
    //"./widget/layout/fragment/Fragment",
    //"./widget/composite/FormWidget",
    //"./widget/dataTable/DataTableWidget",
    //"./widget/simple/SimpleGrid",
    //"./widget/simple/expandGrid/ExpandGrid",
    //"./widget/customcolumns/CustomColumns",
    //"./widget/nestable/NestableWidget",
    //"./widget/form/switch/SwitchWidget",
    //"./widget/form/checkbox/CheckboxWidget",
    //"./widget/form/radio/RadioWidget",
    //"./widget/form/textarea/TextareaWidget",
    //"./widget/form/slider/SliderWidget",
    //"./widget/form/richeditor/RicheditorWidget",
    //"./widget/dialog/DialogWidget"
    //"./widget/customSearcher/CustomSearcherWidget",
    //"./widget/form/tooltip/TooltipWidget",
    //
    //"./widget/progress/ProgressWidget",
    //"./widget/tree/TreeWidget"
], function () {
    var allComps = arguments;

    var Factory = new Class({
        initialize: function () {
            this.classMap = {};
            this.manager = new allComps[0]();
            this.validation = new allComps[1]();
            this.utils = new allComps[2]();
        },
        add: function (xtype, clazz) {
            this.classMap[xtype] = clazz;
        },
        getAll: function () {
            return this.classMap;
        },
        create: function (xtype, config) {
            if (this.classMap[xtype] === undefined) {
                //error
                return;
            }
            var instance = new this.classMap[xtype](config);
            var id = instance.getId();
            this.manager.add(id, instance);
            return instance;
        },
        getCmpObj: function(vid) {
            return this.manager.get(vid);
        }
    });
    //**********************************
    var factory = new Factory();
    Array.each(allComps, function (c, index) {
        if(c.xtype) {
            factory.add(c.xtype, c);
        }
    });
    //if(art)
    //    factory.dialog = art.dialog;
    return factory;
});
/*require.config({
    paths: {
        art: '../../../../page/lib/artdialog/artDialog.source',
        artIframe: '../../../../page/lib/artdialog/iframeTools.source',
        my97DatePicker: "../../../../../../page/lib/My97DatePicker/WdatePicker",
        zTree: "../../../../../../page/lib/zTree_v3/js/jquery.ztree.all-3.5",
        kindeditor: "../../../../../../page/lib/kindeditor-4.1.10/kindeditor"
    },
    shim: {
        art: {
            exports: 'art'
        },
        artIframe: {
            deps: ['art'],
            exports: 'artIframe'
        },
        my97DatePicker: {
            exports: "my97DatePicker"
        },
        zTree: {
            exports: "zTree"
        },
        kindeditor: {
            exports: "kindeditor"
        }
    }
});*/
//, "../lib/mmPromise"
define('src/Bootstrap',["./Factory"], function (factory) {

    var named = "Page";

    if (window[named] == undefined) {
        window[named] = factory;
    }
    return factory;
});
//require.config({
//    baseUrl: "src"
//})
require(["./src/Bootstrap"], function () {

});
define("demo", function(){});


(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('#test {\r\n\r\n}');

//# sourceMappingURL=page-build.js.map