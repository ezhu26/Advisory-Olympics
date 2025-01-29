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

//await setDoc(doc(db, "advisory-olympics", "LITTMAN"), {
  //rank: 2,
  //name: "The LITTmann",
  //points: "10",
  //record: "3-0-1"
//});

//change clark sharks, bussey bears, big macs, LITTmann record
/*async function addAdvisories() {
  //try to add, if it doesn't work, add error
    try {
      //get docs from the collection
        const advisories = await getDocs(collection(db, "advisory-olympics"));
        //make a new row
        const newRow = document.getElementById("body");
        //for each advisory
        advisories.forEach((doc) => {
          //the data from each
            const advisory = doc.data();
            //create a new row
            const row = document.createElement("tr");
            //make a cell for rank
            const rank1 = document.createElement("td");
            //add the content of the rank
            rank1.textContent = advisory.rank;
            //add it to the row
            row.appendChild(rank1);
            //repeat these steps for the attributes below
            const name1 = document.createElement("td");
            name1.textContent = advisory.name;
            row.appendChild(name1);
            const points1 = document.createElement("td");
            points1.textContent = advisory.points;
            row.appendChild(points1);
            const record1 = document.createElement("td");
            record1.textContent = advisory.record;
            row.appendChild(record1);
            newRow.appendChild(row);
        });
    }
    //if it is an error, report it
    catch(error) {
        console.log("error", error)
    }
 }
 //call the function and all of the advisories
 addAdvisories();*/

 //this function is called to get the data from firebase
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
    let rank = 1;
    //this is used for seeing if the points of the last team is the same, to be able to assign teams the same rank
    let lastPoints = null;
  
    //for each item in the array, if the points of this advisory is not equal to the points of the last advisory, the rank equals the amount of advisories that have been tested plus 1
    data.forEach((item, index) => {
      if (item.points !== lastPoints) {
        //add one to the index
        rank = index + 1;
      }
      //assign the rank
      item.rank = rank; 
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
        window.onload = function() {
            showItems().then(() => {
                console.log("Table loaded.");
            });
        };
/*const querySnapshot = await getDocs(collection(db, "advisory-olympics"));
querySnapshot.forEach((doc) => {
    const advisory = doc.data();
  console.log(advisory.name, " => ", doc.data());
})*/

window.updateTeamRecord = updateTeamRecord;
