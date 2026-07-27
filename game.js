const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);


const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
);


const renderer = new THREE.WebGLRenderer({
antialias:true
});

renderer.setSize(
window.innerWidth,
window.innerHeight
);

document.body.appendChild(renderer.domElement);



// IŞIK

const light = new THREE.DirectionalLight(
0xffffff,
1
);

light.position.set(10,20,10);
scene.add(light);


scene.add(
new THREE.AmbientLight(
0xffffff,
0.5
)
);




// =================
// ZEMİN (DİNAMİK ÇİM DOKUSU)
// =================

const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#3b7d2a';
ctx.fillRect(0, 0, 128, 128);

for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#2e661f' : '#4a9c35';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
}

const floorTexture = new THREE.CanvasTexture(canvas);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(40, 40);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.9
    })
);

floor.rotation.x = -Math.PI/2;
scene.add(floor);





// DUVARLAR

function wall(x,y,z,w,h,d){

let obj = new THREE.Mesh(

new THREE.BoxGeometry(
w,h,d
),

new THREE.MeshStandardMaterial({
color:0x555555
})

);

obj.position.set(x,y,z);

scene.add(obj);

}


wall(0,2,-20,40,4,1);
wall(0,2,20,40,4,1);
wall(-20,2,0,1,4,40);
wall(20,2,0,1,4,40);





// KAMERA

camera.position.set(
0,
1.6,
5
);

scene.add(camera);





// =====================
// İLK FPS SİLAH
// =====================

const gun = new THREE.Group();


const barrel = new THREE.Mesh(

    new THREE.BoxGeometry(
        0.12,
        0.12,
        0.8
    ),

    new THREE.MeshStandardMaterial({
        color:0x111111
    })

);


barrel.position.z=-0.4;




const handle = new THREE.Mesh(

    new THREE.BoxGeometry(
        0.18,
        0.35,
        0.25
    ),

    new THREE.MeshStandardMaterial({
        color:0x333333
    })

);


handle.position.y=-0.25;



gun.add(barrel);
gun.add(handle);



gun.position.set(
    0.35,
    -0.35,
    -0.7
);



camera.add(gun);


// =================
// JOYSTICK
// =================


let moveX=0;
let moveY=0;


const joystick=document.getElementById("joystick");
const stick=document.getElementById("stick");



if(joystick){


joystick.addEventListener(
"touchmove",
(e)=>{


let t=e.touches[0];

let r=joystick.getBoundingClientRect();


let x=t.clientX-r.left-60;
let y=t.clientY-r.top-60;



let power=Math.sqrt(
x*x+y*y
);


if(power>40){

x=x/power*40;
y=y/power*40;

}



stick.style.left=
35+x+"px";


stick.style.top=
35+y+"px";


moveX=x/40;
moveY=y/40;



});



joystick.addEventListener(
"touchend",
()=>{


moveX=0;
moveY=0;


stick.style.left="35px";
stick.style.top="35px";


});


}




// =====================
// 3 PARMAK FPS KAMERA
// =====================
let yaw = 0;
let pitch = 0;

let lastX = 0;
let lastY = 0;
let lookId = null;


document.addEventListener(
"touchstart",
(e)=>{


for(let t of e.changedTouches){


if(
t.clientX > window.innerWidth / 2 &&
lookId === null
){


lookId = t.identifier;


lastX = t.clientX;
lastY = t.clientY;


}


}


});





document.addEventListener(
"touchmove",
(e)=>{


for(let t of e.changedTouches){


if(t.identifier === lookId){


let dx =
t.clientX - lastX;


let dy =
t.clientY - lastY;



yaw -= dx * 0.0025;

pitch -= dy * 0.002;



pitch = Math.max(
-0.6,
Math.min(0.6,pitch)
);



lastX = t.clientX;
lastY = t.clientY;


}


}


});





document.addEventListener(
"touchend",
(e)=>{


for(let t of e.changedTouches){


if(t.identifier === lookId){


lookId = null;


}


}


});





function cameraSmooth(){


camera.rotation.order="YXZ";


camera.rotation.y +=
(yaw-camera.rotation.y)*0.15;


camera.rotation.x +=
(pitch-camera.rotation.x)*0.15;


}

// =================
// HAREKET
// =================


function update(){


let forward=new THREE.Vector3();


camera.getWorldDirection(
forward
);


forward.y=0;
forward.normalize();



let right=new THREE.Vector3();


right.crossVectors(
camera.up,
forward
).normalize();



let speed=0.08;



camera.position.x -=
forward.x*moveY*speed;


camera.position.z -=
forward.z*moveY*speed;



camera.position.x -=
right.x*moveX*speed;


camera.position.z -=
right.z*moveX*speed;


}





// =================
// ATEŞ + MERMİ
// =================

let ammo = 30;
let maxAmmo = 30;
let reloading = false;


function updateAmmo(){

let text=document.getElementById("ammo");

if(text){

text.innerHTML =
ammo+" / "+maxAmmo;

}

}



function reload(){

if(reloading) return;


reloading=true;


setTimeout(()=>{


ammo=maxAmmo;

reloading=false;

updateAmmo();


},1500);


}




function shoot(){


if(reloading) return;



if(ammo<=0){

reload();

return;

}



ammo--;

updateAmmo();



let bullet=new THREE.Mesh(

new THREE.SphereGeometry(0.05),

new THREE.MeshBasicMaterial({
color:0xffff00
})

);



bullet.position.copy(
camera.position
);



let dir=new THREE.Vector3();


camera.getWorldDirection(dir);



scene.add(bullet);



let timer=setInterval(()=>{


bullet.position.add(

dir.clone()
.multiplyScalar(0.5)

);



},20);



setTimeout(()=>{


clearInterval(timer);

scene.remove(bullet);


},1000);



}



const fire=document.getElementById("fire");


if(fire){

fire.addEventListener(
"touchstart",
shoot
);

}



updateAmmo();


// =================
// BAŞLAT
// =================


function animate(){

requestAnimationFrame(
animate
);


update();

cameraSmooth();

renderer.render(
scene,
camera
);

}


// BAŞLAT

animate();
