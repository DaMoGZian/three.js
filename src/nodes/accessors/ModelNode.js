import Object3DNode from './Object3DNode.js';
import { nodeImmutable } from '../tsl/TSLBase.js';
import { uniform } from '../core/UniformNode.js';

import { Matrix4 } from '../../math/Matrix4.js';
import { cameraViewMatrix } from './Camera.js';

class ModelNode extends Object3DNode {

	static get type() {

		return 'ModelNode';

	}

	constructor( scope ) {

		super( scope );

	}

	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

export default ModelNode;

export const modelDirection = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.DIRECTION );
export const modelWorldMatrix = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
export const modelPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.POSITION );
export const modelScale = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.SCALE );
export const modelViewPosition = /*@__PURE__*/ nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );
export const modelWorldMatrixInverse = /*@__PURE__*/ uniform( new Matrix4() ).onObjectUpdate( ( { object }, self ) => self.value.copy( object.matrixWorld ).invert() );
export const modelViewMatrix = /*@__PURE__*/ cameraViewMatrix.mul( modelWorldMatrix ).toVar( 'modelViewMatrix' );
