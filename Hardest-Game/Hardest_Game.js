var renderer = null, 
scene = null, 
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
map = null,
orbitControls = null;

var robot_mixer = {};
var deadAnimator;
var morphs = [];

var duration = 2000; // ms
var currentTime = Date.now();

var keypressed = false;
var move = null;

var moveUp = false, moveDown = false, moveRight = false, moveLeft = false;

var animation = "idle";

var moveObjects = [], movementColliders = [], staticColliders = [], removeObject = [];

var coinCollider = null, landCollider = null, floorCollide = false;

var currentCheckpoint = null, coinCounter = 0;

var enemy;

var mainCharBox;

var whichLevel = 1;

function createMap(theLevel) {

    switch(theLevel) {
        case 1:
            // Checkpoints
            createCheckpoint(6, 16, new THREE.Vector3(0, 0, 0), false);
            createCheckpoint(6, 16, new THREE.Vector3(31, 0, 0), true);

            // Common Land
            createLand(4, 16, new THREE.Vector3( 5, 0, 0 ));
            createLand(4, 16, new THREE.Vector3( 26, 0, 0 ));
            createLand(17, 26, new THREE.Vector3(15.5, 0, 0));

            // Create Enemies
            createEnemy(new THREE.Vector3(8, 0, 0), true);
            createEnemy(new THREE.Vector3(11, 0, 0), true);
            createEnemy(new THREE.Vector3(14, 0, 0), false);
            createEnemy(new THREE.Vector3(17, 0, 0), false);
            createEnemy(new THREE.Vector3(20, 0, 0), true);
            createEnemy(new THREE.Vector3(23, 0, 0), true);

            // Create coins
            createCoin(new THREE.Vector3(15.15, 0, -8));
            createCoin(new THREE.Vector3(9.5, 0, 8));
            createCoin(new THREE.Vector3(21.5, 0, 8));
            break;

        case 2:
            // Checkpoints
            createCheckpoint(8, 6, new THREE.Vector3(0, 0, 0), false);
            createCheckpoint(8, 6, new THREE.Vector3(42, 0, 19), true);

            // Common Land
            createLand(50, 13, new THREE.Vector3(21, 0, 9.5));

            // Create coins
            createCoin(new THREE.Vector3(21, 0, 6));
            createCoin(new THREE.Vector3(21, 0, 12));

            break;
    }

    

}

function createEnemy(position, startPositive) {
    material = new THREE.MeshPhongMaterial({ color: 0x2354a3 });
    geometry = new THREE.SphereGeometry(1);
    // And put the geometry and material together into a mesh

    enemy = new THREE.Mesh(geometry, material);
    enemy.position.set(position.x, position.y, position.z);

    enemy.tag = 'enemy';

    moveObjects.push(enemy);

    objectMovement(enemy, startPositive);


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
        if (moveColliders.tag == 'wood') {
            //console.log('wood');
            cubeBBox.tag = 'wood'
            cubeBBox.theObject = movementColliders;
        }

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

                }
            }


        }
    }

    if (!floorCollide) {
        mainChar.position.set(currentCheckpoint.x, 0, currentCheckpoint.z);
        recoverObjects();
    }

    floorCollide = false;

    // Colliders with movement
    for (var collider of movementColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            console.log('Collides enemy');
            mainChar.position.set(currentCheckpoint.x, 0, currentCheckpoint.z);

            recoverObjects();
        }
    }
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

function objectMovement(obj, startPositive) {
    switch(obj.tag) {
        case 'enemy':
            if(startPositive) {
                objAnimation = new KF.KeyFrameAnimator;
                objAnimation.init({ 
                    interps:
                        [
                            { 
                                keys:[0, .5, 1], 
                                values:[
                                        { z : 12 },
                                        { z : -12 },
                                        { z : 12 },
                                        ],
                                target:obj.position
                            }
                        ],
                    loop: true,
                    duration: duration
                });
                objAnimation.start();    
            } else {
                objAnimation = new KF.KeyFrameAnimator;
                objAnimation.init({ 
                    interps:
                        [
                            { 
                                keys:[0, .5, 1], 
                                values:[
                                        { z : -12 },
                                        { z : 12 },
                                        { z : -12 },
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
        orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
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
    camera.position.set(0, 6, 30);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        
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
    
    // Now add the group to our scene
    scene.add( root );
}