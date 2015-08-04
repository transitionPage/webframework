require.config({
    paths: {
        art2: '../../../../../webframework/vendors/lib/artdialog/artDialog.source',
        artIframe2: '../../../../../webframework/vendors/lib/artdialog/iframeTools.source',
        my97DatePicker2: "../../../../../../webframework/vendors/lib/My97DatePicker/WdatePicker",
        zTree2: "../../../../../webframework/vendors/lib/zTree_v3/js/jquery.ztree.all-3.5",
        kindeditor2: "../../../../../webframework/vendors/lib/kindeditor-4.1.10/kindeditor"
    },
    shim: {
        art2: {
            exports: 'art2'
        },
        artIframe2: {
            deps: ['art2'],
            exports: 'artIframe2'
        },
        my97DatePicker2: {
            exports: "my97DatePicker2"
        },
        zTree2: {
            exports: "zTree2"
        },
        kindeditor2: {
            exports: "kindeditor2"
        }
    }
});

define(["./Factory", "../../vendors/bower_components/avalon/mmPromise"], function (factory) {
    var named = "PageMgr";

    if (window[named] == undefined) {
        window[named] = factory;
    }
    return factory;
});