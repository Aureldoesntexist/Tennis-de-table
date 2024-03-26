
// Fonctions permettant de créer des lathes avec des courbes de Béziers cubiques
function latheBez3(nbePtCbe, nbePtRot, P0, P1, P2, P3, coul, opacite, bolTranspa) {
  let p0 = new THREE.Vector2(P0.x, P0.y);
  let p1 = new THREE.Vector2(P1.x, P1.y);
  let p2 = new THREE.Vector2(P2.x, P2.y);
  let p3 = new THREE.Vector2(P3.x, P3.y);
  let Cbe3 = new THREE.CubicBezierCurve(p0, p1, p2, p3);
  let points = Cbe3.getPoints(nbePtCbe);
  let latheGeometry = new THREE.LatheGeometry(points, nbePtRot, 0, 2 * Math.PI);
  let lathe = surfPhong(latheGeometry, coul, opacite, bolTranspa, "#223322");
  return lathe;
}

// Création d'un objet avec des caractéristiques spécifiques
function surfPhong(geom, coulD, transpa, bolTrans, coulSpe) {
  let Material = new THREE.MeshPhongMaterial({
    color: coulD,
    opacity: transpa,
    transparent: bolTrans,
    specular: coulSpe,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  let maillage = new THREE.Mesh(geom, Material);
  return maillage;
}

// Aspect fil de fer
function surfFilDeFer(ObjetGeometrique, coul, tailleFil) {
  let ProprieteFilDeFer = new THREE.MeshBasicMaterial({
    color: coul,
    wireframeLinewidth: tailleFil,
  });
  ProprieteFilDeFer.wireframe = true;
  let maillage = new THREE.Mesh(ObjetGeometrique, ProprieteFilDeFer);
  return maillage;
}


