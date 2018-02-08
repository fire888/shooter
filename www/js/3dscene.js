/**
 **********************************************; 
 *  Project        : Shooter 
 *  Program name   : Threejs scene 
 *  Author         : www.otrisovano.ru
 *  Date           : 15.11.2018 
 *  Purpose        : check brain   
 **********************************************/  

"use strict";	


/*********************************************;
 *  CONSTRUCTOR 3D SCENE
 *********************************************/		 

var Sc = function(){
	

	/** INIT VARS ****************************/
	
	/** DEBUGGER */ 
	var debugMess = "_";
	
	/** GAME VARS   */
	
	/** this.hero = {}; */ 
	this.arrBots = [];
	this.arrPlayers = [];
	this.arrBullets = [];
	this.arrExplosives = [];
	this.arrObjToRemove = []; 
	
	/** SCENE VARS */
	this.scene;	
	this.camera;
	this.player;	
	var renderer, clock;
	var INV_MAX_FPS = 0.01, frameDelta = 0;
	this.fps = INV_MAX_FPS; 
	this.myCanvas = document.getElementById('canvas');
		
	var colorEnv = 0x98b8b6;	
	this.flagAnim = false;
		
	this.aim;
	this.botGeom;
	
	/** RENDERER */		
	renderer = new THREE.WebGLRenderer({
		canvas: this.myCanvas, 
		antialias: true
	});	
	renderer.setClearColor(colorEnv);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	/** CAMERA */
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.y = 10;

	clock = new THREE.Clock();
	this.player = new THREE.FirstPersonControls(this.camera);
	this.player.movementSpeed = 30;
	this.player.lookSpeed = 0.1;		

	/** SCENE */	
	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.FogExp2(colorEnv,0.01);	

	/** LIGHTS */
	var light = new THREE.AmbientLight(colorEnv, 0.5 );
	light.position.set(5, 5, 5);
	this.scene.add(light);
	
	var pointLight = new THREE.PointLight( 0xc6b963, 1, 200 );
	pointLight.position.set(0, 10, 0);
	
	
	
	/** LOAD MESHES ****************************/	
	
	/** LEVEL MESH */	
	var floorMaterial = new THREE.MeshPhongMaterial( {color: "#d4faf8", specular: "#948100",/* emissive: "#948100",*/ shininess: 0} );
	floorMaterial.map = THREE.ImageUtils.loadTexture("assets/map_level_diff.png");	
	floorMaterial.map.wrapS = floorMaterial.map.wrapT = THREE.RepeatWrapping;
	floorMaterial.map.repeat.set(5, 5); 
	
	var loader = new THREE.OBJLoader( );
	loader.load( 'assets/level.obj', function ( object ) {
		object.traverse( function ( child ) {
				child.material = floorMaterial;
		} );
		object.rotation.y = -Math.PI/2;		
		object.position.set(0, 0, 0); 
		scene3d.scene.add( object );
		
		let level = object.clone(); 
		level.position.set(140,0,0);
		level.rotation.y = -Math.PI;						  
		scene3d.scene.add(level);

		level = object.clone(); 
		level.position.set(0,0,140);
		level.rotation.y = 0;						  
		scene3d.scene.add(level);

		level = object.clone(); 
		level.position.set(140,0,140);
		level.rotation.y = Math.PI/2;						  
		scene3d.scene.add(level);
		
		gamePage.loadedLevel = true;			
	});		
	
				   
	/** PLAYER MESH */
	this.createObjectHero();
	
	this.hero.meshRifle = false;
	let enemyDiff = new THREE.ImageUtils.loadTexture( 'assets/map_enemy_diff.png');	
	let rifleMaterial = new THREE.MeshPhongMaterial( {color: "#d4faf8", specular: "#948100",/* emissive: "#948100",*/ shininess: 30} );
	rifleMaterial.map = enemyDiff;
	var loaderRifle = new THREE.OBJLoader( );
	loader.load( 'assets/rifle.obj', function ( object ) {
		object.traverse( function ( child ) {
				child.material = rifleMaterial;
		} );		
		scene3d.hero.meshRifle = object;	
		scene3d.scene.add(scene3d.hero.meshRifle); 
		scene3d.hero.meshRifle.position.y = 10;
		scene3d.hero.restart(0);
		
		gamePage.loadedRifle = true;	
		
	});
		
	var aimGeo = new THREE.CylinderGeometry( 0.01, 0.01, 0.01, 3);
	var aimMat = new THREE.MeshBasicMaterial(
					{ color: "#ff0000" } );
	this.hero.aim = new THREE.Mesh( aimGeo, aimMat );
	this.scene.add( this.hero.aim );
	this.hero.aim.add( pointLight );	



	/** BOTS MESH */	
	var start = Date.now();			
	var timer = 0;	
	var botDiff = new THREE.ImageUtils.loadTexture( 'assets/map_bot_diff.png');
	botDiff.wrapS = botDiff.wrapT = THREE.RepeatWrapping; 
	var noiseTexture = new THREE.ImageUtils.loadTexture( 'assets/map_bot_disp.png' ); 
	var bumpTexture = noiseTexture;
	bumpTexture.wrapS = bumpTexture.wrapT = THREE.RepeatWrapping; 	
	var bumpSpeed   = 0.4;
	var bumpScale   = 3.0;
	this.scene.botMatUniforms = {
		baseTexture: 	{ type: "t", value: botDiff },
		bumpTexture:	{ type: "t", value: bumpTexture },
		bumpSpeed: 		{ type: "f", value: bumpSpeed },
		bumpScale: 		{ type: "f", value: bumpScale },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};	
	
	var botMaterial = new THREE.ShaderMaterial({
		uniforms: this.scene.botMatUniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});	
	
	var loaderBot = new THREE.OBJLoader();
	loaderBot.load('assets/bot.obj', function(mesh){
		mesh.traverse( function ( child ){
				child.material = botMaterial;                   						 
		});	
		Bot.mesh = mesh.clone();
		
		gamePage.loadedBot = true;			
	});	
	
	
	/** ENEMY MESH */
	this.enemyGeom;
	var loader = new THREE.JSONLoader();
	loader.load('assets/enemy.json', handle_load);	
	function handle_load(geometry, materials) {
		var material = materials[ 0 ];
		En.MATERIAL = material;	
		En.MESH = geometry; 
		
		gamePage.loadedEnemy = true;				
	}	
	
	
	/** ANIMATION SETUP ****************************/
	
	/** animation loop */		
	this.startAnimationScene = function(){  
		requestAnimationFrame(function animate() {
			if (scene3d.player){	

				/** update BOTs shader */
				scene3d.scene.botMatUniforms.time.value += 0.01;
				
				scene3d.draw( );		
				renderer.render(scene3d.scene, scene3d.camera);
				
				if (scene3d.hero.died == false ){
					
					frameDelta += clock.getDelta();
					while (frameDelta >= INV_MAX_FPS){				
						scene3d.player.update(INV_MAX_FPS);						
						frameDelta -= INV_MAX_FPS;
					}
				}else{					
					scene3d.hero.dieAnim();
				}					
				
				if ( scene3d.flagAnim == true ){
					requestAnimationFrame( animate );
				}	
			}				
		});
	}	
}


