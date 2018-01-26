/**
|*********************************************; 
*  Project        : Shooter 
*  Program name   : Server  
*  Author         : www.otrisovano.ru
*  Date           : 15.11.2018 
*  Purpose        : check brain   
|*********************************************/


/*********************************************;
 *  CREATE APPLICATION.
 *********************************************/
 
/** init server */
var express = require("express");
var app = express();
var http = require('http').Server(app);
console.log('server');
var io = require('socket.io')(http);
app.use(express.static('www'));
var server = app.listen(3010);
io.listen(server);

/** create game object */
var gameObj = {
	arrBots:[],
	arrPlayers:[]
};

/** create test Bots */
var botId = 1000;

function initArrBots(){
	for (let i = 0; i < 5; i++ ){
		botId++;		
		let ob = {
			id: botId,
			targetPosX: Math.random()*70+70,
			targetPosZ: Math.random()*70+70,
			speedX: Math.random()*2.7,
			speedZ: Math.random()*2.7,			
		};
		gameObj.arrBots.push(ob);
	}
}

initArrBots();


/*********************************************;
 *  UPDATE AND SEND gameObj TO ALL CLIENTS
 *********************************************/
 
var timerUpdate = setTimeout( updateGameData, 200);

function updateGameData(){
	
	/** Check Clients movies. If not move then delete */ 
	for ( let l = 0; l< gameObj.arrPlayers.length; l++ ){ 
	
		gameObj.arrPlayers[l].timerLife --;
		if ( gameObj.arrPlayers[l].timerLife < 0 ){
			if ( gameObj.arrPlayers[l].posX == gameObj.arrPlayers[l].oldPosX ){
				let md = gameObj.arrPlayers[l];
				gameObj.arrPlayers.splice( l, 1 );
				md = null;	
				l--;
			}else{
				gameObj.arrPlayers[l].timerLife = 15;
				gameObj.arrPlayers[l].oldPosX = gameObj.arrPlayers[l].posX;					
			}			
		}				
	}

	/** Check Bots position. If pos out of area then invert speed */ 
	for (let i=0; i< gameObj.arrBots.length; i++ ){
		if ( Math.abs(gameObj.arrBots[i].targetPosX - 70 ) >  100 ){
			gameObj.arrBots[i].speedX = gameObj.arrBots[i].speedX *(-1);		
		}		
		gameObj.arrBots[i].targetPosX =  gameObj.arrBots[i].targetPosX + gameObj.arrBots[i].speedX;		
		if ( Math.abs(gameObj.arrBots[i].targetPosZ -70 ) > 100 ){
			gameObj.arrBots[i].speedZ = gameObj.arrBots[i].speedZ *(-1);		
		}
		gameObj.arrBots[i].targetPosZ =  gameObj.arrBots[i].targetPosZ + gameObj.arrBots[i].speedZ;		
	}
	
	/** Send game data to all clients. */	
	io.sockets.emit('message', gameObj );
	
	timerUpdate = setTimeout( updateGameData, 500);	
}	



/*********************************************;
 *  GET CLIENT DATA AND UPDATE gameObj
 *********************************************/

/** Get client data */ 
io.on('connection',function(socket){
	socket.on('clientData', function(data){
	  
		let isPlayer = false;
		
		/** insert in gameObj player coords */ 	
		for ( let n = 0; n< gameObj.arrPlayers.length; n++ ){		
			if (gameObj.arrPlayers[n].id == data.id){
				isPlayer = true;	
			
				gameObj.arrPlayers[n].posX = data.posX;
				gameObj.arrPlayers[n].posZ = data.posZ;	
				gameObj.arrPlayers[n].rotation = data.rotation;	
			}			
		}
	
		/** Insert new client in gameObject */ 	
		if (isPlayer == false){
			let player = {
			
				id: data.id,
				posX: data.posX,
				posZ: data.posZ,
				rotation: data.rotation,
			
				timerLife: 15,
				oldPosX: data.posX,			
			}
			gameObj.arrPlayers.push(player);
		}	
	});
});  
 
