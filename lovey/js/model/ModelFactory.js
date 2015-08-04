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

    var xtype = "modelFactory";
    var ModelFactory = new Class({
        Implements: [Events, Options],
        options: {
            $id: "",
            $xtype: xtype,
            refAlias:[],
            childrenAlias:[]
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
    ModelFactory.xtype = xtype;
    return Model;
});