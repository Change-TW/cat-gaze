// Firebase 配置
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

// 初始化 Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let cart = JSON.parse(localStorage.getItem('CatGazeCart')) || [];

function getUserKey() {
    const profile = JSON.parse(localStorage.getItem('CatGazeProfile'));
    return profile && profile.email ? profile.email.replace(/\./g, '_') : null;
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

function addToFavorites(pName, pPrice, pImage) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("請先登入會員才能收藏植物喔！");
        window.location.href = "member.html";
        return;
    }

    const favData = {
        name: pName,
        price: pPrice,
        image: pImage,
        addedAt: firebase.database.ServerValue.TIMESTAMP
    };

    // 使用植物名稱作為 Key (或隨機 ID)
    const favKey = pName.replace(/\s/g, '_'); 
    
    firebase.database().ref('favorites/' + user.uid + '/' + favKey).set(favData)
        .then(() => alert("✨ 已加入收藏清單"))
        .catch(err => alert("收藏失敗"));
}
function updateCount() {
    const countEl = document.getElementById('cart-count');
    if(countEl) countEl.innerText = cart.length;
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
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #f9f9f9; padding-bottom:10px;">
                <div>
                    <div style="font-weight:bold; color:#4a4a4a;">${item.name}</div>
                    <div style="color:#d14900; font-size:0.9rem;">NT$ ${item.price.toLocaleString()}</div>
                </div>
                <button onclick="removeItem(${index})" style="color:red; background:none; border:none; cursor:pointer;">移除</button>
            </div>`;
        sum += item.price;
    });
    list.innerHTML = html;
    total.innerText = `NT$ ${sum.toLocaleString()}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('CatGazeCart', JSON.stringify(cart));
    const userKey = getUserKey();
    if (userKey) database.ref('carts/' + userKey).set(cart);
    renderCart();
    updateCount();
}

function checkoutToLine() {
    if (cart.length === 0) return alert("清單是空的喔！");
    const userKey = getUserKey();
    const profile = JSON.parse(localStorage.getItem('CatGazeProfile'));

    if (!userKey || !profile) {
        alert("下單前請先至【👤 會員】填寫聯繫資料！");
        window.location.href = "member.html";
        return;
    }

    const orderId = "ORD-" + Date.now();
    const orderData = {
        order_id: orderId,
        customer: profile,
        items: cart,
        total_price: cart.reduce((sum, item) => sum + item.price, 0),
        status: "待處理",
        created_at: new Date().toLocaleString()
    };

    database.ref('orders/' + orderId).set(orderData)
        .then(() => database.ref('carts/' + userKey).remove())
        .then(() => {
            cart = [];
            localStorage.setItem('CatGazeCart', JSON.stringify(cart));
            updateCount();
            renderCart();
            alert("✨ 訂單已傳送到雲端！編號：" + orderId);
            toggleCart();
        })
        .catch(err => alert("傳送失敗"));
}

window.addEventListener('load', function() {
    updateCount();
    const userKey = getUserKey();
    if (userKey) {
        database.ref('carts/' + userKey).once('value', (snapshot) => {
            const cloudCart = snapshot.val();
            if (cloudCart) {
                cart = cloudCart;
                localStorage.setItem('CatGazeCart', JSON.stringify(cart));
                updateCount();
            }
        });
    }
});