
// GOOD

if ( test ) {

	// ...

}

while ( test ) {

	// ...

}

switch ( val ) {
	case 1 :
		break;
	default:
		doStuff();
}

for ( var i = 0; i < 10; i ++ ) {
	doStuff();
}

// BAD

if ( test ) {
	// ...
	doStuff();
}

while ( test ) {
	// ...
	doStuff();
}

switch ( val ) {
	case 1 :
		break;
	default:
		doStuff()
}

for ( var i = 0; i < 10; i ++ ) {
	// ...
	doStuff();
}


