/**
|*********************************************; 
*  Project        : Shooter 
*  Program name   : Threejs scene 
*  Author         : www.otrisovano.ru
*  Date           : 15.11.2018 
*  Purpose        : check brain   
|*********************************************/  

"use strict";	


/*********************************************;
 *  Create obj 3D SCENE.
 *********************************************/		 

var Sc = function(){
	
	

	/** INIT VARS ****************************/
	
	/** SCENE VARS */
	this.scene;	
	this.camera; var renderer, player, clock;
	var INV_MAX_FPS = 0.01, frameDelta = 0;
	this.fps = INV_MAX_FPS; 
	var myCanvas = document.getElementById('canvas');
	
	var colorEnv = 0x98b8b6;	
	this.flagAnim = false;
	
	this.arrBots = [];
	this.arrPlayers = [];
	
	this.aim;
	this.botGeom;
	
	/** RENDERER */		
	renderer = new THREE.WebGLRenderer({
		canvas: myCanvas, 
		antialias: true
	});	
	renderer.setClearColor(colorEnv);
	//renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	//renderer.setSize(window.screen.width, window.screen.height);	
	
	/** CAMERA */
	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000 );
	this.camera.position.y = 10;

	clock = new THREE.Clock();
	player = new THREE.FirstPersonControls(this.camera);
	player.movementSpeed = 30;
	player.lookSpeed = 0.1;		

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
	this.rifleGeom = false;
	var loaderRifle = new THREE.OBJLoader( );
	loader.load( 'assets/rifle.obj', function ( object ) {
		scene3d.rifleGeom = object;	
		scene3d.scene.add(scene3d.rifleGeom);  
	});
		
	var aimGeo = new THREE.CylinderGeometry( 0.01, 0.01, 0.01, 3);
	var aimMat = new THREE.MeshBasicMaterial(
					{ color: "#ff0000" } );
	this.aim = new THREE.Mesh( aimGeo, aimMat );
	this.scene.add( this.aim );
	this.aim.add( pointLight );	


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
	
	var botGeom;
	var loaderBot = new THREE.OBJLoader();
	loaderBot.load('assets/bot.obj', function(mesh){
		mesh.traverse( function ( child ){
				child.material = customMaterial;                   						 
		});	
		botGeom = mesh;	
		botGeom.position.set(30, 0, -30); 
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
			if (player){	

				scene3d.draw( player );
				renderer.render(scene3d.scene, scene3d.camera);
				scene3d.scene.customUniforms.time.value += 0.01;
			
				frameDelta += clock.getDelta();
				while (frameDelta >= INV_MAX_FPS){				
					player.update(INV_MAX_FPS);						
					frameDelta -= INV_MAX_FPS;
				}
				
				if ( scene3d.flagAnim == true ){
					requestAnimationFrame( animate );
				}	
			}				
		});
	}	
};


/*********************************************;
 *  UPDATE GEOMETRY SCENE PER FRAME
 *********************************************/	

