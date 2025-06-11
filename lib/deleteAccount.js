import { auth, db, storage } from "./firebase";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDocs,
  collection,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  listAll,
} from "firebase/storage";

// Hjälpfunktion: ta bort en subcollection (likesGiven, likesReceived etc.)
const deleteSubcollection = async (userId, subcollectionName) => {
  const subRef = collection(db, "users", userId, subcollectionName);
  const snapshot = await getDocs(subRef);
  const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.allSettled(deletions);
};

// Hjälpfunktion: radera alla bilder i en Storage-mapp
const deleteFilesInFolder = async (folderRef) => {
  try {
    const result = await listAll(folderRef);
    const deletions = result.items.map((itemRef) => deleteObject(itemRef));
    await Promise.allSettled(deletions);
  } catch (error) {
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
};

const deleteUserStorageFiles = async (userId) => {
  const profileImagesRef = ref(storage, `profileImages/${userId}/`);
  const userImagesRef = ref(storage, `user_images/${userId}/`);

  await deleteFilesInFolder(profileImagesRef);
  await deleteFilesInFolder(userImagesRef);
};

// Reautentisera användaren
const reauthenticate = async (user, password) => {
  const credential = EmailAuthProvider.credential(user.email, password);
  try {
    await reauthenticateWithCredential(user, credential);
    return true;
  } catch (error) {
    console.error("Reauthentication failed", error);
    return false;
  }
};

// 🧹 Ta bort användaren från andras dokument
const cleanUpReferencesInOtherUsers = async (deletedUserId) => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const tasks = [];

  usersSnapshot.forEach(userDoc => {
    const userId = userDoc.id;
    if (userId === deletedUserId) return;

    tasks.push(deleteDoc(doc(db, `users/${userId}/likesReceived/${deletedUserId}`)));
    tasks.push(deleteDoc(doc(db, `users/${userId}/likesGiven/${deletedUserId}`)));
    tasks.push(deleteDoc(doc(db, `users/${userId}/skipped/${deletedUserId}`)));
    tasks.push(deleteDoc(doc(db, `users/${userId}/matches/${deletedUserId}`)));
  });

  await Promise.allSettled(tasks);
};

// 🧹 Ta bort användaren från "allUsers" samlingen
const removeFromAllUsers = async (userId) => {
  try {
    await deleteDoc(doc(db, "allUsers", userId));
  } catch (error) {
    console.warn("Kunde inte ta bort användaren från allUsers:", error);
  }
};

export const deleteAccountAndData = async (password) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Ingen användare är inloggad.");
    return false;
  }

  if (!password) {
    alert("Du måste ange ditt lösenord för att radera kontot.");
    return false;
  }

  const reauthSuccess = await reauthenticate(currentUser, password);
  if (!reauthSuccess) {
    alert("Inloggning misslyckades. Kontrollera ditt lösenord och försök igen.");
    return false;
  }

  const userId = currentUser.uid;

  try {
    // 🔴 Märk användaren som inaktiv så den döljs direkt
    await setDoc(doc(db, "users", userId), { active: false }, { merge: true });

    // 🧹 Rensa egna subcollections
    const subcollections = ["likesGiven", "likesReceived", "matches", "skipped"];
    for (const name of subcollections) {
      await deleteSubcollection(userId, name);
    }

    // 🧹 Rensa från andras likes/skipped/match
    await cleanUpReferencesInOtherUsers(userId);

    // 🧹 Ta bort användaren från allUsers samlingen
    await removeFromAllUsers(userId);

    // 🧹 Ta bort bilder
    await deleteUserStorageFiles(userId);

    // 🧹 Radera själva användardokumentet
    await deleteDoc(doc(db, "users", userId));

    // 🧹 Radera autentiseringskonto
    await deleteUser(currentUser);

    return true;
  } catch (error) {
    console.error("Fel vid radering:", error);
    alert("Något gick fel vid borttagning av kontot.");
    return false;
  }
};
