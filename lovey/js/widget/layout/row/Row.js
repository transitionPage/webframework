/**
 * Created by JKYANG on 15/5/18.
 */

define(["../BaseLayout", "text!./Row.html"], function (BaseLayout, rowTpl) {
    var xtype = "row";
    var Row = new Class({
        Extends: BaseLayout,
        options: {
            $xtype: xtype

        },
        getTemplate: function () {
            return rowTpl;
        },
        getElementToAppend: function () {
            return this.$element;;
        }
    });
    Row.xtype = xtype;
    return Row;

});