Sc.prototype.draw = function( player ) {

	/*------------*/
	let html = "_"
	html = "<br/> Client geomArrEnemies: <br/>"; 
	if ( this.arrPlayers ){	
		for (let l=0; l< this.arrPlayers.length; l++ ){
			html += "id: " + this.arrPlayers[l].id + " phase: "+ this.arrPlayers[l].phase + " spdX " + this.arrPlayers[l].spdX +   " spdZ " + this.arrPlayers[l].spdZ +  "<br/>";
		}	
	}
	$("#debugDiv").html( html );
	/*------------*/	
	
	/** update position player rifle */
	this.aim.position.x = player.target.x;
	this.aim.position.z = player.target.z;
	this.aim.position.y = 10;	

	if ( scene3d.rifleGeom != false ){
		scene3d.rifleGeom.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
		scene3d.rifleGeom.lookAt( this.aim.position );	
	}
	
	/** put Player position and rotation in ClientData */	
	clientData.posX = player.target.x;
	clientData.posZ = player.target.z; 
	clientData.rotation = scene3d.rifleGeom.rotation;
	
	/** check player collision */		
	player.isForwardCanMove = this.checkCollision( player );

	/** update Bots positions */	
	for ( let ib = 0; ib < this.arrBots.length; ib ++ ){
		this.arrBots[ib].geom.position.x += this.arrBots[ib].speedX;	
		this.arrBots[ib].geom.position.z += this.arrBots[ib].speedZ;		
	}
	
	/** update Enemies positions */		
	for ( let ip = 0; ip < this.arrPlayers.length; ip ++ ){
		this.arrPlayers[ip].updateFrame();		
	}
	
	/** ENEMY update animation and position */
    this.delta += 0.1;
    if (this.mixer) {
        var time = Date.now();
        this.mixer.update((time - this.prevTime) * 0.001);
        this.prevTime = time;
    }	
	//scene3d.enemyGeom.rotation. -= 0.05;		
	//scene3d.enemyGeom.rotation.copy( scene3d.rifleGeom.rotation );
	/** update test Bot position */	
	this.botGeom.position.z += 0.03;		
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
			let meshBot = this.botGeom.clone();
			meshBot.position.x = serverArrBots[i].targetPosX;
			meshBot.position.y = 0;
			meshBot.position.z = serverArrBots[i].targetPosZ;
			let obj = {
				id: serverArrBots[i].id,  
				geom: meshBot,
				targetX: serverArrBots[i].targetPosX,
				targetZ: serverArrBots[i].targetPosZ,
				speedX: serverArrBots[i].speedX,
				speedZ: serverArrBots[i].speedZ,	
			};
			this.scene.add(obj.geom);				
			this.arrBots.push(obj);	
		}	
	}
		
	/** update position bots */
	for (let i = 0; i < serverArrBots.length; i++ ){
		for ( let g = 0; g < this.arrBots.length; g++  ){				
			if ( this.arrBots[g].id == serverArrBots[i].id ){
				this.arrBots[g].targetX = serverArrBots[i].targetPosX;
				this.arrBots[g].targetZ = serverArrBots[i].targetPosZ;
				this.arrBots[g].speedX = calckSpeed( this.arrBots[g].geom.position.x, this.arrBots[g].targetX );
				this.arrBots[g].speedZ = calckSpeed( this.arrBots[g].geom.position.z, this.arrBots[g].targetZ );	
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
					
					this.arrPlayers[ig].spdX = calckSpeed( this.arrPlayers[ig].mesh.position.x, serverPlayers[isv].posX );
					this.arrPlayers[ig].spdZ = calckSpeed( this.arrPlayers[ig].mesh.position.z, serverPlayers[isv].posZ );
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
	
	function calckSpeed( pos, tgt ){ return (tgt-pos)* scene3d.fps; }
	
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
 *  Check Player Collision.
 *********************************************/	

Sc.prototype.checkCollision = function( player ){ 
		
	let playerCollision = true;
				
	let kvadrantX = Math.floor( ( player.target.x +70 )/140); 
	let kvadrantZ = Math.floor( (player.target.z +70 )/140); 

	let pointInKvadrantX = player.target.x - kvadrantX*140;  
	let pointInKvadrantZ = player.target.z - kvadrantZ*140; 
							
	if ( Math.sqrt( (pointInKvadrantX*pointInKvadrantX) + ( pointInKvadrantZ*pointInKvadrantZ))  > 56 ){
		playerCollision = false; 		
		if ( kvadrantX == 0 && kvadrantZ == 0 ){
			if ( Math.abs(player.target.x)< 5){
				playerCollision = true; 						
			}
			if ( Math.abs(player.target.z)< 5){
				playerCollision = true; 						
			}						
		}
		if ( kvadrantX == 1 && kvadrantZ == 0 ){
			if ( player.target.x > 132 && player.target.x < 148 && player.target.z > 50 && player.target.z < 70   ){
				playerCollision = true; 						
			}
			if ( Math.abs(player.target.z)< 5){
				playerCollision = true; 						
			}						
		}
		if ( kvadrantX == 0 && kvadrantZ == 1 ){
			if ( Math.abs(player.target.x)<5){
				playerCollision = true; 						
			}
			if ( player.target.x > 52 && player.target.x < 70 && player.target.z > 132 && player.target.z < 148  ){
				playerCollision = true; 						
			}					
		}	
		if ( kvadrantX == 1 && kvadrantZ == 1 ){
			if ( player.target.x > 70 && player.target.x < 90 && player.target.z > 132 && player.target.z < 149   ){
				playerCollision = true; 						
			}
			if ( player.target.x > 132 && player.target.x < 148 && player.target.z > 70 && player.target.z < 90   ){
				playerCollision = true; 						
			}					
		}						
	}
	
	return playerCollision; 
};


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
		
	this.geom = En.MESH;
	this.mat = En.MATERIAL;
	this.mat.morphTargets = true; 	
	this.mesh = new THREE.Mesh(this.geom, this.mat);//En.MESH.clone();
	
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

/** geom main vars */  
En.MESH = false; 
En.MATERIAL = false;

