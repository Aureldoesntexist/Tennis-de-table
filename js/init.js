function init() {
  // Initialisation des données
  const stats = initStats();

  // Configuration du rendu WebGL
  const rendu = new THREE.WebGLRenderer({ antialias: true });
  rendu.shadowMap.enabled = true;
  rendu.setClearColor(new THREE.Color(0xFFFFFF));
  rendu.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
  document.getElementById("webgl").appendChild(rendu.domElement);

  // Création de la scène et de la caméra
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);

  // Variables globales
  const coef = 5;
  let grisClair = 0xD5DBDB;
  let couleurTable = 0xABEBC6;
  const nbPoints = 100

  // Variables liées aux trajectoires
  let trajectoires = [];
  let couranteTrajectoire = 0;
  const duree = [5, 5, 5, 5];
  var totalDuree = 0;
  for (let i = 0; i < duree.length; i++) { totalDuree += duree[i]; }

  // Variables  liées au temps;
  let tic = 0;
  let deltaTemps = 0.1;

  // Variables liées aux scores et lancers
  let joueur1Score = 0;
  let joueur2Score = 0;
  let valeurMaxLancer = 10
  let nombreLancers = Math.floor(Math.random() * (valeurMaxLancer - 5)) + 5;
  let tourJoueurCourant = 1;
  let echange = 1;
  let estActualise = false;

  // Variables liées à la distance
  let maximumDistance = 1.1;
  let minimumDistance = 0.1;


  // Éléments HTML
  let joueur1HTML = document.getElementById('j1p');
  let joueur2HTML = document.getElementById('j2p');
  joueur1HTML.value = 0
  joueur2HTML.value = 0

  // GUI
  let menuGUI, gui;

  // Sol
  const solGeometry = new THREE.PlaneGeometry(10, 10);
  const sol = surfPhong(solGeometry, 0xba926c, 1, 1, "#223322");
  sol.receiveShadow = true;
  sol.translateZ(-1);
  scene.add(sol);


  const tableGeometry = new THREE.BoxGeometry(2, 4, 0.1);
  const tableMaterial = new THREE.MeshPhongMaterial({ color: couleurTable });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.castShadow = true;
  table.receiveShadow = true;
  table.position.set(0, 0, 0);
  scene.add(table);


  // Lignes de la table

  const lignes = new THREE.Group();
  const ligneLongueur = new THREE.BoxGeometry(0.1, 4, 0.1);
  const ligneMilieu = new THREE.BoxGeometry(0.1, 4, 0.1);
  const ligneLargeur = new THREE.BoxGeometry(2.1, 0.1, 0.1);
  const lineMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
  const longueur1 = new THREE.Mesh(ligneLongueur, lineMaterial);
  const longueur2 = new THREE.Mesh(ligneLongueur, lineMaterial);
  const Milieu = new THREE.Mesh(ligneMilieu, lineMaterial);
  const largeur1 = new THREE.Mesh(ligneLargeur, lineMaterial);
  const largeur2 = new THREE.Mesh(ligneLargeur, lineMaterial);
  longueur1.translateX(1);
  longueur2.translateX(- 1);
  largeur1.translateY(-2);
  largeur2.translateY(2);
  longueur1.castShadow = true;
  longueur1.receiveShadow = true;
  longueur2.castShadow = true;
  longueur2.receiveShadow = true;
  largeur1.castShadow = true;
  largeur1.receiveShadow = true;
  largeur2.castShadow = true;
  largeur2.receiveShadow = true;
  lignes.add(longueur1, longueur2, Milieu, largeur1, largeur2);
  lignes.position.set(0, 0, 0.001);
  scene.add(lignes);

  // Filet

  const filetGeometry = new THREE.PlaneGeometry(2, 0.2, 0.25, 15, 15);
  const filet = surfFilDeFer(filetGeometry, 0xFFFFFF, 1);
  filet.rotateX(Math.PI / 2);
  filet.position.set(0, 0, 0.2);
  scene.add(filet);

  // Pieds de la table\\

  // Création des points pour les trois lathes
  let z2 = new THREE.Vector3(0, 0, 0);
  let z3 = new THREE.Vector3(0.2, 0, 0);
  let p0 = new THREE.Vector3(z3.x, z3.y, 0);
  let p1 = new THREE.Vector3(0.4, -0.1, 0);
  let p2 = new THREE.Vector3(0.4, -0.3, 0);
  let p3 = new THREE.Vector3(0.1, -0.42, 0);
  let q0 = new THREE.Vector3(p3.x, p3.y, 0);
  let q1 = new THREE.Vector3(0.3, -0.2, 0);
  let q2 = new THREE.Vector3(0.4, -0.2, 0);
  let q3 = new THREE.Vector3(0.2, -0.5, 0);
  let r0 = new THREE.Vector3(q3.x, q3.y, 0);
  let r1 = new THREE.Vector3(0.3, -0.7, 0);
  let r2 = new THREE.Vector3(0.2, -1, 0);
  let r3 = new THREE.Vector3(0.3, -1, 0);

  // Création des vecteurs pour les tangentes
  let z2z3 = new THREE.Vector3(0, 0, 0);
  let p2p3 = new THREE.Vector3(0, 0, 0);
  let q2q3 = new THREE.Vector3(0, 0, 0);
  let tangente = new THREE.Vector3(0, 0, 0);
  let tangente2 = new THREE.Vector3(0, 0, 0);
  let tangente3 = new THREE.Vector3(0, 0, 0);

  // Calculs pour les jointures
  z2z3.subVectors(z3, z2);
  p2p3.subVectors(p3, p2);
  q2q3.subVectors(q3, q2);
  tangente.addScaledVector(z2z3, 1);
  tangente2.addScaledVector(p2p3, 1);
  tangente3.addScaledVector(q2q3, 1);
  p1.addVectors(p0, tangente);
  q1.addVectors(q0, tangente2);
  r1.addVectors(r0, tangente3);

  // Premier pied de la table \\
  // Création des lathes
  hautPied1 = latheBez3(50, 50, p0, p1, p2, p3, grisClair, 1, false);
  milieuPied1 = latheBez3(50, 50, q0, q1, q2, q3, grisClair, 1, false);
  basPied1 = latheBez3(50, 50, r0, r1, r2, r3, grisClair, 1, false);

  //Propriétés lumineuses
  hautPied1.castShadow = true;
  hautPied1.receiveShadow = true;
  milieuPied1.castShadow = true;
  milieuPied1.receiveShadow = true;
  basPied1.castShadow = true;
  basPied1.receiveShadow = true;

  // Ajout dans la scène 3D
  const pied1 = new THREE.Group();
  pied1.add(hautPied1, milieuPied1, basPied1);
  pied1.rotateX(Math.PI / 2);
  pied1.position.set(-0.5, 0, 0);
  scene.add(pied1);

  // Deuxième pied de la table \\
  // Création des lathes
  const pied2 = new THREE.Group();
  hautPied2 = latheBez3(50, 50, p0, p1, p2, p3, 0xFF0000, 1, false);
  milieuPied2 = latheBez3(50, 50, q0, q1, q2, q3, 0x00FF00, 1, false);
  basPied2 = latheBez3(50, 50, r0, r1, r2, r3, 0x0000FF, 1, false);

  //Propriétés lumineuses
  hautPied2.castShadow = true;
  hautPied2.receiveShadow = true;
  milieuPied2.castShadow = true;
  milieuPied2.receiveShadow = true;
  basPied2.castShadow = true;
  basPied2.receiveShadow = true;

  // Ajout dans la scène 3D
  pied2.add(hautPied2, milieuPied2, basPied2);
  pied2.rotateX(Math.PI / 2);
  pied2.position.set(0.5, 0, 0);
  scene.add(pied2);


  // Trajectoire \\
  // Les points de contrôles de chaque courbes  
  var a0 = new THREE.Vector3(-0.5, 2, 1);
  var a1 = new THREE.Vector3(-0.45, 1.6, 1);
  var a2 = new THREE.Vector3(-0.4, 1.2, 1);
  var b0 = new THREE.Vector3(a2.x, a2.y, a2.z);
  var b1 = new THREE.Vector3(-0.3, 0.8, 1);
  var b2 = new THREE.Vector3(-0.2, 0.4, 1);
  var b3 = new THREE.Vector3(-0.1, 0, 1);
  var c0 = new THREE.Vector3(b3.x, b3.y, b3.z);
  var c1 = new THREE.Vector3(0.1, -0.4, 1);
  var c2 = new THREE.Vector3(0.2, -0.8, 1);
  var c3 = new THREE.Vector3(0.3, -1.2, 1);
  var d0 = new THREE.Vector3(c3.x, c3.y, 1);
  var d1 = new THREE.Vector3(0.4, -1.6, 1);
  var d2 = new THREE.Vector3(0.5, -2, 1);

  // Variables pour les tangentes  
  var tangenteTrajectoire = new THREE.Vector3(0, 0, 0);
  var tangente2Trajectoire = new THREE.Vector3(0, 0, 0);
  var tangente3Trajectoire = new THREE.Vector3(0, 0, 0);
  var a2a1 = new THREE.Vector3(0, 0, 0);
  var b3b2 = new THREE.Vector3(0, 0, 0);
  var c3c2 = new THREE.Vector3(0, 0, 0);

  // Calculs pour les jointures et pour la vitesse
  a2a1.subVectors(a2, a1);
  b3b2.subVectors(b3, b2);
  c3c2.subVectors(c3, c2);
  tangenteTrajectoire.addScaledVector(a2a1, coef);
  tangente2Trajectoire.addScaledVector(b3b2, coef);
  tangente3Trajectoire.addScaledVector(c3c2, coef);

  // Illusion même vitesse
  tangenteTrajectoire.normalize();
  tangente2Trajectoire.normalize();
  tangente3Trajectoire.normalize();
  
  b1.addVectors(b0, tangenteTrajectoire);
  c1.addVectors(c0, tangente2Trajectoire);
  d1.addVectors(d0, tangente3Trajectoire);

  //Création des courbes pour les trajectoires
  trajectoireP1 = new THREE.QuadraticBezierCurve3(a0, a1, a2);
  trajectoireP2 = new THREE.CubicBezierCurve3(b0, b1, b2, b3);
  trajectoireP3 = new THREE.CubicBezierCurve3(c0, c1, c2, c3);
  trajectoireP4 = new THREE.QuadraticBezierCurve3(d0, d1, d2);

  // Création graphiques des courbes
  var c1g = new THREE.BufferGeometry();
  var c2g = new THREE.BufferGeometry();
  var c3g = new THREE.BufferGeometry();
  var c4g = new THREE.BufferGeometry();
  var c1Points = trajectoireP1.getPoints(nbPoints);
  let c2Points = trajectoireP2.getPoints(nbPoints);
  let c3Points = trajectoireP3.getPoints(nbPoints);
  c4Points = trajectoireP4.getPoints(nbPoints);
  c1g.setFromPoints(c1Points);
  c2g.setFromPoints(c2Points);
  c3g.setFromPoints(c3Points);
  c4g.setFromPoints(c4Points);
  var courbeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, });
  var courbe2Material = new THREE.LineBasicMaterial({ color: 0x00ff00, });
  var courbe3Material = new THREE.LineBasicMaterial({ color: 0x0000ff, });
  var courbe4Material = new THREE.LineBasicMaterial({ color: 0xffff00, });
  var courbe1 = new THREE.Line(c1g, courbeMaterial);
  var courbe2 = new THREE.Line(c2g, courbe2Material);
  var courbe3 = new THREE.Line(c3g, courbe3Material);
  var courbe4 = new THREE.Line(c4g, courbe4Material);

  // Ajout dans le tableau des trajectoires et sur la scène 3D
  trajectoires.push(trajectoireP1, trajectoireP2, trajectoireP3, trajectoireP4);
  scene.add(courbe1, courbe2, courbe3, courbe4);


  // Raquettes
  const mancheCylinder = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 30);
  const faceCylinder = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 20);
  const faceRouge = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
  const faceNoir = new THREE.MeshPhongMaterial({ color: 0x2E2E2E });
  const faceJaune = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
  const mancheMaterial = new THREE.MeshPhongMaterial({ color: 0xEB984E });
  const faceRaquetteMaterial_1 = [faceJaune, faceNoir, faceJaune];
  const faceRaquetteMaterial_2 = [faceRouge, faceRouge, faceNoir];
  const face = new THREE.Mesh(faceCylinder, faceRaquetteMaterial_1);
  const face2 = new THREE.Mesh(faceCylinder, faceRaquetteMaterial_2);
  const manche = new THREE.Mesh(mancheCylinder, mancheMaterial);
  const manche2 = new THREE.Mesh(mancheCylinder, mancheMaterial);
  const raquette1 = new THREE.Group();
  const raquette2 = new THREE.Group();
  face.translateZ(0.09);
  face2.translateZ(0.09);
  manche.rotation.x = Math.PI / 2;
  manche2.rotation.x = Math.PI / 2;
  raquette1.add(face, manche);
  raquette2.add(face2, manche2);
  raquette1.position.set(a0.x, a0.y + 0.2, a0.z);
  raquette2.position.set(d2.x, d2.y - 0.2, a0.z);
  raquette1.rotateY(Math.PI / 1.5)
  raquette2.rotateY(Math.PI / -1.5)
  scene.add(raquette1, raquette2);

  // Balle
  const balleGeo = new THREE.SphereGeometry(0.05, 32, 32);
  let balle = surfPhong(balleGeo, 0xFF00FF, 1, 1, "#223322");
  balle.position.set(a0.x, a0.y, a0.z)
  scene.add(balle);

  // Menu GUI global
  function menu() {
    gui = new dat.GUI();

    menuGUI = new function () {

      // Variables de la caméra
      this.cameraxPos = camera.position.x;
      this.camerayPos = camera.position.y;
      this.camerazPos = camera.position.z;
      this.cameraZoom = 1;
      this.cameraxDir = 0;
      this.camerayDir = 0;
      this.camerazDir = 0;

      // Propriétés lumineuses
      this.castShadow = true;
      this.receiveShadow = true;

      // Couleur de la table
      this.Couleur = 'Vert';

      // Variables liées au jeu
      let estDejaActive = false;
      let estEnCours = false;

      // Bouton qui actualise la scène, les courbes et le GUI
      // Obligatoire de l'activer à chaque tour sinon bug du jeu et d'affichage

      this.actualisation = function () {
        scene.remove(courbe4);
        rendu.render()
        // Position de la caméra selon le tour du joueur

        if (tourJoueurCourant % 2 != 0) {
          menuGUI.camerayPos = 15;
          posCamera();
        } else {
          menuGUI.camerayPos = -15;
          posCamera();
        }
        // On supprime les paramètres inutiles
        if (tourJoueurCourant == 2) {
          parametreLancer.remove(item2);
          parametreLancer.remove(item3);
          parametreLancer.remove(item4);
          parametreLancer.remove(item5);
        }
        if (tourJoueurCourant > nombreLancers) {
          estEnCours = false;
          alert("Le jeu est terminé!");
        }


        // On enlève le paramètre de la position X du point de la dernière coubre
        parametreLancer.remove(item);

        // On indique qu'on a appuyé sur le bouton
        estActualise = true;

        // L'intervale de la position X du point de la dernière courbe change en fonction
        // de son lancer précédent
        // Ce système d'échange permet d'éviter qu'un joueur tape dans le même intervalle
        // deux fois de suite.
        if (echange > 4) {
          echange = 1;
        }
        if (echange == 3 || echange == 4) {
          minimumDistance = -1.1;
          maximumDistance = -0.1;
          c2.x = -0.5;
        } else {
          minimumDistance = 0.1;
          maximumDistance = 1.1;
          c2.x = 0.5;
        }
        // Mise à jour des courbes
        parametreCourbe();
        item = parametreLancer.add(menuGUI, 'c2x', minimumDistance, maximumDistance, 0.01).name('c2x').onChange(function () { return parametreCourbe(); });

      }
      // Bouton pour le service activable qu'une seule fois
      this.lancerDuService = function () {
        // S'il n'a pas été activé
        if (!estDejaActive) {
          // Appel l'animation de la balle
          reAffichage();
          // On incrémente le score du joueur et on affiche son score dans le tableau
          joueur1Score += 1;
          joueur1HTML.value = joueur1Score;
          // On incrémente le tour du jeu
          tourJoueurCourant++;
          // On rend inactif le bouton du service
          estDejaActive = true;
          // On active selon pour le bouton pour la suite du jeu
          estEnCours = true;
          // On réintialise l'indice courant de la trajectoire
          couranteTrajectoire = 0;
          // On incrémente l'échange pour la position du X
          echange += 1;
        } else { console.log("Le bouton a déjà été activé une fois."); }
      };

      this.lancerPostService = function () {
        // S'il y a eu le service réalisé
        if (estEnCours) {
          // Si on a actualisé
          if (estActualise) {
            // On active l'animation
            reAffichage();
            // On regarde le tour du joueur : impair = joueur 1, pair = joueur 2
            if (tourJoueurCourant % 2 != 0) {
              // Actualisation du score
              joueur1Score += 1;
              joueur1HTML.value = joueur1Score;
            } else {
              // Actualisation du score
              joueur2Score += 1;
              joueur2HTML.value = joueur1Score;
            }
            tourJoueurCourant++;
            estActualise = false;
            couranteTrajectoire = 0;
            tic = 0; // Réintialisation du tic
            echange += 1;
          } else { alert("Veuillez actualiser pour continuer"); }
        } else { alert("Le jeu est terminé ou vous n'avez pas fait le service"); }
      };
    };
    // Variables liées aux trajectoirs - points de contrôles
    menuGUI.a0x = a0.x; menuGUI.a0z = a0.z;
    menuGUI.a1x = a1.x; menuGUI.a1z = a1.z;
    menuGUI.a2x = a2.x; menuGUI.a2z = a2.z;
    menuGUI.b1x = b1.x; menuGUI.b1z = b1.z;
    menuGUI.b2x = b2.x; menuGUI.b2z = b2.z;
    menuGUI.b3x = b3.x; menuGUI.b3z = b3.z;
    menuGUI.c1x = c1.x; menuGUI.c1z = c1.z;
    menuGUI.c2x = c2.x; menuGUI.c2z = c2.z;
    menuGUI.c3x = c3.x; menuGUI.c3z = c3.z;
    menuGUI.d1x = d1.x; menuGUI.d1z = d1.z;
    menuGUI.d2x = d2.x; menuGUI.d2z = d2.z;

    // Contrôles des valeurs souhaitées pour la trajectoire
    const parametreLancer = gui.addFolder('Paramètres du lancer');
    parametreLancer.add(menuGUI, 'a0x', -1, 1, 0.01).name('a0x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'a0z', 0.35, 1, 0.01).name('a0z').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'a1x', -1, 1, 0.01).name('a1x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'a1z', 0.35, 1, 0.01).name('a1z').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'a2x', -1, 1, 0.01).name('a2x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'a2z', 0.5, 1, 0.01).name('a2z').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'b2x', -1, 1, 0.01).name('b2x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'b2z', 0.35, 1, 0.01).name('b2z').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'b3x', -1, 1, 0.01).name('b3x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'b3z', 0.35, 1, 0.01).name('b3z').onChange(function () { return parametreCourbe(); });
    item = parametreLancer.add(menuGUI, 'c2x', -1, 1, 0.01).name('c2x').onChange(function () { return parametreCourbe(); });
    parametreLancer.add(menuGUI, 'c2z', 0.35, 1, 0.01).name('c2z').onChange(function () { return parametreCourbe(); });
    item2 = parametreLancer.add(menuGUI, 'c3x', -1, 1, 0.01).name('c3x').onChange(function () { return parametreCourbe(); });
    item3 = parametreLancer.add(menuGUI, 'c3z', 0.35, 1, 0.01).name('c3z').onChange(function () { return parametreCourbe(); });
    item4 = parametreLancer.add(menuGUI, 'd2x', minimumDistance, maximumDistance, 0.01).name('d2x').onChange(function () { return parametreCourbe(); });
    item5 = parametreLancer.add(menuGUI, 'd2z', 0.35, 1, 0.01).name('d2z').onChange(function () { return parametreCourbe(); });

    menuGUI.p2x = 0.4; menuGUI.p2y = -0.3;
    menuGUI.p3x = 0.1; menuGUI.p3y = -0.42;
    menuGUI.q2x = 0.4; menuGUI.q2y = -0.2;
    menuGUI.q3x = 0.2; menuGUI.q3y = -0.5;
    menuGUI.r2x = 0.2; menuGUI.r2y = -1;
    menuGUI.r3x = 0.3; menuGUI.r3y = -1;

    // Contrôles des valeurs souhaitées pour l'aspect des pieds de la table
    const piedsTable = gui.addFolder('Pieds de la table');
    piedsTable.add(menuGUI, 'p2x', 0, 1, 0.01).name('p2x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'p2y', -1, -0.1, 0.01).name('p2y').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'p3x', 0, 1, 0.01).name('p3x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'p3y', -1, -0.1, 0.01).name('p3y').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'q2x', 0, 1, 0.01).name('q2x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'q2y', -1, -0.1, 0.01).name('q2y').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'q3x', 0, 1, 0.01).name('q3x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'q3y', -1, -0.1, 0.01).name('q3y').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'r2x', 0, 1, 0.01).name('r2x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'r2y', -1, -0.1, 0.01).name('r2y').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'r3x', 0, 1, 0.01).name('r3x').onChange(function () { return parametresPieds(); });
    piedsTable.add(menuGUI, 'r3y', -1, -0.1, 0.01).name('r3y').onChange(function () { return parametresPieds(); });

    // Contrôle de la couleur souhaitée pour le revêtement de la table
    let couleurTable = gui.addFolder("Couleur");
    couleurTable.add(menuGUI, 'Couleur', ['Vert', 'Bleu']).onChange(function (c) {
      if (c == 'Vert') { table.material.color.set(0xABEBC6); } else { table.material.color.set(0xAED6F1); }
    });

    // Contrôle des propriétés souhaitées pour la table
    let ombrePieds = gui.addFolder("Propriétés lumineuses");

    // Production des ombres
    ombrePieds.add(menuGUI, 'castShadow').name('Produire Ombre').onChange(function (c) {
      if (c == true) {
        hautPied1.castShadow = true;
        milieuPied1.castShadow = true;
        basPied1.castShadow = true;
        hautPied2.castShadow = true;
        milieuPied2.castShadow = true;
        basPied2.castShadow = true;
      } else {
        hautPied1.castShadow = false;
        milieuPied1.castShadow = false;
        basPied1.castShadow = false;
        hautPied2.castShadow = false;
        milieuPied2.castShadow = false;
        basPied2.castShadow = false;
      }
    })

    // Réception des ombres
    ombrePieds.add(menuGUI, 'receiveShadow').name('Recevoir Ombre').onChange(function (c) {
      if (c == true) {
        hautPied1.receiveShadow = true;
        milieuPied1.receiveShadow = true;
        basPied1.receiveShadow = true;
        hautPied2.receiveShadow = true;
        milieuPied2.receiveShadow = true;
        basPied2.receiveShadow = true;
      } else {
        hautPied1.receiveShadow = false;
        milieuPied1.receiveShadow = false;
        basPied1.receiveShadow = false;
        hautPied2.receiveShadow = false;
        milieuPied2.receiveShadow = false;
        basPied2.receiveShadow = false;
      }
    })

    // Appel de la fonction pour la caméra
    posCamera();
    ajoutCameraGui(gui, menuGUI, camera);

    // Ajout des boutons pour le jeu
    gui.add(menuGUI, "lancerDuService").name("Lancer du Service");
    gui.add(menuGUI, "lancerPostService").name("Lancer");
    gui.add(menuGUI, "actualisation").name("Actualisation");
  }
  // Mise à jour des trajectoires selon les paramêtes GUI
  function parametreCourbe() {
    // On vide le tableau des trajectoires
    trajectoires = [];
    scene.remove(courbe1, courbe2, courbe3, courbe4)
    // Premier tour du jeu
    if (tourJoueurCourant == 1) {

      // Actualisation des valeurs selon le menu
      a0.set(menuGUI.a0x, 2, menuGUI.a0z);
      a1.set(menuGUI.a1x, 1.6, menuGUI.a1z);
      a2.set(menuGUI.a2x, 1.2, menuGUI.a2z);
      b0.set(a2.x, a2.y, a2.z);
      b2.set(menuGUI.b2x, 0.4, menuGUI.b2z);
      b3.set(menuGUI.b3x, 0, menuGUI.b3z);
      c0.set(b3.x, b3.y, b3.z);
      c2.set(menuGUI.c2x, -0.8, menuGUI.c2z);
      c3.set(menuGUI.c3x, -1.2, menuGUI.c3z);
      d0.set(c3.x, c3.y, c3.z);
      d1.set(menuGUI.d1x, -1.6, menuGUI.d1z);
      d2.set(menuGUI.d2x, -2, menuGUI.d2z);

      // Réinitialisation des vecteurs
      let tangenteTrajectoire = new THREE.Vector3(0, 0, 0);
      let tangente2Trajectoire = new THREE.Vector3(0, 0, 0);
      let tangente3Trajectoire = new THREE.Vector3(0, 0, 0);
      let a2a1 = new THREE.Vector3(0, 0, 0);
      let b3b2 = new THREE.Vector3(0, 0, 0);
      let c3c2 = new THREE.Vector3(0, 0, 0);

      // Recalculs des tangentes
      a2a1.subVectors(a2, a1);
      b3b2.subVectors(b3, b2);
      c3c2.subVectors(c3, c2);
      tangenteTrajectoire.addScaledVector(a2a1, coef);
      tangente2Trajectoire.addScaledVector(b3b2, coef);
      tangente3Trajectoire.addScaledVector(c3c2, coef);

      // Illusion même vitesse
      tangenteTrajectoire.normalize();
      tangente2Trajectoire.normalize();
      tangente3Trajectoire.normalize();

      // Ajuste les points de contrôle en fonction des vecteurs tangents ajustés
      b1.addVectors(b0, tangenteTrajectoire);
      c1.addVectors(c0, tangente2Trajectoire);
      d1.addVectors(d0, tangente3Trajectoire);

      // Recréation des courbes
      trajectoireP1 = new THREE.QuadraticBezierCurve3(a0, a1, a2);
      trajectoireP2 = new THREE.CubicBezierCurve3(b0, b1, b2, b3);
      trajectoireP3 = new THREE.CubicBezierCurve3(c0, c1, c2, c3);
      trajectoireP4 = new THREE.QuadraticBezierCurve3(d0, d1, d2);

      // Recréation 3D des courbes
      c1Points = trajectoireP1.getPoints(nbPoints);
      c2Points = trajectoireP2.getPoints(nbPoints);
      c3Points = trajectoireP3.getPoints(nbPoints);
      c4Points = trajectoireP4.getPoints(nbPoints);
      c1g.setFromPoints(c1Points);
      c2g.setFromPoints(c2Points);
      c3g.setFromPoints(c3Points);
      c4g.setFromPoints(c4Points);
      courbe1 = new THREE.Line(c1g, courbeMaterial);
      courbe2 = new THREE.Line(c2g, courbe2Material);
      courbe3 = new THREE.Line(c3g, courbe3Material);
      courbe4 = new THREE.Line(c4g, courbe4Material);

      // Les positions des raquettes sont liés au début et à la fin de la trajectoire globale
      raquette1.position.set(a0.x, a0.y + 0.2, a0.z);
      raquette2.position.set(d2.x, d2.y - 0.2, d2.z);
      // On rajoute les trajectoires recalculées
      trajectoires.push(trajectoireP1, trajectoireP2, trajectoireP3, trajectoireP4);
      // On rajoute les courbes
      scene.add(courbe1, courbe2, courbe3, courbe4);

      // Si c'est le tour du deuxième joueur
    } else if (tourJoueurCourant % 2 == 0) {
      // Actualisation des valeurs selon le menu
      a0.set(menuGUI.a0x, -2, menuGUI.a0z);
      a1.set(menuGUI.a1x, -1, menuGUI.a1z);
      a2.set(menuGUI.a2x, 0, menuGUI.a2z);
      b0.set(a2.x, a2.y, a2.z);
      b2.set(menuGUI.b2x, 1, menuGUI.b2z);
      b3.set(menuGUI.b3x, 1.5, menuGUI.b3z);
      c0.set(b3.x, b3.y, b3.z);
      c2.set(menuGUI.c2x, 2, menuGUI.c2z);
   
      // Réinitialisation des vecteurs
      let tangenteTrajectoire = new THREE.Vector3(0, 0, 0);
      let tangente2Trajectoire = new THREE.Vector3(0, 0, 0);
      let a2a1 = new THREE.Vector3(0, 0, 0);
      let b3b2 = new THREE.Vector3(0, 0, 0);
      // Recalculs des tangentes
      a2a1.subVectors(a2, a1);
      b3b2.subVectors(b3, b2);
      tangenteTrajectoire.addScaledVector(a2a1, coef);
      tangente2Trajectoire.addScaledVector(b3b2, coef);

      // Illusion même vitesse
      tangenteTrajectoire.normalize();
      tangente2Trajectoire.normalize();

      // Ajuste les points de contrôle en fonction des vecteurs tangents ajustés
      b1.addVectors(b0, tangenteTrajectoire);
      c1.addVectors(c0, tangente2Trajectoire);

      // Recréation des courbes
      trajectoireP1 = new THREE.QuadraticBezierCurve3(a0, a1, a2);
      trajectoireP2 = new THREE.CubicBezierCurve3(b0, b1, b2, b3);
      trajectoireP3 = new THREE.QuadraticBezierCurve3(c0, c1, c2);

      // Recréation 3D des courbes
      c1Points = trajectoireP1.getPoints(nbPoints);
      c2Points = trajectoireP2.getPoints(nbPoints);
      c3Points = trajectoireP3.getPoints(nbPoints);
      c1g.setFromPoints(c1Points);
      c2g.setFromPoints(c2Points);
      c3g.setFromPoints(c3Points);
      courbe1 = new THREE.Line(c1g, courbeMaterial);
      courbe2 = new THREE.Line(c2g, courbe2Material);
      courbe3 = new THREE.Line(c3g, courbe3Material);

      // Les positions des raquettes sont liés au début et à la fin de la trajectoire globale
      raquette1.position.set(c2.x, c2.y + 0.2, c2.z);
      raquette2.position.set(a0.x, a0.y - 0.2, a0.z);
      // On rajoute les trajectoires recalculées
      trajectoires.push(trajectoireP1, trajectoireP2, trajectoireP3);
      // On rajoute les courbes
      scene.add(courbe1, courbe2, courbe3);

      // Si c'est le tour du joueur 1 et pas le premier tour
    } else if (tourJoueurCourant % 2 != 0 && tourJoueurCourant != 1) {
      // Actualisation des valeurs selon le menu
      a0.set(menuGUI.a0x, 2, menuGUI.a0z);
      a1.set(menuGUI.a1x, 1, menuGUI.a1z);
      a2.set(menuGUI.a2x, 0, menuGUI.a2z);
      b0.set(a2.x, a2.y, a2.z);
      b2.set(menuGUI.b2x, -1, menuGUI.b2z);
      b3.set(menuGUI.b3x, -1.5, menuGUI.b3z);
      c0.set(b3.x, b3.y, b3.z);
      c2.set(menuGUI.c2x, -2, menuGUI.c2z);

      // Réinitialisation des vecteurs
      let tangenteTrajectoire = new THREE.Vector3(0, 0, 0);
      let tangente2Trajectoire = new THREE.Vector3(0, 0, 0);
      let a2a1 = new THREE.Vector3(0, 0, 0);
      let b3b2 = new THREE.Vector3(0, 0, 0);
      // Recalculs des tangentes
      a2a1.subVectors(a2, a1);
      b3b2.subVectors(b3, b2);
      tangenteTrajectoire.addScaledVector(a2a1, coef);
      tangente2Trajectoire.addScaledVector(b3b2, coef);

      // Illusion même vitesse
      tangenteTrajectoire.normalize();
      tangente2Trajectoire.normalize();

      // Ajuste les points de contrôle en fonction des vecteurs tangents ajustés
      b1.addVectors(b0, tangenteTrajectoire);
      c1.addVectors(c0, tangente2Trajectoire);

      // Recréation des courbes
      trajectoireP1 = new THREE.QuadraticBezierCurve3(a0, a1, a2);
      trajectoireP2 = new THREE.CubicBezierCurve3(b0, b1, b2, b3);
      trajectoireP3 = new THREE.QuadraticBezierCurve3(c0, c1, c2);

      // Recréation 3D des courbes
      c1Points = trajectoireP1.getPoints(nbPoints);
      c2Points = trajectoireP2.getPoints(nbPoints);
      c3Points = trajectoireP3.getPoints(nbPoints);

      c1g.setFromPoints(c1Points);
      c2g.setFromPoints(c2Points);
      c3g.setFromPoints(c3Points);

      courbe1 = new THREE.Line(c1g, courbeMaterial);
      courbe2 = new THREE.Line(c2g, courbe2Material);
      courbe3 = new THREE.Line(c3g, courbe3Material);

      // Les positions des raquettes sont liés au début et à la fin de la trajectoire globale
      raquette1.position.set(a0.x, a0.y + 0.2, a0.z);
      raquette2.position.set(c2.x, c2.y - 0.2, c2.z);
      // On rajoute les trajectoires recalculées
      trajectoires.push(trajectoireP1, trajectoireP2, trajectoireP3);
      // On rajoute les courbes
      scene.add(courbe1, courbe2, courbe3);
    }

    // La balle suit le premier point de contrôle de la trajectoire globale
    balle.position.set(a0.x, a0.y, a0.z);

  }
  // Mise à jour des pieds de la table selon les paramêtes GUI
  function parametresPieds() {
    z2z3.set(0, 0, 0);
    p2p3.set(0, 0, 0);
    q2q3.set(0, 0, 0);
    tangente.set(0, 0, 0);
    tangente2.set(0, 0, 0);
    tangente3.set(0, 0, 0);
    z2.set(0, 0, 0);
    z3.set(0, 0, 0);
    p2.set(menuGUI.p2x, menuGUI.p2y, 0);
    p3.set(menuGUI.p3x, menuGUI.p3y, 0);
    q2.set(menuGUI.q2x, menuGUI.q2y, 0);
    q3.set(menuGUI.q3x, menuGUI.q3y, 0);
    r2.set(menuGUI.r2x, menuGUI.r2y, 0);
    r3.set(menuGUI.r3x, menuGUI.r3y, 0);
    p0.set(z3.x, z3.y, 0);
    q0.set(p3.x, p3.y, 0);
    r0.set(q3.x, q3.y, 0);
    p2p3.subVectors(p3, p2);
    q2q3.subVectors(q3, q2);
    tangente.addScaledVector(z2z3, 1);
    tangente2.addScaledVector(p2p3, 1);
    tangente3.addScaledVector(q2q3, 1);
    p1.addVectors(p0, tangente);
    q1.addVectors(q0, tangente2);
    r1.addVectors(r0, tangente3);
    hautPied1.geometry = latheBez3(50, 50, p0, p1, p2, p3, grisClair, 1, false).geometry;
    milieuPied1.geometry = latheBez3(50, 50, q0, q1, q2, q3, grisClair, 1, false).geometry;
    basPied1.geometry = latheBez3(50, 50, r0, r1, r2, r3, grisClair, 1, false).geometry;
    hautPied2.geometry = latheBez3(50, 50, p0, p1, p2, p3, grisClair, 1, false).geometry;
    milieuPied2.geometry = latheBez3(50, 50, q0, q1, q2, q3, grisClair, 1, false).geometry;
    basPied2.geometry = latheBez3(50, 50, r0, r1, r2, r3, grisClair, 1, false).geometry;
  }

  // Actualisation de la position de la camera
  function posCamera() {
    camera.position.set(menuGUI.cameraxPos * menuGUI.cameraZoom, menuGUI.camerayPos * menuGUI.cameraZoom, menuGUI.camerazPos * menuGUI.cameraZoom);
    camera.lookAt(menuGUI.cameraxDir, menuGUI.camerayDir, menuGUI.camerazDir);
  }

  // Animation de la balle
  function reAffichage() {
    setTimeout(function () {

      // On récupère la durée actuelle de la trajectoire courante
      const dureeActuelle = duree[couranteTrajectoire];

      // On active l'ombre de la balle
      balle.castShadow = true;

      // Si le temps écoulé (tic) est inférieur à la durée actuelle de la trajectoire
      if (tic < dureeActuelle) {

        // On calcule le paramètre t pour obtenir la position de la balle le long de la trajectoire
        const t = tic / dureeActuelle;
        const position = trajectoires[couranteTrajectoire].getPointAt(t);

        // On déplace la balle à la position calculée
        balle.position.copy(position);

        // On incrémente le temps écoulé
        tic += deltaTemps;

      } else if (couranteTrajectoire < trajectoires.length - 1) {
        // Si la trajectoire en cours est terminée, passe à la suivante
        tic -= dureeActuelle;
        couranteTrajectoire++;
      }
      // Si le temps écoulé est inférieur à la durée totale,
      // On fait un rappel récursive pour continuer l'animation
      if (tic < totalDuree) {
        reAffichage();
      } else {
        // On fait un rendu de la scène
        rendu.render(scene, camera);
      }
    }, 75); // 75ms entre chaque appel pour éviter une surchage de la mémoire
  }

  // Animation des données de la scène : FPS, ms, mb
  function renduAnim() {
    stats.update();
    requestAnimationFrame(renduAnim);
    rendu.render(scene, camera);
  }
  // Appels des fonctions \\
  // Camera et lumière
  cameraLumiere(scene, camera);
  lumiere(scene);

  // Menu GUI
  menu();

  // Animations des données de la scène
  renduAnim();

  // Rendu de la scène
  rendu.render(scene, camera);
  alert("Entre chaque lancer, veuillez actualiser et bouger la valeur c2x" + "\n" + "Vous devez faire : " + nombreLancers + " échanges")
}



