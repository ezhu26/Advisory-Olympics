
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
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

  try {
      const q = query(
          collection(db, "advisory-olympics"),
          where("rank", "<=", 16),
          orderBy("rank", "asc")
      );

      const advisorySnapshot = await getDocs(q);

      advisorySnapshot.forEach((item) => {
          advOrder.push({ name: item.data().name, rank: item.data().rank });
      });

      // Sort the array by rank (just in case)
      advOrder.sort((a, b) => a.rank - b.rank);
      console.log(advOrder)
      // Save to Firestore under "bracket" → "r1matchups"
      const docRef = doc(db, "bracket", "r1matchups");
      const dataToSave = {};
      advOrder.forEach((item, index) => {
          dataToSave[`seed${index + 1}`] = {
              name: item.name,
              rank: item.rank
          };
      });
      console.log("\n" + JSON.stringify(dataToSave));

      await setDoc(docRef, dataToSave);
      console.log("Advisories saved to r1matchups!");

      setTeams(); // Call to update the UI

  } catch (error) {
      console.error("Error fetching or saving advisories:", error);
  }
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
  //sort list by rank (in wrong order)
  var selectedItem = advOrder[0].name;
  if(advOrder[0].name != ""){
    document.getElementById("1seed").innerHTML = selectedItem;
  } else {
    document.getElementById("1seed").innerHTML = "Seed 1";
  }

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
export async function advanceTeam(round, team, nextLevel, nextTeam) {
  console.log(round);
  console.log("advanceTeam round:");
  console.log(round);
  console.log("advanceTeam team:", team);
  console.log("advanceTeam nextLevel:", nextLevel);
  console.log("advanceTeam nextTeam:", nextTeam);
  

  // Get document references
  const docRef = doc(db, "bracket", round);//get doc with the name of the team to advance
  console.log("2");
  const docRef2 = doc(db, "bracket", nextLevel);//get the document for where to put the advancing team
  console.log("3");

  // Fetch document snapshots
  const docSnap = await getDoc(docRef);
  const docSnap2 = await getDoc(docRef2);

  if (docSnap.exists()) {
      const teamToAdvance = docSnap.data()[`${team}`];
      console.log("Advancing team:");
      console.log(teamToAdvance);

      await updateDoc(docRef2, {
        [`${nextTeam}`]: teamToAdvance
      });

      document.getElementById(nextTeam).innerHTML = teamToAdvance.name;
  } else {
      console.log("No such document to advance!");
  }
}
