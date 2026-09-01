# KHÁI NIỆM CHÍNH

### JSX

Giới thiệu JSX: https://reactjs.org/docs/introducing-jsx.html

Bạn có thể đặt bất kỳ biểu thức JavaScript hợp lệ nào bên trong dấu ngoặc nhọn { } trong JSX: `{ ternary }`, `{ FxName(param) }`, `{ obj.prop; }`

Bạn có thể dùng dấu ngoặc kép để chỉ định chuỗi ký tự (string literal) làm thuộc tính:

```jsx
const element = <a href="https://www.reactjs.org"> React </a>;
```

Dùng dấu ngoặc nhọn để nhúng biểu thức JavaScript vào thuộc tính:

```jsx
const element = <img src={user.avatarUrl}></img>;
```

JSX Ngăn Chặn Tấn Công Tiêm Mã (Injection Attacks): Việc nhúng dữ liệu người dùng vào JSX là an toàn:

```jsx
const title = response.potentiallyMaliciousInput;
// This is safe:
const element = <h1>{title}</h1>;
```

## Render phần tử

Link: https://reactjs.org/docs/rendering-elements.html

Phần tử (element) là khối xây dựng nhỏ nhất của ứng dụng React. Một phần tử mô tả những gì bạn muốn thấy trên màn hình:

```jsx
const element = <h1>Hire me!</h1>;
```

## Component và props

Link: https://reactjs.org/docs/components-and-props.html

Component cho phép bạn chia giao diện thành các phần độc lập, có thể tái sử dụng. Về mặt khái niệm, component giống như hàm JavaScript. Chúng nhận đầu vào tùy ý (gọi là `props`) và trả về các phần tử React mô tả những gì sẽ xuất hiện trên màn hình.

Cách đơn giản nhất để định nghĩa component là viết một hàm JavaScript (function component):

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

Bạn cũng có thể dùng lớp ES6 để định nghĩa component: (bỏ qua)

Phần tử cũng có thể đại diện cho component do người dùng định nghĩa:

```jsx
const element = <Welcome name="Jim" />;
```

Khi React thấy một phần tử đại diện cho component do người dùng định nghĩa, nó truyền các thuộc tính JSX và children cho component này dưới dạng một đối tượng duy nhất. Chúng ta gọi đối tượng này là `props`

```jsx
<div id="root"></div>;

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Jim" />;
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(element);
```

Tóm tắt phần trên:

1. Chúng ta gọi `root.render()` với phần tử `<Welcome name="Jim" />`.
1. React gọi component Welcome với `{name: 'Jim'}` làm props.
1. Component Welcome của chúng ta trả về phần tử `<h1>Hello, Jim</h1>` làm kết quả.
1. React DOM cập nhật DOM một cách hiệu quả để khớp với `<h1>Hello, Jim</h1>`.

**Lưu ý**: Luôn bắt đầu tên component bằng chữ hoa. React coi các component bắt đầu bằng chữ thường là thẻ DOM.

### Trích xuất Component

Chia component thành các component nhỏ hơn:

```jsx
function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <img className="Avatar" src={props.author.avatarUrl} alt={props.author.name} />
        <div className="UserInfo-name">{props.author.name}</div>
      </div>
      <div className="Comment-text">{props.text}</div>
      <div className="Comment-date">{formatDate(props.date)}</div>
    </div>
  );
}
// Better:
function Comment(props) {
  return (
    <div className="Comment">
      <UserInfo user={props.author} />
      <div className="Comment-text">{props.text}</div>
      <div className="Comment-date">{formatDate(props.date)}</div>
    </div>
  );
}
```

Nó nhận `author` (một đối tượng), `text` (một chuỗi), và `date` (một ngày) làm props, và mô tả một bình luận trên trang mạng xã hội. Component này có thể khó thay đổi vì tất cả sự lồng nhau, và cũng khó tái sử dụng từng phần riêng lẻ. Hãy trích xuất một vài component từ nó.

Một quy tắc hay là nếu một phần giao diện của bạn được dùng nhiều lần (`Button`, `Panel`, `Avatar`), hoặc đủ phức tạp để đứng riêng (`App`, `FeedStory`, `Comment`), thì nó là ứng viên tốt để trích xuất thành component riêng.

### Props là chỉ đọc (Read-Only)

Một component không bao giờ được sửa đổi props của chính nó. **Tất cả component React phải hoạt động như hàm thuần túy đối với props của chúng.**

## State và Vòng đời

