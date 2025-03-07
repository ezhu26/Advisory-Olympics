import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
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


export const login = async function(){
signInWithRedirect(auth, provider)
  .then((result) => {
    console.log("logging in")
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });

}

let scheduleWithDates = [];
let manualDates = [];
let totalWeeks = 34;
//this function generates the schedule by taking a list, advisories


//if schedule already exists, this is used to pull from firebase
function getFirebaseSchedule(advisories) {
    //make an empty list for adding matchups
    let firebaseSchedule = []
    //create a value for the number of adisories
    const numAdvisories = advisories.length;
    //get a total weeks to make sure each advisory plays the other ones just once
    const totalWeeks = advisories.length - 1; 
    //generate schedule using round-robin algorithm
    for (let week = 0; week < totalWeeks; week++) {
        //empty list for each weeks matchups
        let weekMatchups = [];
        //for each advisory
        advisories.forEach(advisory => {
            //pull the opponent from the matchup that week that is already loaded into firebase
            const opponent = advisory[`week${week + 1}`]?.opponent;
            //if an opponent exists and the matchup does not already exist in the list
            if (opponent && !weekMatchups.includes(`${opponent} vs ${advisory.name}`) 
                && !weekMatchups.includes(`${advisory.name} vs ${opponent}`)) {
                //if the opponent is a bye, add that it is on a bye
                if (opponent === "Bye") {
                    weekMatchups.push(`${advisory.name} is on a Bye`);
                //otherwise, add the matchup to the week matchups list
                } else {
                    weekMatchups.push(`${advisory.name} vs ${opponent}`);
                }
            }
        });
        //add the week to the entire schedule
        firebaseSchedule.push(weekMatchups);
    }
    //return the fetched schedule
    return firebaseSchedule;
}

//called from getSchedule and updates in firebase
//not used if it is fetching from firebase already

function renderSchedule(scheduleWithDates) {
    //access the table in HTML called schedule
    const weekDropdown = document.getElementById("weekDropdown");

    //for each week, create a row in the table
    scheduleWithDates.forEach((weekData, index) => {
        //add a row

        const option = document.createElement("option");
        option.value = index; 
        option.textContent = `Week ${index + 1}`;
        weekDropdown.appendChild(option);
    });
}
//this function displays the current week matchups through the dropdown menu
function displayWeekMatchups() {
    //access the dropdown from the html
    const weekDropdown = document.getElementById("weekDropdown");
    //depending on what week is selected in the dropdown, make that the selected week
    const selectedWeek = weekDropdown.value; 
    //this is for displaying the matchups once it is selected
    const matchupDisplay = document.getElementById("matchups");
    //if the week that is selected exists
    if (selectedWeek !== "") {
        //access the global variable schedule with the selected week
        const matchups = scheduleWithDates[selectedWeek];
        //clear the previous display
        matchupDisplay.innerHTML = ""; 
        //create a container for the matchups
        const matchupContainer = document.createElement("div");
        //create a class called matchup container
        matchupContainer.className = "matchup-container";
        //add each matchup as a card
        matchups.forEach(matchup => {
            if (matchup.toLowerCase().includes("bye")) {
                // Bye week handling
                const card = document.createElement("div");
                card.className = "matchup-card";
                const teams = matchup.split(" is on a ");
                card.innerHTML = `
                    <div class="team home-team">${teams[0]}</div>
                    <div class="is-on-a">is on a</div>
                    <div class="team bye">Bye</div>
                `;
                matchupContainer.appendChild(card);
            } else {
                const card = document.createElement("div");
                card.className = "matchup-card";
                const teams = matchup.split(" vs ");


                const advisory1 = advisories.find(a => a.name === teams[0]);
                const advisory2 = advisories.find(a => a.name === teams[1]);

                const weekKey = `week${parseInt(selectedWeek) + 1}`;
                let homeAdvisory = null;
                let awayAdvisory = null;
                let homeLocation = "";
                
                homeAdvisory = advisory1;
                    awayAdvisory = advisory2;
                    homeLocation = homeAdvisory.location || "";
                    card.innerHTML = `
                    <div class="team home-team">${teams[0]} ${homeAdvisory === advisory1 ? `(${homeLocation})` : ""}</div>
                    <div class="versus">vs</div>
                    <div class="team away-team">${teams[1]} </div>`

                //if (advisory1?.[weekKey]?.home === true) {
                 //   homeAdvisory = advisory1;
                 //   awayAdvisory = advisory2;
                //    homeLocation = homeAdvisory.location || "";
                 //   card.innerHTML = `
                //   <div class="team home-team">${teams[0]} ${homeAdvisory === advisory1 ? `(${homeLocation})` : ""}</div>
                //    <div class="versus">vs</div>
                //    <div class="team away-team">${teams[1]} </div>
                //`;

                //} else if (advisory2?.[weekKey]?.home === true) {
                //    homeAdvisory = advisory2;
                //    awayAdvisory = advisory1;
                //    homeLocation = homeAdvisory.location || "";
                //    card.innerHTML =`
                //    <div class="team home-team"> ${teams[0]} </div>
                //    <div class="versus">vs</div>
                //    <div class="team away-team">${teams[1]} ${homeAdvisory === advisory2 ? `(${homeLocation})` : ""}</div>
                //   `; 
                //}

                    

                    
                    matchupContainer.appendChild(card);
    


            }
        });

        matchupDisplay.appendChild(matchupContainer);
    } else {
        matchupDisplay.innerHTML = "No week selected.";
    }
}
window.displayWeekMatchups = displayWeekMatchups;

//this gets the advisories from firebase and adds them to a list
let advisories = []; // Global variable to store advisories

async function getAdvisories() {
    try {
        const list = await getDocs(collection(db, "advisory-olympics"));
        advisories = []; // Reset before populating
        list.forEach(doc => {
            advisories.push({ id: doc.id, ...doc.data() });
        });

        scheduleWithDates = getFirebaseSchedule(advisories);
        renderSchedule(scheduleWithDates);
    } catch (error) {
        console.error("Error getting advisories:", error);
    }
}


//call the fetch function
getAdvisories();

//window.onload = function () {
    //generateWeekDateInputs(totalWeeks);
//};
//TO DO:
//Fix current week and date
//Make schedule algorithm making more random
//Add home/away boolean to each advisory each week
// var user;
// if (user.login.username.includes("@stab.org")){
//     displayEditPage = true;
// }
// if (displayEditPage = true){

// }
