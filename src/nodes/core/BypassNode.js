import Node, { registerNodeClass } from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

class BypassNode extends Node {

	constructor( returnNode, callNode ) {

		super();

		this.isBypassNode = true;

		this.outputNode = returnNode;
		this.callNode = callNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addLineFlowCode( snippet );

		}

		return this.outputNode.build( builder );

	}

}

export default BypassNode;

registerNodeClass( 'Bypass', BypassNode );

export const bypass = nodeProxy( BypassNode );

addMethodChaining( 'bypass', bypass );
