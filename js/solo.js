var notes = [
  { "note":"    ", "length":24 },
  
  { "note":" 300", "length":3 },
  { "note":"0   ", "length":1 },
  { "note":" 3  ", "length":2 },
  
  { "note":" 000", "length":6 },
  
  { "note":" 300", "length":3 },
  { "note":"0   ", "length":1 },
  { "note":" 3  ", "length":2 },
  
  { "note":" 000", "length":6 },
  
  { "note":"5350", "length":4 },
  { "note":"5   ", "length":2 },
  
  { "note":"2120", "length":6 },
  
  { "note":"3000", "length":4 },
  { "note":"3   ", "length":2 },
  
  { "note":" 300", "length":6 },
  
  { "note":"0102", "length":4 },
  { "note":"0   ", "length":2 },
  
  { "note":"3102", "length":3 },
  { "note":"2   ", "length":1 },
  { "note":"0   ", "length":2 },
  
  { "note":" 300", "length":3 },
  { "note":"0   ", "length":1 },
  { "note":" 3  ", "length":2 },
  
  { "note":" 000", "length":6 },
  
  { "note":"0102", "length":4 },
  { "note":"0   ", "length":2 },
  
  { "note":"3102", "length":3 },
  { "note":"2   ", "length":1 },
  { "note":"0   ", "length":2 },
  
  { "note":" 300", "length":3 },
  { "note":"0   ", "length":1 },
  { "note":" 3  ", "length":2 },
  
  { "note":" 000", "length":6 },
  
  { "note":"5350", "length":4 },
  { "note":"5   ", "length":2 },
  
  { "note":"8350", "length":3 },
  { "note":"5   ", "length":1 },
  { "note":" 7  ", "length":2 },
  
  { "note":"3000", "length":6 },
  
  { "note":"7000", "length":6 },
  
  { "note":"3000", "length":2 },
  { "note":" 3  ", "length":2 },
  { "note":" 0  ", "length":2 },
  
  { "note":" 320", "length":3 },
  { "note":" 1  ", "length":1 },
  { "note":"  2 ", "length":2 },
  
  { "note":"  00", "length":12 },
];

$(function() {
  var tempo;
  var pos = 0;
  var notesIndex = 0;
  var timerId = 0;
  
  $("#startButton").click(function() {
    console.log("start");

    // stop
    if (timerId != 0) {
      stopPlay();
      return;
    }

    // init
    pos = 0;
    notesIndex = 0;
    tempo = $("#tempo").val() || 100;
    $(".note").remove();
    
    $("#startButton").text("STOP");
    timerId = setInterval(play, 60000 / tempo / 2);// 8 beat
    
  });
  
  var play = function() {
    console.log("play pos=" + pos);
    
    //var currentNote = notes[notesIndex].note;
    //var lengthOfNote = notes[notesIndex].length;
    
    var tmpPos = pos;
    for (var i = 0; i < notes.length; i++) {
      tmpPos -= notes[i].length;
      if (tmpPos == -24) {
        if (i < notes.length - 1) {
          // add object
          var note = notes[i + 1].note;
          addNote(note, 24);
        }
        break;
      }
    }
    
    $(".note").each(function() {
      console.log($(this).css("left"));
      if ($(this).css("left") == "-32px") {
        $(this).remove();
      }
    });
      
    // loop end process
    pos++;
  }
  
  function stopPlay() {
    clearInterval(timerId);
    timerId = 0;
    $("#tempo").prop("disabled", false);
    $("#startButton").text("START");
  }
  
  function addNote(note, pos) {
    console.log("addNote " + note + " " + pos);
    if (note.length != 4) {
      return;
    }
    for (var i = 0; i < 4; i++) {
      var text = note.charAt(i);
      $("#line" + (i + 1)).append('<div class="note"></div>');
      var noteObj = $("#line" + (i + 1) + " .note:last");
      noteObj.css("left", (pos) + "rem");
      noteObj.text(text);
      var animateDuration = 60 / tempo * pos * 12 / 24 * 1000;
      noteObj.animate({"left": "-2rem"}, {"duration": animateDuration, easing: "linear"});
    }
  }


});