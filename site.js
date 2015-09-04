if (Meteor.isClient) {

  /* Greetings script. */
  function greeting() {} greeting.toString = function (){
    console.log('%cWow! %cYou know your stuff!', 'color: rgb(39, 39, 39);', 'color: rgb(112, 196, 188);');
    return " ";
  };
  /* runs the games resizeCanvas function. probly doesn't work :p */
  function resize(){
    for( var i = 0; i < games.length; i++){
      games[i].resizeCanvas();
    }
  }

  /* Runs background script on template being rendered. */
  /* Remove the first two lines to disable. */
  Template.home.onRendered(function () {
    init();
    window.onresize = resize();
    greeting.toString();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}