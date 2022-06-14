import React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import { Link } from "gatsby";
import LayoutPub from '../components/layoutpub'
import Seo from '../components/seo'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface FeatureBoxProp {
    title: string,
    descr: string,
}
const FeatureBox = (props: FeatureBoxProp) => {
    return(
      <Card sx={{maxWidth: 180, marginRight: 2, marginBottom: 2, boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box display="flex" justifyContent="center" sx={{bgcolor: 'site.main'}}>
          <Typography my={1}>
            {props.title}
          </Typography>
        </Box>
        <Box ml={2} mt={1} mb={2} px={1} display="flex" justifyContent="center">
          <Typography>
            {props.descr}
          </Typography>
        </Box>
      </Card>
)}

const IndexPage = () => {

  return (
      <LayoutPub>
      <Seo title="Scottschedule" description="Complex reminders and schedules" />
        <Box display="flex" alignItems="flex-start" justifyContent="center" data-testid='intro'>
          <Box ml={2}>
          <StaticImage alt="" width={160} loading="eager" aria-labelledby="site-name" src="../images/wernerdigital-hosted.png" />
          </Box>
          <Box mt={6} ml={1}>
            <Typography variant='h3' component='h1'  id="site-name">
              Scottschedule
            </Typography>
            <Typography>
              Setup and manage complex recurring reminders.
            </Typography>

            <Box display="flex">
            <Link to="/home">
                <Button variant="outlined" sx={{marginTop: 2, marginLeft: 10, marginRight: 3}} >Sign&nbsp;In</Button>
            </Link>
            <Typography>
              (or signup for a free account!)
            </Typography>
            </Box>

          </Box>
        </Box>
        <Box display="flex" alignItems="flex-start" justifyContent="center">
        <ul>
          <Typography variant='h6'>
            Current Version: 1.3.0-beta
          </Typography>
          <Box ml={2}>
            <li>06/12/22 - flexible dark mode, bug fixes</li>
            <li>04/27/22 - patches, minor features logging, countdown</li>
          </Box>
        </ul>
        </Box>
        <Box display="flex" justifyContent="center">
        <Typography variant='h6'>
          Features:
        </Typography>
        </Box>
        <Box display="flex" justifyContent="center" flexWrap="wrap">
          <FeatureBox title="Adaptive" descr="Automatically adapts to a wide variety of screen sizes and devices "/>
          <FeatureBox title="Flexible" descr="Design rules and conditions to cover almost any complex schedule"/>
          <FeatureBox title="Customizable" descr="Adjust sounds and appearance, configurable warning and repeat intervals"/>
          <FeatureBox title="Reliable" descr="Built-in security and automated testing for dependability and privacy"/>
          <FeatureBox title="Lightweight" descr="Runs in most modern browsers, no app installation required"/>
          <FeatureBox title="Predictable" descr="Logging, future event display, countdown to next event"/>
          <FeatureBox title="Easy" descr="Quickstart examples and cookbook style schedule designer"/>
        </Box>

      </LayoutPub>
  )
}

export default IndexPage
