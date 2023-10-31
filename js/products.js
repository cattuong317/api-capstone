import { kiemTraRong } from "./validate.js";
var dssp = [];

var selectedId = null;

function renderProductionList(productArr) {
  dssp.length = 0;

  var contentHTML = "";
  for (var i = 0; i < productArr.length; i++) {
    var product = productArr[i];
    dssp.push(product);
    var trString = `<tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.image}</td>
            <td>${product.type}</td>
            <td>${product.quality}</td>
            <td>
                <button onclick="deleteProduct(${product.id})" class="btn btn-warning  ">Delete</button>
                <button onclick="editProduct(${product.id})" class="btn btn-danger">Edit</button>
            </td>
        </tr>`;
    contentHTML += trString;
  }
  document.getElementById("tblDanhSachSP").innerHTML = contentHTML;
}

var nextProductId = 1;
let originalProductList = [];

axios({
  url: "https://65118cdc829fa0248e4053c5.mockapi.io/product",
  method: "GET",
})
  .then((res) => {
    renderProductionList(res.data);

    let maxId = 0;
    res.data.forEach((product) => {
      const productId = parseInt(product.id);
      if (!isNaN(productId) && productId > maxId) {
        maxId = productId;
      }
    });

    originalProductList = res.data;

    // Cập nhật nextProductId thành giá trị lớn nhất tìm được + 1
    nextProductId = maxId + 1;
  })
  .catch((err) => {
    console.log(err);
  });

// gọi api lấy danh sách sản phẩm đang có từ sever
axios({
  url: "https://65118cdc829fa0248e4053c5.mockapi.io/product",
  method: "GET",
})
  .then((res) => {
    //api trả về thành công
    renderProductionList(res.data);

    // Tìm giá trị ID lớn nhất trong danh sách đã có
    let maxId = 0;
    res.data.forEach((product) => {
      const productId = parseInt(product.id);
      if (!isNaN(productId) && productId > maxId) {
        maxId = productId;
      }
    });

    // Cập nhật nextProductId thành giá trị lớn nhất tìm được + 1
    nextProductId = maxId + 1;
  })
  .catch((err) => {
    console.log(err);
  });

function deleteProduct(id) {
  axios({
    url: `https://65118cdc829fa0248e4053c5.mockapi.io/product/${id}`,
    method: "DELETE",
  })
    .then(function (res) {
      console.log("😊 ~ res: xóa thành công", res);
      fetchFoodList();
      //  gọi lại api lấy danh sách mới nhất từ sever sau khi xóa thành công
    })
    .catch(function (res) {
      console.log("xóa thất bại");
    });
}

window.deleteProduct = deleteProduct;

async function addProduct() {
  try {
    var newProduct = getDataForm();

    // Tạo ID cho sản phẩm mới và cập nhật các trường khác
    newProduct.id = nextProductId.toString(); // Tạo ID cho sản phẩm mới
    newProduct.screen = ""; // Thêm trường screen (mục này cần được cập nhật với giá trị thích hợp)

    //validate new product
    var isValid =
      kiemTraRong(newProduct.name, "TenSP") &&
      kiemTraRong(newProduct.img, "HinhSP") &&
      kiemTraRong(newProduct.price, "GiaSP") &&
      kiemTraRong(newProduct.type, "LoaiSP");
    kiemTraRong(newProduct.quality, "soLuongSP");

    if (!isValid) {
      alert("Vui lòng nhập đầy đủ thông tin");

      return;
    }

    // Thực hiện thêm sản phẩm mới vào danh sách
    dssp.push(newProduct);

    // Sắp xếp lại danh sách sản phẩm theo id
    dssp.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const response = await axios.post(
      "https://65118cdc829fa0248e4053c5.mockapi.io/product",
      newProduct
    );
    console.log("Thêm thành công", response);

    fetchFoodList(); // Gọi hàm để tải danh sách sản phẩm lại sau khi thêm
  } catch (error) {
    console.error("Thêm thất bại", error);
    alert("Thêm sản phẩm thất bại: " + error.message);
  }
  closeModal();
}
window.addProduct = addProduct;

console.log("🚀 ~ dssp:", dssp);

function editProduct(id) {
  selectedId = id;
  axios({
    url: `https://65118cdc829fa0248e4053c5.mockapi.io/product/${id}`,
    method: "GET",
  })
    .then((res) => {
      console.log(res);
      $("#myModal").modal("show");
      // Đưa data từ máy chủ lên form
      showDataForm(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}
window.editProduct = editProduct;

async function updateProduct(id) {
  try {
    // Lấy data vừa được cập nhật bởi người dùng từ form
    var updateProductData = getDataForm();
    const response = await axios.put(
      `https://65118cdc829fa0248e4053c5.mockapi.io/product/${selectedId}`,
      updateProductData
    );
    console.log("Sửa thành công", response);

    fetchFoodList(); // Gọi hàm để tải danh sách sản phẩm lại sau khi cập nhật
  } catch (error) {
    console.error("Sửa thất bại", error);
    alert("Sửa sản phẩm thất bại: " + error.message);
  }
  closeModal();
}
window.updateProduct = updateProduct;

async function fetchFoodList() {
  try {
    const response = await axios.get(
      "https://65118cdc829fa0248e4053c5.mockapi.io/product"
    );
    renderProductionList(response.data);
    originalProductList = response.data; // Lưu trữ danh sách ban đầu
    renderProductionList(originalProductList);
  } catch (err) {
    console.log(err);
  }
}
fetchFoodList();
//---------------------Tìm kiếm----------------------------------
function searchButton() {
  var keyword = document.getElementById("searchInput").value.toLowerCase();
  var results = searchProductsByKeyword(keyword);
  renderProductionList(results);
}
window.searchButton = searchButton;

function searchProductsByKeyword(keyword) {
  // Tạo một mảng mới để lưu trữ các sản phẩm phù hợp với từ khóa
  var searchResults = [];

  // Sử dụng danh sách sản phẩm ban đầu để tìm kiếm
  var productListToSearch = originalProductList;

  // Lặp qua danh sách sản phẩm ban đầu để tìm kiếm
  for (var i = 0; i < productListToSearch.length; i++) {
    var product = productListToSearch[i];
    if (product.name.toLowerCase().includes(keyword)) {
      searchResults.push(product);
    }
  }

  return searchResults;
}

// Sắp xếp

let sortedProducts = [];

//  sắp xếp danh sách sản phẩm
function sortProducts() {
  var sortSelect = document.getElementById("sortSelect");
  var sortOrder = sortSelect.value;

  if (sortOrder === "") {
    renderProductionList(originalProductList);

    return;
  }

  if (sortOrder === "asc") {
    // Sắp xếp danh sách sản phẩm theo giá tăng dần
    sortedProducts = dssp.slice().sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return priceA - priceB;
    });
    console.log("😊 ~ sortedProducts:", sortedProducts);
  }

  if (sortOrder === "desc") {
    // Sắp xếp danh sách sản phẩm theo giá giảm dần
    sortedProducts = dssp.slice().sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      return priceB - priceA;
    });
  }
  // Gọi hàm để hiển thị danh sách sản phẩm đã được sắp xếp
  renderProductionList(sortedProducts);
}
window.sortProducts = sortProducts;
