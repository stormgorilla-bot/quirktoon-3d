import * as THREE from 'three';

const DURATION = 10;
const canvas = document.querySelector('#scene');
const errorBox = document.querySelector('#error');
const caption = document.querySelector('#caption');
const progress = document.querySelector('#progress');
const playButton = document.querySelector('#playPause');
const playIcon = document.querySelector('#playIcon');
const playLabel = document.querySelector('#playLabel');
const replayButton = document.querySelector('#replay');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#34295d');
scene.fog = new THREE.Fog('#34295d', 12, 24);
const camera = new THREE.PerspectiveCamera(34, 9 / 16, 0.1, 60);
camera.position.set(0, 3.35, 12.5);
camera.lookAt(0, 2.05, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

scene.add(new THREE.HemisphereLight('#fff1dc', '#493276', 2.1));
const keyLight = new THREE.DirectionalLight('#fff3d8', 3.1);
keyLight.position.set(-4, 8, 7); scene.add(keyLight);
const rimLight = new THREE.DirectionalLight('#9d81ff', 2.2);
rimLight.position.set(4, 4, -4); scene.add(rimLight);

const mat = (color, roughness = 0.72, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const M = {
  red: mat('#e93647'), redDark: mat('#9e2039'), white: mat('#fff8ed'), skin: mat('#f3b88f'),
  hair: mat('#211d2b'), pants: mat('#262536'), shoe: mat('#f7f3ed'), shoeRed: mat('#e93647'),
  black: mat('#171722'), purple: mat('#ae79ff', .27, { emissive: '#6729c7', emissiveIntensity: 1.6 }),
  robot: mat('#f5f4f2', .43), robotShade: mat('#c8c9d1'), metal: mat('#8d8a9d', .38),
  floor: mat('#514179'), gold: mat('#ffd369', .4, { emissive: '#a45b11', emissiveIntensity: .28 }),
  teal: mat('#35d8cf', .48, { emissive: '#168b91', emissiveIntensity: .3 })
};
const sphereGeo = new THREE.SphereGeometry(1, 18, 14);
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function mesh(parent, geometry, material, position, scale) {
  const o = new THREE.Mesh(geometry, material);
  if (position) o.position.set(...position);
  if (scale) o.scale.set(...scale);
  parent.add(o); return o;
}
function ball(parent, material, pos, scale) { return mesh(parent, sphereGeo, material, pos, scale); }
function box(parent, material, pos, scale, radius = .12) {
  const g = new THREE.BoxGeometry(...scale, 3, 3, 3);
  const o = new THREE.Mesh(g, material); o.position.set(...pos); o.castShadow = false; parent.add(o); return o;
}
function cylinderBetween(parent, material, a, b, r1, r2 = r1, segments = 10) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), d = end.clone().sub(start);
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, d.length(), segments), material);
  o.position.copy(start.add(end).multiplyScalar(.5)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  parent.add(o); return o;
}
function faceTexture(symbol, bg, fg) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, 256, 256);
  ctx.fillStyle = fg; ctx.font = '900 190px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(symbol, 128, 132);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide });
  return material;
}

// Soft graphic backdrop, made from inexpensive meshes rather than image assets.
const floor = mesh(scene, new THREE.CircleGeometry(8, 48), M.floor, [0, -.12, 0]);
floor.rotation.x = -Math.PI / 2;
const back = mesh(scene, new THREE.PlaneGeometry(30, 18), mat('#34295d'), [0, 5, -4]);
for (let i = 0; i < 7; i++) {
  const x = -4.5 + i * 1.5;
  const orb = ball(scene, i % 2 ? M.teal : M.purple, [x, 4.5 + (i % 3) * .75, -2.1], [.12 + (i % 2) * .08, .12 + (i % 2) * .08, .12]);
  orb.material = orb.material.clone(); orb.material.transparent = true; orb.material.opacity = .58;
}
for (let i = 0; i < 5; i++) {
  const star = mesh(scene, new THREE.OctahedronGeometry(.12 + (i % 2) * .07, 0), M.gold, [-3.6 + i * 1.7, 2.5 + (i % 2) * 1.2, -1.6]);
  star.rotation.set(i, i * .7, i * .3);
}

