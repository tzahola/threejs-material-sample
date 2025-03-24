import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

const materials = [
  {
    name: 'perforated metal',
    attributes: [
      { name: 'color',        value: 0x333333,                                          editable: true },
      { name: 'colorMap',     value: 'Perforated_Metal/Perforated_Metal_diffuse.png',   editable: false },
      { name: 'normalMap',    value: 'Perforated_Metal/Perforated_Metal_normal.png',    editable: false },
      { name: 'alphaMap',     value: 'Perforated_Metal/Perforated_Metal_opacity.png',   editable: false },
      { name: 'roughnessMap', value: 'Perforated_Metal/Perforated_Metal_roughness.png', editable: false },
      { name: 'metalnessMap', value: 'Perforated_Metal/Perforated_Metal_roughness.png', editable: false },
    ],
  },
  {
    name: 'chainmail',
    attributes: [
      { name: 'color',        value: 0x333333,                      editable: true },
      { name: 'normalMap',    value: 'Chains/Chains_normal.png',    editable: false },
      { name: 'alphaMap',     value: 'Chains/Chains_opacity.png',   editable: false },
      { name: 'roughnessMap', value: 'Chains/Chains_roughness.png', editable: false },
      { name: 'metalnessMap', value: 'Chains/Chains_metallic.png',  editable: false },
    ],
  },
  {
    name: 'sci-fi brick',
    attributes: [
      { name: 'color',        value: 0xFFFFFF,                                editable: true },
      { name: 'colorMap',     value: 'SciFi_Brick/SciFi_Brick_baseColor.png', editable: false },
      { name: 'normalMap',    value: 'SciFi_Brick/SciFi_Brick_normal.png',    editable: false },
      { name: 'roughness',    value: 0.7,                                     editable: false },
      { name: 'roughnessMap', value: 'SciFi_Brick/SciFi_Brick_mask.png',      editable: false },
      { name: 'metalnessMap', value: 'SciFi_Brick/SciFi_Brick_mask.png',      editable: false },
      { name: 'aoMap',        value: 'SciFi_Brick/SciFi_Brick_mask.png',      editable: false },
    ],
  },
  {
    name: 'metal plate',
    attributes: [
      { name: 'color',        value: 0xFFFFFF,                                      editable: true },
      { name: 'colorMap',     value: 'TH_Metal_Plate/TH_Metal_Plate_baseColor.png', editable: false },
      { name: 'normalMap',    value: 'TH_Metal_Plate/TH_Metal_Plate_normal.png',    editable: false },
      { name: 'roughnessMap', value: 'TH_Metal_Plate/TH_Metal_Plate_roughness.png', editable: false },
      { name: 'metalnessMap', value: 'TH_Metal_Plate/TH_Metal_Plate_roughness.png', editable: false },
    ],
  },
  {
    name: 'blocky cliff',
    attributes: [
      { name: 'colorMap',     value: 'blocky-cliff-bl/blocky-cliff_albedo.png',      editable: false },
      { name: 'normalMap',    value: 'blocky-cliff-bl/blocky-cliff_normal-ogl.png',  editable: false },
      { name: 'roughnessMap', value: 'blocky-cliff-bl/blocky-cliff_roughness.png',   editable: false },
      { name: 'metalnessMap', value: 'blocky-cliff-bl/blocky-cliff_metallic.png',    editable: false },
      { name: 'aoMap',        value: 'blocky-cliff-bl/blocky-cliff_ao.png',          editable: false },
    ],
  },
  {
    name: 'gold foil',
    attributes: [
      { name: 'color',     value: 0xFFC053,                               editable: false },
      { name: 'normalMap', value: 'Gold_Foil_2k_8b/Gold_Foil_normal.png', editable: false },
      { name: 'roughness', value: 0,                                      editable: false },
      { name: 'metalness', value: 1,                                      editable: false },
    ],
  },
  {
    name: 'car paint',
    attributes: [
      { name: 'color',         value: 0x933100,                                editable: true },
      { name: 'normalMap',     value: 'Car_Paint/Car_Paint_normal.png',        editable: false, repeat: 5 },
      { name: 'metalness',     value: 1,                                       editable: false },
      { name: 'roughnessMap',  value: 'Car_Paint/Car_Paint_roughness.png',     editable: false },
      { name: 'clearcoat',     value: 1,                                       editable: false },
    ],
  },
  {
    name: 'stainless steel brushed',
    attributes: [
      { name: 'colorMap',     value: 'Stainless_Steel_Brushed/Stainless_Steel_Brushed_diffuse.png',   editable: false },
      { name: 'normalMap',    value: 'Stainless_Steel_Brushed/Stainless_Steel_Brushed_bump.png',      editable: false },
      { name: 'metalness',    value: 1,                                                               editable: false },
      { name: 'roughnessMap', value: 'Stainless_Steel_Brushed/Stainless_Steel_Brushed_roughness.png', editable: false },
    ],
  },
  {
    name: 'aluminum brushed',
    attributes: [
      { name: 'color',        value: 0x888888,                                          editable: false },
      { name: 'normalMap',    value: 'Aluminum_Brushed/Aluminum_Brushed_normal.png',    editable: false },
      { name: 'metalness',    value: 1,                                                 editable: false },
      { name: 'roughness',    value: 0.5,                                               editable: false },
      { name: 'roughnessMap', value: 'Aluminum_Brushed/Aluminum_Brushed_roughness.png', editable: false },
    ],
  },
  {
    name: 'aluminum matte',
    attributes: [
      { name: 'color',        value: 0x888888,                                      editable: false },
      { name: 'normalMap',    value: 'Aluminum_Matte/Aluminum_Matte_normal.png',    editable: false },
      { name: 'metalness',    value: 1,                                             editable: false },
      { name: 'roughnessMap', value: 'Aluminum_Matte/Aluminum_Matte_roughness.png', editable: false },
    ],
  },
  {
    name: 'aluminum corrugated',
    attributes: [
      { name: 'colorMap',     value: 'Aluminum_Corrugated/Aluminum_Corrugated_baseColor.png', editable: false },
      { name: 'normalMap',    value: 'Aluminum_Corrugated/Aluminum_Corrugated_normal.png',    editable: false },
      { name: 'metalness',    value: 1,                                                       editable: false },
      { name: 'roughnessMap', value: 'Aluminum_Corrugated/Aluminum_Corrugated_roughness.png', editable: false },
    ],
  },
  {
    name: 'copper old',
    attributes: [
      { name: 'colorMap',     value: 'Copper_Old/Copper_Old_baseColor.png', editable: false },
      { name: 'normalMap',    value: 'Copper_Old/Copper_Old_normal.png',    editable: false },
      { name: 'metalness',    value: 1,                                     editable: false },
      { name: 'roughnessMap', value: 'Copper_Old/Copper_Old_roughness.png', editable: false },
    ],
  },
  {
    name: 'cast iron damaged',
    attributes: [
      { name: 'colorMap',     value: 'Cast_Iron_Damaged/Cast_Iron_Damaged_baseColor.png', editable: false },
      { name: 'normalMap',    value: 'Cast_Iron_Damaged/Cast_Iron_Damaged_bump.png',      editable: false },
      { name: 'metalnessMap', value: 'Cast_Iron_Damaged/Cast_Iron_Damaged_metallic.png',  editable: false },
      { name: 'roughnessMap', value: 'Cast_Iron_Damaged/Cast_Iron_Damaged_roughness.png', editable: false },
    ],
  },
  {
    name: 'bronze oxidized',
    attributes: [
      { name: 'colorMap',     value: 'Bronze_Oxydized/Bronze_Oxydized_diffuse.png',   editable: false },
      { name: 'normalMap',    value: 'Bronze_Oxydized/Bronze_Oxydized_normal.png',    editable: false },
      { name: 'metalnessMap', value: 'Bronze_Oxydized/Bronze_Oxydized_roughness.png', editable: false },
      { name: 'roughnessMap', value: 'Bronze_Oxydized/Bronze_Oxydized_roughness.png', editable: false },
    ],
  },
];

