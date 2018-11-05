var renderer = null, 
scene = null, 
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
group = null,
maps = null,
orbitControls = null;

var robot_mixer = {};
var deadAnimator;
var morphs = [];

var duration = 20000; // ms
var currentTime = Date.now();

var keypressed = false;
var move = null;

var animation = "idle";

var moveObjects = [], movementColliders = [], staticColliders = [];

var coinCollider = null;

var mainCharBox;

function createMap() {
    material = new THREE.MeshPhongMaterial({ color: 0x2354a3 });
    geometry = new THREE.SphereGeometry(1);

    // And put the geometry and material together into a mesh
    let enemy = new THREE.Mesh(geometry, material);
    enemy.position.x = 8;

    moveObjects.push(enemy);


    maps.add(enemy);

    // Moneda
    material = new THREE.MeshPhongMaterial({ color: 0xfafa02 });
    geometry = new THREE.SphereGeometry(1);

    // Create coin
    let coin = new THREE.Mesh(geometry, material);
    coin.position.z = -8;

    coinCollider = new THREE.Box3().setFromObject(coin);
    staticColliders.push(coinCollider);

    maps.add(coin);

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
    mainCharBox = new THREE.Box3().setFromCenterAndSize(mainChar.position, new THREE.Vector3( 1.5, 1.5, 1.5 ));

    // Static colliders
     for (var collider of staticColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            console.log('Collides coin');
            mainChar.position.x = 0;
            mainChar.position.y = 0;
            mainChar.position.z = 0;
        }
    }

    // Colliders with movement
    for (var collider of movementColliders) {
        if (mainCharBox.intersectsBox(collider)) {
            console.log('Collides car');
            mainChar.position.x = 0;
            mainChar.position.y = 0;
            mainChar.position.z = 0;
        }
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
    if (!keypressed) {
        //console.log(event.keyCode);
        switch(event.keyCode)
        {
            case 38:
                mainChar.position.z -= 2;
                move = 'up';
                break;

            case 37:
                mainChar.position.x -= 2;
                move = 'left';
                break;

            case 39:
                mainChar.position.x += 2;
                move = 'right';
                break;

            case 40:
                mainChar.position.z += 2;
                move = 'up';
                break;
        }

        //console.log(mainChar);
        keypressed = true;
    }
}

function onKeyUp(event)
{
    keypressed = false;
}


function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        updateMovementColliders();

        // Collider detection
        doesItCrash();

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
var mapUrl = "../images/checker_large.gif";

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

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -2;
    
    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    var material = new THREE.MeshPhongMaterial({ color: 0xc92100 });
    geometry = new THREE.CubeGeometry(2, 2, 2);

    // And put the geometry and material together into a mesh
    mainChar = new THREE.Mesh(geometry, material);

    //mainCharBoxHelper =new THREE.BoxHelper(mainChar, 0x00ff00);
    root.add(mainChar);

    maps = new THREE.Object3D;
    root.add(maps);

    createMap();
    
    // Now add the group to our scene
    scene.add( root );
}