/**
 * Created by JK_YANG on 15/5/22.
 */
define(["../Base", "text!./FormWidget.html", "css!./FormWidget.css"], function (Base, formTpl) {
    var xtype = "form";
    var Form = new Class({
        Extends: Base,
        options: {
            _addWrapDiv: false,
            title: '',
            initData: true,
            showTitle: true,
            dataSources: {},
            dataSourcesIds: [],
            cols: 2, //每行多少列
            $rowHeight: 44,
            $widgetHeight: 34,
            widgets: [], //组件列表
            groupWidgets: null,
            isLazyLoad:false
        },
        getTemplate: function () {
            return formTpl;
        },
        initialize: function (opts) {
            this.parent(opts);
        },
        render: function (parent) {
            this.parent(parent);
            this.appendExtend();
        },

        _wrapWidgetConfig: function (cfg) {
            //预处理widget 得配置
            var col = {$xtype: 'col', items: []}
            var c = Object.merge({}, cfg);
            //计算跨列
            var colNum = c.colNum;
            if(colNum>this.options.cols) {
                c.colNum = colNum = this.options.cols;
            }
            else if(undefined == colNum) {
                colNum = 1;
            }
            //col.md = 12 *colNum/ this.options.cols; //列
            col.xs = col.sm = col.lg = col.md = 12 *colNum/ this.options.cols; //列 //暂时不设计成响应式布局
            //计算跨行: 1、行高计算；2、浮动计算
            var rowNum = c.rowNum;
            if(rowNum && rowNum!=1) {
                if(!c.height) {
                    c.height = (rowNum-1)*this.options.$rowHeight+this.options.$widgetHeight;
                }
                //判断是否该列右浮动
                if(c.floatDirection) {
                    col.floatDirection = c.floatDirection;
                }
            }
            if (c.show != undefined) {
                col.show = c.show;
            }
            col.items.push(c);
            return col;
        },


        appendExtend: function () {

            var items = [];
            var groupWidgets = this.options.groupWidgets;
            var widgets = this.options.widgets;
            if(!groupWidgets && widgets.length>0) {
                groupWidgets = {};
                groupWidgets[this.options.title] = widgets;
            }
            if(groupWidgets) {
                //var show = true;
                for(var attr in groupWidgets) {

                    var title = attr;
                    var widgets = groupWidgets[title];
                    var panel = {$xtype: 'panel', title: title, showTitle: this.options.showTitle,
                        isLazyLoad:this.options.isLazyLoad, items: []};
                    //show = false;
                    //showPanel: show,
                    for(var i=0; i<widgets.length; i++) {
                        if (i == 0 /* || i % cols == 0*/) {
                            currentRow = {$xtype: 'row', items: []};
                            panel.items.push(currentRow);
                        }
                        currentRow.items.push(this._wrapWidgetConfig(widgets[i]));
                    }
                    items.push(panel);
                }
            }

            var ds = this.options.dataSources;
            var dsids = this.options.dataSourcesIds;
            this.fragment = PageMgr.create("fragment", {
                dataSources: ds,
                items: items,
                isLazyLoad:this.options.isLazyLoad,
                dataSourcesIds: dsids
            });
            this.formWidgetBag = [];
            this.fragment.render(this.$element, this.formWidgetBag);
            //预先加载数据
            if (this.options.initData) {
                var ds = this.fragment.getDataSources();
                var dsfetch = [];
                for (var i in ds) {
                    dsfetch.push(ds[i].fetch());
                }
            } else {
                //不加载数据
            }
        },

        submitForm: function () {
            if (this.isValid()) {
                var pros = [];
                for (var v in this.options.dataSources) {
                    var p = PageMgr.manager.components[v].sync();
                    pros.push(p);
                }
                return pros;
            }
        },

        getFormValue: function () {
            var value = {};
            for (var i = 0; i < this.formWidgetBag.length; i++) {
                var widget = this.formWidgetBag[i]
                value[widget.getId()] = widget.getValue();
            }
            return value;
        },

        isValid: function () {
            for (var i = 0; i < this.formWidgetBag.length; i++) {
                var widget = this.formWidgetBag[i];
                var status = widget.getAttr("status");
                var show = widget.getAttr("show");
                if (show && status=="edit" && !widget.isValid()) {
                    return false;
                }
            }
            return true;
        },

        destroy: function () {
            this.fragment.destroy();
            this.parent();
        }
    });
    Form.xtype = xtype;
    return Form;
});