/*********************************************;
 *  UPDATE GEOMETRY SCENE PER FRAME
 *********************************************/	
var count = 0; 
 
Sc.prototype.draw = function(){
	
	/** update HERO */
	this.hero.update( clientData.hero );

	/** update BOTS */	
	for ( let ib = 0; ib < this.arrBots.length; ib ++ ){
		this.arrBots[ib].update();
		if ( this.arrBots[ib].mustDie == true ){
			let md = this.arrBots[ib];
			this.arrBots.splice(ib, 1);
			ib--;
			md.remove();
			md = null;			
		}	
	}
	/** update died BOTs */
	for ( let i=0; i<this.arrObjToRemove.length; i++ ){
		this.arrObjToRemove[i].update();
		if (this.arrObjToRemove[i].mustDie == true){
			let md = this.arrObjToRemove[i];
			this.arrObjToRemove.splice(i, 1);
			i--;
			md.remove();
			md = null;
		}	
	}
	
	/** update ENEMIES */		
	for ( let ip = 0; ip < this.arrPlayers.length; ip ++ ){
		this.arrPlayers[ip].updateFrame();		
	}	

	/** update BULLETS */	
	for ( let i=0; i<this.arrBullets.length; i++ ){ 
		this.arrBullets[i].update();	
		if (this.arrBullets[i].mustDie == true){
			let md = this.arrBullets[i];
			this.arrBullets.splice(i, 1);
			i--;
			md.remove();
			md = null;
		}
	};

	/** update EXPLOSIVES */	
	for ( let i = 0; i< this.arrExplosives.length; i++ ){
		this.arrExplosives[i].update();
		if (this.arrExplosives[i].mustDie == true){
			let md = this.arrExplosives[i];
			this.arrExplosives.splice(i, 1);
			i--;
			md.remove();
			md = null;
		}		
	}
}	


