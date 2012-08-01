// from: http://stackoverflow.com/questions/439463/how-to-get-get-and-post-variables-with-jquery

// parses get variables PHP style

var $_GET = {};

document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
    }

    $_GET[decode(arguments[1])] = decode(arguments[2]);
});

// set defaults in case user didn't define

var getDefaults = {
    'song': '0',
    'time': '0'
};

for (var key in getDefaults){
    if (typeof($_GET[key]) === 'undefined' || $_GET[key] === ""){
        $_GET[key] = getDefaults[key];
    }
}
// deal with key bindings
$(document).on('keyup', function (e){
    switch (e.keyCode){
        case 77: // m
            toggleMute();
            break;
        case 69: // e
            window.location = "index.html";
            break;
        case 65: // a
            toggleAutoplay();
            break;
    }
});
// toggle mute
var currentlyMuted = false;
function toggleMute(){
    if (typeof(currentSong) !== 'undefined'){
        currentSong.setVolume(currentlyMuted ? 100 : 0);
    }
    $('#toggleMute').css('color', (currentlyMuted ? '#FFF' : '#F00'))
    currentlyMuted = !currentlyMuted;
}
// toggle autoplay
var autoplay = true;
function toggleAutoplay(){
    autoplay = !autoplay;
    if (autoplay){
        $(".step.active").trigger('impress:stepenter');
    }
    else {
        clearTimeout(currentTimeout);
    }
    $('#toggleAutoplay').css('color', (autoplay ? '#FFF' : '#F00'))
}
// set bindings
$(document).ready(function (){
    if ($_GET['muted'] === '1'){
        toggleMute();
    }
    if ($_GET['autoplay'] === '0'){
        toggleAutoplay();
    }
});
// bind timings
var currentTimeout;
$(document).ready(function (){
    ready();
    api = impress();
    api.init();
    $("#impress .step").on('impress:stepenter', function (){
        if (autoplay){
            clearTimeout(currentTimeout);
            // get next time
            if (typeof($(this).data('timeout')) !== 'undefined'){
                currentTimeout = setTimeout(function (){
                    api.next();
                }, $(this).data("timeout") * 1500);
            }
            // check if we need to go elsewhere
            if (typeof($(this).data('next')) !== 'undefined'){
                var $slide = $(this);
                currentTimeout = setTimeout(function (){
                    openNextLink($slide);
                }, 5000);
            }
        }
    });
    $("#impress .step:first-child").trigger("impress:stepenter");
});
soundManager.setup({
  url: 'js/sm2/',
  flashVersion: 9, 
  debugMode: false,
  onready: function() {
    ready();
  }
});
var library = ["Super_Friendly.mp3", "Enter_the_Party.mp3", "Funk_Game_Loop.mp3", "Chipper_Doodle_v2.mp3", "Open_Those_Bright_Eyes.mp3"];
var thingsReady = 0;
var currentSong;

function queueNewSong(){
    $_GET['song'] = ((parseInt($_GET['song']) + 1)%library.length);
    $_GET['time'] = '0';
    playSong();
}
function ready(){
    thingsReady++;
    if (thingsReady == 2){
        if (typeof($("#impress").data("no-song")) === 'undefined'){
            playSong();
        }
    }
}
function playSong(){
    soundManager.destroySound('soundtrack');
    // can now play sound
    currentSong = soundManager.createSound({
         id: 'soundtrack', // required
         url: 'sound/' + library[$_GET['song']], // required
         volume: (currentlyMuted ? 0 : 100),
         position: parseInt($_GET['time']),
         autoPlay: true,
         onfinish: queueNewSong
    });
}
// deal with next section links
$(document).ready(function (){
    $("a[href='#']").click(function (e){
        e.preventDefault();
        e.stopPropagation();
    });
});
function nextSectionLink(el){
    openNextLink($(el).parents('.step'));
}
function openNextLink($slide){
    var nextURL = $slide.attr('data-next');
    var continueSong = (typeof($slide.data('end')) === 'undefined');
    window.location = nextURL + (continueSong ? ("?song=" + $_GET['song'] + '&time=' + currentSong.position) + "&muted=" + (currentlyMuted?"1":"0") + "&autoplay=" + (autoplay?"1":"0") : "");
}