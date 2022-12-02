import * as THREE from '../libs/three.module.js';
import { OrbitControls } from '../libs/OrbitControls.js';
import { OBJLoader } from '../libs/OBJLoader.js';
import { ColladaLoader } from '../libs/ColladaLoader.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';
import { FontLoader } from '../libs/FontLoader.js';
import { TextGeometry } from '../libs/TextGeometry.js';
import { FBXLoader } from '../libs/FBXLoader.js';
import { Lensflare, LensflareElement } from '../libs/Lensflare.js';
import { GUI } from '../libs/dat.gui.module.js';
import Stats from '../libs/stats.module.js';
import { VRButton } from '../libs/VRButton.js';

var renderer, scene, camera, cameraControl
var spotLight, pointLight, ambientLight, hemiLight
var mesh
const mixers = [];
const clock = new THREE.Clock();
const group = new THREE.Group();
const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
const posSound = new THREE.PositionalAudio ( listener );
const loadingManager = new THREE.LoadingManager();
const stats = Stats();
stats.showPanel( 0 ); // 0 = fps, 1 = ms, 2 = mb, 3 = custom
container.appendChild(stats.dom);

var uniforms = {
  time: {
    value: 1.0
  }
}

// Physics variables
	const gravityConstant = - 9.8;
	let physicsWorld;
	const rigidBodies = [];
	const margin = 0.05;
	let hinge;
	let cloth;
	let transformAux1;

	let armMovement = 0;
  Ammo().then( function ( AmmoLib ) {
    Ammo = AmmoLib;
    init();
		animate();
  });


function init() {
  createRenderer();
  createCameraAndScene();
  createLights();
  createSun();
  createQuad();
  createGrass();
  createStatue();
  createBoxWithShader();
  createTrees();
  createGround();
  createBenches();
  createModels();
  createText();
  createVideoScreen();
  createPositionSound();
  createUtils();
  //ammo.js initializers
  initPhysics();
  createObjects();
  animate();
}


// rendering function-----------------------------------------------------------
function createRenderer(){
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.0);
  renderer.shadowMap.enabled = true;
  renderer.physicallyCorrectLights = true;
  renderer.xr.enabled = true;
  document.body.appendChild( VRButton.createButton( renderer ));
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  console.log( renderer.info );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


//function to set camera and Scene----------------------------------------------
function createCameraAndScene(){
  console.log("Camera loading...");
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.x = 200;
  camera.position.y = 50;
  camera.position.z = 200;
  camera.rotation.x = -5.0;
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#b3ecff');
  camera.lookAt(scene.position);
  camera.add(listener);
  cameraControl = new OrbitControls(camera, renderer.domElement);
  cameraControl.minDistance = 25.0;
  cameraControl.maxDistance = 600.0;
  cameraControl.maxPolarAngle = Math.PI / 2;
  cameraControl.update();
  scene.add(camera);
  console.log( "Camera is set" );
}


//function to create lights-----------------------------------------------------
function createLights(){
  console.log("Setting the lights...");
  //SpotLight
  spotLight = new THREE.SpotLight( 0xffa95c, 6 );
  spotLight.position.set( 50, 50, 70 );
  spotLight.castShadow = true;
  scene.add( spotLight );
  //pointLight
  pointLight = new THREE.PointLight( 0xffbf00, 1.5, 5000);
  pointLight.position.set( 30, 40, -40 );
  const textureLoader = new THREE.TextureLoader();
  const textureFlare0 = textureLoader.load( "../assets/lensflare0.png" );
  const textureFlare1 = textureLoader.load( "../assets/lensflare2.png" );
  const textureFlare2 = textureLoader.load( "../assets/lensflare3.png" );
  const lensflare = new Lensflare();

  lensflare.addElement( new LensflareElement( textureFlare0, 300, 0 ));
  lensflare.addElement( new LensflareElement( textureFlare1, 300, 0 ));
  lensflare.addElement( new LensflareElement( textureFlare2, 40, 0.6 ));

  pointLight.add( lensflare );
  scene.add( pointLight );
  //ambientLight
  ambientLight = new THREE.AmbientLight(0xffffe6, 1);
  scene.add(ambientLight);
  //HemisphereLight
  hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 3);
  scene.add(hemiLight);
  console.log("Lights are set successfully");
}


