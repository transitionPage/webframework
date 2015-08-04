/**
 * Created by JK_YANG on 15/5/22.
 */
define(['../Base','text!./TreeWidget.html', 'zTree2',
    'css!./TreeWidget.css','css!../../../../vendors/lib/zTree_v3/css/zTreeStyle/zTreeStyle.css'], function (Base, treeTpl, zTree) {
    var xtype = "tree";
    var Tree = new Class({
        Extends: Base,
        options: {
            $xtype: xtype,
            $showCheckBox: false,  //是否显示checkbox
            $showIcon: false,  //是否显示图标
            $idKey: "id",  //节点id Key
            $nodeName: "name",  //节点文本key
            $pIdKey: "pId",  //父节点id
            $parent: false,  //是否节点保持为父节点状态
            $treeLine: true,  //是否显示连线
            $multi: false,  //是否支持多选
            $async: true,  //是否异步加载数据
            $dataSetId: null,  //数据源Id
            $mainAlias: null,  //数据源主实体别名
            $url: null,  //数据源url
            $searchable: false,
            $searchKey: "searchValue",
            searchValue: "",



            /*事件*/
            beforeAsync: avalon.noop(),
            beforeCheck: avalon.noop(),
            beforeClick: avalon.noop(),
            beforeCollapse: avalon.noop(),
            beforeDblClick: avalon.noop(),
            beforeDrag: avalon.noop(),
            beforeDragOpen: avalon.noop(),
            beforeDrop: avalon.noop(),
            beforeEditName: avalon.noop(),
            beforeExpand: avalon.noop(),
            beforeMouseDown: avalon.noop(),
            beforeMouseUp: avalon.noop(),
            beforeRemove: avalon.noop(),
            beforeRename: avalon.noop(),
            beforeRightClick: avalon.noop(),
            _onAsyncError: avalon.noop(),
            _onAsyncSuccess: avalon.noop(),
            _onCheck: avalon.noop(),
            _onClick: avalon.noop(),
            _onCollapse: avalon.noop(),
            _onDblClick: avalon.noop(),
            _onDrag: avalon.noop(),
            _onDragMove: avalon.noop(),
            _onDrop: avalon.noop(),
            _onExpand: avalon.noop(),
            _onMouseDown: avalon.noop(),
            _onMouseUp: avalon.noop(),
            _onNodeCreated: avalon.noop(),
            _onRemove: avalon.noop(),
            _onRename: avalon.noop(),
            _onRightClick: avalon.noop(),


            searchTreeData: function(valueParam, matchSearchValue, $vid, event) {
                var vm = $vid ? avalon.vmodels[$vid] : this;
                var obj = vm.getCmpMgr();
                var searchValue = valueParam || vm.searchValue;
                //重新搜索所有数据
                if("" === searchValue) {
                    obj.zTreeObj.setting.view.selectedMulti = false;
                    obj.zTreeObj.setting.async.enable = obj.options.$async;
                }
                //此处可限制字符长度, 按值搜索数据
                else if(true) {
                    obj.zTreeObj.setting.view.selectedMulti = true;
                    obj.zTreeObj.setting.async.enable = false;
                }
                var dataParam = {};
                dataParam[obj.options.$searchKey] = searchValue;
                jQuery.ajax({
                    url: obj.options.$url,
                    data: dataParam,
                    type:'POST',
                    dataType: 'json',
                    async: false,
                    cache: false
                }).done(function(res) {
                    if (res) {
                        var data = res.result.datas[obj.options.$mainAlias].rows;
                        obj.zTreeObj = jQuery.fn.zTree.init(obj._getTreeDom(), obj.zTreeObj.setting, data);
                        obj.zTreeObj.setting.async.enable = obj.options.$async;   //如果data = []时，会再次触发异步请求，所以先禁止异步，然后再开启
                        if(searchValue != "" && matchSearchValue){
                            var selectedNodes = obj.zTreeObj.getNodesByParamFuzzy(obj.options.$nodeName, searchValue, null);
                            for( var i=0, l=selectedNodes.length; i<l; i++) {
                                obj.zTreeObj.selectNode(selectedNodes[i], true);
                            }
                        }
                    }
                });
            },
            getCmpMgr: function() {
                return PageMgr.manager.components[this.$vid];
            }

        },
        /**
         * 组装ztree基本设置
         * @returns {}
         * @private
         */
        _geneSetting: function(){
            var options = this.options;
            var otherParam = {};
            if(options.$async) {
                otherParam[options.$pIdKey] = null;
            }
            return {
                async: {
                    enable: true,
                    url: options.$url,
                    autoParam: [options.$idKey+"="+options.$pIdKey],
//                    otherParam: otherParam,
                    dataFilter: function (treeId, parentNode, responseData) {
                        var res = [];
                        if(responseData) {
                            if(options.$mainAlias) {
                                res = responseData.result.datas[options.$mainAlias].rows;
                            }
                            else {
                                res = responseData.result.datas.rows;
                            }
                        }
                        //去掉otherParam
                        this.getZTreeObj(treeId).setting.async.otherParam = null;
                        return res;
                    }
                },
                check: {
                    enable: options.$showCheckBox,
                    //chkStyle: "checkbox",
                    chkboxType: { "Y": "ps", "N": "ps" },
                    autoCheckTrigger: false
                },
                data: {
                    key:{
                        name: options.$nodeName
                    },
                    simpleData:{
                        enable: true,// 默认使用简单数据
                        idKey: options.$idKey,
                        pIdKey: options.$pIdKey
                    },
                    keep: {
                        parent: options.$parent
                    }
                },
                edit:{
                    enable: true,
                    showRenameBtn: false,
                    showRemoveBtn: false
                },
                view:{
                    showIcon: options.$showIcon,
                    showLine: options.$treeLine,
                    selectedMulti: options.$multi,
                    dblClickExpand: false
                },

                callback:{
                    beforeAsync: options.beforeAsync,
                    beforeCheck: options.beforeCheck,
                    beforeClick: options.beforeClick,
                    beforeCollapse: options.beforeCollapse,
                    beforeDblClick: options.beforeDblClick,
                    beforeDrag: options.beforeDrag,
                    beforeDragOpen: options.beforeDragOpen,
                    beforeDrop: options.beforeDrop,
                    beforeEditName: options.beforeEditName,
                    beforeExpand: options.beforeExpand,
                    beforeMouseDown: options.beforeMouseDown,
                    beforeMouseUp: options.beforeMouseUp,
                    beforeRemove: options.beforeRemove,
                    beforeRename: options.beforeRename,
                    beforeRightClick: options.beforeRightClick,
                    onAsyncError: options._onAsyncError,
                    onAsyncSuccess: options._onAsyncSuccess,
                    onCheck: options._onCheck,
                    onClick: options._onClick,
                    onCollapse: options._onCollapse,
                    onDblClick: options._onDblClick,
                    onDrag: options._onDrag,
                    onDragMove: options._onDragMove,
                    onDrop: options._onDrop,
                    onExpand: options._onExpand,
                    onMouseDown: options._onMouseDown,
                    onMouseUp: options._onMouseUp,
                    onNodeCreated: options._onNodeCreated,
                    onRemove: options._onRemove,
                    onRename: options._onRename
                }
            };
        },
        getTemplate: function () {
            return treeTpl;
        },
        initialize: function (opts) {
            if(opts) {
 /*               if (opts.$dataSetId && opts.$url) {
                    PageMgr.dialog.alert("树组件中dataSetId和url属于互斥属性，只能设置一个！");
                    return;
                }*/
                this.parent(opts);
            }
        },
        render: function (parent) {
            var that = this;
            that.fireEvent("beforeRender", [that.vmodel]);
            var tmp = jQuery(that.getTemplate());

            var e = tmp.find("ul");
            that.treeDom = e;
            tmp.append(e);

            tmp.addClass("page_" + that.getAttr('$xtype')).attr("ms-controller",that.getId());
            var parentDOM = parent;
            if (!parentDOM) {
                parentDOM = that.getParentElement();
            }
            parentDOM.append(tmp);
            that.$element = tmp;
            that.element = tmp[0];
            avalon.scan(parentDOM[0]);

            //调用ztree接口，创建树
            that.setting  = that._geneSetting();
            that.zTreeObj = jQuery.fn.zTree.init(e, that.setting);

/*            //合并自定义事件与组件事件
            that.zTreeObj.setting.callback.beforeExpand = that._extendExpandEvent;
            that.zTreeObj.cusExpandFunc = setting.callback.beforeExpand;
            that.zTreeObj.treeObj = that;*/

            that.fireEvent("afterRender", [that.vmodel]);
            if (that["_afterRender"]) {
                that["_afterRender"](that.vmodel);
            }

            if(!that.options.$async) {
                that.zTreeObj.setting.async.enable = false;
            }


            return that;
        },
        _getTreeDom: function() {
            return this.treeDom;
        },
        _getCompVM: function() {
            var $vid = this.options.$vid;
            return avalon.vmodels[$vid]
        },
        _extendExpandEvent: function( treeId, treeNode) {
            var zTree = this.getZTreeObj(treeId);
            var beforeExpand = zTree.cusExpandFunc;
            //先执行用户自定义的事件
            var res = beforeExpand && typeof beforeExpand == "function" && beforeExpand((treeId, treeNode));
            if(false == res) return false;

            //模拟异步加载数据
            var treeObj = zTree.treeObj;
            if(treeObj.options.$async == true) {
                var ds = treeObj._getDataSet();
                //增加查询参数，拉取数据
                var fetchParam = {};
                //fetchParam[vm.searchKey] = searchValue;
                ds.setAttr("fetchParam", fetchParam);
            }

        },

        _getDataSet: function() {
            if(this.options.$dataSetId) {
                return PageMgr.manager.components[this.options.$dataSetId];
            }
            else if(this.options.$url) {
                if(!this.dataSet) {
                    this.dataSet = PageMgr.create("dataSet", {
                        fetchUrl: this.options.$url,
                        model: {
                            mainAlias: this.options.$mainAlias
                        }
                    });
                }
                return this.dataSet;
            }
        },
        /*zTree方法*/
        addNodes:function (parentNode, newNodes, isSilent){
            return this.zTreeObj.addNodes(parentNode, newNodes, isSilent);
        },
        /*zTree方法：*/
        cancelEditName:function (newName){
            this.zTreeObj.cancelEditName(newName);
        },
        /*zTree方法：*/
        cancelSelectedNode:function (node){
            this.zTreeObj.cancelSelectedNode(node);
        },
        /*zTree方法：*/
        checkAllNodes:function (checked){
            this.zTreeObj.checkAllNodes(checked);
        },
        /*zTree方法：*/
        checkNode:function (node, checked, checkTypeFlag, callbackFlag){
            this.zTreeObj.checkNode(node, checked, checkTypeFlag, callbackFlag);
        },
        /*zTree方法：*/
        copyNode:function (targetNode, node, moveType, isSilent){
            return this.zTreeObj.copyNode(targetNode, node, moveType, isSilent);
        },
        /*zTree方法：*/
        destroy:function (){
            this.parent();
            this.zTreeObj.destroy();
        },
        /*zTree方法：*/
        editName:function (node){
            this.zTreeObj.editName(node);
        },
        /*zTree方法：*/
        expandAll:function (expandFlag){
            this.zTreeObj.expandAll(expandFlag);
        },
        /*zTree方法：*/
        expandNode:function (node, expandFlag, sonSign, focus, callbackFlag){
            return this.zTreeObj.expandNode(node, expandFlag, sonSign, focus, callbackFlag);
        },
        /*zTree方法：*/
        getChangeCheckedNodes:function (){
            return  this.zTreeObj.getChangeCheckedNodes();
        },
        /*zTree方法：*/
        getCheckedNodes:function (checked){
            return  this.zTreeObj.getCheckedNodes(checked);
        },
        /*zTree方法：*/
        getNodeByParam:function (key, value, parentNode){
            return  this.zTreeObj.getNodeByParam(key, value, parentNode);
        },
        /*zTree方法：*/
        getNodeByTId:function (tId){
            return  this.zTreeObj.getNodeByTId(tId);
        },
        /*zTree方法：*/
        getNodeIndex:function (node){
            return  this.zTreeObj.getNodeIndex(node);
        },
        /*zTree方法：*/
        getNodes:function (){
            return  this.zTreeObj.getNodes();
        },
        /*zTree方法：*/
        getNodesByFilter:function (filter, isSingle, parentNode, invokeParam){
            return  this.zTreeObj.getNodesByFilter(filter, isSingle, parentNode, invokeParam);
        },
        /*zTree方法：*/
        getNodesByParam:function (key, value, parentNode){
            return  this.zTreeObj.getNodesByParam(key, value, parentNode);
        },
        /*zTree方法：*/
        getNodesByParamFuzzy:function (key, value, parentNode){
            return  this.zTreeObj.getNodesByParamFuzzy(key, value, parentNode);
        },
        /*zTree方法：*/
        getSelectedNodes:function (){
            return  this.zTreeObj.getSelectedNodes();
        },
        /*zTree方法：*/
        hideNode:function (node){
            this.zTreeObj.hideNode(node);
        },
        /*zTree方法：*/
        hideNodes:function (nodes){
            this.zTreeObj.hideNodes(nodes);
        },
        /*zTree方法：*/
        moveNode:function (targetNode, node, moveType, isSilent){
            return this.zTreeObj.moveNode(targetNode, node, moveType, isSilent);
        },

        reAsyncChildNodes: function(parentNode, reloadType, isSilent) {
            this.zTreeObj.reAsyncChildNodes(parentNode, reloadType, isSilent);
        },
        refresh: function() {
            this.zTreeObj.refresh();
        },
        /*zTree方法：*/
        removeChildNodes:function (parentNode){
            return this.zTreeObj.removeChildNodes(parentNode);
        },
        /*zTree方法：*/
        removeNode:function (node, callbackFlag){
            this.zTreeObj.removeNode(node, callbackFlag);
        },
        /*zTree方法：*/
        selectNode:function (node, addFlag){
            this.zTreeObj.selectNode(node, addFlag);
        },
        /*zTree方法：*/
        setChkDisabled:function (node, disabled, inheritParent, inheritChildren){
            this.zTreeObj.setChkDisabled(node, disabled, inheritParent, inheritChildren);
        },
        /*zTree方法：*/
        setEditable:function (editable){
            this.zTreeObj.setEditable(editable);
        },
        /*zTree方法：*/
        showNode:function (node){
            this.zTreeObj.showNode(node);
        },
        /*zTree方法：*/
        showNodes:function (nodes){
            this.zTreeObj.showNodes(nodes);
        },
        /*zTree方法：*/
        transformToArray:function (nodes){
            return this.zTreeObj.transformToArray(nodes);
        },
        /*zTree方法：*/
        transformTozTreeNodes:function (simpleNodes){
            return this.zTreeObj.transformTozTreeNodes(simpleNodes);
        },
        /*zTree方法：*/
        updateNode:function (node, checkTypeFlag){
            this.zTreeObj.updateNode(node, checkTypeFlag);
        }
    });
    Tree.xtype = xtype;
    return Tree;
});