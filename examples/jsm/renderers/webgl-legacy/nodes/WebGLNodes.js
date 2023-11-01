import { WebGLNodeBuilder } from './WebGLNodeBuilder.js';
import { NodeFrame } from 'three/nodes';

import { Material } from 'three';

const builders = new WeakMap();
export const nodeFrame = new NodeFrame();

Material.prototype.onBuild = function ( object, parameters, renderer ) {

	const material = this;

	if ( Array.isArray( material ) ) {

		for ( const m of material ) {

			if ( m.isNodeMaterial === true ) {

				builders.set( m, new WebGLNodeBuilder( object, renderer, parameters, m ).build() );

			}

		}

	} else if ( material.isNodeMaterial === true ) {

		builders.set( material, new WebGLNodeBuilder( object, renderer, parameters, material ).build() );

	}

};

Material.prototype.onBeforeRender = function ( renderer, scene, camera, geometry, object ) {

	const nodeBuilder = builders.get( this );

	if ( nodeBuilder !== undefined ) {

		nodeFrame.material = this;
		nodeFrame.camera = camera;
		nodeFrame.object = object;
		nodeFrame.renderer = renderer;

		const updateNodes = nodeBuilder.updateNodes;

		if ( updateNodes.length > 0 ) {

			// force refresh material uniforms
			renderer.state.useProgram( null );

			//this.uniformsNeedUpdate = true;

			for ( const node of updateNodes ) {

				nodeFrame.updateNode( node );

			}

		}

	}

};
