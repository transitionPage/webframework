/**
 * Created by JKYANG on 15/5/12.
 */
define([], function () {
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
            var dataValue = PageMgr.manager.components[this.options.dataValueId];
            var widget = PageMgr.manager.components[this.options.widgetId];
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
                var widgetObj = Page.manager.components[widgetId];
                if (fieldId) {
                    if(widgetObj.options.$xtype =="checkbox") {
                        value = value.join(widgetObj.options.$split);
                    }
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
            var dataValue = PageMgr.manager.components[this.options.dataValueId];
            var widget = PageMgr.manager.components[this.options.widgetId];
            dataValue.removeEvent("afterUpdateRecord", this.dataValueChangeCallback);
            widget.removeEvent("valueChange", this.widgetValueChangeCallback);
        }
    });
    DataBinder.xtype = xtype;
    return DataBinder;
});