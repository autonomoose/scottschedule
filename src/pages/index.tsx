import React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import { Link } from "gatsby";
import LayoutPub from '../components/layoutpub'
import Seo from '../components/seo'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const IndexPage = () => {

  return (
      <LayoutPub>
      <Seo title="Scottschedule" description="Complex timer" />
        <Box display="flex" alignItems="flex-start">
          <Box ml={2}>
          <StaticImage alt="" width={160} loading="eager" aria-labelledby="site-name" src="../images/wernerdigital-hosted.png" />
          </Box>
          <Box my={6} ml={1}>
            <Typography variant='h3' component='h1'  id="site-name">
              Scottschedule
            </Typography>

            <Typography>
              This tool is designed to help manage complex schedules for caregivers,
              but can also be used to manage a wide variety of recurring timers.
            </Typography>

            <Link to="/home">
                <Button variant="outlined" sx={{marginTop: 2, marginLeft: 10, marginRight: 3}} >Sign In</Button>
            </Link>  (or signup!)

          </Box>
        </Box>
        <Typography variant='h5' component='h2'>
          Current Version: 1.2.5-beta
        </Typography>
        <Typography>
          04/27/22 - patches, minor features logging,countdown
        </Typography>
      </LayoutPub>
  )
}

export default IndexPage
