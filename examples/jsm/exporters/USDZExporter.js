import * as fflate from '../libs/fflate.module.js';

class USDZExporter {

	async parse( scene ) {

		const files = {};
		const modelFileName = 'model.usda';

		// model file should be first in USDZ archive so we init it here
		files[ modelFileName ] = null;

		let output = buildHeader();

		const materials = {};
		const textures = {};

		scene.traverseVisible( ( object ) => {

			if ( object.isMesh && object.material.isMeshStandardMaterial ) {

				const geometry = object.geometry;
				const material = object.material;

				const geometryFileName = 'geometries/Geometry_' + geometry.id + '.usd';

				if ( ! ( geometryFileName in files ) ) {

					const meshObject = buildMeshObject( geometry );
					files[ geometryFileName ] = buildUSDFileAsString( meshObject );

				}

				if ( ! ( material.uuid in materials ) ) {

					materials[ material.uuid ] = material;
					if ( material.map !== null ) textures[ material.map.uuid ] = material.map;
					if ( material.normalMap !== null ) textures[ material.normalMap.uuid ] = material.normalMap;
					if ( material.aoMap !== null ) textures[ material.aoMap.uuid ] = material.aoMap;
					if ( material.roughnessMap !== null ) textures[ material.roughnessMap.uuid ] = material.roughnessMap;
					if ( material.metalnessMap !== null ) textures[ material.metalnessMap.uuid ] = material.metalnessMap;
					if ( material.emissiveMap !== null ) textures[ material.emissiveMap.uuid ] = material.emissiveMap;

				}


				const referencedMesh = `prepend references = @./${ geometryFileName }@</Geometry>`;
				const referencedMaterial = `rel material:binding = </Materials/Material_${ material.id }>`;
				output += buildXform( object, referencedMesh, referencedMaterial );

			}

		} );

		output += buildMaterials( materials );
		//output += buildTextures( textures );

		files[ modelFileName ] = fflate.strToU8( output );
		output = null;

		for ( const uuid in textures ) {

			const texture = textures[ uuid ];
			files[ 'textures/Texture_' + texture.id + '.jpg' ] = await imgToU8( texture.image );

		}

		// 64 byte alignment
		// https://github.com/101arrowz/fflate/issues/39#issuecomment-777263109

		let offset = 0;

		for ( const filename in files ) {

			const file = files[ filename ];
			const headerSize = 34 + filename.length;

			offset += headerSize;

			const offsetMod64 = offset & 63;

			if ( offsetMod64 !== 4 ) {

				const padLength = 64 - offsetMod64;
				const padding = new Uint8Array( padLength );

				files[ filename ] = [ file, { extra: { 12345: padding } } ];

			}

			offset = file.length;

		}

		return fflate.zipSync( files, { level: 0 } );

	}

}

async function imgToU8( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		const scale = 1024 / Math.max( image.width, image.height );

		const canvas = document.createElement( 'canvas' );
		canvas.width = image.width * Math.min( 1, scale );
		canvas.height = image.height * Math.min( 1, scale );

		const context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0, canvas.width, canvas.height );

		const blob = await new Promise( resolve => canvas.toBlob( resolve, 'image/jpeg', 1 ) );
		return new Uint8Array( await blob.arrayBuffer() );

	}

}

//

const PRECISION = 7;

function buildHeader() {

	return `#usda 1.0
(
    customLayerData = {
        string creator = "Three.js USDZExporter"
    }
    metersPerUnit = 1
    upAxis = "Y"
)

`;

}

function buildUSDFileAsString( dataToInsert ) {

	let output = buildHeader();
	output += dataToInsert;
	return fflate.strToU8( output );

}

// Xform

function buildXform( object, referencedMesh, referencedMaterial ) {

	const name = 'Object_' + object.id;
	const transform = buildMatrix( object.matrixWorld );

	return `def Xform "${ name }"
(
	${ referencedMesh }
)
{
    matrix4d xformOp:transform = ${ transform }
    uniform token[] xformOpOrder = ["xformOp:transform"]

    ${ referencedMaterial }
}

`;

}

function buildMatrix( matrix ) {

	const array = matrix.elements;

	return `( ${ buildMatrixRow( array, 0 ) }, ${ buildMatrixRow( array, 4 ) }, ${ buildMatrixRow( array, 8 ) }, ${ buildMatrixRow( array, 12 ) } )`;

}

function buildMatrixRow( array, offset ) {

	return `(${ array[ offset + 0 ] }, ${ array[ offset + 1 ] }, ${ array[ offset + 2 ] }, ${ array[ offset + 3 ] })`;

}

// Mesh

