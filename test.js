function MinWindowSubstring(strArr) {

  let minSubstringLength = Number.MAX_SAFE_INTEGER;
  let minSubstring = "";

  const stringToSearch = strArr[0];
  const substring = strArr[1];

  const numChars = substring.length;
  const characterCountsNeeded = {};
  for (var x = 0; x < substring.length; x++) {
    const char = substring[x];
    if (typeof characterCountsNeeded[char] === "undefined") {
      characterCountsNeeded[char] = 1;
    } else {
      characterCountsNeeded[char]++;
    }
  }

  // two pointers
  // search right pointer ahead until we have found all the characters we need
  // then increment left pointer until we have exactly the characters we need
  let leftPointer = 0;
  let rightPointer = 0;

  const charNeededCopy = {...characterCountsNeeded};
  const charsFoundCounts = {};

  for (const [key, value] of Object.entries(charNeededCopy)) {
    charsFoundCounts[key] = 0;
  }

  let charsFound = 0;

  console.log("numChars " + numChars);
  console.log(characterCountsNeeded);

  while (rightPointer < stringToSearch.length) {
    // while charNeededCopy is not all 0
    // numChars is just a fast way of proving that charNeededCopy counts have all reached 0
    // increment right pointer
    while (charsFound < numChars && rightPointer < stringToSearch.length) {

      console.log("increment right");
      console.log(charsFoundCounts);
      console.log(charsFound);

      const char = stringToSearch[rightPointer];

      if (typeof charsFoundCounts[char] !== "undefined") {
        charsFoundCounts[char]++;

        // check that we don't count extra chars
        if (charsFoundCounts[char] <= characterCountsNeeded[char]) {
          charsFound++;
        }
      }

      /*
      if (typeof charNeededCopy[char] !== "undefined") {
        charsFoundCounts[char]++;

        if (charNeededCopy[char] > 0) {
          charNeededCopy[char]--;
          charsFound++;
        }
      }
      */

      rightPointer++;
    }

    // now increment left pointer until we have less of the chars that we need
    // this will produce the minimum substring in this window
    while (charsFound === numChars) {
      const char = stringToSearch[leftPointer];

      console.log("increment left ");
      console.log(charsFoundCounts);

      if (typeof charsFoundCounts[char] !== "undefined") {
        charsFoundCounts[char]--;
        if (charsFoundCounts[char] < characterCountsNeeded[char]) {
          charsFound--;
        }
      }

      //if (typeof charNeededCopy[char] !== "undefined") {
      //  charNeededCopy[char]++;
      //  charsFound--;
      //}

      leftPointer++;
    }

    // record this possible solution, if it's the current best (shortest)
    const currSubstring = stringToSearch.substring(leftPointer - 1, rightPointer);
    if (minSubstringLength > currSubstring.length) {
      minSubstring = currSubstring;
      minSubstringLength = currSubstring.length;

      console.log("Candidate minsubstring " + minSubstring);
    }

    // now once we have passed a character that we need, we start moving right again until
    // we find the chars we need again
  }

  return minSubstring;
}

MinWindowSubstring(["ahffaksfajeeubsne", "jefaa"]);




var test = { value: "1234", func: function() { console.log(this.value); } }
window.value = "5678"
test.func()
//Output : 1234
var globalFunc = test.func
globalFunc()
//Output: 5678

// closure pitfall
function createFuncs() {
    var values = [1,2,3,4];
    var funcs = [];
    for (var x = 0; x < values.length; x++) {
      (function () {
        var item = values[x];
        funcs.push(function () {
          console.log(item);
        });
      })();
    }

    return funcs;
}

var funcs = createFuncs();
funcs[0]();
funcs[1]();
funcs[2]();
funcs[3]();


const object1 = {
  a: 'somestring',
  b: 42,
  c: function (){ }
};

const object2 = function () {
  this.prop2 = "obj2 prop";
}

object2.prototype = object1;

var obj2 = new object2();

// ES6
// does not include properties from the prototype chain
console.log("ES6 does not include properties from the prototype chain");
for (const [key, value] of Object.entries(obj2 )) {
  console.log(key  + ": " + value)
}

// pre ES6
// does not include properties from the prototype chain
console.log("Pre-ES6 does not include properties from the prototype chain");
for (var key in obj2 ) {
  if (!obj2.hasOwnProperty(key)) {
    continue;
  }

  console.log("key: " + key + " value: " + obj2[key]);
}

// does include properties from the prototype chain
console.log("Does include properties from the prototype chain");
for (var key in obj2 ) {
  console.log("key: " + key + " value: " + obj2[key]);
}



// iterating over arrays

const arr = [1,2,3,4];

console.log("traditional for loop");
for (let x = 0; x < arr.length; x++) {
  console.log(arr[x]);
}

console.log("for of");
for (const val of arr) {
  console.log(val);
}

console.log("array.forEach");
arr.forEach((item, ind) => {
  console.log("item: " + item + " ind: " + ind);
});

testFunc();

function testFunc() {
  console.log("testFunc");
}

function testParent() {
  var testVal = 1234;
  testFunc();

  function testFunc() {
    console.log(testVal);
  }

  testVal = 4567;
  testFunc();
}

testParent();

var counter = 0;
var test = function () {
  if (counter === 5) {
    return;
  }

  console.log("anon");

  counter++;

  return test();
};
test();

var testVal = 1234;
var test1Val = testVal;
var test1 = function () {
  console.log("test1 " + test1Val);
};

testVal = 5678;
var test2 = function () {
  console.log("test2 " + testVal);
}

test1();
test2();




// Messing with prototypes
function Human(name, age){
	this.name = name,
	this.age = age,
	this.friends = ["Jadeja", "Vijay"]
}
//Define the shared properties and methods using the prototype
Human.prototype.sayName = function(){
	console.log(this.name);
}
//Create two objects using the Human constructor function
var person1 = new Human("Virat", 31);
var person2 = new Human("Sachin", 40);

//Let's modify friends property and check
person1.friends.push("Amit");

person1.sayName();
person2.sayName();

Human.prototype.sayName = function () {
  console.log("Redefined say name");
};

person1.sayName();
person2.sayName();

var obj1 = {
  name: 1234
};

var obj2 = {
  name: 1234
};

obj2 === obj1

for (var x = -1; x < 0; x++) {
  var y = x;
}

console.log(y);

// destructuring
const test = [10, 20, 30, 40, 50];
[a, b] = test;
const [a, b] = test;

const test = [10, 20, 30, 40, 50];
const [a, b, ...rest] = test;

// ES6 template literals
const test = "templateVar";
const result = `this is a ${test}`;
console.log(result);

// Currying
function test(...args) {
  console.log(args);
}

test(1,2,3,4);

// spread operator
var obj1 = { "1": 1, "2": 2 };
var obj2 = { ...obj1, "3": 3};

// impot/export WebPack
// external.js
export const testFunc = () => {

};

export const testFunc2 = () => {

};

// app.js
import * as external from './external';

external.testFunc();
external.testFunc2();

// variant of above

import { testFunc } from './external';
testFunc();




// named import/export WebPack
// external.js
const testFunc = () => {

}

// overrides and previous export defaults
export default testFunc;

// app.js
import newName from './external';
newName();

class Parent {
  constructor(test) {
    console.log("Parent constructor " + test);
  }

  parentState = "theParentState"
}

class Child extends Parent {
  constructor(test) {
    super(test);

    console.log("Child Constructor: " + test);
  }

  state = {
    "test": "test"
  }

  logState() {
    console.log("logState " + this.state.test + " parent state " + this.parentState);
  }

  static logStateStatic() {
    console.log("Log state static");
  }
}

const child2 = new Child("constr param");
child2.state.test = "test2";
child2.logState();

Child.logStateStatic();


// Promises

console.log("start promise");
const myPromise = (new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(666);
    }, 5000);
  }))
  .then((result) => {
    console.log("promise finished " + result);
  });
