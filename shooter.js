/**
|*********************************************; 
*  Project        : Shooter 
*  Program name   : Server  
*  Author         : www.otrisovano.ru
*  Date           : 15.11.2018 
*  Purpose        : check brain   
|*********************************************/


/*********************************************;
 *  CREATE APPLICATION
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
	arrPlayers:[],
	arrBullets:[]
};

/** create test Bots */
function createNewBot(){
	
	let ob = {
		id: Math.floor(Math.random()*10000),
		lifes: 10,
		targetPosX: Math.random()*70,
		targetPosZ: Math.random()*70,
		speedX: Math.random()*2.7,
		speedZ: Math.random()*2.7,			
	};
	gameObj.arrBots.push(ob);
}

for ( let i = 0; i<6; i++ ){
	createNewBot();
}	


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
				gameObj.arrPlayers[l].timerLife = 50;
				gameObj.arrPlayers[l].oldPosX = gameObj.arrPlayers[l].posX;					
			}			
		}				
	}

	/** create new Bot */ 
	if (gameObj.arrBots.length < 20){
		if (Math.random()*20<1 ){
			createNewBot();
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
	
	/** Send game data to all clients ============================= */	
	io.sockets.emit('message', gameObj );
	
	/** Reset arr Bullets */
	gameObj.arrBullets = [];
	
	/** Reset Players Restart flags */
	for (let i=0; i<gameObj.arrPlayers.length; i++  ){
		if ( gameObj.arrPlayers[i].restartAfterDie == true ){
			gameObj.arrPlayers[i].restartAfterDie = false;			
		}
	}
	
	timerUpdate = setTimeout( updateGameData, 500);	
}	



/*********************************************;
 *  GET CLIENT DATA AND UPDATE gameObj
 *********************************************/

/** Get client data */ 
io.on('connection',function(socket){
	socket.on('clientData', function(data){
		
		/** PLAYERS */
		
		let isPlayer = false;

		/** insert in gameObj player coords */ 	
		for ( let n = 0; n< gameObj.arrPlayers.length; n++ ){
			
			if (gameObj.arrPlayers[n].id == data.hero.id){
						
				isPlayer = true;	
						
				gameObj.arrPlayers[n].posX = data.hero.posX;
				gameObj.arrPlayers[n].posZ = data.hero.posZ;	
				gameObj.arrPlayers[n].rotation = data.hero.rotation;

				if ( data.hero.restart == true ){
					gameObj.arrPlayers[n].died = false;	
					gameObj.arrPlayers[n].lifes = 5;
					gameObj.arrPlayers[n].restartAfterDie = true;		
					console.log("player regen ID: " + gameObj.arrPlayers[n].id );	
				}					
			}			
		}
		
		/** Insert new client in gameObject */ 	
		if (isPlayer == false){
			let player = {
			
				id: data.hero.id,
				lifes: 5,
				died: false,
				restartAfterDie: false,
				posX: data.hero.posX,
				posZ: data.hero.posZ,
				rotation: data.hero.rotation,
				
				infoKills: 0,
				infoKillsBots: 0,				
				infoDies: 0,
				
				timerLife: 50,
				oldPosX: data.posX		
			}
			gameObj.arrPlayers.push(player);
		}

		/** BULLETS */

		/** insert in gameObj player coords */
		if (data.arrNewBullets){
			for ( let n = 0; n<data.arrNewBullets.length; n++ ){
				if (data.arrNewBullets[n]){
						
					let bullet = {
						id: data.arrNewBullets[n].id,
						authorId: data.arrNewBullets[n].authorId, 
						posX: data.arrNewBullets[n].posX,
						posZ: data.arrNewBullets[n].posZ,
						spdX: data.arrNewBullets[n].spdX,
						spdZ: data.arrNewBullets[n].spdZ					
					}
					gameObj.arrBullets.push(bullet);
				}										
			}			
		}

		/** check Bots gets bullet */
		for ( let b=0; b<data.arrBotsGetsBullet.length; b++ ){
			for ( let i=0; i<gameObj.arrBots.length; i++ ){
				if (gameObj.arrBots[i]){					
					if (data.arrBotsGetsBullet[b].id == gameObj.arrBots[i].id){
						gameObj.arrBots[i].lifes--;
						if (gameObj.arrBots[i].lifes == 0){		
							let md = gameObj.arrBots[i];
							gameObj.arrBots.splice(i, 1);
							md = null;
							i--;	

							for ( let n=0; n<gameObj.arrPlayers.length; n++ ){
								if ( data.arrBotsGetsBullet[b].authorId == gameObj.arrPlayers[n].id ){
									gameObj.arrPlayers[n].infoKillsBots ++;								
								}
							}								
						}				
					}
				}
			}		
		}

		/** check Players gets bullets */
		for ( let b=0; b<data.arrPlayersGetsBullet.length; b++ ){
			for ( let i=0; i<gameObj.arrPlayers.length; i++ ){
				if ( data.arrPlayersGetsBullet[b].id == gameObj.arrPlayers[i].id){
					gameObj.arrPlayers[i].lifes --;
					if ( gameObj.arrPlayers[i].lifes == 0 ){
						
						gameObj.arrPlayers[i].died = true;
						gameObj.arrPlayers[i].infoDies ++;
						console.log("player died id: " + gameObj.arrPlayers[i].id);
						
						for ( let n=0; n<gameObj.arrPlayers.length; n++ ){
							if ( data.arrPlayersGetsBullet[b].authorId == gameObj.arrPlayers[n].id ){
								gameObj.arrPlayers[n].infoKills ++;								
							}
						}
					}
				}					
			}
		}		
	});
});  
 
