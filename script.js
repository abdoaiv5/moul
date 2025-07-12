// تخزين البيانات
let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];

function login() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if (u === "admin" && p === "1234") {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    renderProducts();
  } else {
    alert("بيانات الدخول غير صحيحة");
  }
}

function showSection(id) {
  document.querySelectorAll(".content-section").forEach(el => el.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function saveProduct() {
  const name = document.getElementById("productName").value;
  const price = parseFloat(document.getElementById("productPrice").value);
  const code = document.getElementById("productCode").value;
  const desc = document.getElementById("productDescription").value;

  const reader = new FileReader();
  const imgInput = document.getElementById("productImage").files[0];

  reader.onload = function () {
    const img = reader.result;
    products.push({ name, price, code, desc, img });
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  };

  if (imgInput) {
    reader.readAsDataURL(imgInput);
  } else {
    products.push({ name, price, code, desc, img: "" });
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
  }
}

function renderProducts() {
  const container = document.getElementById("productList");
  container.innerHTML = "";
  products.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p><b>${p.price}</b> جنيه</p>
      ${p.img ? `<img src="${p.img}" width="100" />` : ""}
      <button onclick="deleteProduct(${i})">🗑 حذف</button>
    `;
    container.appendChild(card);
  });
}

function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
}

function searchProducts() {
  const term = document.getElementById("searchProduct").value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.code.toLowerCase().includes(term)
  );
  const container = document.getElementById("productList");
  container.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <p><b>${p.price}</b> جنيه</p>
      ${p.img ? `<img src="${p.img}" width="100" />` : ""}
    `;
    container.appendChild(card);
  });
}

function addToInvoice() {
  const code = document.getElementById("invoiceProductCode").value;
  const product = products.find(p => p.code === code);
  if (product) {
    invoice.push(product);
    renderInvoice();
  } else {
    alert("لم يتم العثور على المنتج.");
  }
}

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

function removeInvoiceItem(index) {
  invoice.splice(index, 1);
  renderInvoice();
}

function calculateInvoice() {
  const total = invoice.reduce((sum, item) => sum + item.price, 0);
  const tax = total * 0.14;
  const grand = total + tax;
  document.getElementById("invoiceTotal").innerText = `الإجمالي: ${grand.toFixed(2)} جنيه (شامل الضريبة)`;
}

function exportInvoice(type) {
  let content = "اسم المنتج,السعر\n";
  invoice.forEach(p => {
    content += `${p.name},${p.price}\n`;
  });

  const blob = new Blob([content], { type: type === "pdf" ? "application/pdf" : "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = type === "pdf" ? "invoice.pdf" : "invoice.csv";
  link.click();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// ✅ Web Speech API: مساعد صوتي
function startVoiceAssistant() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("متصفحك لا يدعم التعرف على الصوت.");
    return;
  }

  const recog = new SpeechRecognition();
  recog.lang = "ar-SA";
  recog.interimResults = false;
  recog.maxAlternatives = 1;

  recog.onstart = () => {
    document.getElementById("alerts").innerText = "🎙️ جاري الاستماع...";
    document.getElementById("alerts").style.display = "block";
  };

  recog.onerror = (event) => {
    alert("حدث خطأ في التعرف الصوتي: " + event.error);
    document.getElementById("alerts").style.display = "none";
  };

  recog.onend = () => {
    document.getElementById("alerts").style.display = "none";
  };

  recog.onresult = function (event) {
    const cmd = event.results[0][0].transcript;
    handleVoiceCommand(cmd);
  };

  recog.start();
}

function handleVoiceCommand(cmd) {
  cmd = cmd.trim().toLowerCase();

  if (cmd.includes("أضف منتج")) showSection('productSection');
  else if (cmd.includes("فتح الفاتورة")) showSection('invoiceSection');
  else if (cmd.includes("احسب") || cmd.includes("إجمالي")) calculateInvoice();
  else alert("🚫 لم أفهم الأمر الصوتي، حاول مرة أخرى.");
}

function setLanguage(lang) {
  alert(`تم تغيير اللغة إلى: ${lang} (الترجمة غير مفعلة بعد)`);
}
