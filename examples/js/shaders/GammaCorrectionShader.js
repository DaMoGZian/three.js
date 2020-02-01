/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

THREE.GammaCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: /* glsl */`
		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}
	`,

	fragmentShader: /* glsl */`
		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );

			gl_FragColor = LinearTosRGB( tex ); // optional: LinearToGamma( tex, float( GAMMA_FACTOR ) );

		}
	`
};
