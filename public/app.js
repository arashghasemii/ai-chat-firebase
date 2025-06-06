const firebaseConfig = {
    apiKey: "AIzaSyCkkBnlaot79O0f2V2l7mDRd-A6QJaWwTU",
    authDomain: "happy-trainers-ebe2e.firebaseapp.com",
    projectId: "happy-trainers-ebe2e",
    storageBucket: "happy-trainers-ebe2e.firebasestorage.app",
    messagingSenderId: "169065676264",
    appId: "1:169065676264:web:ed484f09d93034c7d5f85d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let user = null;
let lang = 'fa';

const texts = {
    fa: {
        title: "چت با هوش مصنوعی",
        login: "ورود با گوگل",
        placeholder: "پیامت را بنویس...",
        send: "ارسال پیام",
        typing: "🤖 در حال پاسخ‌گویی..."
    },
    en: {
        title: "Chat with AI",
        login: "Login with Google",
        placeholder: "Type your message...",
        send: "Send Message",
        typing: "🤖 Typing..."
    }
};

function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.getElementById('lang-btn').innerText = lang === 'fa' ? 'EN' : 'FA';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = texts[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = texts[lang][key];
    });
}

function switchLang() {
    lang = lang === 'fa' ? 'en' : 'fa';
    applyLang();
}

applyLang();

auth.getRedirectResult().then(result => {
    if (result.user) {
        user = result.user;
        showChat();
        loadMessages();
    }
});

auth.onAuthStateChanged(u => {
    if (u) {
        user = u;
        showChat();
        loadMessages();
    } else {
        showLogin();
    }
});

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        auth.signInWithRedirect(provider);
    } else {
        auth.signInWithPopup(provider)
            .then(() => {
                user = auth.currentUser;
                showChat();
                loadMessages();
            })
            .catch(err => {
                console.error("خطا در ورود:", err.message);
            });
    }
}

function showChat() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("chat-section").style.display = "block";
}

function showLogin() {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("chat-section").style.display = "none";
}

function sendMessage() {
    const text = document.getElementById("msg").value.trim();
    if (!user || !text) return;

    const container = document.getElementById("messages");
    const userWrapper = createBubble(text, 'user');
    const typingWrapper = createTyping();

    container.appendChild(userWrapper);
    container.appendChild(typingWrapper);
    scrollToBottom(container);

    document.getElementById("msg").value = "";

    fetch("https://mocki.io/v1/d545a345-4552-42db-a685-b88c63a54235")
        .then(res => res.json())
        .then(mockData => {
            db.collection("user_messages").add({
                user_id: user.uid,
                message_text: text,
                response_text: mockData.response_text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                loadMessages();
            });
        });
}

// فعال‌سازی ارسال با Enter برای input
document.addEventListener("DOMContentLoaded", () => {
    const msgInput = document.getElementById("msg");
    msgInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
});

function loadMessages() {
    db.collection("user_messages")
        .where("user_id", "==", user.uid)
        .orderBy("timestamp", "asc")
        .get()
        .then(snap => {
            const container = document.getElementById("messages");
            container.innerHTML = "";
            snap.forEach(doc => {
                const d = doc.data();
                const userWrapper = createBubble(d.message_text, 'user');
                const aiWrapper = createBubble(d.response_text, 'ai');
                container.appendChild(userWrapper);
                container.appendChild(aiWrapper);
            });
            scrollToBottom(container);
        });
}

function createBubble(text, role) {
    const wrapper = document.createElement("div");
    const bubble = document.createElement("div");

    const langSuffix = lang === 'fa' ? 'fa' : 'en';
    wrapper.className = `bubble-wrapper ${role}-${langSuffix}`;
    bubble.className = `chat-bubble ${role === 'user' ? 'from-user' : 'from-ai'}`;
    bubble.innerText = text;

    wrapper.appendChild(bubble);
    return wrapper;
}


function createTyping() {
    const wrapper = document.createElement("div");
    const typing = document.createElement("div");

    const langSuffix = lang === 'fa' ? 'fa' : 'en';
    wrapper.className = `bubble-wrapper ai-${langSuffix}`;
    typing.className = "typing";
    typing.innerText = texts[lang].typing;

    wrapper.appendChild(typing);
    return wrapper;
}


function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}
