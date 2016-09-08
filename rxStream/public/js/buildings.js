var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x33383c,.10);

var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 30);

var renderer = new THREE.WebGLRenderer({
  antialias:true
});

renderer.setClearColor( 0x222629 );
renderer.setSize(window.innerWidth, window.innerHeight);
$('.wrapper').append(renderer.domElement);

$(window).resize(onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight);
}

//Floor
var floorG = new THREE.BoxGeometry(20,.10,0);
var floorM = new THREE.MeshLambertMaterial({color: 0x222629});
var floor = new THREE.Mesh(floorG,floorM);
scene.add(floor);

//Buildings
var cube = [];
for(var i = 0; i < 800; ++i){
  var rHeight = (Math.random()*5) + .25;
  var geometry = new THREE.BoxGeometry( .25, rHeight, .25 );
  var material = new THREE.MeshLambertMaterial({color: 0x444c52});
  material.transparent = true;
  material.opacity = .5;
  cube[i] = new THREE.Mesh( geometry, material );
  floor.add( cube[i] );
  
  var x = (Math.random() * (10.00 - -10) + -10).toFixed(2);
  var y = 0;
  var z = (Math.random() * (10.00 - -10) + -10).toFixed(2);
  cube[i].position.set(x,y,z);
}

//camera
camera.position.set(0,3,10);

//lights
var light1 = new THREE.DirectionalLight(0x444c52,1);
scene.add(light1);
light1.position.set(1.5,2,1);

var light1 = new THREE.DirectionalLight(0x444c52,.5);
scene.add(light1);
light1.position.set(-1.5,2,1);


var distance = 0;
var floorRotation = 1;
var cameraPosition = 1;
var easingAmount = .001; 

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
  
  //move camera and city to mouse movement slowly
   var xDistance = floorRotation - floor.rotation.y;
   var yDistance = cameraPosition - camera.position.z;
   distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
   if (distance > 0) {
       floor.rotation.y += xDistance * easingAmount;
       camera.position.z += yDistance * easingAmount;
   }
}
render();

//mouse movement

$('.wrapper').on('mousemove.control',function(e){
      var rotateDamper = 600;
      var cameraDamper = 25;
  
      floorRotation = -((e.clientX - $('.wrapper').width()) / rotateDamper);
      //cameraPosition = ((e.clientY) / cameraDamper);
});

$(window).scroll(function(){
  camera.position.y = 3-($(this).scrollTop() / 20);
});

