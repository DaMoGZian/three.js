/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Color } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeUtils } from '../core/NodeUtils.js';
import { NodeLib } from '../core/NodeLib.js';

export class ColorNode extends InputNode {

	constructor( color, g, b ) {

		super( 'c' );

		this.value = color instanceof Color ? color : new Color( color || 0, g, b );

		this.nodeType = "Color";

	}

	generateConst( builder, output, uuid, type ) {

		return builder.format( "vec3( " + this.r + ", " + this.g + ", " + this.b + " )", type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value.copy( source );

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.r = this.r;
			data.g = this.g;
			data.b = this.b;

			if ( this.constant === true ) data.constant = true;

		}

		return data;

	}
	
}

NodeUtils.addShortcuts( ColorNode.prototype, 'value', [ 'r', 'g', 'b' ] );

NodeLib.addResolver( ( value ) => {

	if ( typeof value === 'string' ) {

		if ( value.substr( 0, 1 ) === '#' ) {

			return new ColorNode( parseInt( value.substr( 1 ) ) ).setConst( true );

		} else if ( value.substr( 0, 2 ) === '0x' ) {

			return new ColorNode( parseInt( value ) ).setConst( true );

		}

	}

} );
