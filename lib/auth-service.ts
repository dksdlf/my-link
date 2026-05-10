import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user already has a document
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // New user: create profile and nickname
      const email = user.email || "";
      const baseNickname = email.split("@")[0] || user.uid.substring(0, 8);
      let nickname = baseNickname;
      let nicknameDocRef = doc(db, "nicknames", nickname);
      let nicknameDocSnap = await getDoc(nicknameDocRef);

      // Simple collision handling: append random number if nickname exists
      let attempts = 0;
      while (nicknameDocSnap.exists() && attempts < 5) {
        nickname = `${baseNickname}${Math.floor(Math.random() * 1000)}`;
        nicknameDocRef = doc(db, "nicknames", nickname);
        nicknameDocSnap = await getDoc(nicknameDocRef);
        attempts++;
      }

      // Batch write to ensure both user doc and nickname doc are created together
      const batch = writeBatch(db);

      const newUserData = {
        email: email,
        nickname: nickname,
        username: user.displayName || "Anonymous",
        bio: "안녕하세요, 제 마이링크입니다.",
        avatarUrl: user.photoURL || "",
        createdAt: new Date().toISOString(),
      };

      batch.set(userDocRef, newUserData);
      batch.set(nicknameDocRef, { uid: user.uid });

      await batch.commit();
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
