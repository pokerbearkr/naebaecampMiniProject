import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, addDoc, deleteDoc, doc }
    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyAOByWDp2SIqFeADum8YvTLW1EozAwatbQ",
    authDomain: "pal-saek-jo.firebaseapp.com",
    projectId: "pal-saek-jo",
    storageBucket: "pal-saek-jo.firebasestorage.app",
    messagingSenderId: "450087269528",
    appId: "1:450087269528:web:379a99549504de9df38ced",
    measurementId: "G-5ZG46Y1DX5"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pageSize = 5;  // ✅ 한 페이지에 표시할 개수를 5개로 고정
let lastVisibleDocs = {};
let currentPage = 1;
let totalPages = 0;

// **🔥 Firestore에서 전체 방명록 개수 가져오기**
async function getTotalGuestbookCount() {
    const snapshot = await getDocs(collection(db, "guestbooks"));
    totalPages = Math.ceil(snapshot.size / pageSize);
    console.log(`총 페이지 수: ${totalPages}`);

    if (totalPages > 0) {
        await loadGuestbook(1); // ✅ 첫 번째 페이지 5개만 로드
    } else {
        console.log("방명록에 데이터가 없습니다.");
        $("#pagination").empty(); // ✅ 데이터가 없으면 페이지네이션 버튼 제거
    }
}

// **🔥 페이지네이션 버튼 생성**
function renderPaginationButtons() {
    $("#pagination").empty();

    if (totalPages <= 1) return; // ✅ 1페이지 이하일 경우 버튼 안 보이게 처리

    for (let i = 1; i <= totalPages; i++) {
        let button = `<button class="page-btn btn btn-outline-primary mx-1" data-page="${i}">${i}</button>`;
        $("#pagination").append(button);
    }

    // ✅ "다음" 버튼 추가 (현재 페이지가 마지막 페이지가 아닐 경우)
    if (currentPage < totalPages) {
        $("#pagination").append(`<button id="nextPage" class="btn btn-primary mx-1">다음</button>`);
    }

    $(".page-btn").click(function () {
        let page = parseInt($(this).attr("data-page"));
        loadGuestbook(page);
    });

    $("#nextPage").click(() => {
        if (currentPage < totalPages) {
            loadGuestbook(currentPage + 1);
        }
    });
}

// **🔥 특정 페이지 방명록 불러오기 (5개씩 제한)**
export async function loadGuestbook(page) {
    $("#makeguestbook").empty();
    currentPage = page;

    let q;
    if (page === 1) {
        q = query(collection(db, "guestbooks"), orderBy("date", "desc"), limit(pageSize)); // ✅ `limit(5)` 보장
    } else {
        if (lastVisibleDocs[page - 1]) {
            q = query(collection(db, "guestbooks"), orderBy("date", "desc"), startAfter(lastVisibleDocs[page - 1]), limit(pageSize));
        } else {
            console.error("이전 페이지 데이터가 없습니다.");
            return;
        }
    }

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        lastVisibleDocs[page] = querySnapshot.docs[querySnapshot.docs.length - 1]; // ✅ 마지막 문서 저장
    }

    querySnapshot.forEach((doc) => {
        let guestbook = doc.data();
        let date = new Date(guestbook.date.seconds * 1000);

        let temp_html = `<div class="card mb-3" data-id="${doc.id}">
            <div class="card-header d-flex justify-content-between">
                <span class="fw-bold">${guestbook.title}</span>
                <button class="delete-button btn btn-danger btn-sm" type="button" data-id="${doc.id}">🗑️</button>
            </div>
            <div class="card-body">
                <p class="card-text">${guestbook.content}</p>
                <p class="text-muted" style="text-align:right;">${date.toLocaleString()}</p>
            </div>
        </div>`;
        $('#makeguestbook').append(temp_html);
    });

    renderPaginationButtons();
}

// **🔥 방명록 작성**
export async function postGuestbook() {
    let title = $('#title').val();
    let content = $('#content').val();
    let currentDate = new Date();

    if (!title || !content) {
        alert("이름과 내용을 입력하세요!");
        return;
    }

    let docData = {
        title: title,
        content: content,
        date: currentDate
    };

    await addDoc(collection(db, "guestbooks"), docData);
    alert('방명록이 등록되었습니다!');
    location.reload();
}

// **🔥 방명록 삭제**
$(document).on("click", ".delete-button", async function () {
    let docId = $(this).attr("data-id");

    if (confirm("정말 삭제하시겠습니까?")) {
        await deleteDoc(doc(db, "guestbooks", docId));
        alert("방명록이 삭제되었습니다!");
        location.reload();
    }
});

// 🔹 페이지 로딩 시 전체 방명록 개수를 먼저 가져옴 (완료되면 `loadGuestbook(1)` 실행)
$(document).ready(async () => {
    await getTotalGuestbookCount();
});
