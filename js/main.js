var tempo;
var pos = 0;
var chordsIndex = 0;
var posOfChord = 0;
var timerId = 0;
var sliderMoving = false;
var duration = 0;
for (var i = 0; i < chords.length; i++) {
  duration += chords[i].length;
}

$(function() {
  $("#slider").slider(
    {
      "max": duration,
      "animate": "slow"
    }
  );

  $("#startButton").click(function() {
    console.log("start");

    // stop
    if (timerId != 0) {
      stopPlay();
      return;
    }

    // init
    chordsIndex = 0;
    pos = 0;
    posOfChord = 0;
    posOfChord = 0;
    
    tempo = $("#tempo").val() || 60;
    $("#tempo").prop("disabled", true);
    
    timerId = setInterval(play, 60000 / tempo / 2);// 8 beat
    $("button").text("STOP");
    $("#chordStreamCurrentChord").text("");
    
  });

  var play = function() {
    if (!sliderMoving) {
      $("#slider").slider("value", pos);
    }

    var currentChordName = chords[chordsIndex].chord;
    var lengthOfChord = chords[chordsIndex].length;
    
    // show chord
    $("#currentChordName").text(currentChordName + " - " + (posOfChord + 1) + "/" + lengthOfChord);
    setChordLengthColor($("#currentChordName"), lengthOfChord);

    var nextChordName;
    if (chordsIndex + 1 < chords.length) {
      nextChordName = chords[chordsIndex + 1].chord;
      var lengthOfNextChord = chords[chordsIndex + 1].length;
      $("#nextChordName").text(nextChordName + " - " + lengthOfNextChord);
      setChordLengthColor($("#nextChordName"), lengthOfNextChord);
    } else {
      $("#nextChordName").text("");
    }

    // chord finger
    var currentFingering = fingering[currentChordName];
    resetFingering($("#currentChord"));
    showFingering(currentFingering, $("#currentChord"));
    
    var nextFingering = fingering[nextChordName];
    resetFingering($("#nextChord"));
    showFingering(nextFingering, $("#nextChord"));
    
    // chord stream
    var tmpPos = pos;
    for (var i = 0; i < chords.length; i++) {
      tmpPos -= chords[i].length;
      if (tmpPos == -12) {
        if (i < chords.length - 1) {
          // add object
          var chord = chords[i + 1];
          $("#chordStream").append('<div class="chordStreamChild"></div>');
          var chordObj = $(".chordStreamChild:last");
          chordObj.css("position", "absolute");
          chordObj.css("top", "20rem");
          chordObj.text(chord.chord);
          var animateDuration = 60 / tempo * 6 * 1000;
          chordObj.animate({"top": 0}, {"duration": animateDuration, easing: "linear"});
        }
        break;
      } else if (tmpPos == 0) {
        $(".chordStreamChild:first").remove();
        $("#chordStreamCurrentChord").text(currentChordName);
      }
    }
    
    // loop end process
    posOfChord++;
    if (lengthOfChord == posOfChord) {
      chordsIndex++;
      posOfChord = 0;
    }
    pos++;
    if (pos == duration) {
      stopPlay();
    }
  }
  
  $("#slider").slider({
    start: function(event, ui) {
      sliderMoving = true;
    },
    stop: function(event, ui) {
      pos = ui.value;
      
      chordsIndex = 0;
      pos = 0;
      posOfChord = 0;
      posOfChord = 0;
      
      // TODO refactoring
      tempo = 10000;
      for (var i = 0; i < ui.value; i++) {
        play();
      }
      tempo = $("#tempo").val() || 60;
      
      sliderMoving = false;
    }
  });

});

function showFingering(fingering, obj) {
  if (!fingering) {
    return;
  }
  
  for (var i = 0; i < fingering.length; i++) {
    var finger = $('[data-finger-position="' + fingering[i].position + '"]', obj);
    finger.css("display", "block");
    finger.text(fingering[i].finger);
    
  }
}

function resetFingering(obj) {
  $(".finger", obj).each(function() {
    $(this).css("display", "none");
  });
}

function setChordLengthColor(obj, length) {
  var color = "black";
  if (length <= 2) {
    color = "red";
  }
  obj.css("color", color);
}

function stopPlay() {
  clearInterval(timerId);
  timerId = 0;
  $("#tempo").prop("disabled", false);
  $(".chordStreamChild").remove();
  $("button").text("START");
}

