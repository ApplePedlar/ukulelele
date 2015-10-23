$(function() {
  // ---- initialize ----
  var songs = initSongData();
  var importedSongs = [];
  function initSongData() {
    var songs = presetSongs;
    console.log("presetSongs = " + presetSongs);
    var importedSongs = [];
    var importedSongsJsonStr = localStorage.importedSongs;
    if (importedSongsJsonStr) {
      console.log("importedSongsJsonStr = " + importedSongsJsonStr);
      importedSongs = JSON.parse(importedSongsJsonStr);
      songs = songs.concat(importedSongs);
      console.log("songs = " + songs);
      console.log("songs.length = " + songs.length);
    }
    for (var i = 0; i < songs.length; i++) {
      $("#songSelect").append($("<option>").val(i).text(songs[i].name));
    }
    return songs;
  }
  
  var songIndex;
  var chords;
  var lyrics;
  var duration;
  var tempo;
  var pos = 0;
  var chordsIndex = 0;
  var posOfChord = 0;
  var lyricsIndex = 0;
  var posOfLyric = 0;
  var timerId = 0;
  var sliderMoving = false;
  var immediatelyAfterBeginning;
  
  // ---- song select ----
  initSong();
  $("#songSelect").change(initSong);
  function initSong() {
    console.log("initSong");
    stopPlay();
    
    songIndex = localStorage.songIndex || $("#songSelect").val() || 0;
    
    
    chords = songs[songIndex].chords;
    lyrics = songs[songIndex].lyrics;
    duration = 0;
    for (var i = 0; i < chords.length; i++) {
      duration += chords[i].length;
    }
    console.log("duration = " + duration);
    
    $("#slider").slider(
      {
        "max": duration,
        "animate": "slow",
        "value": 0
      }
    );
    
    tempo = songs[songIndex].tempo;
    $("#tempo").val(tempo);
    
    pos = 0;
    chordsIndex = 0;
    posOfChord = 0;
    lyricsIndex = 0;
    posOfLyric = 0;
  }
    
  
  // ---- play ----
  $("#startButton").click(function() {
    console.log("start");

    // stop
    if (timerId != 0) {
      stopPlay();
      return;
    }

    // init
    pos = 0;
    chordsIndex = 0;
    posOfChord = 0;
    lyricsIndex = 0;
    posOfLyric = 0;
    
    tempo = $("#tempo").val() || 100;
    $("#tempo").prop("disabled", true);
    $("#startButton").text("STOP");
    $("#chordStreamCurrentChord").text("");
    $("#lyric").text("");
    
    immediatelyAfterBeginning = true;
    timerId = setInterval(play, 60000 / tempo / 2);// 8 beat
  });

  var play = function() {
    if (!sliderMoving) {
      $("#slider").slider("value", pos);
    }

    var currentChordName = chords[chordsIndex].chord;
    var lengthOfChord = chords[chordsIndex].length;
    var currentLyric = lyrics[lyricsIndex].lyric || "";
    var lengthOfLyric = lyrics[lyricsIndex].length || 0;
    
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
    
    // show lyric
    $("#lyric").text(currentLyric);
  
    // chord finger
    var currentFingering = fingering[currentChordName];
    resetFingering($("#currentChord"));
    showFingering(currentFingering, $("#currentChord"));
    
    var nextFingering = fingering[nextChordName];
    resetFingering($("#nextChord"));
    showFingering(nextFingering, $("#nextChord"));
    
    // chord stream
    if (immediatelyAfterBeginning) {
      initChordStream();
    } else {
      var tmpPos = pos;
      for (var i = 0; i < chords.length; i++) {
        tmpPos -= chords[i].length;
        if (tmpPos == -24) {
          if (i < chords.length - 1) {
            // add object
            var chord = chords[i + 1];
            addChordStreamChild(chord, 24);
          }
          break;
        } else if (tmpPos == 0) {
          $("#chordStreamCurrentChord").text(currentChordName);
        }
      }
    }
    
    // loop end process
    posOfChord++;
    if (lengthOfChord == posOfChord) {
      chordsIndex++;
      posOfChord = 0;
    }
    
    posOfLyric++;
    if (lengthOfLyric == posOfLyric) {
      lyricsIndex++;
      posOfLyric = 0;
    }
    
    pos++;
    if (pos == duration) {
      stopPlay();
    }
    
    immediatelyAfterBeginning = false;
  }
  
  $("#slider").slider({
    start: function(event, ui) {
      sliderMoving = true;
    },
    stop: function(event, ui) {
      pos = ui.value;
      
      pos = 0;
      chordsIndex = 0;
      posOfChord = 0;
      lyricsIndex = 0;
      posOfLyric = 0;
      
      // TODO refactoring
      tempo = 10000;
      for (var i = 0; i < ui.value; i++) {
        play();
      }
      tempo = $("#tempo").val() || 60;
      
      sliderMoving = false;
      immediatelyAfterBeginning = true;
    }
  });

  // import song data
  $("#importSongButton").click(function() {
    console.log("click uploadsong button");
    var jsonStr = $("#songJsonTextarea").val();
    console.log("song json = " + jsonStr);
    var json = JSON.parse(jsonStr);
    importedSongs.push(json);
    localStorage.importedSongs = JSON.stringify(importedSongs);
    
  });
  
  // import song clear button
  $("#importSongClearButton").click(function() {
    console.log("click import song clear button");
    localStorage.clear();
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
    if (length <= 4) {
      color = "red";
    }
    obj.css("color", color);
  }

  function stopPlay() {
    clearInterval(timerId);
    timerId = 0;
    $("#tempo").prop("disabled", false);
    $(".chordStreamChild").remove();
    $("#startButton").text("START");
  }
  
  function initChordStream() {
    $(".chordStreamChild").remove();
    $("#chordStreamCurrentChord").text(chords[chordsIndex].chord);
    
    var tmpPos = pos;
    for (var i = 0; i < chords.length; i++) {
      tmpPos -= chords[i].length;
      if (tmpPos < 0 && tmpPos >= -24) {
        if (i < chords.length - 1) {
          // add object
          var chord = chords[i + 1];
          addChordStreamChild(chord, -tmpPos);
        }
      } else if (tmpPos < -24) {
        break;
      }
    }
  }
  
  function addChordStreamChild(chord, pos) {
    $("#chordStream").append('<div class="chordStreamChild"></div>');
    var chordObj = $(".chordStreamChild:last");
    chordObj.css("position", "absolute");
    chordObj.css("top", (pos * 20 / 24) + "rem");
    chordObj.text(chord.chord);
    var animateDuration = 60 / tempo * pos * 12 / 24 * 1000;
    chordObj.animate({"top": 0}, {"duration": animateDuration, easing: "linear"});
  }

  
});

