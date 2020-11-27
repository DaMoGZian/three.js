/**
 * Text = 3D Text
 *
 * parameters = {
 *  font: <THREE.Font>, // font
 *
 *  size: <float>, // size of the text
 *  height: <float>, // thickness to extrude text
 *  curveSegments: <int>, // number of points on the curves
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into text bevel goes
 *  bevelSize: <float>, // how far from text outline (including bevelOffset) is bevel
 *  bevelOffset: <float> // how far from text outline does bevel start
 * }
 */

import { BufferGeometry } from '../core/BufferGeometry.js';
import { ExtrudeBufferGeometry } from './ExtrudeBufferGeometry.js';

class TextBufferGeometry extends ExtrudeBufferGeometry {

	constructor( text, parameters ) {

		parameters = parameters || {};

		const font = parameters.font;

		if ( ! ( font && font.isFont ) ) {

			console.error( 'THREE.TextGeometry: font parameter is not an instance of THREE.Font.' );
			return new BufferGeometry();

		}

		const fontParameters = {

			letterSpacing: parameters.letterSpacing,

			fixedWidth: parameters.fixedWidth

		};

		const shapes = font.generateShapes( text, parameters.size, fontParameters );

		// translate parameters to ExtrudeGeometry API

		parameters.depth = parameters.height !== undefined ? parameters.height : 50;

		// defaults

		if ( parameters.bevelThickness === undefined ) parameters.bevelThickness = 10;
		if ( parameters.bevelSize === undefined ) parameters.bevelSize = 8;
		if ( parameters.bevelEnabled === undefined ) parameters.bevelEnabled = false;

		super( shapes, parameters );

		this.type = 'TextBufferGeometry';

	}

}


export { TextBufferGeometry };
