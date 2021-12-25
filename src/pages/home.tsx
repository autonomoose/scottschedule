import React from 'react'
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout'
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo'

const HomePage = () => {
    const vdebug = useQueryParam('debug', '');

    return(
    <Layout>
      <Seo title="Scottschedule Home" />
      <PageTopper pname="Home" vdebug={vdebug}
        helpPage="/help/home"
      />
      Signed in to the home page
    </Layout>
) };

export default HomePage
