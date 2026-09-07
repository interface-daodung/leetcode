# Ví dụ biểu thức chính quy (Regular Expressions)

Cú pháp cơ bản kèm theo các ví dụ nâng cao hơn. Xem [MDN Regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) để biết các trường hợp sử dụng với `exec(str)`, `test(str)`, `match(regexp)`, `matchAll(regexp)`, `replace()`, `replaceAll()`, `search(regexp)`, `split()`, và đối tượng `String`.

<div id="back-to-top"></div>

## Mục lục

1. [Cơ bản](#basics)
1. [Ký tự đại diện và lượng từ](#wildcard-and-quantifiers)
   1. [Khớp với dấu sao](#matches-with-asterisk)
   1. [Số lần khớp cụ thể](#specific-match-count)
1. [Neo (Anchors)](#anchors)
1. [Thoát ký tự](#escaping-symbols)
1. [Lớp ký tự](#character-classes)
   1. [Viết tắt](#shorthand)
1. [Nhóm capture](#capture-groups)
   1. [Nhóm có tên](#named-groups)
   1. [Lookaheads](#lookaheads)
   1. [Lookbehinds](#lookbehinds)
1. [Ví dụ thực tế](#practical-examples)
 	 1. [Khớp và thay thế](#match-and-replace)
 	 1. [Xác thực tên người dùng](#user-name-validation)


## Cơ bản

Dùng dấu gạch chéo (`/`) để bao quanh biểu thức chính quy (RegEx):

```js
/regex/
```

<br />

Khớp chuỗi ký tự theo nghĩa đen:
```js
let myString = "Hello, World!";
let myRegex = /Hello/;
let result = myRegex.test(myString);

let waldoIsHiding = "Somewhere Waldo is hiding in this text.";
let waldoRegex = /Waldo/; 
let result = waldoRegex.test(waldoIsHiding);

let extractStr = "Extract the word 'coding' from this string.";
let codingRegex = /coding/;
let result = extractStr.match(codingRegex);
```

<br />

Dùng ký tự ống (`|`) như điều kiện "hoặc":
```js
let petString = "James has a pet cat.";
let petRegex = /dog|cat|bird|fish/;
let result = petRegex.test(petString);
```

<br />

Cờ (Flags): `i` cho không phân biệt hoa thường, và `g` cho khớp toàn cục hoặc để khớp tất cả lần xuất hiện. Dưới đây là những cờ tốt nhất:
```js
/regex/i // ignore upper or lowercase
/regex/g // to match every occurrence
/regex/m // multiline
/regex/x // ignore whitespace/verbose
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Ký tự đại diện và lượng từ

Dấu chấm là ký tự đại diện `.`. Các lượng từ là: `+`, `?`, `*`, `*?`, `++`, `{#}`, `{#,}`, và `{#,#}` 

> TẠI SAO LỚP KÝ TỰ (`[]`) KHÔNG HOẠT ĐỘNG VỚI `+`?

- `*` = không hoặc nhiều
- `+` = một hoặc nhiều
- `?` = không hoặc một
- `{n}` = đúng "n" lần
- `{n,}` = "n" hoặc nhiều hơn
- `{n,m}` = ít nhất "n" và nhiều nhất "m" lần
- khớp tham lam (greedy) = `*` và `+`
- khớp lười (lazy) = `*?`, `+?`, `??`, `{n}?`, `{n,}?`, và `{n,m}?`

Khớp bất kỳ ký tự nào với dấu chấm đại diện `.`: khớp khi một ký tự xuất hiện một hoặc nhiều lần. Khớp các ký tự xuất hiện một hoặc nhiều lần:
```js
// match anything with the wildcard . e.g. fun, gun, pun, run
/.un/gi

let exampleStr = "Let's have fun with regular expressions!";
let unRegex = /.un/; 
let result = unRegex.test(exampleStr);
```

<br />

Khớp ký tự xuất hiện một hoặc nhiều lần với `+`
```js
// + Matches one or more consecutive characters: a aa aaa aaaa bab baab
/a+/gi 
// match s
let difficultSpelling = "Mississippi";
let myRegex = /s+/g; // this is the solution
let result = difficultSpelling.match(myRegex);
```

<br />

Kiểm tra không hoặc một với `?`
```js
// ? Matches a character or nothing.: ba b a
/ba?/g

let american = "color";
let british = "colour";
let rainbowRegex= /colou?r/;
rainbowRegex.test(american); // true
rainbowRegex.test(british); // true

let favWord = "favorite";
let favRegex = /favou?rite/; 
let result = favRegex.test(favWord);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Khớp với dấu sao

Khớp ký tự xuất hiện không hoặc nhiều lần với `*`: 
```js

// * Matches zero or more consecutive characters: a ba baa aaa ba b
/ba*/g
/Aa*/

let phrase = "ba humbug";
let regexPlus = /bah+/;
let regexStar = /bah*/;
regexPlus.test(phrase); // returns false
regexStar.test(phrase); // returns true

let regexPlus = /wo+w/;
let regexStar = /wo*w/;
regexPlus.test(phrase); // returns true
regexStar.test(phrase); // returns true

let soccerWord = "gooooooooal!";
let gPhrase = "gut feeling";
let oPhrase = "over the moon";
let goRegex = /go*/;
soccerWord.match(goRegex); // ['goooooooo']
gPhrase.match(goRegex); // ['g']
oPhrase.match(goRegex); // null

let chewieQuote = "Aaaaaaaaaaaaaaaarrrgh!";
let chewieRegex = /Aa*/; // Change this line
let result = chewieQuote.match(chewieRegex);
```

<br />

Khớp lười (lazy matching): dùng ký tự `*?`
```js
/t[a-z]*?i/

// lazy quantifier with `*?`
let text = "<h1>Winter is coming</h1>";
let myRegex = /<.*?>/; // it's the answer!
let result = text.match(myRegex);
```

<br />

```js
// possessive quantifer with ++ (WHY?)
/\d++./
123
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Số lần khớp cụ thể

Khớp số lần cụ thể với `{#}`:
```js
let A4 = "haaaah";
let A3 = "haaah";
let A100 = "h" + "a".repeat(100) + "h";
let multipleHA = /ha{3}h/;
multipleHA.test(A4); // false
multipleHA.test(A3); // true
multipleHA.test(A100); // false

let timStr = "Timmmmber";
let timRegex = /Tim{4}ber/; 
let result = timRegex.test(timStr);
```

<br />

Chỉ định số lần khớp tối thiểu với `{#,}` : 
```js
let A4 = "haaaah";
let A2 = "haah";
let A100 = "h" + "a".repeat(100) + "h";
let multipleA = /ha{3,}h/;
multipleA.test(A4); // true
multipleA.test(A2); // false
multipleA.test(A100); // true

let haStr = "Hazzzzah";
let haRegex = /Haz{4,}ah/; 
let result = haRegex.test(haStr);
```

<br />

Chỉ định số lần khớp tối thiểu và tối đa `{#,#}`:
```js
let A4 = "aaaah";
let A2 = "aah";
let multipleA = /a{3,5}h/;
multipleA.test(A4); // true
multipleA.test(A2); // false

let threeAs = "aaa";
let fourAs = "aaaa";
let sevenAs = "aaaaaaa";

let myRegex = /a{2,4}/;
myRegex.test(threeAs); // true
myRegex.test(fourAs); // true
myRegex.test(sevenAs); // true
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Neo (Anchors)

Neo: ký hiệu mũ (`^` hoặc `\A`) cả trong và ngoài lớp ký tự, và ký hiệu đô la (`$` hoặc `\Z`).

Để tạo tập ký tự phủ định, bạn đặt ký tự mũ (^) sau dấu ngoặc mở và trước các ký tự bạn không muốn khớp:
```js
// Anything but/except with the caret symbol INSIDE character set, ^ or \A:
/^This/  // returns 'T'

/[^aeiou]/gi
let quoteSample = "3 blind mice.";
let myRegex = /[^aeiou^0-9]/gi; 
let result = quoteSample.match(myRegex); 
```

<br />

khớp đầu chuỗi bằng ^ hoặc \A BÊN NGOÀI tập ký tự:
```js
let firstString = "Ricky is first and can be found.";
let firstRegex = /^Ricky/;
firstRegex.test(firstString);
let notFirst = "You can't find Ricky now.";
firstRegex.test(notFirst); // true

let rickyAndCal = "Cal and Ricky both like racing.";
let calRegex = /^Cal/; 
let result = calRegex.test(rickyAndCal);
```

<br />

dùng `$` để khớp cuối chuỗi - cái này nếu làm sai???
```js
/end.$/
// match end of string with $ or \Z
/end.$/ // for 'end.' vs 
/[end.]$/ // just returning `.`

let theEnding = "This is a never ending story";
let storyRegex = /story$/;
storyRegex.test(theEnding);
let noEnding = "Sometimes a story will have to end";
storyRegex.test(noEnding); // true

let caboose = "The last car on a train is the caboose";
let lastRegex = /caboose$/; 
let result = lastRegex.test(caboose);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Thoát ký tự

Dùng dấu gạch chéo ngược `\` để thoát các ký tự đặc biệt có trong chuỗi của bạn
```js
// escape thw wildcard as part of your regex
/\./

// escape one or more character +
/\+/

// escape zero or more character *
/\*/

// escape end of string character $
/\$/

// escape star of string or negation character ^
/\^/

// escape zero or one character ?
/\?/

// escape backslash
/\\/

// escape parentheses
/\(\)/

// escape square brackets or character classes
/\[\]/

// escape curly brackets
/\{\}/

// escape single quote
/\'/

// escape double quotes
/\"/

// escape pipe
/\|/

// escape new line
/\n/

// escape TAB
/\t/
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Lớp ký tự

Lớp/tập ký tự với `[]`, ví dụ bag, big, bug

```js
/b[aiu]g/gi

let quoteSample = "I have only proved it correct, but not tried it.";
let vowelRegex = /[aeiou]/gi; 
let result = quoteSample.match(vowelRegex);

let catStr = "cat";
let batStr = "bat";
let matStr = "mat";
let bgRegex = /[a-e]at/;
catStr.match(bgRegex); // ['cat']
batStr.match(bgRegex); // ['bat']
matStr.match(bgRegex); // null

let quoteSample = "The quick brown fox jumps over the lazy dog.";
let alphabetRegex = /[a-z]/gi; 
let result = quoteSample.match(alphabetRegex);
```

<br />

Lớp/tập ký tự với dấu gạch ngang (`-`) cho khoảng

```js
/[a-e]/gi
/[a-z0-9]/ig
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Viết tắt

Bất kỳ chữ số nào và bất kỳ ký tự không phải chữ số nào với `\d` và `\D`:
```js
/\d/g // match all numbers
let movieName = "2001: A Space Odyssey";
let numRegex = /\d/g;
let result = movieName.match(numRegex).length;

/\D/ig // match anything but a number
let movieName = "2001: A Space Odyssey";
let noNumRegex = /\D/g;
let result = movieName.match(noNumRegex).length;
```
<br />

Khớp ký tự từ hoặc ký tự không phải từ với `\w` và `\W`:
```js
/\w/ig // shorthand for [A-Za-z0-9_]

let longHand = /[A-Za-z0-9_]+/;
let shortHand = /\w+/;
let numbers = "42";
let varNames = "important_var";
longHand.test(numbers); // true
shortHand.test(numbers); // true
longHand.test(varNames); // true
shortHand.test(varNames); // true

let quoteSample = "The five boxing wizards jump quickly.";
let alphabetRegexV2 = /\w/g; 
let result = quoteSample.match(alphabetRegexV2).length;

/\W/g // shorthand for [^A-Za-z0-9_]
let shortHand = /\W/;
let numbers = "42%";
let sentence = "Coding!";
numbers.match(shortHand); // ['%']
sentence.match(shortHand); // ['!']

let quoteSample = "The five boxing wizards jump quickly.";
let nonAlphabetRegex = /\W/g;
let result = quoteSample.match(nonAlphabetRegex).length;
```

<br />

Khớp khoảng trắng và không phải khoảng trắng với `\w` và `\W`::
```js
let whiteSpace = "Whitespace. Whitespace everywhere!"
let spaceRegex = /\s/g;
whiteSpace.match(spaceRegex); // [" ", " "]

let sample = "Whitespace is important in separating words";
let countWhiteSpace = /\s\w*/;
let result = sample.match(countWhiteSpace);

let whiteSpace = "Whitespace. Whitespace everywhere!"
let nonSpaceRegex = /\S/g;
whiteSpace.match(nonSpaceRegex).length; // 32

let sample = "Whitespace is important in separating words";
let countNonWhiteSpace = /\S/g; 
let result = sample.match(countNonWhiteSpace); 

// Remove Whitespace from Start and End with, you could also use str.trim()
let hello = "   Hello, World!  ";
let wsRegex = /^\s+|\s+$/g; 
let result = hello.replace(wsRegex, "");
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Nhóm capture

Đôi khi chúng ta muốn kiểm tra nhóm ký tự bằng biểu thức chính quy và để làm điều đó chúng ta dùng dấu ngoặc đơn `()`.

```js
// find either Penguin or Pumpkin in a string
let testStr = "Pumpkin";
let testRegex = /P(engu|umpk)in/;
testRegex.test(testStr); // true

// check for the names of Franklin Roosevelt or Eleanor Roosevelt in a case sensitive manner
let myString = "Eleanor Roosevelt";
let myRegex = /(Franklin|Eleanor).*Roosevelt/;
let result = myRegex.test(myString);
```

<br />

Sử dụng lại mẫu bằng nhóm capture: 
```js
let repeatRegex = /(\w+) \1 \1/;
repeatRegex.test(repeatStr); // Returns true
repeatStr.match(repeatRegex); // Returns ["row row row", "row"]

// match a string that consists of only the same number repeated exactly three times separated by single spaces
let repeatNum = "42 42 42";
let reRegex = /^(\d+)\s\1\s\1$/;
let result = reRegex.test(repeatNum);
```

<br />

Dùng nhóm capture để tìm kiếm và thay thế:
```js
let wrongText = "The sky is silver.";
let silverRegex = /silver/;
wrongText.replace(silverRegex, "blue"); // "The sky is blue."
```

<br />

truy cập nhóm capture trong chuỗi thay thế bằng dấu đô la `($)`:
```js
"Code Camp".replace(/(\w+)\s(\w+)/, '$2 $1'); // returns "Code Camp"

// three capture groups that will search for each word in the string one two three then replace them 
let str = "one two three";
let fixRegex = /(\w+)\s(\w+)\s(\w+)/; 
let replaceText = "$3 $2 $1"; //
let result = str.replace(fixRegex, replaceText);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Nhóm có tên

```js
// syntax
/(?<name>...)/

// alternate notation
(?'name'...) // or 
(?P<name>...)

// example
/(?<name>Sally)/
Call me Sally.
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Lookaheads

Lookahead dương được dùng như `(?=...)` trong đó ... là phần bắt buộc nhưng không được khớp.

Lookahead âm được dùng như `(?!...)` trong đó ... là mẫu bạn không muốn xuất hiện.

```js
// positive lookahead syntax:
(?=...)
/foo(?=bar)/
let string = "foobar foobaz" // matches both

// negative lookahead syntax:
(?!...)
/foo(?!bar)/
let string = "foobar foobaz" // matches 2nd 'foo'

let quit = "qu";
let noquit = "qt";
let quRegex= /q(?=u)/;
let qRegex = /q(?!u)/;
quit.match(quRegex); // ['q']
noquit.match(qRegex); // ['q']

// check two or more patterns in one string: a simple password 
// checker that looks for between 3 and 6 characters and at least one number
let password = "abc123";
let checkPass = /(?=\w{3,6})(?=\D*\d)/;
checkPass.test(password);

// Use lookaheads in the pwRegex to match passwords that are greater than 5 characters long, 
// and have two consecutive digits:
let sampleWord = "astronaut";
let pwRegex = /(?=\w{6})(?=\w*\d{2})/;
let result = pwRegex.test(sampleWord);
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Lookbehinds

```js
// syntax
(?(?<=...)yes|no)

// positive lookbehind syntax:
(?<=...)
/(?<=foo)bar/ 
let string = "foobar fuubar"; // matches 'bar'

// NEGATIVE lookbehind syntax:
(?<!...)
/(?<!not )foo/
let string = "not foo but foo" // matches 2nd 'foo'
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

## Ví dụ thực tế

1. Khớp và thay thế
1. Xác thực
1. thứ khác 

### Khớp và thay thế

Sắp xếp lại và định dạng lại đối tượng thú cưng từ loài, họ, tên:
```js
const pets = [
  "cat: Smith, Meowsalot",
  "young dog: Jones, Barksalot",
  "rabbit: Doe, Fluffy"
];

const petPattern = /([a-z\s]+):\s([a-z]+),\s([a-z]+)/i;

const petsUpdated = pets.map(pet => pet.replace(petPattern, '$3 $2 <span class="description">$1</span>'));
```
Ra đầu ra HTML gồm tên, họ, loài:

- Meowsalot Smith cat
- Barksalot Jones young dog
- Fluffy Doe rabbit

Công dụng: tập ký tự, `\s`, `+`, phương thức `.replace()` với nhóm capture `$3`, `$2`, `$1`

- - - 

<br />

Định dạng số điện thoại thành định dạng ưa thích. Ví dụ:
```
12345678920
123-456-7890
321.321.4321
555 555 5555
1 555 555 5555
(555) 123 1234
555 555-5555
1.987.654.3210
```

<br />

Tìm và thay thế số điện thoại:

```js
const phonePattern = /1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g;

let results = input.match(phonePattern); // input = source text with phone #'s
if (!results) results = [];

const resultsUniform = results.map(x => x.replace(phonePattern, '($1) $2-$3'));
```

Tìm và thay thế thực thể HTML phổ biến (<, >, ', ", &) bằng hàm

```js
function replaceEntity(str) {
const entityPattern = /[&<>"']/g;
let  replacements = {
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&apos;"
  }
  return str.replace(entityPattern, match => replacements[match]);
}

replaceEntity(`<?php the_post_thumbnail() ?>`)
console.log(replaceEntity(`<?php the_post_thumbnail() ?>`))
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>

### Xác thực tên người dùng

Tạo biểu thức chính quy ở đây thực hiện như sau:

1. Chỉ có thể chứa chữ cái và 26 chữ cái trong bảng chữ cái
2. Phải bắt đầu bằng chữ cái, không phải số
3. Phải dài ít nhất 8 ký tự, và không quá 30 ký tự

```js
const usernamePattern = /^[a-z][a-z0-9]{7,29}$/i

  if (usernamePattern.test(userInput)) {
    showSuccess()
  } else {
    showError()
  }
}
```

<br /> 

Tên người dùng 2:

1. Tên người dùng chỉ có thể dùng ký tự chữ và số.
1. Các số duy nhất trong tên người dùng phải ở cuối. Có thể có không hoặc nhiều số ở cuối. Tên người dùng không thể bắt đầu bằng số.
1. Chữ cái trong tên người dùng có thể là thường và hoa.
1. Tên người dùng phải dài ít nhất hai ký tự. Tên người dùng hai ký tự chỉ có thể dùng chữ cái làm ký tự.

```js
let username = "SomeUserName12";
let userCheck = /^[a-z][a-z]+\d*$|^[a-z]\d\d+$/i;
let result = userCheck.test(username);
// RegEx 2:
let userCheck2 = /^[a-z]([0-9]{2,}|[a-z]+\d*)$/i;
```

<div align="right">&#8673; <a href="#back-to-top" title="Table of Contents">Lên đầu trang</a></div>
