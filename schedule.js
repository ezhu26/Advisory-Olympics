import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
// TODO: import libraries for Cloud Firestore Database
// https://firebase.google.com/docs/firestore
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

let schedule = [];
//this function generates the schedule by taking a list, advisories
function generateSchedule(advisories) {
    //create a value for the number of adisories
    const numAdvisories = advisories.length;
    console.log("hi");

    //ensure even number of advisories by adding a "Bye" if needed
    if (numAdvisories % 2 !== 0) {
        //add a bye to the end of the list
        advisories.push({ id: null, name: "Bye" });
    }
    //get a total weeks to make sure each advisory plays the other ones just once
    const totalWeeks = advisories.length - 1; 
    //this is for the amount of matchups each week
    const halfSize = advisories.length / 2;

    //generate schedule using round-robin algorithm
    for (let week = 0; week < totalWeeks; week++) {
        //empty list for each weeks matchups
        const weekMatchups = [];
        //for each week, make matchups
        for (let i = 0; i < halfSize; i++) {
            //the home team
            const home = advisories[i];
            //the away team is the one on the backend of the alphabetical list for week 1
            const away = advisories[advisories.length - 1 - i];
            //as long as a Bye isn't in the matchup, add it to the list
            if (home === "Bye") {
                weekMatchups.push(`${away.name} is on a Bye`);
                updateSchedule(away.id, week, "Bye")
            } else if (away === "Bye") {
                weekMatchups.push(`${home.name} is on a Bye`);
                updateSchedule(home.id, week, "Bye")
            } else {
                weekMatchups.push(`${home.name} vs ${away.name}`);
                updateSchedule(home.id, week, away.name)
                updateSchedule(away.id, week, home.name)
            } 
        }
        //add week matchups to the schedule
        schedule.push(weekMatchups);

        
        //rotate the array for the next week (except the first element)
        const last = advisories.pop();
        advisories.splice(1, 0, last);
    }
    //return the schedule list, which has the week matchups
    return schedule;
}

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
            const opponent = advisory[`week${week + 1}`];
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
async function updateSchedule(teamId, week, otherteam) {
    //if team doesn't exist
    if (!teamId) return;
    //attempt to update doc
    try {
        //doc1 is the advisory that is attempting to be updated
        const doc1 = doc(db, "advisory-olympics", teamId)
        //update the doc by adding the week and opponent
        //week+1 is because it starts at week 0
        await updateDoc(doc1,  {[`week${week + 1}`]: otherteam },);
        //print the update
        console.log(`Updated ${teamId} for week ${week + 1}: Opponent is ${otherteam}`);
        //if error, print
    } catch (error) {
        console.error(`Error updating document for ${teamId}:`, error);
    }
}

//if a new schedule needs to be generated, this is called in getAdvisories
function generateNewSchedule() {
    //clear schedule list
    document.getElementById("schedule").innerHTML = "";
    //clear weekDropdown
    document.getElementById("weekDropdown").innerHTML = "<option value=''>Select Week</option>";
    //pull the advisory olympics collection from firebase
    document.getElementById("matchups").innerHTML = "";
    //then make a list 
    getDocs(collection(db, "advisory-olympics")).then((list) => {
        //make an array called advisories
        const advisories = [];
        //add each doc from firebase into advisories
        //attach the id from the doc to the data
        list.forEach(doc => advisories.push({ id: doc.id, ...doc.data() }));
        //generate the new schedule with the list of advisories
        schedule = generateSchedule(advisories);
        //render the schedule on the table
        renderSchedule(schedule);
    });
}

//add event listener to the generate button
document.getElementById("generateButton").addEventListener("click", generateNewSchedule);
//render schedule in the table
function renderSchedule(schedule) {
    //access the table in HTML called schedule
    const scheduleTable = document.getElementById("schedule");
    const weekDropdown = document.getElementById("weekDropdown");

    //for each week, create a row in the table
    schedule.forEach((weekMatchups, index) => {
        //add a row
        const row = document.createElement("tr");

        //this is the week column
        //add a cell 
        const weekCell = document.createElement("td");
        //week + the text content of the index + 1 so the weeks keep adding up
        weekCell.textContent = `Week ${index + 1}`;
        //add the week cell to the row
        row.appendChild(weekCell);

        //this is the matchups column
        //add a cell
        const matchupCell = document.createElement("td");
        //add the matchups from the list
        matchupCell.innerHTML = weekMatchups.join("<br>");
        //add the cell to the row
        row.appendChild(matchupCell);

        //add the row to the table
        scheduleTable.appendChild(row);

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
        const matchups = schedule[selectedWeek];
        //clear the previous display
        matchupDisplay.innerHTML = ""; 
        //create a container for the matchups
        const matchupContainer = document.createElement("div");
        //create a class called matchup container
        matchupContainer.className = "matchup-container";
        //add each matchup as a card
        matchups.forEach(matchup => {
            if (matchup.toLowerCase().indexOf("bye") === -1){
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
        matchupDisplay.innerHTML = "No week selected.";
    }
}

//this gets the advisories from firebase and adds them to a list
async function getAdvisories() {
    //create an empty list of the advisories
    const advisories = [];

    //this attempts to get the advisories from firebase
    try {
        //add the docs from firebase to a list
        const list = await getDocs(collection(db, "advisory-olympics"));
        let scheduleExists = false;

        //for each doc in the list
        list.forEach(doc => {
            //add the name of each advisory to the advisories list
            advisories.push({ id: doc.id, ...doc.data() }); 

        for (let i = 1; i <= advisories.length - 1; i++) {
            if (doc.data()[`week${i+1}`]) {
                scheduleExists = true;
            }
        }
        console.log("hi")
    });
    if (scheduleExists == true) {
        console.log("Schedule already exists");
        schedule = getFirebaseSchedule(advisories);
    } else {
        console.log("Making new schedule");
        schedule = generateSchedule(advisories); 
    }
        //render the newly created schedule onto the table
        renderSchedule(schedule);
    //if the firebase fetching doesn't work, print an error
    } catch (error) {
        console.error("Error getting advisories:");
    }
}
//call the fetch function
getAdvisories();
window.displayWeekMatchups = displayWeekMatchups;
