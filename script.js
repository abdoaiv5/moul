// 🔒 ثابت التخزين المحلي
const STORAGE_KEY = "products";

// 📦 تحميل المنتجات
let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let invoice = [];

// ✅ تسجيل الدخول
function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === "admin" && p === "1234") {
    toggleView("loginSection", false);
    toggleView("dashboard", true);
    renderProducts();
  } else {
    alert("بيانات الدخول غير صحيحة");
  }
}

// 📂 عرض قسم معين
function showSection(id) {
  document.querySelectorAll(".content-section").forEach(el => el.style.display = "none");
  toggleView(id, true);
}

function toggleView(id, show) {
  document.getElementById(id).style.display = show ? "block" : "none";
}

// 💾 حفظ منتج جديد
function saveProduct() {
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const code = document.getElementById("productCode").value.trim();
  const desc = document.getElementById("productDescription").value.trim();
  const imgInput = document.getElementById("productImage").files[0];

  if (!name || isNaN(price) || !code) {
    alert("الرجاء ملء الحقول المطلوبة بشكل صحيح.");
    return;
  }

  const saveAndRender = (img = "") => {
    products.push({ name, price, code, desc, img });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    renderProducts();
  };

  if (imgInput) {
    const reader = new FileReader();
    reader.onload = () => saveAndRender(reader.result);
    reader.readAsDataURL(imgInput);
  } else {
    saveAndRender();
  }
}

// 🧾 عرض المنتجات
function renderProducts(list = products) {
  const container = document.getElementById("productList");
  container.innerHTML = "";

  list.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p><b>${p.price}</b> جنيه</p>
      ${p.img ? `<img src="${p.img}" width="100" alt="صورة المنتج" />` : ""}
      <button onclick="deleteProduct(${i})">🗑 حذف</button>
    `;

    container.appendChild(card);
  });
}

// 🗑 حذف منتج
function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  renderProducts();
}

// 🔍 بحث
function searchProducts() {
  const term = document.getElementById("searchProduct").value.trim().toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
  );
  renderProducts(filtered);
}

// ➕ إضافة للفاتورة
function addToInvoice() {
  const code = document.getElementById("invoiceProductCode").value.trim();
  const product = products.find(p => p.code === code);

  if (product) {
    invoice.push(product);
    renderInvoice();
  } else {
    alert("لم يتم العثور على المنتج.");
  }
}

// 💳 عرض الفاتورة
function renderInvoice() {
  const container = document.getElementById("invoiceItems");
  container.innerHTML = "";

  invoice.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "invoice-item";
    item.innerHTML = `
      <p>${p.name} - ${p.price} جنيه</p>
      <button onclick="removeInvoiceItem(${i})">🗑</button>
    `;
    container.appendChild(item);
  });
}

// ❌ حذف منتج من الفاتورة
function removeInvoiceItem(index) {
  invoice.splice(index, 1);
  renderInvoice();
}

// 💰 حساب الفاتورة
function calculateInvoice() {
  const total = invoice.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.14;
  const grand = total + tax;

  document.getElementById("invoiceTotal").innerText =
    `الإجمالي: ${grand.toFixed(2)} جنيه (شامل الضريبة)`;
}

// 📤 تصدير الفاتورة
function exportInvoice(type) {
  let content = "اسم المنتج,السعر\n";
  invoice.forEach(p => content += `${p.name},${p.price}\n`);

  const mimeType = type === "pdf" ? "application/pdf" : "text/csv";
  const filename = `invoice.${type}`;

  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// 🌙 تفعيل الوضع الداكن
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// 🗣️ مساعد صوتي
function startVoiceAssistant() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("متصفحك لا يدعم التعرف على الصوت.");

  const recog = new SpeechRecognition();
  recog.lang = "ar-SA";

  recog.onstart = () => setAlert("🎙️ جاري الاستماع...");
  recog.onerror = e => setAlert("", true) || alert(`خطأ: ${e.error}`);
  recog.onend = () => setAlert("");
  recog.onresult = e => handleVoiceCommand(e.results[0][0].transcript);

  recog.start();
}

function handleVoiceCommand(cmd) {
  const command = cmd.trim().toLowerCase();
  if (command.includes("أضف منتج")) showSection('productSection');
  else if (command.includes("فتح الفاتورة")) showSection('invoiceSection');
  else if (command.includes("احسب") || command.includes("إجمالي")) calculateInvoice();
  else alert("🚫 لم أفهم الأمر الصوتي.");
}

function setAlert(message, hide = false) {
  const alertEl = document.getElementById("alerts");
  alertEl.innerText = message;
  alertEl.style.display = hide || !message ? "none" : "block";
}

function setLanguage(lang) {
  alert(`تم تغيير اللغة إلى: ${lang} (الترجمة غير مفعلة بعد)`);
}
