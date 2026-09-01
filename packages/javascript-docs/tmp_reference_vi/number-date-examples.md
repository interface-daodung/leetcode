# Phương thức Number và Date

Ví dụ đơn giản về số, Math và Date.

<div id="back-to-top"></div>

## Mục lục

|                                Chủ đề | Chủ đề con                            | Chủ đề con                            | Chủ đề con                  |
| ------------------------------------: | :------------------------------------ | :------------------------------------ | :-------------------------- |
|  [Phương thức Number](#number-methods): | [toExponential](#toexponential)       | [toFixed](#tofixed)                   | [toPrecision](#toprecision) |
|                                       | [isFinite](#isfinite)                 | [isInteger](#isinteger)               | [isNaN](#isnan)             |
|                                       | [parseInt](#parseint)                 | [parseFloat](#parsefloat)             |                             |
|      [Phương thức Math](#math-methods): | [absolute](#absolute)                 | [ceiling](#ceiling)                   | [floor](#floor)             |
|                                       | [random](#random)                     | [round](#round)                       | [sign](#sign)               |
|                                       | [square root](#square-root)           | [truncate](#truncate)                 | [max](#max)                 |
|                                       | [min](#min)                           | [power](#power)                       | [PI](#pi)                   |
|                                       | [sqrt](#sqrt)                         | [cosine](#cosine)                     | [sine](#sine)               |
|                                       | [tangent](#tangent)                   |                                       |                             |
| [Toán tử spread](#spread-operator) |                                       |                                       |                             |
|   [Tham số rest](#rest-parameter) |                                       |                                       |                             |
|     [Ví dụ Date](#date-examples) | [Phương thức get của Date](#date-get-methods) | [Phương thức set của Date](#date-set-methods) |                             |
|     [Linh tinh](#miscellaneous) |                                       |                                       |                             |
|     [Bảng cú pháp](#syntax-tables) | [Số](#numbers)                   | [Lấy ngày](#get-dates)               | [Đặt ngày](#set-dates)     |

## Phương thức Number

Dưới đây là các liên kết tới tài liệu MDN cho các phương thức bên dưới:

|                                                                                                                            |                                                                                                                    |                                                                                                                        |
| :------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| [MDN toExponential](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential) |   [MDN toFixed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)   | [MDN toPrecision](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision) |
|         [MDN isFinite](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)          | [MDN isInteger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) |  [MDN parseFloat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat)  |
|         [MDN parseInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)          |                                                                                                                    |                                                                                                                        |

Đã bỏ qua: `Number.isSafeInteger()`, `toLocaleString()`, `toString()` và `valueOf()`.

### toExponential

Phương thức `toExponential()` trả về một chuỗi biểu diễn đối tượng Number ở dạng ký hiệu số mũ.

toExponential(): Không thấy ứng dụng thực tế của phương thức này

```js
// syntax
toExponential();
toExponential(fractionDigits);
// fractionDigits: Optional. An integer specifying the number of digits after the decimal point

// MDN examples
function expo(x, f) {
  return Number.parseFloat(x).toExponential(f);
}
console.log(expo(123456, 2)); // "1.23e+5"
console.log(expo("123456")); // "1.23456e+5"
console.log(expo("word")); // NaN
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toExponential">MDN toExponential</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### toFixed

Phương thức `toFixed()` định dạng một số bằng ký hiệu điểm cố định.

toFixed(n)

```js
// syntax
toFixed();
toFixed(digits);
// digits: The number of digits (0-20) to appear after the decimal point

// example
function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}
console.log(financial(123.456));
console.log(financial(0.004));
console.log(financial("1.23e+5"));

let numObj = 12345.6789;

numObj.toFixed(); // '12346': note rounding, no fractional part
numObj.toFixed(1); // '12345.7': note rounding
numObj
  .toFixed(6)(
    // '12345.678900': note added zeros
    1.23e20
  )
  .toFixed(2)(
    // '123000000000000000000.00'
    1.23e-10
  )
  .toFixed(2); // '0.00'
(2.34).toFixed(1); // '2.3'
(2.35).toFixed(1); // '2.4'. Note it rounds up
(2.55).toFixed(1) - // '2.5'. Note it rounds down - see warning above
  (2.34)
    .toFixed(1)(
      //  -2.3
      -2.34
    )
    .toFixed(1); // '-2.3'
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed">MDN toFixed</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### toPrecision

Phương thức `toPrecision() ` trả về một chuỗi biểu diễn đối tượng Number với độ chính xác được chỉ định.

toPrecision(n)

```js
// syntax
toPrecision();
toPrecision(precision);
// precision: An integer specifying the number of significant digits

// examples
function precise(x) {
  return x.toPrecision(4);
}
console.log(precise(123.456)); // "123.5"
console.log(precise(0.004)); // "0.004000"

let numObj = 5.123456;

console.log(numObj.toPrecision()); // logs '5.123456'
console.log(numObj.toPrecision(5)); // logs '5.1235'
console.log(numObj.toPrecision(2)); // logs '5.1'
console.log(numObj.toPrecision(1)); // logs '5'

numObj = 0.000123;

console.log(numObj.toPrecision()); // logs '0.000123'
console.log(numObj.toPrecision(5)); // logs '0.00012300'
console.log(numObj.toPrecision(2)); // logs '0.00012'
console.log(numObj.toPrecision(1)); // logs '0.0001'
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toPrecision">MDN toPrecision</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### isFinite

Hàm toàn cục `isFinite()` xác định xem giá trị được truyền vào có phải là một số hữu hạn hay không. Nếu cần, tham số sẽ được chuyển đổi thành số trước.

isFinite(): Giá trị trả về = `false` nếu đối số là (hoặc sẽ được ép kiểu thành) Infinity dương hoặc âm hoặc `NaN` hoặc `undefined`; ngược lại là `true`.

```js
// syntax
isFinite(testValue);

// examples
function div(x) {
  if (isFinite(1000 / x)) {
    return "Number is NOT Infinity.";
  }
  return "Number is Infinity!";
}
console.log(div(0)); // "Number is Infinity!""
console.log(div(1)); // "Number is NOT Infinity."

isFinite(Infinity); // false
isFinite(NaN); // false
isFinite(-Infinity); // false
isFinite(0); // true
isFinite(2e64); // true
isFinite(910); // true
isFinite(null); // true, would've been false with the more robust Number.isFinite(null)
isFinite("0"); // true, would've been false with the more robust Number.isFinite("0")
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite">MDN isFinite</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### isInteger

Phương thức `Number.isInteger()` xác định xem giá trị được truyền vào có phải là số nguyên hay không.

Number.isInteger()

```js
// syntax
Number.isInteger(value);

// Examples:
function fits(x, y) {
  if (Number.isInteger(y / x)) {
    return "Fits!";
  }
  return "Does NOT fit!";
}
console.log(fits(5, 10)); // "Fits!"
console.log(fits(5, 11)); // "Does NOT fit!"

Number.isInteger(0); // true
Number.isInteger(1); // true
Number.isInteger(-100000); // true
Number.isInteger(99999999999999999999999); // true

Number.isInteger(0.1); // false
Number.isInteger(Math.PI); // false

Number.isInteger(NaN); // false
Number.isInteger(Infinity); // false
Number.isInteger(-Infinity); // false
Number.isInteger("10"); // false
Number.isInteger(true); // false
Number.isInteger(false); // false
Number.isInteger([1]); // false

Number.isInteger(5.0); // true
Number.isInteger(5.000000000000001); // false
Number.isInteger(5.0000000000000001); // true
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger">MDN isInteger</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### isNaN

Hàm `isNaN()` xác định xem một giá trị có phải là NaN hay không, trả về giá trị boolean. Hãy xem mục [hành vi trường hợp đặc biệt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN#confusing_special-case_behavior) để biết các kết quả _lạ_.

```js
// syntax
isNaN(value);

// special cases
isNaN(NaN); // true
isNaN(undefined); // true
isNaN({}); // true

isNaN(true); // false
isNaN(null); // false
isNaN(37); // false
isNaN("37"); // false: converted to 37

let average = review.reduce((a, b) => a + b.rating, 0) / review.length;
isNaN(average) ? 0 : average; // checks for division by zero
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN">MDN isNaN</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### parseInt

Hàm `parseInt()` phân tích cú pháp một đối số chuỗi và trả về một số nguyên theo cơ số được chỉ định. `radix`: Một số nguyên từ `2` đến `36` biểu thị cơ số (cơ số trong hệ số học) của chuỗi. Hãy cẩn thận — giá trị này không mặc định là `10`! Nếu giá trị radix không thuộc kiểu `Number` thì nó sẽ được ép kiểu thành `Number`??? `radix` chỉ định cơ số của số trong chuỗi.

parseInt():

```js
// syntax
parseInt(string);
parseInt(string, radix);

// Examples:
const a = parseInt("007"); // 7

const year = parseInt("2022");
console.log(parseInt(year)); // 2022
console.log(parseInt("-421")); // -421
console.log(parseInt("+421")); // 421

// with radix
const a = parseInt("17", 10); // "17" equals 17 in base 10
const a = parseInt("17", 8); // 17 in base 8 = 15
const a = parseInt("11", 2); // 11 in base 2 = 3
const a = parseInt("111", 2); // 111 in base 2 = 7
// You are only going to do calculations in other bases for science based websites

// How to Convert a Binary String Into a Decimal Number
const binary = "01001001";
const decimal = Number.parseInt(binary, 2); // 73
// then convert that to a character:
console.log(String.fromCharCode(decimal)); // "I"
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt">MDN parseInt</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### parseFloat

Phương thức `Number.parseFloat()` phân tích cú pháp một đối số và trả về một số thực dấu phẩy động. Nếu không thể phân tích được số từ đối số, nó trả về `NaN`.

Number.parseFloat()

```js
// synta  x
Number.parseFloat(string);

// examples:
// confusing
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat">MDN parseFloat</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Phương thức Math

Dưới đây là các liên kết tới tài liệu MDN cho các phương thức Math phổ biến nhất:

|                                                                                                                 |                                                                                                               |                                                                                                               |
| :-------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------: |
|    [MDN Math.abs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs)    |  [MDN Math.ceil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)  | [MDN Math.floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor) |
| [MDN Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) | [MDN Math.round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) |  [MDN Math.sign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign)  |
|   [MDN Math.sqrt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt)   | [MDN Math.trunc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc) |   [MDN Math.max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max)   |
|    [MDN Math.min](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min)    |   [MDN Math.pow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow)   |   [MDN Math.cos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos)   |
|    [MDN Math.sin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin)    |   [MDN Math.tan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tan)   |                                                                                                               |

<br />

### absolute

`Math.abs()`

```js
// syntax
Math.abs(x);

// examples
function difference(a, b) {
  return Math.abs(a - b);
}
console.log(difference(3, 5)); // 2
console.log(difference(5, 3)); // 2
console.log(difference(1.23456, 7.89012)); // 6.6555599999999995

Math.abs("-1"); // 1
Math.abs(-2); // 2
Math.abs(null); // 0
Math.abs(""); // 0
Math.abs([]); // 0
Math.abs([2]); // 2
Math.abs([1, 2]); // NaN
Math.abs({}); // NaN
Math.abs("string"); // NaN
Math.abs(); // NaN
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs">MDN Math.abs</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### ceiling

`Math.ceil()`: luôn làm tròn một số lên số nguyên lớn hơn tiếp theo.

```js
// syntax
Math.ceil(x);

// examples
console.log(Math.ceil(0.95)); // 1
console.log(Math.ceil(7.004)); // 8
console.log(Math.ceil(-7.004)); // -7

// You can also use double tildes (~~) with Math.ceil
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil">MDN Math.ceil</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### floor

`Math.floor()`: trả về số nguyên lớn nhất nhỏ hơn hoặc bằng một số đã cho

```js
// syntax
Math.floor(x);

// examples
Math.floor(45.95); //  45
Math.floor(45.05); //  45
Math.floor(4); //   4
Math.floor(-45.05); // -46
Math.floor(-45.95); // -46

// You can also use double tildes (~~)
console.log(~~45.95); // 45
console.log(~~45.95); // 45
console.log(~~-45.95); // -45
console.log(~~-45.95); // -45

// Single tilde (~) reverses the sign and ...
console.log(~45.95); // -46 like Math.floor
console.log(~45.95); // -46 like Math.floor
console.log(~-45.95); // -44, no clue
console.log(~-45.95); // -44, no clue
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor">MDN Math.floor</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### random

`Math.random()`: trả về một số giả ngẫu nhiên dấu phẩy động trong khoảng từ 0 đến nhỏ hơn 1 (bao gồm 0, nhưng không bao gồm 1) với phân bố gần như đồng đều trên khoảng đó — sau đó bạn có thể co giãn theo khoảng mong muốn

```js
// syntax
Math.random();

// examples
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
console.log(getRandomInt(3)); // 1
console.log(getRandomInt(1)); // 0
console.log(Math.random()); // 0.random numbers
```

<br />

`Math.floor(Math.random())`: 105 tạo số nguyên ngẫu nhiên trong một khoảng:

```js
function randomRange(myMin, myMax) {
  return Math.floor(Math.random() * (myMax - myMin + 1) + myMin);
}
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random">MDN Math.random</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### round

`Math.round()`: trả về giá trị của một số được làm tròn tới số nguyên gần nhất

```js
// syntax
Math.round(x);

// examples
console.log(Math.round(0.9)); // 1
console.log(Math.round(5.95), Math.round(5.5), Math.round(5.05)); // 6 6 5
console.log(Math.round(-5.05), Math.round(-5.5), Math.round(-5.95)); // -5 -5 -6

Math.round(20.49); //  20
Math.round(20.5); //  21
Math.round(42); //  42
Math.round(-20.5); // -20
Math.round(-20.51); // -21

// You can also use double tildes (~~) with Math.round
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round">MDN Math.round</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### sign

`Math.sign()`: trả về dương hoặc âm +/- 1, cho biết dấu của số được truyền vào đối số. Nếu số truyền vào `Math.sign()` là 0, nó sẽ trả về +/- 0. Lưu ý rằng nếu số là dương, dấu (+) tường minh sẽ không được trả về.

```js
// syntax
Math.sign(x);

// examples
console.log(Math.sign(3)); // 1
console.log(Math.sign(-3)); // -1
console.log(Math.sign(0)); // 0
console.log(Math.sign("-3")); // -1

Math.sign(3); //  1
Math.sign(-3); // -1
Math.sign("-3"); // -1
Math.sign(0); //  0
Math.sign(-0); // -0
Math.sign(NaN); // NaN
Math.sign("foo"); // NaN
Math.sign(); // NaN
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign">MDN Math.sign</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### square root

`Math.sqrt()`: trả về căn bậc hai của một số

```js
// syntax
Math.sqrt(x);

// examples
function calcHypotenuse(a, b) {
  return Math.sqrt(a * a + b * b);
}
console.log(calcHypotenuse(3, 4)); // 5
console.log(calcHypotenuse(5, 12)); // 13
console.log(calcHypotenuse(0, 0)); // 0

Math.sqrt(9); // 3
Math.sqrt(2); // 1.414213562373095
Math.sqrt(1); // 1
Math.sqrt(0); // 0
Math.sqrt(-1); // NaN
Math.sqrt(-0); // -0
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt">MDN Math.sqrt</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### truncate

`Math.trunc()`: trả về phần nguyên của một số bằng cách loại bỏ mọi chữ số thập phân

```js
// syntax
Math.trunc(x);

// examples
console.log(Math.trunc(13.37)); // 13
console.log(Math.trunc(42.84)); // 42
console.log(Math.trunc(0.123)); // 0
console.log(Math.trunc(-0.123)); // 0

Math.trunc(13.37); // 13
Math.trunc(42.84); // 42
Math.trunc(0.123); //  0
Math.trunc(-0.123); // -0
Math.trunc("-1.123"); // -1
Math.trunc(NaN); // NaN
Math.trunc("foo"); // NaN
Math.trunc(); // NaN
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc">MDN Math.trunc</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### max

`Math.max()`: trả về số lớn nhất trong số không hoặc nhiều số được cho làm tham số đầu vào, hoặc `NaN` nếu bất kỳ tham số nào không phải là số và không thể chuyển đổi thành số.

```js
// syntax
Math.max();
Math.max(value0);
Math.max(value0, value1);
Math.max(value0, value1, /* ... ,*/ valueN);

// examples
console.log(Math.max(1, 3, 2)); // 3
console.log(Math.max(-1, -3, -2)); // -1
const array1 = [1, 3, 2];
console.log(Math.max(...array1)); // 3

Math.max(10, 20); //  20
Math.max(-10, -20); // -10
Math.max(-10, 20); //  20

// with reduce
let arr = [1, 2, 3];
let max = arr.reduce(function (a, b) {
  return Math.max(a, b);
}, -Infinity);
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max">MDN Math.max</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### min

`Math.min()`: trả về số có giá trị thấp nhất được truyền vào nó, hoặc `NaN` nếu bất kỳ tham số nào không phải là số và không thể chuyển đổi thành số.

```js
// syntax
Math.min()
Math.min(value0)
Math.min(value0, value1)
Math.min(value0, value1, ... , valueN)

// examples
console.log(Math.min(2, 3, 1)); // 1
console.log(Math.min(-2, -3, -1)); // -3
const array1 = [2, 3, 1];
console.log(Math.min(...array1));  1

let x = 10, y = -20;
let z = Math.min(x, y);
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min">MDN Math.min</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### power

`Math.pow(x, y)`: phương thức tĩnh, với hai đối số _base_ và _exponent_, trả về `base` <sup>`exp`</sup>.

```js
// syntax
Math.pow(base, exponent);

console.log(Math.pow(7, 3)); // 343
console.log(Math.pow(4, 0.5)); // 2
console.log(Math.pow(7, -2)); // 0.02040816326530612
console.log(Math.pow(-7, 0.5)); // NaN

// simple
Math.pow(7, 2); // 49
Math.pow(7, 3); // 343
Math.pow(2, 10); // 1024
// fractional exponents
Math.pow(4, 0.5); // 2 (square root of 4)
Math.pow(8, 1 / 3); // 2 (cube root of 8)
Math.pow(2, 0.5); // 1.4142135623730951 (square root of 2)
Math.pow(2, 1 / 3); // 1.2599210498948732 (cube root of 2)
// signed exponents
Math.pow(7, -2); // 0.02040816326530612 (1/49)
Math.pow(8, -1 / 3); // 0.5
// signed bases
Math.pow(-7, 2); // 49 (squares are positive)
Math.pow(-7, 3); // -343 (cubes can be negative)
Math.pow(-7, 0.5); // NaN (negative numbers don't have a real square root)
Math.pow(-7, 1 / 3); // NaN
```

**LƯU Ý**: để tìm căn bậc `n` của một số, hãy dùng `Math.pow(num, 1/n)`.

**LƯU Ý 2**: Giá trị của Phi &Phi; có thể được tính bằng `(căn bậc hai của 5 + 1) / 2` hoặc

```js
const phi = (Math.pow(5, 0.5) + 1) / 2;
console.log(phi); // 1.618033988749895
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow">MDN Math.pow</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### PI

Thuộc tính `Math.PI` biểu thị tỉ số giữa chu vi của một đường tròn và đường kính của nó, xấp xỉ 3,14159. Vì `PI` là thuộc tính tĩnh của `Math`, bạn luôn sử dụng nó như `Math.PI`, thay vì như một thuộc tính của đối tượng `Math` mà bạn đã tạo.

```js
console.log(Math.PI); // 3.141592653589793

function circleCircumferece(r) {
  return 2 * Math.PI * r;
}
console.log(circleCircumferece(10)); // 62.83185307179586

function circleArea(r) {
  return Math.PI * Math.pow(r, 2); // 314.1592653589793
}
console.log(circleArea(10));

function circleVolume(r) {
  return (4 / 3) * Math.PI * Math.pow(r, 3);
}
console.log(circleVolume(10)); // 4188.790204786391
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/PI">MDN Math.PI</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### sqrt

Hàm `Math.sqrt()` trả về căn bậc hai của một số. Nếu số là âm, `NaN` sẽ được trả về. Bạn cũng có thể dùng `Math.pow()` như đã giải thích trong phần đó.

```js
Math.sqrt(x);
Math.sqrt(9); // 3
Math.sqrt(-1); // NaN
Math.sqrt(-0); // -0

function calcHypotenuse(a, b) {
  return Math.sqrt(a * a + b * b);
}
console.log(calcHypotenuse(3, 4)); // 5
console.log(calcHypotenuse(5, 12)); // 13
console.log(calcHypotenuse(0, 0)); // 0
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt">MDN Math.sqrt</a></div>

### cosine

`Math.cos()`

Phương thức `Math.cos()` trả về một giá trị số trong khoảng từ `-1` đến `1`, biểu thị cosin của góc được cho bằng radian.

**LƯU Ý**: Để chuyển đổi độ sang radian, hãy nhân giá trị độ của bạn với PI / 180

```js
// syntax
Math.cos(x);

// Example for tarp configurations
const tarpAngle = 30;
const deg2Rad = Math.PI / 180;
const tarpCos = Math.cos(tarpAngle * deg2Rad);
console.log(tarpCos); // 0.8660254037844387
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos">MDN Math.cos</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### sine

`Math.sin()`

Phương thức `Math.sin()` trả về một giá trị số trong khoảng từ `-1` đến `1`, biểu thị sin của góc được cho bằng radian.

**LƯU Ý**: Để chuyển đổi độ sang radian, hãy nhân giá trị độ của bạn với PI / 180

```js
// syntax
Math.sin(x);

// Example for tarp configurations
const tarpAngle = 30;
const deg2Rad = Math.PI / 180;
const tarpSin = Math.sin(tarpAngle * deg2Rad);
console.log(tarpSin); // 0.49999999999999994
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin">MDN Math.sin</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### tangent

`Math.tan()`

Phương thức `Math.tan()` trả về một giá trị số biểu thị tang của góc được cho bằng radian.

**LƯU Ý**: Để chuyển đổi độ sang radian, hãy nhân giá trị độ của bạn với PI / 180

```js
// syntax
Math.tan(x);

// Example for tarp configurations
const tarpAngle = 30;
const deg2Rad = Math.PI / 180;
const tarpTan = Math.tan(tarpAngle * deg2Rad);
console.log(tarpTan); // 0.5773502691896257
```

<div align="left">&#8675; <a href="#numbers" title="numbers">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tan">MDN Math.tan</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Toán tử spread

bỏ qua các số sau số thứ 3

```js
function addThreeNumbers(x, y, z) {
  return x + y + z;
}
let args = [1, 10, 22, 3];
console.log(addThreeNumbers(...args));
```

sao chép mảng rồi đẩy thêm phần tử vào nó:

```js
let arr = [1, 2, 3];
let arr2 = [...arr]; // like arr.slice()
arr2.push(4);
```

console.log thứ nhất hiển thị một mảng, console.log thứ hai là các giá trị

```js
const grades = [99, 100, 65, 72];
const grades2 = [...grades, 97, 80, 52];
console.log(grades2);
console.log(...grades2);
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Tham số rest

CÚ PHÁP REST: ngược lại, gộp các phần tử riêng lẻ thành một mảng:

```js
const secondArray = [7, 8, 9, 10, 11, 12];
const [firstNum, secondNum, ...rest] = secondArray;
console.log(firstNum); // 7
console.log(rest); // [9, 10, 11, 12]
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Ví dụ Date

### Phương thức get của Date

Dưới đây là liên kết tới [tài liệu MDN về Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Dưới đây là các liên kết tới tài liệu MDN cho các phương thức `get` phổ biến nhất của Date:

|                                                                                                                |                                                                                                                              |                                                                                                                      |
| :------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------: |
|  [MDN getDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate)  |          [MDN getDay](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay)          | [MDN getFullYear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear) |
| [MDN getHours](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours) | [MDN getMilliseconds](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMilliseconds) |  [MDN getMinutes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMinutes)  |
| [MDN getMonth](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth) |      [MDN getSeconds](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getSeconds)      |     [MDN getTime](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)     |

<br />

getDate()

```js
// syntax
getDate();

// examples
const birthday = new Date("August 19, 1975 23:15:30");
const date1 = birthday.getDate();
console.log(date1); // 19
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDate">MDN getDate</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getDay()

```js
// syntax
getDay();

// example
const birthday = new Date("August 19, 1975 23:15:30");
const day1 = birthday.getDay();
console.log(day1); // 2

// example 2:
let dayOfWeek = new Date().getDay(); // returns weekday as a number 0-6
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay">MDN getDay</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getFullYear()

```js
// syntax
getFullYear();

// example
const moonLanding = new Date("July 20, 69 00:20:18");
console.log(moonLanding.getFullYear()); // 1969

// assign the four-digit value of the current year to the variable
let today = new Date();
let year = today.getFullYear();
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear">MDN getFullYear</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getHours()

```js
// syntax
getHours();

// example
const birthday = new Date("March 13, 08 04:20");
console.log(birthday.getHours()); // 4

let Xmas95 = new Date("December 25, 1995 23:15:30");
let hours = Xmas95.getHours();
console.log(hours); // 23
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getHours">MDN getHours</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getMilliseconds()

```js
// syntax
getMilliseconds();

// example
const moonLanding = new Date("July 20, 69 00:20:18");
moonLanding.setMilliseconds(123);
console.log(moonLanding.getMilliseconds()); // 123

// assign the milliseconds portion of the current time to the variable milliseconds
let today = new Date();
let milliseconds = today.getMilliseconds();
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMilliseconds">MDN getMilliseconds</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getMinutes()

```js
// syntax
getMinutes();

// example
const birthday = new Date("March 13, 08 04:20");
console.log(birthday.getMinutes()); // 20

// assign the value 15 to the variable minutes
let Xmas95 = new Date("December 25, 1995 23:15:30");
let minutes = Xmas95.getMinutes();
console.log(minutes); // 15
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMinutes">MDN getMinutes</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getMonth()

```js
// syntax
getMonth();

// example
const moonLanding = new Date("July 20, 69 00:20:18");
console.log(moonLanding.getMonth()); // 6

// assign the value 11 to the variable month
let Xmas95 = new Date("December 25, 1995 23:15:30");
let month = Xmas95.getMonth();
console.log(month); // 11
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth">MDN getMonth</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getSeconds()

```js
// syntax
getSeconds();

// example
const moonLanding = new Date("July 20, 69 00:20:18");
console.log(moonLanding.getSeconds()); // 18

// assign the value 30 to the variable seconds
let Xmas95 = new Date("December 25, 1995 23:15:30");
let seconds = Xmas95.getSeconds();
console.log(seconds); // 30
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getSeconds">MDN getSeconds</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

getTime()

```js
// syntax
getTime();

// example
const moonLanding = new Date("July 20, 69 20:17:40 GMT+00:00");
console.log(moonLanding.getTime()); // -14182940000

// Using getTime() for copying dates
// Since month is zero based, birthday will be January 10, 1995
let birthday = new Date(1994, 12, 10);
let copy = new Date();
copy.setTime(birthday.getTime());
```

<div align="left">&#8675; <a href="#get-dates" title="get-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime">MDN getTime</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Phương thức set của Date

Dưới đây là các liên kết tới tài liệu MDN cho các phương thức `set` phổ biến nhất của Date:

|                                                                                                                              |                                                                                                                      |                                                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------: |
|         [MDN setDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate)         | [MDN setFullYear](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setFullYear) |   [MDN setHours](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours)   |
| [MDN setMilliseconds](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMilliseconds) |  [MDN setMinutes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMinutes)  |   [MDN setMonth](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMonth)   |
|      [MDN setSeconds](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setSeconds)      |     [MDN setTime](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setTime)     | [MDN setUTCDate](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setUTCDate) |

Việc định dạng các giá trị ngày và giờ khá phức tạp. Hãy xem các liên kết sau

- freeCodeCamp: [How to Format Dates in JavaScript](https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/)
- Stackoverflow: [How to format a JavaScript date](https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date)
- CSS Tricks: [Everything You Need to Know About Date in JavaScript](https://css-tricks.com/everything-you-need-to-know-about-date-in-javascript/)

<br />

setDate()

```js
// syntax
setDate(dayValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setDate(24);
console.log(eventDate.getDate()); // 24
console.log(eventDate.getDate()); // 1
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setDate">MDN setDate</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setFullYear()

```js
// syntax
setFullYear(yearValue);
setFullYear(yearValue, monthValue);
setFullYear(yearValue, monthValue, dateValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setFullYear(1969);
console.log(eventDate.getFullYear()); // 1969
eventDate.setFullYear(0);
console.log(eventDate.getFullYear()); // 0

// example 2
let theBigDay = new Date();
theBigDay.setFullYear(1997); // 858196084256
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setFullYear">MDN setFullYear</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setHours()

```js
// syntax
setHours(hoursValue);
setHours(hoursValue, minutesValue);
setHours(hoursValue, minutesValue, secondsValue);
setHours(hoursValue, minutesValue, secondsValue, msValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setHours(20);
console.log(eventDate); // Tue Aug 19 1975 20:15:30 GMT-0400 (Eastern Daylight Time)
eventDate.setHours(20, 21, 22);
console.log(eventDate); // Tue Aug 19 1975 20:21:22 GMT-0400 (Eastern Daylight Time)

let theBigDay = new Date();
theBigDay.setHours(7); // 1647089217263
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours">MDN setHours</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setMilliseconds()

```js
// syntax
setMilliseconds(millisecondsValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
console.log(eventDate.getMilliseconds()); // 0
eventDate.setMilliseconds(456);
console.log(eventDate.getMilliseconds()); // 456

let theBigDay = new Date();
theBigDay.setMilliseconds(100); // 1647114589100
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMilliseconds">MDN setMilliseconds</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setMinutes()

```js
// syntax
setMinutes(minutesValue);
setMinutes(minutesValue, secondsValue);
setMinutes(minutesValue, secondsValue, msValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setMinutes(45);
console.log(eventDate.getMinutes()); // 45
console.log(eventDate); // Tue Aug 19 1975 23:45:30 GMT-0400 (Eastern Daylight Time)

let theBigDay = new Date();
theBigDay.setMinutes(45); // 1647114346721
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMinutes">MDN setMinutes</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setMonth()

```js
// syntax
setMonth(monthValue);
setMonth(monthValue, dayValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setMonth(3);
console.log(eventDate.getMonth()); // 3
console.log(eventDate); // Sat Apr 19 1975 23:15:30 GMT-0400 (Eastern Daylight Time)

let theBigDay = new Date();
theBigDay.setMonth(6); // 1657651927798

// Watch out for end of month transitions
let endOfMonth = new Date(2016, 7, 31);
endOfMonth.setMonth(1);
console.log(endOfMonth); // Wed Mar 02 2016 00:00:00 GMT-0500 (Eastern Standard Time)
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMonth">MDN setMonth</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setSeconds()

```js
// syntax
setSeconds(secondsValue);
setSeconds(secondsValue, msValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30");
eventDate.setSeconds(42);
console.log(eventDate.getSeconds()); // 42
console.log(eventDate); // Tue Aug 19 1975 23:15:42 GMT-0400 (Eastern Daylight Time)

let theBigDay = new Date();
theBigDay.setSeconds(30); // 1647114870198
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setSeconds">MDN setSeconds</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setTime()

```js
// syntax
setTime(timeValue);

// example
const eventDate1 = new Date("July 1, 1999");
const eventDate2 = new Date();
eventDate2.setTime(eventDate1.getTime());
console.log(eventDate1); // Thu Jul 01 1999 00:00:00 GMT-0400 (Eastern Daylight Time)
console.log(eventDate2); // Thu Jul 01 1999 00:00:00 GMT-0400 (Eastern Daylight Time)

let theBigDay = new Date("July 1, 1999");
let sameAsBigDay = new Date();
sameAsBigDay.setTime(theBigDay.getTime()); // 930801600000
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setTime">MDN setTime</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

<br />

setUTCDate()

```js
// syntax
setUTCDate(dayValue);

// example
const eventDate = new Date("August 19, 1975 23:15:30 GMT-3:00");
console.log(eventDate.getUTCDate()); // 20
eventDate.setUTCDate(19);
console.log(eventDate.getUTCDate()); // 19

let theBigDay = new Date();
theBigDay.setUTCDate(20); // 1647806212312
```

<div align="left">&#8675; <a href="#set-dates" title="set-dates">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setUTCDate">MDN setUTCDate</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

Tại sao dùng `toString()`?

ngày hiện tại là Chủ nhật 6 tháng 3 năm 2022:

```js
const date = new Date();
console.log("date: " + date);
// date: Sat Mar 12 2022 14:57:16 GMT-0500 (Eastern Standard Time)

// Day of the month from 1 -31
console.log("Date: " + date.getDate()); // 6

// Day of the week from 0 (Sunday) to 6 (Saturday)
console.log("Day of the week: " + date.getDay()); // 0

// Hours from 0 - 23
console.log("Hours: " + date.getHours()); // 12

// Month from 0 - 11
console.log("Month: " + date.getMonth()); // 2

// Number of ms since Jan 1st 1970, used to compare dates
console.log("Time: " + date.getTime()); // Time: 1647115085769

console.log("Full year: " + date.getFullYear()); // 2022
console.log("Minutes: " + date.getMinutes()); // 28
console.log("Seconds: " + date.getSeconds()); // 31
```

<br />

Ví dụ 2:

```js
// Date for the current date and time
let d1 = new Date();
console.log("Date toString: " + d1.toString());
// Sun Mar 06 2022 12:28:31 GMT-0500 (Eastern Standard Time)
console.log("Date as object: " + d1);
// Sun Mar 06 2022 12:28:31 GMT-0500 (Eastern Standard Time)

console.log("Date toDateString: " + d1.toDateString()); // Sun Mar 06 2022
console.log("Date toTimeString: " + d1.toTimeString()); // 12:28:31 GMT-0500 (Eastern Standard Time)
console.log(typeof d1.toString()); // string
console.log(typeof d1); // object
```

<br />

Truyền vào năm, tháng và ngày:

```js
// syntax: (year, month, day, hour, minutes, seconds, milliseconds)
let d2 = new Date(2022, 2, 6, 12, 19, 23, 23);
console.log(d2); // Sun Mar 06 2022 12:19:23 GMT-0500 (Eastern Standard Time)
```

<br />

Ngày tháng với chuỗi ngày giờ:

```js
// syntax 1:
let d3 = new Date("March 6, 2022 12:24:00"); // 06 or 6 is fine
console.log(d3);
// Sun Mar 06 2022 12:24:00 GMT-0500 (Eastern Standard Time)

// syntax 2:
let d4 = new Date("2022-03-06");
console.log(d4); // Sat Mar 05 2022 19:00:00 GMT-0500 (Eastern Standard Time)

// syntax 3:
let d5 = new Date("03-06-2022");
console.log(d5); // Sun Mar 06 2022 00:00:00 GMT-0500 (Eastern Standard Time)

// syntax 3:
let d6 = new Date("Mar 6 2022"); // or March
console.log(d6); // Sun Mar 06 2022 00:00:00 GMT-0500 (Eastern Standard Time)
```

<br />

Tính thời gian đã trôi qua:

```js
let start = new Date();
elapsedTime();
let end = new Date();
let elapsed = end.getTime() - start.getTime();
console.log(elapsed);
// 3ms for 1000000, 13 for 10000000, 110 for 100000000, ...

function elapsedTime() {
  for (let i = 0; i < 100000000; i++) {
    // nothing inside, shows ms to run the loop??? add more zeros
  }
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Linh tinh

typeof:

```js
let typeOfTest;
typeOfTest = 0;
console.log(typeof typeOfTest); // number
typeOfTest = -0; // number
typeOfTest = NaN; // number
typeOfTest = "word" / 0; // number
typeOfTest = 2.37 / 1.4562; // number
typeOfTest = new Date(); // object
```

- `NaN`:
- toán tử chia lấy dư `%`:
- toán tử gán kết hợp: `+=`, `-=`, `*=`, `/=`
- Cơ số

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

## Bảng cú pháp

### Số

Không có tham số
| "phương thức" | cú pháp | Ghi chú |
| :---- | :---- | :---- |
| assign/augment | +=, -=, \*=, /= | sửa đổi một biến |
| increment | i++, varName++ | tăng một số lên 1 |
| decrement | i--, varName-- | giảm một số đi 1 |
| toExponential | num.toExponential() | Bỏ qua cái này |  
| toFixed | num.toFixed() | Chắc chắn dùng |
| toPrecision | num.toPrecision() | Có thể |

| Math.random | Math.random() | Chắc chắn dùng |
| Math.max | Math.max() | Trả về `-infinity`? |
| Math.min | Math.min() | Trả về `-infinity`? |
| Math.PI | Math.PI | Trả về giá trị của Pi |

<br />

Một tham số
| phương thức | cú pháp | Ghi chú |
| :---- | :---- | :---- |
| toExponential | toExponential(decimals) | Bỏ qua |
| toFixed | num.toFixed(digits) | Chắc chắn dùng |
| toPrecision | num.toPrecision(digits) | Có thể |
| isFinite | isFinite(val) | Kiểm tra? |
| isInteger | Number.isInteger(val) | Kiểm tra? |
| parseFloat | Number.parseFloat(str) | Không rõ |
| Math.abs | Math.abs(x) | Chắc chắn dùng |
| Math.ceil | Math.ceil(x) | Chắc chắn dùng |
| Math.floor | Math.floor(x) | Chắc chắn dùng |
| Math.round | Math.round(x) | Chắc chắn dùng |
| Math.sign | Math.sign(x) | Chắc chắn dùng |
| Math.sqrt | Math.sqrt(x) | Chắc chắn dùng |
| Math.trunc | Math.trunc(x) | Chắc chắn dùng |
| Math.max | Math.max(value0) | Tại sao dùng 1 giá trị? |
| Math.min | Math.min(value0) | Tại sao dùng 1 giá trị? |
| Math.sqrt | Math.sqrt(x) | - |
| Math.cos | Math.cos(x) | - |
| Math.sin | Math.sin(x) | - |
| Math.tan | Math.tan(x) | - |

<br />

2 hoặc nhiều tham số hơn:
| phương thức | cú pháp | Ghi chú |
| :---- | :---- | :---- |
| Math.max | Math.max(val1, val2) | Chắc chắn dùng |
| | Math.max(val1, val2, ...valN) | Chắc chắn dùng |
| Math.min | Math.min(val1, val2) |
| | Math.min(val1, val2, ...valN) | Chắc chắn dùng |

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Lấy ngày

Không có tham số (`d` là tên biến cho ngày/giờ):

| cú pháp              | Ghi chú                         |
| :------------------ | :---------------------------- |
| let d = new Date()  | Ngày và giờ hiện tại         |
| d.getFullYear()     | năm dạng yyyy                  |
| d.getMonth()        | tháng (0-11)              |
| d.getDate()         | ngày trong tháng (1-31)       |
| d.getDay()          | ngày trong tuần (0-6)         |
| d.getHours()        | giờ (0-23)               |
| d.getMinutes()      | phút (0-59)            |
| d.getSeconds()      | giây (0-59)            |
| d.getMilliseconds() | mili giây (0-999, TẠI SAO?)       |
| d.getTime()         | ms kể từ 1/1/1970 (Tại sao?) |

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>

### Đặt ngày

Một tham số (`d` là tên biến cho ngày/giờ):
| cú pháp | Ghi chú |
| :---- | :---- |
| d.setDate(dayVal) | cần phương thức get tương ứng? |
| d.setFullYear(yearVal) | cần phương thức get tương ứng? |
| d.setHours(hoursVal) | không chắc |
| d.setMilliseconds(msVal) | cần phương thức get tương ứng? |
| d.setMinutes(minsVal) | cần phương thức get tương ứng? |
| d.setMonth(moVal) | cần phương thức get tương ứng? |
| d.setSeconds(secsVal) | cần phương thức get tương ứng? |
| d.setTime(timeVal) | cần phương thức get tương ứng? |
| d.setUTCDate(dayVal) | cần phương thức get tương ứng? |
| new Date(value) | Codepen bị lỗi? |
| new Date(dateString) | Codepen bị lỗi? |
| new Date(dateObject) | Codepen bị lỗi? |

<br />

Hai tham số:
| cú pháp | Ghi chú |
| :---- | :---- |
| d.setFullYear(yearVal, moVal) | cần phương thức get tương ứng? |
| d.setHours(hrsVal, minsVal) | không chắc |
| d.setMinutes(minsVal, secsVal) | cần phương thức get tương ứng? |
| d.setMonth(moVal, dayVal) | cần phương thức get tương ứng? |
| d.setSeconds(secsVal, msValue) | cần phương thức get tương ứng? |
| new Date(yr, moIndex) | Codepen bị lỗi? |

<br />

Ba tham số:
| cú pháp | Ghi chú |
| :---- | :---- |
| d.setFullYear(yearVal, moVal, dateVal) | cần phương thức get tương ứng? |
| d.setHours(hrsVal, minsVal, secsVal) | không chắc |
| d.setMinutes(minsVal, secsVal, msVal) | cần phương thức get tương ứng? |
| new Date(yr, moIndex, day) | Codepen bị lỗi? |

<br />

Bốn hoặc nhiều tham số hơn:
| cú pháp | Ghi chú |
| :---- | :---- |
| d.setHours(hrsVal, minsVal, secsVal, msVal) | không chắc |
| new Date(yr, moIndex, day, hrs) | Codepen bị lỗi? |
| new Date(yr, moIndex, day, hrs, mins) | Codepen bị lỗi? |
| new Date(yr, moIndex, day, hrs, mins, secs) | Codepen bị lỗi? |
| new Date(yr, moIndex, day, hrs, mins, secs, ms) | Codepen bị lỗi? |

<br />

Ví dụ đối tượng Date:

```js
let today = new Date(); // "202203-11T22:13:35.413Z" Codepen?
let sameDay = new Date(today);
let birthday = new Date(1995, 11, 17); // "1995-12-17T5:00:00.000Z"
let birthday = new Date(1995, 11, 17, 13, 24, 0); // "1995-12-17T5:00:00.000Z"

new Date().toLocaleString(); // "4/17/2022, 6:52:35 PM"
```

<div align="right">&#8673; <a href="#back-to-top" title="Mục lục">Lên đầu trang</a></div>
