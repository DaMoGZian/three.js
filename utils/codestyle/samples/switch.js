
// GOOD

switch ( value ) {

	case 1 :

		// ...
		break;

	case 2 :

		// ...
		break;

	default :

		// ...
		// no break keyword on last default
		a + b;

}

// BAD

switch(value) {
	case 1:
		a + b;
		break;
	case 2  :
		a + c;
	default:
		a + d;
		break;
}

