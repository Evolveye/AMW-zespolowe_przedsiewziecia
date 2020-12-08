import React from "react"
import { Router } from "@reach/router"
import Layout from "../components/layout"
import Profile from "../components/profile"
import Login from "../components/login2"
import PrivateRoute from "../components/privateRoute"
const App = () => (
  <Layout>
    <Router>
        <PrivateRoute path="/app/profile" component={Profile} /> 
        <Login path="/app/login2" />
    </Router>
  </Layout>
)
export default App