Link: https://reactjs.org/docs/state-and-lifecycle.html

## Xử lý sự kiện

Link: https://reactjs.org/docs/handling-events.html

Xử lý sự kiện với phần tử React rất giống với xử lý sự kiện trên phần tử DOM. Có một số khác biệt về cú pháp:

- Sự kiện React được đặt tên bằng camelCase, thay vì chữ thường.
- Với JSX bạn truyền một hàm làm trình xử lý sự kiện, thay vì một chuỗi.

```jsx
// this:
<button onclick="activateLasers()">Activate Lasers</button>

// vs this
<button onClick={activateLasers}>Activate Lasers</button>
```

Một khác biệt nữa là bạn không thể trả về false để ngăn hành vi mặc định trong React. Bạn phải gọi preventDefault một cách rõ ràng:

```jsx
function Form() {
  function handleSubmit(e) {
    e.preventDefault();
    console.log("You clicked submit.");
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Submit</button>
    </form>
  );
}
```

Khi dùng React, bạn thường không cần gọi `addEventListener` để thêm trình lắng nghe cho phần tử DOM sau khi nó được tạo. Thay vào đó, chỉ cần cung cấp một trình lắng nghe khi phần tử được render lần đầu.

## Render có điều kiện

Link: https://reactjs.org/docs/conditional-rendering.html

Trong React, bạn có thể tạo các component riêng biệt bao bọc hành vi bạn cần. Sau đó, bạn chỉ có thể render một số trong chúng, tùy thuộc vào trạng thái của ứng dụng.

Render có điều kiện trong React hoạt động giống như cách điều kiện hoạt động trong JavaScript. Dùng các toán tử JavaScript như if hoặc toán tử điều kiện để tạo các phần tử đại diện cho trạng thái hiện tại, và để React cập nhật giao diện cho phù hợp:

```jsx
function UserGreeting(props) {
  return <h1>Welcome back!</h1>;
}

function GuestGreeting(props) {
  return <h1>Please sign up.</h1>;
}

// Conditional
function Greeting(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn) {
    return <UserGreeting />;
  }
  return <GuestGreeting />;
}

ReactDOM.render(
  // Try changing to isLoggedIn={true}:
  <Greeting isLoggedIn={false} />,
  document.getElementById("root")
);
```

## Danh sách và Khóa (Lists and Keys)

Link: https://reactjs.org/docs/lists-and-keys.html

Cách bạn biến đổi danh sách trong JavaScript: Với đoạn mã dưới đây, chúng ta dùng hàm `map()` để lấy một mảng _số_ và nhân đôi giá trị của chúng. Chúng ta gán mảng mới được trả về bởi `map()` cho biến _doubled_ và ghi log nó:

```jsx
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(number => number * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
```

Trong React, việc biến đổi mảng thành danh sách phần tử gần như giống hệt. Bạn có thể xây dựng tập hợp các phần tử và đưa chúng vào JSX bằng dấu ngoặc nhọn {}. Dưới đây, chúng ta duyệt qua mảng numbers bằng hàm JavaScript map(). Chúng ta trả về phần tử <li> cho mỗi mục. Cuối cùng, chúng ta gán mảng phần tử kết quả cho listItems:

```jsx
<div id="root"></div>;
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map(number => <li>{number}</li>);
ReactDOM.render(<ul>{listItems}</ul>, document.getElementById("root"));
```

Cài đặt Codepen cho phiên bản của họ

- Bộ tiền xử lý JavaScript: Babel
- Thêm Script/Pens bên ngoài: https://unpkg.com/react/umd/react.development.js và https://unpkg.com/react-dom/umd/react-dom.development.js

### Component Danh sách cơ bản

Thông thường bạn sẽ render danh sách bên trong một component. Chúng ta có thể tái cấu trúc ví dụ trước thành một component nhận một mảng số và xuất ra danh sách các phần tử.

```jsx
function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map(number => <li key={number.toString()}>{number}</li>);
  return <ul>{listItems}</ul>;
}

const numbers = [1, 2, 3, 4, 5];
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NumberList numbers={numbers} />);
```

`key` là một thuộc tính chuỗi đặc biệt bạn cần đưa vào khi tạo danh sách phần tử.

### Khóa (Keys)

Khóa giúp React xác định mục nào đã thay đổi, được thêm vào, hoặc bị xóa. Khóa nên được gán cho các phần tử bên trong mảng để tạo định danh ổn định cho phần tử:

```jsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map(number => <li key={number.toString()}>{number}</li>);
```

