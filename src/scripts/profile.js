import CalSyncApi from "./CalSyncApi.js";


const user = CalSyncApi.getUser()

var currentUser;
function populateUserInfo() {
                if (user) {
                    currentUser = db.collection("users").doc(user.uid)
                    currentUser.get()
                        .then(userDoc => {
                            let userName = userDoc.data().name;
                            if (userName != null) {
                                document.getElementById("nameInput").value = userName;
                            }
                        })
                } else {
                    console.log ("No user is signed in");
                }
            }


function editUserInfo() {
   document.getElementById('nameInput').disabled = false;
}

function saveUserInfo() {
    userName = document.getElementById('nameInput').value;
    currentUser.update({
                    name: userName,
                })
                .then(() => {
                    console.log("successfully updated");
                })
    document.getElementById('nameInput').disabled = true;
}
populateUserInfo();