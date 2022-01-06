import { db, storage } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";

import { parseAsync } from "json2csv";

export const useCSVStorage = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const upload = async (data, document) => {
    setIsPending(true);
    setError(null);

    try {
      // Convert data from JSON to CSV
      const csv = await parseAsync(data);

      // Upload CSV to storage
      const uploadRef = ref(storage, `scrobbleFiles/${document.id}/scrobbles.csv`);
      const metadata = { contentType: "text/csv" };
      await uploadString(uploadRef, csv, "raw", metadata);

      // Update document
      await setDoc(doc(db, "scrobbles", document.id), document.data);

      if (!isCancelled) {
        setIsPending(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setError(err.message);
        setIsPending(false);
      }
    }
  };

  const memoizedUpload = useCallback(upload, [isCancelled]);

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { error, isPending, upload: memoizedUpload };
};