/*********************************************;
 *  UPDATE SCENE DATA FROM SERVER NEW DATA.
 *********************************************/	

Sc.prototype.putServerData = function(serverObjects){
	
	
	/** UPDATE ENEMIES ================== */

	let serverPlayers = serverObjects.arrPlayers;	
	let arr = [];
	
	/** remove obgjects from arrServer and arrGame ifs in scene */ 
	for ( let isv=0; isv<serverPlayers.length; isv++ ){
		
		/** check hero died */
		if ( serverPlayers[isv].id == clientData.hero.id  ){
			if ( serverPlayers[isv].died == true ){
				scene3d.hero.died = true; 
			}
			if ( serverPlayers[isv].died == false && scene3d.hero.died == true ){
				scene3d.hero.restart(); 
			}					
		}
				
		for ( let ig=0; ig<this.arrPlayers.length; ig ++){
			if ( isv > -1 ){
								
				/** update another players */
				if ( serverPlayers[isv].id == this.arrPlayers[ig].id && serverPlayers[isv].id != clientData.hero.id  ){
					
					
					/** delete current mesh create new mesh if restart */
					if ( serverPlayers[isv].restartAfterDie == true  ){	
							let en = new En();
							en.id = serverPlayers[isv].id;				
							en.mesh.position.x = 70;
							en.mesh.position.y = 0;
							en.mesh.position.z = 70;
							en.rotation = serverPlayers[isv].rotation; 							
							
						    this.arrPlayers[ig].remove();
							let md = this.arrPlayers[ig];
						    this.arrPlayers[ig] = en;	
							this.arrPlayers[ig].insertNewPosition( 0, 0 );	
							md = null;								
					}				
					
					this.arrPlayers[ig].updateDataFromServer(serverPlayers[isv]);	
	
					arr.push( this.arrPlayers[ig] );
				
					this.arrPlayers.splice(ig, 1);
					ig --;				
					serverPlayers.splice(isv, 1);
					isv --;
				}					
			}
		}
	}

	/** if in game have objects, but on server is not, 
		delete it from game */ 	
	for ( let imd = 0; imd< this.arrPlayers.length; imd++){
		let md = this.arrPlayers[imd];  
		this.arrPlayers[imd].remove();
		this.arrPlayers.splice(imd, 1);
		imd--;
		md = null;			
	}
	
	/** add to game all game objects  */ 	
	this.arrPlayers = arr;
	arr = null;
	
	/** if have new players in serverArr, but in game not it,
		create new meshes */ 	
	if ( serverPlayers.length > 0 ){
		for ( let icr = 0; icr < serverPlayers.length; icr ++){
			if ( serverPlayers[icr].id != clientData.hero.id ){
				let en = new En();
				en.id = serverPlayers[icr].id;				
				en.mesh.position.x = serverPlayers[icr].posX;
				en.mesh.position.y = 0;
				en.mesh.position.z = serverPlayers[icr].posZ;
				en.rotation = serverPlayers[icr].rotation; 
				this.arrPlayers.push(en);				
			}	
		}
	}
	
	
	/** BOTS UPDATE ============== */
	
	let serverArrBots = serverObjects.arrBots; 		
	
	let arrB = [];
	/** update bot if bot has in scene and in server */	
	for (let b=0; b<serverArrBots.length; b++ ){
		for (let i=0; i<this.arrBots.length;  i++ ){
			if ( b > -1 && i > -1 ){
				if ( this.arrBots[i].id == serverArrBots[b].id ){
					
					this.arrBots[i].updateDataFromServer( serverArrBots[b] );
					arrB.push(this.arrBots[i])
					
					serverArrBots.splice(b, 1)
					b--;
				
					this.arrBots.splice(i, 1);
					i--;
				}			
			}
		}
	}
	
	/** remove bot if not in serve but has in scene */
	if (this.arrBots.length > 0){
		for (let mdi=0; mdi<this.arrBots.length; mdi++){
			this.arrBots[mdi].prepearToDie = true;
			this.arrObjToRemove.push(this.arrBots[mdi]);
			this.arrBots.splice( mdi, 1 );
		}
	}	

	/** create bot if bot not in scene, but has in server */
	if (serverArrBots.length > 0){
		for (let newi=0; newi<serverArrBots.length; newi++ ){
			let bot = new Bot( serverArrBots[newi] ); 
			arrB.push( bot );			
		}
	}
	
	this.arrBots = arrB;
	
	
	/** CREATE SERVER BULLETS =========================== */
	
	let serverBullets = serverObjects.arrBullets;
	
	if ( serverBullets.length > 0 ){
		for ( let i=0; i<serverBullets.length; i++ ){
			if ( serverBullets[i].authorId != clientData.hero.id ){
				scene3d.createNewServerBullet( serverBullets[i] );
			}	
		}			
	}	
}

	
/*********************************************;
 *  OBJECT HERO  
 *********************************************/	
 
 Sc.prototype.createObjectHero = function(){
	 
	this.hero = {
		id: clientData.hero.id,
		died: false,	
		timerRifleAnim: 0,
		flagRifleAnim : "none",
		meshRifle: null,	
		aim: null,
		controls: null,
		timerLie: 100,  
		
		update: function( h ){
			
			/** aim position */ 
			scene3d.hero.aim.position.x = scene3d.player.target.x;
			scene3d.hero.aim.position.z = scene3d.player.target.z;
			scene3d.hero.aim.position.y = 10;				
			
			/** rifle position */
			scene3d.hero.meshRifle.position.x = scene3d.camera.position.x;
			scene3d.hero.meshRifle.position.z = scene3d.camera.position.z;				
			scene3d.hero.meshRifle.lookAt( scene3d.hero.aim.position );			
					
			/** put Player position and rotation in ClientData */	
			if ( clientData.hero.restart != true){
				clientData.hero.posX = scene3d.player.target.x;
				clientData.hero.posZ = scene3d.player.target.z; 
				clientData.hero.rotation = scene3d.hero.meshRifle.rotation;
			}	
	
			/** check player collision */		
			scene3d.player.isForwardCanMove = scene3d.checkCollision({ 
				x: scene3d.player.target.x, 
				z: scene3d.player.target.z
			});			
			
			/** animation rifle fire */
			if( scene3d.hero.flagRifleAnim == "top"){ 
				scene3d.hero.meshRifle.position.y += 0.05; 
				if (scene3d.hero.meshRifle.position.y > 10.2){
					scene3d.hero.flagRifleAnim = "bottom"; 
				}
			}
			if ( scene3d.hero.flagRifleAnim == "bottom" ){
				if (scene3d.hero.meshRifle.position.y > 10 ){
					scene3d.hero.meshRifle.position.y -= 0.05;						
				}
				if (scene3d.hero.meshRifle.position.y == 10){
					scene3d.hero.flagRifleAnim = "none"; 					
				}

			}
		},
		
		startRifleFire: function(){
			scene3d.hero.flagRifleAnim = "top";
		},

		dieAnim: function(){
			scene3d.hero.timerLie --;
			if (scene3d.hero.timerLie == 95){
				addRestartButt();
			}				
			if (scene3d.camera.position.y > 4){
				scene3d.scene.remove( scene3d.hero.meshRifle );
				scene3d.camera.rotation.x += 0.01;
				scene3d.camera.rotation.y += 0.01;	
				scene3d.camera.position.y -=0.1;
			}	
		},
		
		restart: function(){
			scene3d.scene.add( scene3d.hero.meshRifle );
			
			scene3d.hero.died = false;
			scene3d.hero.timerLie = 100;	

			let rand = Math.floor(Math.random()*4);
												
			if (rand == 0){
				clientData.hero.posX = Math.random()*50-25;
				clientData.hero.posZ = Math.random()*50-25;							
			}
			if (rand == 1){
				clientData.hero.posX = Math.random()*50-25 + 140;
				clientData.hero.posZ = Math.random()*50-25;								
			}
			if (rand == 2){
				clientData.hero.posX = Math.random()*50-25 + 140;
				clientData.hero.posZ = Math.random()*50-25 + 140;								
			}	
			if (rand == 3){
				clientData.hero.posX = Math.random()*50-25;
				clientData.hero.posZ = Math.random()*50-25 + 140;								
			}	
			
			
			scene3d.camera.position.x = clientData.hero.posX;
			scene3d.camera.position.y = 10;				
			scene3d.camera.position.z = clientData.hero.posZ;			
			
			scene3d.camera.rotation.x = 0;	
			scene3d.camera.rotation.y = 0;	

			/** put Player position and rotation in ClientData */	
			clientData.hero.posX = scene3d.player.target.x;
			clientData.hero.posZ = scene3d.player.target.z; 
			clientData.hero.rotation = scene3d.hero.meshRifle.rotation;			
			
		}
	}
};

 
/*********************************************;
 *  CONSTRUCTOR ENEMY
 *********************************************/	
 
 var En = function(){
	 
	/** vars */
	this.id = false;
	this.spdX = 0;
	this.spdZ = 0;
	this.tgtX = 0;
	this.tgtZ = 0;
	this.rotation = 0;
	
	this.kvadrantX = 0;
	this.kvadrantZ = 0;	
	this.kvadrantBulletX = 0;
	this.kvadrantBulletZ = 0;		
		
	this.geom = En.MESH;
	this.mat = En.MATERIAL;
	this.mat.morphTargets = true; 	
	this.mesh = new THREE.Mesh(this.geom, this.mat);
	this.mesh.position.set( 70, 0, 70);
	
	scene3d.scene.add(this.mesh);	
		
	/** Mixer vars */
	var phaseOld = "run";
	this.phase = "run";	
	var animTimer = 30;
	
	this.prevTime = Date.now();		
	this.mixer = new THREE.AnimationMixer(this.mesh);
	
	let stay = [];
	stay.push(this.geom.morphTargets[0])  
	stay.push(this.geom.morphTargets[0]); 
	var clipStay = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', stay, 0.5); 	
	
	let go = [];
	for ( let aa=1; aa<21; aa++ ){
		go.push(this.geom.morphTargets[aa]); 
	}
	var clipGo = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', go, 0.5);
	
	let ill = [];
	for (let aa=22; aa<29; aa++  ){
		ill.push(this.geom.morphTargets[aa]); 
	}
	for (let aa=29; aa>22; aa--  ){
		ill.push(this.geom.morphTargets[aa]); 
	}	
	var clipIll = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', ill, 0.5);
		
	let death = [];
	for ( let aa = 23; aa < 38; aa++){
		death.push(this.geom.morphTargets[aa]); 		
	}
	var clipDeath = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', death, 0.5);
	
	
	/** update this data from server data ====================== */	
	this.updateDataFromServer = function(serverData){ 
		
		/** start die phase */
		if (serverData.died == true && this.phase != "dieAnim"){
			this.phase = "dieAnim";
		}	
			
		/** update this from server */
		if (this.phase != "dieAnim"){
			this.spdX = scene3d.calckSpeed( this.mesh.position.x, serverData.posX );
			this.spdZ = scene3d.calckSpeed( this.mesh.position.z, serverData.posZ );
			this.tgtX = serverData.posX;
			this.tgtZ = serverData.posZ;	
			this.rotation = serverData.rotation;
		}	
	}
	
	
	/** update this per frame ================================= */	
	this.updateFrame = function(){
		
		/** update animation */
		if (this.mixer){
			let time = Date.now();
			
			if (this.phase == "run" ){
				this.mixer.update((time - this.prevTime) * 0.001);
			}
			if (this.phase == "ill" ){
				this.mixer.update((time - this.prevTime) * 0.001);
				animTimer --;
				if ( animTimer == 0){
					animTimer = 30;
					this.phase = "none";
					this.mixer.clipAction(clipIll).setDuration(0.5).stop();	
				}				
			}			
			if (this.phase == "dieAnim"){
				if (animTimer > 0){
					animTimer --;					
					this.mixer.update((time - this.prevTime) * 0.001);					
				}
			}
	
			this.prevTime = time;
		}
		
		/** update statuses animation */	
		if (this.phase != "ill" && this.phase != "dieAnim"){	
			if ( Math.abs(this.spdX) > 0.02 || Math.abs(this.spdZ) > 0.02 ){
				this.phase = "run";
			}
			if ( Math.abs(this.spdX) == 0 && Math.abs(this.spdZ) == 0 ){		
				this.phase = "stay";
			}
		}
		
		/** start animation if phase changed */
		if( this.phase != this.oldPhase ){
			this.oldPhase = this.phase;	
			
			if (this.phase == "run"){				
				this.mixer.clipAction(clipGo).setDuration(1.5).play();				
			}
			if (this.phase == "stay"){
				this.mixer.clipAction(clipGo).setDuration(0.5).stop();		
			}
			if (this.phase == "ill"){
				this.mixer.clipAction(clipIll).setDuration(0.5).play();
			}		
			if (this.phase == "dieAnim"){
				animTimer = 28;			
				this.mixer.clipAction(clipDeath).setDuration(0.5).play();				
			}			
		}			
   		
		/** update rotation */	
		if (this.phase != "dieAnim"){	
			this.mesh.rotation.copy( this.rotation );	
		}
		
		/** update position */
		this.kvadrantBulletX = scene3d.calckKvadrant( this.mesh.position.x );
		this.kvadrantBulletZ = scene3d.calckKvadrant( this.mesh.position.z );		
		
		if ( Math.abs( this.mesh.position.x - this.tgtX ) < 2 ){
			this.spdX = 0;	
		}else{
			this.mesh.position.x += this.spdX;			
		}
		
		if ( Math.abs( this.mesh.position.z - this.tgtZ ) < 2 ){
			this.spdZ = 0;	
		}else{
			this.mesh.position.z += this.spdZ;			
		
		}
	}
	
	/** get bullet */
	this.getBullet = function( autorBulletId ){
		clientData.arrPlayersGetsBullet.push(
			{ 
				id: this.id,
				authorId: autorBulletId 	
			}
		);
		this.phase = "ill";		
	}

	/** remove this OBJECT from scene */
	this.remove = function(){
		scene3d.scene.remove(this.mesh);
		this.mesh = null;
		this.id = null;
		this.spdX = null;
		this.spdZ = null;
		this.tgtX = null;
		this.tgtZ = null;
		this.rotation = null;			
	}

	this.insertNewPosition = function( x, z ){
		console.log("ins new pos");
		this.spdX = 0;
		this.spdZ = 0;
		this.tgtX = 70;
		this.tgtZ = 70;		
		this.mesh.position.x = 70;
		this.mesh.position.z = 70;
	}		
 };

