
  const WebSocket = require('ws');

//Editable Variables:

//Propresenter Control Port and Password
ctrlPort = 20562;
ctrlPassword = "control";

//Service Times: change these for different service times
//put them in 24 hour format
service1 = "09:00:00";
service2 = "10:45:00";

//Timer Name/index
//indicate which "number" timer you're changing. 
//Find the number then subtract 1 (IE the first timer is 0, the 7th timer is 6)
timerIndex = 0;

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
          "clockName":"SvcCount",
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
      doSend('{"action":"clockReset","clockIndex":"0"}');
      actionflag = "clockStop"
      break;

      case 'clockStop':
        //Start clock at index 0
        //console.log("Clock updated, restarting timer\n")
        doSend('{"action":"clockStart","clockIndex":"0"}');
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

  