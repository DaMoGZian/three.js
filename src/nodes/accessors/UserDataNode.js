import { registerNode } from '../core/Node.js';
import ReferenceNode from './ReferenceNode.js';
import { nodeObject } from '../tsl/TSLBase.js';

class UserDataNode extends ReferenceNode {

	constructor( property, inputType, userData = null ) {

		super( property, inputType, userData );

		this.userData = userData;

	}

	update( frame ) {

		this.reference = this.userData !== null ? this.userData : frame.object.userData;

		super.update( frame );

	}

}

export default UserDataNode;

UserDataNode.type = /*#__PURE__*/ registerNode( 'UserData', UserDataNode );

export const userData = ( name, inputType, userData ) => nodeObject( new UserDataNode( name, inputType, userData ) );
