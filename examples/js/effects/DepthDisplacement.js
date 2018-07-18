/**
 * @author juniorxsound / http://orfleisher.com/
 */

THREE.DepthDisplacementEffect = function ( renderer, color, depth ) {

	var _aspectRatio = color.image.width / color.image.height;

	var _displacementAmount = 0.005;

	var _direction = - 1.0;

	var _material = new THREE.ShaderMaterial( {
		uniforms: {
			'colorMap': {
				value: color
			},
			'depthMap': {
				value: depth
			},
			'scale': {
				value: new THREE.Vector2( 0, 0 )
			},
			'filterArea': {
				value: new THREE.Vector4( 0, 0, 0, 0 )
			},
			'filterClamp': {
				value: new THREE.Vector4( 0, 0, 0, 0 )
			},
			'direction': {
				value: 1.0
			}
		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"	vUv = vec2( uv.x, uv.y );",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [

			"varying vec2 vUv;",

			"uniform sampler2D colorMap;",
			"uniform sampler2D depthMap;",

			"uniform vec2 scale;",
			"uniform vec4 filterArea;",
			"uniform vec4 filterClamp;",
			"uniform float direction;",

			"const float _DepthSaturationThreshhold = 0.5; //a given pixel whose saturation is less than half will be culled",
			"const float _DepthBrightnessThreshold = 0.5; //a given pixel whose brightness is less than half will be culled",

			"vec4 calculateDisplacement(vec2 texturePoint)",
			"{",
			"vec4 depthsample = texture2D(depthMap, texturePoint);",

			"vec3 depthvalue = depthsample.rgb;",

			"float depth = depthvalue.g > _DepthSaturationThreshhold && depthvalue.b > _DepthBrightnessThreshold ? depthvalue.r : 0.0;",

			"vec2 depthDisplacement = vec2(depth);",

			"depthDisplacement -= direction;",

			"depthDisplacement.xy *= scale / filterArea.xy;",

			"vec4 colorMap = texture2D(colorMap, clamp(vec2(vUv.x + depthDisplacement.x, vUv.y + depthDisplacement.y), filterClamp.xy, filterClamp.zw));",

			"return vec4(colorMap.rgb, depth);",
			"}",

			"void main() {",


			"vec4 rgbd = calculateDisplacement(vUv); //Do the calculations - returns a vec4 with R,G,B,D(epth)",

			"gl_FragColor = vec4(rgbd.rgb, 1.0);",
			"}"


		].join( "\n" )

	} );

	this.setSize = function ( rendererWidth, rendererHeight, windowWidth, windowHeight ) {

		_windowWidth = windowWidth;
		_windowHeight = windowHeight;

		_material.uniforms.filterArea.value.set( rendererWidth, rendererHeight, _windowWidth, _windowHeight );

		_material.uniforms.filterClamp.value.set( 0, 0, ( _windowWidth - 1 ) / rendererWidth, ( _windowHeight - 1 ) / rendererHeight );

	};

	this.updateMousePosition = function ( e ) {

		_material.uniforms.scale.value.set( ( _windowWidth / 2 - e.clientX ) * _displacementAmount, ( _windowHeight / 2 - e.clientY ) * _displacementAmount );

	};

	this.render = function ( scene, camera ) {

		renderer.render( scene, camera );

	}

	this.setDisplacement = function ( amount ) {

		_displacementAmount = amount;

	};

	this.setDirection = function ( direction ) {

		_direction = direction;

	};

	this.getObject3D = function () {

		return mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( _aspectRatio, 1 ), _material );

	};

};
