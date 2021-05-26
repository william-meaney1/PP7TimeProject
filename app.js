
  //const WebSocket = require('ws');

  var wsUri = "ws://localhost:20562/remote";
  var connection;
  const authreg = new RegExp('"authenticated":1*');
  const creqreg = new RegExp('clockRequest*');
  const cupdreg = new RegExp('clockUpdate*');
  var actionflag;

  function testWebSocket()
  {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
  }

  function init()
  {
    //output = document.getElementById("output");
    testWebSocket();
  }

  function onOpen(evt)
{
  console.log("CONNECTED");
  connection = doSend('{"action":"authenticate","protocol":"701","password":"control"}');
}

function onMessage(evt)
{

  if (authreg.test(evt.data)){
    actionflag = "auth"
  }

  if (creqreg.test(evt.data)){
    actionflag = "clockreq"
  }

  if (cupdreg.test(evt.data)){
    actionflag = "clockUpdate"
  }


  // !-- CHECK TO SEE IF THIS IS AN AUTHENTICATION RESPONSE LIKE THIS //
  // {"controller":1,"authenticated":1,"error":"","majorVersion":7,"minorVersion":1,"action":"authenticate"}

  console.log("Recieved: "+evt.data+"\n");

  switch( actionflag ) {
    case 'auth':
      //Request existing clocks
      console.log("auth succeeded, requesting clocks\n");
      doSend('{"action":"clockRequest"}');
      break;

    case 'clockreq':
      // Try to change "countdown to time" target time
      console.log("Clocks requested, updating clock at index 0\n")
      doSend(JSON.stringify({
        "action":"clockUpdate",
        "clockIndex":"0",
        "clockName":"SvcCount",
        "clockType":"1",
        "clockIsPM":"false",
        "clockTime":"09:00:00"
      }));

      break;

    case 'clockUpdate':
      //Start clock at index 0
      console.log("Clock updated, restarting timer\n")
      doSend('{"action":"clockStart","clockIndex":"0"}');
      actionflag = ""
      break;

    default:
      console.log(evt.data);
      websocket.close();
  }
}


  function onClose(evt)
  {
    websocket.close();
    console.log("Variable connection = "+connection);
  }

  function doSend(message)
  {
    console.log("sending message "+message+"\n");
    websocket.send(message);
  }

  init();