function buildMeshObject( geometry ) {

	const mesh = buildMesh( geometry );
	return `
def "Geometry"
{
	${mesh}
}
`;

}

function buildMesh( geometry ) {

	const name = 'Geometry';
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	if ( 'uv2' in attributes ) {

		console.warn( 'THREE.USDZExporter: uv2 not supported yet.' );

	}

	return `
	def Mesh "${ name }"
    {
        int[] faceVertexCounts = [${ buildMeshVertexCount( geometry ) }]
        int[] faceVertexIndices = [${ buildMeshVertexIndices( geometry ) }]
        normal3f[] normals = [${ buildVector3Array( attributes.normal, count )}] (
            interpolation = "vertex"
        )
        point3f[] points = [${ buildVector3Array( attributes.position, count )}]
        float2[] primvars:st = [${ buildVector2Array( attributes.uv, count )}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
    }
`;

}

function buildMeshVertexCount( geometry ) {

	const count = geometry.index !== null ? geometry.index.array.length : geometry.attributes.position.count;

	return Array( count / 3 ).fill( 3 ).join( ', ' );

}

function buildMeshVertexIndices( geometry ) {

	if ( geometry.index !== null ) {

		return geometry.index.array.join( ', ' );

	}

	const array = [];
	const length = geometry.attributes.position.count;

	for ( let i = 0; i < length; i ++ ) {

		array.push( i );

	}

	return array.join( ', ' );

}

