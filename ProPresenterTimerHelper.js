
  const WebSocket = require('ws');
  const fs = require('fs');
  var ppconfig  = "";
  var configFile = "";


//read config file
try {
  ppconfig = fs.readFileSync('ppconfig.txt', 'utf8');
} catch (err) {
  console.error(err);
}

var config = JSON.parse(ppconfig);

var ctrlPassword = config.password;
var ctrlPort = config.port;
var service1 = config.service1;
var service2 = config.service2;
var timerIndex = config.timerIndex;
var clockName = config.clockName;

  currTime = new Date().toLocaleTimeString('en-US', {hour12: false });
  currdatetime = ("01/01/2011 "+currTime);
  currHours = parseInt(new Date().toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }));
  targetTime = "";
  pmcheck = false;

  
  if (Date.parse(currdatetime) < Date.parse("01/01/2011 "+service1)){
    targetTime = service1;
  } else {
    targetTime = service2;
  }

  if ( parseInt(new Date("01/01/2011 "+service1).toLocaleTimeString('en-US', { hour: '2-digit', hour12: false })) > 12 ){
    pmCheck = 1;
  } else {
    pmCheck = 0;
  }

  //console.log("Is it PM? "+pmCheck);

  var wsUri = "ws://localhost:"+ctrlPort+"/remote";
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
    testWebSocket();
  }

  function onOpen(evt)
{
  //console.log("CONNECTED");
  connection = doSend('{"action":"authenticate","protocol":"701","password":"'+ctrlPassword+'"}');
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

  //console.log("Recieved: "+evt.data+"\n");

  switch( actionflag ) {
    case 'auth':
      //Request existing clocks
      //console.log("auth succeeded, requesting clocks\n");
      doSend('{"action":"clockRequest"}');
      break;

      case 'clockreq':
        // Try to change "countdown to time" target time
        //console.log("Clocks requested, updating clock at index 0\n")
        doSend(JSON.stringify({
          "action":"clockUpdate",
          "clockIndex":timerIndex,
          "clockName":clockName,
          "clockType":1,
          "clockIsPM":pmCheck,
          "clockTime":"09:00:00",
          "clockDuration":"09:00:00",
          "clockElapsedTime":targetTime,
          "clockTimePeriodFormat":pmCheck
        }));

    case 'clockUpdate':
      //Start clock at index 0
      //console.log("Clock updated, restarting timer\n")
      doSend('{"action":"clockReset","clockIndex":'+timerIndex+'}');
      actionflag = "clockStop"
      break;

      case 'clockStop':
        //Start clock at index 0
        //console.log("Clock updated, restarting timer\n")
        doSend('{"action":"clockStart","clockIndex":'+timerIndex+'}');
        actionflag = ""
        break;

    default:
      //console.log(evt.data);
      websocket.close();
  }
}


  function onClose(evt)
  {
    websocket.close();
    //console.log("Variable connection = "+connection);
  }

  function doSend(message)
  {
    //console.log("sending message "+message+"\n");
    websocket.send(message);
  }

  setTimeout((function() {  
    return process.exit(1);
  }), 1000);

  init();

  