Cách tốt nhất để chọn khóa là dùng một chuỗi định danh duy nhất cho một mục trong danh sách so với các anh chị em của nó. Thông thường bạn sẽ dùng ID từ dữ liệu làm khóa:

```js
const todoItems = todos.map(todo => <li key={todo.id}>{todo.text}</li>);
```

Khi bạn không có ID ổn định cho các mục được render, bạn có thể dùng chỉ số của mục làm khóa như giải pháp cuối cùng:

```jsx
const todoItems = todos.map((todo, index) => <li key={index}>{todo.text}</li>);
```

Chúng tôi không khuyến nghị dùng chỉ số làm khóa nếu thứ tự các mục có thể thay đổi. Điều này có thể ảnh hưởng tiêu cực đến hiệu năng và có thể gây ra vấn đề với trạng thái component.

### Trích xuất Component với Khóa

Khóa chỉ có ý nghĩa trong ngữ cảnh của mảng bao quanh. Ví dụ, nếu bạn trích xuất component ListItem, bạn nên giữ khóa trên các phần tử `<ListItem />` trong mảng thay vì trên phần tử `<li>` trong chính `ListItem`.

```jsx
function ListItem(props) {
  // There is no need to specify the key here:
  return <li>{props.value}</li>;
}

function NumberList(props) {
  const numbers = props.numbers;
  const listItems = numbers.map(number => (
    // Key should be specified inside the array.
    <ListItem key={number.toString()} value={number} />
  ));
  return <ul>{listItems}</ul>;
}
```

Khóa được dùng trong mảng phải là duy nhất so với các anh chị em của chúng. Tuy nhiên, chúng không cần phải duy nhất trên toàn cục. Chúng ta có thể dùng cùng một khóa khi tạo hai mảng khác nhau.

## Biểu mẫu (Forms)

Link: https://reactjs.org/docs/forms.html

Phần tử biểu mẫu HTML hoạt động hơi khác so với các phần tử DOM khác trong React, vì phần tử biểu mẫu vốn giữ một số trạng thái nội tại.

### Component được kiểm soát (Controlled Components)

Các phần tử biểu mẫu như `<input>`, `<textarea>`, và `<select>` thường duy trì trạng thái riêng và cập nhật nó dựa trên đầu vào của người dùng. Trong React, trạng thái có thể thay đổi thường được giữ trong thuộc tính state của component, và chỉ cập nhật bằng `setState()`.

LƯU Ý: Đây là một ví dụ khác dẫn tới lớp (class) - BỎ QUA!

...component React render biểu mẫu cũng kiểm soát những gì xảy ra trong biểu mẫu đó ở các lần nhập liệu tiếp theo của người dùng. Một phần tử biểu mẫu input có giá trị được kiểm soát bởi React theo cách này được gọi là _controlled component_.

Ghi chú về `input`, `textarea`, `select`, và `input type="file"`.

### Xử lý nhiều đầu vào

Khi bạn cần xử lý nhiều phần tử `input` được kiểm soát, bạn có thể thêm thuộc tính `name` cho mỗi phần tử và để hàm xử lý quyết định phải làm gì dựa trên giá trị của `event.target.name`.

## Nâng State lên (Lifting State Up)

Link: https://reactjs.org/docs/lifting-state-up.html

Thường thì, nhiều component cần phản ánh cùng một dữ liệu thay đổi. Chúng tôi khuyến nghị nâng state chung lên tổ tiên chung gần nhất của chúng. [ĐỌC SAU]

## Composition vs Inheritance

Link: https://reactjs.org/docs/composition-vs-inheritance.html [ĐỌC SAU]

## Tư duy trong React (Thinking in React)

Link: https://reactjs.org/docs/thinking-in-react.html

- Bước 1: Chia giao diện thành hệ phân cấp Component
- Bước 2: Xây dựng phiên bản tĩnh trong React
- Bước 3: Xác định biểu diễn tối thiểu (nhưng đầy đủ) của State giao diện
- Bước 4: Xác định State nên nằm ở đâu
- Bước 5: Thêm luồng dữ liệu ngược

# HƯỚNG DẪN NÂNG CAO

## Khả năng truy cập (Accessibility)

Link: https://reactjs.org/docs/accessibility.html

## Chia nhỏ mã (Code Splitting)

Link: https://reactjs.org/docs/code-splitting.html

## Context

Link: https://reactjs.org/docs/context.html

## Ranh giới lỗi (Error Boundaries)

