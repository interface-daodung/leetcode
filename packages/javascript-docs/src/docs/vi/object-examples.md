# Ví dụ mã đối tượng

Cú pháp và ví dụ mã cho các phương thức đối tượng phổ biến nhất

<div id="back-to-top"></div>

## Mục lục

1. [Phương thức đối tượng phổ biến](#common-object-methods)
   1. [Object keys](#object-keys)
   1. [Object values](#object-values)
   1. [hasOwnProperty](#hasOwnProperty)
   1. [prototype](#prototype)
   1. [instanceof](#instanceof)
   1. [isPrototypeOf](#isprototypeof)
   1. [Object create](#object-create)
   1. [Object entries](#object-entries)
1. [kế thừa](#inheritance)
1. [vòng lặp for in](#for-in-loop)
1. [Sửa đổi giá trị và xóa khóa](#modify-values-and-remove-keys)
1. [Lớp](#classes)
   1. [phiên bản prototype](#prototype-version)
   1. [Phiên bản Lớp ES6](#es6-class-version)
   1. [Chủ đề liên quan](#related-topics)
1. [Destructuring đối tượng](#destructuring-an-object)
1. [Toán tử Spread](#spread-operator)
1. [Linh tinh](#miscellaneous)
1. [Bảng cú pháp](#syntax-tables)
1. [Ghi chú](#notes)

## Phương thức đối tượng phổ biến

Dưới đây là các phương thức và thuộc tính đối tượng phổ biến nhất. Tôi đã bỏ qua:

- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign): sao chép tất cả các thuộc tính riêng có thể liệt kê từ một hoặc nhiều đối tượng nguồn tới một đối tượng đích. Nó trả về đối tượng đích đã được sửa đổi
- [Object.defineProperties()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties): định nghĩa mới hoặc sửa đổi các thuộc tính hiện có trực tiếp trên một đối tượng, trả về đối tượng
- [Object.defineProperty()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty): định nghĩa một thuộc tính mới trực tiếp trên một đối tượng, hoặc sửa đổi một thuộc tính hiện có trên một đối tượng, và trả về đối tượng
- [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze): đóng băng một đối tượng. Một đối tượng đã đóng băng không còn có thể thay đổi được nữa; việc đóng băng một đối tượng ngăn không cho thêm thuộc tính mới vào nó, ngăn xóa các thuộc tính hiện có, ngăn thay đổi tính có thể liệt kê, tính có thể cấu hình hoặc tính có thể ghi của các thuộc tính hiện có, và ngăn thay đổi giá trị của các thuộc tính hiện có. Ngoài ra, việc đóng băng một đối tượng cũng ngăn không cho prototype của nó bị thay đổi. `freeze()` trả về cùng một đối tượng đã được truyền vào.
- Và những phương thức này: `fromEntries()`, `getOwnPropertyDescriptor()`, `getOwnPropertyDescriptors()`, `getOwnPropertyNames()`, `getOwnPropertySymbols()`, `getPrototypeOf()`, `is()`,  `isExtensible()`, `isFrozen()`, `isSealed()`, `preventExtensions()`, `propertyIsEnumerable()`, `seal()`, `setPrototypeOf()`, `toLocaleString()`, `toString()`, và `valueOf()`. 

Xem [MDN Object docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) để biết thêm về các phương thức đó.

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Object keys

[MDN Object.keys docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys): Trả về một mảng tên các khóa được lặp theo cùng thứ tự mà một vòng lặp thông thường sẽ thực hiện.

```js
// syntax
Object.keys(obj)

// Example
const chordIntervals = {
  "Chord": "maj",
  "Intervals": ["1", "3", "5"],
  "steps": [0, 4, 7],
  "Equal Chords": [{"key": "", "name": ""}],
  "Chord Substitutes": [{"key": "", "name": ""}],
  "scales": {
    "Major Scale": ["1st", " 4th", " 5th"],
    "Minor Pentatonic": ["2nd"],
    "Blues Scale": ["2nd"],
    "Harmonic Minor": ["5th", "6th"],
    "Melodic Minor": ["4th", "5th"],
    "Whole Tone": [""],
    "Augmented": ["1st", "3rd", "5th"],
    "HW Diminished": ["1st", "3rd", "5th", "7th"],
    "Major Bebop": ["1st", "4th", "5th"],
    "Minor Bebop": ["3rd", "5th", "8th"]
  }
  }
console.log(Object.keys(chordIntervals)) // ["Chord","Intervals","steps","Equal Chords","Chord Substitutes","scales"]
console.log(Object.keys(chordIntervals.scales)) // ["Major Scale","Minor Pentatonic","Blues Scale","Harmonic Minor", ...]

// To check whether an object is empty or not
Object.keys(obj).length 
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Object values

[MDN Object.values docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values): Trả về một mảng các giá trị cho mỗi khóa/thuộc tính theo cùng thứ tự được cung cấp bởi vòng lặp `for...in`.

```js
// syntax
Object.values(obj)

// Examples:
const chordIntervals = {
    "Chord": "maj",
    "Intervals": ["1", "3", "5"],
    "steps": [0, 4, 7],
  }
console.log(Object.values(chordIntervals)) // ["maj", ["1","3","5"], [0,4,7]]
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### hasOwnProperty

[MDN hasOwnProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty): Trả về `true` nếu đối tượng có thuộc tính được chỉ định như là thuộc tính riêng của nó (trái ngược với việc kế thừa nó); ngược lại là `false`.

```js
// syntax
obj.hasOwnProperty(prop)	
// prop: The String name or Symbol of the property to test


// Example, RECORD COLLECTION 1:
function updateRecords(records, id, prop, value) {
  if (prop !== 'tracks' && value !== "") {
    records[id][prop] = value;
  } else if (prop === "tracks" && records[id].hasOwnProperty("tracks") === false) {
    records[id][prop] = [value];
  } else if (prop === "tracks" && value !== "") {
    records[id][prop].push(value);
  } else if (value === "") {
    delete records[id][prop];
  }
  return records;
}

// Example, RECORD COLLECTION 2:
function updateRecords(records, id, prop, value) {
  if (value === '') {
    delete records[id][prop];
  } else if (prop === 'tracks') {
    records[id][prop] = records[id][prop] || []; // this is called shortcircuit evaluation, see below for explanation
    records[id][prop].push(value);
  } else {
    records[id][prop] = value;
  }
  return records;
}
```

<br />

Thuộc tính riêng so với thuộc tính prototype:
```js
// own prop vs prototype prop
function YourClass(name) {
  this.name = name;           // own property
}
YourClass.prototype.prop = 2; // prototype property


let ownProps = [];
let prototypeProps = [];

for (let property in duck) {
  if(duck.hasOwnProperty(property)) {
    ownProps.push(property);
  } else {
    prototypeProps.push(property);
  }
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### prototype

[MDN prototype](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Object_prototypes): cơ chế mà qua đó các đối tượng JavaScript kế thừa các tính năng từ nhau.

```js
// prototype chain properties:
__defineGetter__
__defineSetter__
__lookupGetter__
__lookupSetter__
__proto__
constructor
obj.hasOwnProperty
obj.isPrototypeOf
obj.propertyIsEnumerable
obj.toLocaleString
obj.toString
obj.toValueOf
```

**constructor**: thuộc tính constructor là một tham chiếu đến hàm khởi tạo đã tạo ra thể hiện. Có một tác dụng phụ quan trọng khi thiết lập thủ công prototype thành một đối tượng mới. Nó xóa thuộc tính constructor. 
*** Để khắc phục điều này, bất cứ khi nào prototype được thiết lập thủ công thành một đối tượng mới, hãy nhớ định nghĩa thuộc tính constructor

```js
Bird.prototype = {
  constructor: Bird,
  numLegs: 2, ...
```

Tất cả các đối tượng trong JavaScript (với một vài ngoại lệ) đều có prototype - Vì prototype là một đối tượng, prototype có thể có prototype riêng của nó: prototype của Bird.prototype là Object.prototype: Object.prototype.isPrototypeOf(Bird.prototype)

```js

```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### instanceof

[MDN instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof): kiểm tra xem thuộc tính prototype của một hàm khởi tạo có xuất hiện ở bất kỳ đâu trong chuỗi prototype của một đối tượng hay không. Giá trị trả về là một giá trị boolean. Trả về true nếu một đối tượng là một thể hiện của một kiểu đối tượng. 

```js
// syntax: 
object instanceof constructor

// MDN examples:
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}
const auto = new Car('Honda', 'Accord', 1998);
console.log(auto instanceof Car); // true 
console.log(auto instanceof Object); // true


// with dates:
let myDate = new Date();
myDate instanceof Date;      // true
myDate instanceof Object;    // true
myDate instanceof String;    // false


// Objects created using Object.create()
function Shape() {
}
function Rectangle() {
  Shape.call(this); // call super constructor.
}
Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;
let rect = new Rectangle();
rect instanceof Object;    // true
rect instanceof Shape;     // true
rect instanceof Rectangle; // true
rect instanceof String;    // false

let literalObject     = {};
let nullObject  = Object.create(null);
nullObject.name = "My object";

literalObject instanceof Object; // true, every object literal has Object.prototype as prototype
({}) instanceof Object; // true, same case as above
nullObject instanceof Object;   // false, prototype is end of prototype chain (null)


// example 3
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}
let mycar = new Car('Honda', 'Accord', 1998)
let a = mycar instanceof Car     // returns true
let b = mycar instanceof Object  // returns true
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### isPrototypeOf

[MDN isPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf): kiểm tra xem một đối tượng có tồn tại trong chuỗi prototype của đối tượng khác hay không

```js
// syntax
isPrototypeOf(object)

// example
function Foo() {}
function Bar() {}

Bar.prototype = Object.create(Foo.prototype);
const bar = new Bar();
console.log(Foo.prototype.isPrototypeOf(bar)); // true
console.log(Bar.prototype.isPrototypeOf(bar)); // true


// example 2
function Bird(name) {
  this.name = name;
}
let duck = new Bird("Donald");
Bird.prototype.isPrototypeOf(duck);

// prototype of prototype
console.log(Object.prototype.isPrototypeOf(Bird.prototype)); // true
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Object create

[MDN Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create): tạo một đối tượng mới, sử dụng một đối tượng hiện có làm prototype của đối tượng mới được tạo - một cách tiếp cận thay thế cho kế thừa thay vì `new ClssName()`.

`freeCodeCamp`: Bước đầu tiên để kế thừa hành vi từ siêu kiểu (hoặc cha) Animal: tạo một thể hiện mới của Animal. bước tiếp theo: đặt prototype của kiểu con (hoặc con)—trong trường hợp này, Bird—thành một thể hiện của Animal: `Bird.prototype = Object.create(Animal.prototype);`.

```js
// syntax:
Object.create(proto)
Object.create(proto, propertiesObject)
Object.create(Class.prototype)


// example
const person = {
  isHuman: false,
  printIntroduction: function() {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  }
};
const me = Object.create(person);
me.name = 'Matthew'; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // inherited properties can be overwritten
me.printIntroduction();
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Object entries

[MDN Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries): trả về một mảng các cặp [khóa, giá trị] của một đối tượng cho trước. Điều này giống như lặp với vòng lặp for...in, ngoại trừ việc vòng lặp for...in liệt kê các thuộc tính trong chuỗi prototype nữa. 

Thứ tự của mảng được trả về bởi `Object.entries()` giống như thứ tự được cung cấp bởi vòng lặp for...in. Nếu cần thứ tự khác, thì mảng nên được sắp xếp trước, như `Object.entries(obj).sort((a, b) => b[0].localeCompare(a[0]));`.

```js
// syntax:
Object.entries(obj)


// examples:
const object1 = {
  a: 'word',
  b: 42
};

for (const [key, value] of Object.entries(object1)) {
  console.log(`${key}: ${value}`); // "a: word", "b: 42"
}

const obj = { foo: 'bar', baz: 42 };
console.log(Object.entries(obj)); // [ ['foo', 'bar'], ['baz', 42] ]

// array like object
const obj = { 0: 'a', 1: 'b', 2: 'c' };
console.log(Object.entries(obj)); // [ ['0', 'a'], ['1', 'b'], ['2', 'c'] ]

// array like object with random key ordering
const anObj = { 100: 'a', 2: 'b', 7: 'c' };
console.log(Object.entries(anObj)); // [ ['2', 'b'], ['7', 'c'], ['100', 'a'] ]

// iterate through key-value gracefully
const obj = { a: 5, b: 7, c: 9 };
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
}

// Or, using array extras
Object.entries(obj).forEach(([key, value]) => {
  console.log(`${key} ${value}`); // "a 5", "b 7", "c 9"
});
```

Chuyển đổi một Đối tượng thành Map

```js
const obj = { foo: 'bar', baz: 42 };
const map = new Map(Object.entries(obj));
console.log(map); // Map(2) {"foo" => "bar", "baz" => 42}
```

Lặp qua một Đối tượng

```js
const obj = { foo: 'bar', baz: 42 };
Object.entries(obj).forEach(([key, value]) => console.log(`${key}: ${value}`)); // "foo: bar", "baz: 42"
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## kế thừa

[MDN inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain#inheritance_with_the_prototype_chain): điều gì đó về hàm khởi tạo và siêu kiểu.

`freeCodeCamp`: Nhưng duck và tất cả các thể hiện của Bird nên cho thấy rằng chúng được tạo bởi Bird chứ không phải Animal. Để làm như vậy, bạn có thể thiết lập thủ công thuộc tính constructor của Bird thành đối tượng Bird

```js
// syntax:
ChildObject.prototype = Object.create(ParentObject.prototype);
// Then the ChildObject received its own methods by chaining them onto its prototype:
ChildObject.prototype.methodName = function() {...};


// A constructor function that inherits its prototype object from a supertype constructor function can still have its own methods in addition to inherited methods
function Animal() { }
Animal.prototype.eat = function() {
  console.log("nom nom nom");
};
function Bird() { }
Bird.prototype = Object.create(Animal.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.fly = function() {
  console.log("I'm flying!");
};

let duck = new Bird();
duck.eat();
duck.fly();

// another one
function Animal() {}
Animal.prototype.eat = function() {
  console.log("nom nom nom");
};

function Dog() {}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
  console.log("Woof!");
};

let beagle = new Dog();

beagle.eat(); 
beagle.bark(); 
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## vòng lặp for in

Sử dụng `for in`:
```js
// syntax:
obj.hasOwnProperty('Prop1');
'Prop1' in uobjsers;

for (let user in users) {...}

// example 1:
function Bird(name) {
  this.name = name;
  this.numLegs = 2;
}

let duck = new Bird("Donald");
let canary = new Bird("Tweety");
let ownProps = [];
for (let property in duck) {
  if (duck.hasOwnProperty(property)) {
    ownProps.push(property);
    console.log(duck[property])
  }
}
console.log(ownProps); // ['name', 'numLegs']


// example 2:
const chordIntervals = {
  "Chord": "maj",
  "Intervals": ["1", "3", "5"],
  "steps": [0, 4, 7]
}

let chordProps = [];
for (let prop in chordIntervals) {
  if (chordIntervals.hasOwnProperty(prop)) {
    chordProps.push(prop);
    console.log(chordIntervals[prop]) // maj ['1', '3', '5'] [0, 4, 7]
  }
}
console.log(chordProps); // ['Chord', 'Intervals', 'steps']


// Example 3
const users = {
  Alan: {
    online: false
  },
  Jeff: {
    online: true
  },
  Sarah: {
    online: false
  }
}

function countOnline(usersObj) {
  // Only change code below this line
  let result = 0;
  for (let user in usersObj) {
    if (usersObj[user].online === true) {
      result++;
    }
  }
  return result;
  // Only change code above this line
}

console.log(countOnline(users));
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Sửa đổi giá trị và xóa khóa

```js
let something = {
  id: 23894201352,
  location: "New York",
  date: 'January 1, 2017',
  data: {
    totalUsers: 51,
    online: 42
  }
};
// Add:
something.data.offline = 100;
// Modify:
something.data.online = 45;
// Delete/remove a key/property:
delete something.location;
```

<br />

Truy cập giá trị bằng cách sử dụng `obj[prop]` hoặc `obj.prop[i]` hoặc `obj.[prop][i]`.
```js
// something here
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Lớp

Video tuyệt vời về Lớp ES6: https://youtu.be/_vmLIClIJS8

### phiên bản prototype

```js
// Amusement park food pass example:
function Park (firstName, lastName, fastPass, mealPass) {
  this.firstName = firstName,
  this.lastName = lastName,
  this.fastPass = fastPass,
  this.mealPass = mealPass
}
Park.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
}
Park.prototype.canSkip = function() {
  return `${this.getFullName()} ${this.fastPass ? " can skip the line" : " can't skip the line"}.`;
}
Park.prototype.canEat = function() {
  return `${this.getFullName()} ${this.mealPass ? " can eat here" : " can't eat here"}.`;
}
const molly = new Park("Molly", "Stevens", false, false);
const steve = new Park("Steve", "Jones", true, true);
const sue = new Park("Sue", "Smith", true, false);
const joe = new Park("Joe", "Thomas", false, true);

console.log(molly.canEat());
console.log(steve.canEat());
console.log(joe);
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Phiên bản Lớp ES6

**GHI CHÚ**: Nhấp vào tên lớp để hiển thị bóng đèn vàng, nhấp vào bóng đèn, chuyển đổi sang cú pháp lớp ES6:

```JS
// syntax
const Name = function(arg) {

class Name {
  constructor(arg) {
}

// check this property to find out what kind of object it is, it’s generally better to use the instanceof method to check the type of an object
(candidate.constructor === Bird) // true or false

function joinBirdFraternity(candidate) {
  if (candidate.constructor === Bird) {
    return true;
  } else {
    return false;
  }
}

// prototype as objet:
Bird.prototype = {
  numLegs: 2, 
  eat: function() {
    console.log("nom nom nom");
  },
  describe: function() {
    console.log("My name is " + this.name);
  }
};
```

<br />

Truy cập giá trị bằng cách sử dụng

```js
// Amusement park fast pass example:
class Park2 {
  constructor(firstName, lastName, fastPass, mealPass) {
    this.firstName = firstName,
      this.lastName = lastName,
      this.fastPass = fastPass,
      this.mealPass = mealPass;
  }
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  canSkip() {
    return `${this.getFullName()} ${this.fastPass ? " can skip the line" : " can't skip the line"}.`;
  }
  canEat() {
    return `${this.getFullName()} ${this.mealPass ? " can eat here" : " can't eat here"}.`;
  }
}
const molly2 = new Park2("Molly", "Stevens", false, false);
const steve2 = new Park2("Steve", "Jones", true, true);
const sue2 = new Park2("Sue", "Smith", true, false);
const joe2 = new Park2("Joe", "Thomas", false, true);

console.log(steve2.canSkip());
console.log(joe2.canSkip());
```

<br />

Ví dụ với khách hàng của tôi:
```js
// petNames as an array of objects
const philMiller = new Client("Phil Miller", "2001 Hamilton # 305", "pmiller83@gmail.com", "215-834-8218", {"Dog": "Sadie"}, {"Dog": "Abby"}, {"Cat": "Luna"});
// petNames as an array
// const philMiller = new Client("Phil Miller", "2001 Hamilton # 305", "pmiller83@gmail.com", "215-834-8218", "Sadie", "Abby", "Bella");

console.log(philMiller);

class SecondClient {
  constructor(secondName, secondEmail, secondPhone) {
    this.secondName = secondName,
    this.secondEmail = secondEmail,
    this.secondPhone = secondPhone
  }
}

const philSpouse = new SecondClient("Rachel Miller", "soandso@gmail.com", "555-555-5555")
console.log(philSpouse);

let totalClient = {...philMiller, ...philSpouse};
console.log(totalClient);
```

<br />

Đối tượng ví dụ:
```js
const student1 = {
  firstName: "Mary",
  lastName: "Williams",
  gradeLevel: "Junior",
  currentAverage: "A"
};
```

<br />

Console.log hàm rỗng:
```js
function Student() {

}
console.log(Student()); // undefined
console.log(new Student()); // Student {}
```

<br />

Từ khóa `new` thay đổi cách hoạt động của hàm. Sau đó bạn có quyền truy cập vào đối tượng qua từ khóa `this`.

```js
// All students will have these properties:
function Student(first, last, lvl, avg) {
  this.firstName = first;
  this.lastName = last;
  this.gradeLevel = lvl;
  this.currentAverage = avg;
  this.getFullName = function() {
    return `${this.firstName} ${this.lastName}`
  }
}
const student1 = new Student("Mary", "Williams", "Junior", "A");
console.log(student1); // Student {firstName: 'Mary', lastName: 'Williams', gradeLevel: 'Junior', currentAverage: 'A'}

// update:
student1.firstName = "Marilyn";
student1.age = 28;
```

<br />

Tạo một lớp với hàm khởi tạo, phương thức và thuộc tính. Và bạn có một prototype cho mỗi lớp bạn tạo.

```js
// syntax
class ClassName {
  constructor(properties to set) {
    this.prop1 = prop1;
    this.ptop2 = prop2;
  }
}
// Person class
class Person {
  constructor(firstName, lastName, dob) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthday = new Date(dob);
  }

  greeting() {
    return `Hello, ${this.firstName} ${this.lastName}.`;
  }
}

// create a new object based on the Person class
const jim = new Person("Jim", "Kernix");
jim.greeting();
```

<br />

lớp con với từ khóa `extends` và `super`:
```js
class Customer extends Person {
  constructor(firstName, lastName, phone, membership) {
    // super calls the paent class constructor
    super(firstName, lastName);

    this.phone = phone;
    this.membership = membership;
  }
}

const john = new Customer('John', 'Williams', '123-456-7890', 'Standard');
const mary = new Person('Mary', 'Thompson');
console.log(john.greeting());
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Chủ đề liên quan 

Những chủ đề này đến từ freeCodeCamp nhưng tôi nghĩ chúng KHÔNG phải ES6.

<br />

#### <ins>Mixin đối tượng</ins>

Mixin cho phép các đối tượng khác sử dụng một tập hợp các hàm.

```js
let flyMixin = function(obj) {
  obj.fly = function() {
    console.log("Flying, wooosh!");
  }
};

let bird = {
  name: "Donald",
  numLegs: 2
};

let plane = {
  model: "777",
  numPassengers: 524
};

flyMixin(bird);
flyMixin(plane);

bird.fly();
plane.fly();
```

<br />

#### <ins>Closure</ins>

Cách đơn giản nhất để làm cho thuộc tính công khai này thành riêng tư là tạo một biến trong hàm khởi tạo. Trong JavaScript, một hàm luôn có quyền truy cập vào ngữ cảnh mà trong đó nó được tạo. Điều này được gọi là closure. 

```js
function Bird() {
  // previously would have been bird.hatchedEgg = 10;
  let hatchedEgg = 10;

  this.getHatchedEggCount = function() { 
    return hatchedEgg;
  };
}
let ducky = new Bird();
ducky.getHatchedEggCount();

```

<br />

#### <ins>IIFE và mô-đun đối tượng</ins>

Một biểu thức hàm được gọi ngay lập tức (IIFE) thường được sử dụng để nhóm chức năng liên quan thành một đối tượng hoặc mô-đun duy nhất. Bạn có thể nhóm các mixin này thành một mô-đun. Đối tượng được trả về chứa tất cả các hành vi mixin như là thuộc tính của đối tượng. Ưu điểm của mẫu mô-đun là tất cả các hành vi chuyển động có thể được đóng gói vào một đối tượng duy nhất mà sau đó có thể được sử dụng bởi các phần khác của mã của bạn. 

```js
// previously
function glideMixin(obj) {
  obj.glide = function() {
    console.log("Gliding on the water");
  };
}
function flyMixin(obj) {
  obj.fly = function() {
    console.log("Flying, wooosh!");
  };
}

// now mixins grouped into a module:
let motionModule = (function () {
  return {
    glideMixin: function(obj) {
      obj.glide = function() {
        console.log("Gliding on the water");
      };
    },
    flyMixin: function(obj) {
      obj.fly = function() {
        console.log("Flying, wooosh!");
      };
    }
  }
})();

motionModule.glideMixin(duck);
duck.glide();
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Destructuring đối tượng

CÁCH CŨ ĐỂ DESTRUCTURING MỘT ĐỐI TƯỢNG, GÁN BIẾN TỪ CÁC ĐỐI TƯỢNG:
```js
var voxel = {x: 3.6, y: 7.4, z: 6.54};

let x = voxel.x;
let y = voxel.y;
let z = voxel.z;
console.log(x);
```

<br />

CÁCH THỰC HIỆN TRÊN VỚI DESTRUCTURING:
```js
var voxel = {x: 3.61, y: 7.4, z: 6.54};
const {x, y, z} = voxel; 
console.log(x);
```

<br />

Sao chép sang tên biến mới:
```js
var voxel = {x: 3.61, y: 7.4, z: 6.59};
const {x: a, y: b, z: c} = voxel; 
console.log(c);
```

<br />

Gán biến TỪ các đối tượng lồng nhau:
```js
const nest = {
  start: {x: 51, y: 6},
  end: {x: 6, y: -9}
}
const { start: { x: startX, y: startY }} = nest;
console.log("startX: " + startX);
```

<br />

Destructuring mảng:
```js
const [q, , , , r] = [1, 2, 3, 4, 5];
console.log(q, r);
```

<br />

Toán tử Rest để gán lại các phần tử mảng - Rest lấy phần "còn lại":
```js
const [a, b, ...rest] = [1, 2, 3, 4, 5];
console.log(a, b, rest);
```

sử dụng destructuring để truyền một đối tượng làm tham số của hàm (???)
```js
const profileUpdates = ({name, age, nationality, location}) => {
  // do something with the vars (find the video and rewatch)
}
```

<br />

Video: #54 Gán Destructuring Mảng
```js
const colors = ["yellow", "blue", "red", "green"];
const [c1, c2, c3, c4] = colors;
console.log(colors); // ["yellow","blue","red","green"]
console.log(c1, c2, c3, c4); // "yellow" "blue" "red" "green"

// Another example:
const arr = [1,2,3,4,5]
const [a, b] = arr
console.log(b) // 2
```

<br />

Với một mảng lồng nhau - cú pháp thực sự quan trọng
```js
const numbers2 = [1, 2, 3, [4, 5], 6];
const [n1, n2, n3, [n4, n5], n6] = numbers2;
console.log(n1, n2, n3, n4, n5, n6); // 1 2 3 4 5 6
```

<br />

bạn có thể sử dụng destructuring để hoán đổi các giá trị được giữ trong các biến:
```js
let myStr2 = "Cheese";
let myStr3 = "Butter";
[myStr2, myStr3] = [myStr3, myStr2]
console.log(myStr2, myStr3); // "Butter" "Cheese"
```

<br />

Một ví dụ khác:
```js
const myStore = {
    groceries: [["Milk", 5], ["Bread", 1], ["Butter", 3], ["Cereal", 2], ["Corn", 3], ["Rice", 2], ["Steak", 10]],
    generalItems: [["Cleaner", 3], ["Towels", 6], ["Mop", 10], ["Pans", 12], ["Shirts", 4]],
    purchaseItems: function (groceryIndex, generalIndex) {
        return [this.groceries[groceryIndex], this.generalItems[generalIndex]];
    }
}
const myOrder = myStore.purchaseItems(6, 1);
const [[item1, price1], [item2, price2]] = myOrder;
console.log(`Your item of ${item1} from grocery costs $${price1}.\nYour item of ${item2} from general costs $${price2}.`);
```

<br />

Ví dụ lớn, #58 Destructuring Đối tượng Phần 1:
```js
const mall = {
  mallName: "Mall of Irvine",
  address: {
    street: "555 Main Street",
    city: "Irvine",
    state: "CA",
    zip: "92620",
  },
  anchorStores: ["Macy's", "Sears", "Dick's Sporting Goods", "JCPenny"],
  fastFood: ["Panda Express 🐥", "Subway 🥪", "Burger King 🍔"],
  restaurants: [
    "Red Lobster",
    "Cheesecake Factory",
    "California Pizza Kitchen",
  ],
  takeOut: {
    appetizers: [
      "Garlic Bread",
      "Goat Cheese",
      "Spinach Dip and Chips",
      "Wings",
    ],
    main: [
      "Pasta and Meatballs",
      "Ribs and Potatoes",
      "Steak with Spanish Rice",
    ],
    drinks: ["Coke", "Sprite", "Water", "Beer"],
    deserts: ["Chocolate Cake", "Apple Pie", "Ice Cream"],
  },
  getDelivery: function ({
    appetizerIndex,
    mainIndex,
    drinkIndex,
    desertIndex,
    time,
    address,
  }) {
    const r = this.takeOut; // shorten the path to it 
    return `Your order has been received at ${time} for delivery at:\n${address}:\nAppetizer: ${r.appetizers[appetizerIndex]}\nMain Dish: ${r.main[mainIndex]}\nDrink: ${r.drinks[drinkIndex]}\nDesert: ${r.deserts[desertIndex]}`;
  },
};
const myFood = mall.getDelivery({
  desertIndex: 0,
  drinkIndex: 1,
  appetizerIndex: 2,
  mainIndex: 2,
  time: "7:00 PM",
  address: "123 Main Drive\nIrvine, CA 92620",
});
console.log(myFood);
const {mallName: localName, anchorStores, address: {street: streetName, city, state, zip}} = mall;
// console.log(mall.address.street)
// console.log(streetName)
// console.log(`Come vist ${localName}.\nWe are located at ${streetName}.`)
```

<br />

#59 Destructuring Đối tượng Phần 2, ví dụ thứ 2, gán không có khai báo:
```js
const jason = {
  firstName: "Jason",
  lastName: "Fitzgerald",
  age: 35,
  city: "Destin",
  state: "FL",
  job: "Web Developer"
}
let jasonAge = "unknown", jasonJob = "unknown";
({age: jasonAge, job: jasonJob} = jason);
console.log(jasonAge, jasonJob); // 35 "Web Developer"  
```

<br />

BÀI 11 sử dụng gán destructuring để trích xuất giá trị từ các đối tượng
const HIGH_TEMPERATURES = {
  yesterday: 75,
  today: 77,
  tomorrow: 80
};

const { today, tomorrow } = HIGH_TEMPERATURES;

- 12. sử dụng gán destructuring để gán biến từ các đối tượng
const { name: userName, age: userAge } = user;

- 13. sử dụng gán destructuring để gán biến từ các đối tượng lồng nhau
const { johnDoe: { age: userAge, email: userEmail }} = user;

- bài 14 sử dụng gán destructuring để gán biến từ mảng
- const [a, b, , , c] = [1, 2, 3, 4, 5, 6];
- console.log(a, b, c);
- bài 15 sử dụng gán destructuring với tham số rest để gán lại các phần tử mảng
const [a, b, ...arr3] = [1, 2, 3, 4, 5, 7];

16. sử dụng gán destructuring để truyền một đối tượng làm tham số của hàm

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Toán tử Spread

kéo các cặp khóa-giá trị từ một đối tượng khác: 
```js
let contact = {
  firstName: "Jim",
  lastName: "Kernix",
  email: "test@test.com"
}

let myAddress = {
  ...contact,
  number: 123,
  street: "Main Street",
  city: "Anytown"
}
console.log(myAddress);
```

<br />

sao chép và thay đổi giá trị:
```js
const myCar = {
  make: "Honda",
  model: "Accord",
  color: "Red",
  year: 1999,
  mpg: 25,
  price: "$1000"
}
const lunasCar = {...myCar, doors: 3, "Spare tires": 0};
lunasCar.color = "White";
// console.log(lunasCar);
```

<br />

với một ví dụ về đổi tên khóa:
```js
const applicant = {
  firstName: "Jamie",
  lastName: "Smith",
  age: 29,
  job: "Teacher",
  city: "Houston",
  state: "TX",
  yearsExp: 5,
  recommendations: 3,
};

const {firstName: applicantFirstName, lastName: applicantLastName, ...otherinformation} = applicant;
console.log(otherinformation);
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Linh tinh

Các phương thức khác: Object.entries(obj)| Object.getOwnPropertyNames()| Object.freeze(obj)| obj.toString() | obj.prop ???

typeof:
```js
let typeOfTest;
typeOfTest = [];  
console.log(typeof typeOfTest) // object
typeOfTest = {};  // object
typeOfTest = null; // object
```

- `delete`:
- `this`:
- `prototype`: 
- `new`: 
- `instanceof`: 
- `constructor`: 
- `super`: 
- `ChildObject.prototype`: ChildObject.prototype.methodName = function() {...}; 

WTF với `[ ]` hoạt động nhưng ký hiệu chấm thì không???? Điều gì đó với câu lệnh if?

<br />

LearnWebCode: 

- Ngừng suy nghĩ theo các biến và hàm riêng lẻ, và bắt đầu suy nghĩ theo các đối tượng với cặp khóa-giá trị và phương thức.
- tạo nhiều đối tượng tương tự nhau

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Bảng cú pháp

Phương thức đối tượng và mã liên quan:

| method          | syntax                      |    
| :----           | :----                       | 
| Object.keys     | Object.keys(obj)            | 
| Object.values   | Object.values(obj)          | 
| hasOwnProperty  | obj.hasOwnProperty(prop)    | 
| instanceof      | obj instanceof constructor  |
| isPrototypeOf   | isPrototypeOf(obj)          |
| Object.create   | Object.create(proto)        |
|                 | Object.create(proto, propertiesObject) |
|                 | Object.create(Class.prototype) |
| for in          | for (let user in users)     |
| Class           | class Name { constructor(arg) |
|                 | { this.arg = arg; }         | 
| method          | method name() {...}         |

<br />

Ví dụ Destructuring:

| example         | syntax                                  |    
| ----:           | :----                                   | 
|                 | let a, b, rest;                         |
| **Arrays**:     | [a, b] = [10, 20];                      |
|                 | [a, b, ...rest] = [10, 20, 30, 40, 50]; |
|                 | const foo = ['one', 'two', 'three'];    |
|                 | const [red, yellow, green] = foo;       |
| default values: | [a=5, b=7] = [1];                       |
| swapping vars:  | [a, b] = [b, a];                        | 
|                 |                                         |
| **Objects**:    | ({ a, b } = { a: 10, b: 20 });          |
|                 | ({a, b, ...rest} = {a: 10, b: 20, c: 30, d: 40}); |
|                 |                                         |

<br />

ví dụ freeCodeCamp:
```js
const {one, one} = obj // extract
const { one: onething, two: twothing } = obj // assign vars
const { johnDoe: { age: userAge, email: userEmail }} = user // nested assignment
const [a, b,,, c] = [1, 2, 3, 4, 5, 6]; // assign from arrays
const [a, b, ...arr] = [1, 2, 3, 4, 5, 7]; // with rest
const half = ({ max, min }) => (max + min) / 2.0; // obj as Fx parm
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Ghi chú

Điều gì đó ở đây...

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>
