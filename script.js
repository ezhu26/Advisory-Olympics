import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
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

export async function goToWeek() {
  const input = document.getElementById("weekInput").value;
  const weekNumber = parseInt(input);
  const settingsRef = doc(db, "settings", "current");

  if (!isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= scheduleWithDates.length) {
      const dropdown = document.getElementById("weekDropdown");
      dropdown.value = weekNumber - 1; // dropdown values are 0-indexed
      try {
        await updateDoc(settingsRef, {
          currentWeek: weekNumber - 1
        });
        console.log(`Successfully updated current week to ${weekNumber}`);
      } catch (error) {
        console.error("Error updating current week in Firestore:", error);
        alert("There was a problem updating the week. Please try again.");
      }
      displayWeekMatchups();
  } else {
      alert("Please enter a valid week number between 1 and " + scheduleWithDates.length);
  }
}

async function loadCurrentWeek() {
  const settingsRef = doc(db, "settings", "current");
  console.log("hi");
  try {
    console.log("hi2");
      const docSnap = await getDoc(settingsRef);
      if (docSnap.exists()) {
        console.log("hi3");
          const weekDropdown = document.getElementById("weekDropdown");
          console.log("hi4");
          weekDropdown.value = docSnap.data().currentWeek;
          console.log("hi5");
          displayWeekMatchups();
          console.log("hi6");
      } else {
          console.log("No current week set.");
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
  console.log(selectedWeek);
  //if the week that is selected exists
  if (selectedWeek !== "") {
      //access the global variable schedule with the selected week
      const matchups = scheduleWithDates[selectedWeek].matchups;
      console.log(scheduleWithDates);
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
getAdvisories();



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
  
    //this bit of code is about calculating and then sorting the advisories based on points
    //for each advisory in the array
    data.forEach(advisory => {
      //calculate a points value based on the record in the calculatePoints function
        const points = calculatePoints(advisory.record); 
        //assign the calculated points to the advisory
        advisory.points = points
      });
      //within the array, sort the data based on points from most to least
      data.sort((a, b) => b.points - a.points);
  
      //this next bit of code is about assigning a rank to each advisory based on their points relative to other advisories
      //because the advisory array is sorted already, we can give the first team rank 1
      let rankO = 1;
      //this is used for seeing if the points of the last team is the same, to be able to assign teams the same rank
      let lastPoints = null;
    
      //for each item in the array, if the points of this advisory is not equal to the points of the last advisory, the rank equals the amount of advisories that have been tested plus 1
      data.forEach((item, index) => {
        if (item.points !== lastPoints) {
          //add one to the index
          rankO = index + 1;
        }
        //assign the rank
        item.rank = rankO; 
        //set the points that will be checked against to the points of the current item
        lastPoints = item.points;
      });
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
            <td>${item.name}</td>
            <td>${item.points}</td> <!-- Display calculated points -->
            <td>${item.record}</td>
        `;
        //add this row to the table
      tableBody.appendChild(row);
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
          //
  

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
