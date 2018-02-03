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
 *  Create obj 3D SCENE.
 *********************************************/		 

var Sc = function(){
	
	

	/** INIT VARS ****************************/
	
	/** GAME VARS  this.hero = {};  */
	
	this.arrBots = [];
	this.arrExplosivesBot = [];
	this.arrPlayers = [];
	this.arrBullets = [];
	this.arrExplosives = [];
	
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
	this.scene.customUniforms = {
		baseTexture: 	{ type: "t", value: botDiff },
		bumpTexture:	{ type: "t", value: bumpTexture },
		bumpSpeed: 		{ type: "f", value: bumpSpeed },
		bumpScale: 		{ type: "f", value: bumpScale },
		alpha: 			{ type: "f", value: 1.0 },
		time: 			{ type: "f", value: 1.0 }
	};	
	
	var customMaterial = new THREE.ShaderMaterial({
		uniforms: this.scene.customUniforms,
		vertexShader: document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	});	
	
	Bot.mesh;
	var botGeom;
	var loaderBot = new THREE.OBJLoader();
	loaderBot.load('assets/bot.obj', function(mesh){
		mesh.traverse( function ( child ){
				child.material = customMaterial;                   						 
		});	
		Bot.mesh = mesh.clone();
		botGeom = mesh;	
		botGeom.position.set(130, 0, -45); 
		botGeom.scale.set(1, 1, 1);
		scene3d.botGeom = botGeom;	
		scene3d.scene.add(botGeom);
	});	
	
	
	/** ENEMY MESH */
	this.enemyGeom;
	var loader = new THREE.JSONLoader();
	loader.load('assets/enemy.json', handle_load);	
	function handle_load(geometry, materials) {
		var material = materials[ 0 ];
		En.MATERIAL = material;	
		En.MESH = geometry; 
		
		material.morphTargets = true;		
        scene3d.enemyGeom = new THREE.Mesh(geometry, material);		
        scene3d.enemyGeom.position.x = 140;
        scene3d.enemyGeom.position.z = -45;		
		scene3d.enemyGeom.rotation.x=3.14/2;
	    scene3d.enemyGeom.rotation.z=3.14/2;	
	    scene3d.enemyGeom.rotation.y=3.14*1.5;
			
        scene3d.scene.add(scene3d.enemyGeom);			
        scene3d.mixer = new THREE.AnimationMixer(scene3d.enemyGeom);
        var clip = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', geometry.morphTargets, 5);		
        scene3d.mixer.clipAction(clip).setDuration(3.0).play();
    }
    this.delta = 0;
    this.prevTime = Date.now();	
	
	
	/** ANIMATION SETUP ****************************/
	
	/** animation loop */		
	this.startAnimationScene = function(){  
		requestAnimationFrame(function animate() {
			if (scene3d.player){	

				scene3d.draw( );
				renderer.render(scene3d.scene, scene3d.camera);
				scene3d.scene.customUniforms.time.value += 0.01;
			
				frameDelta += clock.getDelta();
				while (frameDelta >= INV_MAX_FPS){				
					scene3d.player.update(INV_MAX_FPS);						
					frameDelta -= INV_MAX_FPS;
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

Sc.prototype.draw = function(){

	/*------------*/
	let html = "_"
	html = "<br/> Client geomArrEnemies: <br/>"; 
	if ( this.arrPlayers ){	
		for (let l=0; l< this.arrPlayers.length; l++ ){
			html += "id: " + this.arrPlayers[l].id + " phase: "+ this.arrPlayers[l].phase + " spdX " + this.arrPlayers[l].spdX +   " spdZ " + this.arrPlayers[l].spdZ +  "<br/>";
		}	
	}
	//html += "aimX : " + this.aim.position.x + "camX : " + this.camera.position.x;
	//html += "<br/>aimZ : " + this.aim.position.z + "camZ : " + this.camera.position.z;	
	$("#debugDiv").html( html );
	/*------------*/	
	
	/** update position player rifle */
	this.hero.update( );


	/** put Player position and rotation in ClientData */	
	clientData.posX = scene3d.player.target.x;
	clientData.posZ = scene3d.player.target.z; 
	clientData.rotation = scene3d.hero.meshRifle.rotation;
	
	/** check player collision */		
	scene3d.player.isForwardCanMove = this.checkCollision({ 
		x: scene3d.player.target.x, 
		z: scene3d.player.target.z
	});

	/** update Bots */	
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
	
	/** update Enemies positions */		
	for ( let ip = 0; ip < this.arrPlayers.length; ip ++ ){
		this.arrPlayers[ip].updateFrame();		
	}
	
	/** update ENEMIES animation */
    this.delta += 0.1;
    if (this.mixer) {
        var time = Date.now();
        this.mixer.update((time - this.prevTime) * 0.001);
        this.prevTime = time;
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

	/** update Explosives */	
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
	

	/** UPDATE OR CREATE BOTS ============== */
	
	let serverArrBots = serverObjects.arrBots; 		
		
	/** create bots */ 	
	if (this.arrBots.length == 0){
		for (let i = 0; i < serverArrBots.length; i++ ){
			let b = new Bot( serverArrBots[i] );
			scene3d.arrBots.push( b );			
		}	
	}
		
	/** update position bots */
	for (let i = 0; i < serverArrBots.length; i++ ){
		for ( let g = 0; g < this.arrBots.length; g++  ){				
			if ( this.arrBots[g].id == serverArrBots[i].id ){				
				this.arrBots[g].updateDataFromServer( serverArrBots[i] );
			}
		}
	}
	
	
	/** UPDATE OR CREATE ENEMIES ================== */

	let serverPlayers = serverObjects.arrPlayers;
			
	let arr = [];
	/** remove obgjects from arrServer and arrGame ifs in scene */ 
	for ( let isv=0; isv<serverPlayers.length; isv++ ){
		for ( let ig=0; ig<this.arrPlayers.length; ig ++){
			if ( isv > -1){	
				if ( serverPlayers[isv].id == this.arrPlayers[ig].id && serverPlayers[isv].id != clientData.id  ){
					
					this.arrPlayers[ig].spdX = scene3d.calckSpeed( this.arrPlayers[ig].mesh.position.x, serverPlayers[isv].posX );
					this.arrPlayers[ig].spdZ = scene3d.calckSpeed( this.arrPlayers[ig].mesh.position.z, serverPlayers[isv].posZ );
					this.arrPlayers[ig].tgtX = serverPlayers[isv].posX;
					this.arrPlayers[ig].tgtZ = serverPlayers[isv].posZ;	
					this.arrPlayers[ig].rotation = serverPlayers[isv].rotation;	
				
					arr.push( this.arrPlayers[ig] );
				
					this.arrPlayers.splice(ig, 1);
					ig --;				
					serverPlayers.splice(isv, 1);
					isv --;
				}	
			}
		}
	}

	/** if in arrGame have objects then delete it */ 	
	for ( let imd = 0; imd< this.arrPlayers.length; imd++){
		let md = this.arrPlayers[imd];  
		this.arrPlayers[imd].remove();
		this.arrPlayers.splice(imd, 1);
		imd--;
		md = null;			
	}
	
	/** add to arrGame all game objects  */ 	
	this.arrPlayers = arr;
	arr = null;
	
	/** if have new players in serverArr then create new meshes */ 	
	if ( serverPlayers.length > 0 ){
		for ( let icr = 0; icr < serverPlayers.length; icr ++){
			if ( serverPlayers[icr].id != clientData.id ){
				console.log('create');
				let en = new En();
				en.id = serverPlayers[icr].id;				
				en.mesh.position.x = serverPlayers[icr].posX;
				en.mesh.position.y = 0;
				en.mesh.position.z = serverPlayers[icr].posZ;
				en.rotation = serverPlayers[icr].rotation; 
				console.log(en.rotation);
				this.arrPlayers.push(en);				
				
			}	
		}
	}
		
	/** debugger ---------------- */
	/*let html = "_"
	html += "your id: " + clientData.id + "<br/> serverPlayers:<br/>"; 
	for (let l=0; l< serverPlayers.length; l++ ){
		html += "id: " + serverPlayers[l].id + " lifetimer: " +  serverPlayers[l].timerLife + "<br/>";
	}	
	html += "<br/> Client geomArrEnemies: <br/>"; 
	if ( this.arrPlayers ){	
		for (let l=0; l< this.arrPlayers.length; l++ ){
			html += "id: " + this.arrPlayers[l].id + " phase: "+ this.arrPlayers[l].phase + "<br/>";
		}	
	}
	$("#debugDiv").html( html );*/	
	/** ------------------------- */			
}
	

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
 *  OBJECT HERO  
 *********************************************/	
 
 Sc.prototype.createObjectHero = function(){
	 
	this.hero = {
		timerRifleAnim: 0,
		flagAnimTop : false,
		meshRifle: null,	
		aim: null,
		controls: null,
		
		update: function( cam, pl ){
			
			scene3d.hero.aim.position.x = scene3d.player.target.x;
			scene3d.hero.aim.position.z = scene3d.player.target.z;
			scene3d.hero.aim.position.y = 10;			
			
			scene3d.hero.meshRifle.lookAt( scene3d.hero.aim.position );
			scene3d.hero.meshRifle.position.x = scene3d.camera.position.x;
			scene3d.hero.meshRifle.position.z = scene3d.camera.position.z;			

			if( scene3d.hero.flagAnimTop == true)
			{ 
				scene3d.hero.meshRifle.position.y += 0.05; 
				if (scene3d.hero.meshRifle.position.y > 10.2)
				{
					scene3d.hero.flagAnimTop = false; 
				}
			}
			if ( scene3d.hero.flagAnimTop == false )
			{
				if (scene3d.hero.meshRifle.position.y > 9.98 )
				{
					scene3d.hero.meshRifle.position.y -= 0.05;						
				}

			}
		},
		
		startRifleFire: function(){
			scene3d.hero.flagAnimTop = true;
		}			
	}
};

/*********************************************;
 *  CONSTRUCTOR BOT
 *********************************************/	

 var Bot = function( servBot ){
	 
	this.mustDie = false;
	var lifes = 10;
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

	this.update = function(){
		
		this.kvadrantBulletX = scene3d.calckKvadrant( this.mesh.position.x );
		this.kvadrantBulletZ = scene3d.calckKvadrant( this.mesh.position.z );
 		
		if ( isIll == false ){
			this.mesh.position.x += this.speedX;	
			this.mesh.position.z += this.speedZ;
		}	

		if (isIll == true && lifes > 0 ){
			let scl = this.mesh.scale.x - 0.03;  
			this.mesh.scale.set( scl, 1, scl );
			animIllcount --;
			if ( animIllcount == 0 ){
				lifes --;				
				if (lifes > 0){
					this.mesh.scale.set( 1, 1, 1 );	
					isIll = false;
					animIllcount = 10;					
				}					
			}
		}
		if (isIll == true && lifes == 0 ){
			let scl = this.mesh.scale.x + 0.01;
			//let sclY = this.mesh.scale.y - 0.02; 			
			this.mesh.scale.set( scl, 1, scl );
			this.mesh.position.y -= 0.1;
			if ( this.mesh.position.y < -15 ){
				/** DIE OBJECT */
				this.mustDie = true;
			}				
		}			
	}

	this.updateDataFromServer = function( dataBot ){
		this.targetX = dataBot.targetPosX;
		this.targetZ = dataBot.targetPosZ;
		this.speedX = scene3d.calckSpeed( this.mesh.position.x, this.targetX );
		this.speedZ = scene3d.calckSpeed( this.mesh.position.z, this.targetZ );	
	}	
	
	/** Functions ill */
	this.getBullet = function(){
		isIll = true;
	}
	
	this.remove = function(){
	
		this.mustDie = null;
		var lifes = null;
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

Bot.mesh = false; 
	 
 
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
		
	this.geom = En.MESH;
	this.mat = En.MATERIAL;
	this.mat.morphTargets = true; 	
	this.mesh = new THREE.Mesh(this.geom, this.mat);
	
	scene3d.scene.add(this.mesh);	
	
	var phaseOld = "run";
	this.phase = "run";
	
	/** Mixer vars */
	this.delta = 0;
	this.prevTime = Date.now();		
	this.mixer = new THREE.AnimationMixer(this.mesh);
	
	var stay = [];
	stay.push(this.geom.morphTargets[0])  
	stay.push(this.geom.morphTargets[0]); 
	var clipStay = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', stay, 0.5); 	
	
	var go = [];
	for ( let aa=1; aa<20; aa++ ){
		go.push(this.geom.morphTargets[aa]); 
	}
	var clipGo = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', go, 0.5);
	
	var death = [];
	for ( let aa = 21; aa < 38; aa++){
		death.push(this.geom.morphTargets[aa]); 
	}
	for ( let aa = 0; aa < 38; aa++){
		death.push(this.geom.morphTargets[36]); 
	}	
	var clipDeath = THREE.AnimationClip.CreateFromMorphTargetSequence('ttt', death, 0.5);	
	
	this.mixer.clipAction(clipGo).setDuration(0.5).play();
		
	/** Update per frame */	
	this.updateFrame = function(){
		
		/** update animation */
		if (this.mixer){
			this.delta += 0.1;
			let time = Date.now();
			this.mixer.update((time - this.prevTime) * 0.001);
			this.prevTime = time;
		}
		
		if ( Math.abs(this.spdX) > 0.02 || Math.abs(this.spdZ) > 0.02 ){
			this.phase = "run";
		}
		if ( Math.abs(this.spdX) == 0 && Math.abs(this.spdZ) == 0 ){		
			this.phase = "stay";
		}
		
		if( this.phase != this.oldPhase ){
			this.oldPhase = this.phase;	
			
			if (this.phase == "run"){		
				this.mixer.clipAction(clipStay).setDuration(0.5).stop();			
				this.mixer.clipAction(clipGo).setDuration(1.5).play();				
			}
			if (this.phase == "stay"){
				this.mixer.clipAction(clipGo).setDuration(0.5).stop();
				this.mixer.clipAction(clipStay).setDuration(0.5).play();
				//this.mixer.clipAction(clipStay).setDuration(0.5).stop();				
			}
		}			
   		
		/** update rotation */		
		this.mesh.rotation.copy( this.rotation );	
		
		/** update position */
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

	/** remove geom from scene */
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
 };

/** enemy geom main vars */  
En.MESH = false; 
En.MATERIAL = false;


/*********************************************;
 *  CONSTRUCTOR CLIENT BULLET
 *********************************************/
 
var Bullet = function(v){
	
	this.kvadrantBulletX = 0;
	this.kvadrantBulletZ = 0;
	
	this.id = Bullet.id;
	Bullet.id ++;
	
	var timeLife = 100;
	this.mustDie = false; 
	
	this.mesh = new THREE.Mesh( Bullet.geom, Bullet.material );
	this.mesh.position.set(v.pX, 8, v.pZ);
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

		this.checkKillBot();	
	}
	
	this.checkKillBot = function(){
		this.kvadrantBulletX = scene3d.calckKvadrant( this.mesh.position.x );
		this.kvadrantBulletZ = scene3d.calckKvadrant( this.mesh.position.z );
		for ( let i=0; i< scene3d.arrBots.length; i++ ){
			if ( this.kvadrantBulletX == scene3d.arrBots[i].kvadrantBulletX && this.kvadrantBulletZ == scene3d.arrBots[i].kvadrantBulletZ ){
				scene3d.initExplosive( this.mesh.position.x, this.mesh.position.z );
				scene3d.arrBots[i].getBullet();	
				this.mustDie = true;
				console.log( "bullX:  " + this.kvadrantBulletX + " botX: " + scene3d.arrBots[i].kvadrantBulletX + " / bullZ: " + this.kvadrantBulletZ + " botZ: " + scene3d.arrBots[i].kvadrantBulletZ)	
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

/** Bullet geom maim vars */
Bullet.id = 0;
Bullet.geom = new THREE.SphereGeometry( 0.3, 5, 5 ); 
Bullet.material = new THREE.MeshBasicMaterial( {color: 0xffffff} ); 


/*********************************************;
 *  Constructor Explosive.
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
 *  Function Check Collision.
 *********************************************/	

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

Sc.prototype.calckSpeed = function( pos, tgt ){ return (tgt-pos)* scene3d.fps; }

Sc.prototype.calckKvadrant = function( val ){ return ( Math.floor(val/10)) }
 
/*********************************************;
 *  KEYBOARD AND MOUSE LISTENERS
 *********************************************/ 

function addMouse(){ 
	if (scene3d){
		/** fire hero listener */	
		scene3d.myCanvas.onclick = function(e){
			let b = new Bullet(	{
				pX:scene3d.camera.position.x,
				pZ:scene3d.camera.position.z,
				spdX:(scene3d.hero.aim.position.x - scene3d.camera.position.x)/3,
				spdZ:(scene3d.hero.aim.position.z - scene3d.camera.position.z)/3
			} );
			scene3d.arrBullets.push(b);	
			scene3d.hero.startRifleFire();
		}
	}	
}
 