function makeQuirk() {
  const root = new THREE.Group(); scene.add(root);
  const body = new THREE.Group(); root.add(body);
  // Hoodie torso and hood.
  ball(body, M.red, [0, 1.69, 0], [.57, .72, .39]);
  ball(body, M.redDark, [0, 2.12, -.18], [.42, .38, .25]);
  ball(body, M.white, [0, 1.76, .376], [.22, .29, .028]);
  const q = mesh(body, new THREE.PlaneGeometry(.31, .37), faceTexture('Q', '', '#e93647'), [0, 1.76, .408]);
  q.renderOrder = 2;
  // Drawstrings.
  cylinderBetween(body, M.white, [-.1, 2.04, .31], [-.12, 1.84, .34], .018);
  cylinderBetween(body, M.white, [.1, 2.04, .31], [.12, 1.84, .34], .018);
  const head = new THREE.Group(); head.position.set(0, 2.65, 0); body.add(head);
  ball(head, M.skin, [0, 0, .03], [.53, .58, .43]);
  // Hair cap and unmistakable messy spikes.
  ball(head, M.hair, [0, .39, -.015], [.55, .28, .45]);
  const spikes = [[-.36,.49,0,-.35],[-.2,.65,.02,-.18],[0,.69,-.02,0],[.2,.63,0,.2],[.39,.48,-.01,.42],[-.45,.31,.05,-.65],[.42,.3,.04,.62]];
  for (const [x,y,z,rz] of spikes) {
    const p = new THREE.Mesh(new THREE.ConeGeometry(.19, .48, 7), M.hair);
    p.position.set(x,y,z); p.rotation.z = rz; p.rotation.x = -.12; head.add(p);
  }
  // Face features face the viewer (+Z).
  const eyeWhite = mat('#fffdf8');
  const eyes = [];
  for (const x of [-.2, .2]) {
    ball(head, eyeWhite, [x, .04, .405], [.105, .13, .045]);
    const pupil = ball(head, M.black, [x + .018, .035, .447], [.047, .07, .025]); eyes.push(pupil);
  }
  const mouth = ball(head, M.black, [0, -.24, .425], [.105, .025, .025]);
  const nose = ball(head, M.skin, [0, -.09, .43], [.045, .035, .03]);
  const limbs = {};
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .25, 1.04, 0); body.add(leg);
    cylinderBetween(leg, M.pants, [0,0,0], [0,-.66,0], .16, .12);
    const shoe = new THREE.Group(); shoe.position.set(0,-.66,.08); leg.add(shoe);
    ball(shoe, M.shoe, [0,-.035,.09], [.2,.14,.34]);
    ball(shoe, M.shoeRed, [0,-.1,.22], [.2,.045,.13]);
    limbs[side < 0 ? 'leftLeg' : 'rightLeg'] = leg;
    const arm = new THREE.Group(); arm.position.set(side * .49, 2.03, 0); body.add(arm);
    cylinderBetween(arm, M.red, [0,0,0], [side * .13,-.48,0], .17,.135);
    const hand = ball(arm, M.skin, [side * .13,-.56,.02], [.14,.15,.13]);
    const finger = cylinderBetween(arm, M.skin, [side*.13,-.53,.1], [side*.13,-.25,.1], .045,.035,8);
    limbs[side < 0 ? 'leftArm' : 'rightArm'] = arm;
    limbs[side < 0 ? 'leftFinger' : 'rightFinger'] = finger;
  }
  return { root, body, head, mouth, eyes, limbs };
}

