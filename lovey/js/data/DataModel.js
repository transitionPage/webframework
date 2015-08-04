/**
 * Created by JKYANG on 15/5/18.
 */
/**
 *
 *
 *
 *
 */
define([], function () {

    var xtype = "dataModel";
    var DataModel = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $xtype: xtype,
            columns: [],//[{id:'',type:'', format:''}]
            mainIdColumn: "wid",
            mainAlias: "main",
            refAlias: [],//{alias:'aliasId', dataModelId:''}
            childrenAlias: []//{alias:'', dataModelId:''}
        },

        initialize: function (opts) {
            this.setOptions(opts);
            if (!this.options || this.options.$id == "") {
                this.options.$id = this.options.$xtype + String.uniqueID();
            }
        },
        getId: function () {
            return this.options.$id;
        }
    });
    DataModel.xtype = xtype;
    return Model;
});