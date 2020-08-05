let db;

// Initializing indexedDB "budget" database 
const request = indexedDB.open("budget",1);

// Creating objectStore within DB
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("heldTransaction", {autoIncrement:true});
};

// Check if online
request.onsuccess = (event) => {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    };
};

// Checking for errors
request.onerror = function(event) {
    console.log("Error: " + event.target.errorCode);
};

// Function called in index.js if inital post to server failed
function saveRecord(record) {
    // Transaction with readwrite access
    const transaction = db.transaction(["heldTransaction"], "readwrite");
  
    // Accessing heldTransaction object store
    const hTStore = transaction.objectStore("heldTransaction");
  
    // Adding record to hTStore
    hTStore.add(record);
}

// Function for if online
function checkDatabase() {
    // Transaction with readwrite access
    const transaction = db.transaction(["heldTransaction"], "readwrite");
    // Accessing heldTransaction object store
    const hTStore = transaction.objectStore("heldTransaction");
    // Setting all records to a variable
    const getAll = hTStore.getAll();
  
    // Using route to post all heldTransaction records to server DB
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          // If successful, opening a transaction with readwrite access
          const transaction = db.transaction(["heldTransaction"], "readwrite");
  
          // Accessing heldTransaction object store
          const hTStore = transaction.objectStore("heldTransaction");
  
          // Clearing all records in hTStore
          hTStore.clear();
        });
      }
    };
  }

// Listening for app coming back online
window.addEventListener("online", checkDatabase);