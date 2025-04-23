/** @jsx h */
import { render, h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import './index.css';
import * as THREE from 'three';
import materials from './materials.json';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const models = [
  { name: 'bunny', path: 'bunny.obj', scale: 50 },
  { name: 'sphere', path: 'sphere.obj', scale: 1 },
  { name: 'vase', path: 'vase.obj', scale: 0.5 },
  { name: 'vase2', path: 'vase2.obj', scale: 3 },
];

const mappings = [
  { name: 'triplanar',   mapping: THREE.TriPlanarMapping },
  { name: 'cylindrical', mapping: THREE.CylindricalMapping },
];

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.DirectionalLight( 0xffffff, 10.0 ));

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10000);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  if (!mesh) {
    return;
  }

  controls.update();
  renderer.render(scene, camera);
});

let mesh = null;

let currentTextures = null;
let currentMaterial = null;

let currentTextureMapping = THREE.TriPlanarMapping;
let currentTextureRepeat = new THREE.Vector2(0, 0);
let currentTexture3DMatrix = new THREE.Matrix4();
let currentTriplanarHardness = 4;

function updateTexture(texture, repeat) {
  texture.mapping = currentTextureMapping;
  texture.repeat.copy(new THREE.Vector2(Math.pow(2, currentTextureRepeat.x), Math.pow(2, currentTextureRepeat.y))).multiplyScalar(repeat);
}

function updateTextures() {
  for (const [_, texture] of currentTextures ?? []) {
    updateTexture(texture.texture, texture.repeat);
  }
  currentMaterial.triplanarHardness = Math.pow(2, currentTriplanarHardness);
}

async function loadTexture(path, colorSpace, repeat) {
  if (currentTextures === null) {
    currentTextures = new Map();
  }

  const texture = currentTextures.get(path);
  if (texture) {
    return texture.texture;
  }

  const texturePromise = new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(`textures/${path}`, texture => {
      texture.colorSpace = colorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      updateTexture(texture, repeat);
      currentTextures.set(path, {texture: texture, repeat: repeat});
      resolve(texture);
    }, undefined, reject);
  });

  return texturePromise;
}

async function setMaterialAttribute(material, attribute) {
  switch (attribute.name) {
    case 'color': { material.color = new THREE.Color(parseInt(attribute.value, 16)); } break;
    case 'colorMap': { material.map = await loadTexture(attribute.value, THREE.SRGBColorSpace, attribute.repeat ?? 1); } break;
    case 'normalMap': { material.normalMap = await loadTexture(attribute.value, THREE.LinearSRGBColorSpace, attribute.repeat ?? 1); } break;
    case 'alphaMap': {
      material.alphaMap = await loadTexture(attribute.value, THREE.LinearSRGBColorSpace, attribute.repeat ?? 1);
      material.transparent = true;
      material.side = THREE.DoubleSide;
    } break;
    case 'roughness': { material.roughness = attribute.value; } break;
    case 'roughnessMap': { material.roughnessMap = await loadTexture(attribute.value, THREE.LinearSRGBColorSpace, attribute.repeat ?? 1); } break;
    case 'metalness': { material.metalness = attribute.value; } break;
    case 'metalnessMap': { material.metalnessMap = await loadTexture(attribute.value, THREE.LinearSRGBColorSpace, attribute.repeat ?? 1); } break;
    case 'aoMap': { material.aoMap = await loadTexture(attribute.value, THREE.LinearSRGBColorSpace, attribute.repeat ?? 1); } break;
    case 'clearcoat': { material.clearcoat = attribute.value; } break;
  }
}

async function selectMaterial(material) {
  if (currentMaterial) {
    currentMaterial.dispose();
    currentMaterial = null;
  }
  if (currentTextures) {
    for (const [_, texture] of currentTextures) {
      texture.texture.dispose();
    }
    currentTextures = null;
  }

  currentMaterial = new THREE.MeshPhysicalMaterial();

  for (const attribute of material.attributes) {
    await setMaterialAttribute(currentMaterial, attribute);
  }

  currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();

  if (mesh) {
    mesh.material = currentMaterial;
  }
}

