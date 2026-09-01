# Ví dụ phương thức chuỗi (String)

Cú pháp và ví dụ mã cho các phương thức chuỗi phổ biến nhất.

<div id="back-to-top"></div>

## Mục lục

|                                             Chủ đề | Chủ đề con                              | Chủ đề con                            | Chủ đề con                    | Chủ đề con                       |
| ------------------------------------------------: | :------------------------------------- | :----------------------------------- | :--------------------------- | :------------------------------ |
|             1. [Phương thức chuỗi](#string-methods): | i. [Phương thức bỏ qua](#skipped-methods) | ii. [split](#split)                  | iii. [substring](#substring) | iv. [repeat](#repeat)           |
|                                                   | v. [endsWith](#endsWith)               | vi. [test](#test)                    | vii. [charAt](#charat)       | viii. [charCodeAt](#charcodeat) |
|                                                   | ix. [fromCharCode](#fromcharcode)      | x. [match](#match)                   | xi. [replace](#replace)      | xii. [toString](#tostring)      |
|                                                   | xiii. [trim](#trim)                    | xiv. [Linh tinh](#Miscellaneous) |                              |                                 |
| 2. [Phương thức chuỗi của mảng](#array-string-methods): | i. [String slice](#string-slice)       | ii. [concat](#concat)                | iii. [indexOf](#indexof)     | iv. [lastIndexOf](#lastindexof) |
|                                                   | i. [includes](#includes)               |                                      |                              |                                 |
|                3. [Bảng cú pháp](#syntax-tables) |                                        |                                      |                              |                                 |

## Phương thức chuỗi

`str.toLowerCase()`, và `str.toUpperCase()` cơ bản đến mức tôi không cung cấp ví dụ. Chỉ cần gắn một trong các phương thức này vào tên biến cho chuỗi của bạn, ví dụ:

```js
let badString = "   oOPS, caps LOCK ON. nEED TO FIX.   ";
console.log(badString.toLowerCase().trim()); // "oops, caps lock on. need to fix."
// need to capitalize first letter and add a regex for the first char after the period.
```

### Skipped methods

Tôi đã bỏ qua các phương thức sau:

- [at()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/at): nhận giá trị nguyên và trả về chuỗi mới gồm một đơn vị mã UTF-16 duy nhất tại vị trí offset chỉ định. Phương thức này cho phép số nguyên dương và âm. Số nguyên âm đếm ngược từ ký tự cuối cùng của chuỗi.
- [codePointAt()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt): trả về số nguyên không âm là giá trị điểm mã Unicode tại vị trí cho trước.
- [fromCodePoint()](): trả về chuỗi được tạo bằng cách dùng chuỗi điểm mã chỉ định.
- [localeCompare()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare): trả về số cho biết chuỗi tham chiếu đứng trước, hay sau, hay bằng chuỗi đã cho theo thứ tự sắp xếp.
- [matchAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll): trả về iterator của tất cả kết quả khớp chuỗi với biểu thức chính quy, bao gồm nhóm capture.
- [normalize()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize): trả về dạng chuẩn hóa Unicode của chuỗi.
- [replaceAll()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll): trả về chuỗi mới với tất cả lần khớp của mẫu được thay bằng chuỗi thay thế. Mẫu có thể là chuỗi hoặc RegExp, và chuỗi thay thế có thể là chuỗi hoặc hàm được gọi cho mỗi lần khớp.
- [search()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/search): thực thi tìm kiếm khớp giữa biểu thức chính quy và đối tượng String này.
- [startsWith()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith): xác định chuỗi có bắt đầu bằng ký tự của chuỗi chỉ định hay không, trả về true hoặc false tương ứng.
- [toLocaleLowerCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase): trả về giá trị chuỗi gọi được chuyển thành chữ thường, theo ánh xạ chữ hoa-thường đặc thù theo locale.
- [toLocaleUpperCase()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase): trả về giá trị chuỗi gọi được chuyển thành chữ hoa, theo ánh xạ chữ hoa-thường đặc thù theo locale.
- [trimEnd()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trimEnd): xóa khoảng trắng ở cuối chuỗi. trimRight() là bí danh của phương thức này.
- [trimStart()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trimStart): xóa khoảng trắng ở đầu chuỗi. trimLeft() là bí danh của phương thức này.
- [valueOf()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/valueOf): trả về giá trị nguyên thủy của đối tượng String.

**Hai phương thức này đáng để xem xét**:

- [padEnd()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd): đệm chuỗi hiện tại bằng chuỗi cho trước (lặp lại nếu cần) sao cho chuỗi kết quả đạt độ dài cho trước. Phần đệm được áp dụng từ cuối chuỗi hiện tại.
- [padStart()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart): đệm chuỗi hiện tại bằng chuỗi khác (nhiều lần nếu cần) cho đến khi chuỗi kết quả đạt độ dài cho trước. Phần đệm được áp dụng từ đầu chuỗi hiện tại.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### split

Chia chuỗi thành các chuỗi con, đặt các chuỗi con này vào mảng, và **<ins>trả về mảng đó</ins>**. Không thay đổi trực tiếp chuỗi.

Cú pháp MDN:

```js
split();
split(separator);
split(separator, limit);
```

<br />

Ví dụ:

```js
// split()
let str = "The split method";
console.log(str.split()); // "The split method"
// split(separator)
console.log(str.split("")); // ["T","h","e"," ","s","p","l","i","t"," ","m","e","t","h","o","d"]
let str2 = str.split(" ");
console.log(str2, str); // ["The","split","method"] "The split method"
// split(separator, limit)
let str2 = str.split("", 2);
console.log(str2, str); // ["T","h"] "The split method"
let str2 = str.split(" ", 2);
console.log(str2, str); // ["The","split"] "The split method"

let str = "this is a sentence";
let letters = str.split("");
console.log(letters); // ["t","h","i","s"," ","i","s"," ","a"," ","s","e","n","t","e","n","c","e"]
let letters = str.split(" ");
console.log(letters); // ["this","is","a","sentence"]

const str = "Using the split method on this string";
const words = str.split(" ");
console.log(words[3]); // "method"
const chars = str.split("");
console.log(chars[8]); // e

// Removing spaces from a string - EXCELLENT!
const names = "Harry Trump ;Fred Barney; Helen Rigby ; Bill Abel ;Chris Hand ";
const re = /\s*(?:;|$)\s*/;
const nameList = names.split(re);
console.log(nameList); // ["Harry Trump","Fred Barney","Helen Rigby","Bill Abel","Chris Hand",""]

// Returning a limited number of splits
const myString = "Hello World. How are you doing?";
const splits = myString.split(" ", 3);
console.log(splits); // ["Hello","World.","How"]
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split">MDN Split</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### substring

**<ins>Trả về phần của chuỗi</ins>** giữa chỉ số bắt đầu và chỉ số kết thúc (không bao gồm), hoặc tới cuối chuỗi nếu bỏ qua tham số thứ 2. Không thay đổi trực tiếp chuỗi.

Cú pháp MDN và ví dụ:

```js
// syntax:
substring(indexStart);
substring(indexStart, indexEnd);

const str = "Mozilla";
console.log(str.substring(1, 3)); // "oz"
console.log(str.substring(2)); // "zilla"

// Using substring() with length property
let anyString = "Mozilla";
let anyString4 = anyString.substring(anyString.length - 4);
console.log(anyString4); // "illa"

let anyString = "Mozilla";
let anyString5 = anyString.substring(anyString.length - 5);
console.log(anyString5); // "zilla"

// Differences between substring() and slice()
let text = "Mozilla";
console.log(text.substring(5, 2)); // => "zil"
console.log(text.slice(5, 2)); // => ""

// Replacing a substring within a string
function replaceString(oldS, newS, fullS) {
  for (let i = 0; i < fullS.length; ++i) {
    if (fullS.substring(i, i + oldS.length) == oldS) {
      fullS = fullS.substring(0, i) + newS + fullS.substring(i + oldS.length, fullS.length);
    }
  }
  return fullS;
}
console.log(replaceString("World", "Web", "Brave New World")); // "Brave New Web"
// Better method for replacing strings:
function replaceString(oldS, newS, fullS) {
  return fullS.split(oldS).join(newS);
}
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substring">MDN substring</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### repeat

Xây dựng và **<ins>trả về chuỗi mới</ins>** chứa số lượng bản sao chỉ định của chuỗi mà nó được gọi, nối lại với nhau.

Cú pháp MDN và ví dụ::

```js
// syntax
repeat(count);

const chorus = "Because I'm happy. ";
console.log(`Chorus lyrics for "Happy": ${chorus.repeat(5)}`);
"abc".repeat(2); // 'abcabc'
"abc".repeat(3.5); // 'abcabcabc' (count will be converted to integer)
"abc".repeat(-1); // RangeError
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat">MDN Repeat</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### endsWith

Xác định chuỗi có kết thúc bằng ký tự của chuỗi chỉ định hay không. **<ins>Trả về `true` hoặc `false`</ins>**.

Cú pháp MDN và ví dụ:

```js
// syntax:
endsWith(searchString);
endsWith(searchString, length);

const str1 = "Cats are the best!";
console.log(str1.length); // 18
console.log(str1.endsWith("best", 17));

const str2 = "Is this a question"; // true
console.log(str2.endsWith("?")); // false

let str = "To be, or not to be, that is the question.";
console.log(str.endsWith("question.")); // true
console.log(str.endsWith("to be")); // false
console.log(str.endsWith("to be", 19)); // true
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith">MDN endsWith</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### test

Thực thi tìm kiếm khớp giữa biểu thức chính quy và chuỗi chỉ định. **<ins>Trả về `true` hoặc `false`</ins>**. Đây không phải phương thức chuỗi nhưng thường được dùng trên chuỗi.

Cú pháp MDN và ví dụ:

```js
test(str);

const str = "table football";
const regex = /foo*/;
console.log(regex.test(str)); // true

const str = "hello world!";
const result = /^hello/.test(str);
console.log(result); // true
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test">MDN Test</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### charAt

**<ins>Trả về chuỗi mới</ins>** gồm một đơn vị mã UTF-16 duy nhất tại vị trí offset chỉ định trong chuỗi.

```js
charAt(index);

const sentence = "The quick brown fox jumps over the lazy dog.";
const index = 4;
console.log(`The character at index ${index} is ${sentence.charAt(index)}`);
// expected output: "The character at index 4 is q"

var anyString = "Brave new world";
console.log("The character at index 1   is '" + anyString.charAt(1) + "'"); // "B"
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt">MDN charAt</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### charCodeAt

**<ins>Trả về số nguyên</ins>** giữa `0` và `65535` đại diện cho đơn vị mã UTF-16 tại chỉ số đã cho.

```js
// syntax
charCodeAt(index);

// MDN examples
const sentence = "The quick brown fox jumps over the lazy dog.";
const index = 4;
console.log(`The character code ${sentence.charCodeAt(index)} is equal to ${sentence.charAt(index)}`);
// expected output: "The character code 113 is equal to q"
console.log("ABC".charCodeAt(0)); // 65
console.log("ABC".charCodeAt(1)); // 66
console.log("ABC".charCodeAt(2)); // 67
console.log("abc".charCodeAt(0)); // 97, see below
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt">MDN charCodeAt</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### fromCharCode

**<ins>Trả về chuỗi</ins>** được tạo từ chuỗi đơn vị mã UTF-16 chỉ định.

```js
// syntax
String.fromCharCode(num1)
String.fromCharCode(num1, num2)
String.fromCharCode(num1, num2, ..., numN)

// Examples
console.log(String.fromCharCode(189, 43, 190, 61)); // "½+¾="
console.log(String.fromCharCode(65, 66, 67, 68)); // "ABCD"
console.log(String.fromCharCode(97, 98, 99, 100)); // "abcd"
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode">MDN fromCharCode</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### match

Dùng để khớp biểu thức chính quy với chuỗi. **<ins>Trả về mảng các kết quả khớp</ins>** hoặc **`null`** nếu không tìm thấy khớp nào.

Cú pháp MDN và ví dụ:

```js
match(regexp);

// Example 1
const paragraph = "The quick brown FOX jumps over the lazy dog. It barked.";
const regex = /[A-Z]/g;
const found = paragraph.match(regex);
console.log(found); // ["T","F","O","X","I"]

// Example 2
const paragraph = "The quick brown fox jumps over the lazy dog. It barked.";
const capturingRegex = /(?<animal>fox|cat) jumps over/;
const found = paragraph.match(capturingRegex);
console.log(found.groups); // {animal: "fox"}
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match">MDN Match</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### replace

**<ins>Trả về chuỗi mới</ins>** với một số hoặc tất cả lần khớp của `pattern` được thay bằng `replacement`. `pattern` có thể là chuỗi hoặc `RegExp`, và `replacement` có thể là chuỗi hoặc hàm được gọi cho mỗi lần khớp. Nếu `pattern` là chuỗi, chỉ lần xuất hiện đầu tiên sẽ được thay thế, trong trường hợp đó hãy dùng `replaceAll()`.

Cú pháp MDN:

```js
replace(regexp, newSubstr);
replace(regexp, replacerFunction);

replace(substr, newSubstr);
replace(substr, replacerFunction);
```

<br />

Ví dụ

```js
// Example 1
const p = "The quick brown fox jumps over the lazy dog.";
console.log(p.replace("dog", "monkey")); // "The quick brown fox jumps over the lazy monkey."

// Example 2
const regex = /Dog/i;
console.log(p.replace(regex, "ferret")); // "The quick brown fox jumps over the lazy ferret."

// Example 3
let str = "Twas the night before Xmas...";
let newstr = str.replace(/xmas/i, "Christmas");
console.log(newstr); // "Twas the night before Christmas..."

// Switching words in a string
let re = /(\w+)\s(\w+)/;
let str = "John Smith";
let newstr = str.replace(re, "$2, $1");
console.log(newstr); // Smith, John
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace">MDN Replace</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### toString

`toString()`: Mọi đối tượng JavaScript đều có phương thức `toString()`. Bạn có thể chuyển số, boolean hoặc mảng thành chuỗi. Tuy nhiên, bạn không thể dùng cách này để chuyển đối tượng thành chuỗi (Xem [MDN Object.toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)).

Cú pháp MDN và ví dụ:

```js
// num.toString:
num.toString()
num.toString(radix)
// all other
date.toString()
obj.toString()
bool.toString()
arr.toString()
function.toString()


// array to stringv(?)
function turnToString(val){
  return val.toString();
}
// let testObj = 108 // "string" "108"
// let testObj = false // "string" "false"
let testObj = [1, 2, 3, ['hey', 6]]
let strObj = turnToString(testObj)
console.log(typeof strObj, strObj) // "string" "1,2,3,hey,6"
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href=https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString">MDN toString</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### trim

`trim()`: xóa khoảng trắng ở cả hai đầu chuỗi và trả về chuỗi mới, không sửa đổi chuỗi gốc.

Cú pháp MDN và ví dụ:

```js
str.trim();

const greeting = "   Hello world!   ";

console.log(greeting.trim()); // "Hello world!";
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href=https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim">MDN trim</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Miscellaneous

typeof:

```js
let typeOfTest;
typeOfTest = "";
console.log(typeof typeOfTest); // string
typeOfTest = []; // object
typeOfTest = true; // boolean
typeOfTest = false; // boolean
typeOfTest = undefined; // undefined
```

<br />

chuỗi thoát (escape sequences) trong chuỗi:

```js
const myStr = "FirstLine\n\t\\SecondLine\nThirdLine";
```

<br />

tìm ký tự thứ N tính từ cuối:

```js
let thirdToLastLetter = firstName[firstName.length - 3];
```

- arr[3][0][1]: truy cập mảng con

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Phương thức chuỗi của mảng

Đây là các phương thức có thể dùng cho cả chuỗi và mảng.

### String slice

Trích xuất một phần của chuỗi và **<ins>trả về nó dưới dạng chuỗi mới</ins>**, _không_ sửa đổi chuỗi gốc.

Cú pháp MDN và ví dụ:

```js
slice();
slice(beginIndex);
slice(beginIndex, endIndex);

// MDN slice()
const str = "The quick brown fox jumps over the lazy dog.";
console.log(str.slice(31)); // "the lazy dog."
console.log(str.slice(4, 19)); // "quick brown fox"
console.log(str.slice(-4)); // "dog."
console.log(str.slice(-9, -5)); // "lazy"

let str = "The slice method";
// slice()
console.log(str.slice()); // "The slice method"
// slice(startIndex)
let str2 = str.slice(0); // "The slice method"
let str2 = str.slice(1); // "he slice method"
let str2 = str.slice(2); // "e slice method"
let str2 = str.slice(3); // " slice method"
let str2 = str.slice(4); // "slice method"
// slice(startIndex, endIndex)
let str2 = str.slice(4, 9);
console.log(str2); // "slice"
let str2 = str.slice(4, 11); // "slice m"
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice">MDN String Slice</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### concat

Nối hai hoặc nhiều mảng và **<ins>trả về bản sao của các mảng đã nối</ins>**. Không thay đổi trực tiếp mảng. Có thể dùng trên chuỗi.

Ví dụ:

```js
// syntax
concat(str1)
concat(str1, str2)
concat(str1, str2, ... , strN)


const str1 = 'Hello';
const str2 = 'World';
console.log(str1.concat(' ', str2)); // "Hello World"
console.log(str2.concat(', ', str1)); // "World, Hello"

let hello = 'Hello, '
console.log(hello.concat('Kevin', '. Have a nice day.')) // Hello, Kevin. Have a nice day.

"".concat(4, 5) // "45"
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/concat">MDN concat</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### indexOf

Với một đối số: chuỗi con cần tìm, tìm kiếm toàn bộ chuỗi gọi, và trả về chỉ số của lần xuất hiện đầu tiên của chuỗi con chỉ định. Với đối số thứ hai: một số, phương thức trả về lần xuất hiện đầu tiên của chuỗi con chỉ định tại chỉ số lớn hơn hoặc bằng số đã chỉ định.

```js
// syntax:
indexOf(searchString);
indexOf(searchString, position);

const paragraph = "The quick brown fox jumps over the lazy dog. If the dog barked, was it really lazy?";

const searchTerm = "dog";
const indexOfFirst = paragraph.indexOf(searchTerm);
console.log(`The index of the first "${searchTerm}" from the beginning is ${indexOfFirst}`);
// expected output: "The index of the first "dog" from the beginning is 40"
console.log(`The index of the 2nd "${searchTerm}" is ${paragraph.indexOf(searchTerm, indexOfFirst + 1)}`);
// expected output: "The index of the 2nd "dog" is 52"

const str = "Brave new world";
console.log("Index of first w from start is " + str.indexOf("w")); // logs 8
console.log('Index of "new" from start is ' + str.indexOf("new")); // logs 6

// example 2
let str = "finding substring in string";
let index = str.indexOf("str");
console.log(index); // 11

// find count (TIPS AND TRICKS)
let str = "You do not know what you do not know until you know.";
let substr = "know";
let count = 0;
let index = str.indexOf(substr);
while (index !== -1) {
  count++;
  index = str.indexOf(substr, index + 1);
}
console.log(count); // 3
```

&#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf">MDN indexOf</a></div>

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### lastIndexOf

**<ins>Trả về chỉ số cuối cùng</ins>** tại đó phần tử cho trước có thể được tìm thấy trong mảng, hoặc `-1` nếu không tồn tại. Có thể dùng trên chuỗi.

Ví dụ:

```js
// syntax
lastIndexOf(searchString);
lastIndexOf(searchString, position);

const paragraph = "The quick brown fox jumps over the lazy dog. If the dog barked, was it really lazy?";
const searchTerm = "dog";
console.log(`The index of the first "${searchTerm}" from the end is ${paragraph.lastIndexOf(searchTerm)}`);
// expected output: "The index of the first "dog" from the end is 52"

let anyString = "Brave, Brave New World";
console.log('The index of the first "Brave" is ' + anyString.indexOf("Brave")); // 0
console.log('The index of the last "Brave" is ' + anyString.lastIndexOf("Brave")); // 7
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf">MDN lastIndexOf</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### includes

Thực hiện tìm kiếm phân biệt hoa thường để xác định một chuỗi có thể được tìm thấy trong chuỗi khác hay không, trả về true hoặc false tương ứng

```js
// syntax:
includes(searchString);
includes(searchString, position);

const sentence = "The quick brown fox jumps over the lazy dog.";
const word = "fox";
console.log(`The word "${word}" ${sentence.includes(word) ? "is" : "is not"} in the sentence`);
// expected output: "The word "fox" is in the sentence"

const str = "To be, or not to be, that is the question.";
console.log(str.includes("To be")); // true
console.log(str.includes("question")); // true
console.log(str.includes("nonexistent")); // false
console.log(str.includes("To be", 1)); // false
console.log(str.includes("TO BE")); // false
console.log(str.includes("")); // true

let str = "Lorem ipsum";
console.log(str.includes("ipsum")); // true
console.log(str.includes("Ipsum")); // false

let str = "JavaScript String";
console.log(str.includes("Script", 5)); // false
console.log(str.includes("Script", 4)); // true
```

<div align="left">&#8675; <a href="#syntax-tables" title="Syntax tables">Tới bảng cú pháp</a> | &#10146; <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes">MDN includes</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Bảng cú pháp

Bảng theo số lượng đối số và liệu phương thức có thay đổi trực tiếp nguồn gốc hay không.

### Phương thức phổ biến

Phương thức phổ biến KHÔNG có đối số/tham số:

| method | syntax | Mutates? |
| :---- | :---- | :----: |
| split | str.split() | YES |
| sort | str.sort() | YES\* |
| trim | str.trim() | NO |

**LƯU Ý**: Dùng tham số rest để không thay đổi trực tiếp nguồn gốc cho `sort()` và `reverse()`.

<br />

Phương thức phổ biến với một đối số, hoặc nhiều đối số lặp lại:

| method | syntax1 | syntax2 | Mutates? |
| :---- | :---- | :---- | :----: |
| charCodeAt | str.charCodeAt(index) | | NO |
| fromCharCode | String.fromCharCode(num1) | String.fromCharCode(num1, num2, ..., numN) | NO |
| concat | str.concat(str2) | concat(str1, str2, ... , strN) | NO |
| split | str.split(separator) | | NO |
| repeat | str.repeat(count) | | NO |
| substring | str.substring(indStart) | str.substring(indStart, indEndex) | NO |
| replace | str.replace(regex, newStr) | str.replace(substr, newStr) | NO |
| test | regex.test(str) | | N/A |  
| match | str.match(regex) | | N/A |
| indexOf | str.indexOf(searchStr) | str.indexOf(searchStr, position) | N/A |
| lastIndexOf | str.lastIndexOf(searchStr) | str.lastIndexOf(searchStr, position) | N/A |
| endsWith | str.endsWith(subStr) | str.endsWith(subStr, length) | N/A |
| includes | str.includes(searchStr) | str.includes(searchStr, position) | N/A |
| | splice(start, deleteCt, item1) | splice(start, deleteCt, item1, item2, ...) | YES |

<br />

Phương thức phổ biến với hai đối số:

| method | syntax1 | syntax2 | Mutates? |
| :---- | :---- | :---- | :----: |
| slice | str.slice(start, end) | | NO |
| split | str.split(separator, limit) | | NO |
| replace | str.replace(regex, Fx) | str.replace(substr, Fx) | NO |

**\*LƯU Ý**: Hàm cho `replace()`: Kết quả của hàm (giá trị trả về) sẽ được dùng làm chuỗi thay thế. Lưu ý hàm sẽ được gọi nhiều lần cho mỗi lần khớp đầy đủ cần thay thế nếu biểu thức chính quy ở tham số đầu tiên là toàn cục. Kiểm tra [tài liệu MDN về replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter) vì có rất nhiều điều về hàm này.

Ví dụ:

```js
function replacer(match, p1, p2, p3, offset, string) {
  // p1 is nondigits, p2 digits, and p3 non-alphanumerics
  return [p1, p2, p3].join(" - ");
}
let newString = "abc12345#$*%".replace(/([^\d]*)(\d*)([^\w]*)/, replacer);
console.log(newString); // abc - 12345 - #$*%
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>
