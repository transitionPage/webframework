/**
 * appPageData格式："appPageData"+"AaA"+应用信息+"YzY"+当前页面title+"YzY"+当前URL+"YzY"+页面访问开始时间+"YzY"+页面访问结束时间+"YzY"+上一级URL+"YzY"+页面按钮链接等点击
 * 
 * 公共方法:statisClickNum(id,name),页面中调用该方法收集按钮、链接、组件点击数据
 * --------该方法参数：id页面中id,name为定义的名称
 */
(function(){
	_charAt = "charAt",
	_str_indexOf = "indexOf",
	_length = "length",
	_substring = "substring",
	_split = "split",
	_join = "join",
	_encodeURI = encodeURIComponent,
	_undefined = "undefined",
	_appInfo="appInfo";
	
	var WiseduCommonUtil = function(){
		var oThis = this;
		oThis.IsEmpty = function(o){
            return ((null == o)||(_undefined == o) || ("-" == o) || ("" == o));
        },
        oThis.Encode = function(uri){
            return encodeURI(uri);
        },
        oThis.Decode = function(uri){
            return decodeURI(uri);
        },
        oThis.Trim = function(str){
	        if(!str || "" == str){
	            return "";
	        }
	        for(; str[_charAt](0)[_length] > 0 && " \n\r\t"[_str_indexOf](str[_charAt](0)) > -1;){
	            str = str[_substring](1);
	        }
	        for(; str[_charAt](str[_length] - 1)[_length] > 0 && " \n\r\t"[_str_indexOf](str[_charAt](str[_length] - 1)) > -1;){
	            str = str[_substring](0, str[_length] - 1);
	        }
	        return str;
        };
        oThis.SubStr = function(str){
        	if(str[_str_indexOf]("?")!=-1){
        		str = str[_substring](0,str[_str_indexOf]("?"));
        		return str;
        	}
        	return str;
        };
		oThis.getAppInfo=function(url){
			
			if (url.indexOf("?") != -1) { 
				var str = url.substr(1); 
				// console.log("str="+str);
				strs = str.split("&"); 
				for(var i = 0; i < strs.length; i ++) {
					var arr = strs[i].split("=");
					if(arr[0]=="appInfo"){
						var app = strs[i].substring("appInfo=".length);
						// console.log("app="+app);
						return app;
					}
				}
			}
        };
        // 判断是否是苹果浏览器
        oThis.isSafari = function(){
        	var ua = navigator.userAgent.toLowerCase();
        	// console.log(ua);
        	// return ua.match(/version\/([\d.]+).*safari/);
        	return ua.indexOf("safari") > -1 && ua.indexOf("chrome") < 1;
        };
        oThis.isNull = function(str){
        	if(str == null || str == undefined  || str == ""){
        		return true;
        	}
        	return false;
        };
	};
	var _WiseduCommonUtil = new WiseduCommonUtil();
	
	var Base64Utils = function(){
		var oThis = this;
		base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		base64DecodeChars = new Array(  
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  
				-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,  
				52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,  
				-1,0,1,2,3, 4,5,6,7,8,9,10, 11, 12, 13, 14,  
				15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,  
				-1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,  
				41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
		oThis.base64encode = function(str){
			var out, i, len;  
			var c1, c2, c3;  
			len = str.length;  
			i = 0;  
			out = "";  
			while(i < len) {  
			 c1 = str.charCodeAt(i++) & 0xff;  
			 if(i == len)  
			 {  
			out += base64EncodeChars.charAt(c1 >> 2);  
			out += base64EncodeChars.charAt((c1 & 0x3) << 4);  
			out += "==";  
			break;  
			 }  
			 c2 = str.charCodeAt(i++);  
			 if(i == len)  
			 {  
			out += base64EncodeChars.charAt(c1 >> 2);  
			out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
			out += base64EncodeChars.charAt((c2 & 0xF) << 2);  
			out += "=";  
			break;  
			 }  
			 c3 = str.charCodeAt(i++);  
			 out += base64EncodeChars.charAt(c1 >> 2);  
			 out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));  
			 out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));  
			 out += base64EncodeChars.charAt(c3 & 0x3F);  
			}  
			return out;
		};
		oThis.base64decode = function(str){
			var c1, c2, c3, c4;  
			var i, len, out;  
			len = str.length;  
			i = 0;  
			out = "";  
			while(i < len) {  
			 /* c1 */  
			 do {  
			c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];  
			 } while(i < len && c1 == -1);  
			 if(c1 == -1)  
			break;  
			 /* c2 */  
			 do {  
			c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];  
			 } while(i < len && c2 == -1);  
			 if(c2 == -1)  
			break;  
			 out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));  
			 /* c3 */  
			 do {  
			c3 = str.charCodeAt(i++) & 0xff;  
			if(c3 == 61)  
			return out;  
			c3 = base64DecodeChars[c3];  
			 } while(i < len && c3 == -1);  
			 if(c3 == -1)  
			break;  
			 out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));  
			 /* c4 */  
			 do {  
			c4 = str.charCodeAt(i++) & 0xff;  
			if(c4 == 61)  
			return out;  
			c4 = base64DecodeChars[c4];  
			 } while(i < len && c4 == -1);  
			 if(c4 == -1)  
			break;  
			 out += String.fromCharCode(((c3 & 0x03) << 6) | c4);  
			}  
			return out;
		};
		oThis.utf16to8 = function(str){
			var out, i, len, c;  
			out = "";  
			len = str.length;  
			for(i = 0; i < len; i++) {  
			 c = str.charCodeAt(i);  
			 if ((c >= 0x0001) && (c <= 0x007F)) {  
			out += str.charAt(i);  
			 } else if (c > 0x07FF) {  
			out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));  
			out += String.fromCharCode(0x80 | ((c >>6) & 0x3F));  
			out += String.fromCharCode(0x80 | ((c >>0) & 0x3F));  
			 } else {  
			out += String.fromCharCode(0xC0 | ((c >>6) & 0x1F));  
			out += String.fromCharCode(0x80 | ((c >>0) & 0x3F));  
			 }  
			}  
			return out; 
		};
		oThis.utf8to16 = function(str){
			var out, i, len, c;  
			var char2, char3;  
			out = "";  
			len = str.length;  
			i = 0;  
			while(i < len) {  
			 c = str.charCodeAt(i++);  
			 switch(c >> 4)  
			 {  
			case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:  
			// 0xxxxxxx
			out += str.charAt(i-1);  
			break;  
			case 12: case 13:  
			// 110x xxxx 10xx xxxx
			char2 = str.charCodeAt(i++);  
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));  
			break;  
			case 14:  
			// 1110 xxxx 10xx xxxx 10xx xxxx
			char2 = str.charCodeAt(i++);  
			char3 = str.charCodeAt(i++);  
			out += String.fromCharCode(((c & 0x0F) << 12) |  
			((char2 & 0x3F) << 6) |  
			((char3 & 0x3F) << 0));  
			break;  
			 }  
			}  
			return out;
		};
	};
	var _Base64Utils = new Base64Utils();
	
	// Cookie操作类
    var CookieUtil = function(){
    	var oThis = this;
    	// 设置Cookie保存时间为1年
    	oThis.setCookie =function(key,v){
    		var exp = new Date();
    		exp.setTime(exp.getTime()+365*24*3600*1000);
    		// document.cookie="appFrontCookie="+v+";expires="+exp.toGMTString();
    		document.cookie=key+"="+_Base64Utils.base64encode(_Base64Utils.utf16to8(v));
    	};
    	oThis.getCookie= function(key){
    		var strCookie2=document.cookie;
    		var arrCookie2=strCookie2.split(";");
    		var len2 = arrCookie2.length;
    		var i2;
    		var arr2;
    		for(i2=0;i2<len2;i2++){
    			arr2=arrCookie2[i2].split("=");
    			if(_WiseduCommonUtil.Trim(arr2[0])==key){
    				// var arrInfo = arr2[1].split("_w.w_");
    				// 格式:embUrl_w.w_schoolID_w.w_userID_w.w_appID
    				return _Base64Utils.utf8to16(_Base64Utils.base64decode(arr2[1]));
    			};		
    		}
    		return "";
    	};
    	oThis.setCookieBak =function(key,v){
    		var exp = new Date();
    		exp.setTime(exp.getTime()+365*24*3600*1000);
    		// document.cookie="appFrontCookie="+v+";expires="+exp.toGMTString();
    		document.cookie=key+"="+v;
    	};
    	oThis.getCookieBak = function(key){
    		var strCookie2=document.cookie;
    		var arrCookie2=strCookie2.split(";");
    		var len2 = arrCookie2.length;
    		var i2;
    		var arr2;
    		for(i2=0;i2<len2;i2++){
    			arr2=arrCookie2[i2].split("=");
    			if(_WiseduCommonUtil.Trim(arr2[0])==key){
    				return arrCookie2[i2];
    			};		
    		}
    		return "";
    	};
    };
    var _CookieUtil = new CookieUtil();
    
    var isSafari = _WiseduCommonUtil.isSafari();
    // 跨域发送类
    var SynSend = function(){
    	var oThis = this;
    	var appInfo="";
    	var embUrl="";
    	var appInfoCookieVal = _CookieUtil.getCookie(_appInfo);
    	var appInfoUrl=_WiseduCommonUtil.getAppInfo(document.location.search);// 获取应用业务数据和url
    	// console.log("appInfo="+appInfoUrl);
    	// console.log("appInfoCookie="+appInfoCookieVal);
    	if(_WiseduCommonUtil.IsEmpty(appInfoCookieVal)){
    		if(_WiseduCommonUtil.IsEmpty(appInfoUrl)){
    			appInfo="";
    			embUrl="";
    		}else{
    			var appInfoArry = appInfoUrl.split("_w.w_");
    			embUrl = _Base64Utils.utf8to16(_Base64Utils.base64decode(appInfoArry[0]));
        		appInfo=appInfoArry[1]+"YzY"+appInfoArry[2]+"YzY"+appInfoArry[3];
        		appInfoUrl = embUrl+"_w.w_"+appInfoArry[1]+"_w.w_"+appInfoArry[2]+"_w.w_"+appInfoArry[3];
    			_CookieUtil.setCookie(_appInfo,_Base64Utils.utf8to16(appInfoUrl));
    		};
    	}else{
    		var appInfoArry = appInfoCookieVal.split("_w.w_");
    		embUrl=appInfoArry[0];
    		appInfo=appInfoArry[1]+"YzY"+appInfoArry[2]+"YzY"+appInfoArry[3];
    	}
    	oThis.appDataSendStatus = window.appDataSendStatus=function(status){
    		 // console.log(status.statusCode);
    	};
    	var guid = new Date().getTime()+""+Math.round(Math.random() * 123456);
    	oThis.sendAppPageData = function(pageData){
    		var val = "appPageData"+"AaA"+guid+"YzY"+appInfo+"YzY"+pageData;
    		var url = embUrl+"?secret=iojawdnaisdflknoiankjfdblaidcas&apiType=produce&token=iojawdnaisdflknoiankjfdblaidcas&contentType=text/plain"+"&content="+encodeURIComponent(encodeURIComponent(val))+"&callback=appDataSendStatus"+"&timeFlag="+new Date().getTime();    	
    	    if(!_WiseduCommonUtil.IsEmpty(embUrl)){
    	    	if(isSafari){
    	    		document.cookie="appPageData="+url;
    	    	}
    	    	var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                var id = new Date().getTime();
    	    	script.id = id;
    	    	document.body.appendChild(script);
    	    	document.body.removeChild(document.getElementById(id));
    	    	// console.log("请求总线结束");
    	    };
    	};
    	oThis.sendAppPageClickNum = function(clickNum){
    		var val = "appPageClickNum"+"AaA"+appInfo+"YzY"+clickNum;
    		var url = embUrl+"?secret=iojawdnaisdflknoiankjfdblaidcas&apiType=produce&token=iojawdnaisdflknoiankjfdblaidcas&contentType=text/plain"+"&content="+encodeURIComponent(encodeURIComponent(val))+"&callback=appDataSendStatus"+"&timeFlag="+new Date().getTime();
    		if(!_WiseduCommonUtil.IsEmpty(embUrl)){
    	    	var script = document.createElement("script");
                script.type = "text/javascript";
                script.src = url;
                var id = new Date().getTime();
    	    	script.id = id;
    	    	document.body.appendChild(script);
    	    	document.body.removeChild(document.getElementById(id));
    	    };
    	};
    };
    var _synSend = new SynSend();
    
    var refUrl = _WiseduCommonUtil.SubStr(document.referrer);// 上一级URL
	var curUrl = _WiseduCommonUtil.SubStr(document.URL);// 当前URL
	var curTitle = document.title;// 当前页面标题
	var startTime = new Date().getTime();// 访问当前页面的开始时间
	
	// 统计页面按钮、链接、公共组件点击次数
    var clickNumArry = new Array();
    window.statisClickNum = function(id,name){
    	// console.log(id+" "+name);
    	clickNumArry.push(id+"CcC"+name);
    	if(clickNumArry.length>30){
    		var clickNumStr = clickNumArry.join("BbB");
    		var clickSendTime = new Date().getTime();
    		var clickNum = curTitle+"YzY"+curUrl+"YzY"+clickSendTime+"YzY"+clickNumStr;
    		clickNumArry.length=0;
    		_synSend.sendAppPageClickNum(clickNum);
    	}
    };
   
    window.onbeforeunload = function(){
		var endTime = new Date().getTime();
		var pageData = "";
		if(clickNumArry.length>0){
			var clickNumStr = clickNumArry.join("BbB");
			clickNumArry.length=0;
			pageData = curTitle+"YzY"+curUrl+"YzY"+startTime+"YzY"+endTime+"YzY"+refUrl+"YzY"+clickNumStr;
		}else{
			pageData = curTitle+"YzY"+curUrl+"YzY"+startTime+"YzY"+endTime+"YzY"+refUrl;
		}
		_synSend.sendAppPageData(pageData);	
    };
    window.onunload = function(evt){
    	var endTime = new Date().getTime();
		var pageData = "";
		if(clickNumArry.length>0){
			var clickNumStr = clickNumArry.join("BbB");
			clickNumArry.length=0;
			pageData = curTitle+"YzY"+curUrl+"YzY"+startTime+"YzY"+endTime+"YzY"+refUrl+"YzY"+clickNumStr;
		}else{
			pageData = curTitle+"YzY"+curUrl+"YzY"+startTime+"YzY"+endTime+"YzY"+refUrl;
		}
		_synSend.sendAppPageData(pageData);	
	};
	if(isSafari){
		// alert("是safari");
		var urlBak = _CookieUtil.getCookieBak("appPageData");		
		_CookieUtil.setCookieBak("appPageData","");
		if(!_WiseduCommonUtil.IsEmpty(urlBak)){
			if(urlBak[_str_indexOf]("appPageData=")!=-1){
				urlBak = urlBak[_substring]("appPageData=".length);
        	}			
			var script = document.createElement("script");
	        script.type = "text/javascript";
	        script.src = urlBak;
	        var id = new Date().getTime();
	    	script.id = id;
	    	document.body.appendChild(script);
	    	document.body.removeChild(document.getElementById(id));
		}	
	}
})()