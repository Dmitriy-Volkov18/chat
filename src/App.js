import React, {useEffect} from 'react'
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import Header from "./components/Header/Header"
import Login from "./components/Login/Login"
import Chat from "./components/Chat/Chat"
import {getUser} from "./redux/actions/userActions"
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import {connect} from 'react-redux'

import ErrorAlert from "./components/ErrorAlert/ErrorAlert"

function App({getUser}) {
  useEffect(() => {
      getUser()
  }, [getUser])

  return (
    <div className="App">
      <Router>
        <Header />
        <ErrorAlert />
        <Switch>
          <PrivateRoute exact path="/" component={Chat} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </Router>

    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  getUser: () => dispatch(getUser())
})

export default connect(null, mapDispatchToProps)(App);
