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
define([], function () {
    var xtype = "base";
    var fullName = "Base";
    var baseURL = "./widget/";
    var Base = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $vid: "",
            $uuid: "",
            $xtype: xtype,
            $fullName: fullName,
            $parentId: null,
            $appendEl: null,
            show: true,
            $addWrapDiv: true//是否在组件外边套DIV（ms－controller）
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
            if (this.options.$vid == '') {
                this.options.$vid = this.options.$id;
            }
            if (this.options.$uuid == '') {
                this.options.$uuid = String.uniqueID();
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
            if (!this.options.$addWrapDiv) {
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
            parentDOM.append(e);
                avalon.scan($this.element,this.vmodel);
                $this.fireEvent("afterRender", [this.vmodel]);
                if (this["_afterRender"]) {
                    this["_afterRender"](this.vmodel);
                }

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
                var widget = PageMgr.manager.components[pw];
                if(widget){
                    widget.show();
                }
            }
        },
        hide: function () {
            this.setAttr("show", false);
            var pw = this.getAttr("parentLayoutWidgetId");
            if(pw){
                var widget = PageMgr.manager.components[pw];
                if(widget){
                    widget.hide();
                }
            }
        },
        destroy: function () {
            if(this.$element){
                this.$element.remove();
            }
            PageMgr.manager.remove(this.getId());
            delete avalon.vmodels[this.getId()];
        }
    });
    Base.xtype = xtype;
    return Base;
});
