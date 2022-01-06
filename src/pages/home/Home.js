import "./Home.css";

import { Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";

import { db } from "../../firebase/config";
import { useCSVStorage } from "../../hooks/useCSVStorage";
import { useFetch } from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";

const infoReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, page: 0 };
    case "SET_ALL":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default function Home({ setScrobbleData }) {
  const {
    upload,
    download,
    storageData,
    error: storageError,
    isPending: isStoragePending,
  } = useCSVStorage();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchFromDate, setFetchFromDate] = useState(null);
  const [url, setUrl] = useState("");
  const { data, error: fetchError } = useFetch(url);
  const [infoState, dispatch] = useReducer(infoReducer, { page: 0, totalPages: 0, user: "" });
  const [tracks, setTracks] = useState([]);
  const [time, setTime] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    dispatch({ type: "SET_USER", payload: e.target.value });
    setTracks([]);
    setSuccess(false);
    setFetchFromDate(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTime(Timestamp.now());
    setUrl(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${infoState.user}` +
        `&api_key=${process.env.REACT_APP_API_KEY}&format=json&limit=200`
    );
  };

  // Handle setting tracks and infoState
  useEffect(() => {
    if (data) {
      const { track: trackList, "@attr": attr } = data["recenttracks"];
      dispatch({
        type: "SET_ALL",
        payload: {
          user: attr["user"],
          totalPages: parseInt(attr["totalPages"]),
          page: parseInt(attr["page"]),
        },
      });
      setTracks((prevTracks) => [
        ...prevTracks,
        ...trackList.map((track) => {
          return {
            artist: track.artist["#text"],
            album: track.album["#text"],
            title: track.name,
            date: track.date["uts"],
          };
        }),
      ]);
    }
  }, [data]);

  // Handle updating url
  useEffect(() => {
    if (infoState.page === 1) {
      // Check if data exists in storage
      getDoc(doc(db, "scrobbles", infoState.user))
        .then((doc) => {
          download(infoState.user);
          setFetchFromDate(doc.exists() ? doc.data().lastUpdated.seconds : 0);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    if (infoState.page !== 0 && infoState.page < infoState.totalPages && fetchFromDate !== null) {
      // Prevents flickering when user's data is up to date
      if (infoState.page === 2) {
        setIsFetching(true);
      }
      setUrl(
        `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${infoState.user}` +
          `&api_key=${process.env.REACT_APP_API_KEY}&format=json&limit=200` +
          `&page=${infoState.page + 1}&from=${fetchFromDate}`
      );
    }

    // TODO: handle cancelling fetch
  }, [infoState, fetchFromDate, download]);

  //temp
  useEffect(() => {
    if (storageData) {
      console.log(storageData);
    }
  }, [storageData]);

  // Handle adding data to storage
  useEffect(() => {
    if (infoState.page !== 0 && infoState.page === infoState.totalPages && isFetching) {
      setIsFetching(false);
      upload(tracks, {
        id: infoState.user,
        data: { lastUpdated: time, lastUsed: Timestamp.now() },
      });
      setScrobbleData({ scrobbles: tracks, user: infoState.user });
      setSuccess(true);
    } else if (infoState.page > infoState.totalPages) {
      setIsFetching(false);
      setScrobbleData({ scrobbles: tracks, user: infoState.user });
      setSuccess(true);
    }
  }, [infoState, tracks, time, upload, isFetching, setScrobbleData]);

  return (
    <div className="home">
      <h2>Data Viz</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Last.FM Username</span>
          <input
            type="text"
            onChange={(e) => handleChange(e)}
            value={infoState.user}
            required
            disabled={isFetching}
          />
        </label>
        {isFetching ? (
          <button className="btn" disabled>
            Fetching...
          </button>
        ) : (
          <button className="btn">Fetch Data</button>
        )}
      </form>

      {data && isFetching && (
        <p>
          Fetching data for {infoState.user}... Page {infoState.page}/{infoState.totalPages}
        </p>
      )}

      {fetchError && (
        <div className="error">
          <p>{fetchError}</p>
          <button className="btn" onClick={() => setUrl((prevUrl) => prevUrl + "#")}>
            Retry
          </button>
        </div>
      )}

      {storageError && (
        <div className="error">
          <p>{storageError}</p>
          <button className="btn" onClick={() => setTracks((prevTracks) => [...prevTracks])}>
            Retry
          </button>
        </div>
      )}

      {isStoragePending ? (
        <p>Uploading data...</p>
      ) : success ? (
        <div className="success">
          <p>Data processed successfully</p>
          <button className="btn" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
