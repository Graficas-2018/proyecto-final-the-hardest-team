var renderer = null, 
scene = null, 
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
map = null;
//orbitControls = null;

var robot_mixer = {};
var deadAnimator;
var morphs = [];

var duration = 2000; // ms
var currentTime = Date.now();

var keypressed = false;
var move = null;

var moveUp = false, moveDown = false, moveRight = false, moveLeft = false, jump = false, jumping = false;

var animation = "idle";

var moveObjects = [], movementColliders = [], staticColliders = [], removeObject = [];

var coinCollider = null, landCollider = null, floorCollide = false;

var currentCheckpoint = null, coinCounter = 0;

var enemy;

var mainCharBox;

var whichLevel = 3;

var jumpPosition = 0;

var blackHoleTexture = new THREE.TextureLoader().load('../images/blackHole.png');
var jumpAnimation = null;

var theCanvas = document.getElementById('webglcanvas');

function createMap(theLevel) {

    switch(theLevel) {
        case 1:
            // Checkpoints
            //camera.position.set(12, 6, 40);
            createCheckpoint(6, 16, new THREE.Vector3(0, 0, 0), false);
            createCheckpoint(6, 16, new THREE.Vector3(31, 0, 0), true);

            // Common Land
            createLand(4, 16, new THREE.Vector3( 5, 0, 0 ));
            createLand(4, 16, new THREE.Vector3( 26, 0, 0 ));
            createLand(17, 26, new THREE.Vector3(15.5, 0, 0));

            // Create Hole
            createBlackHole(3, new THREE.Vector3(7, 0, 0), false);
            createBlackHole(3, new THREE.Vector3(24, 0, 0), false);

            // Create Enemies
            createEnemy(new THREE.Vector3(8, 0, 0), 'z', 12, -12);
            createEnemy(new THREE.Vector3(11, 0, 0), 'z', 12, -12);
            createEnemy(new THREE.Vector3(14, 0, 0), 'z', -12, 12);
            createEnemy(new THREE.Vector3(17, 0, 0), 'z', -12, 12);
            createEnemy(new THREE.Vector3(20, 0, 0), 'z', 12, -12);
            createEnemy(new THREE.Vector3(23, 0, 0), 'z', 12, -12);

            // Create coins
            createCoin(new THREE.Vector3(15.15, 0, -8));
            createCoin(new THREE.Vector3(9.5, 0, 8));
            createCoin(new THREE.Vector3(21.5, 0, 8));
            break;

        case 2:
            // Checkpoints
            createCheckpoint(8, 6, new THREE.Vector3(-5, 0, 0), false);
            createCheckpoint(8, 6, new THREE.Vector3(37, 0, 19), true);

            // Common Land
            createLand(50, 13, new THREE.Vector3(16, 0, 9.5));

            // Create Blackhole
            createBlackHole(2, new THREE.Vector3(5, 0, 14), false);
            createBlackHole(2, new THREE.Vector3(5, 0, 5), false);
            createBlackHole(2, new THREE.Vector3(27, 0, 14), false);
            createBlackHole(2, new THREE.Vector3(27, 0, 5), false);

            // Create Enemies
            createEnemy(new THREE.Vector3(-5, 0, 4.5), 'x', -4, 46);
            createEnemy(new THREE.Vector3(-5, 0, 7.5), 'x', -4, 46);
            createEnemy(new THREE.Vector3(-5, 0, 10.5), 'x', 46, -4);
            createEnemy(new THREE.Vector3(-5, 0, 13.5), 'x', 46, -4);

            // Create coins
            createCoin(new THREE.Vector3(16, 0, 6));
            createCoin(new THREE.Vector3(16, 0, 12));

            break;

        case 3:
            // Checkpoints
            createCheckpoint(6, 6, new THREE.Vector3(0, 0, 0), true);

            // Common Land
            createLand(53, 6, new THREE.Vector3(29.5, 0, 0));
            createLand(4, 4, new THREE.Vector3(16, 0, -5));
            createLand(4, 4, new THREE.Vector3(26, 0, 5));
            createLand(4, 4, new THREE.Vector3(36, 0, -5));
            createLand(4, 4, new THREE.Vector3(46, 0, 5));

            // Create Blackhole
            createBlackHole(1, new THREE.Vector3(25, 0, 0), true);


            // Create Enemies
            createEnemy(new THREE.Vector3(0, 0, -1.5), 'x', 3, 25);
            createEnemy(new THREE.Vector3(0, 0, 1.5), 'x', 3, 25);
            createEnemy(new THREE.Vector3(0, 0, -1.5), 'x', 25, 50);
            createEnemy(new THREE.Vector3(0, 0, 1.5), 'x', 25, 50);

            createEnemy(new THREE.Vector3(10, 0, -1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(10, 0, 1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(17, 0, -1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(17, 0, 1.5), 'y', -5, 15);

            createEnemy(new THREE.Vector3(36, 0, -1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(36, 0, 1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(43, 0, -1.5), 'y', -5, 15);
            createEnemy(new THREE.Vector3(43, 0, 1.5), 'y', -5, 15);



            // Create coins
            createCoin(new THREE.Vector3(53, 0, 0));
    }

    

}


function createBlackHole(circLeSize, position, animatedSizing) {
    material = new THREE.MeshPhongMaterial({color:0xffffff, map:blackHoleTexture, side:THREE.DoubleSide});
    geometry = new THREE.CircleGeometry(circLeSize, 32);

    let mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;

    mesh.position.set(position.x, position.y, position.z);

    if (animatedSizing) {
        mesh.tag = 'blackHole-sizing';
        moveObjects.push(mesh);    
    }
    else {
        mesh.tag = 'blackHole';
        landCollider = new THREE.Box3().setFromObject(mesh);
        landCollider.position = mesh.position;
        landCollider.tag = 'blackHole';

        staticColliders.push(landCollider);
    }

    objectMovement(mesh);


    //mesh.position.x = 5;
    mesh.position.y = -0.98;
    
    // Add the mesh to our group
    map.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;



}

function createEnemy(position, movementAxis, startPosition, endPosition) {
    material = new THREE.MeshPhongMaterial({ color: 0x2354a3 });
    geometry = new THREE.SphereGeometry(1);
    // And put the geometry and material together into a mesh

    enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(position.x, position.y, position.z);

    enemy.tag = 'enemy';

    moveObjects.push(enemy);

    objectMovement(enemy, movementAxis, startPosition, endPosition);


    map.add(enemy);
}

function createCoin(position) {
    material = new THREE.MeshPhongMaterial({ color: 0xfafa02, side:THREE.DoubleSide });
    geometry = new THREE.CircleGeometry(1);
    let coin = new THREE.Mesh(geometry, material);

    coin.position.set(position.x, position.y, position.z)

    coin.tag = 'coin';

    coinCollider = new THREE.Box3().setFromObject(coin);

    coinCollider.tag = 'coin';
    coinCollider.took = false;
    coinCollider.object = coin;
    coinCounter++;

    staticColliders.push(coinCollider);

    objectMovement(coin);

    map.add(coin);
}

function createCheckpoint(width, height, position, final) {
    geometry = new THREE.PlaneGeometry(width, height, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:0x5fba51, side:THREE.DoubleSide}));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(position.x, position.y, position.z);
    mesh.position.y = -1;
    mesh.tag = 'checkpoint';

    landCollider = new THREE.Box3().setFromObject(mesh);
    landCollider.position = mesh.position;
    landCollider.tag = 'checkpoint';
    landCollider.isFinal = final;

    if (!final) {
        mainChar.position.set(mesh.position.x, mainChar.position.y, mesh.position.z);
        console.log('entra');
    }


    staticColliders.push(landCollider);

    currentCheckpoint = landCollider.position;

    map.add(mesh);
}

function createLand(width, height, position) {

    console.log(position);


    // Create a texture map
    var floor = new THREE.TextureLoader().load(floorUrl);
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
    // floor.repeat.set(4, 4);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(width, height, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:floor, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;

    mesh.position.set(position.x, position.y, position.z);

    landCollider = new THREE.Box3().setFromObject(mesh);
    landCollider.position = mesh.position;
    landCollider.tag = 'floor';
    staticColliders.push(landCollider);


    //mesh.position.x = 5;
    mesh.position.y = -1;
    
    // Add the mesh to our group
    map.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

}

function updateMovementColliders() {
    movementColliders = [];
    for (var moveColliders of moveObjects) {
        cubeBBox = new THREE.Box3().setFromObject(moveColliders);
        if (moveColliders.tag == 'blackHole-sizing')
            cubeBBox.tag = 'blackHole-sizing';

        movementColliders.push(cubeBBox);
    }
}

function doesItCrash() {
    mainCharBox = new THREE.Box3().setFromCenterAndSize(mainChar.position, new THREE.Vector3( 2, 2, 2 ));

    // Static colliders
     for (var collider of staticColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            floorCollide = true;

            if (collider.tag == 'coin' && !collider.took) {
                console.log('Collides coin');

                //coinCollect.play();

                collider.object.visible = false;
                collider.took = true;
                coinCounter--;
                console.log(coinCounter);
                removeObject.push(collider);
            } else {
                if (collider.tag == 'checkpoint' ) {
                    //console.log('land');
                    currentCheckpoint = collider.position;
                    removeObject = [];

                    if (collider.isFinal && coinCounter == 0) {
                        console.log('End of game');
                        whichLevel++;
                        changeLevel(whichLevel);
                    }

                } else {
                    if (collider.tag == 'blackHole') {
                        floorCollide = false;
                    }
                }
            }


        }
    }

    // Colliders with movement
    for (var collider of movementColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            if (collider.tag == 'blackHole-sizing')
                floorCollide = false;

            else {
                console.log('Collides enemy');
                mainChar.position.set(currentCheckpoint.x, 0, currentCheckpoint.z);
                recoverObjects();
            }
        }
    }

    if (!floorCollide && !jumping) {
        mainChar.position.set(currentCheckpoint.x, 0, currentCheckpoint.z);
        recoverObjects();
    }

    floorCollide = false;
}

function recoverObjects() {
    for (var collider of removeObject) {
        collider.object.visible = true;
        collider.took = false;
        coinCounter++;
    }

    removeObject = [];
}

function changeLevel(theLevel) {
   removeObject = [];
   moveObjects = [];
   staticColliders = [];
   movementColliders = [];

   for (var i = map.children.length - 1; i >= 0; i--) {
    map.remove(map.children[i])
   }

   createMap(theLevel);


}

function objectMovement(obj, axis, startPosition, endPosition) {
    switch(obj.tag) {
        case 'enemy':
            if(axis == 'z') {
                objAnimation = new KF.KeyFrameAnimator;
                objAnimation.init({ 
                    interps:
                        [
                            { 
                                keys:[0, .5, 1], 
                                values:[
                                        { z : startPosition },
                                        { z : endPosition },
                                        { z : startPosition },
                                        ],
                                target:obj.position
                            }
                        ],
                    loop: true,
                    duration: duration
                });
                objAnimation.start();    
            } 
            else if(axis == 'y') {
                objAnimation = new KF.KeyFrameAnimator;
                objAnimation.init({ 
                    interps:
                        [
                            { 
                                keys:[0, .5, 1], 
                                values:[
                                        { y : startPosition },
                                        { y : endPosition },
                                        { y : startPosition },
                                        ],
                                target:obj.position
                            }
                        ],
                    loop: true,
                    duration: duration
                });
                objAnimation.start();    
            } 
            else {
                objAnimation = new KF.KeyFrameAnimator;
                objAnimation.init({ 
                    interps:
                        [
                            { 
                                keys:[0, .5, 1], 
                                values:[
                                        { x : startPosition },
                                        { x : endPosition },
                                        { x : startPosition },
                                        ],
                                target:obj.position
                            }
                        ],
                    loop: true,
                    duration: duration
                });
                objAnimation.start();
            }

            break;

        case 'coin':
            objAnimation = new KF.KeyFrameAnimator;
            objAnimation.init({ 
                interps:
                    [
                        { 
                            keys:[0, .5, 1], 
                            values:[
                                    { y : 0 },
                                    { y : Math.PI },
                                    { y : 2 * Math.PI },
                                    ],
                            target:obj.rotation
                        }
                    ],
                loop: true,
                duration: duration
            });
            objAnimation.start();
            break;

        case 'blackHole':
            objAnimation = new KF.KeyFrameAnimator;
            objAnimation.init({ 
                interps:
                    [
                        { 
                            keys:[0, .5, 1], 
                            values:[
                                    { z : 0 },
                                    { z : Math.PI },
                                    { z : 2 * Math.PI },
                                    ],
                            target:obj.rotation
                        }
                    ],
                loop: true,
                duration: duration * 3
            });
            objAnimation.start();
            break;

        case 'blackHole-sizing':
            objAnimation = new KF.KeyFrameAnimator;
            objAnimation.init({ 
                interps:
                    [
                        { 
                            keys:[0, .5, 1], 
                            values:[
                                    { z : 0 },
                                    { z : Math.PI },
                                    { z : 2 * Math.PI },
                                    ],
                            target:obj.rotation
                        },
                        {
                            keys:[0, .5, 1],
                            values:[
                                    { x: 1, y: 1 },
                                    { x: 3, y: 3 },
                                    { x: 1, y: 1}
                                    ],
                            target:obj.scale
                        }
                    ],
                loop: true,
                duration: duration * 3
            });
            objAnimation.start();
            break;

    } 

}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( '../models/Robot/robot_idle.fbx', function ( object ) 
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;
        scene.add( robot_idle );
        
        createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( '../models/Robot/robot_atk.fbx', function ( object ) 
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( '../models/Robot/robot_run.fbx', function ( object ) 
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( '../models/Robot/robot_walk.fbx', function ( object ) 
        {
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}

function onKeyDown(event)
{
    // Move diagonal ?
    if (event.keyCode == 38)
        moveUp = true;

    if (event.keyCode == 37)
        moveLeft = true;

    if (event.keyCode == 39)
        moveRight = true;

    if (event.keyCode == 40)
        moveDown = true;

    if (event.keyCode == 32)
        jump = true;
}

function onKeyUp(event)
{
    if (event.keyCode == 38)
        moveUp = false;

    if (event.keyCode == 37)
        moveLeft = false;

    if (event.keyCode == 39)
        moveRight = false;

    if (event.keyCode == 40)
        moveDown = false;
}

function makeMove() {
    if (moveUp)
        mainChar.position.z -= 0.2;

    if (moveDown)
        mainChar.position.z += 0.2;

    if (moveLeft)
        mainChar.position.x -= 0.2;

    if (moveRight)
        mainChar.position.x += 0.2;

    makeJump();
}

function makeJump() {

    if (jump) {
        jumping = true;
        jump = false;
    }

    if (jumping) {
        jumpPosition += 4;
        mainChar.position.y = 4 * Math.sin(jumpPosition * Math.PI / 180);
        
        if (jumpPosition >= 180) {
            jumpPosition = 0;
            jumping = false;
        }
    }


}


function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Move Character
        makeMove();

        // Spin the cube for next frame
        updateMovementColliders();

        // Collider detection
        doesItCrash();

        // Update KF
        KF.update();

        // Update the camera controller
        //orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

function startGame() {
    mainChar.visible = true;
    map.visible = true;
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var floorUrl = "../images/checker_large.gif";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(15.969033608493447,62.40480884725021, 59.75158845051619);
    camera.rotation.set( -0.8178272683535693, 0.013799824779866679,  -0.0115690097);
    scene.add(camera);
    //camera.rotation.set(-0.9434117713845896,  0.005698651184301411, 0.007858741267773053);
    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);
    
    // Create the objects
    //loadFBX();

    // Load global audio
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create a global audio source
    var mainSound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( '../audio/mainTheme.mp3', function( buffer ) {
        mainSound.setBuffer( buffer );
        mainSound.setLoop( true );
        mainSound.setVolume( 0.5 );
        mainSound.play();
    });

    // Change background
    let backgroundTexture = new THREE.TextureLoader().load( "../images/outer-space.jpg" );
    backgroundTexture.wrapS = THREE.RepeatWrapping;
    backgroundTexture.wrapT = THREE.RepeatWrapping;

    scene.background = backgroundTexture;

    /*var coinCollect = new THREE.Audio( listener );
    audioLoader.load('../audio/coin_collect.wav', function(buffer) {
        coinCollect.setBuffer(buffer);
        coinCollect.setLoop(false);
        coinCollect.setVolume(0.3);
    });*/




    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    var material = new THREE.MeshPhongMaterial({ color: 0xc92100 });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    mainChar = new THREE.Mesh(geometry, material);

    //mainCharBoxHelper =new THREE.BoxHelper(mainChar, 0x00ff00);
    root.add(mainChar);

    map = new THREE.Object3D;
    root.add(map);

    createMap(whichLevel);

    mainChar.visible = false;
    map.visible = false;
    
    // Now add the group to our scene
    scene.add( root );
}