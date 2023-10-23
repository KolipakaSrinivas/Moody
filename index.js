/* === Imports === */
import { initializeApp } from "firebase/app";
import {
  collection,
  addDoc,
  serverTimestamp,
  getFirestore,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
  // updateProfile,
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
const postsEl = document.getElementById("posts");
const allFilterButtonEl = document.getElementById("all-filter-btn");
const filterButtonEls = document.getElementsByClassName("filter-btn");
/* == UI - Event Listeners == */

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);

signInButtonEl.addEventListener("click", authSignInWithEmail);
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
signOutButtonEl.addEventListener("click", authSignOut);

for (let moodEmojiEl of moodEmojiEls) {
  moodEmojiEl.addEventListener("click", selectMood);
}

for (let filterButtonEl of filterButtonEls) {
  filterButtonEl.addEventListener("click", selectFilter);
}

// updateProfileButtonEl.addEventListener("click", authUpdateProfile);
postButtonEl.addEventListener("click", postButtonPressed);

/* === State === */

let moodState = 0;

/* === Global Constants === */
const collectionName = "posts";

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView();
    showProfilePicture(userProfilePictureEl, user);
    showUserGreeting(userGreetingEl, user);
    updateFilterButtonStyle(allFilterButtonEl);
    fetchAllPosts(user);
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
    const docRef = await addDoc(collection(db, collectionName), {
      body: postBody,
      uid: user.uid,
      createdAt: serverTimestamp(),
      mood: moodState
    });

    // console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function updatePostInDB(docId, newBody) {
  const postRef = doc(db, collectionName, docId);

  await updateDoc(postRef, {
    body: newBody
  });
}

async function deletePostFromDB(docId) {
  await deleteDoc(doc(db, collectionName, "docId"));
}

/* async function fetchOnceAndRenderPostsFromDB() {
  const querySnapshot = await getDocs(collection(db, "posts"));
  clearAll(postsEl)
  querySnapshot.forEach((doc) => {
    renderPost(postsEl, doc.data());
  });


function fetchInRealtimeAndRenderPostsFromDB() {
  onSnapshot(collection(db, collectionName), (querySnapshot) => {
      
  })
} => "Retrieve data using 'getDocs' and incorporate an 'addEventListener' for enhanced functionality."
*/

function fetchInRealtimeAndRenderPostsFromDB(query, user) {
  onSnapshot(query, (querySnapshot) => {
    clearAll(postsEl);
    querySnapshot.forEach((doc) => {
      renderPost(postsEl, doc);
    });
  });
}

function fetchTodayPosts(user) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfDay),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostsFromDB(q, user);
}

function fetchWeekPosts(user) {
  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);

  if (startOfWeek.getDay() === 0) {
    // If today is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - 6); // Go to previous Monday
  } else {
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  }

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfWeek),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostsFromDB(q, user);
}

function fetchMonthPosts(user) {
  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    where("createdAt", ">=", startOfMonth),
    where("createdAt", "<=", endOfDay),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostsFromDB(q, user);
}

function fetchAllPosts(user) {
  const postsRef = collection(db, collectionName);

  const q = query(
    postsRef,
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  fetchInRealtimeAndRenderPostsFromDB(q, user);
}

/* == Functions - UI Functions == */
function createPostHeader(postData) {
  /*
      <div class="header">
      </div>
  */
  const headerDiv = document.createElement("div");
  headerDiv.className = "header";

  /* 
          <h3>21 Sep 2023 - 14:35</h3>
      */
  const headerDate = document.createElement("h3");
  headerDate.textContent = displayDate(postData.createdAt);
  headerDiv.appendChild(headerDate);

  /* 
          <img src="assets/emojis/5.png">
      */
  const moodImage = document.createElement("img");
  moodImage.src = `assets/emojis/${postData.mood}.png`;
  headerDiv.appendChild(moodImage);

  return headerDiv;
}

function createPostBody(postData) {
  /*
      <p>This is a post</p>
  */
  const postBody = document.createElement("p");
  postBody.innerHTML = replaceNewlinesWithBrTags(postData.body);

  return postBody;
}

function createPostUpdateButton(wholeDoc) {
  const postId = wholeDoc.id;
  const postData = wholeDoc.data();

  /* 
      <button class="edit-color">Edit</button>
  */
  const button = document.createElement("button");
  button.textContent = "Edit";
  button.classList.add("edit-color");
  button.addEventListener("click", function () {
    const newBody = prompt("Edit the post", postData.body);

    if (newBody) {
      updatePostInDB(postId, newBody);
    }
  });

  return button;
}

function createPostDeleteButton(wholeDoc) {
  const postId = wholeDoc.id;

  /* 
      <button class="delete-color">Delete</button>
  */
  const button = document.createElement("button");
  button.textContent = "Delete";
  button.classList.add("delete-color");
  button.addEventListener("click", function () {
    deletePostFromDB(postId);
  });
  return button;
}

function createPostFooter(wholeDoc) {
  /* 
      <div class="footer">
          <button>Edit</button>
      </div>
  */
  const footerDiv = document.createElement("div");
  footerDiv.className = "footer";

  footerDiv.appendChild(createPostUpdateButton(wholeDoc));
  footerDiv.appendChild(createPostDeleteButton(wholeDoc));

  return footerDiv;
}

function renderPost(postsEl, wholeDoc) {
  const postData = wholeDoc.data();
  const postDiv = document.createElement("div");
  postDiv.className = "post";

  postDiv.appendChild(createPostHeader(postData));
  postDiv.appendChild(createPostBody(postData));
  postDiv.appendChild(createPostFooter(wholeDoc));

  postsEl.appendChild(postDiv);
}

function replaceNewlinesWithBrTags(inputString) {
  return inputString.replace(/\n/g, "<br>");
}

function postButtonPressed() {
  const postBody = textareaEl.value;
  const user = auth.currentUser;

  if (postBody) {
    addPostToDB(postBody, user);
    clearInputField(textareaEl);
    resetAllMoodElements(moodEmojiEls);
  }
}

function clearAll(element) {
  element.innerHTML = "";
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
  if (!firebaseDate) {
    return "Date processing";
  }
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

/* == Functions - UI Functions - Date Filters == */

function resetAllFilterButtons(allFilterButtons) {
  for (let filterButtonEl of allFilterButtons) {
    filterButtonEl.classList.remove("selected-filter");
  }
}

function updateFilterButtonStyle(element) {
  element.classList.add("selected-filter");
}

function fetchPostsFromPeriod(period, user) {
  if (period === "today") {
    fetchTodayPosts(user);
  } else if (period === "week") {
    fetchWeekPosts(user);
  } else if (period === "month") {
    fetchMonthPosts(user);
  } else {
    fetchAllPosts(user);
  }
}

function selectFilter(event) {
  const user = auth.currentUser;

  const selectedFilterElementId = event.target.id;

  const selectedFilterPeriod = selectedFilterElementId.split("-")[0];

  const selectedFilterElement = document.getElementById(
    selectedFilterElementId
  );

  resetAllFilterButtons(filterButtonEls);

  updateFilterButtonStyle(selectedFilterElement);

  fetchPostsFromPeriod(selectedFilterPeriod, user);
}