//function to create sun and add lensflare texture for glow---------------------
function createSun(){
  console.log("Creating sphere for sun...");
  var material = new THREE.MeshPhongMaterial({ color: 0xffbf00});
  var geometry = new THREE.SphereGeometry(1, 32, 16);
  var sun = new THREE.Mesh(geometry, material);
  sun.position.set(30, 40, -40);
  scene.add(sun);
  console.log("Sun is set for the scene");
}


//function to load quad---------------------------------------------------------
function createQuad(){
  console.log("Loading the building...");
  var loader = new ColladaLoader(loadingManager);
  loader.load('../assets/UCC_Quad_Model_DAE/UCC_Quad_Model_DAE/quad.dae', function (object) {
  object.scene.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(object.scene)
});
console.log("UCC Quad Loaded");
}


//function to create grass------------------------------------------------------
function createGrass(){
  console.log("Setting the grass...");
  var loader = new ColladaLoader(loadingManager);
  loader.load('../assets/grass.dae', function (grass) {
  grass.scene.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.scale.z = 3;
      child.position.x = 7;
      child.position.y = 5;
      child.rotation.z = 0.48;
    }
  })
  scene.add(grass.scene);
});
console.log("Quad Grass Loaded");
}


//function to create pillar-----------------------------------------------------
function createStatue(){
  console.log("Building the pillar for statue...");
  var loader = new GLTFLoader(loadingManager);
  loader.load('../assets/Column.glb', function (pillar) {
  pillar.scene.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
  pillar.scene.scale.set(2, 2.3, 2);
  pillar.scene.position.x = 7;
  pillar.scene.position.y = 0;
  pillar.scene.position.z = -5;
  pillar.scene.rotation.y = 8.35;
  scene.add(pillar.scene);
});
console.log("Statue pillar is set");
}
//statue for pillar with shaders
function createBoxWithShader() {
  console.log("Creating cube for statue...");
  const shaderMat = new THREE.ShaderMaterial({ uniforms,
    vertexShader: document.getElementById('vs1').textContent,
    fragmentShader: document.getElementById('fs1').textContent
  });
  const geometry = new THREE.SphereGeometry(1.3, 1.3, 1.3);
  mesh = new THREE.Mesh(geometry, shaderMat);
  mesh.position.set(7, 10.8, -5);
  scene.add(mesh);

  const shaderMat2 = new THREE.ShaderMaterial({ uniforms,
    vertexShader: document.getElementById('vs2').textContent,
    fragmentShader: document.getElementById('fs2').textContent
  });
  const geometry2 = new THREE.SphereGeometry(1.3, 1.3, 1.3);
  mesh = new THREE.Mesh(geometry2, shaderMat2);
  mesh.position.set(7, 10.8, -5);
  scene.add(mesh);

  console.log("Object with shader is loaded");
}


