/**
 * @author bhouston / http://clara.io/
 */

import {
	BoxBufferGeometry,
	Mesh,
	PerspectiveCamera,
	Scene,
	SkyboxMaterial
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";

var CubeTexturePass = function ( camera, envMap, opacity ) {

	Pass.call( this );

	this.camera = camera;

	this.needsSwap = false;

	this.cubeMaterial = new SkyboxMaterial();

	this.cubeMesh = new Mesh(
		new BoxBufferGeometry( 10, 10, 10 ),
		this.cubeMaterial
	);

	this.envMap = envMap;
	this.envMapIntensity = 1.0;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;
	this.roughness = 0.0;

	this.cubeScene = new Scene();
	this.cubeCamera = new PerspectiveCamera();
	this.cubeScene.add( this.cubeMesh );

};

CubeTexturePass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: CubeTexturePass,

	render: function ( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		var camera = this.camera;

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.cubeCamera.copy( camera );
		this.cubeCamera.near = 0.01;
		this.cubeCamera.far = 20;
		this.cubeCamera.position.set(0, 0, 0);
		this.cubeCamera.quaternion.setFromRotationMatrix( camera.matrixWorld );
		this.cubeCamera.updateProjectionMatrix();
		if( this.cubeMaterial.envMap != this.envMap ) {
			this.cubeMaterial.envMap = this.envMap;
			this.cubeMaterial.needsUpdate = true;
		}
		this.cubeMaterial.envMapIntensity = this.envMapIntensity;
		this.cubeMaterial.roughness = this.roughness;
		this.cubeMaterial.opacity = this.opacity;
		this.cubeMaterial.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if( this.clear ) renderer.clear();
		renderer.render( this.cubeScene, this.cubeCamera );

		renderer.autoClear = oldAutoClear;

	}

} );

export { CubeTexturePass };
