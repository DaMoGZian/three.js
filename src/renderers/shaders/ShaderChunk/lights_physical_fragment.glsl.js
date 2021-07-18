export default /* glsl */`
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );

vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

material.specularRoughness = max( roughnessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.
material.specularRoughness += geometryRoughness;
material.specularRoughness = min( material.specularRoughness, 1.0 );

#ifdef REFLECTIVITY

	#ifdef SPECULAR

		vec3 specularStrengthFactor = vec3( specularStrength );
		vec3 specularColorFactor = specular;

		#ifdef USE_SPECULARSTRENGTHMAP

			specularStrengthFactor *= texture2D( specularStrengthMap, vUv ).a;

		#endif

		#ifdef USE_SPECULARMAP

			specularColorFactor *= specularMapTexelToLinear( texture2D( specularMap, vUv ) ).rgb;

		#endif

		material.specularColorF90 = mix( specularStrengthFactor, vec3( 1.0 ), metalnessFactor );

	#else

		vec3 specularStrengthFactor = vec3( 1.0 );
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularColorF90 = vec3( 1.0 );

	#endif

	material.specularColor = mix( min( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ) * specularColorFactor, vec3( 1.0 ) ) * specularStrengthFactor, diffuseColor.rgb, metalnessFactor );

#else

	material.specularColor = mix( vec3( DEFAULT_SPECULAR_COEFFICIENT ), diffuseColor.rgb, metalnessFactor );
	material.specularColorF90 = vec3( 1.0 );

#endif

#ifdef CLEARCOAT

	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;

	#ifdef USE_CLEARCOATMAP

		material.clearcoat *= texture2D( clearcoatMap, vUv ).x;

	#endif

	#ifdef USE_CLEARCOAT_ROUGHNESSMAP

		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vUv ).y;

	#endif

	material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );

#endif

#ifdef USE_SHEEN

	material.sheenColor = sheen;

#endif
`;
