// ==========================================================================
// Cat Gaze 購物車與雙核心雲端商品串流系統 (cart-system.js)
// 1. 購物車同步 (localStorage + Firebase carts)
// 2. 訂單與會員查詢雙向相容 (Firebase orders)
// 3. 雙核心商品自動串流：同時支援 Google 試算表中控表 + Firebase products
// 4. 智慧比對既有靜態卡片：不重複生卡、自動補上單品頁連結、同步改價、支援一鍵「下架」隱藏
// ==========================================================================

const firebaseConfig = {
    apiKey: "AIzaSyCe9jsOgigX1Ok4sMbr1P2o4RcSM15BI_U",
    authDomain: "cat-gaze-bonsai.firebaseapp.com",
    databaseURL: "https://cat-gaze-bonsai-default-rtdb.firebaseio.com",
    projectId: "cat-gaze-bonsai",
    storageBucket: "cat-gaze-bonsai.firebasestorage.app",
    messagingSenderId: "411112352421",
    appId: "1:411112352421:web:265bd6e1372df985cefb4c",
    measurementId: "G-8ZW69YQQN0"
};

const CATGAZE_SHEET_ID = "128TMT_BQmWfIwZGH01UrU_WoHm5W_STX26DkP9MeDN0";

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = (typeof firebase !== 'undefined' && typeof firebase.database === 'function') ? firebase.database() : null;

let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('CatGazeCart')) || [];
} catch (e) {
    cart = [];
}

function getUserKey() {
    try {
        const profile = JSON.parse(localStorage.getItem('CatGazeProfile'));
        return profile && profile.email ? profile.email.replace(/\./g, '_') : null;
    } catch (e) {
        return null;
    }
}

function syncCartData() {
    localStorage.setItem('CatGazeCart', JSON.stringify(cart));
    const userKey = getUserKey();
    if (userKey && database) {
        database.ref('carts/' + userKey).set(cart);
    }
    updateCount();
    renderCart();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;
    if (drawer.style.right === '0px') {
        drawer.style.right = '-400px';
        overlay.style.display = 'none';
    } else {
        drawer.style.right = '0px';
        overlay.style.display = 'block';
        renderCart();
    }
}

function addToCart(pName, pPrice, pImage) {
    const item = {
        name: pName,
        price: Number(pPrice) || 0,
        image: pImage || 'CG_logo w bg_vertica_green.png'
    };
    cart.push(item);
    syncCartData();

    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.style.right !== '0px') {
        toggleCart();
    }
}

