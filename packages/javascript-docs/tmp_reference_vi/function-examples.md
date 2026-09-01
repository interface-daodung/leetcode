# Ví dụ mã quan trọng về hàm

**Lập trình hàm**: Một trong những nguyên tắc cốt lõi của lập trình hàm là không thay đổi mọi thứ. Lập trình hàm xoay quanh việc tạo và sử dụng các hàm không gây đột biến (non-mutating).

- Một nguyên tắc khác của lập trình hàm là luôn khai báo các phụ thuộc của bạn một cách tường minh.
- Điều này có nghĩa là nếu một hàm phụ thuộc vào một biến hoặc đối tượng nào đó, thì hãy truyền biến hoặc đối tượng đó trực tiếp vào hàm dưới dạng tham số.
- Hàm sẽ dễ kiểm thử hơn, bạn biết chính xác đầu vào mà nó nhận, và nó sẽ không phụ thuộc vào bất kỳ thứ gì khác trong chương trình của bạn.
- Hàm sẽ luôn tạo ra cùng một đầu ra cho cùng một tập đầu vào

Các nguyên tắc riêng biệt cho lập trình hàm:

- Đừng thay đổi một biến hoặc đối tượng — hãy tạo các biến và đối tượng mới và trả về chúng nếu cần từ một hàm. Sẽ dễ ngăn ngừa lỗi hơn khi biết rằng các hàm của bạn không thay đổi bất cứ thứ gì, bao gồm cả tham số của hàm hoặc bất kỳ biến toàn cục nào
- Khai báo tham số hàm — mọi phép tính bên trong hàm chỉ phụ thuộc vào các tham số được truyền vào hàm, chứ không phụ thuộc vào bất kỳ đối tượng hoặc biến toàn cục nào

Dưới đây là các nguyên tắc lập trình hàm mà tôi sử dụng:

- Hàm nhận tham số và trả về một giá trị hoặc một hàm
- Không đột biến hoặc đột biến có giới hạn và được kiểm soát
  - Không sử dụng các phương thức mảng làm đột biến mảng gọi
  - Không làm đột biến đối tượng
- Không dùng vòng lặp `for` hoặc `while`
- Không dùng `console.log`, `addEventListener`, `Math.random`, `Date.now`, v.v.
- Tuân theo Quy luật Pareto: 80% hàm thuần túy, 20% hàm không thuần túy

Dưới đây là tài liệu từ MDN:

- [MDN functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) | [MDN IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) | [MDN Async await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) | [MDN Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) | [MDN methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) | [MDN callback functions](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function) | [MDN Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [MDN recursion](https://developer.mozilla.org/en-US/docs/Glossary/Recursion)

<div id="back-to-top"></div>

## Mục lục

|                                     Chủ đề | Chủ đề con                                              | Chủ đề con                                | Chủ đề con                                              |
| ----------------------------------------: | :------------------------------------------------------ | :---------------------------------------- | :------------------------------------------------------ |
|                      [Tổng quan](#general): | [Định nghĩa](#definitions)                              | [Cú pháp](#syntax)                        | [Khai báo vs biểu thức](#declaration-vs-expression)     |
|                                           | [Cú pháp rest và spread](#rest-and-spread-syntax)       | [Tham số mặc định](#default-parameters)   | [Đối tượng arguments](#arguments-object)                 |
|                                           | [Linh tinh](#miscellaneous)                             |                                           |                                                         |
|    [Phương thức của hàm](#function-methods): | [apply](#apply)                                         | [bind](#bind)                             | [call](#call)                                           |
|                                           | [toString](#tostring)                                   | [](#)                                     | [](#)                                                   |
|    [Hàm lồng nhau](#nested-functions): | [Nhiều hàm lồng nhau](#multiple-nested-functions)       | [Closure](#closures)                      |                                                         |
|                             [IIFE](#iife) |                                                         |                                           |                                                         |
|                               [ES6](#es6) | [Export import](#export-import)                         | [Async await](#async-await)               | [Hàm mũi tên](#arrow-functions)                         |
|                       [Phương thức](#methods) |                                                         |                                           |                                                         |
| [Hàm gọi lại](#callback-functions) |                                                         |                                           |                                                         |
|           [Lưu trữ cục bộ](#local-storage) |                                                         |                                           |                                                         |
|     [Ủy quyền sự kiện](#event-delegation) |                                                         |                                           |                                                         |
|               [Hiệu suất](#performance) | [Lưu đệm](#caching)                                     | [Ghi nhớ (Memoization)](#memoization)     |                                                         |
|                   [Đệ quy](#recursion) | [Ví dụ freeCodeCamp](#freecodecamp-examples)            | [Ví dụ MDN](#mdn-examples)                | [Ghi chú về đệ quy](#recursion-notes)                   |
|         [Linh tinh 2](#miscellaneous2) | [Hàm định sẵn](#predefined-functions)                   | [Promise trong ES6](#es6-promises)        | [Hàm động](#dynamic-functions)                          |
|                                           | [Ngẫu nhiên](#random)                                   |                                           |                                                         |

## Tổng quan

Hãy xem các thuộc tính của hàm: `.length`, và có thể cả `.name`. Ngoài ra hãy xem các phương thức của hàm: `apply()`, `bind()`, `call()`, và `toString()`.

### Định nghĩa

<dl>
  <dt>Hàm gọi lại (Callback function)</dt>
  <dd>là một hàm được truyền vào một hàm khác dưới dạng tham số, sau đó được gọi bên trong hàm ngoài để hoàn thành một loại quy trình hoặc hành động nào đó. Một ví dụ là hàm trong `addEventListener()`.</dd>
</dl>
<dl>
  <dt>Hàm hạng nhất (First class functions)</dt>
  <dd>Các hàm có thể được gán cho một biến, truyền vào một hàm khác, hoặc trả về từ một hàm khác giống như bất kỳ giá trị thông thường nào khác, được gọi là hàm hạng nhất. Trong JavaScript, mọi hàm đều là hàm hạng nhất.</dd>
</dl>
<dl>
  <dt>Hàm bậc cao (Higher order functions)</dt>
  <dd>Các hàm nhận một hàm làm tham số, hoặc trả về một hàm làm giá trị trả về.</dd>
</dl>
<dl>
  <dt>Hàm lambda (Lambda functions)</dt>
  <dd>Khi các hàm được truyền vào hoặc trả về từ một hàm khác, thì những hàm được truyền vào hoặc trả về đó có thể được gọi là lambda. Biểu thức lambda là một hàm ẩn danh cung cấp cú pháp rất ngắn gọn và mang tính hàm, được sử dụng để viết các phương thức ẩn danh... một hàm đơn giản, ngắn, dùng một lần được thiết kế để tạo nội tuyến trong mã. Chúng còn được gọi là biểu thức lambda, hàm ẩn danh, trừu tượng lambda, dạng lambda, hoặc hằng hàm (function literals)</dd>
</dl>
<dl>
  <dt>Arity</dt>
  <dd>Arity của một hàm là số lượng tham số mà nó yêu cầu.</dd>
</dl>
<dl>
  <dt>Currying</dt>
  <dd>Currying một hàm nghĩa là chuyển đổi một hàm có arity N thành N hàm có arity 1. Nói cách khác, nó tái cấu trúc một hàm sao cho nó nhận một tham số, rồi trả về một hàm khác nhận tham số tiếp theo, và cứ thế tiếp tục.</dd>
</dl>

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Cú pháp

```js
// typeof:
let typeOfTest;
typeOfTest = function() {
  return "Hello";
}
console.log(typeof typeOfTest) // function


// no parameter
function lowerCase() {
  if() {
    // do something
    // return something
  }
}

// with parameter
function square(number) {
  return number * number;
}

function lowerCase(str) {
  return str.toLowerCase();
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Khai báo vs biểu thức

```js
// function declaration:
function myFunction() {
  // code here
}

// function expression:
let myFunction = function() {
  code here
}

// Arrow function expression:
let myFx = () => {
  // code here
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Cú pháp rest và spread

Với tham số rest và toán tử spread trong danh sách tham số:

```js
let someVar = [some other array]
let mainArray = [1, 2, ...someVar, 10, 11]

function someFx(...arr) {
  code here
}
someFx(mainArray);
```

<br />

sử dụng tham số rest với tham số của hàm:

```js
function howMany(...args) {
  return "You have passed " + args.length + " arguments.";
}
console.log(howMany(0, 1, 2, -1, -2));
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Tham số mặc định

đặt tham số mặc định cho hàm của bạn:

```js
const greeting = (name = "Anonymous") => "Hello " + name;
```

<br />

Tham số mặc định 2:

```js
function greet(first = "John", last = "Doe") {
  console.log(`Hello ${first} ${last}`);
}
greet("Jim", "Kernix");
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Đối tượng arguments

MDN: `arguments` là một đối tượng dạng mảng (Array-like) có thể truy cập bên trong hàm, chứa các giá trị của các tham số được truyền cho hàm đó.

freeCodeCamp: Đối tượng arguments là một đối tượng lưu trữ tất cả các giá trị được truyền cho hàm. Đối tượng arguments có cấu trúc của một đối tượng JSON.

```js
console.log(typeof arguments); // 'object'
console.log(typeof arguments[0]); // returns the type of the first argument

// if a function is passed 3 arguments, you can access them as follows
arguments[0]; // first argument
arguments[1]; // second argument
arguments[2]; // third argument

function func1(a, b, c) {
  console.log(arguments[0]); // expected output: 1
  console.log(arguments[1]); // expected output: 2
  console.log(arguments[2]); // expected output: 3
}
func1(1, 2, 3);

// Each argument can also be set or reassigned:
arguments[1] = "new value";

// freeCodeCamp:
function viewArgs() {
  return arguments;
}
console.log(viewArgs([3, 5, 1, 2, 2], 2, 3, 5));
// { '0': [ 3, 5, 1, 2, 2 ], '1': 2, '2': 3, '3': 5 }
console.log(viewArgs([2, 3, 2, 3, 2, 3]));
// { '0': [ 2, 3, 2, 3, 2, 3 ] }
console.log(viewArgs(3, 2, 1, "life the universe and all"));
// { '0': 3, '1': 2, '2': 1, '3': 'life the universe and all' }
console.log(viewArgs("Douglas", "Adams"));
// { '0': 'Douglas', '1': 'Adams' }
```

Đối tượng arguments không phải là một mảng (Array). Nó tương tự, nhưng thiếu mọi thuộc tính của mảng ngoại trừ `length`. Như bạn có thể làm với bất kỳ đối tượng dạng mảng nào, bạn có thể sử dụng phương thức `Array.from()` của ES2015 hoặc `spread syntax` để chuyển đổi `arguments` thành một mảng thực sự:

```js
let args = Array.from(arguments);
// or
let args = [...arguments];
```

Đối tượng arguments hữu ích cho các hàm được gọi với nhiều tham số hơn số tham số được khai báo chính thức. Kỹ thuật này hữu ích cho các hàm có thể được truyền số lượng tham số biến đổi, chẳng hạn như `Math.min()`.

Nếu bạn truyền 3 tham số cho một hàm, ví dụ `storeNames()`, thì 3 tham số đó sẽ được lưu trữ bên trong một đối tượng gọi là **arguments** và nó sẽ trông như thế này khi chúng ta truyền các tham số `storeNames("Springfield", "Clayton", "Smithville")` cho hàm của mình. Khi bạn thực thi hàm đó với n tham số, trong trường hợp này là 3, nó sẽ trả về đối tượng cho chúng ta và nó sẽ trông giống như một mảng:

```js
function storeNames() {
  return arguments;
}
// ["Springfield", "Clayton", "Smithville"]
arguments.length; // 3
```

Đối tượng arguments có thể được sử dụng kết hợp với tham số _rest_, _default_, và tham số _destructured_.

#### Xem nó như một mảng

Bạn không nên dùng `slice` trên `arguments` vì nó ngăn cản các tối ưu hóa trong các engine JavaScript. Thay vào đó, hãy thử tạo một mảng mới bằng cách lặp qua đối tượng arguments — hãy thử vòng lặp `for`:

```js
let args = []; // Empty array, at first.
for (let i = 0; i < arguments.length; i++) {
  args.push(arguments[i]);
} // Now 'args' is an array that holds your arguments.

// also try the rest parameter or Array.from() method:
function func(...args) {
  console.log(args); // or
  console.log(Array.from(arguments));
}
function func() {
  console.log(Array.from(arguments)); // or
  return Array.from(arguments).sort((a, b) => a - b);
}
func(1, 2, 3); // [ 1, 2, 3 ]
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Linh tinh

trả về giá trị boolean từ hàm và `typeof`:

```js
function checkEqual(a, b) {
  return a === b;
}

// or

function boolReturn(test) {
  // return typeof test === "number";
  // return typeof test === "string";
  return typeof test === "object";
  // return typeof test === "boolean";
}
console.log(boolReturn([1, 2, 3]));
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Phương thức của hàm

Cũng hãy xem

- [get và getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get): Cú pháp `get` liên kết một thuộc tính của đối tượng với một hàm sẽ được gọi khi thuộc tính đó được tra cứu.
- [set và setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set): Cú pháp `set` liên kết một thuộc tính của đối tượng với một hàm sẽ được gọi khi có nỗ lực gán giá trị cho thuộc tính đó.

### apply

Phương thức [apply()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) **<ins>gọi một hàm</ins>** với một giá trị `this` cho trước, và các `arguments` được cung cấp dưới dạng một mảng (hoặc một đối tượng dạng mảng).

```js
// syntax:
apply(thisArg);
apply(thisArg, argsArray);
```

<br />

### bind

Phương thức [bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) tạo ra một hàm mới mà khi được gọi, từ khóa `this` của nó được đặt thành giá trị đã cung cấp, với một chuỗi tham số cho trước đứng trước bất kỳ tham số nào được cung cấp khi hàm mới được gọi.

Tôi đã thấy Brad Traversy sử dụng phương thức này trong một số bài học của anh ấy.

```js
// syntax:
bind(thisArg)
bind(thisArg, arg1)
bind(thisArg, arg1, arg2)
bind(thisArg, arg1, ... , argN)
```

<br />

### call

Phương thức [call()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call) gọi một hàm với một giá trị `this` cho trước và các tham số được cung cấp riêng lẻ.

```js
// syntax:
call()
call(thisArg)
call(thisArg, arg1)
call(thisArg, arg1, arg2)
call(thisArg, arg1, ... , argN)
```

<br />

### toString

Phương thức [toString()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/toString) trả về một chuỗi biểu diễn mã nguồn của hàm.

```js
// syntax:
toString();
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Hàm lồng nhau

**Hàm lồng nhau**: Hàm lồng (bên trong) là riêng tư đối với hàm chứa (bên ngoài) nó. Hàm bên trong tạo thành một closure: hàm bên trong có thể sử dụng các tham số và biến của hàm bên ngoài, trong khi hàm bên ngoài không thể sử dụng các tham số và biến của hàm bên trong.

```js
function addSquares(a, b) {
  function square(x) {
    return x * x;
  }
  return square(a) + square(b);
}
a = addSquares(2, 3); // returns 13
b = addSquares(3, 4); // returns 25
c = addSquares(4, 5); // returns 41

// example 2
function outside(x) {
  function inside(y) {
    return x + y;
  }
  return inside;
}
fn_inside = outside(3); // Think of it like: give me a function that adds 3 to whatever you give it
result = fn_inside(5); // returns 8
result1 = outside(3)(5); // returns 8

// Since the inner function forms a closure, you can call the outer function and specify arguments for both the outer and inner function:
function outside(x) {
  function inside(y) {
    return x + y;
  }
  return inside;
}
fn_inside = outside(3);
result = fn_inside(5); // returns 8
result1 = outside(3)(5); // returns 8
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Nhiều hàm lồng nhau

Các hàm có thể được lồng nhau nhiều cấp:

- Một hàm (`A`) chứa một hàm (`B`), hàm này lại chứa một hàm (`C`).
- Cả hai hàm `B` và `C` đều tạo thành closure ở đây. Vì vậy, `B` có thể truy cập `A`, và `C` có thể truy cập `B`.
- Ngoài ra, vì `C` có thể truy cập `B` mà `B` có thể truy cập `A`, nên `C` cũng có thể truy cập `A`.

Do đó, các closure có thể chứa nhiều phạm vi; chúng chứa đệ quy phạm vi của các hàm chứa nó. Điều này được gọi là _chuỗi phạm vi (scope chaining)_.

```js
// In this example, C accesses B's y and A's x
function A(x) {
  function B(y) {
    function C(z) {
      console.log(x + y + z);
    }
    C(3);
  }
  B(2);
}
A(1); // logs 6 (1 + 2 + 3)
```

1. `B` tạo thành một closure bao gồm `A`
1. `C` tạo thành một closure bao gồm `B`
1. Vì closure của `B` bao gồm `A`, nên closure của `C` bao gồm `A`, `C` có thể truy cập cả tham số và biến của `B` và `A`. Nói cách khác, `C` xâu chuỗi các phạm vi của `B` và `A` theo thứ tự đó
1. Tuy nhiên, điều ngược lại không đúng. `A` không thể truy cập `C`

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Closures

JavaScript cho phép lồng nhau các hàm và cấp cho hàm bên trong quyền truy cập đầy đủ tới tất cả các biến và hàm được định nghĩa bên trong hàm bên ngoài (và tất cả các biến và hàm khác mà hàm bên ngoài có quyền truy cập).

Tuy nhiên, hàm bên ngoài không có quyền truy cập vào các biến và hàm được định nghĩa bên trong hàm bên trong. Điều này cung cấp một dạng đóng gói cho các biến của hàm bên trong.

Ngoài ra, vì hàm bên trong có quyền truy cập vào phạm vi của hàm bên ngoài, các biến và hàm được định nghĩa trong hàm bên ngoài sẽ tồn tại lâu hơn thời gian thực thi của hàm bên ngoài, nếu hàm bên trong bằng cách nào đó tồn tại vượt qua vòng đời của hàm bên ngoài. Một closure được tạo ra khi hàm bên trong bằng cách nào đó được cung cấp ra bất kỳ phạm vi nào bên ngoài hàm bên ngoài.

```js
let createPet = function (name) {
  let sex;

  return {
    setName: function (newName) {
      name = newName;
    },

    getName: function () {
      return name;
    },

    getSex: function () {
      return sex;
    },

    setSex: function (newSex) {
      if (typeof newSex === "string" && (newSex.toLowerCase() === "male" || newSex.toLowerCase() === "female")) {
        sex = newSex;
      }
    }
  };
};

let pet = createPet("Vivie");
pet.getName(); // Vivie

pet.setName("Oliver");
pet.setSex("male");
pet.getSex(); // male
pet.getName(); // Oliver

// The functions do not even have to be assigned to a variable, or have a name:
let getCode = (function () {
  let apiCode = "0]Eal(eh&2"; // A code we do not want outsiders to be able to modify...

  return function () {
    return apiCode;
  };
})();

getCode(); // Returns the apiCode
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### IIFE

```js
// IIFE:
(function () {
  console.log("I rule because I am an IIFE!");
})();

// IIFE with parameter:
(function (name) {
  console.log(`Hello, my name is ${name}`);
})("Jim");

// Arrow IIFE:
(() => {
  console.log("I am an arrow function IIFE!");
})();

// Async IIFE:
(async () => {
  console.log("I am an async IIFE!");
})();
```

<br />

Thực thi một hàm async:

```js
const getFileStream = async url => {
  /* implementation */
};

(async () => {
  const stream = await getFileStream("https://domain.name/path/file.ext");
  for await (const chunk of stream) {
    console.log({ chunk });
  }
})();
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## ES6

Dưới đây là các chủ đề cụ thể liên quan đến hàm được giới thiệu với ES6

### Export import

```js
// Strict mode: a restricted variant of JavaScript, intentionally has different semantics
"use strict";

// script tag if you intend to use import and export (defer attribute added):
<script type="module" src="filename.js" defer></script>
```

<br />

Export:

```js
// export a code block:
export const add = (x, y) => {
  return x + y;
}

// export a variable:
const add = (x, y) => {
  return x + y;
}
export { add };

// export multiple objects:
export { add, subtract };

// create an export fallback with export default:
export default function add(x, y) {
  return x + y;
}
// or
export default function(x, y) {
  return x + y;
}
```

<br />

Import:

```js
// import a single object:
import { add } from "./math_functions.js";

// import multiple object:
import { add, subtract } from "./math_functions.js";

// import all
import * as myMathModule from "./math_functions.js";

// use the imported module:
myMathModule.add(2, 3);
myMathModule.subtract(5, 3);

// import a default export
import add from "./math_functions.js";
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Async await

Cú pháp:

```js
async function name(parameters) {
  statements;
}
```

<br />

Ví dụ sử dụng Fetch API:

```js
async function fetchByUrl(url) {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      // Code to output data to the DOM goes here
      // return data;
    } else {
      console.log("Not successful");
    }
  } catch (err) {
    console.error(err);
  }
}
fetchByUrl("https://api.dictionaryapi.dev/api/v2/entries/en/hello");
```

<br />

Viết lại chuỗi Promise bằng hàm async

```js
function getProcessedData(url) {
  return downloadData(url) // returns a promise
    .catch(e => {
      return downloadFallbackData(url); // returns a promise
    })
    .then(v => {
      return processDataInWorker(v); // returns a promise
    });
}

// rewritten as:
async function getProcessedData(url) {
  let v;
  try {
    v = await downloadData(url);
  } catch (e) {
    v = await downloadFallbackData(url);
  }
  return processDataInWorker(v);
}

// or
async function getProcessedData(url) {
  const v = await downloadData(url).catch(e => {
    return downloadFallbackData(url);
  });
  return processDataInWorker(v);
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Hàm mũi tên

Hàm mũi tên có từ khóa `this` theo phạm vi từ vựng (lexical).

Cú pháp và ví dụ:

```js
param => expression
(param1, paramN) => expression

// examples
param => {
  let a = 1;
  return a + param;
}

(param1, paramN) => {
   let a = 1;
   return a + param1 + paramN;
}

// To return an object literal expression requires parentheses around expression
params => ({foo: "a"}) // returning the object {foo: "a"}

// Rest parameters are supported:
(a, b, ...r) => expression

// Default parameters are supported:
(a=400, b=20, c) => expression

// Destructuring within params supported:
([a, b] = [10, 20]) => a + b;  // result is 30
({ a, b } = { a: 10, b: 20 }) => a + b; // result is 30
```

<br />

Hàm mũi tên được dùng như phương thức:

```js
"use strict";

var obj = {
  // does not create a new scope
  i: 10,
  b: () => console.log(this.i, this),
  c: function () {
    console.log(this.i, this);
  }
};

obj.b(); // prints undefined, Window {...} (or the global object)
obj.c(); // prints 10, Object {...}
```

<br />

Một ví dụ khác liên quan đến `Object.defineProperty()`:

```js
"use strict";

var obj = {
  a: 10
};

Object.defineProperty(obj, "b", {
  get: () => {
    console.log(this.a, typeof this.a, this); // undefined 'undefined' Window {...} (or the global object)
    return this.a + 10; // represents global object 'Window', therefore 'this.a' returns 'undefined'
  }
});
```

<br />

Thêm ví dụ:

```js
// Traditional Anonymous Function
function (a, b){
  return a + b + 100;
}

// Arrow Function
(a, b) => a + b + 100;

// Traditional Anonymous Function (no arguments)
let a = 4;
let b = 2;
function (){
  return a + b + 100;
}

// Arrow Function (no arguments)
let a = 4;
let b = 2;
() => a + b + 100;

// Traditional Anonymous Function
function (a, b){
  let chuck = 42;
  return a + b + chuck;
}

// Arrow Function
(a, b) => {
  let chuck = 42;
  return a + b + chuck;
}

// Traditional Function
function bob (a){
  return a + 100;
}

// Arrow Function
let bob = a => a + 100;
```

<br />

Và thêm ví dụ nữa: Xem [MDN Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions):

```js
// An empty arrow function returns undefined
let empty = () => {};

// An empty arrow function returns undefined
(() => "foobar")();
// Returns "foobar"
// (this is an Immediately Invoked Function Expression)

var simple = a => (a > 15 ? 15 : a);
simple(16); // 15
simple(10); // 10

let max = (a, b) => (a > b ? a : b);

// Easy array filtering, mapping, ...

var arr = [5, 6, 13, 0, 1, 18, 23];

var sum = arr.reduce((a, b) => a + b);
// 66

var even = arr.filter(v => v % 2 == 0);
// [6, 0, 18]

var double = arr.map(v => v * 2);
// [10, 12, 26, 0, 2, 36, 46]

// More concise promise chains
promise
  .then(a => {
    // ...
  })
  .then(b => {
    // ...
  });

// Parameterless arrow functions that are visually easier to parse
setTimeout(() => {
  console.log("I happen sooner");
  setTimeout(() => {
    // deeper code
    console.log("I happen later");
  }, 1);
}, 1);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Phương thức

Cú pháp: Phần này nên nằm trong tệp đối tượng

```js
// syntax (HUH?)
const obj = {
  get property() {},
  set property(value) {},
  property( parameters… ) {},
  *generator( parameters… ) {},
  async property( parameters… ) {},
  async* generator( parameters… ) {},

  //  with computed keys
  get [property]() {},
  set [property](value) {},
  [property]( parameters… ) {},
  *[generator]( parameters… ) {},
  async [property]( parameters… ) {},
  async* [generator]( parameters… ) {},
};

// Given the following code:
const obj = {
  foo: function() {
    // ...
  },
  bar: function() {
    // ...
  }
}
// You are now able to shorten this to:
const obj = {
  foo() {
    // ...
  },
  bar() {
    // ...
  }
}
```

Cũng hãy xem:

- Phương thức generator
- Phương thức async
- Phương thức async generator

<br />

Ví dụ:

```js
const toDo = {
  add: function () {
    console.log("This is a method.");
  }
};
toDo.add();

// define a method outside of the object:
toDo.delete = function () {
  console.log("Delete something");
};
toDo.delete();

// another example:
const doSomething = {
  add: function () {
    console.log("This is a method.");
  }
};

doSomething.add();
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Hàm gọi lại

Ví dụ:

```js
function greeting(name) {
  alert("Hello " + name);
}

function processUserInput(callback) {
  var name = prompt("Please enter your name.");
  callback(name);
}
processUserInput(greeting);
```

`addEventListener`:

```js
myvar.addEventListener("click", function(e) {
  console.log("Hello);

  e.preventDefault();
});
```

1. Tham số `e` là đối tượng sự kiện. Bạn muốn ngăn hành vi mặc định liên quan đến những thứ như biểu mẫu và liên kết.

<br />

Để xem đối tượng sự kiện:

```js
myVar.addEventListener("click", onClick);

function onClick(e) {
  let val;
  val = e;
  val = e.target;
  console.log(val); // look for target
}
```

Điều quan trọng nhất bạn sẽ thấy là `target`, đại diện cho phần tử mà sự kiện đã xảy ra.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Lưu trữ cục bộ

Đây sẽ là mã bên trong một hàm:

```js
// set local storage item (syntax first)
localStorage.setItem("key", "value");
localStorage.setItem("name", "Jim"); // check on Application tab

// get from storage:
const name = localStorage.getItem("name");

// remove from storage:
localStorage.removeItem("name");

// to clear everything from local storag:
localStorage.clear();
```

<br />

để một biểu mẫu thêm một mục vào bộ nhớ cục bộ (local storage) và lưu trữ nhiều mục trong một mảng dưới dạng chuỗi:

```js
document.querySelector('form').addEventListener('submit', function(e) {
  const task = document.getElementById('task').value;

  let tasks;

  // check local storage
  if (localStorage.getItem('tasks') === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(localStorage.getItem('tasks'));
  }

  tasks.push(task);

  localStorage.setItem('tasks', JSON.stringify(tasks);
  e.preventDefault();
});
```

<br />

Sau đó để lấy và sử dụng các mục trong bộ nhớ cục bộ (vẫn bên trong trình lắng nghe sự kiện):

```js
const tasks = JSON.parse(localStorage.getItem("tasks"));
tasks.forEach(function (task) {
  console.log(tasks);
});
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Ủy quyền sự kiện

```js
// list items with delete link on the items but
// fa fa-remove icon inside:
function deleteItem(e) {
  if (e.target.patentElement.className === "delete-item secondary-content") {
    console.log("delete item");
  }

  // or better...
  if (e.target.patentElement.classList.contains("delete-item")) {
    console.log("delete item");
  }
}
```

<br />

Nhưng cấu trúc là ul > li > a > i và để xóa toàn bộ mục danh sách, vốn là phần tử cha của thẻ `<a>`, trong câu lệnh if:

```js
if (e.target.patentElement.classList.contains("delete-item")) {
  // target is the icon
  e.target.parentElement.parentElement.remove();
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Hiệu suất

### Caching

Để tăng hiệu suất, hãy lưu đệm (cache) các lựa chọn của bạn vào một biến nào đó (nếu sử dụng cùng một lựa chọn nhiều lần).

```js
// example
```

### Memoization

<dl>
  <dt>Momoize (Memoization)</dt>
  <dd>một cách để tối ưu hóa hàm và làm chúng thực thi nhanh hơn nhiều: lưu đệm (caching). Nó là một kỹ thuật tối ưu hóa được sử dụng chủ yếu để tăng tốc các chương trình máy tính bằng cách lưu trữ kết quả của các lời gọi hàm tốn kém và trả về kết quả đã lưu khi cùng một đầu vào xuất hiện trở lại — lưu trữ trong bộ nhớ. Một kỹ thuật lưu trữ các phép tính đã thực hiện trước đó. Ghi nhớ (Memoization) là một kỹ thuật tối ưu hóa trong đó các lời gọi hàm tốn kém được lưu đệm sao cho kết quả có thể được trả về ngay lập tức vào lần tiếp theo hàm được gọi với cùng các tham số.</dd>
</dl>

```js
// syntax / generic examples
const memoizedAdd = () => {
  let cache = {};
  return n => {
    if (n in cache) {
      console.log("Fetching from cache");
      return cache[n];
    } else {
      console.log("Calculating result");
      let result = // calculation here;
        (cache[n] = result);
      return result;
    }
  };
};

// second one
const memoize = fn => {
  let cache = {};
  return (...args) => {
    let n = args[0]; // just taking one argument here
    if (n in cache) {
      console.log("Fetching from cache");
      return cache[n];
    } else {
      console.log("Calculating result");
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  };
};

// third
function memo(func) {
  var cache = {};
  return function () {
    var key = JSON.stringify(arguments);
    if (cache[key]) {
      console.log(cache);
      return cache[key];
    } else {
      val = func.apply(null, arguments);
      cache[key] = val;
      return val;
    }
  };
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Đệ quy

Hành động một hàm tự gọi chính nó, đệ quy được sử dụng để giải các bài toán chứa các bài toán con nhỏ hơn. Một hàm đệ quy có thể nhận hai đầu vào: trường hợp cơ sở (kết thúc đệ quy) hoặc trường hợp đệ quy (tiếp tục đệ quy)

- Hàm đệ quy tự gọi cho đến khi điều kiện được đáp ứng
- Đệ quy bị giới hạn bởi kích thước ngăn xếp

Cú pháp:

```js
function recurse() {
    if(condition) {
        // stop calling itself
    } else {
        recurse();
    }
}

// syntax 2:
function fxName() {
  return fxName();
  // executes forever resulting in a "stack overflow" - ran out of memory
  // so you need a base case
}

// syntax 3:
function recursion(parm) {
  if (parm cond) {   // base case, when hit stop recursion
    return;
  }
  return recursion(parm + 1); // here is the recursion
}

//
```

<br />

Ví dụ:

```js
// recursive function, sum(arr, n), that returns the sum of the first n elements of an array arr
function sum(arr, n) {
  if(n <= 0) {
    return 0;
  } else {
    return sum(arr, n - 1) + arr[n - 1];
  }
}


// countdown
function countDown(fromNumber) {
    console.log(fromNumber);       // 3 2 1
    let nextNumber = fromNumber - 1;
    if (nextNumber > 0) {
        countDown(nextNumber);
    }
}
countDown(3);
// If you add the condition to stop calling itself, you will get this error:
Uncaught RangeError: Maximum call stack size exceeded.

// countdown2
function countdown(n) {
  if (n < 1) {
    return [];
  } else {
    const arr = countdown(n - 1);
    arr.unshift(n);
    return arr;
  }
}
// or
// Solution 1
function countdown(n) {
  if (n < 1) {
    return [];
  } else {
    const arr = countdown(n - 1);
    arr.unshift(n);
    return arr;
  }
}
// Solution 2 (Click to Show/Hide)
function countdown(n) {
  if (n < 1) {
    return [];
  } else {
    const arr = countdown(n - 1);
    arr.splice(0, 0, n);
    return arr;
  }
}

// countdown 3
function countdown(n){
   return n < 1 ? [] : [n].concat(countdown(n - 1));
}
// or
function countdown(n){
   return n < 1 ? [] : [n, ...countdown(n - 1)];
}

// reverse a string: (use for palindrome?)
function string_reversal(string) {
  if (string == "") {
    return ""
  }

  return string_reversal(string.slice(1)) + string[0]
}

// Recursion to Create a Range of Numbers
function rangeOfNumbers(startNum, endNum) {
  if (endNum - startNum === 0) {
    return [startNum];
  } else {
    var numbers = rangeOfNumbers(startNum, endNum - 1);
    numbers.push(endNum);
    return numbers;
  }
}

// solution 2
function rangeOfNumbers(startNum, endNum) {
  return startNum === endNum
    ? [startNum]
    : rangeOfNumbers(startNum, endNum - 1).concat(endNum);
}
// or
function rangeOfNumbers(startNum, endNum) {
  return startNum === endNum
    ? [startNum]
    : [...rangeOfNumbers(startNum, endNum - 1), endNum ];
}

```

Ví dụ đệ quy (tính giai thừa):

```js
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  else return n * factorial(n - 1);
}

var a, b, c, d, e;
a = factorial(1); // a gets the value 1
b = factorial(2); // b gets the value 2
c = factorial(3); // c gets the value 6
d = factorial(4); // d gets the value 24
e = factorial(5); // e gets the value 120
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Ví dụ freeCodeCamp

Từ video

```js
// factorial example with recursion
function factorial(num){
    if(num === 1){
        return num;
    }
    return num * factorial(num - 1)
}
console.log(factorial(4)); // 24 = 4 * 3 * 2 * 1
console.log(factorial(5)); // 120

// for loop solution for factorials
function factorialize(num) {
  let product = 1;
  // let i = 1 also works
  for (let i = 2; i <= num; i++) {
    product *= i;
  }
  return product;
}
console.log(factorialize(5)); // 120


// count down example
function countDownFrom(number) {
	if (number === 0) {
		return;
	}
    console.log(number);
    countDownFrom(number - 1);
}
countDownFrom(5); // 5 4 3 2 1

// Essay to revise until accepted:
function revise(essay) {
  read(essay);
  get_feedback_on(essay);
  apply_changes_to(essay);
  revise(essay) unless essay.complete;
}
// you do a little bit of work on ecah invocation of your method call until you hit the stopping condition
```

<br />

Đệ quy với chuỗi:

```js
// STRING REVERSAL
// input str: "the simple engineer"
// output str: "reenigne elpmis eht" - string in reverse

function revString(str) {
  // what are the steps? last char becomes 1st
  let len = str.length;
  return str[len - 1];
}
console.log(revString("the simple engineer")); // "reenigne elpmis eht"
// Uncaught RangeError: Maximum call stack size exceeded
// Uncaught RangeError: Maximum call stack size exceeded at String.substring

//
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Ví dụ MDN

Đệ quy bị giới hạn bởi kích thước ngăn xếp:

```js
// The following code defines a function that returns the maximum size of the call stack available in the JavaScript runtime in which the code is run.
const getMaxCallStackSize = i => {
  try {
    return getMaxCallStackSize(++i);
  } catch {
    return i;
  }
};

console.log(getMaxCallStackSize(0));
```

<br />

Ví dụ sử dụng phổ biến:

```js
// factorial with recursion
const factorial = n => {
  if (n === 0) return 1;
  else return n * factorial(n - 1);
};
console.log(factorial(10)); // 3628800

// fibonacci
const fibonacci = n => (n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2));
console.log(fibonacci(10)); // 55
console.log(fibonacci(6)); // 8

// reduce method example
const reduce = (fn, acc, [cur, ...rest]) => (cur === undefined ? acc : reduce(fn, fn(acc, cur), rest));
console.log(reduce((a, b) => a + b, 0, [1, 2, 3, 4, 5, 6, 7, 8, 9])); // 45
```

Hãy xem _ngăn xếp lời gọi (call stack)_ được đề cập trong [A Quick Intro to Recursion in Javascript](https://www.freecodecamp.org/news/quick-intro-to-recursion/) của freeCodeCamp.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Ghi chú về đệ quy

Ghi chú về Video [Recursion in Programming - Full Course](https://youtu.be/IJDJ0kBx2LM) từ freeCodeCamp:

- 1. Lượng công việc ít nhất mà tôi có thể làm là gì? Các bài toán con là gì? Làm thế nào để bạn lấy một bài toán lớn và chia nó thành các bài toán con?
- 2. Điều kiện dừng của tôi là gì? Khi nào quá trình sẽ hoàn tất? Điều kiện dừng là gì?
- **Ngăn xếp lời gọi (Call Stack)**: khung ngăn xếp (stack frame) -> A phụ thuộc vào B, B phụ thuộc vào C, rồi đến C

**ƯU ĐIỂM**:

- thu hẹp khoảng cách giữa sự tao nhã và phức tạp. Các ví dụ của anh ấy sẽ là những phép duyệt phức tạp qua các cấu trúc dữ liệu như cây và đồ thị.
- Ngoài ra, giảm nhu cầu về vòng lặp phức tạp và cấu trúc dữ liệu phụ trợ. Đơn giản hóa mã của bạn.
- có thể giảm độ phức tạp thời gian (ghi nhớ - memoization)
- hoạt động rất tốt với các cấu trúc dữ liệu như **_đối tượng JSON_**, **_cây_** và **_đồ thị_** — những thứ cho phép bạn tập trung vào một đơn vị rất nhỏ của cấu trúc dữ liệu tại một thời điểm

**NHƯỢC ĐIỂM**:

- chậm do chi phí CPU. Có thể trở nên lộn xộn với các cấu trúc dữ liệu đệ quy.
- có thể dẫn đến lỗi hết bộ nhớ / ngoại lệ tràn ngăn xếp
- có thể phức tạp nếu được xây dựng kém. Luôn tự hỏi, "_Đây có phải là trường hợp sử dụng tốt cho đệ quy không?_"

> _Uncaught RangeError: Maximum call stack size exceeded_

LƯU Ý: Đối với đệ quy chuỗi, rất thường bạn có thể làm cho nó dễ hơn bằng cách đánh giá độ dài đầu vào — vì vậy hãy thử với chuỗi có độ dài 0 và 1 —

ĐỆ QUY SỐ

- Bài toán thứ nhất — chuyển đổi cơ số 10 sang nhị phân —
- -

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Linh tinh 2

- tham số (parameters) vs đối số (arguments)
- phạm vi (scope)
- `return`:
- `undefined`:

Các khái niệm khác từ [Tài liệu Hàm của MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions): Phạm vi và ngăn xếp hàm, Đệ quy, Bảo toàn biến, Không có `this` riêng biệt, và Hàm định sẵn.

#### Hàm định sẵn

- KHÔNG SỬ DỤNG: `eval()`, `uneval()`, `escape()`, và `unescape()`.
- ĐƯỢC PHÉP SỬ DỤNG: `isFinite()`, `isNaN()`, `parseFloat()`, `parseInt()` với `radix`, `decodeURI()`, `decodeURIComponent()`, `encodeURI()`, và `encodeURIComponent()`

`isNaN()`: xác định một giá trị có phải là NaN hay không; bạn có thể muốn sử dụng `Number.isNaN()` thay thế.

`decodeURI()`: giải mã một Định danh Tài nguyên Thống nhất (URI) đã được tạo trước đó bởi `encodeURI` hoặc bởi một quy trình tương tự.

`decodeURIComponent()`: giải mã một thành phần của Định danh Tài nguyên Thống nhất (URI) đã được tạo trước đó bởi `encodeURIComponent` hoặc bởi một quy trình tương tự.

`encodeURI()`: mã hóa một Định danh Tài nguyên Thống nhất (URI) bằng cách thay thế mỗi phiên bản của một số ký tự nhất định bằng một, hai, ba hoặc bốn chuỗi thoát biểu diễn mã hóa UTF-8 của ký tự (sẽ chỉ có bốn chuỗi thoát cho các ký tự được tạo thành từ hai ký tự "thay thế" (surrogate)).

`encodeURIComponent()`: mã hóa một thành phần của Định danh Tài nguyên Thống nhất (URI) bằng cách thay thế mỗi phiên bản của một số ký tự nhất định bằng một, hai, ba hoặc bốn chuỗi thoát biểu diễn mã hóa UTF-8 của ký tự (sẽ chỉ có bốn chuỗi thoát cho các ký tự được tạo thành từ hai ký tự "thay thế" (surrogate)).

<br />

### Promise trong ES6

Đối tượng `Promise` đại diện cho việc hoàn thành (hoặc thất bại) cuối cùng của một thao tác bất đồng bộ và giá trị kết quả của nó.

Một `Promise` là một proxy cho một giá trị không nhất thiết đã biết khi promise được tạo. Nó cho phép bạn liên kết các trình xử lý với giá trị thành công cuối cùng hoặc lý do thất bại của một hành động bất đồng bộ. Điều này cho phép các phương thức bất đồng bộ trả về giá trị giống như các phương thức đồng bộ: thay vì trả về ngay lập tức giá trị cuối cùng, phương thức bất đồng bộ trả về một promise sẽ cung cấp giá trị tại một thời điểm nào đó trong tương lai.

Một Promise ở một trong các trạng thái sau:

- _pending_: trạng thái ban đầu, chưa được thực hiện cũng chưa bị từ chối.
- _fulfilled_: nghĩa là thao tác đã hoàn thành thành công.
- _rejected_: nghĩa là thao tác đã thất bại.

Một promise đang chờ (pending) có thể được thực hiện (fulfilled) với một giá trị hoặc bị từ chối (rejected) với một lý do (lỗi). Khi một trong hai trường hợp này xảy ra, các trình xử lý liên quan được xếp hàng bởi phương thức `then` của promise sẽ được gọi. Nếu promise đã được thực hiện hoặc bị từ chối khi một trình xử lý tương ứng được gắn vào, trình xử lý sẽ vẫn được gọi, vì vậy không có tình trạng chạy đua giữa việc một thao tác bất đồng bộ hoàn thành và việc các trình xử lý của nó được gắn vào.

Vì các phương thức `Promise.prototype.then()` và `Promise.prototype.catch()` trả về các promise, chúng có thể được nối chuỗi.

Xem thêm: [MDN Chained Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#chained_promises), [MDN Incumbent settings object tracking](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#incumbent_settings_object_tracking), [MDN Constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#constructor), [MDN Static methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#static_methods), và [MDN Instance methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#instance_methods)

```js
// lesson 29 freeCodeCamp
const myPromise = new Promise((resolve, reject) => {
  if (conditionhere) {
    resolve("Promise was fulfilled");
  } else {
    reject("Promise was rejected");
  }
});
// or this
const makeServerRequest = new Promise((resolve, reject) => {
  let responseFromServer;

  if (responseFromServer) {
    resolve("We got the data");
  } else {
    reject("Data not received");
  }
});

// lesson 30 & 31 freeCodeCamp (confusing)
const makeServerRequest = new Promise((resolve, reject) => {
  // responseFromServer is set to false to represent an unsuccessful response from a server
  let responseFromServer = true;

  if (responseFromServer) {
    resolve("We got the data");
  } else {
    reject("Data not received");
  }
});

makeServerRequest.then(result => {
  console.log(result);
});

makeServerRequest.catch(error => {
  console.log(error);
});
```

- Promise, new, resolve, reject
- pending, fulfilled, rejected
- then, result, catch, try, error
- refactor

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Hàm động

```js
let foods = {
  apples: 25,
  oranges: 32,
  plums: 28,
  bananas: 13,
  grapes: 35,
  strawberries: 27
};

function checkInventory(scannedItem) {
  return foods[scannedItem];
}
// console.log(checkInventory("apples"));
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Ngẫu nhiên

- **freeCodeCamp**: Các hàm được coi là đối tượng hạng nhất trong JavaScript, nghĩa là chúng có thể được sử dụng như bất kỳ đối tượng nào khác. Chúng có thể được lưu trong biến, lưu trữ trong một đối tượng, hoặc truyền làm tham số của hàm.

Web Dev Simplified: Một khi bạn nhận ra điều này, bạn sẽ không bao giờ vật lộn với hàm gọi lại nữa

- Hàm là biến giống như mọi thứ khác:

```js
function test() {
  console.log("Hello");
}

const test2 = test;
console.log(test2 === test); // true
test.prop = "Hi";
console.dir(test); // prop: "Hi" prototype, name, length,...
```

Function.prototype.bind():

[MDN bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind): tạo ra một hàm mới mà khi được gọi, từ khóa this của nó được đặt thành giá trị đã cung cấp, với một chuỗi tham số cho trước đứng trước bất kỳ tham số nào được cung cấp khi hàm mới được gọi (???)

```js
// syntax
bind(thisArg)
bind(thisArg, arg1)
bind(thisArg, arg1, arg2)
bind(thisArg, arg1, ... , argN)
```

Các thuật ngữ khác:

- cách tiếp cận mệnh lệnh (imperative approach)
- lập trình khai báo (declarative programming)
- đột biến (mutation), tác dụng phụ (side effect), hàm thuần túy (pure function)
- đối tượng hạng nhất (first class objects)
- 10. Triển khai phương thức filter trên Prototype

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>