/** enemy MESH main vars */  
En.MESH = false; 
En.MATERIAL = false;


/*********************************************;
 *  CONSTRUCTOR BOT
 *********************************************/	

 var Bot = function( servBot ){
	 
	this.mustDie = false;
	this.prepearToDie = false;
	var animIllcount = 10;
	var isIll = false;	
	
	this.id = servBot.id;  
	this.mesh = Bot.mesh.clone();
	this.targetX = servBot.targetPosX;
	this.targetZ = servBot.targetPosZ;
	this.speedX = servBot.speedX;
	this.speedZ = servBot.speedZ;

	this.kvadrantBulletX = 0;
	this.kvadrantBulletZ = 0;	
	
	this.mesh.position.x = servBot.targetPosX;
	this.mesh.position.y = 0;
	this.mesh.position.z = servBot.targetPosZ; 	
			
	scene3d.scene.add(this.mesh);

	/** update this.data from server.data */ 
	this.updateDataFromServer = function( dataBot ){
		
		this.targetX = dataBot.targetPosX;
		this.targetZ = dataBot.targetPosZ;
		this.speedX = scene3d.calckSpeed( this.mesh.position.x, this.targetX );
		this.speedZ = scene3d.calckSpeed( this.mesh.position.z, this.targetZ );	
	}
	
	/** update per frame */
	this.update = function(){
		
		this.kvadrantBulletX = scene3d.calckKvadrant( this.mesh.position.x );
		this.kvadrantBulletZ = scene3d.calckKvadrant( this.mesh.position.z );
 		
		if ( isIll == false || this.prepearToDie == false ){
			this.mesh.position.x += this.speedX;	
			this.mesh.position.z += this.speedZ;
		}	

		if (isIll == true && this.prepearToDie == false ){
			let scl = this.mesh.scale.x - 0.03;  
			this.mesh.scale.set( scl, 1, scl );
			animIllcount --;
			if ( animIllcount == 0 ){				
					this.mesh.scale.set( 1, 1, 1 );	
					isIll = false;
					animIllcount = 10;										
			}
		}
		
		if ( this.prepearToDie == true ){
			this.speedX = 0;
			this.speedZ = 0;
			let scl = this.mesh.scale.x + 0.01;		
			this.mesh.scale.set( scl, 1, scl );
			this.mesh.position.y -= 0.1;
			if ( this.mesh.position.y < -15 ){
				this.mustDie = true;
			}				
		}		
	}
	
	/** get Bullet */
	this.getBullet = function( autorBulletId ){
		isIll = true;
		clientData.arrBotsGetsBullet.push(
			{ 
				id:this.id,
				authorId: autorBulletId 
			}
		)
	}
	
	/** remove this OBJECT */
	this.remove = function(){
			
		this.prepearToDie = null;	
		this.mustDie = null;
		var animIllcount = null;
		var isIll = null;	
	
		this.id = null;  
		scene3d.scene.remove(this.mesh);
		this.mesh = null
		this.targetX = null;
		this.targetZ = null;
		this.speedX = null;
		this.speedZ = null;

		this.kvadrantBulletX = null;
		this.kvadrantBulletZ = null;			
	}
}

