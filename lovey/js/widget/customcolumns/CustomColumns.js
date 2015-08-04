/**
 * Created by hhxu on 15/6/28.
 *
 */
define(['../Base','text!./CustomColumnsWidget.html', 'css!./CustomColumnsWidget.css'], function (Base,template) {
    var xtype = "customColumns";
    var CustomColumnsWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            items: [],
            fixItems: [],
            value:[],
            metaDataObj:null,
            componentId:null,
            $textField:"text",
            $valueField:"value",
            fetchUrl:null,
            syncUrl:null,
            showAllCheck:false,
            $split: ",",
            allChecked:false,
            onSave:null,//param:customcolumn,value
            afterSave:null,//param:customcolumn,value
            beforeOpenDialog:null,
            afterOpenDialog:null,
            itemCheck: function (vid,el) {
                var vm = avalon.vmodels[vid];
                if(vm.fixItems&&vm.fixItems.contains(el[vm.$valueField])){
                    el.checked = true;
                }else{
                    el.checked = !el.checked;
                }
                var values = [];
                for (var i = 0; i < vm.items.length; i++) {
                    if (vm.items[i].checked) {
                        values.push(vm.items[i][vm.$valueField]);
                    }
                }
                vm.value = values;
            },
            allCheck: function (vid) {
                var vm = avalon.vmodels[vid];
                if(vm.allChecked){
                    vm.allChecked = false;
                }else{
                    vm.allChecked = true;
                }
                var checked = vm.allChecked;
                if(vm){
                    var values = [];
                    var fixItems = vm.fixItems||[];
                    for (var i = 0; i < vm.items.length; i++) {
                        var item = vm.items[i];
                        if(!checked&&fixItems.contains(item[vm.$valueField])){
                            item.checked = true;
                        }else{
                            item.checked = checked||false;
                        }
                        if(item.checked){
                            values.push(item[vm.$valueField]);
                        }
                    }
                    vm.value = values;
                }
            }
        },
        initialize: function (opts) {
            this.parent(this._formatOptions(opts));
            this.formatOptions();
        },
        render:function(){
            var that = this;
            var tmp = this.getTemplate();
            var e = jQuery("<div></div>");
            if (!this.options._addWrapDiv) {
                e = jQuery(tmp);
            }else{
                e.append(tmp);
            }
            e.addClass("page_" + this.getAttr('$xtype')).attr("ms-controller", this.getId());
            if(this.options.items.length>20) {
                //height =
            }
            this.dialog = Page.create('dialog', {
                width: "650px",
                title:"自定义显示列",
                content:e[0],
                button: [{
                    name: "保存",
                    focus:true,
                    callback: function(dialog, window, param) {
                        if(that.options.onSave) {
                            that.options.onSave(that, that.options.value);
                        }else{
                            that.defaultSave(that, that.options.value);
                        }
                        if(that.options.afterSave){
                            return that.options.afterSave(that,that.options.value);
                        }
                        return false;
                    }
                },{
                    name: "关闭",
                    focus:false,
                    callback: function(dialog) {}
                }]
            });
            this.dialog.render();
            avalon.scan(e[0]);
            //this.dialog.content(e[0]);
            var clientHeight = window.top.document.body.clientHeight;
            if(clientHeight*0.6 < e.height()) {
                this.dialog.dialogObj.size(650, clientHeight-190);
                this.dialog.dialogObj.position("50%", "0%");
            }
        },
        getTemplate: function () {
            return template;
        },
        getDomContent: function () {
            var tem = this.getTemplate();
            return tem;
        },
        defaultSave:function(comp,value){
            if(comp.options.metaDataObj){
                if(!this.options.syncUrl){
                    var path = document.location.pathname;
                    var contentPath = path.split("/")[1];
                    this.options.syncUrl = "/"+contentPath+"/sys/common/customPage/ymzjdz/update.do";
                }
                var metaData = comp.options.metaDataObj;
                var params = {};
                //params.userId = metaData.getUserId();//userId
                //params.roleId = metaData.getRoleId();//roleId
                params.pageId = metaData.getPage();//pageId
                params.componentId = this.options.componentId;//componentId
                params.setting = this.getAttr("value").$model;//列表显示列配置
                var syncRes = Page.utils.syncAjax(this.options.syncUrl, params);
                if(!syncRes){
                    Page.dialog.alert("保存到服务器失败！");
                    return false;
                }
            }
        },
        formatOptions:function () {
            var value = this.options.value;
            if(value) {
                var valueArr;
                if (Object.prototype.toString.call(value) == "[object Array]") {
                    valueArr = value;
                } else {
                    valueArr = value.split(this.options.$split);
                    this.setAttr("value",valueArr);
                }
                this.setItemCheckByValue();
            }
            return true;
        },
        setItemCheckByValue:function(){
            var items = this.getAttr("items");
            var valueArr = this.getAttr("value");
            var fixItems = this.getAttr("fixItems");
            if (items&& items.length>0&&valueArr) {
                for (var t = 0; t < items.length; t++) {
                    var item = items[t];
                    if (item) {
                       if (valueArr.contains(item[this.options.$valueField])) {
                           item.checked = true;
                       }else if(fixItems&&fixItems.contains(item[this.options.$valueField])){
                           item.checked = true;
                           valueArr.push(item[this.options.$valueField]);
                       }
                    }
                }
            }
        },
        _formatOptions: function (opts) {
            if(opts){
                if(opts.items&&opts.items.length){
                    for(var t=0;t<opts.items.length;t++){
                        var item = opts.items[t];
                        if(item){
                            item.checked = false;
                        }
                    }
                }
            }
            return opts;
        },
        _valueChange:function(){
            this.setItemCheckByValue();
        }
    });
    CustomColumnsWidget.xtype = xtype;
    return CustomColumnsWidget;
})