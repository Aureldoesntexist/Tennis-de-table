
function cameraLumiere(scene,camera) {
  camera.up = new THREE.Vector3(0, 0, 1);
  // Position
  var xPos = 0;
  var yPos = 15;
  var zPos = 10;
  // Direction
  var xDir = 5;
  var yDir = 5;
  var zDir = 3;
  camera.position.set(xPos, yPos, zPos);
  camera.lookAt(xDir, yDir, zDir);
}

// Menu GUI pour la caméra
function ajoutCameraGui(gui, menuGUI, camera) {
  let guiCamera = gui.addFolder("Camera");
  const borneVue = 36;
  function updateCamera() {
    camera.position.set(menuGUI.cameraxPos * menuGUI.cameraZoom, menuGUI.camerayPos * menuGUI.cameraZoom, menuGUI.camerazPos * menuGUI.cameraZoom);
    camera.lookAt(menuGUI.cameraxDir, menuGUI.camerayDir, menuGUI.camerazDir);
  }
  guiCamera.add(menuGUI, "cameraxPos", -borneVue, borneVue).onChange(updateCamera);
  guiCamera.add(menuGUI, "camerayPos", -borneVue, borneVue).onChange(updateCamera);
  guiCamera.add(menuGUI, "camerazPos", -borneVue, borneVue).onChange(updateCamera);
  guiCamera.add(menuGUI, "cameraZoom", -1, 1).onChange(updateCamera);
  guiCamera.add(menuGUI, "cameraxDir", -borneVue, borneVue).onChange(updateCamera);
  guiCamera.add(menuGUI, "camerayDir", -borneVue, borneVue).onChange(updateCamera);
}


// Lumière
function lumiere(scene) {

  // Lumière pour éclairer comme un plafonnier
  const L1 = new THREE.PointLight(0xffffff, 1.2, 15);
  L1.position.set(0, 0, 5);;
  L1.castShadow = true;
  scene.add(L1)

  // Lumière pour rendre visible les pieds
  const L2 = new THREE.PointLight(0xffffff, 0.5, 10);
  L2.position.set(0, 3, -0.25);;
  L2.castShadow = true;
  scene.add(L2)
  const L3 = new THREE.PointLight(0xffffff, 0.5, 10);
  L3.position.set(0, -3, -0.25);
  L3.castShadow = true;
  scene.add(L3)
}

