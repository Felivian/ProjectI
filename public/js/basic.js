var urlArr = window.location.href.split("/"); 
socket = io.connect(urlArr[0]+'//'+urlArr[2]);
socket.emit('leaveChannels',{});
var re = new RegExp('#_=_');

var urlArr = window.location.href.split("/");
if (re.test(window.location.href)) {
    var newURL='';
    for (var i = 0; i < urlArr.length-1; i++) {
        newURL= newURL+urlArr[i]+'/';
    }
    window.location.href=newURL;
}