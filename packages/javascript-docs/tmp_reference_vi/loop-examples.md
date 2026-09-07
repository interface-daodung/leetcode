# Vòng lặp và duyệt

Ghi chú cho các đoạn code vòng lặp không quá phổ biến.

<div id="back-to-top"></div>

## Mục lục

1. [Vòng lặp while](#while-loop)
1. [Vòng lặp do while](#do-while-loop)
1. [Vòng lặp for](#for-loop)
1. [Vòng lặp for in và for of](#for-in-and-for-of-loops)
1. [Phương thức mảng](#array-methods)
1. [Continue và break](#continue-and-break)
1. [Linh tinh](#miscellaneous)


## Vòng lặp while

Câu lệnh `while` tạo một vòng lặp thực thi một câu lệnh xác định miễn là `condition` kiểm tra có giá trị true. Điều kiện được đánh giá trước khi thực thi câu lệnh.

- `condition`: Một biểu thức được đánh giá trước mỗi lần đi qua vòng lặp. Nếu điều kiện này đánh giá thành `true`, câu lệnh được thực thi. Khi điều kiện đánh giá thành `false`, việc thực thi tiếp tục với câu lệnh sau vòng lặp while

Cú pháp:
```js
while (condition)
  statement

// example
let i = 0;
do {
  i += 1;
  console.log(i);
} while (i < 5);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Vòng lặp do while

Câu lệnh do...while tạo một vòng lặp thực thi một câu lệnh xác định cho đến khi điều kiện kiểm tra đánh giá thành false. Điều kiện được đánh giá sau khi thực thi câu lệnh, do đó câu lệnh xác định được thực thi ít nhất một lần.

- `condition`: Một biểu thức được đánh giá sau mỗi lần đi qua vòng lặp. Nếu điều kiện đánh giá thành `true`, câu lệnh được thực thi lại. Khi điều kiện đánh giá thành `false`, điều khiển chuyển sang câu lệnh theo sau `do...while`

Cú pháp:
```js
do
  statement
while (condition);

// example
let n = 0;
let x = 0;
while (n < 3) {
  n++;
  x += n;
}
```


<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Vòng lặp for

Vòng lặp `for` lặp lại cho đến khi một điều kiện xác định đánh giá thành `false`.

Cú pháp:
```js
for ([initialExpression]; [conditionExpression]; [incrementExpression])
  statement
// or 
for  (initialization; condition; final-expression)

// example
let arr = [1, 2, 3, 4, 5, 6, 7];
function someFx() {
  for (let i = 0; i < arr.length; i++) {
    // code here
  }
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Vòng lặp for in và for of

> Sự khác biệt giữa vòng lặp `for...of` và vòng lặp `for...in`: trong khi `for...in` duyệt qua các **<ins>tên/khóa</ins>** thuộc tính, `for...of` duyệt qua các **<ins>giá trị</ins>** thuộc tính.

### for in

Câu lệnh `for...in` duyệt một biến xác định qua tất cả các thuộc tính có thể đếm được (enumerable) của một đối tượng. Với mỗi thuộc tính riêng biệt, JavaScript thực thi các câu lệnh xác định.

`for in`, cú pháp:
```js
for (variable in object) {
  statement
}
```

Ví dụ:
```js
const user = {
  first: "Jim",
  last: "Kernix",
  age: 56
}

for (let x in user) {
  console.log(x); // returns the keys
  console.log(user[x]); // returns the values
}

// example 2
function dump_props(obj, obj_name) {
  let result = '';
  for (let i in obj) {
    result += obj_name + '.' + i + ' = ' + obj[i] + '<br>';
  }
  result += '<hr>';
  return result;
}
// For an object car with properties make and model, result would be:
car.make = Ford
car.model = Mustang
```

<br />

### for of

Câu lệnh `for...of` tạo một vòng lặp duyệt qua các đối tượng có thể duyệt (iterable) (bao gồm `Array`, `Map`, `Set`, đối tượng `arguments` v.v.), gọi một hook duyệt tùy chỉnh với các câu lệnh được thực thi cho giá trị của mỗi thuộc tính riêng biệt (?)

Cú pháp:
```js
for (variable of iterable) {
  statement
}
```

Ví dụ:
```js
const arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
   console.log(i); // logs "0", "1", "2", "foo"
}

for (let i of arr) {
   console.log(i); // logs 3, 5, 7
}

// my example: Sum All Odd Fibonacci Numbers
function sumFibs(num) {
  if (num <= 0) return 0;

  const startNums = [1, 1];
  let nextNum = 0;

  for (let i of startNums) {
    let nextNum = startNums[i - 1] + startNums[i];
    if (nextNum <= num) {
      startNums.unshift(nextNum);
    }
  }
  return startNums.filter(x => x % 2 != 0).reduce((a, b) => a + b);
}
sumFibs(4);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Phương thức mảng

Sử dụng các phương thức mảng bậc cao như `map` và `forEach` thay vì vòng lặp `for` khi làm việc với mảng:

`forEach()`

cú pháp:
```js
cars.forEach(function(a, b, c) {})
```

Ví dụ:
```js
const cars = ["Ford", "Honda", "Toyota", "Chevy"];

cars.forEach(function(car) {
  console.log(car);
});

```

<br />

`map()`: mảng các đối tượng

```js
const users = [
  {id: 1, name: "Jim"},
  {id: 2, name: "Buddy"},
  {id: 3, name: "Luna"}
];

const ids = users.map(function(user) {
  return user.id;
});
console.log(ids); // (3) [1, 2, 3]
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Continue và break

Sử dụng câu lệnh `break` để kết thúc một vòng lặp, `switch`, hoặc kết hợp với một câu lệnh có nhãn. Xem [MDN break statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#break_statement).

Câu lệnh `continue` có thể được dùng để khởi động lại câu lệnh `while`, `do-while`, `for`, hoặc `label`. Xem [MDN continue statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration#continue_statement).

Cú pháp break:
```js
break;
break [label];

// example
for (let i = 0; i < a.length; i++) {
  if (a[i] === theValue) {
    break;
  }
}
```

<br />

Cú pháp continue:
```js
continue [label];

// example 1
for (let i = 0; i > 10, i++) {
  if (i === 2) {
    console.log("The number 2 is great");
    continue;
  }

  if (i === 5) {
    break;
  }

  console.log("Number " + i)
}

// example 2
let i = 0;
let n = 0;
while (i < 5) {
  i++;
  if (i === 3) {
    continue;
  }
  n += i;
  console.log(n);
}
//1,3,7,12

let i = 0;
let n = 0;
while (i < 5) {
  i++;
  if (i === 3) {
     // continue;
  }
  n += i;
  console.log(n);
}
// 1,3,6,10,15

// example 3
let i = 0;
let j = 10;
checkiandj:
  while (i < 4) {
    console.log(i);
    i += 1;
    checkj:
      while (j > 4) {
        console.log(j);
        j -= 1;
        if ((j % 2) === 0) {
          continue checkj;
        }
        console.log(j + ' is odd.');
      }
      console.log('i = ' + i);
      console.log('j = ' + j);
  }
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Linh tinh

- bộ tích lũy (accumulators)
- đệ quy: ví dụ trong [function-examples.md](https://github.com/Kernix13/javascript-cheat-sheet/blob/master/function-examples.md)

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>