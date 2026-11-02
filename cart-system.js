// ==========================================================================
// Cat Gaze 購物車與雙核心雲端商品串流系統 (cart-system.js)
// 1. 購物車同步 (localStorage + Firebase carts)
// 2. 訂單與會員查詢雙向相容 (Firebase orders)
// 3. 支援試算表「G欄：主分類專區」、「H欄：細項子分類」、「I欄：首頁與新品曝光」與「J欄：單品頁版型」全中文下拉選單解析
// 4. 自動綁定各頁面頂部「細項子分類篩選按鈕」（耐陰室內/陽台喜光、桌面盆栽/大型落地/珍稀斑葉、塊根/多肉、修剪工具/專業介質/職人盆器/養護資材）
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
// 智慧檢查頁面上是否已有同名靜態卡片 & 同步既有獨立單品頁內容
// ==========================================================================
function getCurrentPageKey() {
    let path = window.location.pathname.split('/').pop() || 'index.html';
    if (!path.endsWith('.html')) path = 'index.html';
    return path.replace('.html', '');
}

const LEGACY_PAGE_ID_MAP = {
    'shimpaku': 'CG-SB002',
    'black-pine': 'CG-BP001',
    'red-maple': 'CG-RM003',
    'luohan-detail': 'CG-LH001',
    'fern-detail': 'CG-FN001'
};

function syncLegacyDetailPageFromSheet(sheetMap) {
    const pageKey = getCurrentPageKey();
    const mappedId = LEGACY_PAGE_ID_MAP[pageKey];
    if (!mappedId || !sheetMap[mappedId]) return;
    const p = sheetMap[mappedId];
    const priceNum = Number(p.price) || 0;

    const titleEl = document.getElementById('display-title');
    if (titleEl) {
        titleEl.innerText = p.title;
        document.title = p.title + " - Cat Gaze";
        const priceEl = document.getElementById('display-price');
        if (priceEl) priceEl.innerText = "NT$ " + priceNum.toLocaleString();
        const imgEl = document.getElementById('display-img');
        if (imgEl && p.image) imgEl.src = p.image;
        const tagEl = document.getElementById('display-tagline');
        if (tagEl && p.tagline) tagEl.innerText = p.tagline;
        if (p.files) {
            const sp = document.getElementById('file-species');
            const ag = document.getElementById('file-age');
            const sz = document.getElementById('file-size');
            const pt = document.getElementById('file-pot');
            if (sp) sp.innerText = p.files.species;
            if (ag) ag.innerText = p.files.age;
            if (sz) sz.innerText = p.files.size;
            if (pt) pt.innerText = p.files.pot;
        }
        const addBtn = document.getElementById('add-btn');
        if (addBtn) {
            if (p.status === '下架') {
                addBtn.innerText = "目前已下架 / 售罄";
                addBtn.disabled = true;
                addBtn.style.background = "#ccc";
                addBtn.onclick = null;
            } else {
                addBtn.onclick = function() { addToCart(p.title, priceNum, p.image); };
            }
        }
    }

    const petTitleEl = document.querySelector('.product-info-section .product-title');
    if (petTitleEl) {
        petTitleEl.innerText = p.title;
        document.title = p.title + " | Cat Gaze";
        const petPriceEl = document.querySelector('.product-info-section .price-tag');
        if (petPriceEl) petPriceEl.innerText = "NT$ " + priceNum.toLocaleString();
        const petImgEl = document.querySelector('.product-image-section img');
        if (petImgEl && p.image) petImgEl.src = p.image;
        const petDescEl = document.querySelector('.product-info-section > p');
        if (petDescEl && p.petDetails && p.petDetails.desc) petDescEl.innerText = p.petDetails.desc;
        const qiaoyuEl = document.querySelector('.qiaoyu-text');
        if (qiaoyuEl && p.petDetails && p.petDetails.qiaoyu) qiaoyuEl.innerText = p.petDetails.qiaoyu;
        const careStrongEls = document.querySelectorAll('.care-tags .care-tag strong');
        if (careStrongEls.length >= 3 && p.petDetails) {
            careStrongEls[0].innerText = p.petDetails.light;
            careStrongEls[1].innerText = p.petDetails.water;
            careStrongEls[2].innerText = p.petDetails.safe;
        }
        const buyBtn = document.querySelector('.buy-actions .btn-main');
        if (buyBtn) {
            if (p.status === '下架') {
                buyBtn.innerText = "目前已下架 / 售罄";
                buyBtn.disabled = true;
                buyBtn.style.background = "#ccc";
                buyBtn.onclick = null;
            } else {
                buyBtn.onclick = function() { addToCart(p.title, priceNum, p.image); };
            }
        }
    }
}