async function selectModel(model) {
  if (mesh) {
    mesh.removeFromParent();
    mesh.geometry.dispose();
    mesh = null;
  }

  const objPromise = new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(
      `models/${model.path}`,
      resolve,
      xhr => console.log(`${xhr.loaded / xhr.total * 100}% loaded`),
      reject);
  });
 
  const obj = await objPromise;

  mesh = obj.children[0];
  
  mesh.geometry.deleteAttribute('normal');
  mesh.geometry = BufferGeometryUtils.mergeVertices(mesh.geometry, 1e-3);
  mesh.geometry.computeVertexNormals();
  
  scene.add(mesh);
  
  mesh.geometry.computeBoundingBox();
  const boundingBoxCenter = new THREE.Vector3();
  
  const box = new THREE.Box3();
  box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
  
  box.getCenter(boundingBoxCenter);

  mesh.geometry.translate(-boundingBoxCenter.x, -boundingBoxCenter.y, -boundingBoxCenter.z);
  mesh.geometry.scale(model.scale, model.scale, model.scale);
  mesh.rotateY(Math.PI / 4);

  camera.position.copy(new THREE.Vector3(5, 5, 5));
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  if (currentMaterial) {
    mesh.material = currentMaterial;
  }
}

function selectMapping(mapping) {
  currentTextureMapping = mapping;
  updateTextures();
  currentMaterial.needsUpdate = true;
}

function ModelSelector() {
  return <>
    <h2 className="text-l font-bold">Model:</h2>
     <select className="select" onchange={e => selectModel(models[e.target.selectedIndex])}>
       {models.map(model => <option>{model.name}</option>)}
     </select>
   </>;
}

function ModelTransformControls() {
  return <>
    <h2 className="text-l font-bold">Model Transform:</h2>
    <div className="flex gap-2 justify-stretch">
      <button className="btn btn-blue flex-1" onclick={e => {
        mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2 ));
      }}>↻X</button>
      <button className="btn btn-blue flex-1" onclick={e => {
        mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2 ));
      }}>↻Y</button>
      <button className="btn btn-blue flex-1" onclick={e => {
        mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/2 ));
      }}>↻Z</button>
    </div>
  </>
}

function MaterialSelector() {
  return <>
    <h2 className="text-l font-bold">Material:</h2>
    <select className="select" onchange={e => selectMaterial(materials[e.target.selectedIndex])}>
      {materials.map(material => <option>{material.name}</option>)}
    </select>
  </>;
}

function TextureMappingSelector({onSelect}) {
  return <>
    <h2 className="text-l font-bold">Texture Mapping:</h2>
    <select className="select" onchange={e => onSelect(mappings[e.target.selectedIndex].mapping)}>
      {mappings.map(mapping => <option>{mapping.name}</option>)}
    </select>
  </>;
}

function TextureControls({mapping}) {
  return <>
    {mapping === THREE.TriPlanarMapping && (<>
      <h2 className="text-l font-bold">Triplanar Hardness:</h2>
      <input className="w-full" type="range" min={0} max={7} value={currentTriplanarHardness} step={0.1} oninput={e => {
        currentTriplanarHardness = parseFloat(e.target.value);
        updateTextures();
      }} />
    </>)}

    <h2 className="text-l font-bold">Texture Repeat:</h2>
    <div className="grid grid-cols-8">
      <div className="col-1">U:</div>
      <input className="col-start-2 -col-end-1" type="range" min={-5} max={5} value={currentTextureRepeat.x} oninput={e => {
        currentTextureRepeat.x = parseFloat(e.target.value);
        updateTextures();
      }} />
      <div className="col-1">V:</div>
      <input className="col-start-2 -col-end-1" type="range" min={-5} max={5} value={currentTextureRepeat.y} oninput={e => {
        currentTextureRepeat.y = parseFloat(e.target.value);
        updateTextures();
      }} />
    </div>

    <h2 className="text-l font-bold">Texture Map Transform:</h2>
    <div className="flex gap-2 justify-stretch">
      <button className="btn btn-blue flex-1" onclick={e => {
        currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
      }}>↻X</button>
      <button className="btn btn-blue flex-1" onclick={e => {
        currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationY(Math.PI / 2));
        currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
      }}>↻Y</button>
      <button className="btn btn-blue flex-1" onclick={e => {
        currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
        currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
      }}>↻Z</button>
    </div>
  </>;
}

const App = () => {
  useEffect(() => {
    selectMaterial(materials[0]);
    selectModel(models[0]);
  }, []);

  const [mapping, setMapping] = useState(mappings[0].mapping);
  useEffect(() => selectMapping(mapping), [mapping]);

  return <div className="bg-white rounded-xl p-7 flex flex-col gap-2 fixed top-4 left-4">
    <div>
      <ModelSelector /> 
      <ModelTransformControls />
    </div>
    <div>
      <MaterialSelector />
      <TextureMappingSelector onSelect={mapping => setMapping(mapping)} />
      <TextureControls mapping={mapping} />
    </div>
  </div>;
};

render(<App/>, document.body);
