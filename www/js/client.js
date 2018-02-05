/**
|***************************************; 
*  Project        : Shooter 
*  Program name   : Client  
*  Author         : www.otrisovano.ru
*  Date           : 15.11.2018 
*  Purpose        : check brain   
|***************************************;
*/  

"use strict"; 
console.log("start main.js");


/**************************************;
 *  GAMEPAGE VARS
 **************************************/

var scene3d;
var gamePage = {}; 


/**************************************;
 *  INIT SOCKETS
 **************************************/

var socket, timerSendDataClient;
socket = io();

var clientData = {
	hero:{
		id: Math.floor(Math.random()*100000),	
		posX:0,
		posZ:0,
		rotation: 0
	},
		
	arrNewBullets:[]		
};

var sendDataToServer = function () {
	socket.emit( 'clientData', clientData );
	clientData.arrNewBullets = [];	
	timerSendDataClient = setTimeout( sendDataToServer, 500);
}

var getDataFromServer = function () {
	socket.on( 'message', function (data) {		
		scene3d.putServerData(data); 		
	});	
}


/**************************************;
 *  START GAME
 **************************************/

window.onload = function (){
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		
		/** if mobile then hide start button */ 
		let exitMobileMess = "Ccори....<br/>" + 
		"<br/>В игре присутствует управление мышью. Предлагаем " + 
		"зайти в игру с персонального компьютера или ноутбука."
		$("#startmess").html(exitMobileMess);
		
	} else {
		
		/** init game */ 
		scene3d = new Sc();
		
		/** start game */ 		
		$("#startbutton").click( function(){ 	
			sendDataToServer();
			getDataFromServer();	
			$("#startScreen").hide();
			$("#gameScreen").show();					
			scene3d.startAnim();
			addMouse();	
		});
	}	
}