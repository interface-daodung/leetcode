# Ví dụ thực tế

CÔNG VIỆC ĐANG TIẾN HÀNH - ĐÂY SẼ LÀ FILE CUỐI CÙNG TÔI CẬP NHẬT!

1. Thông tin liên hệ khách hàng/cuustomer và dữ liệu liên quan khác được lưu dưới dạng đối tượng
1. Bản ghi kho hàng và chuỗi cung ứng trong đối tượng và mảng
1. Ví dụ về đăng ký email hoặc khu vực hồ sơ người dùng với lời chào, tin nhắn được cá nhân hóa, v.v.
1. Ví dụ về sở thích và thú vui cá nhân như bộ sưu tập CD/bài hát, vật tư cần thiết cho hội họa, các bước thực hiện tác vụ phức tạp, bảng lý thuyết âm nhạc, v.v.

Hãy nghĩ về 1) ứng dụng doanh nghiệp (nhỏ) thực tế, 2) sở thích phổ biến của mọi người, 2a) NGHỆ THUẬT: một ứng dụng nghệ thuật (ứng dụng đặt tên hợp âm guitar, kiểm tra ngữ pháp cho người viết, v.v.), 2b) KHOA HỌC NGHIỆP DƯ: ứng dụng thiên văn, ứng dụng thực vật học, ứng dụng khảo cổ học, ứng dụng địa chất học

1. `push()` với `shift()`
   - xem xét bản ghi kho hàng nơi một mục gần đây (ngày mới nhất) được push vào cuối mảng kho hàng cho một sản phẩm, trong khi mục cũ nhất bị xóa khỏi mảng.
   - mục bị xóa có thể là từ một đợt bán hàng (mục cũ nhất được bán trước), hoặc vật liệu hết hạn (quá hạn sử dụng), hoặc mục cũ nhất được dùng làm mục trưng bày.
1. push(): sau khi tạo mảng rỗng, push các giá trị đầu vào của người dùng để sử dụng sau
1. includes(): boolean, tôi dùng !arr.includes() để chỉ push các giá trị duy nhất vào mảng rỗng
1. đối tượng: `class`, `new`, `prototype`, `hasOwnProperty`
   - cập nhật danh sách khách hàng - cho dịch vụ thú cưng của tôi, hoặc một công ty lớn với hồ sơ khách hàng/client đồ sộ.
   - Phải cập nhật địa chỉ hoặc thông tin liên hệ khác trong đối tượng khách hàng/client
   - tìm kiếm khách hàng lâu nhất, hoặc khách hàng/client chịu trách nhiệm (respo0nsible) cho doanh thu lớn nhất, sau đó tặng họ ưu đãi đặc biệt, giảm giá, sản phẩm/dịch vụ miễn phí, bảng câu hỏi, v.v.
1. kiểm tra bản ghi đối tượng, `hasOwnProperty`?
   - đăng ký vs đăng nhập
1. `switch()`
   - Cho hướng gió theo độ và một dải độ được đặt cho các hướng chính khác nhau (từ một nguồn nào đó: B, ĐB, ĐBĐ, v.v.), xuất ra hướng chính cùng với tốc độ gió
   - cho một ngày, trả về thứ trong tuần
1. if, if else, if else if:
   - nếu người dùng đã đăng nhập, hiển thị tùy chọn người dùng, nếu không hiển thị nút đăng nhập và đăng ký
   - nếu không tìm thấy id người dùng, hiển thị nút đăng ký VÀ liên kết để gửi tên người dùng đến email tài khoản nếu người dùng tin rằng họ đã đăng ký
   - nếu id người dùng đúng VÀ mật khẩu sai, hiển thị liên kết đặt lại mật khẩu
   - nếu không phải thành viên, hiển thị
1. nối chuỗi với + vs += - tại sao?
   - Trang lời chào hoặc đăng ký email: "Xin chào " + ${username} + ", bạn có " + ${userMsgs} + " tin nhắn mới." Hoặc: ${username} + ", chúng tôi có ưu đãi đặc biệt dành cho bạn!"
   - cho tin nhắn mới bạn sẽ dùng `usermsgs += usermsgs`
1. khi nào truyền đối số vào hàm
1. khi nào dùng tham số rest và toán tử spread
1. split(/regex/): để trả về một mảng các từ từ một chuỗi đầu vào - dùng cho ứng dụng WriterAssist của tôi, dùng cho ứng dụng kết quả tìm kiếm,
1. kiểm tra email được định dạng đúng với
   - RegEx và match() mặc dù có các gói NPM cho việc này
1. số học
   - Nhân: itemPrice * itemQty = tổng tiền cho mục
   - Cộng: item1Total + item2Total + ... = tổng giá trị đơn hàng
   - Trừ: số tiền hoàn lại
   - Chia: số bài đăng mỗi ngày, thời gian đọc trung bình tính bằng phút = (tổng số từ) / (số từ đọc được mỗi phút), thời gian lái xe ước tính = (tổng số dặm) / (tốc độ trung bình)
1. reduce(): tính tổng tất cả các phần tử trong mảng, cách tiếp cận tốt hơn để tính tổng giá trị đơn hàng - thực ra, dùng reduce cho tất cả các phép trên thay vì +
1. includes(): câu lệnh if trong WriterAssist để tìm kiếm dấu câu kết thúc nhằm viết hoa từ hoặc chữ cái theo sau, dùng với chatAt()
1. charAt(): làm gì đó
1. classList.contains:

Ý tưởng khác:
- Nhiếp ảnh: tốc độ màn trập > khẩu độ > iso / mối quan hệ độ nhạy
- Guitar / lý thuyết âm nhạc - ứng dụng đặt tên hợp âm (chrod namer app)
- Bushcraft: định hướng (orienterring)?
- Thực vật học (Botany)?
- Thiên văn học (Astronomy)?
- Lập trình: nếu bạn không thể tìm ra, hãy chuyển sang nghĩ x, y, hoặc z
-

## Practical 2

Cân nhắc tạo một file ES6 hoặc các ví dụ khác cho promises, async/await, fetch, local storage, v.v.

FCC 28. tạo một javascript promise, 29. hoàn thành một promise với resolve & reject, 30. xử lý một promise đã hoàn thành với then, 31. xử lý một promise bị từ chối với catch:

```js
var p = new Promise(function(resolve, reject) {
	// Do an async task async task and then...
	if(good_condition) {
		resolve('Success!');
	}
	else {
		reject('Failure!');
	}
});

p.then(function() {
	/* do something with the result */
}).catch(function() {
	/* error */
})


// Complete example
var promiseCount = 0;

function testPromise() {
  var thisPromiseCount = ++promiseCount;
  console.log(thisPromiseCount + ': Started - Sync code started');

  var p1 = new Promise(function(resolve, reject) {
    console.log(thisPromiseCount + ': Promise started - Async code started');
    // This is only an example to create asynchronism
    window.setTimeout(
      function() {
        resolve(thisPromiseCount);
      }, Math.random() * 2000 + 1000);
  });

  p1.then(function(val) {
    console.log(val + ': Promise fulfilled - Async code terminated');
  }).catch(function(reason) {
    console.log('Handle rejected promise ('+reason+') here.');
  });

  console.log(thisPromiseCount + ': Promise made - Sync code terminated');
}

testPromise();
testPromise();
testPromise();
```