define(['../Base'], function (Base) {
    var BaseLayout = new Class({
        Extends: Base,
        options: {
            $skipArray: ["items"],
            _addWrapDiv: false,
            isLazyLoad: false,//是否懒加载，即滚动条拖动的位置时再渲染
            lazyDistance: 5//渲染距离（时机），滚动条距离容器一定距离触发渲染
        },
        _rendered: false,
        initialize: function (opts) {
            this.parent(opts);
            this.itemsArr = [];
        },
        render: function (parent, formWidgetBag, parentLayoutWidgetId) {
            var goFlag = true;
            this.parent(parent);

            if (this.options.isLazyLoad && !this._rendered) {
                var that = this;
                $w = $(window);
                aparent = parent;
                if (!aparent) {
                    aparent = $("#" + this.options.$parentId);
                }
                if (aparent && aparent.offset && aparent.offset()) {
                    var height = $w.scrollTop() + $w.height();
                    if (height < (aparent.offset().top + aparent.height() + this.options.lazyDistance)) {
                        (function (aparent, that, BaseLayout, formWidgetBag, parentLayoutWidgetId) {
                            $(window).on("scroll", function () {
                                var height = $w.scrollTop() + $w.height();
                                if (height >= (aparent.offset().top + aparent.height() - +that.options.lazyDistance) && !that._rendered) {
                                    that._renderWidgets(formWidgetBag, parentLayoutWidgetId);
                                }
                            });
                        })(aparent, this, BaseLayout, formWidgetBag, parentLayoutWidgetId);
                        goFlag = false;
                    }
                }
            }
            if (goFlag) {
                this._renderWidgets(formWidgetBag, parentLayoutWidgetId);
            }
        },
        _renderWidgets: function (formWidgetBag, parentLayoutWidgetId) {
            if (this._beforLayoutRender) {
                this._beforLayoutRender();
            }
            if (this.options.items) {
                for (var i = 0; i < this.options.items.length; i++) {
                    var it = this.options.items[i];
                    this._renderWidget(it, formWidgetBag, parentLayoutWidgetId);
                }
            }
            if (this._afterLayoutRender) {
                this._afterLayoutRender();
            }
            this._rendered = true;
        },
        _renderWidget: function (it, formWidgetBag, parentLayoutWidgetId) {

            if (it['$xtype']) {
                var config = {};
//                if(this.options.isLazyLoad){
//                    config.isLazyLoad = this.options.isLazyLoad;
//                }
                Object.merge(config, it);
                delete config['$xtype'];
                config.parentTpl="inline";
                var widget = Page.create(it['$xtype'], config);
                if (widget.isFormWidget && widget.isFormWidget()) {
                    formWidgetBag && formWidgetBag.push(widget);
                    if (parentLayoutWidgetId) {
                        widget.setAttr("parentLayoutWidgetId", parentLayoutWidgetId)
                    }
                }
                widget.render(this.getElementToAppend(), formWidgetBag, widget.getId());
                this.itemsArr.push(widget.getId());
                return widget;
            }
        },
        getElementToAppend: function () {


        },

        addItem: function (config) {
            return this._renderWidget(config);
        },
        removeItem: function (index) {
            var widgetId = this.itemsArr.splice(index, 1)[0];
            this.options.items.splice(index, 1);
            Page.manager.components[widgetId].destroy();
        },
        destroy: function () {
            for (var i = 0; i < this.itemsArr.length; i++) {
                Page.manager.components[this.itemsArr[i]].destroy();
            }
            this.parent();
        }
    });
    BaseLayout.xtype = "baseLayout";
    return BaseLayout;
});