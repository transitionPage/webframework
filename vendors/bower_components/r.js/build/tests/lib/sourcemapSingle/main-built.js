define("a",{name:"a",doSomething:function(e){console.log("Hello "+e)}}),console.log("a is done"),define("b",[],function(){var e="b";return{name:e}}),require(["a","b"],function(e,n){console.log("a message below:"),e.doSomething("world"),console.log("b name: "+n.name)}),define("main",function(){});
//# sourceMappingURL=main-built.js
//# sourceMappingURL=main-built.js.map