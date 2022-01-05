import "./Home.css";

import { useEffect, useReducer, useState } from "react";

import { useFetch } from "../../hooks/useFetch";

const infoReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, page: 0 };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_TOTAL_PAGES":
      return { ...state, totalPages: action.payload };
    case "SET_ALL":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default function Home() {
  const [url, setUrl] = useState("");
  const { data, isPending, error } = useFetch(url);
  const [infoState, dispatch] = useReducer(infoReducer, { page: 0, totalPages: 0, user: "" });
  const [tracks, setTracks] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: check if user data is already in storage

    setUrl(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${infoState.user}` +
        `&api_key=${process.env.REACT_APP_API_KEY}&format=json&limit=200`
    );
  };

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
      setTracks((prevTracks) => [...prevTracks, ...trackList]);
    }
  }, [data]);

  useEffect(() => {
    if (infoState.page !== 0 && infoState.page < infoState.totalPages) {
      setUrl(
        `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${infoState.user}` +
          `&api_key=${process.env.REACT_APP_API_KEY}&format=json&limit=200` +
          `&page=${infoState.page + 1}`
      );
    }

    // TODO: handle cancelling fetch
    // TODO: store data in firestore
  }, [infoState]);

  return (
    <div>
      <h2>Data Viz</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Last.FM Username</span>
          <input
            type="text"
            onChange={(e) => dispatch({ type: "SET_USER", payload: e.target.value })}
            value={infoState.user}
            required
            disabled={url && isPending}
          />
        </label>
        {url && isPending ? (
          <button className="btn" disabled>
            Fetching...
          </button>
        ) : (
          <button className="btn">Fetch Data</button>
        )}
      </form>
      {data && isPending && (
        <p>
          Fetching data for {infoState.user}... Page {infoState.page}/{infoState.totalPages}
        </p>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
