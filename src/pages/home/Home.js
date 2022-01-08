import "./Home.css";

import { Timestamp, doc, getDoc } from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";

import { getFirestore } from "firebase/firestore";
import { useFetch } from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { useStorage } from "../../hooks/useStorage";

const initialInfoState = {
  page: 0,
  totalPages: 0,
  totalTracks: 0,
  user: "",
  url: "",
  fetchFromDate: 0,
  fetching: false,
  doneFetching: false,
  previousChecked: false,
};

const infoReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...initialInfoState, user: action.payload };
    case "SET_INFO":
      return { ...state, ...action.payload };
    case "SET_URL":
      return { ...state, url: action.payload };
    case "SET_URL_AND_DATE":
      return { ...state, url: action.payload.url, fetchFromDate: action.payload.fetchFromDate };
    case "START_FETCH":
      return { ...state, fetching: true, doneFetching: false };
    case "FINISH_FETCH":
      return { ...state, fetching: false, doneFetching: true };
    case "SET_CHECKED":
      return { ...state, previousChecked: true };
    default:
      return state;
  }
};

export default function Home({ setScrobbleData, scrobbleData }) {
  const {
    upload,
    download,
    data: storageData,
    error: storageError,
    isPending: isStoragePending,
  } = useStorage();
  const [infoState, dispatch] = useReducer(infoReducer, initialInfoState);
  const { data, error: fetchError } = useFetch(infoState.url);
  const [tracks, setTracks] = useState([]);
  const [time, setTime] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    dispatch({ type: "SET_USER", payload: e.target.value });
    setTracks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    getDoc(doc(getFirestore(), "scrobbles", infoState.user.toLowerCase()))
      .then((doc) => {
        const fetchFromDate = doc.exists() ? doc.data().lastUpdated.seconds : 0;
        dispatch({
          type: "SET_URL_AND_DATE",
          payload: {
            url:
              `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
              `&user=${infoState.user}&api_key=${process.env.REACT_APP_API_KEY}` +
              `&format=json&limit=200&from=${fetchFromDate}`,
            fetchFromDate,
          },
        });
        if (doc.exists()) {
          download(infoState.user.toLowerCase());
        }
      })
      .catch((err) => {
        console.log(err);
      });

    dispatch({ type: "SET_CHECKED" });
    setTime(Timestamp.now());
  };

  useEffect(() => {
    if (data) {
      const { track: trackList, "@attr": attr } = data["recenttracks"];
      dispatch({
        type: "SET_INFO",
        payload: {
          totalPages: parseInt(attr["totalPages"]),
          page: parseInt(attr["page"]),
          totalTracks: parseInt(attr["total"]),
        },
      });
      if (trackList.length > 0) {
        if (attr["page"] === "1") {
          dispatch({ type: "START_FETCH" });
        }
        // Check if a song is currently being played, remove it if so
        if (trackList[0]["@attr"]) {
          if (trackList[0]["@attr"]["nowplaying"] === "true") {
            trackList.splice(0, 1);
          }
        }
        dispatch({
          type: "SET_URL",
          payload:
            `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
            `&user=${infoState.user}&api_key=${process.env.REACT_APP_API_KEY}` +
            `&format=json&limit=200&from=${infoState.fetchFromDate}&page=${1 + +attr["page"]}`,
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
      } else {
        dispatch({ type: "FINISH_FETCH" });
      }
    }
  }, [data, infoState.user, infoState.fetchFromDate]);

  useEffect(() => {
    if (
      infoState.doneFetching &&
      !scrobbleData.user &&
      infoState.previousChecked &&
      !isStoragePending
    ) {
      upload(tracks, {
        id: infoState.user.toLowerCase(),
        data: { lastUpdated: time, lastUsed: Timestamp.now() },
      });
      setScrobbleData({ scrobbles: tracks, user: infoState.user });
    }
  }, [
    infoState.user,
    infoState.doneFetching,
    infoState.previousChecked,
    isStoragePending,
    tracks,
    time,
    scrobbleData.user,
    setScrobbleData,
    upload,
  ]);

  useEffect(() => {
    if (storageData) {
      setTracks((prevTracks) => [...storageData, ...prevTracks]);
    }
  }, [storageData]);

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
            disabled={infoState.fetching}
          />
        </label>
        {infoState.fetching ? (
          <button className="btn" disabled>
            Fetching...
          </button>
        ) : (
          <button className="btn">Fetch Data</button>
        )}
      </form>

      {data && infoState.fetching && (
        <p>
          Fetching data for {infoState.user}... {tracks.length}/{infoState.totalTracks} (
          {((tracks.length / infoState.totalTracks) * 100).toFixed(2)}%)
        </p>
      )}

      {fetchError && (
        <div className="error">
          <p>{fetchError}</p>
          <button
            className="btn"
            onClick={() => dispatch({ type: "SET_URL", payload: infoState.url + "#" })}
          >
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

      {isStoragePending && <p>Transferring data...</p>}

      {scrobbleData.user && (
        <div className="success">
          <p>Data processed successfully</p>
          <button className="btn" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
