import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useCallback, useEffect, useState } from "react";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const pako = require("pako");

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
      const json = JSON.stringify(data);
      const compressed = pako.deflateRaw(json);
      const uploadRef = ref(getStorage(), `scrobbleFiles/${document.id}/scrobbles.json`);
      const metadata = { contentType: "text/json", contentEncoding: "deflate" };
      await uploadBytes(uploadRef, compressed, metadata);

      // Update document
      await setDoc(doc(getFirestore(), "scrobbles", document.id), document.data);

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
      const downloadRef = ref(getStorage(), `scrobbleFiles/${id}/scrobbles.json`);
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