const models = [
  { name: 'bunny', path: 'bunny.obj', scale: 50 },
  { name: 'sphere', path: 'sphere.obj', scale: 1 },
  { name: 'vase', path: 'vase.obj', scale: 0.5 },
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
let currentTextureRepeat = new THREE.Vector2(1, 1);
let currentTexture3DMatrix = new THREE.Matrix4();
let currentTriplanarHardness = 16;

function updateTexture(texture, repeat) {
  texture.mapping = currentTextureMapping;
  texture.repeat.copy(currentTextureRepeat).multiplyScalar(repeat);
}

function updateTextures() {
  for (const [_, texture] of currentTextures ?? []) {
    updateTexture(texture.texture, texture.repeat);
  }
  currentMaterial.triplanarHardness = currentTriplanarHardness;
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
    case 'color': { material.color = new THREE.Color(attribute.value); } break;
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

window.onload = () => {
  const materialSelect = document.getElementById('material');
  for (const material of materials) {
    materialSelect.add(new Option(material.name));
  }
  materialSelect.onchange = () => selectMaterial(materials[materialSelect.selectedIndex]);
  selectMaterial(materials[materialSelect.selectedIndex]);

  const modelSelect = document.getElementById('model');
  for (const model of models) {
    modelSelect.add(new Option(model.name));
  }
  modelSelect.onchange = () => selectModel(models[modelSelect.selectedIndex]);
  selectModel(models[modelSelect.selectedIndex]);

  const mappingSelect = document.getElementById('mapping');
  for (const mapping of mappings) {
    mappingSelect.add(new Option(mapping.name));
  }
  mappingSelect.onchange = () => selectMapping(mappings[mappingSelect.selectedIndex].mapping);
  selectMapping(mappings[mappingSelect.selectedIndex].mapping);

  document.getElementById('repeatU').oninput = e => {
    currentTextureRepeat.x = Math.pow(2, parseFloat(e.target.value));
    updateTextures();
  };
  document.getElementById('repeatV').oninput = e => {
    currentTextureRepeat.y = Math.pow(2, parseFloat(e.target.value));
    updateTextures();
  };
  document.getElementById('triplanarHardness').oninput = e => {
    currentTriplanarHardness = Math.pow(2, parseFloat(e.target.value));
    updateTextures();
  };
  document.getElementById('rotateX').onclick = e => { mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2 )); };
  document.getElementById('rotateY').onclick = e => { mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2 )); };
  document.getElementById('rotateZ').onclick = e => { mesh.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI/2 )); };

  document.getElementById('rotateTextureX').onclick = e => {
    currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
  };
  document.getElementById('rotateTextureY').onclick = e => {
    currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
  };
  document.getElementById('rotateTextureZ').onclick = e => {
    currentTexture3DMatrix.premultiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    currentMaterial.texture3DMatrix = currentTexture3DMatrix.clone();
  };
};
