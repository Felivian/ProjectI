$(document).ready(function() {
    var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
    $.ajax({
    type: 'GET',
    url: '/chart1/'+userId,
    success:  function(json) {
        console.log(json);
        //generateAlert('alert-info','Your ad was added successfully.');
        var r;
        var g;
        var b;
        var labels = [];
        var data = [];
        backgroundColor = [];
        borderColor = [];
        for (var i = 0; i < json.length; i++) {
            if(json[i]._id) {
                labels.push('Found match');
            } else {
                labels.push('Not found match');
            }
            data.push(json[i].count);
            r = Math.floor(Math.random() * 255);
            g = Math.floor(Math.random() * 255);
            b = Math.floor(Math.random() * 255);
            backgroundColor.push('rgba('+r+', '+g+', '+b+', 0.4)');
            borderColor.push('rgba('+r+', '+g+', '+b+', 1)');
            //backgroundColor.push(getRandomColor());
        }

        var ctx = document.getElementById("myChart1").getContext('2d');

        var myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });

    }
    });

    var userId = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
    $.ajax({
    type: 'GET',
    url: '/chart2/'+userId,
    success:  function(json) {
        console.log(json);
        var r;
        var g;
        var b;
        var labels = [];
        var data = [];
        backgroundColor = [];
        borderColor = [];
        for (var i = 0; i < json.length; i++) {
            labels.push(json[i]._id);
            data.push(json[i].count);
            r = Math.floor(Math.random() * 255);
            g = Math.floor(Math.random() * 255);
            b = Math.floor(Math.random() * 255);
            backgroundColor.push('rgba('+r+', '+g+', '+b+', 0.4)');
            borderColor.push('rgba('+r+', '+g+', '+b+', 1)');
            //backgroundColor.push(getRandomColor());
        }
        // for (var i = 0; i < 10; i++) {
        //     labels.push(json[0]._id);
        //     data.push(json[0].count);
        //     r = Math.floor(Math.random() * 255);
        //     g = Math.floor(Math.random() * 255);
        //     b = Math.floor(Math.random() * 255);
        //     backgroundColor.push('rgba('+r+', '+g+', '+b+', 0.4)');
        //     borderColor.push('rgba('+r+', '+g+', '+b+', 1)');
        // }

        var ctx = document.getElementById("myChart2").getContext('2d');

        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '# of ads',
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });

    }
    });

});

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}