function addToFavorites(pName, pPrice, pImage) {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        alert("請先登入會員才能收藏植物喔！");
        window.location.href = "member.html";
        return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("請先登入會員才能收藏植物喔！");
        window.location.href = "member.html";
        return;
    }

    const favData = {
        name: pName,
        price: Number(pPrice) || 0,
        image: pImage || 'CG_logo w bg_vertica_green.png',
        addedAt: firebase.database.ServerValue.TIMESTAMP
    };

    const favKey = pName.replace(/[.#$\[\]\s]/g, '_');
    firebase.database().ref('favorites/' + user.uid + '/' + favKey).set(favData)
        .then(() => alert("✨ 已加入收藏清單"))
        .catch(() => alert("收藏失敗，請稍後再試"));
}

function updateCount() {
    const countElements = document.querySelectorAll('#cart-count');
    countElements.forEach(el => {
        el.innerText = cart.length;
    });
}

function updateCartUI() {
    updateCount();
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-items-content');
    const total = document.getElementById('cart-total-price');
    if (!list || !total) return;

    if (cart.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#999;">目前沒有選購植物</p>';
        total.innerText = 'NT$ 0';
        return;
    }

    let html = '';
    let sum = 0;
    cart.forEach((item, index) => {
        const p = Number(item.price) || 0;
        sum += p;
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                <div>
                    <div style="font-weight:bold;">${item.name}</div>
                    <div style="color:#d14900; font-size:0.9rem;">NT$ ${p.toLocaleString()}</div>
                </div>
                <button onclick="removeItem(${index})" style="color:#ccc; background:none; border:none; cursor:pointer; font-size:0.9rem;">移除</button>
            </div>`;
    });
    list.innerHTML = html;
    total.innerText = `NT$ ${sum.toLocaleString()}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    syncCartData();
}

function checkoutToLine() {
    if (cart.length === 0) return alert("購物車是空的喔！");
    const userKey = getUserKey();
    let profile = null;
    try {
        profile = JSON.parse(localStorage.getItem('CatGazeProfile'));
    } catch (e) {}

    if (!userKey || !profile) {
        alert("下單前請先至【👤 會員】填寫聯繫資料！");
        window.location.href = "member.html";
        return;
    }

    const currentUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
    const uid = (currentUser && currentUser.uid) || profile.uid || userKey;
    const totalSum = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const nowStr = new Date().toLocaleString('zh-TW');
    const orderId = "ORD-" + Date.now();

    const orderData = {
        order_id: orderId,
        uid: uid,
        customer: profile,
        items: cart,
        total_price: totalSum,
        totalPrice: totalSum,
        status: "待處理",
        created_at: nowStr,
        orderDate: nowStr
    };

    if (!database) {
        alert("雲端資料庫連線異常，請重新整理頁面。");
        return;
    }

    database.ref('orders/' + orderId).set(orderData)
        .then(() => database.ref('carts/' + userKey).remove())
        .then(() => {
            cart = [];
            localStorage.setItem('CatGazeCart', JSON.stringify(cart));
            updateCount();
            alert("✨ 訂單已傳送到雲端！編號：" + orderId);
            toggleCart();
        })
        .catch(() => alert("傳送失敗，請檢查網路"));
}

// ==========================================================================
// 智慧檢查頁面上是否已有同名靜態卡片 (避免重複生卡、自動綁定單品連結與下架隱藏)
// ==========================================================================
function getCurrentPageKey() {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (!path.endsWith('.html')) path = 'index.html';
    return path.replace('.html', '');
}

function findMatchingStaticCard(p) {
    const shortName = (p.title || '').split('|')[0].trim();
    if (!shortName) return null;
    const allCards = document.querySelectorAll('.product-card, .bonsai-card');
    for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        if (card.id && card.id.startsWith('cloud-prod-')) continue;
        const heading = card.querySelector('.product-title, .card-title, h3');
        const headingText = heading ? heading.innerText.trim() : card.innerText;
        if (headingText && (headingText.includes(shortName) || shortName.includes(headingText))) {
            return card;
        }
    }
    return null;
}

function enhanceExistingStaticCard(card, p) {
    const detailUrl = `product.html?id=${encodeURIComponent(p.id)}`;
    const priceNum = Number(p.price) || 0;

    // 1. 同步更新卡片上顯示的價格
    const priceEl = card.querySelector('.product-price, .price');
    if (priceEl && priceNum > 0) {
        priceEl.innerText = 'NT$ ' + priceNum.toLocaleString();
    }

    // 2. 若該靜態卡片原本沒有連往單品頁（例如 tools.html 的 3 項資材），自動為圖片與標題加上點擊跳轉
    const existingLink = card.querySelector('a[href]');
    if (!existingLink && !card.getAttribute('onclick')) {
        const imgBox = card.querySelector('.product-image, .img-box, .img-container');
        const infoBox = card.querySelector('.product-info');
        if (imgBox) {
            imgBox.style.cursor = 'pointer';
            imgBox.onclick = function() { window.location.href = detailUrl; };
        }
        if (infoBox) {
            infoBox.style.cursor = 'pointer';
            infoBox.onclick = function() { window.location.href = detailUrl; };
        }
    }
}

function insertProductCardOnPage(p, pageKey) {
    if (!p || !p.id) return;
    if (document.getElementById('cloud-prod-' + p.id)) return;

    // 若頁面上已有同名靜態卡片，直接升級該張卡片（補連結、同步價格），不重複插入第二張
    const existingStatic = findMatchingStaticCard(p);
    if (existingStatic) {
        enhanceExistingStaticCard(existingStatic, p);
        return;
    }

    const grid = document.querySelector('.product-grid, .Bonsai-grid, #product-container, #productGrid');
    if (!grid) return;

    const priceNum = Number(p.price) || 0;
    const safeTitle = (p.title || '').replace(/'/g, "\\'");
    const safeImg = (p.image || '').replace(/'/g, "\\'");
    const detailUrl = `product.html?id=${encodeURIComponent(p.id)}`;
    let cardHtml = '';

    if (pageKey === 'new-arrivals') {
        cardHtml = `
        <div class="bonsai-card" id="cloud-prod-${p.id}">
            <div class="img-container">
                <span class="unique-tag">${p.badge || '一物一拍'}</span>
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="card-info">
                <span class="card-meta">${(p.files && p.files.species) || '嚴選新作'} | ${(p.files && p.files.size) || '職人精選'}</span>
                <h3 class="card-title serif">${p.title}</h3>
                <div class="card-footer">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <a href="${detailUrl}" class="btn-view">凝視細節 →</a>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'pet-friendly' || pageKey === 'products-deciduous') {
        const badgeCls = pageKey === 'pet-friendly' ? 'safety-badge' : 'status-badge';
        const qiaoyu = (p.petDetails && p.petDetails.qiaoyu) || p.tagline || '「本喵親自認證的療癒綠意喵～」';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="img-box">
                <div class="${badgeCls}">${p.badge || 'PET SAFE'}</div>
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <h3>${p.title}</h3>
                <div class="qiaoyu-bubble">${qiaoyu}</div>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">帶回家</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-mini') {
        cardHtml = `
        <div class="product-card reveal active" id="cloud-prod-${p.id}" data-category="全部植物 桌面盆栽 大型落地 珍稀斑葉">
            <div class="img-container" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="env-label">${p.badge || '☀️ 嚴選'}</div>
                <div class="img-box"><img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'"></div>
            </div>
            <div class="product-info">
                <h3 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h3>
                <p class="product-desc">${(p.petDetails && p.petDetails.desc) || p.tagline || 'Cat Gaze 嚴選植栽'}</p>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入選植清單</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-caudex') {
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" data-type="caudex">
            <div class="badge caudex">${p.badge || 'SELECTED'}</div>
            <div class="img-box" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <h3 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h3>
                <span class="sci-name">${(p.files && p.files.species) || 'Cat Gaze Selection'}</span>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入購物車</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'tools') {
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}">
            <div onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="product-image"><img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'"></div>
                <div class="product-info">
                    <div class="product-tag">${p.badge || '職人選物'}</div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入選植清單</button>
        </div>`;
    } else if (pageKey === 'index') {
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}">
            <a href="${detailUrl}" style="text-decoration: none; color: inherit;">
                <div class="product-image">
                    <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='CG_logo w bg_vertica_green.png'">
                </div>
                <div class="product-info">
                    <div class="product-tag">${p.badge || '嚴選上架'}</div>
                    <div class="product-title">${p.title}</div>
                    <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                </div>
            </a>
            <div style="padding: 0 1.2rem 1.2rem; display:flex; flex-direction:column; gap:8px;">
                <button onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')" class="btn-cta" style="width:100%; border:none; cursor:pointer; padding:8px 0; font-size:0.9rem;">加入購物車</button>
                <button onclick="addToFavorites('${safeTitle}', ${priceNum}, '${safeImg}')" style="background:none; border:1px solid #7F916A; color:#7F916A; padding:6px 0; border-radius:25px; cursor:pointer; font-size:0.8rem;">♡ 加入收藏</button>
            </div>
        </div>`;
    }

    if (cardHtml) {
        grid.insertAdjacentHTML('beforeend', cardHtml);
    }
}

function parseSheetRowToProduct(cells) {
    const val = (idx) => (cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) ? String(cells[idx].v).trim() : '';
    const id = val(0);
    const status = val(1);
    const title = val(2);
    const priceRaw = cells[3] && cells[3].v !== null ? Number(String(cells[3].v).replace(/[^0-9.]/g, '')) : 0;
    const image = val(4) || 'CG_logo w bg_vertica_green.png';
    const badge = val(5) || '嚴選上架';
    const categories = val(6).split(',').map(s => s.trim()).filter(Boolean);
    const template = val(7) || 'bonsai';
    const colI = val(8);
    const colJ = val(9);
    const colK = val(10);
    const colL = val(11);
    const colM = val(12);

    return {
        id: id,
        status: status,
        title: title,
        price: priceRaw,
        image: image,
        badge: badge,
        categories: categories,
        template: template,
        tagline: colI,
        files: {
            species: colJ || '--',
            age: colK || '--',
            size: colL || '--',
            pot: colM || '--'
        },
        petDetails: {
            desc: colI,
            light: colJ || '半日照 / 通風',
            water: colK || '土乾澆透',
            safe: colL || '100% 寵物無害',
            qiaoyu: colM
        }
    };
}

window.__onCatGazeSheetLoaded = function(response) {
    if (!response || !response.table || !Array.isArray(response.table.rows)) return;
    const pageKey = getCurrentPageKey();
    const rows = response.table.rows;
    window.__CATGAZE_SHEET_PRODUCTS__ = {};

    rows.forEach((r) => {
        if (!r || !r.c) return;
        const p = parseSheetRowToProduct(r.c);
        if (!p.id || p.id === '商品代號(id)') return;
        window.__CATGAZE_SHEET_PRODUCTS__[p.id] = p;

        // 1. 若狀態設為「下架」，自動隱藏頁面上同名靜態卡片或動態卡片
        if (p.status === '下架') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) matchedStatic.style.display = 'none';
            const dynamicEl = document.getElementById('cloud-prod-' + p.id);
            if (dynamicEl) dynamicEl.style.display = 'none';
            return;
        }

        // 2. 若狀態設為「既有基準」，若當前頁面有同名卡片則同步價格並補齊點擊連結
        if (p.status === '既有基準') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) enhanceExistingStaticCard(matchedStatic, p);
            return;
        }

        // 3. 若狀態設為「上架」，且勾選了當前頁面，自動升級既有卡片或插入新卡片
        if (p.status === '上架' && p.categories.includes(pageKey)) {
            insertProductCardOnPage(p, pageKey);
        }
    });

    if (typeof window.__onSheetProductsReady === 'function') {
        window.__onSheetProductsReady(window.__CATGAZE_SHEET_PRODUCTS__);
    }
};

