var urlArr = window.location.href.split("/"); 
socket = io.connect(urlArr[0]+'//'+urlArr[2]);
socket.emit('leaveChannels',{});


var urlArr = window.location.href.split("/");
if (re.test(window.location.href)) {
console.log('true');
    var newURL='';
    for (var i = 0; i < urlArr.length-1; i++) {
        newURL= newURL+urlArr[i]+'/';
    }
    console.log(newURL);
    window.location.href=newURL;
}