import Object3DNode from './Object3DNode.js';
import UniformNode from '../core/UniformNode.js';

class CameraNode extends Object3DNode {

	static PROJECTION_MATRIX = 'projectionMatrix';

	constructor( scope = CameraNode.POSITION ) {

		super( scope );

		this._uniformNode = null;

	}

	getNodeType( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			return 'mat4';

		}

		return super.getNodeType( builder );

	}

	update( frame ) {

		const camera = frame.camera;
		const uniformNode = this._uniformNode;
		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			uniformNode.value = camera.projectionMatrix;

		} else if ( scope === CameraNode.VIEW_MATRIX ) {

			uniformNode.value = camera.matrixWorldInverse;

		} else {

			super.update( frame );

		}

	}

	generate( builder ) {

		const scope = this.scope;

		if ( scope === CameraNode.PROJECTION_MATRIX ) {

			this._uniformNode = new UniformNode( null, 'mat4' );

		}

		return super.generate( builder );

	}

}

export default CameraNode;
