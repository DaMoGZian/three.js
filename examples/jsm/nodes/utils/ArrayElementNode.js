import Node, { addNodeClass } from '../core/Node.js';

class ArrayElementNode extends Node { // @TODO: If extending from TempNode it breaks webgpu_compute

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		if ( this.node.isStorageBufferNode && ! builder.isAvailable( 'storageBuffer' ) ) {

			if ( ! this.node.instanceIndex ) {

				builder.setupPBONode( this.node );

			}


		}

		super.setup( builder );


	}

	generate( builder, output ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		let snippet = `${nodeSnippet}[ ${indexSnippet} ]`;

		if ( this.node.isStorageBufferNode && ! builder.isAvailable( 'storageBuffer' ) ) {

			snippet = nodeSnippet;

			if ( ! this.node.instanceIndex && output !== 'assign' ) {

				snippet = builder.getPBOUniform( this.node, indexSnippet );
				return snippet;

			}

		}

		return snippet;

	}

}

export default ArrayElementNode;

addNodeClass( 'ArrayElementNode', ArrayElementNode );