Link: https://reactjs.org/docs/error-boundaries.html

## Chuyển tiếp Refs (Forwarding Refs)

Link: https://reactjs.org/docs/forwarding-refs.html

## Fragments

Link: https://reactjs.org/docs/fragments.html

## Higher-Order Components

Link: https://reactjs.org/docs/higher-order-components.html

15 phần nữa: Tích hợp với thư viện khác, JSX Chuyên sâu (xem bên dưới), Tối ưu hiệu năng, Portals, Profiler API, React Không dùng ES6, React Không dùng JSX, Reconciliation, Refs và DOM, Render Props (xem bên dưới), Kiểm tra kiểu tĩnh, Strict Mode, Kiểm tra kiểu với PropTypes (xem bên dưới), Uncontrolled Components, và Web Components.

## JSX Chuyên sâu (JSX In Depth)

Link: https://reactjs.org/docs/jsx-in-depth.html

`React.createElement(component, props, ...children)`

```JSX
// This:
<MyButton color="blue" shadowSize={2}>
  Click Me
</MyButton>
// Compiles into:
React.createElement(
  MyButton,
  {color: 'blue', shadowSize: 2},
  'Click Me'
)

// And this:
<div className="sidebar" />
// Compiles into:
React.createElement(
  'div',
  {className: 'sidebar'}
)
```

### Chỉ định kiểu phần tử React

Phần đầu tiên của thẻ JSX quyết định kiểu của phần tử React. Kiểu viết hoa cho biết thẻ JSX đang tham chiếu tới một React component.

Vì JSX được biên dịch thành các lời gọi tới `React.createElement`, thư viện **React** cũng phải luôn nằm trong phạm vi từ mã JSX của bạn. Ví dụ, cả hai import đều cần thiết trong đoạn mã này, mặc dù `React` và `CustomButton` không được tham chiếu trực tiếp từ JavaScript:

```jsx
import React from "react";
import CustomButton from "./CustomButton";

function WarningButton() {
  // return React.createElement(CustomButton, {color: 'red'}, null);
  return <CustomButton color="red" />;
}
```

Nếu bạn không dùng bộ đóng gói JavaScript (bundler) và đã tải React từ thẻ `<script>`, nó đã nằm trong phạm vi toàn cục React.

- Dùng Dot Notation cho kiểu JSX: nếu bạn có một module duy nhất xuất nhiều React component

### Component do người dùng định nghĩa phải viết hoa

Khi kiểu phần tử bắt đầu bằng chữ thường, nó tham chiếu tới component có sẵn như `<div>` hoặc `<span>` và tạo ra chuỗi 'div' hoặc 'span' được truyền tới React.createElement. Kiểu bắt đầu bằng chữ hoa như `<Foo />` biên dịch thành `React.createElement(Foo)` và tương ứng với component được định nghĩa hoặc import trong file JavaScript của bạn.

Bạn không thể dùng biểu thức chung làm kiểu phần tử React. Nếu bạn muốn dùng biểu thức chung để chỉ ra kiểu phần tử, chỉ cần gán nó cho biến viết hoa trước. Điều này thường xảy ra khi bạn muốn render component khác nhau dựa trên prop:

```jsx
import React from "react";
import { PhotoStory, VideoStory } from "./stories";

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}
```

### Props trong JSX

Có nhiều cách khác nhau để chỉ định props trong JSX.

#### Biểu thức JavaScript làm Props

Bạn có thể truyền bất kỳ biểu thức JavaScript nào làm prop, bằng cách bao quanh nó bằng {}. Ví dụ, trong JSX này: `<MyComponent foo={1 + 2 + 3 + 4} />`

Câu lệnh `if` và vòng lặp `for` không phải là biểu thức trong JavaScript, vì vậy chúng không thể dùng trực tiếp trong JSX.

**Chuỗi ký tự (String Literals)**: Bạn có thể truyền chuỗi ký tự làm prop

### Thuộc tính Spread (Spread Attributes)

dừng tại đây https://reactjs.org/docs/jsx-in-depth.html#spread-attributes

## Render Props

Link: https://reactjs.org/docs/render-props.html

## Kiểm tra kiểu với PropTypes (Typechecking With PropTypes)

Link: https://reactjs.org/docs/typechecking-with-proptypes.html

# THAM CHIẾU API

Link: https://reactjs.org/docs/react-api.html

## React Component

Link: https://reactjs.org/docs/react-component.html

# HOOKS

Link:

# TESTING

Link:
