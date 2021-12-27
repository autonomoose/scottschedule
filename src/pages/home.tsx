import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout'
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo'

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

interface iFutureEvent {
    evTstamp: string,
    evTaskId: string,
}

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState(''); // hstatus depends on hdata
    const [quiet, setQuiet] = useState(false);
    const [currSched, setCurrSched] = useState('off');
    const [futureEvs, setFutureEvs] = useState<iFutureEvent[]>([]);

    const DisplayFutureEvent = (props: iFutureEvent) => {
        return (
          <div>
            {props.evTstamp} -- Task {props.evTaskId}
          </div>
    )}

    const buildFutureEvents = (wksched: string) => {
        if (currSched !== wksched) {
                setHstatus("Loading");
                setCurrSched(wksched);
                console.log("rebuild schedule", wksched);

                let wkEvents: iFutureEvent[] = [];
                if (wksched === "off") {
                        setFutureEvs(wkEvents);
                        enqueueSnackbar(`scheduler off`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                } else if (wksched === "test1") {
                        let wkdate = new Date();
                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.toLocaleString(), evTaskId: '1'})

                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.toLocaleString(), evTaskId: '1'})

                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.toLocaleString(), evTaskId: '1'})

                        setFutureEvs(wkEvents);
                        enqueueSnackbar(`scheduled test event 1`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );

                } else {
                        enqueueSnackbar(`rebuilt schedule`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                }

                setHstatus("");
        }
    }

    const setNow = () => {
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
    }
    // every ten seconds, get the time and update clock
    var currenttime = setInterval(() => {setNow()}, 10000);

    // init
    useEffect(() => {
        setNow();
        enqueueSnackbar(`init complete`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
    }, [enqueueSnackbar]);

    return(
    <Layout>
      <Seo title="Scottschedule Home" />
      <PageTopper pname="Home" vdebug={vdebug}
        helpPage="/help/home"
      />
      <Card style={{marginTop: '3px', maxWidth: 410, flex: '1 1'}}>
      <Box display="flex" justifyContent="space-around" alignItems="flex-start">
        <Box><h1 id='mainclock'>Starting...</h1></Box>
        <Box><h2 id='maindate'></h2></Box>
        <Box><Button variant={(quiet)? "contained": "outlined"} onClick={() => setQuiet(() => {return(quiet === false)})}>Quiet</Button></Box>
      </Box>

      <Box mx={1} mb={1}>
      <Button size="small" variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => buildFutureEvents("off")}>Off</Button>
      <Button size="small" variant={(currSched === "test1")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test1")}>Test1</Button>
      <Button size="small" variant={(currSched === "test2")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test2")}>Test2</Button>
      <Button size="small" variant={(currSched === "test3")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test3")}>Test3</Button>
      <Button size="small" variant={(currSched === "test4")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test4")}>Test4</Button>
      <Button size="small" variant={(currSched === "test5")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test5")}>Test5</Button>
      <Button size="small" variant={(currSched === "test6")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test6")}>Test6</Button>
      <Button size="small" variant={(currSched === "test7")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test7")}>Test7</Button>
      <Button size="small" variant={(currSched === "test8")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test8")}>Test8</Button>
      <Button size="small" variant={(currSched === "test9")? "contained": "outlined"} color="primary" onClick={() => buildFutureEvents("test9")}>Test9</Button>
      </Box>
      </Card>

    { (futureEvs.length > 0) &&
      <Card style={{marginTop: '3px', maxWidth: 410, flex: '1 1'}}>
        Upcoming Events
        { futureEvs.map(item => <DisplayFutureEvent key={item.evTstamp} {...item}/>)}
      </Card>
    }

    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default HomePage
