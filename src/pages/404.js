import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'

const NotFoundPage = () => (
  <Layout>
    <Seo title="404: Not found" />
    <h1>PAGE NOT FOUND</h1>
  <p>page does not exist, or you do not have access to it.</p>
  <div> If the link you used to get here is from our own website or app, please
  consider reporting the event via the <Link to="/help">help page</Link> instructions.  If that is not
  possible please send email to <div>cservice<div>@wernerdigital.com</div></div>
  <br /><u><Link to="/">Back to the home page.</Link></u>
  </div>
  </Layout>
)

export default NotFoundPage
