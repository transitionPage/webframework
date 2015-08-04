/**
 * Created by hhxu on 15/5/11.
 */
//define(['../BaseFormWidget', 'text!./ComboBoxWidget.html', 'css!./ComboBoxWidget.css'], function (BaseFormWidget, template) {
define(['../Base', 'text!./PaginationWidget.html', 'css!./PaginationWidget.css'], function (Base, template) {
    var xtype = "pagination";
    var PaginationWidget = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,//类型
            totalNum: 0,//总数据数
            pageSize: 10,//每页条数
            pageIndex: 1,//当前页，默认显示第一页

            totalPage: 0,//总页数,计算所得，设置无效
            recordBegin:0,//显示从第几条开始,计算所得，设置无效
            recordTo: 0,//显示到第几条,计算所得，设置无效

            $showPageIndexInput: false,//显示跳转到某页输入框
            $showPageSizeInput: false,//显示每页条数输入框
            $showFirstPage: false,//显示第一页按钮
            $showLastPage: false,//显示最后一页按钮
            $showPageBeforeAfterCount: 3, //显示当前页的前后几页
            $showPreviousAndNextPage: true,//显示上一页和下一页按钮
            $showPageDetail: true,//显示分页详情
            $showTipWhenNull: true,//无数据时显示提示信息
            $hidePagerWhenNull:false,
            $noDataTip:"没有找到数据！",
            pageChangeEvent: null,

            toPageIndex:1,
            goFirstPage: function (vid) {
                var vm = avalon.vmodels[vid];
                vm.goPage(vid, 1);
            },
            goLastPage: function (vid) {
                var vm = avalon.vmodels[vid];
                vm.goPage(vid, vm.totalPage);
            },
            goPreviousPage: function (vid) {
                var vm = avalon.vmodels[vid];
                if (vm.pageIndex > 1) {
                    vm.goPage(vid,vm.pageIndex - 1);
                }
            },
            goNextPage: function (vid) {
                var vm = avalon.vmodels[vid];
                if (vm.pageIndex < vm.totalPage) {
                    vm.goPage(vid, vm.pageIndex + 1);
                }
            },
            goPage: function (vid, pindex) {
                var vm = avalon.vmodels[vid];
                if (pindex > 0 && pindex < (vm.totalPage + 1)) {
                    vm.pageIndex = pindex;
                }
            },
            inputPageIndex:function(event,vid,dom){
                var vm = avalon.vmodels[vid];
                if(event.keyCode == "13")
                {
                    if(dom&&dom.value){
                        var pIndex = parseInt(dom.value);
                        vm.setPageIndex(vid,dom,pIndex);
                    }
                }else{
                    if(dom&&dom.value) {
                        var pIndex = parseInt(dom.value);
                        vm.toPageIndex = pIndex;
                    }
                }
            },
            changePageIndex:function(event,vid,dom){
                var vm = avalon.vmodels[vid];
                if(dom&&dom.value) {
                    var pIndex = parseInt(dom.value);
                    if(pIndex>0&&pIndex<(vm.totalPage+1)){
                        vm.toPageIndex = pIndex;
                    }else if(pIndex>vm.totalPage){
                        vm.toPageIndex = vm.totalPage;
                        dom.value = vm.totalPage;
                    }
                }
            },
            setPageIndex:function(vid,dom,pIndex){

                var vm = avalon.vmodels[vid];
                if(!pIndex){
                    pIndex = vm.toPageIndex;
                }
                if(pIndex&&pIndex>0&&pIndex<(vm.totalPage+1)){
                    vm.pageIndex = pIndex;
                }else if(!pIndex){
                    vm.pageIndex = 1;
                }else{
                    vm.pageIndex = vm.totalPage;
                    if(dom){
                        dom.value = vm.totalPage;
                    }
                }
            },
            inputPageSize:function(event,vid,dom){
                if(event.keyCode == "13")
                {
                    if(dom&&dom.value){
                        var vm = avalon.vmodels[vid];
                        var pSize = parseInt(dom.value);
                        if(pSize&&pSize>0&&pSize<(vm.totalNum+1)){
                            vm.pageSize = pSize;
                        }else if(!pSize){
                            vm.pageSize = 1;
                        }else{
                            vm.pageSize = vm.totalNum;
                            dom.value = vm.totalNum;
                        }
                    }
                }
            }
        },
        initialize: function (opts) {
            this.parent(opts);
            if (this.getAttr("totalNum")) {
                //计算totalPage
                this._calculateTotalPage();
                this._calculateBeginAndTo();
            }
        },
        getTemplate: function () {
            return template;
        },
        show: function () {
            this.setAttr("show", true);
        },
        hide: function () {
            this.setAttr("show", false);
        },
        _pageIndexChange: function (pindex, oldIndex, model) {
            if(pindex&&pindex<(this.getAttr("totalPage")+1)){
                //属性扩展
                this.options.pageChangeEvent(this,pindex,oldIndex,this.getAttr("pageSize"),model)
            }else{
                this.setAttr("pageIndex",1,true);
            }
        },

        _totalNumChange: function (tNum, oldNum, model) {
            this._calculateTotalPage();
            this._calculateBeginAndTo();
        },
        _pageSizeChange: function (tNum, oldNum, model) {
            if(tNum&&tNum<(this.getAttr("totalNum")+1)){
                this.options.pageChangeEvent(this,this.getAttr("pageIndex"),this.getAttr("pageIndex"),this.getAttr("pageSize"),model)
            }else{
                if(tNum==0){
                    this.setAttr("pageSize",0);
                }else{
                    this.setAttr("pageSize",this.getAttr("totalNum"));
                }
                if(this.getAttr("pageIndex")>1){
                    this.setAttr("pageIndex",1,true);
                }
            }
        },
        _calculateTotalPage: function () {
            if (this.getAttr("totalNum") && this.getAttr("pageSize")) {
                var _totalPage = this.getAttr("totalNum") % this.getAttr("pageSize") == 0 ? (this.getAttr("totalNum") / this.getAttr("pageSize")) : parseInt(this.getAttr("totalNum") / this.getAttr("pageSize")) + 1
                this.setAttr("totalPage",_totalPage,true);
                if(this.getAttr("pageIndex")>this.getAttr("totalPage")){
                    this.setAttr("pageIndex",this.getAttr("totalPage"));
                }
            }else{
                this.setAttr("totalPage",0);
                if(this.getAttr("pageIndex")!=1){
                    this.setAttr("pageIndex",1,true);
                }
            }
        },
        _calculateBeginAndTo: function () {
            if (this.getAttr("totalNum") && this.getAttr("pageIndex") && this.getAttr("pageSize")) {
                var _startNum = this.getAttr("pageSize")*(this.getAttr("pageIndex")-1)+1;
                var _endNum = this.getAttr("pageSize")*this.getAttr("pageIndex");
                this.setAttr("recordBegin",_startNum);
                this.setAttr("recordTo",_endNum>this.getAttr("totalNum")?this.getAttr("totalNum"):_endNum);
            }else{
                this.setAttr("recordBegin",0);
                this.setAttr("recordTo",0);
            }
        }

    });
    PaginationWidget.xtype = xtype;
    return PaginationWidget;
});