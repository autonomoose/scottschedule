import React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import LayoutPub from '../components/layoutpub'
import Box from '@mui/material/Box'
import Seo from '../components/seo'

const IndexPage = () => {

  return (
      <LayoutPub>
      <Seo title="WDT Workbench" description="Resources for online sellers" />
        <Box display="flex" alignItems="flex-start">
          <Box ml={2}>
          <StaticImage alt="" width={160} loading="eager" aria-labelledby="site-name" src="../images/wernerdigital-hosted.png" />
          </Box>
          <Box my={6} ml={1}>
          <h1 id="site-name">Scottschedule</h1>

          </Box>
        </Box>

      </LayoutPub>
  )
}

export default IndexPage
