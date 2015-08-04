/**
 * Created by JKYANG on 15/5/18.
 */

define(["../BaseLayout", "text!./Panel.html"], function (BaseLayout, panelTpl) {
    var xtype = "panel";
    var Panel = new Class({
        Extends: BaseLayout,
        options: {
            title:'',
            showTitle: true,
            showPanel: true,
            showProgress:true,
            togglePanel: function(vid) {
                var vm = avalon.vmodels[vid];
                vm.showPanel = !vm.showPanel;
            }
        },
        _afterLayoutRender: function () {
            if (this.progressBar) {
                this.progressBar.destroy();
                this.progressBar = null;
                //this.options.showProgress = false;
                this.setAttr("showProgress",false);
            }
        },
        getTemplate: function () {
            return panelTpl;
        },
        getElementToAppend: function () {
            return this.$element.find(".ibox-content");
        }
    });
    Panel.xtype = xtype;
    return Panel;

});