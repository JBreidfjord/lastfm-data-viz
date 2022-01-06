import { db, storage } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";

export const useStorage = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [data, setData] = useState(null);
  const [url, setUrl] = useState("");

  const upload = async (data, document) => {
    setIsPending(true);
    setError(null);

    try {
      // Upload JSON to storage
      const uploadRef = ref(storage, `scrobbleFiles/${document.id}/scrobbles.json`);
      const metadata = { contentType: "text/json" };
      await uploadString(uploadRef, JSON.stringify(data), "raw", metadata);

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
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const json = await response.json();

        if (!isCancelled) {
          setData(json);
          setIsPending(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setIsPending(false);
          setError(err.message);
        }
      }
    };

    if (url && !isCancelled) {
      fetchData();
    }

    return () => {
      controller.abort();
    };
  }, [url, isCancelled]);

  useEffect(() => {
    return () => setIsCancelled(true);
  }, []);

  return { error, isPending, upload: memoizedUpload, download: memoizedDownload, data };
};
