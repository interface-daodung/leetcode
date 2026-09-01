# Ghi chú: JavaScript cơ bản & ES6

Ghi chú về các chi tiết trong README và các ghi chú quan trọng khác, định nghĩa, khái niệm, mẹo, thủ thuật, v.v. Hiện tại, file này khá lộn xộn...

> Khối mã dưới đây là ghi chú nhanh cho bản thân về một dự án tôi đang kẹt (bỏ qua):

**dùng `every()` để so sánh một mảng với các mảng khác và trả về kết quả khớp:**

```js
const hasSameElements = (a, b) => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};
// But do the elements need to be in the same order?
```

<div id="back-to-top"></div>

## Mục lục

1. [Miscellaneous](#miscellaneous)
1. [Tips and Tricks](#tips-and-tricks)
   1. [Unique things](#unique-things)
1. [Terms](#terms)
   1. [Code Specific](#code-specific)
   1. [Concepts](#concepts)
1. [Data structures](#data-structures)
1. [OOP](#oop)
1. [Dates](#dates)
1. [Functions and Return](#functions-and-return)
1. [Conditional Logic](#conditional-logic)
1. [Conditional Statements](#conditional-statements)
1. [Loops](#loops)
1. [ES6](#es6)
1. [RegEx](#regex)
1. [Debugging](#debugging)
1. [Data Structures](#data-structures)
1. [Basic Algorithms](#basic-algorithms)
1. [OOP](#oop)
1. [Functional Programming](#functional-programming)
1. [The DOM](#the-dom)
1. [DOM Elements](#dom-elements)
   1. [DOM Node Properties](#dom-node-properties)
   1. [DOM Element Methods](#dom-element-methods)
1. [JavaScript Events](#javaScript-events)
   1. [Mouse](#mouse)
   1. [Keyboard](#keyboard)
   1. [Frame](#frame)
   1. [Form](#form)
   1. [Drag](#drag)
   1. [Clipboard](#clipboard)
   1. [Media](#media)
   1. [Animation](#animation)
   1. [Other Events](#other-events)
1. [Errors](#errors)

<h2 id="miscellaneous" align="center">Miscellaneous</h2>

- Linter: https://eslint.org/docs/user-guide/getting-started
- https://eslint.org/docs/rules/padding-line-between-statements
- Biến sạch (Clean Variables): 1) Có thể tìm kiếm, 2) Dễ đọc, 3) Dễ hiểu -

<h2 id="tips-and-tricks" align="center">Tips and Tricks</h2>

- === tốt hơn ==
- hàm tạo (constructor)
- IIFE
- trim()
- push.apply()
- splice thay vì delete
- num.toFixed(#)
- setTimeout(), setInterval()
- Đặt timeout cho XMLHttpRequests
- Tránh dùng try-catch-finally bên trong vòng lặp
- Khai báo và khởi tạo mảng
- reduce!
- Sắp xếp mảng chuỗi, số hoặc đối tượng
- cú pháp gán destructuring
- kiểm tra hiệu năng bằng `performance.now()`
- template literals với biến
- cách rút gọn câu lệnh if: tam thức, &&,
- toán tử dấu phẩy
- toán tử spread để hợp nhất 2 đối tượng
- undefined (biến chưa được gán giá trị) vs null (giá trị rỗng có chủ ý)
- arr.slice(-1) để lấy phần tử cuối
- dùng `array.slice(0, #);` để cắt ngắn mảng
- Gán Destructuring cho đối tượng và mảng
- toán tử ngắn mạch (short circuit)
- Xử lý giá trị rỗng và không rỗng:

```js
const arr = [0, 1, 2, null, undefined, "", false];
const nonEmptyValues = arr.filter(Boolean);
console.log("nonEmptyValues: ", nonEmptyValues); //[1, 2]
```

- **Tuyệt vời**: https://www.freecodecamp.org/news/how-to-learn-javascript-a-little-faster/
- **Tuyệt vời**: https://www.codemotion.com/magazine/frontend/javascript/javascript-speed-up-tips/
- **Tuyệt vời**: https://samwalpole.com/my-top-5-javascript-tips-and-tricks-for-writing-cleaner-code
- Hay: https://blog.yogeshchavan.dev/super-useful-tips-and-tricks-for-javascript-developers
- Hay: https://www.jesssica.tech/post/Javascript-Tips-and-Tricks
- Hay: https://pratapsharma.in/javascript-tips-and-tricks
- Hay: https://github.com/wilfredinni/javascript-cheatsheet
- Có thể xem: https://github.com/alhassy/JavaScriptCheatSheet

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Unique things

Những thứ bạn ít khi thấy:

- dấu gạch dưới làm tên biến `_,`: Dùng khi một hàm yêu cầu 2 đối số, nhưng bạn sẽ không tham chiếu đối số đầu tiên, ví dụ `Array.filter` yêu cầu một phần tử mảng và (tùy chọn) một chỉ số. Nhưng vì chỉ chỉ số mới được xử lý trong phạm vi hàm, và vì nó BẮT BUỘC đứng thứ hai, bạn đặt dấu gạch dưới thay cho đối số đầu tiên

```js
const range = Array(max - min + 1)
  .fill(0)
  .map((_, i) => i + min);
```

- Gọi hàm liên tiếp (a)(b)(c)...:

```js
addTogether(5)(7);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="terms" align="center">Terms</h2>

Khái niệm, cú pháp mã cụ thể, ...

### Code Specific

<dl>
  <dt>Callback function</dt>
  <dd>là hàm được truyền vào hàm khác dưới dạng đối số, sau đó được gọi bên trong hàm ngoài để hoàn thành một thói quen hoặc hành động nào đó. Ví dụ là hàm trong `addEventListener`.</dd>
</dl>
<dl>
  <dt>currentTarget</dt>
  <dd>Thuộc tính chỉ đọc của giao diện Event xác định mục tiêu hiện tại cho sự kiện, khi sự kiện di chuyển qua DOM. Nó luôn tham chiếu tới phần tử mà trình xử lý sự kiện đã được gắn vào, trái ngược với Event.target</dd>
</dl>
<dl>
  <dt>Error</dt>
  <dd>Đối tượng Error được ném ra khi lỗi runtime xảy ra. Đối tượng Error cũng có thể được dùng làm đối tượng cơ sở cho ngoại lệ do người dùng định nghĩa. Lỗi runtime dẫn tới việc tạo và ném ra đối tượng Error mới.</dd>
</dl>
<dl>
  <dt>IIFE</dt>
  <dd>Hàm chạy ngay khi nó được định nghĩa.</dd>
</dl>
<dl>
  <dt>parsing</dt>
  <dd>Phân tích dữ liệu là quá trình trong đó chuỗi dữ liệu được chuyển đổi từ định dạng này sang định dạng khác. Parsing nghĩa là phân tích và chuyển đổi chương trình thành định dạng nội tại mà môi trường runtime thực sự có thể chạy</dd>
</dl>
<dl>
  <dt>JSON.parse()</dt>
  <dd>Phương thức phân tích chuỗi JSON, xây dựng giá trị hoặc đối tượng JavaScript được mô tả bởi chuỗi.</dd>
</dl>
<dl>
  <dt>JSON.stringify()</dt>
  <dd>Phương thức chuyển đổi đối tượng hoặc giá trị JavaScript thành chuỗi JSON.</dd>
</dl>
<dl>
  <dt>Parameters</dt>
  <dd>Tham số là các biến đóng vai trò giữ chỗ cho các giá trị sẽ được đưa vào hàm khi nó được gọi.</dd>
</dl>
<dl>
  <dt>Arguments</dt>
  <dd>Là các giá trị thực tế được truyền vào hàm, được đại diện bởi các tham số trong khai báo hàm.</dd>
</dl>
<dl>
  <dt>parseInt</dt>
  <dd>Hàm phân tích đối số chuỗi và trả về một số nguyên.</dd>
</dl>
<dl>
  <dt>Rest Parameter</dt>
  <dd>Cú pháp cho phép hàm chấp nhận số lượng đối số không xác định dưới dạng mảng.</dd>
</dl>
<dl>
  <dt>Spread Operator</dt>
  <dd>Cú pháp có thể được dùng khi tất cả phần tử từ đối tượng hoặc mảng cần được đưa vào danh sách nào đó. Toán tử spread thường được dùng để tạo bản sao nông (shallow copy) của đối tượng JS. Dùng toán tử này giúp mã ngắn gọn và tăng khả năng đọc</dd>
</dl>
<dl>
  <dt>Event.target</dt>
  <dd>Thuộc tính target chỉ đọc của giao diện Event là tham chiếu tới đối tượng mà sự kiện được phát tới.</dd>
</dl>
<dl>
  <dt>"use strict"</dt>
  <dd>Chế độ nghiêm ngặt (strict mode): cách để chọn tham gia vào biến thể bị hạn chế của JavaScript. </dd>
</dl>

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Concepts

<dl>
  <dt>Abstraction</dt>
  <dd>trong OOP, chỉ việc chỉ hiển thị chi tiết thiết yếu và giữ mọi thứ khác bị ẩn. Người dùng lớp của bạn không nên lo về chi tiết nội tại của các lớp đó. Hãy chia mã thành các phần nhỏ. Tốt nhất nếu phần bạn đang làm việc có thể hoạt động mà không cần biết cách hoạt động bên trong của phần khác. Hãy suy nghĩ theo giao diện (interface) và triển khai (implementation). Giao diện đề cập tới cách các phần mã có thể giao tiếp với nhau (thực hiện qua các phương thức mà mỗi lớp có thể truy cập). Việc triển khai các phương thức (cách chúng được viết) nên bị ẩn.</dd>
</dl>
<dl>
  <dt>Arity</dt>
  <dd>Là thuật ngữ dùng để chỉ số lượng đối số hoặc toán hạng trong một hàm hoặc phép toán; là số lượng hàm bạn có thể truyền vào một đối tượng; là số lượng tham số mà hàm chứa; Arity của một hàm là số lượng đối số mà nó yêu cầu. Biến hàm thành dạng currying nghĩa là chuyển đổi hàm có N arity thành N hàm có arity 1.</dd>
</dl>
<dl>
  <dt>Currying</dt>
  <dd>currying là khi một hàm — thay vì nhận tất cả đối số cùng một lúc — nhận đối số đầu tiên và trả về hàm mới, hàm này nhận đối số thứ hai và trả về hàm mới, hàm này nhận đối số thứ ba, v.v. cho đến khi tất cả đối số hoàn tất. Đó là quá trình trong lập trình hàm mà chúng ta có thể biến đổi hàm có nhiều đối số thành chuỗi hàm lồng nhau. Nó trả về hàm mới mong đợi đối số tiếp theo ngay trong dòng. Biến hàm thành dạng currying nghĩa là chuyển đổi hàm có N arity thành N hàm có arity 1.</dd>
</dl>
<dl>
  <dt>Partial application</dt>
  <dd>Được mô tả là việc áp dụng một vài đối số cho hàm từng lần một và trả về hàm khác được áp dụng cho nhiều đối số hơn.</dd>
</dl>
<dl>
  <dt>Encapsulation</dt>
  <dd>trong OOP, chỉ việc đóng gói dữ liệu với các phương thức có thể thao tác trên dữ liệu đó trong một lớp. Đó là ý tưởng ẩn dữ liệu trong một lớp, ngăn bất kỳ thứ gì bên ngoài lớp đó tương tác trực tiếp với nó. Thành viên của các lớp khác có thể tương tác với thuộc tính của đối tượng khác qua các phương thức của nó: phương thức `get` và `set`. Ngoài ra, bạn có thể muốn một số thuộc tính chỉ được đọc từ bên ngoài lớp, nghĩa là bạn chỉ có phương thức `getter`, không có `setter`. Đừng cho phép lớp bên ngoài chỉnh sửa trực tiếp thuộc tính của đối tượng. Mỗi phần không nên có quyền truy cập hoặc phụ thuộc vào cách hoạt động nội tại của các phần mã khác (che giấu thông tin)!</dd>
</dl>
<dl>
  <dt>Event bubbling</dt>
  <dd>sự nổi bọt của sự kiện qua DOM – vì vậy khi một sự kiện xảy ra nó sẽ nổi bọt lên qua các phần tử cha - cho tới thẻ body</dd>
</dl>
<dl>
  <dt>Event delegation</dt>
  <dd>Ngược lại với event bubbling – đó là khi chúng ta đặt trình lắng nghe trên một trong các phần tử cha, sau đó dùng logic bên trong trình xử lý sự kiện để nhắm tới phần tử mà chúng ta thực sự muốn</dd>
</dl>
<dl>
  <dt>Hoisting</dt>
  <dd>Chỉ quá trình mà trình thông dịch dường như di chuyển khai báo của hàm, biến hoặc lớp lên đầu phạm vi của chúng, trước khi thực thi mã. Hành vi mặc định của JavaScript là di chuyển khai báo lên đầu</dd>
</dl>
<dl>
  <dt>Inheritance</dt>
  <dd>trong OOP, là nguyên tắc cho phép các lớp kế thừa từ các lớp khác – phương thức và thuộc tính. Lớp cha (SuperClass) với các lớp con (Subclasses). Lớp con kế thừa phương thức và thuộc tính từ lớp cha của chúng. </dd>
</dl>
<dl>
  <dt>Access modifiers</dt>
  <dd>Một phần của kế thừa trong OOP làm thay đổi lớp nào có quyền truy cập vào lớp, phương thức hoặc thuộc tính khác. Có 3 bổ từ truy cập chính: Public, Private và Protected. Public có thể truy cập từ bất kỳ đâu trong chương trình. Private chỉ có thể truy cập từ bên trong cùng lớp nơi thành viên được định nghĩa. Protected có thể truy cập trong lớp nó được định nghĩa, cũng như các lớp con của lớp đó.</dd>
</dl>
<dl>
  <dt>In place</dt>
  <dd>In-place nghĩa là bạn nên cập nhật chuỗi gốc thay vì tạo chuỗi mới. Bạn nên thay đổi nội dung của chuỗi gốc thành dạng đảo ngược mà không dùng biến lưu trữ tạm để giữ chuỗi.</dd>
</dl>
<dl>
  <dt>Momoize (Memoization)</dt>
  <dd>cách để tối ưu hàm và khiến chúng thực thi nhanh hơn nhiều: bộ nhớ đệm (caching). Đó là kỹ thuật tối ưu chủ yếu dùng để tăng tốc chương trình máy tính bằng cách lưu kết quả của các lời gọi hàm tốn kém và trả về kết quả đã lưu khi cùng đầu vào xuất hiện lại - lưu trong bộ nhớ. Kỹ thuật lưu trữ các phép tính đã thực thi trước đó. Memoization là kỹ thuật tối ưu nơi các lời gọi hàm tốn kém được cache sao cho kết quả có thể được trả về ngay lần sau khi hàm được gọi với cùng đối số.</dd>
</dl>
<dl>
  <dt>Polymorphism</dt>
  <dd>trong OOP, mô tả các phương thức có khả năng mang nhiều hình thức. Có 2 loại: Động và Tĩnh. </dd>
</dl>
<dl>
  <dt>Dynamic polymorphism</dt>
  <dd>xảy ra trong thời gian chạy của chương trình. Nó mô tả khi chữ ký phương thức nằm ở cả lớp con và lớp cha. Chúng có cùng tên nhưng triển khai khác nhau, nhưng lớp con ghi đè lớp cha. Điều này là vì hình thức của phương thức được quyết định dựa trên vị trí trong hệ phân cấp lớp nơi nó được gọi. Điều này giảm nhu cầu cho nhiều câu lệnh if/else if</dd>
</dl>
<dl>
  <dt>Static polymorphism</dt>
  <dd>xảy ra trong thời gian biên dịch và đề cập tới khi nhiều phương thức có cùng tên nhưng đối số khác nhau được định nghĩa trong cùng một lớp: hoặc số lượng tham số khác nhau, hoặc kiểu khác nhau, hoặc theo thứ tự khác nhau. Đó được gọi là nạp chồng phương thức (method overloading). Dù các phương thức có cùng tên, chữ ký của chúng khác nhau do đối số của chúng.</dd>
</dl>
<dl>
  <dt>Recursion</dt>
  <dd>Là quá trình tự gọi chính mình. Hàm tự gọi chính nó được gọi là hàm đệ quy. Hành động hàm tự gọi chính nó, đệ quy được dùng để giải quyết vấn đề chứa các bài toán con nhỏ hơn. Hàm đệ quy có thể nhận hai đầu vào: trường hợp cơ sở (kết thúc đệ quy) hoặc trường hợp đệ quy (tiếp tục đệ quy).</dd>
</dl>
<dl>
  <dt>Scope</dt>
  <dd>Phạm vi quyết định khả năng truy cập (tầm nhìn) của biến. Có 3 loại: 1) Phạm vi khối, 2) Phạm vi hàm, 3) Phạm vi toàn cục.</dd>
</dl>
<dl>
  <dt>Type coercion</dt>
  <dd>là việc chuyển đổi tự động hoặc ngầm định giá trị từ kiểu dữ liệu này sang kiểu dữ liệu khác (như chuỗi thành số).</dd>
</dl>

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

# Ghi chú lộn xộn

Mọi thứ dưới đây là sổ tay lộn xộn: ghi chú không có thứ tự, ghi chú không rõ ràng, một **_bản nháp_** thực sự.

Những thứ quan trọng tôi cần ghi nhớ và áp dụng:

- câu lệnh hàm vs hàm gán cho biến (var function):
- hàm mũi tên: ( ) =>
- new Date():
- `${variable}`:
- việc dùng +=, -=, \*=, /= với số
- Thoát ký tự nháy đơn và nháy kép (`\'\"`), dòng mới và tab (`\n\t`)
- Làm việc với mảng nhiều chiều
- Bài viết cấu trúc dữ liệu tuyệt vời: https://www.educative.io/blog/javascript-data-structures
  - file chord-intervals.json của tôi có lẽ là bảng băm hoặc có lẽ là cây nào đó -

- Ghi nhớ và hiểu đầy đủ `JSON.stringify()` vs `JSON.parse()` - tại sao bạn lại dùng chúng với mảng?
- Vì ==, <, >, <=, >= thực hiện ép kiểu, bạn có thể cần bao gồm `&& typeof` == "kiểu bạn muốn"
- Nhớ không dùng `=` trong điều kiện if mà dùng `==` hoặc `===`
- switch(), case, break, default - phần JS cơ bản của freeCodeCamp, bài học: Golf Code và Counting Cards!
- Học cách viết tắt cho câu lệnh if: if (a, b) return a === b;
- `freeCodeCamp`:
  - 25 escape sequences trong chuỗi,
  - 42 thao tác mảng với push ...45. thao tác mảng với unshift,
  - 73 golf code,
  - 74 chọn từ nhiều tùy chọn bằng câu lệnh switch...77. thay thế chuỗi if else bằng switch,
  - 78 trả về giá trị boolean từ hàm
  - 80 counting cards,
  - 84 truy cập thuộc tính đối tượng bằng biến thực sự hay và tham chiếu tới bảng tra cứu => link https://dev.to/k_penguin_sato/use-lookup-tables-for-cleaning-up-your-js-ts-code-9gk - tương tự việc đặt city = "Philadelphia" rồi dùng city trong ứng dụng thời tiết,
  - 86 thêm thuộc tính mới cho đối tượng js - obj, newProp = "value"
  - 87 xóa thuộc tính khỏi đối tượng js: delete obj.propname
  - 88 dùng đối tượng để tra cứu - tại sao `lookup[val]` hoạt động nhưng `lookup.val` thì KHÔNG?
  - 89 hasOwnProperty, 92. truy cập mảng lồng nhau cho ký hiệu []. đẹp, 93. bộ sưu tập bản ghi WOW,
  - 96 lặp với vòng lặp while trong js

**Ghi chú về Bộ sưu tập bản ghi (Record Collection)**:

-

78. trả về giá trị boolean từ hàm:

```js
function isEqual(a, b) {
  if (a === b) {
    return true;
  } else {
    return false;
  }
}
// reduced to
function isEqual(a, b) {
  return a === b;
}
```

> Do đó, `return a === b` là cách viết tắt cho toàn bộ câu lệnh if

<div id="back-to-top"></div>

Những ghi chú hay nhất của tôi từ khóa Modern JS của Traversy:

- 8 - kiểu dữ liệu nguyên thủy: string, number, boolean, null, undefined - lưu trực tiếp tại vị trí mà biến truy cập - lưu trên ngăn xếp (stack)
- kiểu tham chiếu: mảng, object literal, hàm, ngày tháng - truy cập qua tham chiếu, nên dữ liệu không thực sự lưu trong biến – đối tượng được lưu trên heap, heap là bộ nhớ được cấp phát động
- toán tử typeof – dùng với kiểu dữ liệu tham chiếu sẽ trả về ‘object’ cho tất cả chúng
- 9 - chuyển đổi kiểu là nơi bạn thay đổi kiểu dữ liệu của biến – ví dụ, dữ liệu từ biểu mẫu sẽ mặc định là chuỗi nhưng bạn có thể muốn phân tích nó
- `length - 1`
- 12 - template literals / chuỗi mẫu: ${ tên biến hoặc biểu thức/toán học hoặc lời gọi hàm hoặc dùng điều kiện / toán tử tam thức }
- 13 - arr.sort() - tuyệt vời cho chuỗi nhưng không cho kết quả đúng với mảng số
- phương thức `find()` nhận vào hàm kiểm tra: arr.find(functionName) trong đó functionName thực hiện so sánh đơn giản và nó nhận đối số là các mục mảng của bạn tôi nghĩ – nó trả về số đầu tiên thỏa tiêu chí
- từ khóa `this` – cố gắng truy cập khóa khác trong đối tượng bên trong hàm
- 15 – ngày & thời gian: new Date() - mặc định là ngày hiện tại nếu bạn không truyền gì vào
- new Date(year, monthIndex, day, hours, minutes, seconds)
- 16 - if (typeof thing !== 'undefined') – bây giờ bạn sẽ không gặp lỗi
- 18 - BIỂU THỨC HÀM: là khi hàm là giá trị của biến, thường chúng là ẩn danh
- LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG: Hàm bên trong đối tượng thay vì ở phạm vi toàn cục - trong trường hợp này chúng được gọi là PHƯƠNG THỨC – hàm trong đối tượng `todo` gọi là `add` hoặc `edit` và bạn gọi nó bằng `todo.add()` - hoặc `todo.edit(id)`
- 19 - lặp riêng cho mảng với forEach và map
- BREAK và CONTINUE là những thứ rất quan trọng cần biết cho vòng lặp
- forEach: nhận hàm gọi lại, hàm ẩn danh – hàm ẩn danh có thể nhận 3 tham số, nhưng bạn chỉ cần một – bất kỳ thứ gì bạn muốn dùng làm lần lặp hiện tại, hoặc bộ lặp -
- tham số đầu tiên trong 3 thứ hàm nhận là bộ lặp – tiếp theo là chỉ số (index) cho mỗi mục trong mảng – và bạn cũng có thể truyền mảng cho chính mảng đó
- map: map có thể hoạt động theo vài cách khác nhau – nó được dùng để trả về thứ khác – để trả về mảng khác
- vòng lặp `for in`: thường dùng cho đối tượng – tạo đối tượng user > rồi for (let x in user) trả về tên các khóa – user[x]) trả về giá trị
- 24 - Bộ chọn DOM (phương thức) cho phần tử đơn: getElementById, querySelector, getElementsByClassName, getElementsByTagName, querySelectorAll
- tạo phần tử: className, setAttribute, appendChild, createTextNode, createElement, replaceChild, getAttribute, hasAttribute, removeAttribute,
- 29 - LƯU Ý: một số phần tử có hành vi mặc định – để ngăn hành vi mặc định, truyền tham số vào hàm gọi lại và làm e.preventDefault()
- Phần tử mục tiêu của sự kiện (Event Target Element): có thể lấy `e.taget.className` hoặc để lấy tập hợp đổi className thành classList - TARGET rất quan trọng đặc biệt cho ủy quyền sự kiện (event delegation)
- 33 - localStorage: JSON.stringify, JSON.parse, clear, getItem, removeItem, setItem
- BỎ QUA 4) Dự án DOM
- 44 - OOP: hàm tạo & từ khóa _this_: những thứ quan trọng nhất trong OOP là hàm tạo và từ khóa `this`: nếu bạn muốn tạo nhiều thể hiện của một loại đối tượng nhất định thì bạn muốn tạo hàm tạo
- từ khóa `this` tham chiếu tới thể hiện hiện tại của đối tượng, phạm vi hàm
- LƯU Ý: hàm tạo thực sự mạnh mẽ khi chúng có hàm bên trong được gọi là phương thức
- 46 - mỗi đối tượng trong JS có một prototype – prototype tự nó là một đối tượng – mọi đối tượng kế thừa thuộc tính và phương thức từ prototype của chúng = Object.prototype vs Client.prototype
- Object.prototype – bạn có thể thấy các phương thức của nó như hasOwnProperty, toString, valueOf
- 47 - kế thừa prototype: để một đối tượng hoặc một kiểu đối tượng kế thừa từ đối tượng khác
- dùng .call(a, b, c, ...) - `call()` là hàm cho phép chúng ta gọi hàm khác từ nơi khác trong ngữ cảnh hiện tại
- 49 – lớp ES6: Bất kỳ phương thức nào bạn thêm bên trong lớp đều được thêm vào prototype và bạn vẫn có Object.prototype
- Phương thức tĩnh – những phương thức bạn có thể dùng mà không cần khởi tạo đối tượng hoặc thể hiện mới
- 50 kế thừa và mở rộng lớp – hay còn gọi là lớp con (sub-classes)
- khi bạn khởi tạo lớp con bạn muốn gọi hàm tạo của lớp và bạn làm điều đó bằng hàm gọi là super() - hàm này gọi hàm tạo của lớp cha – bạn phải truyền các tham số chung

7. Async JS, AJAX & Fetch API

- ajax và fetch api để thực hiện yêu cầu http tới file, api và dịch vụ dù là của bạn hay không -
- hàm bất đồng bộ – bạn truyền vào hàm gọi lại là một phương pháp xử lý mã bất đồng bộ
- hầu hết mã async bạn làm việc sẽ đến từ API hoặc thư viện như AJAX và đối tượng XHR – cũng như jquery, thư viện như Axios, fetch api, module filesystem (fs) của Node.js, XMLHttpRequest – tất cả đều là công nghệ bất đồng bộ
- cách làm việc với mã Async: 1. Callback, 2. Promise, 3. Async/Await
- 58 Ajax – tập hợp công nghệ web để gửi và nhận dữ liệu từ máy khách & máy chủ một cách bất đồng bộ – thực hiện ngầm mà không cần tải lại trang
- cập nhật một phần trang nhanh hơn với AJAX so với phải tải lại trang - điều này xảy ra bằng cách thực hiện lời gọi AJAX hoặc JS bất đồng bộ – nó đi qua công cụ AJAX và dùng đối tượng XmlHttpRequest
- máy chủ trả về dữ liệu thường ở định dạng JSON - sau đó chúng ta phân tích và dùng dữ liệu đó trong ứng dụng -
- khi chúng ta gửi và nhận yêu cầu nó có thể từ thứ gì đó trên máy cục bộ hoặc từ API công khai - các API này phải có quyền được cấp để chúng ta có thể dùng chúng - chúng thường đã bật CORS cho phép giao tiếp liên miền nghĩa là chúng ta có thể thực hiện yêu cầu tới API của họ dù đang ở tên miền khác
- 59 - dùng từ khóa new để khởi tạo thể hiện mới của XMLHttpRequest có các thuộc tính như open()
- TÓM TẮT: 1. trình lắng nghe sự kiện 2. gọi hàm 3. tạo thể hiện mới của đối tượng xhr, 4. .open() được gọi và chúng ta truyền vào 4a. kiểu yêu cầu và 4b. url/tên file và 4c. true cho bất đồng bộ, khi sẵn sàng, 5. onload được gọi nơi chúng ta 6. kiểm tra status = 200, 7. chúng ta làm gì đó với response text, 8. .send để hoạt động
- cũng có thứ gọi là giá trị readyState
- 61 - nếu bạn xây dựng ứng dụng full-stack nó có thể từ api của chính bạn hoặc từ api bên ngoài - .open(), .send(), .onload() -
- 62 - REST là viết tắt của REpresentational State Transfer – là kiểu kiến trúc để thiết kế ứng dụng mạng – nó hoạt động bằng cách dựa vào giao thức giao tiếp máy khách-máy chủ không trạng thái và hầu như luôn là HTTP
- REST được tạo ra để coi đối tượng phía máy chủ như tài nguyên có thể được tạo, cập nhật, đọc và xóa (CRUD)
- điều làm REST tuyệt vời là vì nó hoạt động chỉ dùng yêu cầu HTTP và thường là chuẩn như JSON
- API là người đưa tin và REST cho phép chúng ta dùng yêu cầu HTTP để định dạng thông điệp
- REST API nhận nhiều loại yêu cầu HTTP → GET, POST, PUT, DELETE, HEAD, CONNECT, TRACE, OPTIONS, PATCH
- ENDPOINT: các url mà bạn truy cập để làm những việc nhất định
- với POST, PUT và DELETE bạn sẽ gửi dữ liệu kèm yêu cầu – API cần biết dữ liệu nào để thêm, cập nhật hoặc xóa
- 63 – hàm gọi lại (callback): hàm được truyền làm tham số cho hàm khác và sau đó được chạy bên trong thân hàm - hàm trong forEach là đồng bộ – setTimeout dùng callback bất đồng bộ
- 64, 65 - khó hiểu
- 66 – promise ES6:
- 67 – Fetch API:
- 68 – Xử lý lỗi với Fetch:
- 69 – hàm mũi tên:
- 71 – async & await:

Những ghi chú hay nhất của tôi từ khóa 20 dự án web với javascript thuần của Traversy:

- với trường nhập số, dùng `typeof` cho thấy nó là chuỗi - thêm ký hiệu + để chuyển thành số
- `console.log(e.target);` - cho bạn phần tử chính xác được nhấp
- toán tử spread chuyển danh sách nút (node list) thành mảng - sau đó để duyệt qua dùng phương thức mảng bậc cao gọi là map()
- Fetch được tích hợp sẵn trong trình duyệt nên bạn không cần dùng CDN hoặc cài đặt
- fetch chạy bất đồng bộ nghĩa là trong nền và nó trả về promise – khi fetch xong nó sẽ trả về promise – bạn bắt promise đó bằng .then() - .then() nhận một hàm; res.json();

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Data structures

Video: Data Structures and Algorithms in JavaScript 1:52:54 |

### Stacks

- 0:20 Cấu trúc dữ liệu ngăn xếp → VÍ DỤ: chồng sách, LIFO, nút quay lại của trình duyệt (đẩy trang lên đầu),
- hàm cho “ngăn xếp”: push(), pop(), length, và peek (peek chỉ là .length - 1) -
- dùng ngăn xếp mảng để tìm palindrome (RADAR) –
- dùng mảng làm ngăn xếp hoặc tự triển khai ngăn xếp-

### Sets

- Cấu trúc dữ liệu Set giống mảng ngoại trừ không có mục trùng lặp và giá trị không theo thứ tự cụ thể – cách dùng điển hình cho set là kiểm tra sự tồn tại của một mục cụ thể

### Queue

- 19:24 – cấu trúc dữ liệu hàng đợi là cách để lưu dữ liệu – nó tương tự ngăn xếp, ngăn xếp là FILO (tôi nghĩ anh ấy muốn nói LIFO), hàng đợi là FIFO – trong JS bạn có thể triển khai hàng đợi bằng mảng, - hãy nghĩ hàng xếp hàng ở cửa hàng hoặc ngân hàng hoặc hàng đợi in – 1. có mảng, 2. thêm vào (enqueue) bằng list.push(), 3. xóa (dequeue) bằng return list.shift(), 4. xem gì ở đầu hàng đợi bằng return list[0], 5. lấy kích thước mảng bằng return list.length, 6. kiểm tra hàng đợi có rỗng không bằng return (list.length === 0)

### Binary Search Tree

- 26:03 – cách để lưu dữ liệu mà khi hình dung trông như cây (nghĩ tới hệ phân cấp công ty) – tất cả điểm dữ liệu được gọi là nút – đỉnh cây gọi là nút gốc (thẻ html) và sau đó phân nhánh sang trái và phải, nút cha và con và nút anh chị em, nút lá là nút ở cuối cây không có con – cây tìm kiếm nhị phân là kiểu cây cụ thể, …
- 1. tạo 2 lớp với class Node có hàm tạo nhận data, left, và right cho lớp thứ nhất và chỉ hàm tạo cho lớp thứ hai 2) với lớp thứ hai có phương thức add(data) là hàm rất lớn để thêm thứ gì đó vào cây, bạn thấy đặt nút gốc nếu là đầu tiên bằng new Node(data), hoặc dùng hàm đệ quy để tìm nơi đặt Node mới – không hiểu chuyện trái vs phải – các phương thức khác là findMin(), findMax(), find(data), isPresent(), remove(data),

### Hash Table

- 53:20 – được dùng để triển khai mảng liên hợp hoặc ánh xạ cặp khóa-giá trị – chúng là cách phổ biến để triển khai cấu trúc dữ liệu map hoặc đối tượng – chúng được dùng rộng rãi vì hiệu quả – thời gian tra cứu nhanh, không phụ thuộc số lượng phần tử – cách chúng hoạt động: 1. nó nhận đầu vào khóa và chạy qua hàm băm – hàm băm → khớp chuỗi với số và thường số tương ứng với chỉ số trong mảng – khóa được gửi qua hàm băm và trả về hash/chỉ số – hàm băm cần nhất quán sao cho khi chạy khóa qua nó, luôn cho cùng một số (không có “xung đột”) -
- bảng băm đã được xây dựng sẵn trong JS và các ngôn ngữ khác – trong JS chúng được dùng để triển khai đối tượng, 56:27 như ví dụ thủ công – this.add(), this.remove, this.lookup,
  1:03:05 Danh sách liên kết – phần tử được lưu trong nút – nút có 2 thông tin chính: 1) phần tử, 2) tham chiếu (liên kết) tới nút tiếp theo – như mảng, danh sách liên kết có thể dùng để triển khai nhiều cấu trúc dữ liệu khác – chúng có ưu và nhược điểm khi so với mảng – mỗi danh sách liên kết có con trỏ đầu (head) trỏ tới nút đầu tiên – nút cuối trỏ tới null -

- this.element, this.next, info1 → link → info2 → link, ... 1) tạo nút, 2) rồi this.size return, this.head return, this.add element, this.remove element,

### Trie

- 1:15:00 – đôi khi gọi là cây tiền tố, là kiểu cây đặc biệt dùng để lưu cấu trúc dữ liệu liên hợp – chúng lưu dữ liệu theo từng bước, mỗi bước là một nút trong trie, thường dùng để lưu từ – ví dụ, để xác thực một từ có trong từ điển – mỗi bước/nút sẽ đại diện 1 chữ cái của từ
- 1. this.keys = new Map(), quá khó hiểu

### Heap

- 1:27:29 – heap nhị phân là cây nhị phân có thứ tự một phần thỏa mãn tính chất heap – mỗi nút có tối đa 2 nút con – chỉ ra tính chất cụ thể giữa nút cha và nút con – tìm hiểu max heap và min heap cho số nút con < hoặc > số nút cha – lại thuộc tính nút trái và nút phải – chúng thường được triển khai dưới dạng mảng – con trái = i _ 2, con phải = i _ 2 + 1, cha = i / 2 – nhân tiện, không có chỉ số 0 trong heap – nó là null -

### Graphs

- 1:42:08 – cấu trúc dữ liệu đồ thị là tập hợp các thứ và mối quan hệ/kết nối giữa chúng – dữ liệu hoặc đồ thị được gọi là nút hoặc đỉnh – kết nối giữa các nút gọi là cạnh – mạng xã hội là ví dụ nơi các nút là bạn và người khác và các cạnh là liệu bạn có là bạn bè – có 2 loại: đồ thị có hướng và vô hướng – 3 cách để biểu diễn đồ thị: 1) danh sách kề, 2) ma trận kề, 3) ma trận liên thuộc
  Map – chúng lưu cặp khóa-giá trị – trong JS Object là map – chúng cung cấp tra cứu nhanh các mục đã lưu -

## OOP

Video: Giới thiệu Lập trình hướng đối tượng - Khóa cấp tốc |

- việc gom các biến liên quan lại với nhau là quan trọng -
- Định nghĩa: Đối tượng = thể hiện của lớp | Lớp = khuôn mẫu cho đối tượng -
  - Ví dụ: Quân cờ vua, quân Mã, trắng hoặc đen, đã bị bắt hay chưa, với vị trí hiện tại, hàm hoặc phương thức sẽ là move() và sẽ trả về các ô có thể mà mã có thể đi tới – vì vậy move(), biến position, biến color nhưng không khởi tạo các biến đó – tốt nhất là định nghĩa chúng khi bạn tạo lớp thay vì trong chính lớp – tạo hàm move trong lớp thay vì trong mỗi đối tượng bạn tạo -

- khi tạo đối tượng mã, bạn khởi tạo biến / thuộc tính và phương thức của nó để chứa thông tin cụ thể cho quân mã đó -
  - lớp Knight đại diện cho bất kỳ quân mã nào, đối tượng mã đại diện cho một quân mã cụ thể
  - OOP là công cụ tốt nhất để tạo chương trình phức tạp bằng cách gom dữ liệu và hàm liên quan lại với nhau
  - 4 nguyên tắc chính của OOP: 1) Đóng gói (Encapsulation), 2) Trừu tượng (Abstraction), 3) Kế thừa (Inheritance), 4) Đa hình (Polymorphism)

- Đóng gói (Encapsulation): trong OOP, chỉ việc đóng gói dữ liệu với các phương thức có thể thao tác trên dữ liệu đó trong một lớp. Đó là ý tưởng ẩn dữ liệu trong một lớp, ngăn bất kỳ thứ gì bên ngoài lớp đó tương tác trực tiếp với nó. Thành viên của các lớp khác có thể tương tác với thuộc tính của đối tượng khác qua các phương thức của nó: phương thức `get` và `set`. Ngoài ra, bạn có thể muốn một số thuộc tính chỉ được đọc từ bên ngoài lớp, nghĩa là bạn chỉ có phương thức getter, không có setter. Đừng cho phép lớp bên ngoài chỉnh sửa trực tiếp thuộc tính của đối tượng. Mỗi phần không nên có quyền truy cập hoặc phụ thuộc vào cách hoạt động nội tại của các phần mã khác (che giấu thông tin)!!!
- Trừu tượng (Abstraction): trong OOP, chỉ việc chỉ hiển thị chi tiết thiết yếu và giữ mọi thứ khác bị ẩn. Người dùng lớp của bạn không nên lo về chi tiết nội tại của các lớp đó. Hãy chia mã thành các phần nhỏ. Tốt nhất nếu phần bạn đang làm việc có thể hoạt động mà không cần biết cách hoạt động bên trong của phần khác. Hãy suy nghĩ theo giao diện và triển khai. Giao diện đề cập tới cách các phần mã có thể giao tiếp với nhau (thực hiện qua các phương thức mà mỗi lớp có thể truy cập). Việc triển khai các phương thức (cách chúng được viết) nên bị ẩn.
- Kế thừa (Inheritance): trong OOP, là nguyên tắc cho phép các lớp kế thừa từ các lớp khác – phương thức và thuộc tính. Lớp cha (SuperClass) với các lớp con (Subclasses). Lớp con kế thừa phương thức và thuộc tính từ lớp cha của chúng. Bổ từ truy cập (access modifiers) thay đổi lớp nào có quyền truy cập vào lớp, phương thức hoặc thuộc tính khác. Có 3 bổ từ truy cập chính: Public, Private và Protected.
- Public có thể truy cập từ bất kỳ đâu trong chương trình của bạn.
- Private chỉ có thể truy cập từ bên trong cùng lớp nơi thành viên được định nghĩa.
- Protected có thể truy cập trong lớp nó được định nghĩa, cũng như các lớp con của lớp đó.
- Đa hình (Polymorphism): trong OOP, mô tả các phương thức có khả năng mang nhiều hình thức. Có 2 loại: Động và Tĩnh. Đa hình động xảy ra trong thời gian chạy của chương trình. Nó mô tả khi chữ ký phương thức nằm ở cả lớp con và lớp cha. Chúng có cùng tên nhưng triển khai khác nhau, nhưng lớp con ghi đè lớp cha. Điều này là vì hình thức của phương thức được quyết định dựa trên vị trí trong hệ phân cấp lớp nơi nó được gọi. Điều này giảm nhu cầu cho nhiều câu lệnh if/else if. Đa hình tĩnh xảy ra trong thời gian biên dịch và đề cập tới khi nhiều phương thức có cùng tên nhưng đối số khác nhau được định nghĩa trong cùng một lớp: hoặc số lượng tham số khác nhau, hoặc kiểu khác nhau, hoặc theo thứ tự khác nhau. Đó được gọi là nạp chồng phương thức. Dù các phương thức có cùng tên, chữ ký của chúng khác nhau do đối số của chúng.
- Nếu bạn gọi phương thức với quá nhiều tham số, hoặc tham số kiểu không đúng, thì bạn sẽ gặp lỗi.

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="dates" align="center">Dates</h2>

**BẢNG GHI NHỚ NGÀY GIỜ ĐỂ LẤY NGÀY GIỜ THỰC**:

- ví dụ mã từ leafpickup.js:

```js
// Get day of week for November 1st for the current year
const d = new Date();
const year = d.getFullYear();
let currentNovFirst = "11/01/" + year;
let novFirstDay = new Date(currentNovFirst).getDay();
```

```js
// check the current year and update the startYr variable.
if (year < 2032) {
  let startYr = 2021;
} else if (year >= 2032 && year <= 2042) {
  let startYr = 2032;
```

```js
/* CALCULATING AND FORMATTING THE MONDAY DATES FOR THE 6 WEEKS */
let week1 = new Date(),
  week2 = new Date(),
  week3 = new Date(),
  week4 = new Date(),
  week5 = new Date(),
  week6 = new Date();

const format = { year: "numeric", month: "short", day: "numeric" };

week1.setTime(weekOne.getTime());
week1Format = week1.toLocaleDateString("en-us", format);
// weekOne is the output from a switch() statement which finds the day of the
// week for the 1st of Nov then return the date for the first Monday in November
```

<h2 id="functions-and-return" align="center">Functions and Return</h2>

- Tham số là các biến đóng vai trò giữ chỗ cho các giá trị sẽ được đưa vào hàm khi nó được gọi
- Khi hàm được định nghĩa, nó thường được định nghĩa cùng với một hoặc nhiều tham số
- Giá trị thực tế được đưa vào (hoặc "truyền") hàm khi nó được gọi được gọi là đối số
- _Tham số_ là <ins>biến</ins>, _Đối số_ là <ins>giá trị</ins>
- Phạm vi: đề cập tới tầm nhìn của biến
  - **Phạm vi toàn cục** = được định nghĩa bên ngoài hàm và có sẵn trên toàn cục
  - Biến được khai báo không có từ khóa let hoặc const tự động được tạo trong phạm vi toàn cục.
  - Điều này có thể tạo ra hậu quả không mong muốn ở nơi khác trong mã hoặc khi chạy lại hàm. Bạn nên luôn khai báo biến bằng let hoặc const
  - **Phạm vi cục bộ** = biến được khai báo trong hàm, chúng chỉ hiển thị trong hàm đó

- **Return**: Chúng ta có thể truyền giá trị vào hàm bằng đối số. Bạn có thể dùng câu lệnh `return` để gửi giá trị trở lại ra khỏi hàm
- Khi câu lệnh `return` được dùng trong thân hàm, việc thực thi hàm bị dừng và quyền điều khiển trở lại vị trí gọi
- Nếu được chỉ định, giá trị cho trước được trả về cho bên gọi hàm
- Trong trường hợp hàm không có câu lệnh `return`, khi bạn gọi nó, hàm xử lý mã bên trong nhưng giá trị trả về là `undefined`

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="conditional-logic" align="center">Conditional Logic</h2>

- `Boolean` và câu lệnh `if`: `if (boolean condition) { code if true}`
- nếu không dùng `<` hoặc `>` hoặc ký hiệu so sánh khác, câu lệnh được coi là `true` nếu giá trị là bất kỳ thứ gì khác 0
- Toán tử so sánh: `<`, `>`, `<=`, `>=`, `!=`, `==`, `!==`, `===`
- Giống toán tử `equality operator` (& `inequality operator`), toán tử `greater than` **sẽ chuyển đổi kiểu dữ liệu của giá trị khi so sánh** - tương tự với `<`, `>=`, `<=`.
- Toán tử bằng (`==`) vs. toán tử bằng nghiêm ngặt (`===`): toán tử bằng nghiêm ngặt so sánh cả kiểu dữ liệu và giá trị
- Điều tương tự đúng với toán tử bất bằng: `!=` và `!==`
- Bạn có thể xác định kiểu của biến hoặc giá trị bằng toán tử typeof
- Toán tử And: để kiểm tra nhiều thứ cùng lúc. Toán tử logic and (`&&`) trả về `true` khi và chỉ khi toán hạng bên trái và bên phải của nó đều true
- Toán tử Or: Toán tử logic or (`||`) trả về `true` nếu một trong hai toán hạng là true
- Tam thức (Ternary)

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="conditional-statements" align="center">Conditional Statements</h2>

If, Else, Else If, Switch:

- câu lệnh `else`: dùng khi điều kiện trong câu lệnh `if` không thỏa mãn và khối mã thay thế được thực thi
- câu lệnh `else if`: Nếu bạn có nhiều điều kiện cần xử lý, bạn có thể nối các câu lệnh `if` với nhau bằng `else if`; hãy cẩn thận về thứ tự câu lệnh
- câu lệnh `switch`: kiểm tra giá trị và có thể có nhiều câu lệnh `case` định nghĩa các giá trị khả dĩ khác nhau. Các câu lệnh được thực thi từ `case` khớp đầu tiên cho đến khi gặp `break`
- câu lệnh `case` được kiểm tra bằng bằng nghiêm ngặt (`===`): `switch(check value(s)) {case value: varname = something; break; next case check…}`
- `default` nghĩa là `else` trong câu lệnh `switch` – bạn cũng có thể có nhiều case trước `break`

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="loops" align="center">Loops</h2>

- vòng lặp `while`: chạy trong khi điều kiện chỉ định là true và dừng khi điều kiện đó không còn true
- vòng lặp `for`: Loại vòng lặp JavaScript phổ biến nhất gọi là vòng lặp `for` vì nó chạy trong một số lần cụ thể
  - `for (a; b; c) { }`, trong đó a là câu lệnh khởi tạo, b là câu lệnh điều kiện, và c là biểu thức cuối
  - Nhiệm vụ phổ biến trong JavaScript là duyệt qua nội dung của mảng. Một cách để làm là dùng vòng lặp `for`
  - Bộ tích lũy (Accumulators): Biểu thức += chỉ là viết tắt của x = x + i

- Vòng lặp `for` lồng nhau: mảng bên trong mảng khác
- Vòng lặp `do...while`: nó sẽ `do` một lượt mã bên trong vòng lặp bất kể điều gì, và sau đó tiếp tục chạy vòng lặp `while` điều kiện chỉ định đánh giá thành `true`
- Toán tử điều kiện (tam thức): a ? b : c
- Đệ quy: ???

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="es6" align="center">ES6</h2>

- Số ngẫu nhiên:
  - Số nguyên ngẫu nhiên: `Math.floor(Math.random() * 20); `
  - Số nguyên ngẫu nhiên trong khoảng: `Math.floor(Math.random() * (max - min + 1)) + min`

- Hàm `parseInt()` phân tích chuỗi và trả về số nguyên: `var a = parseInt("007");`
- Toán tử điều kiện (tam thức): `a ? b : c`, trong đó `a` là điều kiện, `b` là mã chạy khi điều kiện trả về `true`, và `c` là mã chạy khi điều kiện trả về `false`

**Biến: var, let, const**:

- **Hoisting** đề cập tới quá trình mà trình thông dịch dường như di chuyển khai báo của hàm, biến hoặc lớp lên đầu phạm vi của chúng, trước khi thực thi mã.
- Hoisting cho phép hàm được dùng an toàn trong mã trước khi chúng được khai báo - khai báo biến và hàm được di chuyển lên đầu phạm vi trước khi thực thi mã
- Khi bạn khai báo biến không có câu lệnh nó tự động được khai báo là `var`
- Phạm vi là toàn cục khi biến `var` được khai báo bên ngoài hàm
- `let` vs `var`: `var` có thể bị ghi đè, `CONST` thì không
- `let` có phạm vi khối - Khối là đoạn mã được bao bởi `{ }` - Vì vậy biến khai báo trong khối bằng let chỉ có sẵn để dùng trong khối đó
- `let` có thể cập nhật nhưng không khai báo lại
- biến khai báo bằng `let` có thể được cập nhật trong phạm vi của nó
- biến `let` không thể khai báo lại trong phạm vi của nó
- Giống như `var`, khai báo `let` được hoisting lên đầu
- Từ khóa `let` không được khởi tạo - nếu bạn cố dùng biến `let` trước khi khai báo, bạn sẽ gặp `Reference Error`
- `"use strict"`: khai báo ở đầu file hoặc trong hàm: bạn không thể dùng <ins>biến chưa khai báo</ins> - Nó giúp bạn viết mã sạch hơn
- Phạm vi: Khi bạn khai báo biến bằng từ khóa `let` bên trong khối, câu lệnh hoặc biểu thức, phạm vi của nó bị giới hạn trong khối, câu lệnh hoặc biểu thức đó
  - Hành vi này sẽ gây vấn đề nếu bạn tạo hàm và lưu nó để dùng sau bên trong vòng lặp `for` dùng biến `i`. Điều này là vì hàm đã lưu sẽ luôn tham chiếu tới giá trị của biến `i` toàn cục đã cập nhật???

- Khai báo biến chỉ đọc bằng từ khóa `const`: `const` có mọi tính năng tuyệt vời mà let có, với lợi ích thêm là biến khai báo bằng `const` là chỉ đọc
- Biến `const` có phạm vi khối và phải được khởi tạo khi khai báo
- Bạn nên luôn đặt tên biến không muốn gán lại bằng từ khóa `const`
- Dùng `let` khi bạn muốn biến thay đổi, dùng `const` khi bạn muốn nó là hằng số
- Hành vi này hơi khác khi nói tới đối tượng khai báo bằng `const`. Trong khi đối tượng `const` không thể cập nhật, thuộc tính của đối tượng này có thể được cập nhật
- Dùng `let` khi bạn biết giá trị của chúng sẽ thay đổi
- Thay đổi trực tiếp mảng khai báo bằng `const`: Đối tượng gán cho biến dùng `const` vẫn có thể thay đổi trực tiếp
- ngăn thay đổi trực tiếp đối tượng: Để đảm bảo dữ liệu không thay đổi, dùng hàm `Object.freeze` để ngăn thay đổi trực tiếp dữ liệu. Khi đã đóng băng, bạn không thể thêm, cập nhật hoặc xóa thuộc tính khỏi nó nữa: `Object.freeze(objName);`

**Hàm mũi tên, tham số Rest, toán tử Spread, Template literals**:

- hàm nội tuyến - Khi không có thân hàm, và chỉ có giá trị trả về, cú pháp hàm mũi tên cho phép bạn bỏ từ khóa `return` cũng như dấu ngoặc bao quanh mã
- Nếu hàm mũi tên có một tham số duy nhất, dấu ngoặc bao quanh tham số có thể bỏ
- Tham số mặc định: cho phép tham số có tên được khởi tạo với giá trị mặc định nếu không có giá trị hoặc undefined được truyền: ` function fnName(parm1 = val1) {```} ` hoặc `function fnName(parm1, parm2 = val, ...) {...}`
- **Tham số Rest**: bạn có thể tạo hàm nhận số lượng đối số biến đổi. Các đối số này được lưu trong mảng có thể truy cập sau từ bên trong hàm: `(...args)`
- Tham số rest loại bỏ nhu cầu kiểm tra mảng args và cho phép chúng ta áp dụng `map()`, `filter()` và `reduce()` trên mảng tham số
- Chỉ tham số cuối cùng trong định nghĩa hàm mới có thể là tham số rest
- **Toán tử Spread**: cho phép bạn mở rộng mảng và các biểu thức khác ở nơi kỳ vọng nhiều tham số hoặc phần tử

```
const arr = [6, 89, 3, 45];
const maximus = Math.max(...arr);
```

- `...arr` trả về mảng đã giải nén
- toán tử spread chỉ hoạt động tại chỗ, như trong đối số của hàm hoặc trong mảng literal
- **Template literals** cho phép bạn tạo chuỗi nhiều dòng
- Cú pháp `${variable}` là placeholder
- **Object Literal**: ???
- Lớp, hàm tạo, new, setter, getter???
- **Module** script: xuất các phần của file để dùng trong một hoặc nhiều file khác, và nhập các phần bạn cần, ở nơi bạn cần chúng
- Bạn cần tạo script trong tài liệu HTML với kiểu module: `<script type="module" src="filename.js"></script>`
- Dùng từ khóa `export` và `import` -
- Khi bạn xuất biến hoặc hàm, bạn có thể nhập nó trong file khác và dùng mà không cần viết lại mã
- Xuất nhiều thứ: `export { thing1, thing2 };`
- `import` cho phép bạn chọn phần nào của file hoặc module để tải: `import { add } from './math_functions.js'; `
- Dùng `import *` để nhập mọi thứ từ file -
- Tạo fallback khi xuất bằng `export default` - bỏ dấu ngoặc nhọn khi bạn nhập export mặc định
- BỎ QUA PROMISE - KHÔNG HIỂU REST VÀ SPREAD

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="regex" align="center">RegEx</h2>

Nhóm Capture, Lookahead

-

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="debugging" align="center">Debugging</h2>

`console.log()`, `typeof`, LỖI OFF-BY-ONE, ĐÁNH CHỈ SỐ, VÒNG LẶP VÔ HẠN

- JavaScript nhận ra sáu kiểu dữ liệu nguyên thủy (bất biến): Boolean, Null, Undefined, Number, String và Symbol (mới trong ES6) và một kiểu cho mục có thể thay đổi: Object. Lưu ý trong JavaScript, mảng về mặt kỹ thuật là một kiểu đối tượng
- Hầu như mọi giá trị riêng lẻ trong JavaScript đều đánh giá thành true, ngoại trừ những gì được gọi là giá trị "falsy": `false`, `0`, `""`, `NaN`, `undefined`, và `null`
- Dùng toán tử gán (`=`) thay vì toán tử bằng (`==` và `===`)
- Những thứ _VS Code_ bắt được: 1) lỗi chính tả tên hàm và biến, 2) dấu ngoặc đơn, ngoặc vuông, ngoặc nhọn và dấu nháy chưa đóng, 3) dùng lẫn lộn nháy đơn và nháy kép, 4)
- Những thứ VS Code không bắt được: 1) dấu ngoặc đơn mở và đóng sau lời gọi hàm, 2) đối số truyền sai thứ tự. 3) Lỗi off-by-one

<h2 id="data-structures" align="center">Data Structures</h2>

Đối tượng Window:

- close, window.outerheight, window.outerwidth, innerHeight và innerWidth, window.scrollY, window.scrollX, window.location, window.location.search, window.location.href, window.location.reload(), window.history.go(-2), window.history.length, window.navigator, window.navigator.geolocation.getCurrentPosition, navigator.language

<h2 id="basic-algorithms" align="center">Basic Algorithms</h2>

<h2 id="oop" align="center">OOP</h2>

THIS, PROTOTYPE, CONSTRUCTOR, INHERITANCE

<h2 id="functional-programming" align="center">Functional Programming</h2>

MAP, FILTER, REDUCE, SORT, SPLIT

NHỚ LWC 10 NGÀY CỦA JS

# The DOM

có gì đó ở đây...

<h2 id="dom-elements" align="center">DOM Elements</h2>

có gì đó ở đây...

### DOM Node Properties

- attributes — Trả về tập hợp động (live collection) của mọi thuộc tính đã đăng ký cho phần tử
- baseURI — Cung cấp URL cơ sở tuyệt đối của phần tử HTML
- childNodes — Cho tập hợp các nút con của phần tử
- firstChild — Trả về nút con đầu tiên của phần tử
- lastChild — Nút con cuối cùng của phần tử
- nextSibling — Cho bạn nút tiếp theo ở cùng cấp cây nút
- nodeName —Trả về tên của nút
- nodeType — Trả về kiểu của nút
- nodeValue — Đặt hoặc trả về giá trị của nút
- ownerDocument — Đối tượng tài liệu cấp cao nhất cho nút này
- parentNode — Trả về nút cha của phần tử
- previousSibling — Trả về nút ngay trước nút hiện tại
- textContent — Đặt hoặc trả về nội dung văn bản của nút và các nút con của nó

### DOM Node Methods

- appendChild() — Thêm nút con mới vào phần tử làm nút con cuối cùng
- cloneNode() — Nhân bản phần tử HTML
- compareDocumentPosition() — So sánh vị trí tài liệu của hai phần tử
- getFeature() — Trả về đối tượng triển khai API của tính năng chỉ định
- hasAttributes() — Trả về true nếu phần tử có bất kỳ thuộc tính nào, ngược lại false
- hasChildNodes() — Trả về true nếu phần tử có bất kỳ nút con nào, ngược lại false
- insertBefore() — Chèn nút con mới trước nút con hiện có, đã chỉ định
- isEqualNode() — Kiểm tra xem hai phần tử có bằng nhau không
- isSameNode() — Kiểm tra xem hai phần tử có cùng là một nút không
- isSupported() — Trả về true nếu tính năng chỉ định được hỗ trợ trên phần tử
- removeChild() — Xóa nút con khỏi phần tử
- replaceChild() — Thay thế nút con trong phần tử

### DOM Element Methods

- getAttribute() — Trả về giá trị thuộc tính chỉ định của nút phần tử
- getAttributeNode() — Lấy nút thuộc tính chỉ định
- getElementsByTagName() — Cung cấp tập hợp mọi phần tử con có tên thẻ chỉ định
- hasAttribute() — Trả về true nếu phần tử có bất kỳ thuộc tính nào, ngược lại false
- removeAttribute() — Xóa thuộc tính chỉ định khỏi phần tử
- setAttribute() — Đặt hoặc thay đổi thuộc tính chỉ định thành giá trị chỉ định

<h2 id="javaScript-events" align="center">JavaScript Events</h2>

Sự kiện là những thứ có thể xảy ra với phần tử HTML và được thực hiện bởi người dùng. Ngôn ngữ lập trình có thể lắng nghe các sự kiện này và kích hoạt hành động trong mã. Không có bảng ghi nhớ (cheat sheet) JavaScript nào là đầy đủ nếu thiếu chúng.

### Mouse

- onclick — Sự kiện xảy ra khi người dùng nhấp vào phần tử
- oncontextmenu — Người dùng nhấp chuột phải vào phần tử để mở menu ngữ cảnh
- ondblclick — Người dùng nhấp đúp vào phần tử
- onmousedown — Người dùng nhấn nút chuột trên phần tử
- onmouseenter — Con trỏ di chuyển vào phần tử
- onmouseleave — Con trỏ rời khỏi phần tử
- onmousemove — Con trỏ đang di chuyển trong khi ở trên phần tử
- onmouseover — Khi con trỏ được di chuyển vào phần tử hoặc một trong các con của nó
- onmouseout — Người dùng di chuyển con trỏ chuột ra khỏi phần tử hoặc một trong các con của nó
- onmouseup — Người dùng nhả nút chuột khi ở trên phần tử

### Keyboard

- onkeydown — Khi người dùng đang nhấn phím xuống
- onkeypress — Khoảnh khắc người dùng bắt đầu nhấn phím
- onkeyup — Người dùng nhả phím

### Frame

- onabort — Việc tải media bị hủy
- onbeforeunload — Sự kiện xảy ra trước khi tài liệu sắp được dỡ
- onerror — Lỗi xảy ra khi tải file bên ngoài
- onhashchange — Đã có thay đổi ở phần neo (anchor) của URL
- onload — Khi đối tượng đã tải xong
- onpagehide — Người dùng điều hướng rời khỏi trang web
- onpageshow — Khi người dùng điều hướng tới trang web
- onresize — Chế độ xem tài liệu được thay đổi kích thước
- onscroll — Thanh cuộn của phần tử đang được cuộn
- onunload — Sự kiện xảy ra khi trang đã được dỡ

### Form

- onblur — Khi phần tử mất tiêu điểm (focus)
- onchange — Nội dung của phần tử biểu mẫu thay đổi (cho <input>, <select> và <textarea>)
- onfocus — Phần tử nhận tiêu điểm
- onfocusin — Khi phần tử sắp nhận tiêu điểm
- onfocusout — Phần tử sắp mất tiêu điểm
- oninput — Người dùng nhập liệu trên phần tử
- oninvalid — Phần tử không hợp lệ
- onreset — Biểu mẫu được đặt lại
- onsearch — Người dùng viết gì đó trong trường tìm kiếm (cho <input="search">)
- onselect — Người dùng chọn một số văn bản (cho <input> và <textarea>)
- onsubmit — Biểu mẫu được gửi

### Drag

- ondrag — Phần tử đang được kéo
- ondragend — Người dùng đã kéo xong phần tử
- ondragenter — Phần tử đang kéo đi vào mục tiêu thả
- ondragleave — Phần tử đang kéo rời khỏi mục tiêu thả
- ondragover — Phần tử đang kéo ở trên mục tiêu thả
- ondragstart — Người dùng bắt đầu kéo phần tử
- ondrop — Phần tử đang kéo được thả vào mục tiêu thả

### Clipboard

- oncopy — Người dùng sao chép nội dung của phần tử
- oncut — Người dùng cắt nội dung phần tử
- onpaste — Người dùng dán nội dung vào phần tử

### Media

- onabort — Việc tải media bị hủy
- oncanplay — Trình duyệt có thể bắt đầu phát media (ví dụ file đã đệm đủ)
- oncanplaythrough — Trình duyệt có thể phát xuyên suốt media mà không dừng
- ondurationchange — Thời lượng của media thay đổi
- onended — Media đã phát tới cuối
- onerror — Xảy ra khi có lỗi khi tải file bên ngoài
- onloadeddata — Dữ liệu media đã được tải
- onloadedmetadata — Siêu dữ liệu (như kích thước và thời lượng) được tải
- onloadstart — Trình duyệt bắt đầu tìm media chỉ định
- onpause — Media bị tạm dừng bởi người dùng hoặc tự động
- onplay — Media đã được bắt đầu hoặc không còn tạm dừng
- onplaying — Media đang phát sau khi đã tạm dừng hoặc dừng để đệm
- onprogress — Trình duyệt đang trong quá trình tải media
- onratechange — Tốc độ phát của media thay đổi
- onseeked — Người dùng đã hoàn tất di chuyển/nhảy tới vị trí mới trong media
- onseeking — Người dùng bắt đầu di chuyển/nhảy
- onstalled — Trình duyệt đang cố tải media nhưng không có sẵn
- onsuspend — Trình duyệt cố ý không tải media
- ontimeupdate — Vị trí phát đã thay đổi (ví dụ do tua nhanh)
- onvolumechange — Âm lượng media đã thay đổi (bao gồm tắt tiếng)
- onwaiting — Media đã tạm dừng nhưng dự kiến sẽ tiếp tục (ví dụ, đang đệm)

### Animation

- animationend — Hoạt ảnh CSS đã hoàn tất
- animationiteration — Hoạt ảnh CSS được lặp lại
- animationstart — Hoạt ảnh CSS đã bắt đầu

### Other Events

- transitionend — Kích hoạt khi chuyển đổi CSS đã hoàn tất
- onmessage — Tin nhắn được nhận qua nguồn sự kiện
- onoffline — Trình duyệt bắt đầu hoạt động ngoại tuyến
- ononline — Trình duyệt bắt đầu hoạt động trực tuyến
- onpopstate — Khi lịch sử của cửa sổ thay đổi
- onshow — Phần tử <menu> được hiển thị như menu ngữ cảnh
- onstorage — Vùng lưu trữ Web Storage được cập nhật
- ontoggle — Người dùng mở hoặc đóng phần tử <details>
- onwheel — Bánh xe chuột lăn lên hoặc xuống trên phần tử
- ontouchcancel — Chạm màn hình bị gián đoạn
- ontouchend — Ngón tay người dùng được nhấc khỏi màn hình cảm ứng
- ontouchmove — Ngón tay được kéo trên màn hình
- ontouchstart — Ngón tay được đặt lên màn hình cảm ứng

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

<h2 id="errors" align="center">Errors</h2>

Khi làm việc với JavaScript, các lỗi khác nhau có thể xảy ra. Có nhiều cách xử lý chúng:

- try — Cho phép bạn định nghĩa khối mã để kiểm tra lỗi
- catch — Thiết lập khối mã để thực thi trong trường hợp lỗi
- throw — Tạo thông báo lỗi tùy chỉnh thay vì lỗi JavaScript chuẩn
- finally — Cho phép bạn thực thi mã, sau try và catch, bất kể kết quả

Giá trị tên lỗi (Error Name Values)

- JavaScript cũng có đối tượng lỗi có sẵn. Nó có hai thuộc tính:
- name — Đặt hoặc trả về tên lỗi
- message — Đặt hoặc trả về thông báo lỗi dưới dạng chuỗi

Thuộc tính lỗi có thể trả về sáu giá trị khác nhau làm tên của nó:

- EvalError — Đã xảy ra lỗi trong hàm eval()
- RangeError — Số “vượt ngoài phạm vi”
- ReferenceError — Đã xảy ra tham chiếu bất hợp lệ
- SyntaxError — Đã xảy ra lỗi cú pháp
- TypeError — Đã xảy ra lỗi kiểu
- URIError — Đã xảy ra lỗi encodeURI()

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

Ví dụ mã hiển thị kết quả với `console.log()` cho `var`, `let`, và `const`:

```js
// Global scope:
var test1; // Declared, NOT assigned a value: undefined (Ok, not recommended)
test1 = 1; // Assigned a value: 1 (Ok)
test1 = 10; // Reassigned value: 10 (Ok)
var test1 = 1; // Declared with a value: 1 (Ok)
var test1 = 10; // Redeclared and reassigned value: 10 (MAJOR ISSUE!)

let test2; // Declared, NOT assigned a value: undefined (Ok, not recommended)
test2 = 2; // Assigned a value: 2 (Ok)
test2 = 20; // Reassigned value: 20 (Ok)
let test2 = 2; // Uncaught SyntaxError
let test2 = 20; // Uncaught SyntaxError
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>