function buildVector3Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: Normals missing.' );
		return Array( count ).fill( '(0, 0, 0)' ).join( ', ' );

	}

	const array = [];
	const data = attribute.array;

	for ( let i = 0; i < data.length; i += 3 ) {

		array.push( `(${ data[ i + 0 ].toPrecision( PRECISION ) }, ${ data[ i + 1 ].toPrecision( PRECISION ) }, ${ data[ i + 2 ].toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

function buildVector2Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: UVs missing.' );
		return Array( count ).fill( '(0, 0)' ).join( ', ' );

	}

	const array = [];
	const data = attribute.array;

	for ( let i = 0; i < data.length; i += 2 ) {

		array.push( `(${ data[ i + 0 ].toPrecision( PRECISION ) }, ${ 1 - data[ i + 1 ].toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

// Materials

function buildMaterials( materials ) {

	const array = [];

	for ( const uuid in materials ) {

		const material = materials[ uuid ];

		array.push( buildMaterial( material ) );

	}

	return `def "Materials"
{
${ array.join( '' ) }
}

`;

}

function buildMaterial( material ) {

	// https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

	const pad = '            ';
	const parameters = [];

	const texturesTransforms = [];
	const textures = [];
	let texture;

	function prepareTextureTransform(texture, mapType) {
		return `
		def Shader "Transform2D_${ mapType }" (
			sdrMetadata = {
				string role = "math"
			}
		)
		{
			uniform token info:id = "UsdTransform2d"
			float2 inputs:in.connect = </Materials/Material_${ material.id }/uvReader_st.outputs:result>
			float2 inputs:scale = (${ texture.repeat.x },${ texture.repeat.y })
			float2 inputs:translation = (${ texture.offset.x },${ texture.offset.y })
			float2 outputs:result
		}
		`;
	}



	if ( material.map !== null ) {

		parameters.push( `${ pad }color3f inputs:diffuseColor.connect = </Materials/Material_${ material.id }/Texture_${ material.map.id }.outputs:rgb>` );

		texture = material.map;
		texturesTransforms.push(prepareTextureTransform(texture, "diffuse"));
		textures.push(`

		def Shader "Texture_${ texture.id }"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2D_diffuse.outputs:result>
			float4 inputs:scale = (1, 1, 1, 1)
			float4 inputs:bias = (${material.color.r}, ${material.color.g}, ${material.color.b}, 0)
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float3 outputs:rgb
		}
		
		`);

	} else {

		parameters.push( `${ pad }color3f inputs:diffuseColor = ${ buildColor( material.color ) }` );

	}

	if ( material.emissiveMap !== null ) {

		parameters.push( `${ pad }color3f inputs:emissiveColor.connect = </Materials/Material_${ material.id }/Texture_${ material.emissiveMap.id }.outputs:rgb>` );

		texture = material.emissiveMap;
		texturesTransforms.push(prepareTextureTransform(texture, "emissive"));
		textures.push(`

		def Shader "Texture_${ texture.id }"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2D_emissive.outputs:result>
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
		}
		
		`);

	} else if ( material.emissive.getHex() > 0 ) {

		parameters.push( `${ pad }color3f inputs:emissiveColor = ${ buildColor( material.emissive ) }` );

	}

	if ( material.normalMap !== null ) {

		parameters.push( `${ pad }normal3f inputs:normal.connect = </Materials/Material_${ material.id }/Texture_${ material.normalMap.id }.outputs:rgb>` );

		texture = material.normalMap;
		texturesTransforms.push(prepareTextureTransform(texture, "normal"));
		textures.push(`

		def Shader "Texture_${ texture.id }"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2D_normal.outputs:result>
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float4 inputs:scale = (${material.normalScale.x}, ${material.normalScale.x}, ${material.normalScale.x}, 1.0)
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
		}
		
		`);

	}

	if ( material.aoMap !== null ) {

		parameters.push( `${ pad }float inputs:occlusion.connect = </Materials/Material_${ material.id }/Texture_${ material.aoMap.id }.outputs:r>` );

		texture = material.aoMap;
		textures.push(`

		def Shader "Texture_${ texture.id }"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st = (0,0)
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
		}
		
		`);
	}

	if ( material.roughnessMap !== null ) {

		parameters.push( `${ pad }float inputs:roughness.connect = </Materials/Material_${ material.id }/Texture_${ material.roughnessMap.id }_roughness.outputs:g>` );

		texture = material.roughnessMap;
		texturesTransforms.push(prepareTextureTransform(texture, "roughness"));
		textures.push(`

		def Shader "Texture_${ texture.id }_roughness"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2D_roughness.outputs:result>
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
		}
		
		`);

	} else {

		parameters.push( `${ pad }float inputs:roughness = ${ material.roughness }` );

	}

	if ( material.metalnessMap !== null ) {

		parameters.push( `${ pad }float inputs:metallic.connect = </Materials/Material_${ material.id }/Texture_${ material.metalnessMap.id }_metalness.outputs:b>` );

		texture = material.metalnessMap;
		texturesTransforms.push(prepareTextureTransform(texture, "metallic"));
		textures.push(`

		def Shader "Texture_${ texture.id }_metalness"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ texture.id }.jpg@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2D_metallic.outputs:result>
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
		}
		
		`);

	} else {

		parameters.push( `${ pad }float inputs:metallic = ${ material.metalness }` );

	}

	parameters.push( `${ pad }float inputs:opacity = ${ material.opacity }` );

	return `
    def Material "Material_${ material.id }"
    {
		
		def Shader "PreviewSurface"
        {
			uniform token info:id = "UsdPreviewSurface"
${ parameters.join( '\n' ) }
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }

		token outputs:surface.connect = </Materials/Material_${ material.id }/PreviewSurface.outputs:surface>

		token inputs:frame:stPrimvarName = "st"
	
		def Shader "uvReader_st"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			token inputs:varname.connect = </Materials/Material_${ material.id }.inputs:frame:stPrimvarName>
			float2 inputs:fallback = (0.0, 0.0)
			float2 outputs:result
		}
		
		${ texturesTransforms.join( '\n' ) }
		${ textures.join( '\n' ) }
    }
`;

}

function buildTextures( textures ) {

	const array = [];

	for ( const uuid in textures ) {

		const texture = textures[ uuid ];

		array.push( buildTexture( texture ) );

	}

	return `def "Textures"
{

	token inputs:frame:stPrimvarName = "st"
	
	def Shader "uvReader_st"
	{
		uniform token info:id = "UsdPrimvarReader_float2"
		token inputs:varname.connect = </Textures.inputs:frame:stPrimvarName>
		float2 inputs:fallback = (0.0, 0.0)
		float2 outputs:result
	}

	${ array.join( '' ) }
}

`;

}

function buildTexture( texture ) {

	return `
	
	
	def Shader "Transform2D_${ texture.id }" (
		sdrMetadata = {
			string role = "math"
		}
	)
	{
		uniform token info:id = "UsdTransform2d"
		float2 inputs:in.connect = </Textures/uvReader_st.outputs:result>
		float2 inputs:scale = (${ texture.repeat.x },${ texture.repeat.y })
		float2 inputs:translation = (${ texture.offset.x },${ texture.offset.y })
		float2 outputs:result
	}
		
		
	def Shader "Texture_${ texture.id }"
	{
		uniform token info:id = "UsdUVTexture"
		asset inputs:file = @textures/Texture_${ texture.id }.jpg@
		float2 inputs:st.connect = </Textures/Transform2D_${ texture.id }.outputs:result>
		token inputs:wrapS = "repeat"
		token inputs:wrapT = "repeat"
		float4 inputs:bias = (0.1,0.1,0.1,0)
		float outputs:r
        float outputs:g
        float outputs:b
        float3 outputs:rgb
    }
`;

}

function buildColor( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b })`;

}

export { USDZExporter };
