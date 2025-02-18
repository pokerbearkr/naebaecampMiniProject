import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
const urlParams = new URLSearchParams(window.location.search);
const docId = urlParams.get('id');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// id 값에 맞는 맴버 정보, 세부 페이지 사용
export async function getMember_detail(docId) {
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
export async function getMember() {
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
                            <p class="card-text">${leader.goal}</p>
                            <p class="card-text"><small class="text-body-secondary">${leader.blog}</small></p>
                        </div>
                    </div>
                </div>
            </div>`
            console.log(leader_html);
            $("#left_side").append(leader_html);

            //console.log("팀장 데이터:", data);  // 테이터 출력 확인 완료
        });

        // 팀원 쿼리 실행
        const q_member = query(collection(db, "member"), where("position", "==", "팀원"));
        const querySnapshot_member = await getDocs(q_member);

        querySnapshot_member.forEach((doc) => {
            let member = doc.data();
            console.log(member);

            if (C_div) {

                let member_html = `
                    <div class="card mb-3" style="max-width: 80%;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <a href= "detail.html?id=${doc.id}"><img src="${member.image}" class="img-fluid rounded-start" alt="${member.image}"></a>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${member.name}</h5>
                            <p class="card-text">${member.goal}</p>
                            <p class="card-text"><small class="text-body-secondary">${member.blog}</small></p>
                        </div>
                    </div>
                </div>
            </div>`
                $("#right_side").append(member_html);

                console.log("2");
                C_div = false;
            } else {

                let member_html = `
                    <div class="card mb-3" style="max-width: 80%;">
                <div class="row g-0">
                    <div class="col-md-4">
                        <a href= "detail.html?id=${doc.id}"><img src="${member.image}" class="img-fluid rounded-start" alt="${member.image}"></a>
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${member.name}</h5>
                            <p class="card-text">${member.goal}</p>
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