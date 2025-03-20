// @ts-check
import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import * as firebaseui from "firebaseui";
import { collection, doc, setDoc } from "firebase/firestore";
import store from "./store.ts";
const ui = new firebaseui.auth.AuthUI(store.getState().auth);
const db = store.getState().db;

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope(
  "https://www.googleapis.com/auth/calendar.events.readonly",
);

const uiConfig: firebaseui.auth.Config = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult: any) {
      console.log(authResult);
      console.log(JSON.stringify(authResult, null, 2));
      const state = store.getState();
      //const token = authResult.credential?.accessToken;
      state.setGoogleCredential(authResult.credential);
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      //------------------------------------------------------------------------------------------
      // The code below is modified from default snippet provided by the FB documentation.
      //
      // If the user is a "brand new" user, then create a new "user" in your own database.
      // Assign this user with the name and email provided.
      // Before this works, you must enable "Firestore" from the firebase console.
      // The Firestore rules must allow the user to write.
      //------------------------------------------------------------------------------------------
      const user = authResult.user; // get the user object from the Firebase authentication database

      // Save User ID in Zustand store
      store.setState({ userId: user.uid });
      store.setState({ googleCredential: authResult.credential });

      console.log(authResult.additionalUserInfo);
      // if (authResult.additionalUserInfo.isNewUser) {         //if new user
      if (user.name !== null) {
        //if new user
        (async () => {
          try {
            if (!db) {
              console.error("db is undefined");
              return;
            }
            const docRef = doc(collection(db, "users"), user.uid);
            await setDoc(docRef, {
              name: user.displayName, //"users" collection
              email: user.email, //with authenticated user's ID (user.uid)
            });

            console.log("New user added to firestore: ", docRef.id);
            window.location.assign("main.html"); //re-direct to main.html after signup
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        })();
      } else {
        return true;
      }
      return false;
    },
    uiShown: function () {
      // Hide the loader.
      const loader = document.getElementById("loader");
      if (loader) {
        loader.style.display = "none";
      }
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "main.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    EmailAuthProvider.PROVIDER_ID,
    //GoogleAuthProvider.PROVIDER_ID,
    {
      provider: GoogleAuthProvider.PROVIDER_ID,
      scopes: ["https://www.googleapis.com/auth/calendar.events.readonly"],
      customParameters: {
        // Forces account selection even when one account
        // is available.
        //prompt: 'select_account'
      },
      authMethod: "",
    },
  ],
  // Terms of service url.
  tosUrl: "<your-tos-url>",
  // Privacy policy url.
  privacyPolicyUrl: "<your-privacy-policy-url>",
};

ui.start("#firebaseui-auth-container", uiConfig);
