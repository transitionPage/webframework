/**
 * Created by JKYANG on 15/5/18.
 */

define(["../BaseLayout", "text!./Col.html", "css!./Col.css"], function (BaseLayout, colTpl) {
    var xtype = "col";
    var Col = new Class({
        Extends: BaseLayout,
        options: {
            $xtype: xtype,
            floatDirection: null,
            //span: 6,
            xs:0, //超小屏幕 手机 (<768px)
            sm:0, //小屏幕 平板 (≥768px)
            md:0, //中等屏幕 桌面显示器 (≥992px)
            lg:0  //大屏幕 大桌面显示器 (≥1200px)

        },
        getTemplate: function () {
            return colTpl;
        },
        getElementToAppend: function () {
            return this.$element;
        }
    });
    Col.xtype = xtype;
    return Col;

});