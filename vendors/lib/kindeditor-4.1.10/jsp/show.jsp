<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="GB2312"%>
<%
request.setCharacterEncoding("UTF-8");
%>
<!doctype html>
<html>
<head>
</head>
<body>
<script src="/kindeditor-4.1.10/plugins/flvplayer/flowplayer/flowplayer-3.2.12.min.js"></script>
<div id="player">
<script language="JavaScript">var player = flowplayer("player","/kindeditor-4.1.10/plugins/flvplayer/flowplayer/flowplayer-3.2.12.swf", {clip: {url: "/kindeditor-4.1.10/attached/flvplayer/20140814/20140814200900_115.f4v", autoPlay: true, autoBuffering: true},}); player.play();</script>
</div>

</body>
</html>
