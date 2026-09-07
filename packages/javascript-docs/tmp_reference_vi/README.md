# BẢNG GHI NHỚ VANILLA JAVASCRIPT

> File này thực sự rất tốt mặc dù phần ghi chú hơi lộn xộn. Các bảng là phần hay nhất. Ngoài ra, string-array-examples.md cũng RẤT hay! Tất cả các file còn lại đang trong quá trình hoàn thiện (**tính đến 10/03/2022**).

Đây không phải là danh sách đầy đủ mọi phương thức, thuộc tính, v.v. có thể của JavaScript. File này có các bảng so sánh để tham khảo nhanh. Ghi chú về các phần tử trong bảng nằm ở cuối file.

<div id="back-to-top"></div>

## Mục lục

1. So sánh bảng
   1. [Kiểu dữ liệu](#data-types)
   1. [Toán học và biến](#math-and-variables)
   1. [Phương thức Boolean](#boolean-methods)
   1. [Toán tử và điều kiện](#operators-and-conditionals)
   1. [Vòng lặp](#loops)
   1. [Phương thức chuỗi và mảng](#string-and-array-methods)
   1. [Phương thức chuỗi và mảng khác](#other-string-and-array-methods)
   1. [Phương thức đối tượng](#object-methods)
   1. [Phương thức Number](#number-methods)
   1. [Phương thức Date](#date-methods)
   1. [Hàm và cú pháp Rest](#functions-and-rest-syntax)
   1. [Regex](#regex)
   1. [Cú pháp ES6](#es6-syntax)
   1. [Lệnh Console](#console-commands)
   1. [Lưu trữ cục bộ và phiên](#local-and-session-storage)

[Ghi chú quan trọng](#important-notes)

1. [Phiên bản JavaScript của CRUD](#javascript-version-of-crud)
   1. [Create](#create)
   1. [Đọc và trả về chỉ số và độ dài](#read-and-return-index-and-length)
   1. [Đọc và trả về giá trị](#read-and-return-values)
   1. [Cập nhật và thay đổi trực tiếp](#update-and-mutate)
1. [Mảng và Chuỗi](#arrays-and-strings)
   1. [Ghi chú phương thức chuỗi](#string-methods-notes)
   1. [Ghi chú phương thức mảng](#array-methods-notes)
1. [Ghi chú đối tượng](#object-notes)
1. [Linh tinh](#miscellaneous)

## So sánh bảng

Các bảng sau đây dùng để ghi nhớ trực quan. Dễ thấy sự giống và khác nhau giữa các phương thức khác nhau, cũng như đối với biến, kiểu dữ liệu, toán tử, v.v.

### Kiểu dữ liệu

Kiểu dữ liệu nguyên thủy trong JavaScript (dữ liệu bất biến, không phải đối tượng, và không có phương thức). Dù hầu hết chúng đều có đối tượng tương đương:

| Tên        |          Kiểu          | Tương đương đối tượng? |
| :---------- | :--------------------: | :--------: |
| `null`      |   giá trị không tồn tại    |     KHÔNG     |
| `undefined` | giá trị mặc định của biến |     KHÔNG     |
| Boolean     |   `true` hoặc `false`    |    CÓ     |
| Number      |     giá trị số     |    CÓ     |
| String      |    ký tự/văn bản     |    CÓ     |
| Bigint      |     số lớn      |    CÓ     |
| Symbol      |   định danh duy nhất    |    CÓ     |

Đặc điểm của kiểu nguyên thủy:

- Không có phương thức
- Bất biến

<br>

Kiểu đối tượng (nhiều giá trị):

| Tên | Kiểu |
| :----- | :----: |
| Objects | tập hợp thuộc tính với giá trị thuộc bất kỳ kiểu nào theo cặp khóa-giá trị |
| Array | giá trị phổ biến nhất là str, num, obj, và arr |
| Function | tự giải thích |
| Date | tự giải thích |
| JSON | kiểu đối tượng thường dùng nhất cho dữ liệu lấy từ API |
| `keys` | khóa là chuỗi và là _tên_ của thuộc tính đối tượng |
| `value` | giá trị theo sau `"keyName": value`|

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Toán học và biến

Toán tử toán học cơ bản:

| Mục đích | Ký hiệu |
| :----------- | :----: |
| Cộng | + |
| Trừ | - |
| Nhân | \* |
| Chia | / |
| **Phần dư** | % |
| Lũy thừa | a\*\*b |

<br>

var, let, const:

| Chủ đề | var | let | const |
| :-------- | :---- | :--- | :---- |
| Phạm vi | Toàn cục | Khối | Khối |
| Khai báo (không có giá trị) | undefined | undefined | Uncaught SyntaxError |
| Khai báo lại? | Có | Uncaught SyntaxError | Uncaught SyntaxError |
| Gán lại? | Có | Có | Uncaught TypeError |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức Boolean

Phương thức, điều kiện, v.v. trong JavaScript trả về `true` hoặc `false`:

| Kiểu:                 | Kiểm tra với:                                          |
| :-------------------- | :------------------------------------------------------- |
| <, >, <=, >=          | số, .length, typeof, ...                             |
| ==, ===, !=, !==      | Bất kỳ thứ gì                                                 |
| &&, \|\|              | Kiểm tra nhiều điều kiện và/hoặc                      |
| hasOwnProperty(prop)  | Nếu đối tượng có thuộc tính                              |
| obj.is(a, b)          | nếu 2 giá trị là cùng một giá trị                           |
| isPrototypeOf(obj)    | kiểm tra xem obj có tồn tại trong chuỗi prototype của obj khác không |
| obj instanceof Class  | nếu obj là thể hiện của lớp nào đó                 |
| Array.isArray(arr)    | Nếu mục được kiểm tra là mảng                              |
| Boolean(x)            | chuyển 'x' thành boolean                                |
| isNaN()               | nếu giá trị là NaN hay không                                 |
| every()               | nếu TẤT CẢ phần tử vượt qua kiểm tra                              |
| some()                | nếu ít nhất MỘT phần tử vượt qua kiểm tra                    |
| incudes()             | nếu arr hoặc str chứa giá trị tìm kiếm                  |
| endsWith()            | nếu str kết thúc bằng giá trị tìm kiếm                        |
| Number.isInteger(num) | nếu giá trị là số nguyên                                   |
| isFinite()            | nếu số là hữu hạn hay vô hạn                        |
| test()                | kiểm tra RegEx xem chuỗi có chứa biểu thức khớp không   |
| toán tử in           | nếu prop nằm `trong` obj hoặc prototype (prop in obj)       |
| true, false           | bằng `true` và `false`                                |

> Thường thấy `typeof` đi cùng ==, ===, !=, !==

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Toán tử và điều kiện

Toán tử:

| Kiểu | Ví dụ 1 | Ví dụ 2 | Ví dụ 3 | Ví dụ 4 | Ví dụ 5 |
| :--------- | :----- | :----- | :------ | :------ | :------ |
| Gán | = | += | -= | \_= | /= |
| So sánh | <, > | <=, >= | ==, === | !=, !== | |
| Số học | + - \* / | % | ++ | -- | \*\* |
| Logic | && | \|\| | ! | , | |
| Kiểu | typeof | instanceof | | | |

<br>

So sánh cho điều kiện:

| Mục đích | Ký hiệu |
| :----------- | :----: |
| Kiểm tra bằng | == |
| Kiểm tra khác | != |
| Bằng nghiêm ngặt | === |
| Khác nghiêm ngặt | !== |
| Nhỏ hơn | < |
| Lớn hơn | > |
| Nhỏ hơn hoặc bằng | <= |
| Nhỏ hơn hoặc bằng | >= |
| **tất cả** đều đúng | && |
| 2 **hoặc** nhiều thứ đúng | \|\| |
| nếu `a` tồn tại | if (a) {...} |
| nếu `a` không tồn tại | if (!a) {...} |
| Toán tử tam thức | a ? b : c |
| Tam thức lồng nhau | a ? b : c ? d : e |
| Cú pháp tam thức: | if cond ? do : else do |

<br>

Câu lệnh điều kiện

| Kiểu | Cú pháp 1 | Cú pháp 2 | Cú pháp 3 | Cú pháp 4 | Cú pháp 5 |
| :----- | :------- | :------ | :-------- | :------ | :------- |
| if | if (a) {run} | | | | |  
| else | if (a) {run} | else {run} | | | |
| else if | if (a) {run} | else if (a) {run} | _else {run}_ | | |
| tam thức | a ? b : c | | | | |
| switch | switch(val) | case "a": | {run} | _break_ | _default_ |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Vòng lặp

Các loại vòng lặp:

| Kiểu     | Cú pháp         | Cú pháp 2              | Cú pháp 2           |
| :------- | :------------- | :-------------------- | :----------------- |
| while    | let i = num    | while (i cond)        | {code with i; i++} |
| do while | let i = num    | do {code with i; i++} | while (i cond)     |
| for      | for (a; b; c)  | {code with i}         |                    |
| for in   | let i `in` obj | {code with i}         |                    |
| for of   | let i `of` obj | {code with i}         |                    |

<br>

Gán trong vòng lặp:

| Mục đích | Ký hiệu |
| :----------- | :----: |
| Cộng trong vòng lặp | += |
| Trừ trong vòng lặp | -= |
| Nhân trong vòng lặp | \*= |
| Chia trong vòng lặp | /= |
| Tăng trong vòng lặp | ++ |
| Giảm trong vòng lặp | -- |

<br>

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức chuỗi và mảng

Phương thức/thuộc tính chuỗi và mảng (Cùng phương thức, cùng hiệu ứng):

| Phương thức | Mục đích: | Trả về: | Mã cơ bản mảng | Mã cơ bản chuỗi |
| :---------- | -------: | :------ | :------------ | :----------- |
| slice() | tạo: | mảng/chuỗi mới | arr.slice(start, end) | str.slice(start, end) |
| concat() | tạo: | mảng/chuỗi mới | arr1.concat(arr2) | str1.concat(' ', str2) |
| indexOf() | tìm: | chỉ số # hoặc -1 | indexOf(searchVal) | indexOf(searchStr) |
| lastIndexOf() | tìm: | chỉ số # hoặc -1 | lastIndexOf(searchVal) | lastIndexOf(searchStr) |
| includes() | kiểm tra: | Boolean | includes(searchVal) | includes(searchStr) |
| length | đếm: | độ dài arr/str | arr.length | str.length |
| [index] | giá trị: | giá trị cụ thể | arr[index] | str[index] |

<br>

Chuỗi và mảng (Tên phương thức khác nhau, cùng hiệu ứng):

| Phương thức | Trả về: | Cú pháp: |
| :------------- | :-------------------- | :----------- |
| str.charAt(i) | Trả về ký tự tại chỉ số | str.charAt(index) |
| arr.at(i) | Trả về mục mảng tại chỉ số | arr.at(index) |
| str.substring(i) | Trả về phần của chuỗi | str.substring(indexStart)|
| arr.slice(i) | Trả về phần của mảng | arr.sllice(indexStart) |
| _arr.splice(i)_ | \*_Trả về phần của mảng (thay đổi trực tiếp)_ | arr.splice(indexStart) |

<br>

Chuỗi và mảng (Tên khác nhau, hiệu ứng ngược nhau):

| Phương thức  | Trả về:                                     | Cú pháp:     |
| :------ | :------------------------------------------- | :---------- |
| split() | Chuyển chuỗi thành mảng các chuỗi con   | str.split() |
| join()  | Chuyển tất cả phần tử của mảng thành chuỗi | arr.join()  |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức chuỗi và mảng khác

Các phương thức chuỗi phổ biến khác:

| Phương thức | Trả về: | Cú pháp: |
| :------------- | :-------------------- | :---------- |
| str.toLowerCase() | chuỗi mới | str.toLowerCase() |
| str.toUpperCase() | chuỗi mới | str.toUpperCase() |
| toán tử concat | chuỗi mới | str1 + str2 |
| str.trim() | chuỗi mới | str.trim() |
| str.replace() | chuỗi mới | let newStr = str.replace(regex, subStr) |
| str.match() | mảng mới | let newArr = str.match(regex) |
| endsWith() | Boolean | endsWith(searchStr) |
| regex.test() | Boolean | regex.test(str) |
| str.charCodeAt() | Số Unicode # | charCodeAt(index) |
| str.fromCharCode() | Ký tự | fromCharCode(n1, n2, ...) |

<div align="left">&#8675; <a href="#arrays-and-strings" title="Arrays and Strings">Tới phần ghi chú</a></div>

<br />

Các phương thức mảng phổ biến khác:

| Phương thức | Trả về: | Cú pháp: |
| :------------- | :-------------- | :---------- |
| [x][y] | giá trị mảng con | arr[x][y] |
| arr.pop() | mục đã xóa | arr.pop() |
| arr.shift() | mục đã xóa | arr.shift() |
| arr.reverse() | mảng đã thay đổi trực tiếp | arr.reverse() |
| arr.join() | chuỗi mới | arr.join(separator) |
| arr.push() | độ dài mảng mới | arr.push(item, item2, ...) |
| arr.unshift() | độ dài mảng mới | arr.unshift(item, item2, ...) |
| arr.splice() | mảng đã thay đổi trực tiếp | arr.splice(start, deleteCt, ...items)

| arr.find() | phần tử đầu tiên tìm thấy | arr.find(item, index, array) |
| arr.sort() | mảng đã thay đổi trực tiếp | arr.sort((a, b) => a - b) |
| arr.every() | boolean | arr.every((item) => {...}) |
| arr.some() | boolean | arr.some((item) => {...}) |
| arr.map() | mảng mới | arr.map((item) => {...}) |
| arr.filter() | mảng mới | arr.filter((item) => {...}) |
| arr.forEach() | mảng mới | arr.forEach((item) => {...}) |
| arr.reduce() | mảng mới | arr.reduce((a, b) => {...}, val) |

<div align="left">&#8675; <a href="#other-methods-unique-to-arrays" title="Other methods unique to arrays">Tới phần ghi chú</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức đối tượng

Phương thức đối tượng phổ biến:

| Phương thức, thuật ngữ lớp | Trả về: | Trả về cái gì? |
| :------------------- | :------- | :------- |  
| Object.keys(obj) | mảng mới | khóa thuộc tính của obj |
| Object.values() | mảng mới | giá trị thuộc tính của obj |
| Object.entries(obj) | mảng mới | cặp khóa-giá trị của obj |
| Object.getOwnPropertyNames() | mảng mới | tất cả tên thuộc tính ngoại trừ symbol |
| Object.freeze(obj) | NA | ngăn thay đổi trực tiếp toàn bộ đối tượng |  
| obj.toString() | chuỗi mới | obj dưới dạng chuỗi |
| obj.hasOwnProperty() | boolean | nếu obj có (prop) |
| obj.prop hoặc obj[prop] | giá trị | trả về giá trị cho `prop` |
| obj.prop[i] hoặc obj.[prop][i] | giá trị | tại vị trí [i] cho mảng trong đối tượng |
| obj.prop.length | giá trị | độ dài của mảng trong đối tượng |

<br>

Cú pháp và thuật ngữ lớp đối tượng (Fx = 'function'):

| Thuật ngữ lớp | Mục đích: |
| :---------- | :------- |
| class | khuôn mẫu để tạo đối tượng |
| constructor | để tạo và khởi tạo đối tượng được tạo bằng lớp |
| this | giá trị của this được quyết định bởi cách hàm được gọi |
| new | tạo thể hiện mới của lớp |  
| get | liên kết thuộc tính obj với hàm, được gọi khi thuộc tính đó được tra cứu |
| set | liên kết thuộc tính obj với hàm, được gọi khi có nỗ lực đặt thuộc tính đó |
| extends | dùng để tạo lớp con của lớp khác |
| prototype | cơ chế cách đối tượng kế thừa tính năng từ nhau |

Xem [Định nghĩa phương thức MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions).

<div align="left">&#8675; <a href="#object-notes" title="Object Notes">Tới phần ghi chú</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức Number

Phương thức Number và Math phổ biến (một đối số):

| Phương thức | Kết quả/Mục đích: |
| :--- | :---- |
| toExponential(n) | trả về chuỗi biểu diễn đối tượng Number ở dạng ký hiệu mũ |
| toFixed(n) | Trả về số với số chữ số thập phân chỉ định |
| toPrecision(n) | Trả về số với số chữ số có nghĩa chỉ định |
| isFinite() | Trả về boolean kiểm tra số hữu hạn vs vô hạn |
| Number.isInteger() | Trả về boolean kiểm tra số có phải số nguyên hay không |
| parseFloat() | Phân tích đối số và trả về số thực |
| Math.abs(x) | Trả về giá trị tuyệt đối của x |
| Math.ceil(x) | Luôn làm tròn số lên tới số nguyên lớn nhất tiếp theo |
| Math.floor(x) | Trả về số nguyên lớn nhất nhỏ hơn hoặc bằng x. |
| Math.random(x) | Trả về số giả ngẫu nhiên giữa 0 và 1. |
| Math.round(x) | Trả về giá trị của số x được làm tròn tới số nguyên gần nhất. |
| Math.sign(x) | Trả về dấu của x: dương, âm hoặc 0 |
| Math.sqrt(x) | Trả về căn bậc hai dương của x. |
| Math.trunc(x) | Trả về phần nguyên của `x`, loại bỏ mọi chữ số thập phân. |

<br />

Phương thức Math phổ biến (2 hoặc nhiều đối số):

| Phương thức | Kết quả/Mục đích: |
| :--- | :---- |
| Math.max(n1, n2, ...) | Trả về số lớn nhất trong 0 hoặc nhiều số |
| Math.min(n1, n2, ...)) | Trả về số nhỏ nhất trong 0 hoặc nhiều số. |
| Math.pow(x, y) | Trả về cơ số x lũy thừa y (tức là, x^y). |

<div align="left">&#8675; <a href="#number-notes" title="Number notes">Tới phần ghi chú</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Phương thức Date

<br />

Phương thức Date phổ biến: Lấy giá trị ngày và thời gian

| Phương thức            | Mô tả:                                          |
| :---------------- | :---------------------------------------------------- |
| new Date()        | Mặc định là ngày hiện tại nếu bạn không truyền gì |
| getDate()         | Trả về ngày trong tháng dưới dạng số (1-31)            |
| getDay()          | Ngày trong tuần dưới dạng số (giờ địa phương, 0-6, 0 = Chủ nhật)     |
| getFullYear()     | Năm dưới dạng số bốn chữ số (yyyy)                    |
| getHours()        | Lấy giờ (0-23)                                   |
| getMilliseconds() | Mili giây (0-999)                               |
| getMinutes()      | Lấy phút (0-59)                                 |
| getMonth()        | Tháng dưới dạng số (0-11)                              |
| getSeconds()      | Lấy giây (0-59)                                 |
| getTime()         | Lấy mili giây kể từ 1 tháng 1 năm 1970            |
| getUTCDate()      | Ngày theo giờ quốc tế                      |

<br />

Đặt một phần của ngày

| Phương thức | Mô tả: | Cú pháp: |
| :--- | :------ | :---- |
| setDate() | Đặt ngày dưới dạng số (1-31) | setDate(dayValue) |
| setFullYear() | Đặt năm (tùy chọn tháng & ngày) | setFullYear(yrValue) |
| setHours() | Đặt giờ (0-23) | setHours(hrsValue) |
| setMilliseconds() | Đặt mili giây (0-999) | setMilliseconds(msValue) |
| setMinutes() | Đặt phút (0-59) | setMinutes(minsValue) |
| setMonth() | Đặt tháng (0-11) | setMonth(moValue) |
| setSeconds() | Đặt giây (0-59) | setSeconds(secsValue) |
| setTime() | Đặt thời gian (ms kể từ 1/1/1970) | setTime(timeValue) |
| setUTCDate() | Đặt ngày trong tháng cho giờ UT cụ thể | setUTCDate(dayValue) |

<div align="left">&#8675; <a href="#date-notes" title="Date Notes">Tới phần ghi chú</a></div>
<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Hàm và cú pháp Rest

Khai báo & biểu thức hàm cơ bản:

| Kiểu | Khai báo | Gọi |
| :--- | :----- | :----- |
| Declaration | function name() {...} | name(); |
| Expresson | const varName = function() {...} | varName(); |
| Arrow | () => {...} | -  

| Arrow2 | () => "value" | - |
| Arrow3 | item => {item...} | - |
| Arrow4 | (arr1, arr2) => {arr1...arr2} | - |
| IIFE | (function() {...}) | (); |
| _Toán tử Spread/Rest_ | (...) | |

<br>

Toán tử Spread và Rest:

| Kiểu | Khai báo | Dùng với |
| :--- | :----- | :----- |
| Toán tử Spread | (...arr) | Giải nén mảng |
| Toán tử Spread | (...obj) | Giải nén đối tượng |
| Toán tử Rest | (...args) | Làm tham số hàm |
| Biến thể: | (a, ...args) | Phần tử đầu tiên rồi phần còn lại |
| Biến thể: | (a, b, ...obj) | Hai phần tử đầu tiên rồi phần còn lại |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### RegEx

Tổng quan:

| Ký tự     | Ví dụ       | Mô tả                                                     |
| :------- | :------------ | :-------------------------------------------------------------- |
| string   | `/Some word/` | Khớp chuỗi theo nghĩa đen                                          |
| \|       | `/dog\|cat/`  | Hoặc, khớp dog hoặc cat                                     |
| i        | `/The/ig `    | Cờ bỏ qua hoa thường, tìm tất cả lần xuất hiện của `the`               |
| g        | xem ở trên     | Cờ toàn cục, khớp tất cả lần xuất hiện                              |
| .        | `/.ing/`      | Ký tự đại diện, khớp bất kỳ thứ gì ngoại trừ dòng mới.            |
| \        | `\. `         | Thoát ký tự đặc biệt (`.`, `+`, `^`, `*`, `?`, `$`, v.v.) |
| [ ]      | `/[aeiou]/`   | Tập/lớp ký tự, khớp nguyên âm trong trường hợp này                |
| [^]      | `/[^aeiou]/`  | Không khớp nội dung bên trong, không khớp nguyên âm thường         |
| -        | `[a-zA-Z]`    | Khớp tất cả chữ cái hoa và thường                 |
| [0-9]    | NA            | Khớp tất cả số từ 1 tới 9                           |
| [a-z0-9] | NA            | Kết hợp 2 cái trên                                     |
| +        | `/s+/gi `     | Khớp 1 hoặc nhiều lần xuất hiện của ký tự trước           |
| \*       | `/boo*/`      | Khớp 0 hoặc nhiều lần xuất hiện: both, booth, booooom, bot, ...     |
| ?        | `/docx?/`     | Khớp lười, khớp tùy chọn 0 hoặc 1 lần của ký tự trước |
| ^        | `/^The/`      | Tìm mẫu ở đầu chuỗi.                |
| $        | `/end.$/`     | Tìm mẫu ở cuối chuỗi.                     |
| {#}      | `a{5}`        | Chỉ định số lượng, chỉ định số lần khớp chính xác (5 chữ a) |
| {#,}     | `\s{2,}`      | Khớp ít nhất số tối thiểu hoặc nhiều hơn, tìm 2 hoặc nhiều khoảng trắng  |
| {#,#}    | `a{2,5}`      | Khớp chữ cái `a` giữa 2 và 5 lần                      |
| (?<=...) | NA            | Lookbehind dương, đặt trong nhóm, bắt đầu bằng `?<=`       |
| (?<!...) | NA            | Lookbehind âm, đặt trong nhóm, bắt đầu bằng `?<!`       |
| (?=...)  | NA            | Lookahead dương                                              |
| (?!...)  | NA            | Lookahead âm                                              |

<br>

Cú pháp viết tắt:

| Ký tự    | Ví dụ          | Mô tả                                                    |
| :------ | :--------------- | :------------------------------------------------------------- |
| \w      | NA               | Bằng [A-Za-z0-9_]                                            |
| \W      | NA               | Bằng [^a-za-z0-9_].                                          |
| \d      | NA               | Bằng [0-9]                                                   |
| \D      | NA               | Bằng [^0-9]                                                  |
| \s      | NA               | Khớp khoảng trắng, bằng [\r\t\f\n\v]                        |
| \S      | NA               | Khớp mọi thứ ngoại trừ khoảng trắng, bằng [^\r\t\f\n\v]       |
| ( )     | `(anything)`     | Nhóm capture, dùng cho các khối khác nhau để khớp               |
|         | `$1`             | dùng `$1` để tham chiếu nhóm capture thứ nhất, `$2` cho thứ 2, ... |
| <?name> | (?\<name\>regex) | Đặt tên cho nhóm capture thay vì `$1`, `$2`, v.v.           |

<br>

Phương thức Regex

| Phương thức | Mô tả |
| :----- | :---- |
| regEx.test(str) | Trả về true hoặc false nếu tìm thấy khớp mẫu |
| str.match(regEx) | Trích xuất các kết quả khớp thực tế |
| str.replace(regEx, 'replacement') | Tìm kiếm và thay thế văn bản trong chuỗi |

<br>

Ký tự thoát (phổ biến):

| Mã | Đầu ra ký tự |
| :--- | :----- |
| `\'` | Nháy đơn `'` |
| `\"` | Nháy kép `"` |
| `\\` | Dấu gạch chéo ngược `\`|
| `\\|` | Ống `\|` |
| `\n` | Dòng mới |
| `\r` | Về đầu dòng |
| `\t` | <kbd>TAB</kbd> |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Cú pháp ES6

Bảng cú pháp cho các chủ đề ES6 khác nhau:

| Chủ đề ES6 | Ví dụ mã |
| -------: | :----------- |
| Hàm mũi tên: | const varName = () => {code} |
| Tham số mặc định: | function fnName(parm1 = val1) {...} |
| Tham số Rest: | const product = (...n) => {code} |
| | product(2, 4, 6, 2) |
| Toán tử Spread: | let numbers = [-12, 160, 0, -3, 51, -50]; |
| | let minNum = Math.min(...numbers); |
| Gán destructuring: | const {x, y, z} = obj; |
| `// thay vì:` | const name = user.name; |
| | const age = user.age; |
| `// dùng:` | const { name, age } = user; |
| `// gán cho tên biến:` | const { name: userName, age: userAge } = user; |
| Destructuring với tham số Rest: | const [a, b, ...arr] = [1, 2, 3, 4, 5, 7]; |
| Template literals ${var}: | \`Hello, my name is ${name}.\` |
| Object literal: | const person = (name, age, email) => ( {name, age, email} );|
| Hàm khai báo: | không có dấu hai chấm hoặc từ khóa `function`, name(parm) (code) |
| Cú pháp lớp: | class ConstrFunc { constructor(x) {this.\_x = x}} |
| getter: | get something() { return this.x; } |
| setter: | set something(updateX) this.x = updateX |
| `this._var`: | biến private, chỉ truy cập được trong lớp |
| Module script: | <script type="module" src="script.js"></script> |
| export1 | export const add = (x, y) => {...} |
| export2 | export { add }; |
| export default | export default function(x, y) => {...} |
| import | import { add } from './functions'; |
| import default | import add from './functions.js'; |
| import multiple | import { add, subtract } from './functions.js'; |
| import all | import \* as codeObj from "./functions.js"; |
| JavaScript Promise: | new Promise((resolve, reject) => {...}); |
| then | myPromise.then(result => {...}); |
| catch | myPromise.catch(error => {...}); |
| từ khóa promise: | then, result, catch, error |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Lệnh Console

Lệnh console hữu ích:

| Lệnh                  | Mục đích                                           |
| :----------------------- | :------------------------------------------------ |
| console.log( )           | Gỡ lỗi                                         |
| console.error( )         | Giống `.log` nhưng bao thông báo trong hộp lỗi đỏ |
| console.table( )         | Hiển thị mảng và đối tượng dưới dạng bảng              |
| console.time("label")    | Hiển thị hàm mất bao lâu để chạy        |
| console.timeEnd("label") | Dùng cùng với .time()                   |
| console.dir(obj)         | In mọi thứ về đối tượng JS               |
| console.clear( )         | xóa console khỏi mọi kết quả khác           |

> `console.time`: cần `timeEnd` nữa mới hoạt động. Đặt `time` trước hàm và `timeEnd` sau hàm.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Lưu trữ cục bộ và phiên

| Lệnh        | Ví dụ                                                 |
| :------------- | :------------------------------------------------------ |
| clear          | localStorage.clear();                                   |
| getItem        | const a = localStorage.getItem('myVar');                |
| setItem        | localStorage.setItem('myVar', 'Value');                 |
| removeItem     | localStorage.removeItem('myVar');                       |
| JSON.parse     | const user = JSON.parse(localStorage.getItem('Value')); |
| JSON.stringify | localStorage.setItem('Value', JSON.stringify(myVar));   |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

# Ghi chú quan trọng

Ghi chú về các bảng khác nhau cho phương thức cụ thể và cú pháp cho mọi thứ liệt kê ở trên. Đối với ghi chú về các chủ đề khác hoặc mã, xem notes.md.

Linh tinh:

- `typeof`: Trả về kiểu của biến
- `instanceof`: Trả về true nếu thuộc tính prototype của hàm tạo xuất hiện ở bất kỳ đâu trong chuỗi prototype của đối tượng

## Phiên bản JavaScript của CRUD

Có 4 cách làm việc với dữ liệu được gọi chung là CRUD:

- C = _Create_ (Tạo): ví dụ, ghi vào dom, tạo bản sao của mảng hoặc thể hiện mới của đối tượng.
- R = _Read_ (Đọc): ví dụ, đọc giá trị từ mảng hoặc đối tượng, lấy giá trị nhập của người dùng, v.v.
- U = _Update_ (Cập nhật): Thay đổi giá trị cho bản ghi hiện có như thông tin liên hệ khách hàng, mật khẩu người dùng, thay đổi trực tiếp mảng, ...
- D = _Delete_ (Xóa): Xóa bản ghi hoặc mục khỏi đối tượng hoặc mảng, ...

Thông thường, CRUD liên quan tới tương tác với cơ sở dữ liệu. Tuy nhiên, bạn cũng có thể áp dụng từ viết tắt đó cho JavaScript front-end. Đây chỉ là một cách khác để hình dung và hiểu JS.

Nhưng trước khi bạn có thể **Đọc**, **Cập nhật**, hoặc **Xóa**, bạn cần kiểm tra xem một phần dữ liệu có tồn tại hay không. Việc này được thực hiện bằng một loại câu lệnh điều kiện nào đó:

- Quay lại và xem các phần [Phương thức Boolean](#boolean-methods), [Toán tử và điều kiện](#operators-and-conditionals), [Vòng lặp](#loops) và/hoặc [Regex](#regex).

Nếu phần tử không tồn tại, thì bạn có thể **Tạo** nó. Nếu `thứ đó` tồn tại, thì bạn có thể đọc, cập nhật và/hoặc xóa. Trong JavaScript bạn có thể **đọc** với mục đích 1) trả về giá trị, hoặc 2) trả về độ dài hoặc chỉ số # (arr, str) của mục.

Và bất kỳ thứ gì bạn có thể đọc, bạn có thể làm như vậy với mục đích cập nhật hoặc xóa các giá trị.

Hãy xem create, rồi read/return, và cuối cùng là update/mutate và delete.

<!--
Return position:
| Method | Does: | Data Type:

| :----  | :----  | :---- |
| indexOf()     | returns position | str & arr |
| lastIndexOf() | returns position | str & arr |
| .length | returns the count of items | str & arr |
| [i] | returns the value at position | str & arr |
-->

### Create

Tạo đối tượng hoặc biến mới:

| Phương thức | Tạo: |
| :---- | :---- |
| = | gán giá trị bằng `let` hoặc `const` |
| đầu vào người dùng | tạo từ `getElementById`, `querySelector`, v.v. |
| obj.keys() | mảng mới gồm khóa của đối tượng |
| obj.values() | mảng mới gồm giá trị của đối tượng |
| Object.create() | đối tượng mới, dùng đối tượng hiện có làm prototype |
| cú pháp class | tạo đối tượng từ lớp và từ khóa `new` |
| Phương thức Date, new Date() | tạo ngày, năm, tháng, giờ, v.v. |

<br>

Tạo từ đối tượng hiện có:

| Phương thức | Tạo: |
| :---- | :---- |
| str.toLowerCase() | trả về chuỗi dạng thường |  
| str.toUpperCase() | trả về chuỗi dạng hoa |
| +=, \*=, -=, /= | đối tượng mới từ đối tượng |
| str.trim() | chuỗi mới |
| str.substring() | chuỗi mới |
| str.replace() | chuỗi mới |
| arr.join() | chuỗi mới từ mảng |
| arr hoặc str.concat() | mảng hoặc chuỗi mới |
| arr.slice() | mảng mới |
| str.split() | mảng mới |
| arr.filter() | mảng mới |
| arr.map() | mảng mới |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Đọc và trả về chỉ số và độ dài

Đọc / Trả về chỉ số # và độ dài:

| Cú pháp | Trả về: |
| :---- | :---- |
| indexOf() | chỉ số # |
| lastIndexOf() | chỉ số # |
| arr.findIndex() | chỉ số # cho lần xuất hiện đầu tiên vượt qua kiểm tra |
| .length | độ dài của arr/str |
| arr.push() | độ dài của mảng mới sau khi thay đổi trực tiếp mảng |
| arr.unshift() | độ dài của mảng mới sau khi thay đổi trực tiếp mảng |

### Đọc và trả về giá trị

Trả về / đọc đơn giản:

| Cú pháp | Trả về: |
| :---- | :---- |
| str[i] | giá trị chuỗi tại vị trí chỉ số |
| str.charAt(i) | giống ở trên |
| arr[i] | giá trị mảng tại vị trí chỉ số |
| arr[x][y] | giá trị mảng con tại vị trí chỉ số |
| arr.at(i) | giống ở trên, thử `arr.at(-1)` cho mục cuối |
| obj.prop | giá trị obj cho prop |
| obj[prop] | biến thể của ở trên |
| obj.prop[i] | giá trị tại vị trí chỉ số cho mảng trong prop của obj |
| obj[prop][i] | biến thể của ở trên |
| includes() | giá trị boolean, arr/str |
| str.endsWith() | giá trị boolean |
| obj.hasOwnProperty() | giá trị boolean |
| str.test() | giá trị boolean |
| arr.every() | giá trị boolean |  
| arr.some() | giá trị boolean |

<br>

Trả về / đọc phức tạp hơn:

| Cú pháp | Trả về: |
| :---- | :---- |
| arr.find() | giá trị mảng cho lần xuất hiện đầu tiên vượt qua kiểm tra |  
| arr.reduce() | giá trị đơn sau khi hàm thực thi |
| arr.shift() | giá trị mục đã xóa khỏi mảng |
| arr.pop() | giá trị mục đã xóa khỏi mảng |
| arr.slice | mảng mới với các mục được cắt ra (tương tự cho chuỗi?) |
| str.match() | giá trị chuỗi khớp RegEx |
| Phương thức Number | số đã định dạng, ví dụ: |
| num.toFixed(2) | trả về số với 2 chữ số thập phân |
| Phương thức Math() | số đã tính toán, ví dụ: |
| Math.abs(x) | trả về giá trị tuyệt đối của số |

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Cập nhật và Xóa

Cập nhật, thay đổi trực tiếp, xóa:

| Cú pháp | Trả về: |
| :---- | :---- |
| arr.splice(i) | thay đổi nội dung mảng |
| arr.push() | thay đổi nội dung mảng |
| arr.unshift() | thay đổi nội dung mảng |
| arr.shift() | thay đổi nội dung mảng |
| arr.pop() | thay đổi nội dung mảng |
| arr.sort() | thay đổi thứ tự mảng |
| arr.reverse() | thay đổi thứ tự mảng |
| obj[prop] = val | thay đổi giá trị thuộc tính, hoặc đặt giá trị nếu rỗng |
| obj.prop = val | biến thể của ở trên |
| `delete` obj.prop | xóa prop khỏi đối tượng, trả về `true` |
| obj.prop = " " | cập nhật obj.prop thành giá trị rỗng, cũng thử `null`|
| arr.length = 0 | làm rỗng mảng |  
| delete obj[prop] | xóa thuộc tính khỏi đối tượng |

> Tìm hiểu `arr.entries()` kết hợp với `.next().value`. Ngoài ra, `obj.entries()` cũng gây nhầm lẫn.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Mảng và Chuỗi

Ghi chú linh tinh:

- Không giống chuỗi, các mục của mảng có thể thay đổi trực tiếp và có thể thay đổi
- Truy cập mảng nhiều chiều bằng chỉ số: `var arr = [ [1, 2], [2, 3], [ [3, 4], 5] ] arr[2][0][1] = 4`

Có các phương thức chung cho cả mảng và chuỗi nên tôi kết hợp chúng để dễ hình dung hơn. Xem các link MDN sau: [MDN String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

### Ghi chú phương thức chuỗi

- `str.length`: thường dùng trong vòng lặp `for` để duyệt từng phần tử. Tương tự cho mảng.
- `str[index]`: để trả về giá trị tại chỉ số cụ thể, ví dụ `str[3]` để trả về giá trị tại vị trí thứ 4. Tương tự cho mảng.
- `valueOf()` — Trả về giá trị nguyên thủy (không có thuộc tính hoặc phương thức) của đối tượng chuỗi
- `toString()`: Mọi đối tượng JavaScript đều có phương thức `toString()`. Bạn có thể chuyển số, boolean hoặc mảng thành chuỗi. Tuy nhiên, bạn không thể dùng cách này để chuyển đối tượng thành chuỗi (Xem [MDN Object.toString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)).

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Ghi chú phương thức mảng

- `flat()`: tạo mảng mới với tất cả phần tử mảng con được nối vào nó một cách đệ quy tới độ sâu chỉ định
- Trả về boolean: `every()`, `includes()`, `some()`
- Trả về chuỗi: `join()`, `toString()`
- Trả về mảng mới: `filter()`, `map()`, `concat()`
- Trả về giá trị/vị trí: `find()`, `indexOf()`, `lastIndexOf()`,
- Thêm: `push()`, `unshift()`,
- Xóa: `pop()`, `shift()`, `slice(start, end)` (không thay đổi trực tiếp), `splice()`
- Thay đổi chỉ số: `reverse()`, `sort()`
- Khác: `forEach()`, `reduce()` (dù chủ yếu cho phép tính đơn giản)

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Ghi chú đối tượng

- Thay vì dùng chỉ số để truy cập và sửa đổi dữ liệu, bạn truy cập dữ liệu trong đối tượng qua cái gọi là `thuộc tính`
- Thuộc tính thường là `chuỗi` - bạn có thể bỏ dấu nháy cho thuộc tính chuỗi một từ và cho số
- Đối tượng có thể được coi như nơi lưu trữ `khóa`/`giá trị`, giống từ điển `{word: definition}`
- Có hai cách để truy cập thuộc tính của đối tượng: ký hiệu chấm (`.`) và ký hiệu ngoặc (`[]`).
- Ký hiệu chấm là thứ bạn dùng khi biết tên thuộc tính bạn đang cố truy cập
- Nếu thuộc tính của đối tượng bạn đang cố truy cập có khoảng trắng trong tên, bạn sẽ cần dùng ký hiệu ngoặc
- Tốt nhất cũng nên dùng ký hiệu ngoặc khi tên biến được thay thế cho tên khóa, đặc biệt nếu tên có thể chứa nhiều từ
- Dùng ký hiệu chấm hoặc ngoặc để cập nhật thuộc tính

Định nghĩa getter và setter

- **getter** là phương thức lấy giá trị của thuộc tính cụ thể. **setter** là phương thức đặt giá trị của thuộc tính cụ thể. Bạn có thể định nghĩa getter và setter trên bất kỳ đối tượng lõi được định nghĩa trước hoặc đối tượng do người dùng định nghĩa _hỗ trợ việc thêm thuộc tính mới_.

Có ba cách gốc để liệt kê/duyệt thuộc tính đối tượng:

- Vòng lặp `for...in`: Phương thức này duyệt tất cả thuộc tính có thể đếm được của đối tượng _và chuỗi prototype của nó_.
- `Object.keys(obj)`: Phương thức này trả về mảng với tất cả tên thuộc tính riêng (không nằm trong chuỗi prototype) có thể đếm được ("keys") của đối tượng `o`.
- `Object.getOwnPropertyNames(o)`: Phương thức này trả về mảng chứa tất cả tên thuộc tính riêng (có thể đếm được hoặc không) của đối tượng `o`. Tôi không thấy khác biệt với `obj.keys()`.

Xem trang [MDN Làm việc với đối tượng](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects).

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Linh tinh

Đây là những ghi chú hay nhất của tôi hoặc mẹo và thủ thuật:

**Tổng quan**:

- BREAK và CONTINUE là những thứ rất quan trọng cần biết cho vòng lặp
- nếu không dùng `<` hoặc `>` hoặc ký hiệu so sánh khác, câu lệnh được coi là `true` nếu giá trị là bất kỳ thứ gì khác 0
- Hầu như mọi giá trị riêng lẻ trong JavaScript đều đánh giá thành true, ngoại trừ những gì được gọi là giá trị "falsy": `false`, `0`, `""`, `NaN`, `undefined`, và `null`
- ĐIỀU NÀY RẤT QUAN TRỌNG: **_Toán tử dấu phẩy_** (`, `) cho phép nhiều biểu thức được đánh giá trong một câu lệnh duy nhất và trả về kết quả của biểu thức cuối cùng: `function isLess(a, b) { return a <= b; }` VÀ `function isEqual(a, b) { return a === b; }`

<br />

**Biến và giá trị**:

- Khi biến JS được khai báo, chúng có giá trị ban đầu là `undefined`. Nếu bạn thực hiện phép toán trên biến `undefined` kết quả sẽ là `NaN`
- Biến được khai báo không có từ khóa `let` hoặc `const` tự động được tạo trong phạm vi toàn cục
- `let` có phạm vi khối - Khối là đoạn mã được bao bởi `{ }` - Vì vậy biến khai báo trong khối bằng `let` chỉ có sẵn để dùng trong khối đó

<br />

Đối tượng:

- Đối tượng không duy trì thứ tự cho các khóa đã lưu như mảng; do đó vị trí của khóa trên đối tượng, hoặc thứ tự tương đối mà nó xuất hiện là không liên quan khi tham chiếu hoặc truy cập khóa đó
- Hàm tạo (Constructor) định nghĩa thuộc tính và hành vi thay vì trả về giá trị như các hàm khác có thể
- LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG: Hàm bên trong đối tượng thay vì ở phạm vi toàn cục - trong trường hợp này chúng được gọi là PHƯƠNG THỨC – hàm trong đối tượng `todo` gọi là `add` hoặc `edit` và bạn gọi nó bằng `todo.add()` - hoặc `todo.edit(id)`
- OOP: hàm tạo & từ khóa _this_: những thứ quan trọng nhất trong OOP là `constructor` và từ khóa `this`. Nếu bạn muốn tạo nhiều thể hiện của một loại đối tượng nhất định thì bạn muốn tạo hàm tạo
- vòng lặp `for in`: dùng cho đối tượng – tạo đối tượng user > rồi for `(let x in user)` trả về tên các khóa – user([x]) trả về giá trị
- từ khóa `this` tham chiếu tới thể hiện **_hiện tại_** của đối tượng, phạm vi hàm. Để truy cập biến bên ngoài hàm nhưng trong cùng đối tượng, bạn phải dùng `this.varName`, trong đó `this` thuộc về đối tượng hiện tại.
- mỗi đối tượng trong JS có một prototype – prototype tự nó là một đối tượng – mọi đối tượng kế thừa thuộc tính và phương thức từ prototype của chúng = Object.prototype vs Client.prototype
- `Object.prototype` – bạn có thể thấy các phương thức của nó như hasOwnProperty, toString, valueOf
- `Client.prototype` - khi bạn đang xử lý đối tượng được tạo qua hàm tạo

<br />

Điều kiện:

- Hầu hết khi bạn muốn kiểm tra giá trị và kiểu nên dùng `===` chứ không phải `==`
- dùng `if(typeof varName !== 'undefined')` để kiểm tra biến có tồn tại hay không. Bạn sẽ gặp lỗi nếu chỉ dùng `if (varName)` và nó KHÔNG tồn tại.
- Chỉ `===` và `!==` không thực hiện chuyển đổi kiểu, tất cả các so sánh khác đều có.
- **_LƯU Ý_**: dấu ngoặc nhọn `{}` trong câu lệnh if là tùy chọn, dù được khuyến nghị. Đây là ví dụ không có chúng:

```js
if (id === 100) console.log('Equal');
// or
if (id === 100) console.log('Equal');
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>
<!--  
Testing meta view of ALL syntax and keywords:

Assign, declare, define, set, reassign, initialize:

| Name / Desc | Keyword, char: | Used with/for: |
| :------- | :------ | :------- |
| Assignment | =, +=, etc., set | variables |  
| Default parameters | (parm1 = val1) | Functions |
| Destructuring | {key1: val1, key2: val2} | Obj |
| Template literals | \`<p>Text ${var}</p>\` | variables |
| Object literal | (name, age, email) => ( {name, age, email} ) | Obj |

<br>

Things:

| What | Why |
| :------- | :------ |
| data types | storing values |
| Variables | set to a datatype and assign value |
| Operators | assign values to variables |
| data type methods | create, read, update, check, delete |
| conditionals | check, test in code blocks |
| comparisons | same as abve |
| Loops | working with groups of variables or values |
| functions | combination of above |
| escaping | format, output |
| RegEx | Check |
| shorthand syntax | variable input, alternate, DRY, dynamic |
-->

<!-- Testing a change for my terminal WTF -->
