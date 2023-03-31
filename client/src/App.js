import { BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import io from "socket.io-client";

import PageRender from "./customRouter/PageRender";
import PrivateRouter from "./customRouter/PrivateRouter";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import HomePage from "./pages/homepage";
import Alert from "./old_components/alert/Alert";
import Header from "./old_components/header/Header";
import StatusModal from "./old_components/StatusModal";
import { refreshToken } from "./redux/actions/authAction";
import { getPosts } from "./redux/actions/postAction";
import { getSuggestions } from "./redux/actions/suggestionsAction";
import { getNotifies } from "./redux/actions/notifyAction";

import AdminDashboard from "./pages/adminDashboard";
import { GLOBALTYPES } from "./redux/actions/globalTypes";
import SocketClient from "./SocketClient";
import Navbar from "./components/header";
function App() {
  const { auth, status, modal, userType } = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshToken());

    const socket = io();
    // const socket = io.connect(window.location.hostname+':8080', {transports: ["websocket", "xhr-polling", "htmlfile", "jsonp-polling"]});
    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket });
    return () => socket.close();
  }, [dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token));
      dispatch(getSuggestions(auth.token));
      dispatch(getNotifies(auth.token));
    }
  }, [dispatch, auth.token]);

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
        }
      });
    }
  }, []);

  return (
    <Router>
      <Alert />
      <input type="checkbox" id="theme" />
      <div className={`App ${(status || modal) && "mode"}`}>
        <div className="main">
          {userType === "user" && auth.token && <Navbar />}
          {status && <StatusModal />}
          {auth.token && <SocketClient />}
          <Route
            exact
            path="/"
            component={
              userType === "user"
                ? auth.token
                  ? Home
                  : HomePage
                : // : Login
                // : HomePage
                auth.token
                ? AdminDashboard
                : Login
            }
          />

          {userType === "user" && (
            <>
              <Route exact path="/login" component={withRouter(Login)} />
              <Route exact path="/register" component={Register} />

              <div className="wrap_page">
                <PrivateRouter exact path="/:page" component={PageRender} />
                <PrivateRouter exact path="/:page/:id" component={PageRender} />
              </div>
            </>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
