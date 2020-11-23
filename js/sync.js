
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

//var mediainfo = MediaInfo({ format: 'text', locateFile: vidR.src });
// const MediaInfo = require('mediainfo.js')
// var file = new File([], vidR.src, {
//   type: "video/mp4",
// });
file = loadFile("vids/vid1.mp4");

const get_media_info = (mediainfo) => {
  console.log(file);
  if (file) {
    const getSize = () => file.size
    const readChunk = (chunkSize, offset) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target.error) {
            reject(event.target.error)
          }
          resolve(new Uint8Array(event.target.result))
        }
        reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
      })
	console.log(mediainfo);
    mediainfo
      .analyzeData(getSize, readChunk)
      .then((result) => {
      console.log(result);
		//console.log(result.indexOf("Time code of first frame"));
		var timecode_line = lineOf(result,"Time code of first frame");

		var fps_line = lineOf(result, "Frame rate  ");
		var split = result.split("\n");
		var timecode = split[timecode_line].slice(-11);
		var fps = parseFloat(split[fps_line].slice(-10,-4));
		var t1 = Timecode(timecode,fps);
		var t2 = Timecode("00:21:27:49",fps);
    console.log("hi");
		console.log(timecode);
		console.log(fps);
      })
      .catch((error) => {
        console.log(`An error occured:\n${error.stack}`);
      })
  }
}

MediaInfo({ format: 'text' }, (mediainfo) => {
  get_media_info(mediainfo);
})


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

function lineOf(text, substring){
  var line = 0, matchedChars = 0;

  for (var i = 0; i < text.length; i++) {
    text[i] === substring[matchedChars] ? matchedChars++ : matchedChars = 0;

    if (matchedChars === substring.length){
        return line;
    }
    if (text[i] === '\n'){
        line++;
    }
  }

  return  -1;
}

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
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
