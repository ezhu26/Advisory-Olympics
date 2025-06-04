
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithPopup, signInWithRedirect,  GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {makeDropdown} from './makePage.js';

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
  // console.log(advOrder);
}

document.getElementById("round").addEventListener("click", printList);


export function changeRound() {
  console.log('changeRound');
}

//idrk what this is doing
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



export async function setTeams(){
  //sort list by rank (in wrong order)
  var selectedItem = advOrder[0].name;
  if(advOrder[0].name != ""){
    document.getElementById("1seed").innerHTML = selectedItem;
  } else {
    document.getElementById("1seed").innerHTML = "Seed 1";
  }

  selectedItem = advOrder[1].name;
  document.getElementById("2seed").innerHTML = selectedItem;

  selectedItem = advOrder[2].name;
  document.getElementById("3seed").innerHTML = selectedItem;

  selectedItem = advOrder[3].name;
  document.getElementById("4seed").innerHTML = selectedItem;

  selectedItem = advOrder[4].name;
  document.getElementById("5seed").innerHTML = selectedItem;

  selectedItem = advOrder[5].name;
  document.getElementById("6seed").innerHTML = selectedItem;

  selectedItem = advOrder[6].name;
  document.getElementById("7seed").innerHTML = selectedItem;

  selectedItem = advOrder[7].name;
  document.getElementById("8seed").innerHTML = selectedItem;

  selectedItem = advOrder[8].name;
  document.getElementById("9seed").innerHTML = selectedItem;

  selectedItem = advOrder[9].name;
  document.getElementById("10seed").innerHTML = selectedItem;

  selectedItem = advOrder[10].name;
  document.getElementById("11seed").innerHTML = selectedItem;

  selectedItem = advOrder[11].name;
  document.getElementById("12seed").innerHTML = selectedItem;

  selectedItem = advOrder[12].name;
  document.getElementById("13seed").innerHTML = selectedItem;

  selectedItem = advOrder[13].name;
  document.getElementById("14seed").innerHTML = selectedItem;

  selectedItem = advOrder[14].name;
  document.getElementById("15seed").innerHTML = selectedItem;

  selectedItem = advOrder[15].name;
  document.getElementById("16seed").innerHTML = selectedItem;

  // let r2matchups = [];
const docRef = doc(db, "bracket", "r2matchups");
const r2matchups = await getDoc(docRef);
const dataR2matchups = r2matchups.data();

console.log(dataR2matchups);

for (const field in dataR2matchups) {
  if (field == "1v16w") {
    // Access the value (which is a nested object) using the field as key
    const matchup = dataR2matchups[field];
    document.getElementById("1v16w").innerHTML = matchup?.name || "TBD";  // NOT field['$name']

  } 
  if(field == "8v9w") {
    const matchup = dataR2matchups[field];
    document.getElementById("8v9w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "4v13w") {
    const matchup = dataR2matchups[field];
    document.getElementById("4v13w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "5v12w") {
    const matchup = dataR2matchups[field];
    document.getElementById("5v12w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "2v15w") {
    const matchup = dataR2matchups[field];
    document.getElementById("2v15w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "7v10w") {
    const matchup = dataR2matchups[field];
    document.getElementById("7v10w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "3v14w") {
    const matchup = dataR2matchups[field];
    document.getElementById("3v14w").innerHTML = matchup?.name || "TBD";
  }
  if(field == "6v11w") {
    const matchup = dataR2matchups[field];
    document.getElementById("6v11w").innerHTML = matchup?.name || "TBD";
  }
}

const docRef3 = doc(db, "bracket", "r3matchups");
const r3matchups = await getDoc(docRef3);
const dataR3matchups = r3matchups.data();

console.log("These are the round 3 matchups" + dataR3matchups);

for (const field in dataR3matchups) {
  if (field == "topleftw") {
    // Access the value (which is a nested object) using the field as key
    const matchup = dataR3matchups[field];
    // if(matchup.name = null){
    //   document.getElementById("ST1").innerHTML = "Not determined";
    // }
    document.getElementById("topleftw").innerHTML = matchup?.name || "TBD";
  }
  if(field == "bottomleftw") {
    const matchup = dataR3matchups[field];
    document.getElementById("bottomleftw").innerHTML = matchup?.name || "TBD";
  }
  if(field == "toprightw") {
    const matchup = dataR3matchups[field];
    document.getElementById("toprightw").innerHTML = matchup?.name || "TBD";
  }
  if(field == "bottomrightw") {
    const matchup = dataR3matchups[field];
    document.getElementById("bottomrightw").innerHTML = matchup?.name || "TBD";
  }

}


const docRef4 = doc(db, "bracket", "r4matchups");
const r4matchups = await getDoc(docRef4);
const dataR4matchups = r4matchups.data();

console.log("These are the round 4 matchups" + dataR4matchups);

for (const field in dataR4matchups) {
  if (field == "leftsidew") {
    // Access the value (which is a nested object) using the field as key
    const matchup = dataR4matchups[field];
    // if(matchup.name = null){
    //   document.getElementById("ST1").innerHTML = "Not determined";
    // }
    document.getElementById("leftsidew").innerHTML = matchup?.name || "TBD";  // NOT field['$name']
  }
  if (field == "rightsidew"){
    const matchup = dataR4matchups[field];
    document.getElementById("rightsidew").innerHTML = matchup?.name || "TBD";  // NOT field['$name']
  }
}

const docRef5 = doc(db, "bracket", "r5matchup");
const r5matchup = await getDoc(docRef5);
const dataR5matchup = r5matchup.data();
// let championWinner = document.createElement("p");
document.getElementById("totalWinner").innerHTML = dataR5matchup["totalwinner"]?.name || "TBD";

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

export async function clearBracket(){
  const docRef1 = doc(db, "bracket", "r2matchups");
  await updateDoc(docRef1, {
  "1v16w": "",
  "2v15w": "",
  "3v14w": "",
  "4v13w": "",
  "5v12w": "",
  "6v11w": "",
  "7v10w": "",
  "8v9w": ""
});

  const docRef2 = doc(db, "bracket", "r3matchups");
  await updateDoc(docRef2, {
    "bottomleftw": "",
    "bottomrightw": "",
    "topleftw": "",
    "toprightw": ""
  });

  const docRef3 = doc(db, "bracket", "r4matchups");
  await updateDoc(docRef3, {
    "leftsidew": "",
    "rightsidew": ""
  });


  const docRef4 = doc(db, "bracket", "r5matchup");
  await updateDoc(docRef4, {
    "totalwinner": "",
  });

  console.log("map cleared");
  location.reload()
}

//makes the lines
function connectCards(sourceId, targetId) {
  const svg = document.querySelector('.bracket-lines');
  const source = document.getElementById(sourceId);
  const target = document.getElementById(targetId);
  const sRect = source.getBoundingClientRect();
  const tRect = target.getBoundingClientRect();
  const containerRect = svg.getBoundingClientRect();

  const x1 = sRect.right - containerRect.left;
  const y1 = sRect.top + sRect.height / 2 - containerRect.top;
  const x2 = tRect.left - containerRect.left;
  const y2 = tRect.top + tRect.height / 2 - containerRect.top;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", "2");

  svg.appendChild(line);
}

// Example use
connectCards('r2m1', 'r1m1');
connectCards('r2m1', 'r1m2');
connectCards('r2m2', 'r1m3');
connectCards('r2m2', 'r1m4');
connectCards('r1m5', 'r2m3');
connectCards('r1m6', 'r2m3');
connectCards('r1m7', 'r2m4');
connectCards('r1m8', 'r2m4');
connectCards('r1m5', 'r2m3');
connectCards('r3m1', 'r2m1');
connectCards('r3m1', 'r2m2');
connectCards('r2m3', 'r3m2'); 
connectCards('r2m4', 'r3m2');
connectCards('r4m1', 'r3m1');
connectCards('r3m2', 'r4m1');


export const login = async function(){
  var result = await signInWithPopup(auth, provider);
  console.log("logging in")
  // This gives you a Google Access Token. You can use it to access the Google API.
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential.accessToken;
  // The signed-in user info.
  const user = result.user;
  
  // IdP data available using getAdditionalUserInfo(result)
  // ...
  console.log(user.email);
  if(user.email.includes("@gmail.com")){
    // sessionStorage.setItem('adminLogin', true);
    makeButtons();
  }
}

function makeButtons(){
  console.log("makeButtons function is running");
  const buttons = document.querySelectorAll(".advance");
  buttons.forEach(button => {
    button.style.display = "block";
  });

  let newLi = document.createElement("li");
  newLi.id = "left";
  let clearButton = document.createElement("button");
  clearButton.innerHTML = "Clear Bracket";
  clearButton.onclick = function(){
    clearBracket();
  };
  newLi.appendChild(clearButton);
  document.getElementById("navBar").appendChild(newLi);
  console.log("clear bracket button made");
}
// window.addEventListener("DOMContentLoaded", () => {
//   const showAdvisor = sessionStorage.getItem("adminLogin");
// console.log(showAdvisor);
//   if (showAdvisor == "true") {

//     // <li id = "left" ><button class = "advisorbutton" onclick="handleAdvisorClick()">Advisor</button></li>

//     const buttons = document.querySelectorAll(".advance");
//     buttons.style.display = "block";
//   }
// });

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("dropdown");
  const dropdown = document.getElementById("myDropdown");
  const container = document.getElementById("dropdown-container");
  // Show dropdown on hover
  button.addEventListener("mouseover", () => {
    console.log("user hover");
    dropdown.classList.add("show");
  });

  // Keep it open when hovering over dropdown
  dropdown.addEventListener("mouseover", () => {
    dropdown.classList.add("show");
  });

  // Hide when mouse leaves the whole container
  container.addEventListener("mouseleave", () => {
    dropdown.classList.remove("show");
  });
  // location.reload();
});
try{
makeDropdown();
} catch{
  console.log("error function on makeDropdown()");
}