//function to create trees------------------------------------------------------
function createTrees(){
  console.log("Loading the trees...");
  var loader = new GLTFLoader(loadingManager);
  loader.load('../assets/tree.glb', function (tree) {
  tree.scene.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
  tree.scene.scale.set(5, 5, 5);
  tree.scene.position.x = -23;
  tree.scene.position.y = 18;
  tree.scene.position.z = -12;
  tree.scene.rotation.y = 8.35;
  scene.add(tree.scene);
});

  var loader = new GLTFLoader(loadingManager);
  loader.load('../assets/pinkTree.glb', function (tree) {
  tree.scene.traverse(function(child) {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
  tree.scene.scale.set(10, 15, 10);
  tree.scene.position.x = 63;
  tree.scene.position.y = 11;
  tree.scene.position.z = 11;
  tree.scene.rotation.y = 8;
  scene.add(tree.scene);
});
console.log("Trees are loaded");
}


//function to create base as ground---------------------------------------------
function createGround(){
  console.log("Creating a ground for the scene...");
  const textLoader = new THREE.TextureLoader(loadingManager);
  const colTexture = textLoader.load('../assets/textures02/floor_bs.png');
  const normalTexture = textLoader.load('../assets/textures02/floor_normal.png');
  const heightTexture = textLoader.load('../assets/textures02/floor_height.png');
  const roughnessTexture = textLoader.load('../assets/textures02/floor_roughness.png');

  const geometry = new THREE.BoxGeometry( 120.0, 5.0, 120.0 );
  const material = new THREE.MeshPhongMaterial( {map: colTexture} );

  material.normalMap = normalTexture;
  material.displacementMap = heightTexture;
  material.displacementScale = 0.005;
  material.roughness = 0.0;
  material.shininess = 100;
  material.needsUpdate = true;

  const cube = new THREE.Mesh( geometry, material );
  cube.rotation.y = 0.5;
  cube.position.y = -2.8;
  cube.position.x = 7;
  cube.position.z = -12;
  scene.add( cube );

  console.log("Wooden ground is set");
}


// function to create benches---------------------------------------------------
function createBenches(){
  console.log("Loading bench models...");
  var loader = new GLTFLoader(loadingManager);
  loader.load('../assets/Bench.glb', function (bench) {
    bench.scene.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
    bench.scene.scale.set(10, 10, 10);
    bench.scene.position.x = -26;
    bench.scene.position.y = 2.5;
    bench.scene.position.z = -12;
    bench.scene.rotation.y = 8.35;
    scene.add(bench.scene);
  });

  var loader = new GLTFLoader(loadingManager);
  loader.load('../assets/Bench.glb', function (bench) {
    bench.scene.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
    bench.scene.scale.set(5, 5, 5);
    bench.scene.position.x = -16;
    bench.scene.position.y = 1.5;
    bench.scene.position.z = 10;
    bench.scene.rotation.y = 9.95;
    scene.add(bench.scene);
  });
  console.log("Benches are set");
}


//function to create billboard screen-------------------------------------------
function createVideoScreen(){
  console.log("Creating a billboard screen...");
  var video = document.getElementById('video');
  video.play();
  //creating video texture
  var videoTexture = new THREE.VideoTexture(video);
  var videoMaterial = new THREE.MeshBasicMaterial ( {map: videoTexture, side: THREE.DoubleSide, toneMapped: false} );
  //create createVideoScreen
  var screen = new THREE.PlaneGeometry(17.0, 12.0, 36, 28);
  var videoScreen = new THREE.Mesh(screen, videoMaterial);
  videoScreen.castShadow = true;
  videoScreen.position.x = 17;
  videoScreen.position.y = 7;
  videoScreen.position.z = -23;
  videoScreen.rotation.y = -0.2;
  scene.add(videoScreen);
  //backscreen
  var geometry = new THREE.BoxGeometry(18.5, 13, 0.5);
  var material = new THREE.MeshBasicMaterial({color: 0x000000});
  var mesh1 = new THREE.Mesh(geometry, material);
  mesh1.position.set(17.0, 7, -23.3);
  mesh1.rotation.y = -0.2;
  scene.add(mesh1);

  console.log("Screen loaded successfully")
}


//function to load all the avatars----------------------------------------------
function createModels(){
  console.log("Loading all the models...");
  var loader = new FBXLoader(loadingManager);
  loader.load( '../assets/Walking.fbx', function (boy) {

    const mixer1 = new THREE.AnimationMixer(boy);
    var animationAction = mixer1.clipAction(boy.animations[0]);
    animationAction.play();

    boy.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
  });
  boy.scale.set(0.01, 0.01, 0.01);
  boy.position.set(-5, 0, 0);
  boy.rotation.y = 10;
  scene.add(boy);
  mixers.push(mixer1);
  });
  console.log("Boy loaded successfully")

  var loader = new FBXLoader(loadingManager);
  loader.load( '../assets/Sitting.fbx', function (girl) {

    const mixer2 = new THREE.AnimationMixer(girl);
    var animationAction = mixer2.clipAction(girl.animations[0]);
    animationAction.play();

    girl.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
  });
  girl.scale.set(0.03, 0.03, 0.03);
  girl.position.set(-16, 0, 10);
  girl.rotation.y = 15;

  scene.add(girl);
  mixers.push(mixer2);
  });
  console.log("Girl loaded successfully")

  var loader = new FBXLoader(loadingManager);
  loader.load( '../assets/Waving.fbx', function (greeting) {

    const mixer3 = new THREE.AnimationMixer(greeting);
    var animationAction = mixer3.clipAction(greeting.animations[0]);
    animationAction.play();

    greeting.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
  });
  greeting.scale.set(0.02, 0.02, 0.02);
  greeting.position.set(-6, 0, -12);
  greeting.rotation.y = 25;

  scene.add(greeting);
  mixers.push(mixer3);
  });
