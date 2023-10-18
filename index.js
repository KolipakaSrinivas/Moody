/* === Imports === */
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  // updateProfile
} from "firebase/auth";

const provider = new GoogleAuthProvider();

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcLrlzJTKtNBzQNB3dG2GkZZIWe6fDMqY",
  authDomain: "moody-271a4.firebaseapp.com",
  projectId: "moody-271a4",
  storageBucket: "moody-271a4.appspot.com",
  messagingSenderId: "326263123585",
  appId: "1:326263123585:web:4c6a8bef9920eebd5e6780",
  measurementId: "G-DYQSBY368J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

/* === Firebase Setup === */

/* === UI === */

/* == UI - Elements == */

const viewLoggedOut = document.getElementById("logged-out-view");
const viewLoggedIn = document.getElementById("logged-in-view");

const signInWithGoogleButtonEl = document.getElementById(
  "sign-in-with-google-btn"
);

const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");

const signInButtonEl = document.getElementById("sign-in-btn");
const createAccountButtonEl = document.getElementById("create-account-btn");
const signOutButtonEl = document.getElementById("sign-out-btn");
const userProfilePictureEl = document.getElementById("user-profile-picture");
const userGreetingEl = document.getElementById("user-greeting");
// const displayNameInputEl = document.getElementById("display-name-input");
// const photoURLInputEl = document.getElementById("photo-url-input");
// const updateProfileButtonEl = document.getElementById("update-profile-btn");
const moodEmojiEls = document.getElementsByClassName("mood-emoji-btn");
const textareaEl = document.getElementById("post-input");
const postButtonEl = document.getElementById("post-btn");
const fetchPostsButtonEl = document.getElementById("fetch-posts-btn");
const postsEl = document.getElementById("posts");
/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
signOutButtonEl.addEventListener("click", authSignOut);
for (let moodEmojiEl of moodEmojiEls) {
  moodEmojiEl.addEventListener("click", selectMood);
}
// updateProfileButtonEl.addEventListener("click", authUpdateProfile);
postButtonEl.addEventListener("click", postButtonPressed);
fetchPostsButtonEl.addEventListener("click", fetchOnceAndRenderPostsFromDB);

/* === State === */

let moodState = 0;

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    showProfilePicture(userProfilePictureEl, user);
    clearAuthFields();
    showUserGreeting(userGreetingEl, user);
  } else {
    showLoggedOutView();
  }
});

/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
  signInWithPopup(auth, provider)
    .then((result) => {
      showLoggedInView();
    })
    .catch((error) => {
      console.log(error.message);
    });
}

function authSignInWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      clearAuthFields();
    })
    .catch((error) => {
      console.log(error);
    });
}

function authCreateAccountWithEmail() {
  const email = emailInputEl.value;
  const password = passwordInputEl.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("user created");
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      clearAuthFields();
    })
    .catch((error) => {
      console.error(error);
    });
}
// function authUpdateProfile() {
//   const newDisplayName = displayNameInputEl.value;
//   const newPhotoURL = photoURLInputEl.value;

//   updateProfile(auth.currentUser, {
//     displayName: newDisplayName,
//     photoURL: newPhotoURL
//   })
//     .then(() => {
//       console.log("Profile updated!");
//     })
//     .catch((error) => {
//       console.log(error.message);
//     });
// }

/* = Functions - Firebase - Cloud Firestore = */

async function addPostToDB(postBody, user) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      body: postBody,
      uid: user.uid,
      createdAt: serverTimestamp(),
      mood: moodState
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function fetchOnceAndRenderPostsFromDB() {
  const querySnapshot = await getDocs(collection(db, "posts"));
  clearAll(postsEl)
  querySnapshot.forEach((doc) => {
    renderPost(postsEl, doc.data());
  });
}





/* == Functions - UI Functions == */
function renderPost(postsEl, postData) {
  postsEl.innerHTML += `
        <div class="post">
            <div class="header">
                <h3>${displayDate(postData.createdAt)}</h3>
                <img src="assets/emojis/${postData.mood}.png">
            </div>
            <p>
            ${replaceNewlinesWithBrTags(postData.body)}
            </p>
        </div>
    `
}

function replaceNewlinesWithBrTags(inputString) {
  return inputString.replace(/\n/g, "<br>")
}




function postButtonPressed() {
  const postBody = textareaEl.value;
  const user = auth.currentUser;

  if (postBody) {
    addPostToDB(postBody, user);
    clearInputField(textareaEl);
  }
}

function clearAll(element) {
  element.innerHTML = ""
}

function showLoggedOutView() {
  hideElement(viewLoggedIn);
  showElement(viewLoggedOut);
}

function showLoggedInView() {
  hideElement(viewLoggedOut);
  showElement(viewLoggedIn);
}

function showElement(element) {
  element.style.display = "flex";
}

function hideElement(element) {
  element.style.display = "none";
}

function clearInputField(field) {
  field.value = "";
}

function clearAuthFields() {
  emailInputEl.value = "";
  passwordInputEl.value = "";
}

function showProfilePicture(imgElement, user) {
  const photoURL = user.photoURL;
  if (photoURL) {
    imgElement.src = photoURL;
  } else {
    imgElement.src = "./assets/images/default-profile-picture.jpeg";
  }
}

function showUserGreeting(element, user) {
  const displayName = user.displayName;

  if (displayName) {
    const firstName = displayName.split(" ")[0];
    element.textContent = `Hey ${firstName}, how are you?`;
  } else {
    element.textContent = "Hey friend, how are you?";
  }
}

function displayDate(firebaseDate) {
  const date = firebaseDate.toDate();

  const day = date.getDate();
  const year = date.getFullYear();

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const month = monthNames[date.getMonth()];

  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  return `${day} ${month} ${year} - ${hours}:${minutes}`;
}

/* = Functions - UI Functions - Mood = */

function selectMood(event) {
  const selectedMoodEmojiElementId = event.currentTarget.id;

  changeMoodsStyleAfterSelection(selectedMoodEmojiElementId, moodEmojiEls);

  const chosenMoodValue = returnMoodValueFromElementId(
    selectedMoodEmojiElementId
  );

  moodState = chosenMoodValue;
}

function changeMoodsStyleAfterSelection(
  selectedMoodElementId,
  allMoodElements
) {
  for (let moodEmojiEl of moodEmojiEls) {
    if (selectedMoodElementId === moodEmojiEl.id) {
      moodEmojiEl.classList.remove("unselected-emoji");
      moodEmojiEl.classList.add("selected-emoji");
    } else {
      moodEmojiEl.classList.remove("selected-emoji");
      moodEmojiEl.classList.add("unselected-emoji");
    }
  }
}

function resetAllMoodElements(allMoodElements) {
  for (let moodEmojiEl of allMoodElements) {
    moodEmojiEl.classList.remove("selected-emoji");
    moodEmojiEl.classList.remove("unselected-emoji");
  }

  moodState = 0;
}

function returnMoodValueFromElementId(elementId) {
  return Number(elementId.slice(5));
}
