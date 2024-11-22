import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

//allows it to import it to html
export async function buildAdvisoryPage(){
    //look in the adcisory-olympics data base where it looks to see if the advisor name
    // is equal to session storage advisor name
    const q = query(collection(db, "advisory-olympics"), where("name", "==", sessionStorage.getItem("displayAdvisory")));
    //gets the documents from this query(if a field matches a given criteria)
    //waits until the q variable is equal to a document in the database
    const querySnapshot = await getDocs(q);
    //loops through each doc in the querySnapshot
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
                //doc.data().field name
        //sets the inner html as the data from fire base
        document.getElementById("advisorName").innerHTML = doc.data().advisorName;
        // if (doc.data().advisorName == undefined){
        // document.getElementById("advisorName").innerHTML = "please input";
        // }
        document.getElementById("email").innerHTML = doc.data().email;
        document.getElementById("advisorPic").src = doc.data().image;
        document.getElementById("advisorBio").innerHTML = doc.data().advisorBio;
        var roster = doc.data().roster;
        var rosterList = document.getElementById("roster");
             //loops through each variable in the roster field
            roster.forEach((student) => {
                //creates a new line in the list and sets the 
                //information to the variable, and adds it to the list
                var newLi = document.createElement("li");
                newLi.innerHTML = student;
                rosterList.appendChild(newLi);
            });
        document.getElementById("gameName").innerHTML = doc.data().gameName;
        document.getElementById("gameDesc").innerHTML = doc.data().gameDesc;
        document.getElementById("advisorName").innerHTML = doc.data().advisorName;
        var schedule = doc.data().schedule;
        var scheduleList = document.getElementById("schedule");
        console.log(scheduleList);
            schedule.forEach((week) => {
                var newLi = document.createElement("li");
                newLi.innerHTML = week;
                scheduleList.appendChild(newLi);
        });
        document.getElementById("history").innerHTML = doc.data().history;
    });
}

//creates an advisory list and adds it to advisories.html
export async function advisoryList(){
    // gets the documents from this query(if a field matches a given criteria)
    const advisories = await getDocs(collection(db, "advisory-olympics"));    
    //loops through each advisory    
    advisories.forEach((advisory) => {
        //makes a button and sets the info the the name of the advisory
        var newButton = document.createElement("button");
        newButton.innerHTML = advisory.data().name;
        //anonymous function that when the button is clicked,
        //it navigates to the makePage.html
        newButton.onclick = function(){
            //calles the setAdvisory() function and sets the
            //session storage as the advisory name
            setAdvisory(advisory.data().name);
            //change the location of page to makePage.html
            window.location.href = "makePage.html";
        };
        //adds the button to the div
        document.getElementById('advisoryList').appendChild(newButton);
        document.getElementById('advisoryList').appendChild(document.createElement("br"));
    });
}

//changes the sessionStorage to what is in the parameter
export async function setAdvisory(advisoryName){
//make a variable called displayAdvisory, set its value to be the parameter
    sessionStorage.setItem("displayAdvisory", advisoryName);
    console.log(sessionStorage.getItem("displayAdvisory"));
}