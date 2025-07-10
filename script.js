const PASSWORD = "secret123"; // يمكنك تغييره
let products = [];

function login() {
  const input = document.getElementById("adminPassword").value;
  if (input === PASSWORD) {
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("loginSection").style.display = "none";
  } else {
    alert("❌ كلمة السر غير صحيحة");
  }
}

function addProduct() {
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const fileInput = document.getElementById("productImage");

  if (!name || !price || !fileInput.files[0]) {
    alert("يرجى ملء جميع الحقول واختيار صورة.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const newProduct = {
      id: Date.now(),
      name,
      price,
      image: e.target.result
    };
    products.push(newProduct);
    saveProducts();
    renderProducts();
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productImage").value = null;
    alert("✅ تم إضافة المنتج بنجاح");
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deleteProduct(id) {
  if (confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProducts();
  }
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  const newName = prompt("اسم المنتج الجديد", product.name);
  const newPrice = prompt("السعر الجديد", product.price);

  if (newName && newPrice) {
    product.name = newName;
    product.price = newPrice;
    saveProducts();
    renderProducts();
  }
}

function renderProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const container = document.getElementById("productList");
  container.innerHTML = "";
  products
    .filter(p => p.name.toLowerCase().includes(searchTerm))
    .forEach(product => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>💰 ${product.price} جنيه</p>
        <div class="actions">
          <button onclick="editProduct(${product.id})">✏ تعديل</button>
          <button onclick="deleteProduct(${product.id})">🗑 حذف</button>
        </div>
      `;
      container.appendChild(div);
    });
}

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function loadProducts() {
  const data = localStorage.getItem("products");
  if (data) {
    products = JSON.parse(data);
    renderProducts();
  }
}

window.onload = loadProducts;