/** Mesh variable */
Bot.mesh = false; 


/*********************************************;
 *  CONSTRUCTOR BULLET
 *********************************************/

Sc.prototype.createNewServerBullet = function( servBullet ){
	let objBullet = {
		id: servBullet.id,
		authorId: servBullet.authorId,	
		posX: servBullet.posX,
		posZ: servBullet.posZ,
		spdX: servBullet.spdX,
		spdZ: servBullet.spdZ				
	}
	let b = new Bullet(	objBullet );
	objBullet = null;	
	scene3d.arrBullets.push(b);	
}
	
Sc.prototype.createNewBullet = function(){

	let objBullet = {
		id: Math.floor(Math.random()*10000),
		authorId: clientData.hero.id,	
		posX:scene3d.camera.position.x,
		posZ:scene3d.camera.position.z,
		spdX:(scene3d.hero.aim.position.x - scene3d.camera.position.x)/3,
		spdZ:(scene3d.hero.aim.position.z - scene3d.camera.position.z)/3				
	}
	clientData.arrNewBullets.push( objBullet );				
	let b = new Bullet(	objBullet );
	objBullet = null;
	scene3d.arrBullets.push(b);
	scene3d.hero.startRifleFire();
}			
 
var Bullet = function(v){
		
	this.kvadrantBulletX = 0;
	this.kvadrantBulletZ = 0;
	
	this.id = v.id;
	this.authorId = v.authorId;
	
	var timeLife = 1000;
	this.mustDie = false; 
	
	this.mesh = new THREE.Mesh( Bullet.geom, Bullet.material );
	this.mesh.position.set(v.posX, 8, v.posZ);
	var spdX = v.spdX;
	var spdZ = v.spdZ;
	scene3d.scene.add( this.mesh );
	
	this.update = function(){
		
		timeLife --;
		timeLife < 0 ? this.mustDie = true : this.mustDie ;
		
		if ( scene3d.checkCollision({
				x : this.mesh.position.x,
				z : this.mesh.position.z	
			}) ){
			this.mesh.position.x += spdX;
			this.mesh.position.z += spdZ;
		}else{
			scene3d.initExplosive( this.mesh.position.x, this.mesh.position.z );			
			this.mustDie = true;
		}	

		this.checkKillBotAndEnemy();	
	}
	
	
	this.checkKillBotAndEnemy = function(){
					
		this.kvadrantBulletX = scene3d.calckKvadrant( this.mesh.position.x );
		this.kvadrantBulletZ = scene3d.calckKvadrant( this.mesh.position.z );
		
		for ( let i=0; i<scene3d.arrBots.length; i++ ){
			if ( Bullet.checkObjectCollision( this, scene3d.arrBots[i] ) ){
				scene3d.initExplosive( this.mesh.position.x, this.mesh.position.z );
					scene3d.arrBots[i].getBullet( this.authorId );		
				this.mustDie = true;	
			}
		}
		
		for ( let i=0; i<scene3d.arrPlayers.length; i++ ){
			if ( Bullet.checkObjectCollision( this, scene3d.arrPlayers[i] ) ){
				scene3d.initExplosive( this.mesh.position.x, this.mesh.position.z );
				if (this.authorId == clientData.hero.id){
					if (scene3d.arrPlayers[i].phase != "dieAnim"){
						scene3d.arrPlayers[i].getBullet( this.authorId );
					}	
				}			
				this.mustDie = true;
			}			
		}			
	}
	
	
	this.remove = function(){
		this.id = null;
		timeLife = null;
		this.mustDie = null; 
		scene3d.scene.remove(this.mesh);
		this.mesh = null;
		spdX = null;
		spdZ = null;		
	}
};