//------------------------------------------------------------------------------
  var loader = new FBXLoader(loadingManager);
  loader.load( '../assets/Arguing.fbx', function (girl2) {

    const mixer4 = new THREE.AnimationMixer(girl2);
    var animationAction = mixer4.clipAction(girl2.animations[0]);
    animationAction.play();

    girl2.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
  });
  girl2.scale.set(0.02, 0.02, 0.02);
  girl2.position.set(35, 0, 18);
  girl2.rotation.y = 25;

  scene.add(girl2);
  mixers.push(mixer4);
  });
//------------------------------------------------------------------------------
  var loader = new FBXLoader(loadingManager);
  loader.load( '../assets/Talking.fbx', function (talking) {

    const mixer5 = new THREE.AnimationMixer(talking);
    var animationAction = mixer5.clipAction(talking.animations[0]);
    animationAction.play();

    talking.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
  });
  talking.scale.set(0.02, 0.02, 0.02);
  talking.position.set(34, 0, 19.5);
  talking.rotation.y = 34;

  scene.add(talking);
  mixers.push(mixer5);
  });
console.log("All models are loaded successfully");
}


//function creating text--------------------------------------------------------
function createText() {
  console.log("Creating a welcome text...");
    var loader = new FontLoader(loadingManager);
    loader.load('../assets/font.json', function (font) {
        var geometry = new TextGeometry('Welcome to UCC', {
            font: font,
            size: 4,
            height: 1,
            curveSegments: 24
        });
        var material = new THREE.ShaderMaterial({ uniforms,
          vertexShader: document.getElementById('vs3').textContent,
          fragmentShader: document.getElementById('fs3').textContent
        });
        var text = new THREE.Mesh(geometry, material);
        text.rotation.y = 0.50;
        text.position.set(-5, 0, 55);
        text.castShadow = true
        scene.add(text);
    });
    console.log("Text Created");
}


//sound and video settings------------------------------------------------------
function createPositionSound(){
  console.log("Creating Harry Potter positional sound for the scene...");
   const audioLoader2 = new THREE.AudioLoader();
   audioLoader2.load ('../assets/hpTheme.mp3', function (buffer) {
     posSound.setBuffer( buffer);
     posSound.setLoop(true);
     posSound.setRefDistance( 50 );
   });
  scene.add(posSound);
  console.log("Sound is set");
}


