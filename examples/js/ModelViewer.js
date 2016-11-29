/**
 * @author jsidd / https://github.com/jsidd
 */

 	if ( ! Detector.webgl ) {
 		Detector.addGetWebGLMessage();
 	}

 	var camera, controls, scene, renderer, loader, fileType;

  var fileInput= document.getElementById("selectedFile");

  fileInput.addEventListener( 'change', function ( event ) {
    console.log(fileInput.files[ 0 ].name);
    loadModelFromFile( fileInput.files[ 0 ]);
    document.getElementById("customModel")
    .value = "**selected file: "+fileInput.files[ 0 ].name + "**";
    fileInput.value ="";
  } );

  var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round(percentComplete, 2) + '% loaded');
    }
  };

  var onError = function ( xhr ) {
    console.log("There was an error.")
  };

  var manager = new THREE.LoadingManager();
  manager.onProgress = function ( item, loaded, total ) {

    console.log( item, loaded, total );

  };

  loadList('list',"webgl_loader_viewer.list");

  init();

  animate();

  function setupScene ( rootNode ) {
 		//to do: improvement - setupLights() improve to use better lights
 		setupLights();
    addSceneRoot( rootNode );
    if (fileType !== "wrl") {
      resetCamera();
    }
  };

 	function resetCamera() {
 		// to do: improvement - resetCamera() does not always result in best view
 		// http://stackoverflow.com/questions/11766163/smart-centering-and-scaling-after-model-import-in-three-js
 		// fit camera to object
 		var bBox = new THREE.Box3().setFromObject(scene);
 		var height = bBox.getSize().y;
 		var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
 		var pos = scene.position;

 		// fudge factor so the object doesn't take up the whole view
 		camera.position.set(pos.x, pos.y, dist * 3);
 		camera.lookAt(pos);
    // necessary for pcd?
    scene.add(camera);
 	}

 	function toggleDiv(id) {
 		var div = document.getElementById(id);
 		div.style.display = (div.style.display === 'block') ? 'none' : 'block';
 	}

  function loadList(id, url)
  {
    console.log("loadList");
		var select = document.getElementById(id);
    var loader = new THREE.FileLoader( manager );
		loader.load( url, function ( text ) {

      console.log("load");
      console.log(text);
      var options = text.split('\n');
      console.log(options);

      //http://stackoverflow.com/questions/18284869/populate-drop-down-list-box-with-values-from-array
      var i;

      for (i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt === "")
          break;
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
      }

		}, onProgress, onError );
  }

 	function clearDiv(id) {
 		var div = document.getElementById(id);
 		div.innerHTML = "";
 	}

 	function appendDiv(id, extra) {
 		var div = document.getElementById(id);
 		div.innerHTML = div.innerHTML + extra;
 	}

 	function debugPrint(text)
 	{
 		appendDiv('debug',text);
 	}

 	function clearScene() {
 		clearDiv('debug');
 		camera.position.z = 250;
 		scene.scale.x = scene.scale.y = scene.scale.z = 1.0;

 		for( var i = scene.children.length - 1; i >= 0; i--){
 			obj = scene.children[i];
 			scene.remove(obj);
 		}
 	}

 	function setupLights() {
 		var ambient = new THREE.AmbientLight( 0x101030 );
 		scene.add( ambient );

 		var directionalLight = new THREE.DirectionalLight( 0xffeedd );
 		directionalLight.position.set( 0, 0, 1 );
 		scene.add( directionalLight );
 	}

 	function loadModelFromFile(file)
 	{
    fileType = file.name.split('.').pop().toLowerCase();
    clearScene();
    loader.loadFile( file, setupScene, onProgress, onError );
 	}

  function loadModelFromPath(path)
  {
    fileType = path.split('.').pop().toLowerCase();
    clearScene();
    loader.loadFromPath( path, setupScene, onProgress, onError );
  }

  function addSceneRoot(rootNode)
  {
    printNode(rootNode.clone(),"root","");

 		if (!(rootNode instanceof THREE.Scene))
 		{
 			scene.add(rootNode);
 		}
 		else {
 			while(rootNode.children.length > 0)
 			{
 				scene.add(rootNode.children.pop());
 			}
 		}
  }

 	function init() {

 		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
 		//camera.position.z = 100;
 		camera.position.z = 250;

 		//controls = new THREE.TrackballControls( camera );

 		// scene

 		scene = new THREE.Scene();

 		// texture

 		// var texture = new THREE.Texture();

 		// var material = new THREE.MeshBasicMaterial( { color: 'red' } );

 		// model
 		var modelPath = 'models/babylon/skull.babylon';
    loader = new THREE.ModelViewerLoader( manager );
 		loadModelFromPath( modelPath );

 		//

 		renderer = new THREE.WebGLRenderer();
 		renderer.setPixelRatio( window.devicePixelRatio );
 		renderer.setSize( window.innerWidth, window.innerHeight );
 		document.body.appendChild( renderer.domElement );

 		//

 		controls = new THREE.OrbitControls( camera, renderer.domElement );

 		window.addEventListener( 'resize', onWindowResize, false );

 	}

 	function printNode(node, header, space)
 	{
 		debugPrint(space+header+": "+node.type+"<br>");
 		var childCount = 0;
 		space+="-";
 		while(node.children.length>0)
 		{
 			childCount++;
 			printNode(node.children.pop(),childCount,space);
 		}
 	}

 	function onWindowResize() {

 		camera.aspect = window.innerWidth / window.innerHeight;
 		camera.updateProjectionMatrix();

 		renderer.setSize( window.innerWidth, window.innerHeight );

 		//controls.handleResize();

 	}

 	//

 	function animate() {

 		requestAnimationFrame( animate );
 		render();

 	}

 	function render() {

 		controls.update();
 		renderer.render( scene, camera );

 	}
