import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import LoginForm from "../components/login"
import RegisterForm from "../components/register"
import SEO from "../components/seo"



const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <div className="wrapper">
        <div className="wstep-div" id="wstep">
           <div className="wstep-div-text">
             <p className="wstep-div-text-p">Tu będzie jakiś ładny slogan</p>
           </div>
        </div>
        
        <div className="rejestracja-div"  id="rejestracja">
         <RegisterForm />
        </div>
    </div>
  </Layout>
) 

export default IndexPage
