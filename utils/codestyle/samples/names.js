
// GOOD

var camelCaseIsGood = 5;
var SentenceCaseConstants = "My Constant String";

function camelCaseFunctionsToo() {

	// ...

}

function MyClass() {

	// ...

}
MyClass.prototype = Object.create(SomeOtherClass.prototype);
MyClass.prototype.myClassMethod = function() {

	// ...

}


// BAD

var WrongCapFormat = 5;
var WRONG_CAP_FORMAT = 10;
var wrong_cap_format = 15;

function FUNCS_SHOULD_BE_CAMEL() {
	// ...

}

function CLASSES_SHOULD_BE_SENTENCE() {

}
CLASSES_SHOULD_BE_SENTENCE.prototype.MethodsShouldBeCamel = function() {

	// ...

}


