( function () {

	var ReflectorRTT = function ( geometry, options ) {

		THREE.Reflector.call( this, geometry, options );
		this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

	};

	ReflectorRTT.prototype = Object.create( THREE.Reflector.prototype );

	THREE.ReflectorRTT = ReflectorRTT;

} )();