/** Bullet MESH main vars and functions*/
Bullet.geom = new THREE.SphereGeometry( 0.3, 5, 5 ); 
Bullet.material = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 

Bullet.checkObjectCollision = function( bullet, object ){
	
	let collision = false;
	if ( bullet.kvadrantBulletX == object.kvadrantBulletX){
		if (bullet.kvadrantBulletZ == object.kvadrantBulletZ ){
			if (bullet.authorId != object.id){
				collision = true;
			}	
		}
	}			
	/** return true if collision with obj */
	return collision; 
}


/*********************************************;
 *  CONSTRUCTOR EXPLOSIVE
 *********************************************/	
 
Sc.prototype.initExplosive = function( x, z ){
	let expl = new Explosive( x, z );
	this.arrExplosives.push( expl ); 
}

var Explosive = function(x, z){
	
	this.mustDie = false;
	var timerLife = 50;
	
	var arrPoints = [];
	for ( let i = 2; i<Math.floor(Math.random()*30); i++ ){
		let point = {
			mesh : new THREE.Mesh( Bullet.geom, Bullet.material ), 
			spdX : Math.random()*0.5-0.25,
			spdZ : Math.random()*0.5-0.25,
			spdY : Math.random()*0.5-0.25,
		};
		point.mesh.scale.set( 0.3, 0.3, 0.3 );
		point.mesh.position.set( x, 8, z );
		scene3d.scene.add( point.mesh );		
		arrPoints.push(point);
	}
	
	this.update = function(){
		
		timerLife --;
		if (timerLife < 0){ this.mustDie = true;}
		
		for ( let i=0; i<arrPoints.length; i++ ){
			arrPoints[i].mesh.position.x += arrPoints[i].spdX; 
			arrPoints[i].mesh.position.z += arrPoints[i].spdZ; 
			arrPoints[i].mesh.position.y += arrPoints[i].spdY; 			
		}			
	}
	
	this.remove = function(){
		for (let i=0; i<arrPoints.length; i++ ){
			let md = arrPoints[i];
			arrPoints.splice(i, 1);
			i--;
			scene3d.scene.remove(md.mesh);
			md.pdX = md.spdY = md.spdZ = null;
			md = null;	
		}
		arrPoints = null;
		timerLife = null;
	}		
}	

 	
/*********************************************;
 *  OBJECT USED FUNCTIONS:
 *********************************************/	

