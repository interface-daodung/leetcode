# Câu lệnh điều kiện

- [MDN if statements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else)
- [MDN ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)
- [MDN swtich](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)

<div id="back-to-top"></div>

## Mục lục

1. [Đối tượng Boolean](#boolean-object)
1. [Câu lệnh if else](#if-else-statements)
1. [else if](#else-if)
1. [Toán tử ternary](#ternary-operator)
    1. [Chuỗi điều kiện](#conditional-chains)
1. [Switch](#switch)
1. [Linh tinh](#miscellaneous)
    1. [Ghi chú](#notes)

## Đối tượng Boolean

Giá trị được truyền làm tham số đầu tiên được chuyển đổi thành giá trị boolean, nếu cần. Nếu giá trị bị bỏ qua hoặc là 0, -0, null, false, NaN, undefined, hoặc chuỗi rỗng (""), đối tượng có giá trị khởi tạo là false. Tất cả các giá trị khác, bao gồm bất kỳ đối tượng nào, một mảng rỗng ([]), hoặc chuỗi "false", tạo ra một đối tượng có giá trị khởi tạo là true.

Xem [tài liệu MDN về đối tượng Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) để biết các nên và không nên cụ thể cho đối tượng này.

## Câu lệnh if else

Cú pháp:

```js
if (condition) {
  statement1;
} else {
  statement2;
}

// example
function strEntry(str) {
  if (str !== "") {
    return str.split("");
  } else {
    return "Field is empty";
  }
}
console.log(strEntry("string")); // ["s","t","r","i","n","g"]
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### else if

Cú pháp:

```js
if (condition1)
  statement1
else if (condition2)
  statement2
else if (condition3)
  statement3
...
else
  statementN
```

Để thực thi nhiều câu lệnh trong một mệnh đề, hãy sử dụng câu lệnh khối ({ /_ ... _/ }) để nhóm các câu lệnh đó. Nói chung, nên luôn sử dụng câu lệnh khối, đặc biệt trong code liên quan đến các câu lệnh if lồng nhau:

```js
if (x > 50) {
  /* do something */
} else if (x > 5) {
  /* do something */
} else {
  /* do something */
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Toán tử ternary

Cú pháp:

```js
condition ? exprIfTrue : exprIfFalse;
a ? b : c;

// example:
var age = 26;
var beverage = age >= 21 ? "Beer" : "Juice";
console.log(beverage); // "Beer"

// Handling null values
let greeting = person => {
  let name = person ? person.name : `stranger`;
  return `Howdy, ${name}`;
};
console.log(greeting({ name: `Alice` })); // "Howdy, Alice"
console.log(greeting(null)); // "Howdy, stranger"
```

### Chuỗi điều kiện

Toán tử ternary có tính kết hợp phải (right-associative), nghĩa là nó có thể được "xâu chuỗi" theo cách sau, tương tự như chuỗi if … else if … else if … else:

```js
function example(…) {
    return condition1 ? value1
         : condition2 ? value2
         : condition3 ? value3
         : value4;
}

// Equivalent to:
function example(…) {
    if (condition1) { return value1; }
    else if (condition2) { return value2; }
    else if (condition3) { return value3; }
    else { return value4; }
}
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Switch

Cú pháp:

```js
switch (expression) {
  case value1:
    //Statements executed when the
    //result of expression matches value1
    [break;]
  case value2:
    //Statements executed when the
    //result of expression matches value2
    [break;]
  ...
  case valueN:
    //Statements executed when the
    //result of expression matches valueN
    [break;]
  [default:
    //Statements executed when none of
    //the values match the value of the expression
    [break;]]
}
```

<br />

Ví dụ:

```js
switch (expr) {
  case "Oranges":
    console.log("Oranges are $0.59 a pound.");
    break;
  case "Apples":
    console.log("Apples are $0.32 a pound.");
    break;
  case "Bananas":
    console.log("Bananas are $0.48 a pound.");
    break;
  case "Cherries":
    console.log("Cherries are $3.00 a pound.");
    break;
  case "Mangoes":
  case "Papayas":
    console.log("Mangoes and papayas are $2.79 a pound.");
    break;
  default:
    console.log("Sorry, we are out of " + expr + ".");
}
console.log("Is there anything else you'd like?");

// Example 2:

// Get day of week for November 1st for the current year
const d = new Date();
const year = d.getFullYear();
let currentNovFirst = "11/01/" + year;
let novFirstDay = new Date(currentNovFirst).getDay();

// For the current year, find the day of the week for the 1st of November
switch (novFirstDay) {
  case 0:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 1:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 2:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 3:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 4:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 5:
    weekOne = new Date(`11/1/${year}`);
    break;
  case 6:
    weekOne = new Date(`11/1/${year}`);
}
```

<br />

Phương thức cho case đa tiêu chí:

```js
var Animal = "Giraffe";
switch (Animal) {
  case "Cow":
  case "Giraffe":
  case "Dog":
  case "Pig":
    console.log("This animal is not extinct.");
    break;
  case "Dinosaur":
  default:
    console.log("This animal is extinct.");
}
```

<br />

Multi-case: thao tác xâu chuỗi

```js
var foo = 1;
var output = "Output: ";
switch (foo) {
  case 0:
    output += "So ";
  case 1:
    output += "What ";
    output += "Is ";
  case 2:
    output += "Your ";
  case 3:
    output += "Name";
  case 4:
    output += "?";
    console.log(output);
    break;
  case 5:
    output += "!";
    console.log(output);
    break;
  default:
    console.log("Please pick a number from 0 to 5!");
}
```

Cũng xem: [Biến phạm vi khối trong câu lệnh switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch#block-scope_variables_within_switch_statements)

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Linh tinh

- chuyển đổi kiểu dữ liệu
- `==` vs `===`

### Ghi chú

Một câu lệnh **switch** đầu tiên đánh giá biểu thức của nó. Sau đó, nó tìm mệnh đề `case` đầu tiên có biểu thức đánh giá bằng với kết quả của biểu thức đầu vào (sử dụng so sánh nghiêm ngặt, `===`) và chuyển điều khiển đến mệnh đề đó, thực thi các câu lệnh liên quan. (Nếu nhiều case khớp với giá trị đã cho, `case` đầu tiên khớp sẽ được chọn, ngay cả khi các case không bằng nhau.)

Nếu không tìm thấy mệnh đề `case` nào khớp, chương trình tìm mệnh đề `default` (tùy chọn), và nếu tìm thấy, chuyển điều khiển đến mệnh đề đó, thực thi các câu lệnh liên quan. Nếu không tìm thấy mệnh đề `default` nào, chương trình tiếp tục thực thi tại câu lệnh sau khi kết thúc `switch`. Theo quy ước, mệnh đề `default` là mệnh đề cuối cùng.

- expression: Một biểu thức có kết quả được so khớp với từng mệnh đề `case`
- `case valueN`: Một mệnh đề `case` dùng để so khớp với biểu thức. Nếu biểu thức khớp với `valueN` xác định, các câu lệnh bên trong mệnh đề `case` được thực thi cho đến khi kết thúc câu lệnh `switch` hoặc gặp `break`
- break: Câu lệnh tùy chọn liên kết với mỗi nhãn case đảm bảo chương trình thoát khỏi switch sau khi câu lệnh khớp được thực thi và tiếp tục thực thi tại câu lệnh theo sau `switch`. Nếu `break` bị bỏ qua, chương trình tiếp tục thực thi tại câu lệnh tiếp theo trong câu lệnh switch. Câu lệnh `break` không bắt buộc nếu có câu lệnh `return` trước nó.
- default: Một mệnh đề mặc định; nếu được cung cấp, mệnh đề này được thực thi nếu giá trị của biểu thức không khớp với bất kỳ mệnh đề `case` nào

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>