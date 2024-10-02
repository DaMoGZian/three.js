import { Vector2 } from 'three';
import { TempNode, nodeObject, Fn, uniformArray, select, float, NodeUpdateType, uv, dot, clamp, uniform, convertToTexture, smoothstep, bool, vec2, vec3, vec4, If, Loop, max, min, Break, abs } from 'three/tsl';

class FXAANode extends TempNode {

	static get type() {

		return 'FXAANode';

	}

	constructor( textureNode ) {

		super();

		this.textureNode = textureNode;

		this.updateBeforeType = NodeUpdateType.RENDER;

		this._invSize = uniform( new Vector2() );

	}

	updateBefore() {

		const map = this.textureNode.value;

		this._invSize.value.set( 1 / map.image.width, 1 / map.image.height );

	}

	setup() {

		const textureNode = this.textureNode.bias( - 100 );
		const uvNode = textureNode.uvNode || uv();

		const EDGE_STEP_COUNT = float( 6 );
		const EDGE_GUESS = float( 8.0 );
		const EDGE_STEPS = uniformArray( [ 1.0, 1.5, 2.0, 2.0, 2.0, 4.0 ] );

		const _ContrastThreshold = float( 0.0312 );
		const _RelativeThreshold = float( 0.063 );
		const _SubpixelBlending = float( 1.0 );

		const Sample = Fn( ( [ uv ] ) => {

			return textureNode.uv( uv );

		} );

		const SampleLuminance = Fn( ( [ uv ] ) => {

			return dot( Sample( uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		} );

		const SampleLuminanceOffset = Fn( ( [ texSize, uv, uOffset, vOffset ] ) => {

			const shiftedUv = uv.add( texSize.mul( vec2( uOffset, vOffset ) ) );
			return SampleLuminance( shiftedUv );

		} );

		const ShouldSkipPixel = Fn( ( [ highest, contrast ] ) => {

			const threshold = max( _ContrastThreshold, _RelativeThreshold.mul( highest ) );
			return contrast.lessThan( threshold );

		} );

		const DeterminePixelBlendFactor = Fn( ( [ lm, ln, le, ls, lw, lne, lnw, lse, lsw, contrast ] ) => {

			let f = float( 2.0 ).mul( ln.add( le ).add( ls ).add( lw ) );
			f.addAssign( lne.add( lnw ).add( lse ).add( lsw ) );
			f.mulAssign( 1.0 / 12.0 );
			f = abs( f.sub( lm ) );
			f = clamp( f.div( max( contrast, 0 ) ), 0.0, 1.0 );

			const blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor.mul( blendFactor ).mul( _SubpixelBlending );

		} );

		const DetermineEdge = ( texSize, lm, ln, le, ls, lw, lne, lnw, lse, lsw ) => {

			const horizontal =
				abs( ln.add( ls ).sub( lm.mul( 2.0 ) ) ).mul( 2.0 ).add(
					abs( lne.add( lse ).sub( le.mul( 2.0 ) ) ).add(
						abs( lnw.add( lsw ).sub( lw.mul( 2.0 ) ) )
					)
				);

			const vertical =
				abs( le.add( lw ).sub( lm.mul( 2.0 ) ) ).mul( 2.0 ).add(
					abs( lne.add( lnw ).sub( ln.mul( 2.0 ) ) ).add(
						abs( lse.add( lsw ).sub( ls.mul( 2.0 ) ) )
					)
				);

			const isHorizontal = horizontal.greaterThanEqual( vertical );

			const pLuminance = select( isHorizontal, ln, le );
			const nLuminance = select( isHorizontal, ls, lw );
			const pGradient = abs( pLuminance.sub( lm ) );
			const nGradient = abs( nLuminance.sub( lm ) );

			const pixelStep = select( isHorizontal, texSize.y, texSize.x ).toVar();
			const oppositeLuminance = float().toVar();
			const gradient = float().toVar();

			If( pGradient.lessThan( nGradient ), () => {

				pixelStep.assign( pixelStep.negate() );
				oppositeLuminance.assign( nLuminance );
				gradient.assign( nGradient );

			} ).Else( () => {

				oppositeLuminance.assign( pLuminance );
				gradient.assign( pGradient );

			} );

			return { isHorizontal, pixelStep, oppositeLuminance, gradient };

		};

		const DetermineEdgeBlendFactor = ( texSize, lm, edge, uv ) => {

			const { isHorizontal, pixelStep, oppositeLuminance, gradient } = edge;

			const uvEdge = uv.toVar();
			const edgeStep = vec2().toVar();
			If( isHorizontal, () => {

				uvEdge.y.addAssign( pixelStep.mul( 0.5 ) );
				edgeStep.assign( vec2( texSize.x, 0.0 ) );

			} ).Else( () => {

				uvEdge.x.addAssign( pixelStep.mul( 0.5 ) );
				edgeStep.assign( vec2( 0.0, texSize.y ) );

			} );

			const edgeLuminance = lm.add( oppositeLuminance ).mul( 0.5 );
			const gradientThreshold = gradient.mul( 0.25 );

			const puv = uvEdge.add( edgeStep.mul( EDGE_STEPS.element( 0 ) ) ).toVar();
			const pLuminanceDelta = SampleLuminance( puv ).sub( edgeLuminance ).toVar();
			const pAtEnd = abs( pLuminanceDelta ).greaterThanEqual( gradientThreshold ).toVar();

			Loop( { start: 1, end: EDGE_STEP_COUNT }, ( { i } ) => {

				If( pAtEnd, () => {

					Break();

				} );

				puv.addAssign( edgeStep.mul( EDGE_STEPS.element( i ) ) );
				pLuminanceDelta.assign( SampleLuminance( puv ).sub( edgeLuminance ) );
				pAtEnd.assign( abs( pLuminanceDelta ).greaterThanEqual( gradientThreshold ) );

			} );

			If( pAtEnd.not(), () => {

				puv.addAssign( edgeStep.mul( EDGE_GUESS ) );

			} );

			const nuv = uvEdge.sub( edgeStep.mul( EDGE_STEPS.element( 0 ) ) ).toVar();
			const nLuminanceDelta = SampleLuminance( nuv ).sub( edgeLuminance ).toVar();
			const nAtEnd = abs( nLuminanceDelta ).greaterThanEqual( gradientThreshold ).toVar();

			Loop( { start: 1, end: EDGE_STEP_COUNT }, ( { i } ) => {

				If( nAtEnd, () => {

					Break();

				} );

				nuv.subAssign( edgeStep.mul( EDGE_STEPS.element( i ) ) );
				nLuminanceDelta.assign( SampleLuminance( nuv ).sub( edgeLuminance ) );
				nAtEnd.assign( abs( nLuminanceDelta ).greaterThanEqual( gradientThreshold ) );

			} );

			If( nAtEnd.not(), () => {

				nuv.subAssign( edgeStep.mul( EDGE_GUESS ) );

			} );

			const pDistance = float().toVar();
			const nDistance = float().toVar();

			If( isHorizontal, () => {

				pDistance.assign( puv.x.sub( uv.x ) );
				nDistance.assign( uv.x.sub( nuv.x ) );

			} ).Else( () => {

				pDistance.assign( puv.y.sub( uv.y ) );
				nDistance.assign( uv.y.sub( nuv.y ) );

			} );

			const shortestDistance = float().toVar();
			const deltaSign = bool().toVar();

			If( pDistance.lessThanEqual( nDistance ), () => {

				shortestDistance.assign( pDistance );
				deltaSign.assign( pLuminanceDelta.greaterThanEqual( 0.0 ) );

			} ).Else( () => {

				shortestDistance.assign( nDistance );
				deltaSign.assign( nLuminanceDelta.greaterThanEqual( 0.0 ) );

			} );

			const blendFactor = float().toVar();

			If( deltaSign.equal( lm.sub( edgeLuminance ).greaterThanEqual( 0.0 ) ), () => {

				blendFactor.assign( 0.0 );

			} ).Else( () => {

				blendFactor.assign( float( 0.5 ).sub( shortestDistance.div( pDistance.add( nDistance ) ) ) );

			} );

			return blendFactor;

		};

		const ApplyFXAA = Fn( ( [ uv, texSize ] ) => {

			const lm = SampleLuminance( uv );

			const ln = SampleLuminanceOffset( texSize, uv, 0.0, 1.0 );
			const le = SampleLuminanceOffset( texSize, uv, 1.0, 0.0 );
			const ls = SampleLuminanceOffset( texSize, uv, 0.0, - 1.0 );
			const lw = SampleLuminanceOffset( texSize, uv, - 1.0, 0.0 );

			const lne = SampleLuminanceOffset( texSize, uv, 1.0, 1.0 );
			const lnw = SampleLuminanceOffset( texSize, uv, - 1.0, 1.0 );
			const lse = SampleLuminanceOffset( texSize, uv, 1.0, - 1.0 );
			const lsw = SampleLuminanceOffset( texSize, uv, - 1.0, - 1.0 );

			const highest = max( max( max( max( ln, le ), ls ), lw ), lm );
			const lowest = min( min( min( min( ln, le ), ls ), lw ), lm );
			const contrast = highest.sub( lowest );

			If( ShouldSkipPixel( highest, contrast ), () => {

				return Sample( uv );

			} );

			const pixelBlend = DeterminePixelBlendFactor( lm, ln, le, ls, lw, lne, lnw, lse, lsw, contrast );
			const edge = DetermineEdge( texSize, lm, ln, le, ls, lw, lne, lnw, lse, lsw ); // { isHorizontal, pixelStep, oppositeLuminance, gradient };
			const edgeBlend = DetermineEdgeBlendFactor( texSize, lm, edge, uv );

			const finalBlend = max( pixelBlend, edgeBlend );
			const fxaaUv = uv.toVar();

			If( edge.isHorizontal, () => {

				fxaaUv.y.addAssign( edge.pixelStep.mul( finalBlend ) );

			} ).Else( () => {

				fxaaUv.x.addAssign( edge.pixelStep.mul( finalBlend ) );

			} );

			return Sample( fxaaUv );

		} ).setLayout( {
			name: 'FxaaPixelShader',
			type: 'vec4',
			inputs: [
				{ name: 'uv', type: 'vec2' },
				{ name: 'texSize', type: 'vec2' },
			]
		} );

		const fxaa = Fn( () => {

			return ApplyFXAA( uvNode, this._invSize );

		} );

		const outputNode = fxaa();

		return outputNode;

	}

}

export default FXAANode;

export const fxaa = ( node ) => nodeObject( new FXAANode( convertToTexture( node ) ) );