/** check collision wish walls */
Sc.prototype.checkCollision = function( cl ){ 
		
	let collision = true;
				
	let kvadrantX = Math.floor( ( cl.x +70 )/140); 
	let kvadrantZ = Math.floor( ( cl.z +70 )/140); 

	let pointInKvadrantX = cl.x - kvadrantX*140;  
	let pointInKvadrantZ = cl.z - kvadrantZ*140; 
							
	if ( Math.sqrt( (pointInKvadrantX*pointInKvadrantX) + ( pointInKvadrantZ*pointInKvadrantZ))  > 56 ){
		collision = false; 		
		if ( kvadrantX == 0 && kvadrantZ == 0 ){
			if ( Math.abs(cl.x)< 5){
				collision = true; 						
			}
			if ( Math.abs(cl.z)< 5){
				collision = true; 						
			}						
		}
		if ( kvadrantX == 1 && kvadrantZ == 0 ){
			if ( cl.x > 132 && cl.x < 148 && cl.z > 50 && cl.z < 70   ){
				collision = true; 						
			}
			if ( Math.abs(cl.z)< 5){
				collision = true; 						
			}						
		}
		if ( kvadrantX == 0 && kvadrantZ == 1 ){
			if ( Math.abs(cl.x)<5){
				collision = true; 						
			}
			if ( cl.x > 52 && cl.x < 70 && cl.z > 132 && cl.z < 148  ){
				collision = true; 						
			}					
		}	
		if ( kvadrantX == 1 && kvadrantZ == 1 ){
			if ( cl.x > 70 && cl.x < 90 && cl.z > 132 && cl.z < 149   ){
				collision = true; 						
			}
			if ( cl.x > 132 && cl.x < 148 && cl.z > 70 && cl.z < 90   ){
				collision = true; 						
			}					
		}						
	}
	
	/** return true if object can move */
	return collision; 
};

