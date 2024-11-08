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

await deleteDoc(doc(db, "advisory-olympics", "LA"), {
  //rank: 2,
  //name: "The LITTmann",
  //points: "10",
  //record: "3-0-1"
});

//change clark sharks, bussey bears, big macs, LITTmann record

async function addAdvisories() {
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
 addAdvisories();




const querySnapshot = await getDocs(collection(db, "advisory-olympics"));
querySnapshot.forEach((doc) => {
    const advisory = doc.data();
  console.log(advisory.name, " => ", doc.data());
})

