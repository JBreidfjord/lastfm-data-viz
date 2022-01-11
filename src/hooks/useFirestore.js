import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";

const firestoreReducer = (state, action) => {
  switch (action.type) {
    case "PENDING":
      return { isPending: true, success: false, error: "" };
    case "SUCCESS":
      return { isPending: false, success: true, error: "" };
    case "ERROR":
      return { isPending: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const useFirestore = (collectionName) => {
  const [response, dispatch] = useReducer(firestoreReducer, {
    isPending: false,
    error: "",
    success: false,
  });
  const [isCancelled, setIsCancelled] = useState(false);

  const collectionRef = collection(getFirestore(), collectionName);

  const dispatchIfNotCancelled = (action) => {
    if (!isCancelled) {
      dispatch(action);
    }
  };

  const addDocument = async (data, id = null) => {
    dispatchIfNotCancelled({ type: "PENDING" });
    try {
      id ? await setDoc(doc(collectionRef, id), data) : await addDoc(collectionRef, data);
      dispatchIfNotCancelled({ type: "SUCCESS" });
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  const deleteDocument = async (id) => {
    dispatchIfNotCancelled({ type: "PENDING" });
    try {
      await deleteDoc(doc(getFirestore(), collectionName, id));
      dispatchIfNotCancelled({ type: "SUCCESS" });
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  const updateDocument = async (id, updates) => {
    dispatchIfNotCancelled({ type: "PENDING" });
    try {
      await updateDoc(doc(getFirestore(), collectionName, id), updates);
      dispatchIfNotCancelled({ type: "SUCCESS" });
    } catch (err) {
      dispatchIfNotCancelled({ type: "ERROR", payload: err.message });
    }
  };

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { addDocument, deleteDocument, updateDocument, response };
};
