import { getAuth, onAuthStateChanged } from "firebase/auth";

import { doc } from "firebase/firestore";
import { UserData } from "../Api";
import { CalSyncApi } from "../CalSyncApi.ts";
import store from "../store.ts";

export async function getUserRef() {
  const { db, userId } = store.getState();
  const auth = getAuth();
  // if (!userId) {
  //   throw Error("userId is undefined");
  // }
  const uid: string = await new Promise<string>((resolve, reject) => {
    if (userId) {
      resolve(userId);
    }
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        store.setState({ userId: uid });
        resolve(uid);
        // ...
      } else {
        // User is signed out
        // ...
        if (!String(window.location).includes("login.html")) {
          window.location.assign("/login.html");
        }
        reject("Not signed in");
      }
    });
  });

  return doc(db, "users", uid).withConverter(CalSyncApi.converter<UserData>());
}
