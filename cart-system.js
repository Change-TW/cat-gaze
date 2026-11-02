// ==========================================================================
// Cat Gaze 購物車與雙核心雲端商品串流系統 (cart-system.js)
// 1. 購物車同步 (localStorage + Firebase carts)
// 2. 訂單與會員查詢雙向相容 (Firebase orders)
// 3. 雙核心商品自動串流：同時支援 Google 試算表中控表 + Firebase products
// 4. 精準將首頁雲端商品插入「本週嚴選新品 (#home-featured-grid)」，絕不混入「主題分類」
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
        // 忽略主題分類區塊內的分類卡片
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

// 取得正確的商品清單容器 (首頁嚴格指定 .featured 區塊內的 .product-grid，絕不誤抓主題分類區塊)
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
        // 100% 採用首頁「本週嚴選新品」原生卡片樣式 (.product-image-placeholder + .product-subtitle + #查看詳情)
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

    // 若舊版 index.html 把卡片誤插進 .categories-section，先自動清除
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