function loadCloudProductsFromBothSources() {
    const pageKey = getCurrentPageKey();

    if (database) {
        database.ref('products').once('value', (snap) => {
            const prodsObj = snap.val();
            if (!prodsObj) return;
            Object.values(prodsObj).forEach(p => {
                if (p && Array.isArray(p.categories) && p.categories.includes(pageKey)) {
                    insertProductCardOnPage(p, pageKey);
                }
            });
        });
    }

    if (CATGAZE_SHEET_ID) {
        const sc = document.createElement('script');
        sc.src = `https://docs.google.com/spreadsheets/d/${CATGAZE_SHEET_ID}/gviz/tq?tqx=responseHandler:__onCatGazeSheetLoaded`;
        sc.async = true;
        document.body.appendChild(sc);
    }
}

window.addEventListener('load', function() {
    updateCount();
    renderCart();
    loadCloudProductsFromBothSources();

    const userKey = getUserKey();
    if (userKey && database) {
        database.ref('carts/' + userKey).once('value', (snapshot) => {
            const cloudCart = snapshot.val();
            if (cloudCart && Array.isArray(cloudCart)) {
                cart = cloudCart;
                localStorage.setItem('CatGazeCart', JSON.stringify(cart));
                updateCount();
                renderCart();
            }
        });
    }
});
