/**
 * @pailhead www.dusanbosnjak.com
 */


import { Mesh } from './Mesh';
import { Object3D } from '../core/Object3D';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry';
import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute';
import { Matrix3 } from '../math/Matrix3';
import { Matrix4 } from '../math/Matrix4';

import { MeshDepthMaterial } from '../materials/MeshDepthMaterial';
import { RGBADepthPacking } from '../constants';
import { ShaderMaterial } from '../materials/ShaderMaterial';
import { UniformsUtils } from '../renderers/shaders/UniformsUtils';
import { ShaderLib } from '../renderers/shaders/ShaderLib';


//custom depth and distance material to be attached to meshes

var depthMaterialTemplate = new MeshDepthMaterial();

depthMaterialTemplate.depthPacking = RGBADepthPacking;

depthMaterialTemplate.clipping = true;

depthMaterialTemplate.defines = {

	INSTANCE_TRANSFORM: ''

};

var 
	
	distanceShader = ShaderLib[ "distanceRGBA" ],
	distanceUniforms = UniformsUtils.clone( distanceShader.uniforms ),
	distanceMaterialTemplate = new ShaderMaterial( {
		defines: {
			'USE_SHADOWMAP': '',
			'INSTANCE_TRANSFORM': ''
		},
		uniforms: distanceUniforms,
		vertexShader: distanceShader.vertexShader,
		fragmentShader: distanceShader.fragmentShader,
		clipping: true
	})
;


function InstancedMesh ( geometry , material , distributeFunction , numCopies , uniformScale , disposeRegular ) {

	Mesh.call( this , new InstancedDistributedGeometry( geometry , numCopies , distributeFunction , disposeRegular ) , material.clone() );

	//trigger this material to be instanced
	this.material.defines = {

		INSTANCE_TRANSFORM: ''

	};
 	
 	if( undefined !== uniformScale && uniformScale )
		this.material.defines.INSTANCE_UNIFORM = true;

	this.frustumCulled = false; //you can uncheck this if you generate your own bounding info

	//work with depth effects
	this.customDepthMaterial = depthMaterialTemplate; 

	this.customDistanceMaterial = distanceMaterialTemplate;

}

InstancedMesh.prototype = Object.create( Mesh.prototype );

InstancedMesh.constructor = InstancedMesh;


//helper interface to InstancedBufferGeometry, needs the method to pack TRS into 3 x v4 atts
//could add a per instance color attribute

function InstancedDistributedGeometry (
	regularGeometry , 							//regular buffer geometry, the geometry to be instanced
	numCopies , 								//maximum number of copies to be generated
	distributeFunction,					 		//distribution function
	disposeRegular								//destroy the geometry that was converted to this
) {

	InstancedBufferGeometry.call( this );

	this.fromGeometry( regularGeometry , numCopies , distributeFunction );

	if( disposeRegular ) regularGeometry.dispose();

}

InstancedDistributedGeometry.prototype = Object.create( InstancedBufferGeometry.prototype );

InstancedDistributedGeometry.constructor = InstancedDistributedGeometry;

InstancedDistributedGeometry.prototype.fromGeometry = function( regularGeometry , numCopies , distributeFunction ){

	//a helper node used to compute positions for each instance
	var helperObject = new Object3D(); 	
	var normalMatrix = new Matrix3();
	var rotationMatrix = new Matrix4();


	//copy atributes from the provided geometry
	for ( var att in regularGeometry.attributes ){								
		if(regularGeometry.attributes.hasOwnProperty( att ) ){
			this.addAttribute( att , regularGeometry.attributes[att] );	
		}
	}

	if(regularGeometry.index!==null)
			this.setIndex( regularGeometry.index );

		var orientationMatrices = [
			new THREE.InstancedBufferAttribute( new Float32Array( numCopies * 4 ), 4, 1 ),
			new THREE.InstancedBufferAttribute( new Float32Array( numCopies * 4 ), 4, 1 ),
			new THREE.InstancedBufferAttribute( new Float32Array( numCopies * 4 ), 4, 1 )
		];

		for ( var clone = 0 ; clone < numCopies ; clone ++ ){

			helperObject.matrixWorld.identity();

			helperObject.position.set(0,0,0);
			
			helperObject.rotation.set(0,0,0);
			
			helperObject.scale.set(1,1,1);

			distributeFunction( helperObject , clone , numCopies );

			helperObject.updateMatrixWorld();

			_copyMat4IntoAttributes( clone , helperObject.matrixWorld , orientationMatrices );

		}

		for ( var i = 0 ; i < 3 ; i ++ ){

			this.addAttribute( 'aTRS' + i , orientationMatrices[i] );

		}

}


/**
 * copies mat4 values into an attribute buffer at an offset
 * packs T column into the empty row below RS
 **/
function _copyMat4IntoAttributes( index , mat4 , attributeArray ){

	index = index << 2;

	for ( var r = 0 ; r < 3 ; r ++ ){

		var row = r << 2;

		for ( var c = 0 ; c < 3 ; c ++ ){
			
			attributeArray[r].array[ index + c ] = mat4.elements[ row + c ];

		}

		row = 3 << 2;

		attributeArray[r].array[ index + 3 ] = mat4.elements[ row + r ]; //read last row as column

	}

}


export { InstancedMesh };