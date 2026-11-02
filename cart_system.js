// ==========================================================================
// Cat Gaze 購物車、雲端商品中控串流 ＆「🐈 AI 巧遇店長」全站智慧導購系統 (cart-system.js)
// 1. 購物車同步 (localStorage + Firebase carts)
// 2. 訂單與會員查詢雙向相容 (Firebase orders)
// 3. 支援試算表「G欄：主分類專區」、「H欄：細項子分類」、「I欄：首頁與新品曝光」全中文下拉選單解析
// 4. 全站右下角自動載入「🐈 AI 巧遇店長」互動選植診斷、預算篩選、養護問答與一鍵加購引擎
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
// LINE 官方帳號連結 (申請完成後可替換為 https://lin.ee/您的代碼)
const CATGAZE_LINE_URL = "https://line.me/R/ti/p/@catgaze";

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

// 預設商品庫備援 (當試算表尚未載入完成時，AI 巧遇店長依然能瞬間回答並推播商品)
const DEFAULT_CATALOG_FALLBACK = {
    'CG-LH001': {
        id: 'CG-LH001', status: '既有基準', title: '小葉羅漢松 | 寵物友善長壽守護', price: 2200, image: 'luohan.jpg',
        badge: '100% 寵物無毒', categories: ['pet-friendly', 'products-deciduous', 'index'], subCategoryLabel: '陽台喜光',
        template: 'pet', url: 'luohan-detail.html',
        petDetails: { light: '半日照 / 通風', water: '每週 2-3 次', safe: '100% 寵物無害', qiaoyu: '「這棵樹的葉子尖尖的，但我咬過之後發現一點也不好吃（而且沒毒），本店長批准它進駐客廳！」' }
    },
    'CG-FN001': {
        id: 'CG-FN001', status: '既有基準', title: '銀脈鳳尾蕨 | 室內耐陰保濕首選', price: 980, image: 'fern.jpg',
        badge: '100% 寵物無毒', categories: ['pet-friendly', 'products-deciduous', 'index'], subCategoryLabel: '耐陰室內',
        template: 'pet', url: 'fern-detail.html',
        petDetails: { light: '室內散射光 / 耐陰', water: '保持盆土微濕', safe: '100% 寵物無害', qiaoyu: '「冷氣房太乾了？這盆銀白色的蕨類能幫你的空間保濕，而且就算本喵不小心撥到葉子也完全安全無毒喵！」' }
    },
    'CG-XD001': {
        id: 'CG-XD001', status: '上架', title: '小豆樹 | 療癒羽葉微景觀', price: 1200, image: 'xiaodou.jpg',
        badge: '療癒新品', categories: ['pet-friendly', 'products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '耐陰室內',
        template: 'pet', url: 'product.html?id=CG-XD001',
        petDetails: { light: '明亮散射光 / 半日照', water: '表土微乾即澆透', safe: '含盆高約 20-25 公分', qiaoyu: '「這棵小豆樹跟本喵一樣作息超規律！太陽下山它的葉子就會合起來睡覺，放在書桌旁陪你工作超療癒喵～」' }
    },
    'CG-SB002': {
        id: 'CG-SB002', status: '既有基準', title: '系魚川真柏 | 職人手作雲朵造型', price: 4500, image: 'shimpaku_main.jpg',
        badge: '一物一拍', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'shimpaku.html',
        tagline: '✦ 貓凝嚴選：葉質細緻，雲朵造型、樹性強健、極耐修剪',
        files: { species: '系魚川真柏', age: '約 8 年', size: '含盆高約 22 公分', pot: '復古朱泥圓盆' }
    },
    'CG-BP001': {
        id: 'CG-BP001', status: '既有基準', title: '黑松 | 扭幹文人風', price: 1800, image: 'black_pine.jpg',
        badge: '職人雕塑', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'black-pine.html',
        tagline: '✦ 貓眼嚴選：蒼勁扭幹文人風，樹皮老態鱗片縱裂，居家窗台首選',
        files: { species: '日本黑松', age: '約 8 年', size: '含盆高約 25 公分', pot: '復古紫砂圓盆' }
    },
    'CG-RM003': {
        id: 'CG-RM003', status: '既有基準', title: '日本紅楓 | 季節色彩首選', price: 1200, image: 'red-maple.jpg',
        badge: '季節限定', categories: ['products-deciduous', 'index', 'new-arrivals'], subCategoryLabel: '桌面山林',
        template: 'bonsai', url: 'red-maple.html',
        tagline: '✦ 貓眼嚴選：春季新芽火紅，適合居家陽台點綴',
        files: { species: '日本紅楓', age: '約 2 年', size: '含盆高約 32 公分', pot: '造型陶盆' }
    },
    'CG-TL001': {
        id: 'CG-TL001', status: '上架', title: '日本製 職人級黑鋼剪定鋏', price: 1880, image: 'tool-1.jpg',
        badge: '修剪工具', categories: ['tools'], subCategoryLabel: '修剪工具',
        template: 'tool', url: 'product.html?id=CG-TL001',
        tagline: '✦ 日本鍛造高碳黑鋼，刀口俐落不傷維管束，切口平整癒合快。'
    },
    'CG-TL002': {
        id: 'CG-TL002', status: '上架', title: '三本線 赤玉土 (極硬質 - 5L)', price: 450, image: 'tool-2.jpg',
        badge: '專業介質', categories: ['tools'], subCategoryLabel: '專業介質',
        template: 'tool', url: 'product.html?id=CG-TL002',
        tagline: '✦ 日本進口三本線極硬質赤玉土，排水透氣極佳、不易崩解粉化，徹底預防爛根。'
    },
    'CG-TL003': {
        id: 'CG-TL003', status: '上架', title: '墨染手作 柴燒粗陶盆', price: 1200, image: 'tool-3.jpg',
        badge: '職人盆器', categories: ['tools'], subCategoryLabel: '職人盆器',
        template: 'tool', url: 'product.html?id=CG-TL003',
        tagline: '✦ 高溫柴燒自然落灰肌理，富含透氣微孔隙，讓植物根系自由呼吸。'
    }
};

window.__CATGAZE_SHEET_PRODUCTS__ = Object.assign({}, DEFAULT_CATALOG_FALLBACK);

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
// 雲端商品同步與子分類篩選引擎
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
    const detailUrl = p.url || `product.html?id=${encodeURIComponent(p.id)}`;
    const priceNum = Number(p.price) || 0;

    const heading = card.querySelector('.product-title, .card-title, h3');
    if (heading && p.title) heading.innerText = p.title;

    const priceEl = card.querySelector('.product-price, .price, .price-tag');
    if (priceEl && priceNum > 0) {
        priceEl.innerText = 'NT$ ' + priceNum.toLocaleString();
    }

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
    const detailUrl = p.url || `product.html?id=${encodeURIComponent(p.id)}`;
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

function parseSheetRowToProduct(cells) {
    const val = (idx) => (cells[idx] && cells[idx].v !== null && cells[idx].v !== undefined) ? String(cells[idx].v).trim() : '';
    const id = val(0);
    const status = val(1);
    const title = val(2);
    const priceRaw = cells[3] && cells[3].v !== null ? Number(String(cells[3].v).replace(/[^0-9.]/g, '')) : 0;
    const image = val(4) || 'CG_logo w bg_vertica_green.png';
    const badge = val(5) || '嚴選上架';

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
        if (colG.includes('pet-friendly') || colG.includes('寵物友善')) categories.push('pet-friendly');
        if (colG.includes('products-deciduous') || colG.includes('辦公室療癒')) categories.push('products-deciduous');
        if (colG.includes('products-mini') || colG.includes('風水招財')) categories.push('products-mini');
        if (colG.includes('products-caudex') || colG.includes('綠手指')) categories.push('products-caudex');
        if (colG.includes('tools') || colG.includes('資材用具')) categories.push('tools');

        subCategoryLabel = colH.includes('｜') ? colH.split('｜')[1].trim() : colH;

        if (colI.includes('首頁')) categories.push('index');
        if (colI.includes('嚴選新品')) categories.push('new-arrivals');

        if (colJ.includes('pet') || colJ.includes('巧遇')) template = 'pet';
        else if (colJ.includes('tool') || colJ.includes('資材')) template = 'tool';
        else template = 'bonsai';

        descOrTagline = val(10);
        spec1 = val(11);
        spec2 = val(12);
        spec3 = val(13);
        spec4 = val(14);
    } else {
        categories = colG.split(',').map(s => s.trim()).filter(Boolean);
        template = colH || 'bonsai';
        descOrTagline = val(8);
        spec1 = val(9);
        spec2 = val(10);
        spec3 = val(11);
        spec4 = val(12);
    }

    const legacyUrlMap = {
        'CG-SB002': 'shimpaku.html',
        'CG-BP001': 'black-pine.html',
        'CG-RM003': 'red-maple.html',
        'CG-LH001': 'luohan-detail.html',
        'CG-FN001': 'fern-detail.html'
    };

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
        url: legacyUrlMap[id] || (`product.html?id=${encodeURIComponent(id)}`),
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
                if (p && p.id) {
                    window.__CATGAZE_SHEET_PRODUCTS__[p.id] = p;
                }
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

// ==========================================================================
// 🐈 AI 巧遇店長：全站懸浮互動選植診斷、養護問答與一鍵加購系統
// ==========================================================================
function injectQiaoyuManagerWidget() {
    const pageKey = getCurrentPageKey();
    if (pageKey === 'admin') return; // 後台不顯示巧遇店長前台氣泡
    if (document.getElementById('qiaoyu-ai-root')) return;

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #qiaoyu-ai-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 1500;
            font-family: 'Noto Sans TC', sans-serif;
        }
        /* 懸浮問候小氣泡 */
        #qiaoyu-teaser-bubble {
            position: absolute;
            bottom: 78px;
            right: 0;
            background: #ffffff;
            color: #4a4a4a;
            border: 1.5px solid #7F916A;
            padding: 10px 30px 10px 14px;
            border-radius: 16px 16px 4px 16px;
            box-shadow: 0 8px 25px rgba(127, 145, 106, 0.22);
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            transition: 0.3s;
            animation: qiaoyuFloat 3s ease-in-out infinite;
        }
        #qiaoyu-teaser-bubble:hover { transform: translateY(-3px); }
        #qiaoyu-teaser-close {
            position: absolute;
            top: 4px;
            right: 8px;
            border: none;
            background: none;
            color: #aaa;
            font-size: 0.78rem;
            cursor: pointer;
            padding: 2px;
        }
        @keyframes qiaoyuFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        /* 右下角巧遇店長圓形懸浮鈕 */
        #qiaoyu-fab-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7F916A 0%, #5d7065 100%);
            border: 3px solid #FDFAD9;
            box-shadow: 0 8px 24px rgba(93, 112, 101, 0.38);
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            padding: 0;
            overflow: visible;
        }
        #qiaoyu-fab-btn:hover {
            transform: scale(1.07);
            box-shadow: 0 12px 30px rgba(93, 112, 101, 0.48);
        }
        #qiaoyu-fab-avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            display: block;
        }
        .qiaoyu-online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background: #2ecc71;
            border: 2px solid #ffffff;
            border-radius: 50%;
        }

        /* 巧遇店長聊天室主視窗 */
        #qiaoyu-chat-window {
            display: none;
            position: fixed;
            bottom: 98px;
            right: 24px;
            width: 375px;
            max-width: calc(100vw - 32px);
            height: 550px;
            max-height: calc(100vh - 130px);
            background: #fcfcf8;
            border-radius: 20px;
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
            border: 1px solid #e2e8dd;
            flex-direction: column;
            overflow: hidden;
            z-index: 1501;
        }
        #qiaoyu-chat-window.open {
            display: flex;
            animation: qiaoyuPopIn 0.25s ease-out;
        }
        @keyframes qiaoyuPopIn {
            from { opacity: 0; transform: translateY(15px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .qiaoyu-chat-header {
            background: linear-gradient(135deg, #7F916A 0%, #5d7065 100%);
            color: white;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .qiaoyu-header-info {
            display: flex;
            align-items: center;
            gap: 11px;
        }
        .qiaoyu-header-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 2px solid #FDFAD9;
            object-fit: cover;
            background: #FDFAD9;
        }
        .qiaoyu-header-title {
            font-weight: 700;
            font-size: 1rem;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .qiaoyu-header-sub {
            font-size: 0.74rem;
            color: #FDFAD9;
            opacity: 0.92;
        }
        .qiaoyu-close-btn {
            background: rgba(255,255,255,0.18);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qiaoyu-close-btn:hover { background: rgba(255,255,255,0.3); }

        /* 訊息捲動區 */
        #qiaoyu-messages-box {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .q-msg-row {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        .q-msg-row.user {
            flex-direction: row-reverse;
        }
        .q-msg-avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #7F916A;
            flex-shrink: 0;
            background: #FDFAD9;
        }
        .q-msg-bubble {
            max-width: 82%;
            padding: 11px 14px;
            border-radius: 15px;
            font-size: 0.88rem;
            line-height: 1.55;
            word-break: break-word;
        }
        .q-msg-row.bot .q-msg-bubble {
            background: #ffffff;
            color: #444;
            border: 1px solid #e6ece0;
            border-top-left-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .q-msg-row.user .q-msg-bubble {
            background: #7F916A;
            color: #ffffff;
            border-top-right-radius: 4px;
        }

        /* 對話內嵌推薦植物卡片 */
        .q-rec-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
        }
        .q-rec-card {
            display: flex;
            gap: 10px;
            background: #f9fbf7;
            border: 1px solid #dce5d5;
            border-radius: 10px;
            padding: 8px;
            align-items: center;
        }
        .q-rec-img {
            width: 54px;
            height: 54px;
            border-radius: 8px;
            object-fit: cover;
            background: #eee;
            flex-shrink: 0;
        }
        .q-rec-info {
            flex: 1;
            min-width: 0;
        }
        .q-rec-title {
            font-weight: 700;
            font-size: 0.84rem;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .q-rec-price {
            color: #d14900;
            font-weight: 700;
            font-size: 0.82rem;
            margin-top: 2px;
        }
        .q-rec-actions {
            display: flex;
            gap: 5px;
            margin-top: 4px;
        }
        .q-rec-btn-view {
            text-decoration: none;
            background: white;
            color: #7F916A;
            border: 1px solid #7F916A;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.74rem;
            font-weight: 700;
        }
        .q-rec-btn-buy {
            background: #7F916A;
            color: white;
            border: none;
            padding: 2px 9px;
            border-radius: 12px;
            font-size: 0.74rem;
            font-weight: 700;
            cursor: pointer;
        }

        /* 快捷問題膠囊區 */
        .qiaoyu-quick-chips {
            padding: 8px 12px;
            background: #f4f7f1;
            border-top: 1px solid #e6ece0;
            display: flex;
            gap: 6px;
            overflow-x: auto;
            white-space: nowrap;
            scrollbar-width: thin;
        }
        .q-chip-btn {
            background: #ffffff;
            color: #5a6b47;
            border: 1px solid #cdd9c5;
            padding: 5px 11px;
            border-radius: 16px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .q-chip-btn:hover {
            background: #7F916A;
            color: #ffffff;
            border-color: #7F916A;
        }

        /* 底部輸入框 */
        .qiaoyu-input-area {
            display: flex;
            gap: 8px;
            padding: 10px 12px;
            background: #ffffff;
            border-top: 1px solid #eeeeee;
            align-items: center;
        }
        #qiaoyu-user-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 0.88rem;
            outline: none;
            font-family: inherit;
        }
        #qiaoyu-user-input:focus { border-color: #7F916A; }
        .qiaoyu-send-btn {
            background: #7F916A;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
        }
        .qiaoyu-send-btn:hover { background: #5d7065; }
    `;
    document.head.appendChild(styleEl);

    const fallbackSvgAvatar = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#FDFAD9"/><path d="M25 38 L32 16 L45 30 Q50 28 55 30 L68 16 L75 38 Q82 50 78 66 Q70 82 50 82 Q30 82 22 66 Q18 50 25 38 Z" fill="#7F916A"/><circle cx="38" cy="52" r="5" fill="#FDFAD9"/><circle cx="62" cy="52" r="5" fill="#FDFAD9"/><polygon points="46,60 54,60 50,65" fill="#ffb6b9"/><path d="M42 68 Q50 73 58 68" stroke="#FDFAD9" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`);

    const widgetRoot = document.createElement('div');
    widgetRoot.id = 'qiaoyu-ai-root';
    widgetRoot.innerHTML = `
        <div id="qiaoyu-teaser-bubble" onclick="window.toggleQiaoyuChat(true)">
            🐾 喵～不知道挑哪盆？問本喵店長！
            <button id="qiaoyu-teaser-close" onclick="event.stopPropagation(); document.getElementById('qiaoyu-teaser-bubble').style.display='none';">✕</button>
        </div>

        <button id="qiaoyu-fab-btn" onclick="window.toggleQiaoyuChat()" title="呼叫 AI 巧遇店長">
            <img id="qiaoyu-fab-avatar" src="qiaoyu.jpg" alt="巧遇店長" onerror="this.onerror=null; this.src='${fallbackSvgAvatar}';">
            <span class="qiaoyu-online-dot"></span>
        </button>

        <div id="qiaoyu-chat-window">
            <div class="qiaoyu-chat-header">
                <div class="qiaoyu-header-info">
                    <img class="qiaoyu-header-avatar" src="qiaoyu.jpg" alt="巧遇店長" onerror="this.onerror=null; this.src='${fallbackSvgAvatar}';">
                    <div>
                        <div class="qiaoyu-header-title">🐈 AI 巧遇店長</div>
                        <div class="qiaoyu-header-sub">Cat Gaze 首席選植＆養護顧問（打呼嚕營業中）</div>
                    </div>
                </div>
                <button class="qiaoyu-close-btn" onclick="window.toggleQiaoyuChat(false)">✕</button>
            </div>

            <div id="qiaoyu-messages-box"></div>

            <div class="qiaoyu-quick-chips">
                <button class="q-chip-btn" onclick="window.askQiaoyu('🐱 家有養貓推薦哪盆？')">🐱 家有養貓推薦</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('💻 辦公桌與室內耐陰推薦')">💻 辦公桌耐陰</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('🌲 陽台喜光松柏盆景推薦')">🌲 職人松柏盆景</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('💧 怎麼判斷植物該澆水了？')">💧 澆水判斷法</button>
                <button class="q-chip-btn" onclick="window.askQiaoyu('🪴 赤玉土跟修剪工具推薦')">🪴 介質與工具</button>
            </div>

            <form class="qiaoyu-input-area" onsubmit="window.submitQiaoyuInput(event)">
                <input type="text" id="qiaoyu-user-input" placeholder="問問巧遇店長（例：養貓推薦、預算1500、怎麼澆水）..." autocomplete="off">
                <button type="submit" class="qiaoyu-send-btn">傳送</button>
            </form>
        </div>
    `;
    document.body.appendChild(widgetRoot);

    window.__QIAOYU_FALLBACK_AVATAR__ = fallbackSvgAvatar;

    // 初始歡迎詞
    appendQiaoyuBotMessage(
        `喵嗚～歡迎光臨 <strong>Cat Gaze</strong>！我是這裡的一日店長「<strong>巧遇</strong>」🐾<br><br>想找<strong>對貓咪 100% 無毒的安全植物</strong>、<strong>辦公桌療癒小品</strong>，還是想問<strong>盆景怎麼澆水換土</strong>？直接點下方按鈕或打字問本喵就可以囉！`,
        []
    );
}

window.toggleQiaoyuChat = function(forceOpen) {
    const win = document.getElementById('qiaoyu-chat-window');
    const teaser = document.getElementById('qiaoyu-teaser-bubble');
    if (!win) return;
    const isOpen = forceOpen !== undefined ? forceOpen : !win.classList.contains('open');
    if (isOpen) {
        win.classList.add('open');
        if (teaser) teaser.style.display = 'none';
        setTimeout(() => {
            const inp = document.getElementById('qiaoyu-user-input');
            if (inp) inp.focus();
        }, 150);
    } else {
        win.classList.remove('open');
    }
};

function appendQiaoyuUserMessage(text) {
    const box = document.getElementById('qiaoyu-messages-box');
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'q-msg-row user';
    div.innerHTML = `<div class="q-msg-bubble">${text.replace(/</g, '&lt;')}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function appendQiaoyuBotMessage(htmlText, recommendedProducts) {
    const box = document.getElementById('qiaoyu-messages-box');
    if (!box) return;
    const fallbackAvatar = window.__QIAOYU_FALLBACK_AVATAR__ || '';

    let cardsHtml = '';
    if (Array.isArray(recommendedProducts) && recommendedProducts.length > 0) {
        cardsHtml = `<div class="q-rec-list">` + recommendedProducts.map(p => {
            const priceNum = Number(p.price) || 0;
            const safeTitle = (p.title || '').replace(/'/g, "\\'");
            const safeImg = (p.image || '').replace(/'/g, "\\'");
            const linkUrl = p.url || (`product.html?id=${encodeURIComponent(p.id)}`);
            return `
            <div class="q-rec-card">
                <img class="q-rec-img" src="${p.image}" alt="${p.title}" onerror="this.onerror=null; this.src='CG_logo w bg_vertica_green.png';">
                <div class="q-rec-info">
                    <div class="q-rec-title">${p.title}</div>
                    <div class="q-rec-price">NT$ ${priceNum.toLocaleString()}</div>
                    <div class="q-rec-actions">
                        <a href="${linkUrl}" class="q-rec-btn-view">看詳情</a>
                        <button type="button" class="q-rec-btn-buy" onclick="addToCart('${safeTitle}', ${priceNum}, '${safeImg}')">＋加入購物車</button>
                    </div>
                </div>
            </div>`;
        }).join('') + `</div>`;
    }

    const div = document.createElement('div');
    div.className = 'q-msg-row bot';
    div.innerHTML = `
        <img class="q-msg-avatar" src="qiaoyu.jpg" alt="巧遇" onerror="this.onerror=null; this.src='${fallbackAvatar}';">
        <div class="q-msg-bubble">
            ${htmlText}
            ${cardsHtml}
        </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function getAllActiveCatalogProducts() {
    const map = Object.assign({}, DEFAULT_CATALOG_FALLBACK, window.__CATGAZE_SHEET_PRODUCTS__ || {});
    return Object.values(map).filter(p => p && p.status !== '下架');
}

function generateQiaoyuResponse(query) {
    const q = query.toLowerCase().trim();
    const allProds = getAllActiveCatalogProducts();

    // 1. 檢查是否詢問預算 (例如: 1500, 2000以內, 預算1000)
    const numMatch = q.match(/(\d{3,5})/);
    if (numMatch && (q.includes('預算') || q.includes('以內') || q.includes('以下') || q.includes('元') || q.includes('塊') || q.includes('便宜'))) {
        const budget = Number(numMatch[1]);
        const within = allProds.filter(p => Number(p.price) > 0 && Number(p.price) <= budget);
        if (within.length > 0) {
            return {
                text: `喵嗚！預算在 <strong>NT$ ${budget.toLocaleString()} 以內</strong> 的話，本喵店長幫你從店裡挑出這 ${within.length} 款高質感好物，可以直接點「＋加入購物車」帶回家喵：`,
                products: within.slice(0, 4)
            };
        }
    }

    // 2. 養貓 / 寵物安全 / 無毒詢問
    if (q.includes('貓') || q.includes('狗') || q.includes('寵物') || q.includes('無毒') || q.includes('安全') || q.includes('毛孩')) {
        if (q.includes('誤食') || q.includes('吃到') || q.includes('中毒') || q.includes('吐')) {
            return {
                text: `⚠️ <strong>本喵店長緊急提醒：</strong><br>如果家裡主子不小心啃食到不明或有毒植物（如黃金葛、虎尾蘭、百合），請<strong>第一時間拍下植物照片，並立刻帶去給獸醫檢查，千萬不要自己催吐</strong>喵！<br><br>想看完整的安全植物清單，可以點此閱讀：<a href="article-pet-safe.html" style="color:#7F916A; font-weight:bold;">《10 種 ASPCA 認證對貓無毒植物指南》</a>，或者挑選本喵親自試聞認證的無毒植栽：`,
                products: allProds.filter(p => (p.categories && p.categories.includes('pet-friendly')) || p.template === 'pet').slice(0, 3)
            };
        }
        const petProds = allProds.filter(p => (p.categories && p.categories.includes('pet-friendly')) || p.template === 'pet');
        return {
            text: `身為專業貓店長，這題問本喵最準喵！🐾<br>以下這幾盆都是經過 <strong>ASPCA 認證 100% 對貓狗無毒</strong> 的精選植栽——喜歡陽光窗台首推「<strong>小葉羅漢松</strong>」，室內冷氣房耐陰首推「<strong>銀脈鳳尾蕨</strong>」跟會睡覺的「<strong>小豆樹</strong>」喵：`,
            products: petProds.slice(0, 4)
        };
    }

    // 3. 辦公室 / 室內 / 耐陰 / 桌面 / 新手
    if (q.includes('辦公') || q.includes('室內') || q.includes('耐陰') || q.includes('書桌') || q.includes('冷氣') || q.includes('新手') || q.includes('好養') || q.includes('小豆')) {
        const officeProds = allProds.filter(p =>
            p.id === 'CG-XD001' || p.id === 'CG-FN001' || p.id === 'CG-LH001' ||
            (p.categories && p.categories.includes('products-deciduous'))
        );
        return {
            text: `想放在辦公桌或室內窗邊療癒一下嗎喵？🌿<br>本喵特別推薦夜晚葉片會自己合起來睡覺的「<strong>小豆樹</strong>」、幫冷氣房保濕的「<strong>銀脈鳳尾蕨</strong>」，以及四季常青的「<strong>小葉羅漢松</strong>」，新手也超好照顧喵！`,
            products: officeProds.slice(0, 4)
        };
    }

    // 4. 澆水問題
    if (q.includes('澆水') || q.includes('水') || q.includes('乾透') || q.includes('枯') || q.includes('黃')) {
        return {
            text: `💧 <strong>巧遇店長的「澆水學三年」小筆記：</strong><br>千萬別每天只噴噴葉子或讓盆土一直濕答答喔！植物的根需要呼吸，請記住口訣<strong>「乾透澆透」</strong>：<br>1. <strong>怎麼看乾透？</strong> 觀察赤玉土表層變淺白色，或拿起來感覺盆子明顯變輕。<br>2. <strong>怎麼澆透？</strong> 緩慢澆水直到水從盆底排水孔大量流出來，把舊空氣換成新鮮氧氣！<br><br>📖 推薦閱讀：<a href="article-watering.html" style="color:#7F916A; font-weight:bold;">《乾透澆透：別讓關愛淹沒它的呼吸》</a>`,
            products: allProds.filter(p => p.id === 'CG-TL002' || p.id === 'CG-TL003')
        };
    }

    // 5. 土壤 / 介質 / 換盆 / 工具 / 剪刀
    if (q.includes('土') || q.includes('赤玉') || q.includes('介質') || q.includes('換盆') || q.includes('剪') || q.includes('工具') || q.includes('盆器') || q.includes('資材')) {
        const toolProds = allProds.filter(p => p.template === 'tool' || (p.categories && p.categories.includes('tools')));
        return {
            text: `🪴 <strong>「養樹先養根，工欲善其事必先利其器喵！」</strong><br>• <strong>黃金混土比例</strong>：松柏類建議「赤玉土 70%＋砂石 20%＋腐植土 10%」；雜木與觀葉可提高保水比例（詳見 <a href="article-soil-mix.html" style="color:#7F916A; font-weight:bold;">《萬用土調配全攻略》</a>）。<br>• 以下三款是我們店裡職人最愛用的日本三本線極硬質赤玉土、黑鋼剪定鋏與手作柴燒盆：`,
            products: toolProds
        };
    }

    // 6. 松柏 / 真柏 / 黑松 / 紅楓 / 陽台 / 摘芽
    if (q.includes('松') || q.includes('柏') || q.includes('楓') || q.includes('陽台') || q.includes('摘芽') || q.includes('盆景')) {
        const bonsaiProds = allProds.filter(p => p.id === 'CG-SB002' || p.id === 'CG-BP001' || p.id === 'CG-RM003' || p.template === 'bonsai');
        return {
            text: `🌲 眼光真好喵！如果你家有通風明亮的陽台或窗台，職人耗時數年雕塑的<strong>系魚川真柏</strong>、蒼勁文人風的<strong>日本黑松</strong>，以及四季變色的<strong>日本紅楓</strong>都是「一樹一拍、僅此一盆」的收藏級作品喵：`,
            products: bonsaiProds.slice(0, 4)
        };
    }

    // 7. 風水 / 招財 / 送禮 / 開幕
    if (q.includes('風水') || q.includes('招財') || q.includes('桃花') || q.includes('送禮') || q.includes('開幕') || q.includes('喬遷')) {
        const giftProds = allProds.filter(p => p.id === 'CG-LH001' || p.id === 'CG-SB002' || (p.categories && p.categories.includes('products-mini')));
        return {
            text: `🎁 想挑新居落成、開幕送禮或居家招財開運植栽嗎喵？<br>傳統象徵長壽守財又對寵物無毒的「<strong>小葉羅漢松</strong>」、氣勢沉穩的「<strong>系魚川真柏</strong>」，或是前往 <a href="products-mini.html" style="color:#7F916A; font-weight:bold;">【風水招財、桃花類專區】</a> 挑選斑葉龜背芋都非常體面喵！`,
            products: giftProds.slice(0, 3)
        };
    }

    // 8. 預設萬用回答 (展示人氣推薦＋客服引導)
    return {
        text: `喵嗚～本喵收到你的問題了！🐾<br>你可以試著問我：<strong>「養貓推薦哪盆？」、「辦公桌耐陰植物」、「預算 1500 以內」或「怎麼澆水？」</strong>。<br><br>以下這幾盆是本喵店長本週最推薦的人氣精選，你也可以點 <a href="contact.html" style="color:#7F916A; font-weight:bold;">【聯繫我們】</a> 找人類店長 Henry 替你一對一解答喵：`,
        products: allProds.slice(0, 3)
    };
}

window.askQiaoyu = function(questionText) {
    if (!questionText) return;
    window.toggleQiaoyuChat(true);
    appendQiaoyuUserMessage(questionText);
    setTimeout(() => {
        const reply = generateQiaoyuResponse(questionText);
        appendQiaoyuBotMessage(reply.text, reply.products);
    }, 260);
};

window.submitQiaoyuInput = function(e) {
    e.preventDefault();
    const inp = document.getElementById('qiaoyu-user-input');
    if (!inp || !inp.value.trim()) return;
    const text = inp.value.trim();
    inp.value = '';
    window.askQiaoyu(text);
};

// ==========================================================================
// 全站自動 SEO 結構化資料 (JSON-LD Schema) 注入器
// ==========================================================================
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
    injectQiaoyuManagerWidget();
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