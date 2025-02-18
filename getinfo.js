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

        // 데이터 처리

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
            let data = doc.data();
            
            
            //데이터 처리
        });

        // 팀원 쿼리 실행
        const q_member = query(collection(db, "member"), where("position", "==", "팀원"));
        const querySnapshot_member = await getDocs(q_member);

        querySnapshot_member.forEach((doc) => {
            let member = doc.data();

            if (C_div) {

                //데이터 처리
                C_div = false;
            } else {

                //데이터 처리
                C_div = true;
            }
        });
    } catch (error) {
        console.error("Firestore 데이터 로딩 중 오류 발생:", error);
    }
}
