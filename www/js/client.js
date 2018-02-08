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
		rotation: 0,
		restart: false,
		
		bulletsLast: 100,
		infoKillsBotsOld: 0, 
	},
		
	arrNewBullets: [], 
	arrBotsGetsBullet: [],
	arrPlayersGetsBullet: []	
};

var sendDataToServer = function () {
	
	socket.emit( 'clientData', clientData );
	
	clientData.arrNewBullets = [];	
	clientData.arrBotsGetsBullet = [];
	clientData.arrPlayersGetsBullet = [];
	clientData.hero.restart = false;
	
	timerSendDataClient = setTimeout( sendDataToServer, 500);
}

var getDataFromServer = function () {
	socket.on( 'message', function (data) {		
		scene3d.putServerData(data); 
		

		
		for (let i=0; i<data.arrPlayers.length; i++){
			if (data.arrPlayers[i].id == clientData.hero.id){
				
				gamePage.addInfoGame(data.arrPlayers[i].infoKills, data.arrPlayers[i].infoDies );
						
				if (data.arrPlayers[i].infoKillsBots > clientData.hero.infoKillsBotsOld){
					clientData.hero.bulletsLast += 35;
					clientData.hero.infoKillsBotsOld = data.arrPlayers[i].infoKillsBots; 					
				}
					
			}
		}	
	});	
}


/**************************************;
 *  GAMEPAGE VARS
 **************************************/

var scene3d;

var gamePage = {
	
	loadedRifle: false,
	loadedEnemy: false,
	loadedLevel: false,
	loadedBot: false,
	loaderBarCount: 0,
	waitLoadStart: function(){ 
		setTimeout( function(){
			gamePage.loaderBarCount ++;
			if (gamePage.loaderBarCount < 12){
				$("#loadBar").append( " &#9760;" );
			}else{
				gamePage.loaderBarCount = 0;
				$("#loadBar").html("")		
			}

			if ( gamePage.loadedBot && gamePage.loadedEnemy
					&& gamePage.loadedLevel && gamePage.loadedRifle ){
				$("#loadBar").hide();
				$("#loadMess").append(" OK. Launch:");
				$("#startbutton").show();	
			}else{				
				gamePage.waitLoadStart();
			}		
		}, 150)
	},
	
	addInfoGame: function( k, d ){
		$("#infoKills").html(k);
		$("#infoDies").html(d);
		$("#infoBullets").html(clientData.hero.bulletsLast);		
	}, 
	
	addStartGameButton: function(){
		$("#loadBar").hide();
		$("#startbutton").show();
	}
}; 

gamePage.waitLoadStart();


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