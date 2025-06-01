import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInWithRedirect, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
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
    if(user.email.includes("@stab.org")){
      sessionStorage.setItem('adminLogin', true);
    }
}

let scheduleWithDates = [];
let manualDates = [];
let totalWeeks = 34;
//this function generates the schedule by taking a list, advisories


//if schedule already exists, this is used to pull from firebase
async function getFirebaseSchedule(advisories) {
  let firebaseSchedule = [];

  try {
      let weekMatchupsMap = {};

      const schedulePromises = advisories.map(async (advisory) => {
          const scheduleRef = collection(db, "advisory-olympics", advisory.id, "schedule");
          const scheduleSnapshot = await getDocs(scheduleRef);

          scheduleSnapshot.forEach((doc) => {
              if (doc.id.startsWith("week_")) { 
                  const data = doc.data();
                  const weekNumber = parseInt(doc.id.split("_")[1]);  

                  if (!weekMatchupsMap[weekNumber]) {
                      weekMatchupsMap[weekNumber] = { date: data.date || "No date", matchups: new Set() };
                  }

                  if (data.opponent) {
                     
                      const matchupKey = [advisory.name, data.opponent].sort().join(" vs ");

                      weekMatchupsMap[weekNumber].matchups.add(matchupKey);
                  }
              }
          });
      });

      await Promise.all(schedulePromises);

 
      firebaseSchedule = Object.keys(weekMatchupsMap)
          .sort((a, b) => a - b) 
          .map(week => ({
              date: weekMatchupsMap[week].date,
              matchups: Array.from(weekMatchupsMap[week].matchups) 
          }));

  } catch (error) {
      console.error("Error fetching schedule from Firestore");
  }

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

//this function translates the input in the box to update the week
export async function goToWeek() {
  //gets the input
  const input = document.getElementById("weekInput").value;
  //the number in the input
  const weekNumber = parseInt(input);
  //this accesses the firebase
  const settingsRef = doc(db, "settings", "current");

  //if the week number exists and is less than the total schedule
  if (!isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= scheduleWithDates.length) {
    //access the dropdown
      const dropdown = document.getElementById("weekDropdown");
      //dropdown values are 0-indexed
      dropdown.value = weekNumber - 1; 
      //try to update the firebase
      try {
        await updateDoc(settingsRef, {
          currentWeek: weekNumber - 1
        });
        console.log(`Successfully updated current week to ${weekNumber}`);
        //if it doesn't work
      } catch (error) {
        console.error("Error updating current week in Firestore:", error);
        alert("There was a problem updating the week. Please try again.");
      }
      //display the correct weeks
      displayWeekMatchups();
  } else {
      alert("Please enter a valid week number between 1 and " + scheduleWithDates.length);
  }
}

//this function pulls from the week in firebase and loads the current page
async function loadCurrentWeek() {
  //access the firebase
  const settingsRef = doc(db, "settings", "current");
  // console.log("hi");
  try {
    // console.log("hi2");
    //pull from the current firebase
      const docSnap = await getDoc(settingsRef);
      //if something exists in there
      if (docSnap.exists()) {
        // console.log("hi3");
        //access the week dropdown
          const weekDropdown = document.getElementById("weekDropdown");
          // console.log("hi4");
          //set the value of the dropdown to the current week
          weekDropdown.value = docSnap.data().currentWeek;
          // console.log("hi5");
          //display the matchups
          displayWeekMatchups();
          // console.log("hi6");
      } else {
          // console.log("No current week set.");
      }
  } catch (error) {
      console.error("Error loading current week from Firebase:", error);
  }
}

window.goToWeek = goToWeek;
//this function displays the current week matchups through the dropdown menu
function displayWeekMatchups() {
  //access the dropdown from the html
  const weekDropdown = document.getElementById("weekDropdown");
  //depending on what week is selected in the dropdown, make that the selected week
  const selectedWeek = weekDropdown.value; 
  //this is for displaying the matchups once it is selected
  const matchupDisplay = document.getElementById("matchups");
  // console.log(selectedWeek);
  //if the week that is selected exists
  if (selectedWeek !== "") {
      //access the global variable schedule with the selected week
      const matchups = scheduleWithDates[selectedWeek].matchups;
      // console.log(scheduleWithDates);
      //clear the previous display
      matchupDisplay.innerHTML = ""; 
      //create a container for the matchups
      const matchupContainer = document.createElement("div");
      //create a class called matchup container
      matchupContainer.className = "matchup-container";
      console.log("checkpoint 11");
      //add each matchup as a card
      matchups.forEach(matchup => {
          if (matchup.toLowerCase().indexOf("bye") === -1){
          console.log("checkpoint 12");
          //create a new card for each matchup
          const card = document.createElement("div");
          //add each card to a class called matchup-card
          card.className = "matchup-card";
          //create "teams" that are split with a versus sign
          const teams = matchup.split(" vs ");
          //in each card, add the home team, a "vs.", and the away team
          card.innerHTML = `
              <div class="team home-team">${teams[0]}</div>
              <div class="versus">vs</div>
              <div class="team away-team">${teams[1]}</div>
          `;
          //add the card to the overall matchup container
          matchupContainer.appendChild(card);
          } else {
              const card = document.createElement("div");
              //add each card to a class called matchup-card
              card.className = "matchup-card";
              //split the bye by the words is on a 
              const teams = matchup.split(" is on a ");
              card.innerHTML = `
                  <div class="team home-team">${teams[0]}</div>
                  <div class="is-on-a">is on a<div/>
                  <div class="team bye">Bye</div>
                  `;
                  matchupContainer.appendChild(card);
          }
      });
      //add the container to the display
      matchupDisplay.appendChild(matchupContainer);
  } else {
      matchupDisplay.innerHTML = "No week selected";
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

        scheduleWithDates = await getFirebaseSchedule(advisories);
        renderSchedule(scheduleWithDates);
    } catch (error) {
        console.error("Error getting advisories:", error);
    }
}


//call the fetch function
try{
getAdvisories();
} catch{
  console.log("did not could load advisories from firebase");
}


async function fetchDataFromFirebase() {
    //empty array where the advisory data will go
    const advisoryData = []; 
    try {
      //call firebase and get a list of advisory
        const advisories = await getDocs(collection(db, "advisory-olympics"));
        //for each advisory, add their data to the array
        advisories.forEach((doc) => {
            advisoryData.push(doc.data());
          });
          //if it doesn't work, give an error
    } catch (error) {
        console.error("Error fetching data from Firebase:", error);
    }
    //return the array of advisory data
    //when it is called, it sends an array
    return advisoryData; 
  }
  
  
  //called showItems, but it also assigns points and a rank based on the record

  //calls showItems and populates the table
  window.onload = function () {
    getAdvisories().then(() => {
        loadCurrentWeek(); // Load week after advisories are ready
    });
    showItems();
};
  async function showItems() {
    //get the data from the array from firebase 
    const data = await fetchDataFromFirebase();
          data.sort((a, b) => a.rank - b.rank);

   
      //now, all of the attributes are correct, but we need to put them into the table
      //get the table 
      const tableBody = document.getElementById("body");
      //clear the table
      tableBody.innerHTML = ""
      //for each advisory in the array
    data.forEach(item => {
      //create a new row called row
      const row = document.createElement("tr");
      //in the new row, add the text content of each attribute
      //the $ means the attribute itself
        row.innerHTML = `
            <td>${item.rank}</td>
          <td><a href="#" class="advisory-link" data-id="${item.name}">${item.name}</a></td>
            <td>${item.points}</td> <!-- Display calculated points -->
            <td>${item.record}</td>
        `;
        //add this row to the table
      tableBody.appendChild(row);
    });  
    // ✅ THEN attach click handlers (outside the forEach!)
  document.querySelectorAll(".advisory-link").forEach(link => {
  link.addEventListener("click", async function(e) {
    e.preventDefault();
    
    const advisoryName = this.getAttribute("data-id"); // assuming this is the name
    console.log("Looking up ID for:" + advisoryName);

    const newID = await findMatchAdvisory(advisoryName); // ✅ Await here
    console.log("Found ID:" + newID);

    if (newID) {
      sessionStorage.setItem("displayAdvisory", newID);
      console.log("Session storage set");
      window.location.href = "makePage.html";
    } else {
      console.error("Advisory not found.");
    }
  });
});
    //end the async function
    return Promise.resolve();
  }
  
  //this function updates the team record when the button is pressed
  async function updateTeamRecord() {
    //get the team name from the first text box
    const teamName = document.getElementById('teamName').value;
    //get the new record from the second text box
    const newRecord = document.getElementById('newRecord').value;
  
    try {
      // get the list of advisories
      const advisories = await getDocs(collection(db, "advisory-olympics"));
      //create teamDoc, set it to null
      let teamDoc = null;
      //for each advisory, if the inputed name = the advisory name, set it to teamDoc
      advisories.forEach(doc => {
        if (doc.data().name === teamName) {
          teamDoc = doc;
        }
      });
  
      if (teamDoc) {
        //with the new record, calculate the points with the caluclatePOints function
        const points = calculatePoints(newRecord);
        //access the updated data
        const updatedData = { record: newRecord, points };
  
        //get the specific advisory whos record is being updated
        const teamDocRef = doc(db, "advisory-olympics", teamDoc.id);
        //
        await updateDoc(teamDocRef, updatedData);
        console.log("Record updated successfully in Firebase");
  
        //refetch the showItems page and reshow the table
        await showItems();
        //reset the text boxes to empty
        document.getElementById('newRecord').value = "";
        document.getElementById('teamName').value = "";
      } else {
        //this doesn't work, but if the team isn't found, give an alert
        alert('Team not found!');
      }
      //if there is an error with updating the records in firebase, print in console
    } catch (error) {
      console.error("Error updating record: ", error);
    }
  }
  
  //function to calculate points based on record
  function calculatePoints(record) {
  //create a new object that is made up of the record split by dashes
  //extract the wins, losses, and ties
    const [wins, losses, ties] = record.split("-").map(Number);
    //calculate the points with the premier league scoring format:
    //3 for a win, 1 for a tie, 0 for a loss
    return ((wins * 3) + (losses * 0) + (ties * 1)); 
  }
  

  /*const querySnapshot = await getDocs(collection(db, "advisory-olympics"));
  querySnapshot.forEach((doc) => {
      const advisory = doc.data();
    console.log(advisory.name, " => ", doc.data());
  })*/
  
  window.updateTeamRecord = updateTeamRecord;
  

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

async function findMatchAdvisory(advisoryName) {
  console.log("findMatchAdvisory is running");
  const snapshot = await getDocs(collection(db, "advisory-olympics"));
  
  for (const doc of snapshot.docs) {
    if (doc.data().name == advisoryName) {
      console.log(doc.data().name);
      return doc.id;  // ✅ This is how you get the document ID
    }
  }

  return null; // If no match is found
}

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


window.addEventListener("DOMContentLoaded", () => {
  const showAdvisor = sessionStorage.getItem("adminLogin");

  if (showAdvisor == "true") {
    let newLi = document.createElement("li");
    newLi.id = "left";
    let advisorLink = document.createElement("a");
    advisorLink.href = "makeAdvisory.html";
    advisorLink.textContent = "Make a New Advisory";
    newLi.appendChild(advisorLink);
    document.getElementById("navBar").appendChild(newLi);

    document.getElementById("loginButton").remove();

    let containerDiv = document.createElement("div");


    // Create label
    let label = document.createElement("label");
    label.setAttribute("for", "weekInput");
    label.textContent = "Enter Week Number:";

    // Create input
    let input = document.createElement("input");
    input.type = "number";
    input.id = "weekInput";
    input.min = "1";

    // Create button
    let button = document.createElement("button");
    button.textContent = "Go";
    button.onclick = goToWeek; // no parentheses, just the reference

    // Append elements to container div
    containerDiv.appendChild(label);
    containerDiv.appendChild(input);
    containerDiv.appendChild(button);

    document.getElementById("locations").insertBefore(containerDiv, document.getElementById("insertBefore"));
  }

});