function makeByte() {
  const root = new THREE.Group(); scene.add(root);
  const body = new THREE.Group(); root.add(body);
  // Short articulated robot legs and red-accented feet.
  const legs = [];
  for (const x of [-.23,.23]) {
    cylinderBetween(body, M.metal, [x,.64,0], [x,.34,0], .085,.065,10);
    const foot = ball(body, M.red, [x,.21,.08], [.18,.12,.25]);
    legs.push(foot);
  }
  const torso = new THREE.Group(); torso.position.set(0,1.05,0); body.add(torso);
  const t = box(torso, M.robot, [0,0,0], [.72,.73,.48]);
  // Reactor/playing badge.
  ball(torso, M.red, [0,-.02,.253], [.17,.17,.035]);
  const play = mesh(torso, new THREE.BufferGeometry(), M.white, [0,-.02,.29]);
  const tri = new THREE.Shape(); tri.moveTo(-.055,-.075); tri.lineTo(.085,0); tri.lineTo(-.055,.075); tri.closePath();
  const triMesh = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshBasicMaterial({ color: '#fff8ed', side: THREE.DoubleSide })); triMesh.position.set(0,-.02,.294); torso.add(triMesh);
  const neck = cylinderBetween(body, M.metal, [0,1.37,0], [0,1.62,0], .12,.1);
  const head = new THREE.Group(); head.position.set(0,2.1,0); body.add(head);
  // Rounded-square head, ear cups, red headband.
  box(head, M.robot, [0,0,0], [.94,.77,.58]);
  for (const x of [-.53,.53]) {
    const cup = ball(head, M.red, [x,0,0], [.16,.34,.28]);
    ball(head, M.redDark, [x*1.12,0,.02], [.07,.22,.19]);
  }
  const band = box(head, M.red, [0,.38,-.015], [.83,.12,.57]);
  const face = box(head, mat('#343047',.45), [0,-.015,.302], [.73,.48,.035]);
  const eyes = [];
  for (const x of [-.18,.18]) eyes.push(ball(head, M.purple, [x,.025,.34], [.085,.105,.035]));
  const mouth = box(head, M.metal, [0,-.19,.345], [.13,.028,.022]);
  // Brow lids are animated over the digital eyes to give Byte suspicious and unimpressed reads.
  const lids = [];
  for (const x of [-.18,.18]) lids.push(box(head, M.robotShade, [x,.13,.376], [.15,.015,.025]));
  return { root, body, torso, head, eyes, mouth, lids, legs };
}

const quirk = makeQuirk();
const byte = makeByte();
quirk.root.position.set(-2.15,0,0);
byte.root.position.set(.9,0,-.15);
byte.root.scale.setScalar(.85);