/** calk speed to move object to point */
Sc.prototype.calckSpeed = function( pos, tgt ){ return (tgt-pos)* scene3d.fps; }

/** calck kvadrant for check collision with another obj */ 
Sc.prototype.calckKvadrant = function( val ){ return ( Math.floor(val/10)) }
 
 
/*********************************************;
 *  FUNCTIONS STOP/START REDRAW SCENE
 *********************************************/	

Sc.prototype.startAnim = function(){	
	if ( this.flagAnim == false ){
		this.flagAnim = true;
		this.startAnimationScene();			
	}
}	

Sc.prototype.stopAnim = function(){	
	if ( this.flagAnim == true ){
		this.flagAnim = false;		
	}			
}
 
 
/*********************************************;
 *  INTERFACE
 *********************************************/ 

/** add mouse click to fire */  
function addMouse(){ 
	if (scene3d){
		/** fire hero listener */	
		scene3d.myCanvas.onclick = function(e){
			if ( clientData.hero.bulletsLast > 0 ){
				scene3d.createNewBullet();
				clientData.hero.bulletsLast --;
			}
		}	
	}

	$("#restartButt").click(function(){
		$("#restartButt").hide();
		if(scene3d){					
			clientData.hero.restart = true;
		}			
	});	
}

/** show/hide regen button */
function addRestartButt(){
	$("#restartButt").show();
}


 
