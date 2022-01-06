import { db, storage } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";

import { parseAsync } from "json2csv";
import { useFetch } from "../hooks/useFetch";

const csv = require("csvtojson");

export const useCSVStorage = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [url, setUrl] = useState("");
  const { data, isPending: fetchIsPending, error: fetchError } = useFetch(url);
  const [storageData, setStorageData] = useState(null);

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

  const download = async (id) => {
    setIsPending(true);
    setError(null);

    try {
      const downloadRef = ref(storage, `scrobbleFiles/${id}/scrobbles.csv`);
      const downloadUrl = await getDownloadURL(downloadRef);
      if (!isCancelled) {
        setUrl(downloadUrl);
        setIsPending(false);
      }
    } catch (err) {
      if (!isCancelled) {
        setIsPending(false);
        setError(err.message);
      }
    }
  };

  const memoizedDownload = useCallback(download, [isCancelled]);

  useEffect(() => {
    if (fetchIsPending) {
      setIsPending(true);
    }
    if (fetchError) {
      setError(fetchError);
    }
    if (data && !storageData) {
      csv({ output: "csv" })
        .fromString(data)
        .then((json) => setStorageData(json));
    }
  }, [fetchIsPending, fetchError, data, storageData]);

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { error, isPending, upload: memoizedUpload, storageData, download: memoizedDownload };
};