const captions = [
  [0, 'Quirk has entered the chat.'], [2, 'Wait… I have a brilliant idea!'], [4, 'Byte is listening. Probably.'],
  [6, 'Behold! The future!'], [8, 'Byte has notes.'], [9.5, 'The Big Idea · replay?']
];
let playing = true;
let startedAt = performance.now();
let pausedAt = 0;
let animationTime = 0;
const clock = new THREE.Clock();
function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function smooth(a,b,t) { const x=clamp01((t-a)/(b-a)); return x*x*(3-2*x); }
function lerp(a,b,t) { return a+(b-a)*t; }
function blink(time, center, width=.12) {
  const d=Math.abs(time-center); return d<width ? Math.sin(Math.PI*(1-d/width)) : 0;
}
function animate(time) {
  const t = time % DURATION;
  animationTime = t;
  const walk = 1 - smooth(1.7,2.15,t);
  const entry = smooth(0,2,t);
  quirk.root.position.x = lerp(-2.15,-.72,entry);
  quirk.body.position.y = .035 + Math.abs(Math.sin(t*9))*.09*walk + Math.sin(t*2.7)*.025;
  quirk.body.rotation.z = Math.sin(t*9)*.055*walk + Math.sin(t*2)*.025;
  quirk.head.rotation.z = Math.sin(t*2.4)*.045;
  quirk.head.rotation.x = Math.sin(t*1.8)*.025;
  for (const [i,key] of ['leftLeg','rightLeg'].entries()) quirk.limbs[key].rotation.x = Math.sin(t*9+i*Math.PI)*.65*walk;
  for (const [i,key] of ['leftArm','rightArm'].entries()) quirk.limbs[key].rotation.x = Math.sin(t*9+i*Math.PI+Math.PI)*.45*walk;
  // Idea: right hand springs up, finger extends, with a tiny anticipatory crouch.
  const idea = smooth(2.12,2.58,t)*(1-smooth(3.82,4.12,t));
  quirk.limbs.rightArm.rotation.z = lerp(0,-2.62,idea) + Math.sin(t*14)*.055*idea;
  quirk.limbs.rightArm.rotation.x = lerp(quirk.limbs.rightArm.rotation.x, -.2, idea);
  quirk.limbs.leftArm.rotation.z = .18 + Math.sin(t*3)*.06;
  const point = smooth(5.85,6.25,t)*(1-smooth(7.7,8.05,t));
  quirk.limbs.rightArm.rotation.x = lerp(quirk.limbs.rightArm.rotation.x, -1.25, point);
  quirk.limbs.rightArm.rotation.z = lerp(quirk.limbs.rightArm.rotation.z, -1.35, point);
  quirk.head.rotation.z += Math.sin(t*17)*.025*idea;
  const qBlink = Math.max(blink(t,.9,.13), blink(t,4.75,.12), blink(t,7.15,.12));
  for (const eye of quirk.eyes) eye.scale.y = .07*(1-qBlink*.92);
  const qTalk = (smooth(2,2.2,t)*(1-smooth(3.7,4,t))) + point*(.7+.3*Math.sin(t*22));
  quirk.mouth.scale.y = .025 + .11*Math.abs(Math.sin(t*18))*Math.min(1,qTalk);
  quirk.mouth.scale.x = .105 + .025*Math.min(1,qTalk);

  // Byte idles with precise servo-like movements, then looks left toward Quirk.
  const turn = smooth(3.95,4.65,t)*(1-smooth(7.75,8.2,t));
  byte.root.position.y = Math.sin(t*2.1)*.025;
  byte.body.rotation.z = Math.sin(t*1.7)*.018;
  byte.head.rotation.y = -.72*turn;
  byte.head.rotation.z = .035*Math.sin(t*1.6) + .11*smooth(8,8.5,t);
  byte.head.rotation.x = .025*Math.sin(t*2.3);
  const bBlink = Math.max(blink(t,4.95,.16),blink(t,5.2,.12),blink(t,8.65,.18));
  for (const lid of byte.lids) lid.scale.y = .015 + .16*bBlink;
  const unimpressed = smooth(8,8.5,t);
  for (const eye of byte.eyes) eye.scale.y = .105*(1-.82*unimpressed);
  byte.mouth.scale.x = .13 + .07*unimpressed;
  byte.mouth.rotation.z = -.12*unimpressed;
  byte.legs.forEach((foot,i)=>{foot.position.y=.21+Math.sin(t*2+i)*.008;});
  // Subtle floating sparkle accents.
  scene.children.forEach((obj,i)=>{ if (obj.geometry?.type === 'OctahedronGeometry') obj.rotation.y += .003*(i%2 ? 1 : -1); });
  const line = captions.reduce((last,item)=>t>=item[0]?item[1]:last,captions[0][1]);
  caption.textContent = line;
  progress.style.width = `${(t/DURATION)*100}%`;
}
function resize() {
  const width = canvas.clientWidth || innerWidth, height = canvas.clientHeight || innerHeight;
  renderer.setSize(width,height,false);
  camera.aspect = width/height;
  // Widen the view on landscape, retaining a designed vertical 9:16 shot on phones.
  camera.fov = width/height > .72 ? 34 : 34;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize,{passive:true});
resize();
function setPlaying(value) {
  playing=value;
  playIcon.textContent=playing?'Ⅱ':'▶'; playLabel.textContent=playing?'PAUSE':'PLAY';
  playButton.setAttribute('aria-label',playing?'Pause animation':'Play animation');
  if (playing) startedAt=performance.now()-pausedAt*1000;
  else pausedAt=animationTime;
}
playButton.addEventListener('click',()=>setPlaying(!playing));
replayButton.addEventListener('click',()=>{pausedAt=0;startedAt=performance.now();setPlaying(true);});
canvas.addEventListener('click',()=>setPlaying(!playing));
window.addEventListener('keydown',e=>{if(e.code==='Space' && !/BUTTON/.test(document.activeElement.tagName)){e.preventDefault();setPlaying(!playing);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden && playing)setPlaying(false);});
function frame(now) {
  requestAnimationFrame(frame);
  if (playing) {
    const elapsed=(now-startedAt)/1000;
    // End the scene on its final beat; replay starts cleanly at 0.
    if(elapsed>=DURATION){pausedAt=0;startedAt=now;}
    animate(elapsed>=DURATION?0:elapsed);
  }
  renderer.render(scene,camera);
}
try { animate(0); requestAnimationFrame(frame); }
catch (err) { errorBox.hidden=false; errorBox.textContent=`Could not start the 3D scene: ${err.message}`; }
window.addEventListener('error',event=>{ if(event.error) { errorBox.hidden=false; errorBox.textContent='The 3D scene could not load. Check your connection and try a modern browser.'; } });
