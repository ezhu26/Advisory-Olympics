


//query for all teams with rank <= 16
// import { collection, query, where, getDocs } from "firebase/firestore";

// const q = query(collection(db, "cities"), where("capital", "==", true));

// const querySnapshot = await getDocs(q);
// querySnapshot.forEach((doc) => {
//   // doc.data() is never undefined for query doc snapshots
//   console.log(doc.id, " => ", doc.data());
// });
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA48UmI50QVSpCJF6voYVudbChpVkFkU6g",
    authDomain: "advisory-olympics.firebaseapp.com",
    projectId: "advisory-olympics",
    storageBucket: "advisory-olympics.appspot.com",
    messagingSenderId: "975067253222",
    appId: "1:975067253222:web:92eff5d86154b91641ee27"
  };
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);
var advOrder = [];
//advOrder[0].name
//advOrder[0].rank
export async function getAdvOrder() {
  advOrder = [];

  console.log("help");
    const q = query(collection(db, "advisory-olympics"), where("rank", "<=", 16));
    const advisorySnapshot = await getDocs(q);

    advisorySnapshot.forEach((item) => {
      advOrder.push( { name: item.data().name, rank: item.data().rank} );
    });
    // console.log(advOrder);
    setTeams()
}
document.getElementById("round").addEventListener("click", printList);


export function changeRound() {
  console.log('changeRound');
}
export function printList() {
  const printList = document.getElementById("print");

  // Create an unordered list
  const ul = document.createElement("ul");

  // Loop through the array and create list items
  advOrder.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;  // Set the text of the list item
      ul.appendChild(li);     // Add the list item to the list
  });

  // Append the unordered list to the container
  listContainer.appendChild(ul);
}

export function setTeams(){
  var selectedItem = advOrder[0].name;
    document.getElementById("1seed").innerHTML = selectedItem;

  selectedItem = advOrder[2].name;
  document.getElementById("2seed").innerHTML = selectedItem;

  selectedItem = advOrder[3].name;
  document.getElementById("3seed").innerHTML = selectedItem;

  selectedItem = advOrder[4].name;
  document.getElementById("4seed").innerHTML = selectedItem;

  selectedItem = advOrder[5].name;
  document.getElementById("5seed").innerHTML = selectedItem;

  selectedItem = advOrder[6].name;
  document.getElementById("6seed").innerHTML = selectedItem;

  selectedItem = advOrder[7].name;
  document.getElementById("7seed").innerHTML = selectedItem;

  selectedItem = advOrder[8].name;
  document.getElementById("8seed").innerHTML = selectedItem;

  selectedItem = advOrder[9].name;
  document.getElementById("9seed").innerHTML = selectedItem;

  selectedItem = advOrder[10].name;
  document.getElementById("10seed").innerHTML = selectedItem;

  selectedItem = advOrder[11].name;
  document.getElementById("11seed").innerHTML = selectedItem;

  selectedItem = advOrder[12].name;
  document.getElementById("12seed").innerHTML = selectedItem;

  selectedItem = advOrder[13].name;
  document.getElementById("13seed").innerHTML = selectedItem;

  selectedItem = advOrder[14].name;
  document.getElementById("14seed").innerHTML = selectedItem;

  selectedItem = advOrder[15].name;
  document.getElementById("15seed").innerHTML = selectedItem;

  selectedItem = advOrder[16].name;
  document.getElementById("16seed").innerHTML = selectedItem;
}

// Call the function to print the list
// printList();
export async function advanceTeam(round, team, nextLevel, nextTeam){
  
  const docRef = doc(db, "bracket", round, team);
  const docRef2 = doc(db, "bracket", nextLevel, nextTeam);
  const docSnap = await getDocs(docRef);
  console.log(docSnap.data().advisor);
  const docSnap2 = await getDocs(docRef2);
  
  var teamToAdvance = docSnap.data().team
  console.log(teamToAdvance);
  await setDoc(doc(db, "bracket", round), {
      docRef2: docRef
  });

  
  document.getElementById("QT1").innerHTML = document.getElementById("1seed").innerHTML;
  //set r2Matchups > 

}
