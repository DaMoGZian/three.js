/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 */

THREE.Vector4 = function ( x, y, z, w ) {

	this.set(

		x || 0,
		y || 0,
		z || 0,
		w || 1

	);

};

THREE.Vector4.prototype = {

	set : function ( x, y, z, w ) {

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;

	},

	copy : function ( v ) {

		return this.set(

			v.x,
			v.y,
			v.z,
			v.w || 1.0

		);

	},

	clone : function () {

		return new THREE.Vector4( this.x, this.y, this.z, this.w );

	},


	add : function ( v1, v2 ) {

		this.x = v1.x + v2.x;
		this.y = v1.y + v2.y;
		this.z = v1.z + v2.z;
		this.w = v1.w + v2.w;

		return this;

	},

	addSelf : function ( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;

	},

	sub : function ( v1, v2 ) {

		this.x = v1.x - v2.x;
		this.y = v1.y - v2.y;
		this.z = v1.z - v2.z;
		this.w = v1.w - v2.w;

		return this;

	},

	subSelf : function ( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;

		return this;

	},

	multiplyScalar : function ( s ) {

		this.x *= s;
		this.y *= s;
		this.z *= s;
		this.w *= s;

		return this;

	},

	divideScalar : function ( s ) {

		if ( s ) {

			this.x /= s;
			this.y /= s;
			this.z /= s;
			this.w /= s;

		} else {

			this.set( 0, 0, 0, 1 );

		}

		return this;

	},


	negate : function() {

		return this.multiplyScalar( -1 );

	},

	dot : function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;

	},

	lengthSq : function () {

		return this.dot( this );

	},

	length : function () {

		return Math.sqrt( this.lengthSq() );

	},

	normalize : function () {

		return this.divideScalar( this.length() );

	},

	setLength : function ( l ) {

		return this.normalize().multiplyScalar( l );

	},


	lerpSelf : function ( v, alpha ) {

		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		this.w += (v.w - this.w) * alpha;

		return this;

	},
	
	constructor : THREE.Vector4

};
