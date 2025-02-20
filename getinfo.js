import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAOByWDp2SIqFeADum8YvTLW1EozAwatbQ",
    authDomain: "pal-saek-jo.firebaseapp.com",
    projectId: "pal-saek-jo",
    storageBucket: "pal-saek-jo.firebasestorage.app",
    messagingSenderId: "450087269528",
    appId: "1:450087269528:web:379a99549504de9df38ced",
    measurementId: "G-5ZG46Y1DX5"
};

// 파라미터로 ID 값 전달 필요

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// id 값에 맞는 맴버 정보, 세부 페이지 사용
export async function getDetail(docId) {
    const docRef = doc(db, "member", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        let member = docSnap.data();

        //데이터 불러오기
        let image = member['image'];
        let name = member['name'];
        let introduction = member['introduction'];
        let blog = member['blog'];
        let MBTI = member['MBTI'];
        let style = member['style'];
        let goal = member['goal'];
        let merit = member['merit'];

        let blog_html = `
        <a href="${blog}" target="_blank" rel="noopener noreferrer"
      ><img
              class="logo"
              alt="go to blog"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF7lOSyj2I6filE23x924KqfH_DmKiHgUEdA&s"
      /></a>`

        let img = `<img
              id="profile_img"
              src="${image}"
              alt="profile image"
              width="360"
              height="360"
              style="object-fit: cover;"
      />`

        $("#name_db").text(name);
        $("#info_db").text(introduction);
        $("#1st_item").text(MBTI);
        $("#2nd_item").text(style);
        $("#3rd_item").text(goal);
        $("#4th_item").text(merit);
        $("#member_img").append(img);
        $("#blog_db").append(blog_html);




    } else {
        console.log("해당 문서가 존재하지 않습니다.");
    }

}


// 메인에 사용
export async function getMain() {

    try {
        let C_div = true;

        // 팀장 쿼리 실행
        const q_leader = query(collection(db, "member"), where("position", "==", "팀장"));
        const querySnapshot_leader = await getDocs(q_leader);

        querySnapshot_leader.forEach((doc) => {
            let leader = doc.data();

            let leader_html = `
                    <div class="card mb-3" style="max-width: 80%;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <a href= "detail.html?id=${doc.id}"><img src="${leader.image}" class="img-fluid rounded-start" alt="${leader.image}"></a>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${leader.name}</h5>
                            <p class="card-text">${leader.introduction}</p>
                            <p class="card-text"><small class="text-body-secondary">${leader.blog}</small></p>
                        </div>
                    </div>
                </div>
            </div>`
            $("#left_side").append(leader_html);

        });

        const q_member = query(collection(db, "member"), where("position", "==", "팀원"));
        const querySnapshot_member = await getDocs(q_member);

        querySnapshot_member.forEach((doc) => {
            let member = doc.data();

            if (C_div) {

                let member_html = `
                    <div class="card mb-3" style="max-width: 80%;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <a href= "detail.html?id=${doc.id}"><img src="${member.image}" class="img-fluid rounded-start" style="width: 100%; height: 200px; object-fit: cover;" alt="${member.image}"></a>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${member.name}</h5>
                            <p class="card-text">${member.introduction}</p>
                            <p class="card-text"><small class="text-body-secondary">${member.blog}</small></p>
                        </div>
                    </div>
                </div>
            </div>`
                $("#right_side").append(member_html);
                C_div = false;
            } else {

                let member_html = `
                    <div class="card mb-3" style="max-width: 80%;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <a href= "detail.html?id=${doc.id}"><img src="${member.image}" class="img-fluid rounded-start" style="width: 100%; height: 200px; object-fit: cover;" alt="${member.image}"></a>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${member.name}</h5>
                            <p class="card-text">${member.introduction}</p>
                            <p class="card-text"><small class="text-body-secondary">${member.blog}</small></p>
                        </div>
                    </div>
                </div>
            </div>`
                $("#left_side").append(member_html);


                C_div = true;
            }
        });
    } catch (error) {
        console.error("Firestore 데이터 로딩 중 오류 발생:", error);
    }
}

export async function getGuestbook() {
    
    $("#postbtn").click(async function () {
        let title = $('#title').val();
        let content = $('#content').val();
        let currentDate = new Date();

        let doc = {
            'title': title,
            'content': content,
            'date': currentDate,
        };
        await addDoc(collection(db, "guestbooks"), doc);
        alert('방명록 작성 완료!')
        window.location.reload();
    })

    $(document).on("click", ".delete-button", async function () {
        let docId = $(this).attr("data-id"); // 클릭한 버튼(방명록데이터터)의 데이터 ID 가져오기

        if (confirm("방명록을 지우시겠습니까?")) {
            await deleteDoc(doc(db, "guestbooks", docId)); // Firestore에서 삭제
            $(`div[data-id='${docId}']`).remove(); // 화면에서 삭제
            alert("방명록이 삭제되었습니다!");
        }
    });

    try {

        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

        const q_guestbooks = query(collection(db, "guestbooks"), orderBy("date", "desc"));
        const querySnapshot_guestbooks = await getDocs(q_guestbooks);

        querySnapshot_guestbooks.forEach((doc) => {
            let guestbooks = doc.data();

            let date = guestbooks['date'];

            let date_temp1 = date.seconds * 1000 + Math.floor(date.nanoseconds / 1000000);
            let date_temp2 = new Date(date_temp1);
            console.log(date);

            let temp_html = `<div class="card mb-3" data-id="${doc.id}">
      <div class="card-header d-flex justify-content-between">
        <span class="fw-bold">${guestbooks.title}</span>
        <button class="delete-button" type="button" data-id="${doc.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                class="bi bi-x-square" viewBox="0 0 16 16">
                                <path
                                    d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                <path
                                    d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
         </button>
      </div>
      <div class="card-body">
        <p class="card-text">${guestbooks.content}</p>
        <p><small style = "float: right;" class="text-muted">${new Intl.DateTimeFormat('ko-KR', options).format(date_temp2)}</small><p>
      </div>
    </div>`;

            $('#makeguestbook').append(temp_html);
        });


    } catch (error) {
        console.error("Firestore 데이터 로딩 중 오류 발생:", error);
    }

}