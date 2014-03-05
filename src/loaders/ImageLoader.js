/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function ( manager, registry ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.registry = ( registry !== undefined ) ? registry : THREE.DefaultImageRegistry;

};

THREE.ImageLoader.prototype = {

	constructor: THREE.ImageLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;
		var image = document.createElement( 'img' );

		if ( onLoad !== undefined ) {

			image.addEventListener( 'load', function ( event ) {

				scope.manager.itemEnd( url );
				onLoad( this );

			}, false );

		}

		if ( onProgress !== undefined ) {

			image.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		if ( onError !== undefined ) {

			image.addEventListener( 'error', function ( event ) {

				onError( event );

			}, false );

		}

		if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		image.src = this.registry.get( url );

		scope.manager.itemStart( url );

		return image;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

}
