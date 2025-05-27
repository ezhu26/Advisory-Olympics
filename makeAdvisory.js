import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { generateSchedule } from "./schedule.js";

const firebaseConfig = {
    apiKey: "AIzaSyA48UmI50QVSpCJF6voYVudbChpVkFkU6g",
    authDomain: "advisory-olympics.firebaseapp.com",
    projectId: "advisory-olympics",
    storageBucket: "advisory-olympics.appspot.com",
    messagingSenderId: "975067253222",
    appId: "1:975067253222:web:92eff5d86154b91641ee27"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// document.getElementById("advisoryName").addEventListener("input", checkAdvisories);


export async function checkAdvisories() {
    console.log("checkAdvisories Running");

    const advisories = await getDocs(collection(db, "advisory-olympics"));
    let exists = false;

    advisories.forEach((advisory) => {
        if (advisory.data().name.toLowerCase() === document.getElementById('advisoryName').value.toLowerCase()) {
            exists = true;
        }
    });

    if (!exists) {
        document.getElementById("advisoryName").style.borderColor = "";

        const existingErrorMessage = document.getElementById("errorMessage");
        if (existingErrorMessage != null) {
            existingErrorMessage.remove();
        }
    } else {
        document.getElementById("advisoryName").style.borderColor = "red";

        // Avoid duplicating the error message
        if (!document.getElementById("errorMessage")) {
            const errorMessage = document.createElement('p');
            errorMessage.id = "errorMessage";
            errorMessage.innerHTML = "Advisory already exists";
            errorMessage.style.color = "red";
            document.getElementById("advisorContainer").appendChild(errorMessage);
        }
    }
}

export function addPeople(){
    console.log("function add People starting");
    let div = document.getElementById("people");
    let newPerson = document.createElement("li");
    newPerson.innerHTML = document.getElementById("person").value;
    let deleteButton = document.createElement("button")
    deleteButton.innerHTML = "x";
    newPerson.appendChild(deleteButton);
    div.appendChild(newPerson);
    deleteButton.onclick = function(){
        div.removeChild(newPerson);
    }
    document.getElementById("person").value = "";
    
}

export async function createAdvisory(){
    console.log("make Advisory is running");
    if(document.getElementById("advisoryName").value == ""){
        let message = document.createElement("p");
        message.innerHTML = "Please enter an advisory name";
        message.style.color = "red";
        document.getElementById("advisorContainer").appendChild(message);
        return;
    }
    if (document.getElementById("advisor").value == ""){
        let message = document.createElement("p");
        message.innerHTML = "Please enter an advisor";
        message.style.color = "red";
        document.getElementById("advisorDiv").appendChild(message);
        return;

    }
    if (document.getElementById("location").value == ""){
        let message = document.createElement("p");
        message.innerHTML = "Please enter a location";
        message.style.color = "red";
        document.getElementById("locationDiv").appendChild(message);
        return;

    }
    if (document.getElementById("game").value == ""){
        let message = document.createElement("p");
        message.innerHTML = "Please enter a game name";
        message.style.color = "red";
        document.getElementById("gameDiv").appendChild(message);
        return;
    }
    if (document.getElementById("gameDesc").value == ""){
        let message = document.createElement("p");
        message.innerHTML = "Please enter a game description";
        message.style.color = "red";
        document.getElementById("gameDescDiv").appendChild(message);
        return;
    }
    if (document.getElementById("people").children.length == 0){
        let message = document.createElement("p");
        message.innerHTML = "Please enter some people";
        message.style.color = "red";
        document.getElementById("peopleDiv").appendChild(message);
        return;
    }
    //stefan
    let rosterList = document.getElementById("people").querySelectorAll("li");
    let newList = [];
        rosterList.forEach((person) => {
            newList.push(person.textContent.replace(/x$/, ""));
        });
console.log(newList);

let fullID = document.getElementById("advisoryName").value;
let newID = fullID.split(" ")[0];

const docRef = doc(db, "advisory-olympics", newID);

    // const q = query(collection(db,))
  try {
    await setDoc(docRef, {
      name: document.getElementById("advisoryName").value,
      advisorName: document.getElementById("advisor").value,
      location: document.getElementById("location").value,
      game: document.getElementById("game").value,
      gameDesc: document.getElementById("gameDesc").value,
      roster: newList,
      record: "0-0-0"
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
    const advisories = await getDocs(collection(db, "advisory-olympics"));    
  generateSchedule(advisories);
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  checkAdvisories();
});
console.log("this page is working");
