import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

export function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl.js$/.test( id ) === false ) return;

			code = new MagicString( code );

			code.replace( /\/\* glsl \*\/\`(.*?)\`/sg, function ( match, p1 ) {

				return JSON.stringify(
					p1
						.trim()
						.replace( /\r/g, '' )
						.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
						.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
						.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
				);

			} );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}

const builds = [
	{
		input: {
			'three.module.js': 'src/Three.WebGL.js',
			'three.webgpu.js': 'src/Three.WebGPU.js',
		},
		plugins: [
			glsl(),
			header()
		],
		output: [
			{
				format: 'esm',
				dir: 'build',
				minifyInternalExports: false,
				entryFileNames: '[name]',
				chunkFileNames: 'three.core.js'
			}
		]
	},
	{
		input: {
			'three.module.min.js': 'src/Three.WebGL.js',
			'three.webgpu.min.js': 'src/Three.WebGPU.js',
		},
		plugins: [
			glsl(),
			header(),
			terser()
		],
		output: [
			{
				format: 'esm',
				dir: 'build',
				entryFileNames: '[name]',
				chunkFileNames: 'three.core.min.js'
			}
		]
	},
	{
		input: 'src/Three.WebGL.js',
		plugins: [
			glsl(),
			header()
		],
		output: [
			{
				format: 'cjs',
				name: 'THREE',
				file: 'build/three.cjs',
				indent: '\t'
			}
		]
	},
];

export default ( args ) => args.configOnlyModule ? builds.slice( 0, 3 ) : builds;