//settings panel at the side
function createUtils(){
  //audio-----------------------------------------------------------------------
  var gui = new GUI();
  var playSound = {
    Play:function() {
      if (!posSound.isPlaying){
        posSound.play();
      }
    }
  }
  var stopSound = {
    Stop:function() {
      if (posSound.isPlaying){
        posSound.stop();
      }
    }
  }

  var soundFolder = gui.addFolder("Audio");
  soundFolder.add(playSound,'Play');
  soundFolder.add(stopSound,'Stop');
  soundFolder.close();
  //video-----------------------------------------------------------------------
  var playVideo = {
    Play: function() {
      document.getElementById('video').play();
    }
  }
  var stopVideo = {
    Pause: function() {
      document.getElementById('video').pause();
    }
  }
  var videoFolder = gui.addFolder("UCC Video");
  videoFolder.add(playVideo, 'Play');
  videoFolder.add(stopVideo, 'Pause');
  videoFolder.close();

//flag--------------------------------------------------------------------------
var clockRotation = {
  Clockwise: function() {
    armMovement = -1
  }
}
var antiClock = {
  AntiClockwise: function() {
    armMovement = 1
  }
}
var stopRotation = {
  Halt: function() {
    armMovement = 0
  }
}
var flagFolder = gui.addFolder("Flag");
flagFolder.add(clockRotation, 'Clockwise');
flagFolder.add(antiClock, 'AntiClockwise');
flagFolder.add(stopRotation, 'Halt');
}
// bonus item-------------------------------------------------------------------
//incorporate an example of physics library
//ammo.js to create flag of ireland
function initPhysics() {
	// Physics configuration
	const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
	const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
	const broadphase = new Ammo.btDbvtBroadphase();
	const solver = new Ammo.btSequentialImpulseConstraintSolver();
	const softBodySolver = new Ammo.btDefaultSoftBodySolver();
	physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver );
	physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
	physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
	transformAux1 = new Ammo.btTransform();
}

function createObjects() {
  const pos = new THREE.Vector3();
	const quat = new THREE.Quaternion();
  // The cloth
	// Cloth graphic object
	const clothWidth = 8;
	const clothHeight = 5;
	const clothNumSegmentsZ = clothWidth * 5;
	const clothNumSegmentsY = clothHeight * 5;
	const clothPos = new THREE.Vector3 (55, 13, 25);  //( - 3, 3, 2 );

	const clothGeometry = new THREE.PlaneGeometry( clothWidth, clothHeight, clothNumSegmentsZ, clothNumSegmentsY );
	clothGeometry.rotateY( Math.PI * 0.5 );
	clothGeometry.translate( clothPos.x, clothPos.y + clothHeight * 0.5, clothPos.z - clothWidth * 0.5 );

	const clothMaterial = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, side: THREE.DoubleSide } );
	cloth = new THREE.Mesh( clothGeometry, clothMaterial );
	cloth.castShadow = true;
	cloth.receiveShadow = true;
	scene.add( cloth );
  const textureLoader = new THREE.TextureLoader(loadingManager);
	textureLoader.load( '../assets/flag.png', function ( texture ) {

	//texture.wrapS = THREE.RepeatWrapping;
	//texture.wrapT = THREE.RepeatWrapping;
	//texture.repeat.set( clothNumSegmentsZ, clothNumSegmentsY );
	cloth.material.map = texture;
	cloth.material.needsUpdate = true;
});

// Cloth physic object
	const softBodyHelpers = new Ammo.btSoftBodyHelpers();
	const clothCorner00 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z );
	const clothCorner01 = new Ammo.btVector3( clothPos.x, clothPos.y + clothHeight, clothPos.z - clothWidth );
	const clothCorner10 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z );
	const clothCorner11 = new Ammo.btVector3( clothPos.x, clothPos.y, clothPos.z - clothWidth );
	const clothSoftBody = softBodyHelpers.CreatePatch( physicsWorld.getWorldInfo(), clothCorner00, clothCorner01, clothCorner10, clothCorner11, clothNumSegmentsZ + 1, clothNumSegmentsY + 1, 0, true );
	const sbConfig = clothSoftBody.get_m_cfg();
	sbConfig.set_viterations( 10 );
	sbConfig.set_piterations( 10 );

	clothSoftBody.setTotalMass( 0.9, false );
	Ammo.castObject( clothSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin * 3 );
	physicsWorld.addSoftBody( clothSoftBody, 1, - 1 );
	cloth.userData.physicsBody = clothSoftBody;
	// Disable deactivation
	clothSoftBody.setActivationState( 4 );

	// The base
	const armMass = 2;
	const armLength = 3 + clothWidth;
	const pylonHeight = clothPos.y + clothHeight;
	const baseMaterial = new THREE.MeshPhongMaterial( { color: 0x606060 } );
	pos.set( clothPos.x, 0.1, clothPos.z - armLength );
	quat.set( 0, 0, 0, 1 );
	const base = createParalellepiped( 1, 0.2, 1, 0, pos, quat, baseMaterial );
	base.castShadow = true;
	base.receiveShadow = true;
	pos.set( clothPos.x, 0.5 * pylonHeight, clothPos.z - armLength );
	const pylon = createParalellepiped( 0.4, pylonHeight, 0.4, 0, pos, quat, baseMaterial );
	pylon.castShadow = true;
	pylon.receiveShadow = true;
	pos.set( clothPos.x, pylonHeight + 0.2, clothPos.z - 0.5 * armLength );
	const arm = createParalellepiped( 0.4, 0.4, armLength + 0.4, armMass, pos, quat, baseMaterial );
	arm.castShadow = true;
	arm.receiveShadow = true;

	// Glue the cloth to the arm
	const influence = 0.5;
	clothSoftBody.appendAnchor( 0, arm.userData.physicsBody, false, influence );
	clothSoftBody.appendAnchor( clothNumSegmentsZ, arm.userData.physicsBody, false, influence );

	// Hinge constraint to move the arm
	const pivotA = new Ammo.btVector3( 0, pylonHeight * 0.5, 0 );
	const pivotB = new Ammo.btVector3( 0, - 0.2, - armLength * 0.5 );
	const axis = new Ammo.btVector3( 0, 1, 0 );
	hinge = new Ammo.btHingeConstraint( pylon.userData.physicsBody, arm.userData.physicsBody, pivotA, pivotB, axis, axis, true );
	physicsWorld.addConstraint( hinge, true );

}

