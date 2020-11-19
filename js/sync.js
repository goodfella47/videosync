
var vidR = document.getElementById("video-channel-1"),
    vidG = document.getElementById("video-channel-2"),
    button = $('#play-pause'),
    totalTimeSpan_R = $('.totalTime_R'),
    totalTimeSpan_G = $('.totalTime_G'),
    current_R_TimeSpan = $('#current_R_Time'),
    current_G_TimeSpan = $('#current_G_Time'),
    current_G_Deviation = $('#current_G_Deviation'),
    scrub = document.getElementById("scrub"),
    duration;

function readyVidInterlace() {
  if ((vidR.readyState >= 3) && (vidG.readyState >= 3)) {
    $('button').fadeIn();
    duration_R = vidR.duration;
    duration_G = vidG.duration;
    totalTimeSpan_R.html(duration_R.toFixed(3));
    totalTimeSpan_G.html(duration_G.toFixed(3));
  }
}

function vidDeviationControl() {
    function updateVideoStats() {
        var current_R_Time, current_G_Time;
        var scrub_coeff = 200/vidR.duration;
        if ((!vidR.seeking) && (!vidG.seeking)) {
            current_R_Time = vidR.currentTime.toFixed(3);
            current_G_Time = vidG.currentTime.toFixed(3);
            current_R_TimeSpan.html(current_R_Time);
            current_G_TimeSpan.html(current_G_Time);
            current_G_Deviation.html((vidR.currentTime - vidG.currentTime).toFixed(5));
            scrub.value = current_R_Time*scrub_coeff;
        } else {
            return;
        }
    }
    if ((Math.abs(vidR.currentTime - vidG.currentTime) > 0.075)) {
        $('#current_G_Deviation').css("background-color", "red");
        cancelAnimationFrame(vidDeviationControl);
        vidG.pause();
        vidR.pause();
        vidG.currentTime = vidR.currentTime;
        vidR.play();
        vidG.play();
    }
    else{
         $('#current_G_Deviation').css("background-color", "transparent");
    }
    updateVideoStats();
    if (vidR.paused || vidR.ended) {
        cancelAnimationFrame(vidDeviationControl);
        $(button).html('Play');
        return;
    } else {
        requestAnimationFrame(vidDeviationControl);
    }
}

function startVideoInterlace() {
    vidR.play();
    vidG.play();
    vidDeviationControl();
}

function stopVideoInterlace() {
    vidR.pause();
    vidG.pause();
}

$(button).click(function(e) {
    e.preventDefault();
    if (vidR.paused || vidR.ended) {
        startVideoInterlace();
        $(this).html('Pause');
    } else {
        stopVideoInterlace();
        $(this).html('Play');
    }
});

$(scrub).click(function(e){
               e.preventDefault();
               stopVideoInterlace();
               //var scrubValue = scrub.value/200;
               vidR.currentTime = vidR.duration*(scrub.value/200);
               startVideoInterlace();
});

$(vidR).dblclick(function(){
                 vidR.requestFullscreen()
                 });

$(vidG).dblclick(function(){
                 vidG.requestFullscreen()
                 });
