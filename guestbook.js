import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, addDoc, deleteDoc, doc }
    from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyAOByWDp2SIqFeADum8YvTLW1EozAwatbQ",
    authDomain: "pal-saek-jo.firebaseapp.com",
    projectId: "pal-saek-jo",
    storageBucket: "pal-saek-jo.firebasestorage.app",
    messagingSenderId: "450087269528",
    appId: "1:450087269528:web:379a99549504de9df38ced",
    measurementId: "G-5ZG46Y1DX5"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const pageSize = 5;
let lastVisibleDocs = [];
let currentPage = 1;
let totalPages = 0;


async function getTotalGuestbookCount() {
    const snapshot = await getDocs(query(collection(db, "guestbooks")));
    totalPages = Math.ceil(snapshot.size / pageSize);
    console.log(`📌 총 페이지 수: ${totalPages}`);

    if (totalPages > 0) {
        await preloadPageReferences();
        await loadGuestbook(1);
    } else {
        console.log("🚨 방명록에 데이터가 없습니다.");
        $("#pagination").empty();
    }
}


async function preloadPageReferences() {
    lastVisibleDocs = [];
    let q = query(collection(db, "guestbooks"), orderBy("date", "desc"), limit(pageSize));

    try {
        let querySnapshot = await getDocs(q);
        let index = 0;

        while (!querySnapshot.empty) {
            lastVisibleDocs[index] = querySnapshot.docs[querySnapshot.docs.length - 1];
            console.log(`📌 Firestore에서 페이지 ${index + 1} 기준점 저장:`, lastVisibleDocs[index]?.id || "없음");

            q = query(collection(db, "guestbooks"), orderBy("date", "desc"), startAfter(lastVisibleDocs[index]), limit(pageSize));
            querySnapshot = await getDocs(q);
            index++;
        }
    } catch (error) {
        console.error("🚨 Firestore 기준점 로딩 실패:", error);
    }
}


function renderPaginationButtons() {
    $("#pagination").empty();
    let maxPagesToShow = 5; // ✅ 한 번에 표시할 최대 페이지 수

    let startPage = Math.floor((currentPage - 1) / maxPagesToShow) * maxPagesToShow + 1;
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    // ✅ "이전" 버튼 추가 (현재 페이지가 6 이상일 경우)
    if (startPage > 1) {
        $("#pagination").append(`<button id="prevPage" class="btn btn-primary mx-1">이전</button>`);
    }

    // ✅ 페이지 번호 버튼 추가 (1~5 또는 이후 6~10)
    for (let i = startPage; i <= endPage; i++) {
        let classInfo = '"page-btn btn mx-1';
        if (i === currentPage) {
            classInfo += ' btn-primary"';
        } else {
            classInfo += ' btn-outline-primary"';
        }

        $("#pagination").append(`<button class=${classInfo} data-page="${i}">${i}</button>`);
    }

    // ✅ "다음" 버튼 추가 (현재 표시된 페이지가 마지막이 아닐 경우)
    if (endPage < totalPages) {
        $("#pagination").append(`<button id="nextPage" class="btn btn-primary mx-1">다음</button>`);
    }

    $(".page-btn").click(async function () {
        let page = parseInt($(this).attr("data-page"));
        await loadGuestbook(page);
    });

    // ✅ "다음" 버튼 클릭 시 다음 5개 페이지 표시
    $("#nextPage").click(async function () {
        let nextStartPage = endPage + 1;
        let nextEndPage = Math.min(nextStartPage + maxPagesToShow - 1, totalPages);

        if (nextStartPage <= totalPages) {
            currentPage = nextStartPage;
            await loadGuestbook(currentPage);
            renderPaginationButtons();
        }
    });

    // ✅ "이전" 버튼 클릭 시 이전 5개 페이지 표시
    $("#prevPage").click(async function () {
        let prevStartPage = Math.max(1, startPage - maxPagesToShow);
        let prevEndPage = prevStartPage + maxPagesToShow - 1;

        if (prevStartPage >= 1) {
            currentPage = prevEndPage;
            await loadGuestbook(currentPage);
            renderPaginationButtons();
        }
    });
}




export async function loadGuestbook(page) {
    $("#makeguestbook").empty();
    currentPage = page;

    let q;
    if (page === 1) {
        q = query(collection(db, "guestbooks"), orderBy("date", "desc"), limit(pageSize));
    } else {
        if (lastVisibleDocs.length >= page - 1) {
            console.log(`📌 페이지 ${page} 로드, 기준점: ${lastVisibleDocs[page - 2]?.id || "없음"}`);
            q = query(collection(db, "guestbooks"), orderBy("date", "desc"), startAfter(lastVisibleDocs[page - 2]), limit(pageSize));
        } else {
            console.error(`🚨 Firestore 오류: 이전 페이지(${page - 1}) 기준점이 없습니다.`);
            return;
        }
    }

    try {
        const querySnapshot = await getDocs(q);
        console.log(`📌 Firestore에서 페이지 ${page} 데이터 개수: ${querySnapshot.size}`);

        if (!querySnapshot.empty) {
            lastVisibleDocs[page - 1] = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        querySnapshot.forEach((doc) => {
            let guestbook = doc.data();
            let date = new Date(guestbook.date.seconds * 1000);
            let formattedContent = guestbook.content.replace(/\n/g, "<br>");

            let temp_html = `<div class="card mb-3" data-id="${doc.id}">
                <div class="card-header d-flex justify-content-between">
                    <span class="fw-bold">${guestbook.title}</span>
                    <button class="delete-button btn btn-danger btn-sm" type="button" data-id="${doc.id}">🗑️</button>
                </div>
                <div class="card-body">
                    <div class="comment-text">${formattedContent}</div>
                    <p class="text-muted" style="text-align:right; margin-bottom: 0;">${date.toLocaleString()}</p>
                </div>
            </div>`;
            $('#makeguestbook').append(temp_html);
        });

        renderPaginationButtons();
    } catch (error) {
        console.error("🚨 Firestore 데이터 로드 실패:", error);
    }
}

export async function postGuestbook() {
    let title = $('#title').val();
    let content = $('#content').val().replace(/\n/g, "<br>");
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

export async function deleteGuestbook() {
    let docId = $(this).attr("data-id"); // 클릭한 버튼(방명록데이터터)의 데이터 ID 가져오기
    console.log("삭제 버튼 클릭")
    if (confirm("방명록을 지우시겠습니까?")) {
        await deleteDoc(doc(db, "guestbooks", docId)); // Firestore에서 삭제
        location.reload();
        alert("방명록이 삭제되었습니다!");
    }
}


$(document).ready(async () => {
    await getTotalGuestbookCount();
});
