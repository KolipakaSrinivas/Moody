/* === Imports === */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
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
const displayNameInputEl = document.getElementById("display-name-input");
const photoURLInputEl = document.getElementById("photo-url-input");
const updateProfileButtonEl = document.getElementById("update-profile-btn");
/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
signOutButtonEl.addEventListener("click", authSignOut);
updateProfileButtonEl.addEventListener("click", authUpdateProfile);
/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    clearAuthFields();
    showProfilePicture(userProfilePictureEl, user);
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
function authUpdateProfile() {
  const newDisplayName = displayNameInputEl.value;
  const newPhotoURL = photoURLInputEl.value;

  updateProfile(auth.currentUser, {
    displayName: newDisplayName,
    photoURL: newPhotoURL
  })
    .then(() => {
      console.log("Profile updated!");
    })
    .catch((error) => {
      console.log(error.message);
    });
}

/* == Functions - UI Functions == */

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
