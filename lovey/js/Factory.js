/**
 *

var componentAlias = [
    "./Manager",
    "./Validation",
    "./Utils",
    "./widget/Base",
    "./widget/form/BaseFormWidget",
    "./widget/form/input/InputWidget",
    "./widget/form/combobox/ComboboxWidget",
    "./widget/layout/BaseLayout"
];
 */

define([
    "./Manager",
    "./Validation",
    "./Utils",
    "./Metadata",
    "./data/DataValue",
    "./data/DataSet",
    "./data/DataBinder",
    "./widget/Base",
//    "./widget/WidgetContainer",
    "./widget/form/BaseFormWidget",
    "./widget/form/input/InputWidget",
    "./widget/form/maskedtextbox/MaskedtextboxWidget",
    "./widget/form/combobox/ComboboxWidget",
//    "./widget/customprogress/CustomProgress",
//    "./widget/customcolumns/CustomColumns",
    "./widget/pagination/PaginationWidget",
//    "./widget/layout/BaseLayout",
//    "./widget/layout/panel/Panel",
//    "./widget/layout/row/Row",
//    "./widget/layout/col/Col",
//    "./widget/layout/fragment/Fragment",
//    "./widget/composite/FormWidget",
//    "./widget/dataTable/DataTableWidget",
//    "./widget/simple/SimpleGrid",
//    "./widget/simple/expandGrid/ExpandGrid",
    "./widget/nestable/NestableWidget",
    "./widget/form/switch/SwitchWidget",
    "./widget/form/checkbox/CheckboxWidget",
    "./widget/form/radio/RadioWidget",
    "./widget/form/textarea/TextareaWidget",
//    "./widget/form/slider/SliderWidget",
//    "./widget/form/richeditor/RicheditorWidget",
//    "./widget/progress/ProgressWidget",
    "./widget/dialog/DialogWidget",
//    "./widget/customSearcher/CustomSearcherWidget",
    "./widget/form/my97date/My97DateWidget",
    "./widget/form/tooltip/TooltipWidget",
    "./widget/tree/TreeWidget"
], function () {
    var allComps = arguments;

    var Factory = new Class({
        initialize: function () {
            this.classMap = {};
            this.manager = new allComps[0]();
            this.validation = new allComps[1]();
            this.utils = new allComps[2]();
        },
        add: function (xtype, clazz) {
            this.classMap[xtype] = clazz;
        },
        getAll: function () {
            return this.classMap;
        },
        create: function (xtype, config) {
            if (this.classMap[xtype] === undefined) {
                //error
                return;
            }
            var instance = new this.classMap[xtype](config);
            var id = instance.getId();
            this.manager.add(id, instance);
            return instance;
        },
        getCmpObj: function(vid) {
            return this.manager.get(vid);
        }
    });
    //**********************************
    var factory = new Factory();
    Array.each(allComps, function (c, index) {
        if(c.xtype) {
            factory.add(c.xtype, c);
        }
    });
    if(art)
        factory.dialog = art.dialog;
    return factory;
});