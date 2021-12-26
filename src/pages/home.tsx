import React, { useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout'
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button';

const HomePage = () => {
    const vdebug = useQueryParam('debug', '');

    const [currSched, setCurrSched] = useState('off');
    const [quiet, setQuiet] = useState(false);

    // every ten seconds, get the time and update clock
    var currenttime = setInterval(() => {
        var mainclock = document.getElementById('mainclock');
        var maindate = document.getElementById('maindate');
        var wkdate = new Date();
        var hours = (wkdate.getHours() < 10)? " " + wkdate.getHours(): wkdate.getHours();
        var minutes = (wkdate.getMinutes() < 10? "0" + wkdate.getMinutes(): wkdate.getMinutes());

        if (mainclock) {
                mainclock.textContent = hours + ":" + minutes;
        } else {
                console.log("undefined mainclock");
        }
        if (maindate) {
                maindate.textContent = wkdate.toLocaleDateString("en-US", {day: "2-digit", month: "2-digit", year: "2-digit"});
        } else {
                console.log("undefined maindate");
        }
    }, 10000);

    return(
    <Layout>
      <Seo title="Scottschedule Home" />
      <PageTopper pname="Home" vdebug={vdebug}
        helpPage="/help/home"
      />
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
        <h1 id='mainclock'>Starting...</h1>
        </Box>
        <Box>
        <h2 id='maindate'></h2>
        </Box>
        <Box>
        <Button variant={(quiet)? "contained": "outlined"} onClick={() => setQuiet(() => {return(quiet === false)})}>Quiet</Button>
        </Box>
      </Box>

      <Box>
      <Button size="small" variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => setCurrSched("off")}>Off</Button>
      <Button size="small" variant={(currSched === "test1")? "contained": "outlined"} color="primary" onClick={() => setCurrSched("test1")}>Test1</Button>
      <Button size="small" variant={(currSched === "test2")? "contained": "outlined"} color="primary" onClick={() => setCurrSched("test2")}>Test2</Button>
      </Box>

      Signed in to the home page

    </Layout>
) };

export default HomePage
