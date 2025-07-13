// ------------------ تسجيل الدخول ------------------
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username === "admin" && password === "123") {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadProducts();
    showAlert("تم تسجيل الدخول بنجاح", "success");
  } else {
    showAlert("❌ بيانات الدخول غير صحيحة", "error");
  }
}

function logout() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  showAlert("تم تسجيل الخروج", "info");
}

// ------------------ الوضع الليلي ------------------
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  showAlert("تم تغيير الوضع", "info");
}

// ------------------ التنقل بين الأقسام ------------------
function showSection(id) {
  document.querySelectorAll(".content-section").forEach(section => {
    section.style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

// ------------------ المنتجات ------------------
let products = JSON.parse(localStorage.getItem("products") || "[]");

function saveProduct() {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const code = document.getElementById("productCode").value;
  const stock = parseInt(document.getElementById("productStock").value);
  const description = document.getElementById("productDescription").value;
  const imageInput = document.getElementById("productImage");
  let image = "";

  if (!name || !price || !code || !stock) {
    showAlert("⚠️ الرجاء ملء جميع الحقول الأساسية", "warning");
    return;
  }

  if (imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      image = reader.result;
      addProduct({ name, price, code, stock, description, image });
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    addProduct({ name, price, code, stock, description, image });
  }
}

function addProduct(product) {
  const existing = products.find(p => p.code === product.code);
  if (existing) {
    Object.assign(existing, product);
    showAlert("✅ تم تحديث المنتج بنجاح", "success");
  } else {
    products.push(product);
    showAlert("✅ تم إضافة المنتج بنجاح", "success");
  }
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
  clearProductForm();
}

function clearProductForm() {
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productCode").value = "";
  document.getElementById("productStock").value = "";
  document.getElementById("productDescription").value = "";
  document.getElementById("productImage").value = "";
}

function loadProducts(filtered = null) {
  const list = document.getElementById("productList");
  list.innerHTML = "";
  const displayProducts = filtered || products;

  displayProducts.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>السعر: ${p.price} جنيه</p>
      <p>الكود: ${p.code}</p>
      <p>الكمية: ${p.stock}</p>
      <p>${p.description}</p>
      ${p.image ? `<img src="${p.image}" alt="${p.name}" />` : ""}
      <button onclick="editProduct('${p.code}')">تعديل</button>
      <button onclick="deleteProduct('${p.code}')">🗑 حذف</button>
    `;
    list.appendChild(card);
  });
}

function editProduct(code) {
  const p = products.find(p => p.code === code);
  if (!p) return;
  document.getElementById("productName").value = p.name;
  document.getElementById("productPrice").value = p.price;
  document.getElementById("productCode").value = p.code;
  document.getElementById("productStock").value = p.stock;
  document.getElementById("productDescription").value = p.description;
  document.getElementById("saveBtn").textContent = "تحديث المنتج";
  showAlert("⚙️ تم تحميل بيانات المنتج للتعديل", "info");
}

function deleteProduct(code) {
  if (!confirm("هل أنت متأكد من حذف المنتج؟")) return;
  products = products.filter(p => p.code !== code);
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
  showAlert("🗑 تم حذف المنتج", "success");
}

function searchProducts() {
  const term = document.getElementById("searchProduct").value.toLowerCase();
  const result = products.filter(p => p.name.toLowerCase().includes(term) || p.code.includes(term));
  loadProducts(result);
}

// ------------------ الفاتورة ------------------
let invoice = [];

function addToInvoice() {
  const code = document.getElementById("invoiceProductCode").value;
  const quantity = parseInt(document.getElementById("invoiceQuantity").value);

  const product = products.find(p => p.code === code);
  if (!product) {
    showAlert("🚫 لم يتم العثور على المنتج", "error");
    return;
  }

  if (product.stock < quantity) {
    showAlert("⚠️ الكمية المطلوبة غير متوفرة", "warning");
    return;
  }

  invoice.push({ ...product, quantity });
  product.stock -= quantity;
  localStorage.setItem("products", JSON.stringify(products));
  loadProducts();
  renderInvoice();
  showAlert("✅ تم إضافة المنتج إلى الفاتورة", "success");
}

function renderInvoice() {
  const container = document.getElementById("invoiceItems");
  container.innerHTML = "";
  invoice.forEach(item => {
    const div = document.createElement("div");
    div.className = "invoice-item";
    div.innerHTML = `
      <h4>${item.name}</h4>
      <p>الكمية: ${item.quantity}</p>
      <p>السعر الإجمالي: ${item.price * item.quantity} جنيه</p>
    `;
    container.appendChild(div);
  });
}

function calculateInvoice() {
  const total = invoice.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("invoiceTotal").textContent = `الإجمالي: ${total} جنيه`;
}

function printInvoice() {
  const win = window.open();
  win.document.write("<h1>الفاتورة</h1>");
  invoice.forEach(i => {
    win.document.write(`<p>${i.name} - الكمية: ${i.quantity} - السعر: ${i.price * i.quantity} جنيه</p>`);
  });
  win.document.write(`<h3>${document.getElementById("invoiceTotal").textContent}</h3>`);
  win.print();
  win.close();
}

function exportInvoice(type) {
  let content = "اسم المنتج\tالكمية\tالسعر الكلي\n";
  invoice.forEach(i => {
    content += `${i.name}\t${i.quantity}\t${i.price * i.quantity}\n`;
  });
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `invoice.${type === "excel" ? "xls" : "txt"}`;
  link.click();
}

// ------------------ مساعد صوتي (محسّن) ------------------
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    window.speechSynthesis.cancel(); // إلغاء أي نطق سابق
    window.speechSynthesis.speak(utterance);
  }
}

function startVoiceAssistant() {
  speak("أهلاً بك، المساعد الصوتي يعمل الآن.");
  showAlert("🎤 المساعد الصوتي يعمل الآن", "info");
}

// ------------------ التنبيهات المحسّنة ------------------
function showAlert(message, type = "info") {
  const alertBox = document.getElementById("alerts");
  alertBox.textContent = message;

  alertBox.className = "alert " + type;
  alertBox.style.display = "block";

  speak(message); // تشغيل المساعد الصوتي تلقائياً

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 5000);
}

// ------------------ تغيير اللغة ------------------
function setLanguage(lang) {
  showAlert(`تم تغيير اللغة إلى: ${lang}`, "info");
}