function findMatchingStaticCard(p) {
    const shortName = (p.title || '').split('|')[0].trim();
    if (!shortName) return null;
    const allCards = document.querySelectorAll('.product-card, .bonsai-card, .feature-item');
    for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        if (card.id && card.id.startsWith('cloud-prod-')) continue;
        if (card.closest('.categories-section')) continue;
        const heading = card.querySelector('.product-title, .card-title, h3, h2');
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

    const heading = card.querySelector('.product-title, .card-title, h3');
    if (heading && p.title) heading.innerText = p.title;

    const priceEl = card.querySelector('.product-price, .price, .price-tag');
    if (priceEl && priceNum > 0) {
        priceEl.innerText = 'NT$ ' + priceNum.toLocaleString();
    }

    // 同步更新子分類篩選屬性 (data-category / data-type / .product-tag)
    if (p.subCategoryLabel) {
        if (card.hasAttribute('data-category')) {
            card.setAttribute('data-category', p.subCategoryLabel);
        }
        if (card.hasAttribute('data-type')) {
            card.setAttribute('data-type', p.subCategoryLabel.includes('多肉') ? 'succulent' : 'caudex');
        }
        const tagEl = card.querySelector('.product-tag');
        if (tagEl && !tagEl.getAttribute('href')) {
            tagEl.innerText = p.subCategoryLabel;
        }
    }

    const cartBtn = card.querySelector('.add-to-cart-btn, .btn-add, .btn-cta, .btn-luxury');
    if (cartBtn && cartBtn.tagName === 'BUTTON') {
        cartBtn.onclick = function(e) {
            if (e) e.stopPropagation();
            addToCart(p.title, priceNum, p.image);
        };
    }

    const existingLink = card.querySelector('a[href]');
    if (!existingLink && !card.getAttribute('onclick')) {
        const imgBox = card.querySelector('.product-image, .img-box, .img-container, .feature-img');
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

function getTargetProductGrid(pageKey) {
    if (pageKey === 'index') {
        return document.querySelector('#home-featured-grid, .featured .product-grid, #shop .product-grid');
    }
    if (pageKey === 'new-arrivals') {
        return document.querySelector('.Bonsai-grid, .featured-new');
    }
    return document.querySelector('#product-container, #productGrid, .product-grid');
}

function insertProductCardOnPage(p, pageKey) {
    if (!p || !p.id) return;
    if (document.getElementById('cloud-prod-' + p.id)) return;

    const existingStatic = findMatchingStaticCard(p);
    if (existingStatic) {
        enhanceExistingStaticCard(existingStatic, p);
        return;
    }

    const grid = getTargetProductGrid(pageKey);
    if (!grid) return;

    const priceNum = Number(p.price) || 0;
    const safeTitle = (p.title || '').replace(/'/g, "\\'");
    const safeImg = (p.image || '').replace(/'/g, "\\'");
    const detailUrl = `product.html?id=${encodeURIComponent(p.id)}`;
    const subCat = p.subCategoryLabel || p.badge || '';
    let cardHtml = '';

    if (pageKey === 'new-arrivals') {
        if (grid.classList.contains('featured-new')) {
            cardHtml = `
            <div class="feature-item" id="cloud-prod-${p.id}">
                <div class="feature-img" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                    <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
                </div>
                <div class="feature-text">
                    <h2 onclick="location.href='${detailUrl}'" style="cursor:pointer;">${p.title}</h2>
                    <p>${(p.petDetails && p.petDetails.desc) || p.tagline || 'Cat Gaze 嚴選植栽'}</p>
                    <span class="price-tag">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-luxury" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">將這份靜謐帶回家</button>
                    <a href="${detailUrl}" style="margin-left:15px; color:#7F916A; text-decoration:none; font-weight:bold;">查看詳情 →</a>
                </div>
            </div>`;
        } else {
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
        }
    } else if (pageKey === 'pet-friendly') {
        // 支援 pet-friendly.html 的「耐陰室內」與「陽台喜光」篩選標籤
        const petSubCat = subCat.includes('陽台喜光') ? '陽台喜光' : (subCat.includes('耐陰室內') ? '耐陰室內' : '耐陰室內 陽台喜光');
        const envIcon = petSubCat === '陽台喜光' ? '☀️ 半日照' : '☁️ 耐陰';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" data-category="${petSubCat}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="pet-badge">${p.badge || 'CAT SAFE'}</div>
            <button class="btn-fav-float" onclick="event.stopPropagation(); addToFavorites('${safeTitle}', ${priceNum}, '${safeImg}')">
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <div class="img-box">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
                <div class="env-bar">
                    <span>${envIcon}</span>
                    <span>💧 ${(p.petDetails && p.petDetails.water) || '土乾澆透'}</span>
                    <span>🐾 100%無毒</span>
                </div>
            </div>
            <div class="product-info">
                <h3>${p.title}</h3>
                <p class="product-desc">${(p.petDetails && p.petDetails.desc) ? p.petDetails.desc.substring(0, 42) + '...' : '經 ASPCA 認證對貓狗無毒的安全療癒植栽。'}</p>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">+</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-deciduous') {
        const qiaoyu = (p.petDetails && p.petDetails.qiaoyu) || p.tagline || '「本喵親自認證的療癒綠意喵～」';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="img-box">
                <div class="status-badge">${p.badge || 'OFFICE HEALING'}</div>
                <img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <h3 class="serif">${p.title}</h3>
                <div class="healing-meta">
                    光照：${(p.petDetails && p.petDetails.light) || '明亮散射光'}<br>
                    澆水：${(p.petDetails && p.petDetails.water) || '表土微乾澆透'}
                </div>
                <div class="qiaoyu-bubble">${qiaoyu}</div>
                <div class="price-row">
                    <span class="price">NT$ ${priceNum.toLocaleString()}</span>
                    <button class="btn-add" onclick="event.stopPropagation(); addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">帶回家</button>
                </div>
            </div>
        </div>`;
    } else if (pageKey === 'products-mini') {
        // 支援 products-mini.html 的「大型落地」、「桌面盆栽」、「珍稀斑葉」篩選
        const miniCat = subCat || '桌面盆栽';
        cardHtml = `
        <div class="product-card reveal active" id="cloud-prod-${p.id}" data-category="${miniCat}">
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
        // 支援 products-caudex.html 的「塊根植物 (caudex)」與「多肉植物 (succulent)」篩選
        const caudexType = subCat.includes('多肉') ? 'succulent' : 'caudex';
        const badgeLabel = caudexType === 'succulent' ? 'SUCCULENT' : 'CAUDEX';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" data-type="${caudexType}">
            <div class="badge ${caudexType}">${badgeLabel}</div>
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
        // 支援 tools.html 的「修剪工具」、「專業介質」、「職人盆器」、「養護資材」篩選
        const toolTag = subCat || p.badge || '職人選物';
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}">
            <div onclick="location.href='${detailUrl}'" style="cursor:pointer;">
                <div class="product-image"><img src="${p.image}" alt="${p.title}" onerror="this.src='CG_logo w bg_vertica_green.png'"></div>
                <div class="product-info">
                    <div class="product-tag">${toolTag}</div>
                    <h3 class="product-title">${p.title}</h3>
                    <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                </div>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">加入選植清單</button>
        </div>`;
    } else if (pageKey === 'index') {
        const subtitleStr = (p.files && p.files.size && p.files.size !== '--') ? p.files.size : (p.badge || '嚴選新作');
        cardHtml = `
        <div class="product-card" id="cloud-prod-${p.id}" onclick="location.href='${detailUrl}'" style="cursor:pointer;">
            <div class="product-image-placeholder">
                <img src="${p.image}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='CG_logo w bg_vertica_green.png'">
            </div>
            <div class="product-info">
                <div class="product-title">${p.title}</div>
                <div class="product-subtitle">${subtitleStr}</div>
                <div class="product-price">NT$ ${priceNum.toLocaleString()}</div>
                <a href="${detailUrl}" class="product-tag">#查看詳情</a>
            </div>
        </div>`;
    }

    if (cardHtml) {
        grid.insertAdjacentHTML('beforeend', cardHtml);
    }
}

// 動態強化各分類頁的篩選按鈕，讓後來從雲端長出來的商品卡片也能被頂部篩選按鈕正確篩選
function bindDynamicCategoryFilters() {
    const pageKey = getCurrentPageKey();

    if (pageKey === 'pet-friendly') {
        const btns = document.querySelectorAll('.filter-tag');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = btn.textContent.trim();
                document.querySelectorAll('.product-card').forEach(card => {
                    const cats = card.getAttribute('data-category') || '';
                    if (selected === '全部植物' || cats.includes(selected)) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    } else if (pageKey === 'products-mini') {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterVal = btn.getAttribute('data-filter') || 'all';
                document.querySelectorAll('.product-card').forEach(card => {
                    const cats = card.getAttribute('data-category') || '';
                    if (filterVal === 'all' || cats.includes(filterVal)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    } else if (pageKey === 'tools') {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTag = btn.textContent.trim();
                document.querySelectorAll('.product-card').forEach(card => {
                    const tagEl = card.querySelector('.product-tag');
                    const cardTag = tagEl ? tagEl.textContent.trim() : '';
                    if (selectedTag === '全部' || cardTag.includes(selectedTag)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

// 智慧解析試算表列（相容舊版 13 欄與新版含子分類下拉選單之 15 欄格式）
function parseSheetRowToProduct(cells) {
    const val = (idx) => (cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) ? String(cells[idx].v).trim() : '';
    const id = val(0);
    const status = val(1);
    const title = val(2);
    const priceRaw = cells[3] && cells[3].v !== null ? Number(String(cells[3].v).replace(/[^0-9.]/g, '')) : 0;
    const image = val(4) || 'CG_logo w bg_vertica_green.png';
    const badge = val(5) || '嚴選上架';

    // 判斷是否為新版 15 欄結構 (G欄=主分類, H欄=細項子分類, I欄=首頁與新品曝光, J欄=版型, K~O欄=內容)
    const colG = val(6);
    const colH = val(7);
    const colI = val(8);
    const colJ = val(9);
    const isNew15Col = colJ.includes('bonsai') || colJ.includes('pet') || colJ.includes('tool') || colG.includes('(') || colH.includes('｜');

    let categories = [];
    let subCategoryLabel = '';
    let template = 'bonsai';
    let descOrTagline = '';
    let spec1 = '', spec2 = '', spec3 = '', spec4 = '';

    if (isNew15Col) {
        // 解析 G 欄主分類
        if (colG.includes('pet-friendly') || colG.includes('寵物友善')) categories.push('pet-friendly');
        if (colG.includes('products-deciduous') || colG.includes('辦公室療癒')) categories.push('products-deciduous');
        if (colG.includes('products-mini') || colG.includes('風水招財')) categories.push('products-mini');
        if (colG.includes('products-caudex') || colG.includes('綠手指')) categories.push('products-caudex');
        if (colG.includes('tools') || colG.includes('資材用具')) categories.push('tools');

        // 解析 H 欄細項子分類 (例如 "寵物友善｜耐陰室內" -> "耐陰室內")
        subCategoryLabel = colH.includes('｜') ? colH.split('｜')[1].trim() : colH;

        // 解析 I 欄首頁與新品曝光
        if (colI.includes('首頁')) categories.push('index');
        if (colI.includes('嚴選新品')) categories.push('new-arrivals');

        // 解析 J 欄版型
        if (colJ.includes('pet') || colJ.includes('巧遇')) template = 'pet';
        else if (colJ.includes('tool') || colJ.includes('資材')) template = 'tool';
        else template = 'bonsai';

        descOrTagline = val(10);
        spec1 = val(11);
        spec2 = val(12);
        spec3 = val(13);
        spec4 = val(14);
    } else {
        // 相容舊版 13 欄
        categories = colG.split(',').map(s => s.trim()).filter(Boolean);
        template = colH || 'bonsai';
        descOrTagline = val(8);
        spec1 = val(9);
        spec2 = val(10);
        spec3 = val(11);
        spec4 = val(12);
    }

    return {
        id: id,
        status: status,
        title: title,
        price: priceRaw,
        image: image,
        badge: badge,
        categories: categories,
        subCategoryLabel: subCategoryLabel,
        template: template,
        tagline: descOrTagline,
        files: {
            species: spec1 || '--',
            age: spec2 || '--',
            size: spec3 || '--',
            pot: spec4 || '--'
        },
        petDetails: {
            desc: descOrTagline,
            light: spec1 || '半日照 / 通風',
            water: spec2 || '土乾澆透',
            safe: spec3 || '100% 寵物無害',
            qiaoyu: spec4
        }
    };
}

window.__onCatGazeSheetLoaded = function(response) {
    if (!response || !response.table || !Array.isArray(response.table.rows)) return;
    const pageKey = getCurrentPageKey();
    const rows = response.table.rows;
    window.__CATGAZE_SHEET_PRODUCTS__ = {};

    const wrongCardInCat = document.querySelector('.categories-section [id^="cloud-prod-"]');
    if (wrongCardInCat) wrongCardInCat.remove();

    rows.forEach((r) => {
        if (!r || !r.c) return;
        const p = parseSheetRowToProduct(r.c);
        if (!p.id || p.id === '商品代號(id)') return;
        window.__CATGAZE_SHEET_PRODUCTS__[p.id] = p;

        if (p.status === '下架') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) matchedStatic.style.display = 'none';
            const dynamicEl = document.getElementById('cloud-prod-' + p.id);
            if (dynamicEl) dynamicEl.style.display = 'none';
            return;
        }

        if (p.status === '既有基準') {
            const matchedStatic = findMatchingStaticCard(p);
            if (matchedStatic) enhanceExistingStaticCard(matchedStatic, p);
            return;
        }

        if (p.status === '上架' && p.categories.includes(pageKey)) {
            insertProductCardOnPage(p, pageKey);
        }
    });

    syncLegacyDetailPageFromSheet(window.__CATGAZE_SHEET_PRODUCTS__);
    bindDynamicCategoryFilters();

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

function injectAutoSEOSchema() {
    const baseUrl = "https://change-tw.github.io/cat-gaze/";
    const pageKey = getCurrentPageKey();

    if (!document.querySelector('link[rel="canonical"]')) {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = baseUrl + (pageKey === 'index' ? '' : (pageKey + '.html')) + (window.location.search || '');
        document.head.appendChild(link);
    }

    if (pageKey === 'index') {
        const orgSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Cat Gaze 貓凝植栽",
            "url": baseUrl,
            "logo": baseUrl + "CG_logo%20w%20bg_vertica_green.png",
            "description": "透過貓眼凝視，發掘植栽的靈魂。專營日本黑松、系魚川真柏、小品盆景、ASPCA認證100%對貓無毒寵物友善植物與日本職人盆景資材。",
            "sameAs": [
                "https://www.instagram.com/catgaze_bonsai"
            ]
        };
        const sc = document.createElement('script');
        sc.type = 'application/ld+json';
        sc.textContent = JSON.stringify(orgSchema);
        document.head.appendChild(sc);
    }

    setTimeout(() => {
        const titleEl = document.querySelector('#display-title, .product-info-section .product-title, .info-section h1, .pet-info-col h1');
        const priceEl = document.querySelector('#display-price, .price-tag, .info-section .price');
        const imgEl = document.querySelector('#display-img, .product-image-section img, .image-gallery img, .pet-img-col img');
        if (titleEl && priceEl) {
            const prodName = titleEl.innerText.trim();
            const priceVal = Number(priceEl.innerText.replace(/[^0-9.]/g, '')) || 0;
            const imgSrc = imgEl ? imgEl.getAttribute('src') : 'CG_logo w bg_vertica_green.png';
            if (prodName && priceVal > 0 && prodName !== '載入中...') {
                const prodSchema = {
                    "@context": "https://schema.org/",
                    "@type": "Product",
                    "name": prodName,
                    "image": imgSrc.startsWith('http') ? imgSrc : (baseUrl + imgSrc),
                    "description": document.title + " - Cat Gaze 貓凝植栽嚴選，實品拍攝出貨。",
                    "brand": {
                        "@type": "Brand",
                        "name": "Cat Gaze 貓凝植栽"
                    },
                    "offers": {
                        "@type": "Offer",
                        "url": window.location.href,
                        "priceCurrency": "TWD",
                        "price": priceVal,
                        "availability": "https://schema.org/InStock",
                        "itemCondition": "https://schema.org/NewCondition"
                    }
                };
                const sc = document.createElement('script');
                sc.type = 'application/ld+json';
                sc.textContent = JSON.stringify(prodSchema);
                document.head.appendChild(sc);
            }
        }
    }, 1500);
}

window.addEventListener('load', function() {
    updateCount();
    renderCart();
    loadCloudProductsFromBothSources();
    injectAutoSEOSchema();

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
