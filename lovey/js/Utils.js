/**
 * Created by qianqianyi on 15/5/6.
 */
define([], function () {
    var Utils = new Class({
        uuid: function () {
            return String.uniqueID();
        },
        ajax: function (url, params, success, fail) {
            jQuery.ajax({
                url: url,
                data: params,
                type:'POST',
                dataType: 'json',
                cache: false,
                success: function (data) {
                    //TODO
                    success(data);
                },
                error: fail
            });
        },
        syncAjax: function (url, params) {
            var result = null;
            jQuery.ajax({
                url: url,
                async:false,
                data: params,
                type:'POST',
                dataType: 'json',
                cache: false,
                success: function (data) {
                    result = data;
                },
                error: function() {}
            });
            return result;
        }
    });
    return Utils;
});