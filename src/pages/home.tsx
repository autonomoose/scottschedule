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
    evTstamp: number,
    evTaskId: string,
}

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState(''); // hstatus depends on hdata
    const [quiet, setQuiet] = useState(false);
    const [currSched, setCurrSched] = useState('off');
    const [futureEvs, setFutureEvs] = useState<iFutureEvent[]>([]);
    const [alarmId, setAlarmId] = useState(0);

    const DisplayFutureEvent = (props: iFutureEvent) => {
        const wkdate = new Date(props.evTstamp);
        return (
          <div>
            {wkdate.toLocaleString()} -- Task {props.evTaskId}
          </div>
    )}

    const getNextAlarm = () => {
        console.log("Looking for next alarm");
        let ret_milli = 0;
        let currdate = new Date().valueOf();
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate);

        // return milliseconds until alarm
        if (wkEvents.length > 0) {
            ret_milli = wkEvents[0].evTstamp - currdate;
        }
        console.log("milliseconds until alarm", ret_milli);
        return (ret_milli);
    };

    const AlarmTask = () => {
        setAlarmId(0);
        var currdate = new Date();
        console.log('Timer Complete', currdate.toLocaleString());

        // play sound unless quieted

        // remove current event from
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate.valueOf());
        if (wkEvents.length !== futureEvs.length) {
            console.log("cleanup current event after alarm");
            setFutureEvs(wkEvents);
            if (wkEvents.length === 0) {
                setCurrSched("off");
            }
        } else {
            console.log("no cleanup after alarm");
        }
    };

    const killAlarmTask = () => {
        if (alarmId) {
            clearTimeout(alarmId);
            setAlarmId(0);
            console.log('Cancel timer');
        }
    };

    const buildFutureEvents = (wksched: string) => {
        if (currSched !== wksched) {
                setHstatus("Loading");
                setCurrSched(wksched);
                console.log("rebuild schedule", wksched);
                killAlarmTask();

                let wkEvents: iFutureEvent[] = [];
                let currdate = new Date();
                if (wksched === "off") {
                        enqueueSnackbar(`scheduler off`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                } else if (wksched === "test1") {
                        let wkdate = new Date(currdate.valueOf());
                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '1'})

                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '2'})

                        wkdate.setSeconds(wkdate.getSeconds()+120)
                        wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '3'})

                        enqueueSnackbar(`scheduled test event 1`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );

                } else {
                        enqueueSnackbar(`rebuilt schedule`,
                                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                }

                let finalEvents: iFutureEvent[] = wkEvents.filter(item => item.evTstamp > currdate.valueOf());
                setFutureEvs(finalEvents);
                if (finalEvents.length === 0 && wksched !== "off") {
                    enqueueSnackbar(`Complete with no future events`, {variant: 'warning'});
                    setCurrSched("off");
                }
                setHstatus("");
        }
    }

    const setNow = () => {
        console.log("setnow");
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

    // init
    useEffect(() => {
        setNow();
        var intervalId = setInterval(() => {setNow()}, 10000);

        enqueueSnackbar(`init complete`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
        return () => {clearInterval(intervalId)};
    }, [enqueueSnackbar]);

    // maintain the next alarm timer, and update state
    // const [alarmId, setAlarmId] = useState();
    useEffect(() => {
        console.log("futureEvs changed", futureEvs);
        killAlarmTask();

        // build new alarm task
        if (futureEvs.length > 0) {
            //    find next alarm, and milliseconds until trigger
            var nextAlarm = getNextAlarm();
            if (nextAlarm > 0) {
                var timeoutId = setTimeout(AlarmTask, nextAlarm) as unknown as number;
                setAlarmId(timeoutId);
            } else {
                console.log('future events but no next alarm?');
            }
        }
    }, [futureEvs]);

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