function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
	const threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
	const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
	shape.setMargin( margin );
	createRigidBody( threeObject, shape, mass, pos, quat );
	return threeObject;
}

function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {
	threeObject.position.copy( pos );
	threeObject.quaternion.copy( quat );
	const transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
	transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
	const motionState = new Ammo.btDefaultMotionState( transform );
	const localInertia = new Ammo.btVector3( 0, 0, 0 );
	physicsShape.calculateLocalInertia( mass, localInertia );
	const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
	const body = new Ammo.btRigidBody( rbInfo );
	threeObject.userData.physicsBody = body;
	scene.add( threeObject );

	if ( mass > 0 ) {

		rigidBodies.push( threeObject );

		// Disable deactivation
		body.setActivationState( 4 );
  }

	physicsWorld.addRigidBody( body );
}

//finally animate function------------------------------------------------------
function animate() {
  renderer.setAnimationLoop(animate);
  const deltaTime = clock.getDelta();
  for (const mixer of mixers) mixer.update(deltaTime);
  updatePhysics( deltaTime );
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
  stats.update();
}

function updatePhysics( deltaTime ) {

	// Hinge control
	hinge.enableAngularMotor( true, 0.8 * armMovement, 50 );
	// Step world
	physicsWorld.stepSimulation( deltaTime, 10 );

	// Update cloth
	const softBody = cloth.userData.physicsBody;
	const clothPositions = cloth.geometry.attributes.position.array;
	const numVerts = clothPositions.length / 3;
	const nodes = softBody.get_m_nodes();
	let indexFloat = 0;

	for ( let i = 0; i < numVerts; i ++ ) {

		const node = nodes.at( i );
		const nodePos = node.get_m_x();
		clothPositions[ indexFloat ++ ] = nodePos.x();
		clothPositions[ indexFloat ++ ] = nodePos.y();
		clothPositions[ indexFloat ++ ] = nodePos.z();

	}

	cloth.geometry.computeVertexNormals();
	cloth.geometry.attributes.position.needsUpdate = true;
	cloth.geometry.attributes.normal.needsUpdate = true;

	// Update rigid bodies
	for ( let i = 0, il = rigidBodies.length; i < il; i ++ ) {

		const objThree = rigidBodies[ i ];
		const objPhys = objThree.userData.physicsBody;
		const ms = objPhys.getMotionState();
		if ( ms ) {

		ms.getWorldTransform( transformAux1 );
		const p = transformAux1.getOrigin();
		const q = transformAux1.getRotation();
		objThree.position.set( p.x(), p.y(), p.z() );
		objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
  }
}
}
