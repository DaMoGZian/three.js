import { PlaneGeometry } from '../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../materials/ShaderMaterial.js';
import { Mesh } from '../objects/Mesh.js';

class CopyColorDepthMaterial extends ShaderMaterial {

	set map( v ) {

		this.uniforms.map.value = v;

	}

	set depthMap( v ) {

		this.uniforms.depthMap.value = v;

	}

	constructor() {

		super( {

			name: 'CopyColorDepthMaterial',

			uniforms: {

				'map': { value: null },
				'depthMap': { value: null }

			},

			vertexShader: /* glsl */`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = vec4( position.xy, 1.0, 1.0 );

				}

			`,

			fragmentShader: /* glsl */`

				uniform sampler2D map;
				uniform sampler2D depthMap;

				varying vec2 vUv;

				void main() {

					vec4 texel = texture2D( map, vUv );
					gl_FragColor.rgb = vec3( int( texel.r * 1000.0 ) % 2 );
					gl_FragColor.a = 1.0;

					gl_FragColor.rgb = texel.rgb;
					gl_FragDepth = texture2D( depthMap, vUv ).r;

					#include <tonemapping_fragment>
					#include <colorspace_fragment>

				}
			`

		} );

	}

}

export const transmissionMesh = new Mesh( new PlaneGeometry( 2, 2 ), new CopyColorDepthMaterial() );
