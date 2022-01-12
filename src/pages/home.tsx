// prototype
//  execute events, eventTask, killEventTask, useEffect(futureEvs)
//  clock/cal, setNowDigital, useEffect(showClock),
//  cleanRebuild futurevent
//    toggleOptions(string), toggleScheds(string), changeGroup(choicelist event)
//    useEffect(currGroup,schedGroups,allTasks) - build buttons, options, update screen
//  useEffect() data init

import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
import {OptionsButtons, buildButtons, buildOptions} from '../components/schedbuttons';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import BigBellSound from '../sounds/bigbell.wav';
import DefaultSound from '../sounds/default.wav';

interface iSchedGroupList {
    [name: string]: {
        descr: string,
        schedNames: iSchedule[],
    };
};

interface iNextEvs {
    evs: iFutureEvent[],
    status: string,
    sound?: iEvsSound,
    warn?: iEvsWarn,
};

interface TempAudioProps {
    ev: iFutureEvs,
};
// pre-loads audio with html id event-audio, warn-audio
// this runs every paint, if it gets expensive, move audiocomp to state
const NextEvAudio = (props: TempAudioProps) => {
    let audioComp = [];
    let evSrc = DefaultSound;
    let evId = 'default-audio';

    if (props.ev.sound && 'name' in props.ev.sound) {
        if (props.ev.sound.name === '') {
            evSrc = ''; // silence
            evId = 'no-audio';
            console.log('event silence');
        } else if (props.ev.sound.name === 'bigbell') {
            evSrc = BigBellSound;
            evId = 'bigbell-audio';
        }
    }
    if (evSrc !== '') {
        audioComp.push({src: evSrc, id: evId});
    }

    let warnSrc = '';
    evId = '';
    if ('warn' in props.ev) {
        warnSrc = DefaultSound;
        evId = 'default';
        console.log('warn on');

        if (props.ev.warn && props.ev.warn.sound && 'name' in props.ev.warn.sound) {
            if (props.ev.warn.sound.name === '') {
                warnSrc = ''; // silence
                evId = 'no-audio';
                console.log('warn silence');
            } else if (props.ev.warn.sound.name === 'bigbell') {
                warnSrc = BigBellSound;
                evId = 'bigbell-audio';
                console.log('warn bigbell');
            }
        }
    }

    if (warnSrc !== '' && warnSrc !== evSrc) {
        audioComp.push({src: warnSrc, id: evId});
    }
    // console.log("audioList", props.ev, audioComp);
    return (
      <>
      { audioComp.map(item => {
        return (
          <audio key={item.id} id={item.id} >
            <source src={item.src} type="audio/wav" />
            Your browser doesn't support audio
          </audio>
      )})}
      </>
)}

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [showClock, setShowClock] = useState('');

    const [currGroup, setCurrGroup] = useState('');
    const [currSched, setCurrSched] = useState('off');
    const [schedButtons, setSchedButtons] = useState<iSchedButtons>({});
    const [schedOptions, setSchedOptions] = useState<iSchedOptions>({});

    const [nextEvs, setNextEvs] = useState<iNextEvs>({evs: [], status: 'none'});
    const [expiredEvs, setExpiredEvs] = useState<iFutureEvent[]>([]);
    const [futureEvs, setFutureEvs] = useState<iFutureEvs>({evs: []});
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});
    const [eventId, setEventId] = useState(0);


    // execute event
    //
    const eventTask = () => {
        setEventId(0);  // no longer able to cancel me
        var currdate = new Date();
        console.log('Timer Complete', currdate.toLocaleString());
        console.log('nextEvs', nextEvs);
        let resched = 0;  // ms to restart

        // figure out when our exec time vs event time is
        //    postCleanup, postEvent, preEvent, preWarn
        const msRel = currdate.valueOf() - nextEvs.evs[0].evTstamp;
        const msRepeat = 16000; // 14 seconds is longest permitted sound, +2 to spinup
        let msCleanup = msRepeat; // mseconds after event to cleanup
        if (nextEvs.status !== 'ack' && nextEvs.sound && nextEvs.sound.repeat && nextEvs.sound.repeat > 0) {
            msCleanup += nextEvs.sound.repeat * msRepeat;
            console.log("repeat ", msRepeat, msCleanup);
        }

        // let next_evtime = nextEvs.evs[0].evTstamp
        // let resched = next_evtime - currdate.valueOf(); // ms until event

        let execPhase = (msRel > msCleanup)? 'postCleanup': (msRel > 0)? 'postEvent': 'preEvent';
        console.log('relative to event', execPhase, msRel);

        if (execPhase === 'postCleanup') {
            // cleanup
            // remove current events (and next 30 seconds worth) from
            currdate.setSeconds(currdate.getSeconds() + 30);
            let wkEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp > currdate.valueOf());
            if (wkEvents.length !== futureEvs.evs.length) {
                let stripEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp <= currdate.valueOf());
                setExpiredEvs(stripEvents);

                setFutureEvs({...futureEvs, evs: wkEvents});
                if (wkEvents.length === 0) {
                    setCurrSched("off");
                    setHstatus("Completed");
                }
            } else {
                console.log("no cleanup after event");
            }
            return;
        }

        // on or after event time
        if (execPhase === 'postEvent') {
            // reschedule cleanup = postAck offset, ie evt+15 seconds
            resched = ((Math.floor(msRel/msRepeat) + 1) * msRepeat) - msRel;

            // play sound unless quieted
            if (nextEvs.status !== 'ack') {
                if (nextEvs.status === 'pending') {
                    setNextEvs({...nextEvs, status: 'current'});
                }
                let sname = 'default';
                if (nextEvs.sound && 'name' in nextEvs.sound && typeof(nextEvs.sound.name) !== 'undefined') {
                    sname = nextEvs.sound.name;
                }
                if (sname) {
                    const eventAudio = document.getElementById(sname+"-audio") as HTMLVideoElement;
                    if (eventAudio) {
                        eventAudio.play();
                    } else {
                        console.log("no mooo");
                    }
                } else {
                    console.log("silent mooo");
                }

                //
                // if alarm tones repeat, and aren't expired reschedule them here
                // resched within postEv offset, ie ++15 seconds * 3 = 3 * 15 + 15 postAcK = 1 min
                //
            } else {
                console.log("quieted mooo");
            }
        }

        // can't cleanup yet if repeating alarm tones

        if (resched > 0) {
            // try again later
            var timeoutId = setTimeout(eventTask, resched) as unknown as number;
            setEventId(timeoutId);
            console.log('another alarm timer', resched);
        } else {
            console.log('bad resched', resched);
        }

    };

    // use state eventId and clears it
    const killEventTask = () => {
        if (eventId) {
            clearTimeout(eventId);
            setEventId(0);
            console.log('Cancel alarm timer');
        }
    };

    // when nextEvs change, maintain the next event timer, and update state eventId
    //   this makes sure target fun gets latest copy of nextEvs
    //   ignore 'current' status, that is set/ignored by target fun
    useEffect(() => {
        if (nextEvs.status !== 'current') {
            let currdate = new Date().valueOf();
            killEventTask();
            if (nextEvs.evs.length > 0) {
                let next_evtime = nextEvs.evs[0].evTstamp
                let next_milli = next_evtime - currdate; // ms until event

                // exec function eventTask after timer
                var timeoutId = setTimeout(eventTask, (next_milli > 0)? next_milli: 10) as unknown as number;
                setEventId(timeoutId);
                console.log('restart alarm timer');
            }
        }
    }, [nextEvs]);

    // when futureEvs change, setup new nextEvs state
    useEffect(() => {
        setNextEvs({evs: [], status: 'none'});

        if (futureEvs.evs.length > 0) {
            let currdate = new Date().valueOf();
            let wkEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp > currdate);
            if (wkEvents.length > 0) {
                // set nextEvs
                //   evs: iFutureEvent[], status: string,
                //   sound?: iEvsSound, warn?: iEvsWarn,

                // filter out events that aren't next (within minute of event time)
                let next_evtime = wkEvents[0].evTstamp
                let wkevs = wkEvents.filter(item => item.evTstamp < next_evtime + 60000);

                // save with a starting status
                setNextEvs({...futureEvs, status: 'pending', evs: wkevs});
            } else {
                console.log("all future events are old");
            }
        }
    }, [futureEvs]);


    // ui functions
    // maintain the clock/calendar on scheduler ui card
    const setNowDigital = () => {
        console.log("setnow digital");
        let wkdate = new Date();

        let mainclock = document.getElementById('mainclock');
        if (mainclock) {
            // pad hours with space, minutes with 0 for readability
            let hours = (wkdate.getHours() < 10)? " " + wkdate.getHours(): wkdate.getHours();
            let minutes = (wkdate.getMinutes() < 10? "0" + wkdate.getMinutes(): wkdate.getMinutes());

            mainclock.textContent = hours + ":" + minutes;
        } else {
            console.log("undefined mainclock");
        }

        let maindate = document.getElementById('maindate');
        if (maindate) {
            maindate.textContent = wkdate.toLocaleDateString(
              "en-US", {day: "2-digit", month: "short", weekday: "short"});
        } else {
            console.log("undefined maindate");
        }
    }
    // maintain selected clock
    useEffect(() => {
        // every ten seconds, get the time and update clock
        // cleanup on useeffect return

        if (showClock && showClock !== '') {
            console.log("restart clock");
            setNowDigital();
            var intervalId = setInterval(() => {setNowDigital()}, 10000);

            return () => {clearInterval(intervalId)};
        } else {
            console.log("clock pre-init");
        }
        return () => {};
    }, [showClock]);

    // cleanly reset and rebuild future events using globals
    const cleanRebuildFutureEvents = (wkgroup: iSchedGroup, wksched: string, wkoptions: iSchedOptions) => {
            console.log("Building schedule ", wkgroup.name, wkgroup.descr, wksched);
            killEventTask();

            let wkEvents: iFutureEvs = {evs: []};
            if (wksched !== "off") {
                wkEvents = buildFutureEvents(wkgroup, wksched, allTasks, wkoptions);
                }

            // cleanup, get expired (or about to in next 30 seconds)
            let currdate = new Date();
            currdate.setSeconds(currdate.getSeconds() + 30);

            let stripEvents = wkEvents.evs.filter(item => item.evTstamp <= currdate.valueOf());
            setExpiredEvs(stripEvents);

            let finalEvents = wkEvents.evs.filter(item => item.evTstamp > currdate.valueOf());
            setFutureEvs({...wkEvents, evs: finalEvents});

            if (finalEvents.length === 0) {
                setHstatus("Ready");
                if (wksched !== "off") {
                    enqueueSnackbar(`Complete with no future events`, {variant: 'warning'});
                    setCurrSched("off");
                }
            } else {
                setHstatus("Running");
            }
    };

    // change state handle ui for optional schedule button presses
    const toggleOptions = (item: string) => {
        const newOptions = {...schedOptions};
        newOptions[item] = (schedOptions[item] === false);
        setSchedOptions(newOptions);

        if (currSched !== 'off') {
            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, currSched, newOptions);
        }
    }
    // change state currSched from schedule buttons, cleanRebuild, msg when turned off
    const toggleScheds = (wksched: string) => {
        if (currSched !== wksched) {
            setHstatus("Loading");
            setCurrSched(wksched);

            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, wksched, schedOptions);
            if (wksched === "off") {
                enqueueSnackbar(`scheduler off`,
                    {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
            }
        }
    }
    // acknowledge the buttons
    const acknowledgeEvent = () => {
        const updNext = {...nextEvs, status: 'ack'};
        setNextEvs(updNext);
    }

    // change state currGroup from choicelist, turns off currSched/cleanRebuild if nec
    const changeGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrGroup(event.target.value);
        if (currSched !== "off") {
            setCurrSched("off");
            // uses old group in call, thats OK as long as schedule is set to off
            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, 'off', schedOptions);
            enqueueSnackbar(`scheduler canceled`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
        }
    }

    // update when currGroup updates, or the background schedGroups,allTasks updates
    useEffect(() => {
        if (schedGroups[currGroup] && allTasks) {
            // set schedule buttons, example = {'test4': 'wake'}
            setSchedButtons(buildButtons({name:currGroup,...schedGroups[currGroup]}));

            // set optional schedule buttons, example = {'Miralax': true,'Sunday': false,}
            setSchedOptions(buildOptions({name:currGroup,...schedGroups[currGroup]}, allTasks));

            // update group title
            let groupElement =  document.getElementById('grouptitle');
            if (schedGroups[currGroup].descr && groupElement) {
                    groupElement.textContent = schedGroups[currGroup].descr;
            }
        }

    }, [allTasks, schedGroups, currGroup]);

    // init Data
    useEffect(() => {
        // setup events
        const wkTasks: iTask = {
            'therapy' : {descr:'therapy time, vest nebie', schedRules: [
                'begin +2:30',
                'option sunday 14:00 or +5:00',
            ]},
            'miralax' : {descr:'miralax treatment', schedRules: [
                'option miralax +2:15',
                'option miralax+sunday 13:45 or +4:45',
            ]},
            'back2bed' : {descr:'Back to Bed', schedRules: [
                'begin +2:00,16:00 or +7:00,18:45 or +7:30',
            ]},
            'backdown' : {descr:'lay back down', schedRules: [
                'begin +4:30',
                'option sunday +5:00 or 13:30 or +4:30',
            ]},
            'hook1can' : {descr:'hookup 1 can', schedRules: [
                'begin +2:30,17:00 or +7:30',
                'option sunday +0:00,+3:00 or 11:45 or +2:45',
                'option sunday+start:9:30 +0:00,+4:15',
                'option sunday+start:9:45 +0:00,+4:15',
                'option sunday+start:10:00 +0:00,+4:15',
            ]},
            'hook125' : {descr:'hookup 1.25 can', schedRules: [
                'begin +0:0,14:00 or +5:00',
                'option sunday 14:00 or +5:00,17:00 or +7:30',
            ]},
            'twominute' : {descr:'quick 2 min test ev', schedRules: [
                'begin +0:2,+0:04,+0:06',
            ]},
            'cuckoo97' : {descr:'top of the hour 9am-7pm', schedRules: [
                'begin 7:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00,++1:00',
            ]},
            'basetime' : {descr:'testing ++ and repeat', schedRules: [
                'begin +2,++2,++2',
            ]},
        }
        setAllTasks(wkTasks);

        // setup scheduleGroup
        const wkSchedGroup: iSchedGroupList = {
            'default': {descr:'main schedule', schedNames: [
                {schedName: 'main', buttonName: ' ', begins: '8:00,8:15,8:30,8:45,9:00,9:15,9:30,9:45,10:00,', schedTasks: [
                    {evTaskId: 'miralax'},
                    {evTaskId: 'therapy'},
                    {evTaskId: 'back2bed'},
                    {evTaskId: 'backdown'},
                    {evTaskId: 'hook1can'},
                    {evTaskId: 'hook125'},
                ]},
            ]},
            'test': {descr:'test schedules', schedNames: [
                {schedName: 'quick', schedTasks: [
                    {evTaskId: 'back2bed'},
                    {evTaskId: 'twominute'},
                ]},
                {schedName: 'hourly', begins: 'now', schedTasks: [
                    {evTaskId: 'cuckoo97'},
                ]},
                {schedName: 'test++', begins: 'now', sound: {name: 'bigbell', repeat: 3}, schedTasks: [
                    {evTaskId: 'basetime'},
                ]},
                {schedName: 'silent', begins: 'now', sound: {name: ''}, schedTasks: [
                    {evTaskId: 'twominute'},
                ]},
                {schedName: 'bigbell', begins: 'now', sound: {name: 'bigbell'}, schedTasks: [
                    {evTaskId: 'twominute'},
                ]},
                {schedName: 'blank', begins: 'now', schedTasks: []},
            ]},
        }
        setSchedGroups(wkSchedGroup);

        // post data init
        setShowClock('scheduler');

        let wkGroup = (wkSchedGroup)? 'default': 'new';
        setCurrGroup(wkGroup);

        let groupElement =  document.getElementById('grouptitle');
        if (wkSchedGroup[wkGroup] && groupElement) {
                groupElement.textContent = wkSchedGroup[wkGroup].descr;
        }

        // init completed
        setHstatus("Ready");
        console.log("init complete");
    }, []);

    return(
      <Layout><Seo title="Prototype 2.2 - Scottschedule" />
      <PageTopper pname="Home" vdebug={vdebug} helpPage="/help/home" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <Box><Card style={{maxWidth: 432, minWidth: 402, flex: '1 1', background: '#F5F5E6',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        <Box display={(showClock === "digital1")? 'flex': 'none'} flexDirection='column'>
          { (showClock === "digital1") &&
          <>
          <Button sx={{margin: 0}} onClick={() => setShowClock('scheduler')}>
            <Typography variant='h1' id='mainclock'
              sx={{fontWeight: 600, color: 'black', padding: 0, margin: 0}}>00:00</Typography>
          </Button>
          <Box mx={4} display='flex' justifyContent='space-between'>
            <Typography mx={1} variant='h4' id='maindate'>Day, 01/01</Typography>
            <Button onClick={() => setShowClock('scheduler')}>Close</Button>
          </Box>
          </>
          }

          {(currSched !== "off") &&
          <Box ml={1} mb={1} display="flex">
            <Button variant="contained" color="error" onClick={() => toggleScheds("off")}>Off</Button>
            <Box mx={1}>
              {currSched} - {schedGroups[currGroup].descr}
            </Box>
          </Box>
          }
        </Box>

        {(showClock === 'scheduler') &&
        <>
        <Box m={0} p={0} display="flex" justifyContent="space-around" alignItems="flex-start">
          <Box>
            <Button onClick={() => setShowClock('digital1')}><Typography variant='h3' id='mainclock' sx={{color:'#000000'}}>00:00</Typography></Button>
          </Box>
          <Box display='flex' justifyContent='center' alignContent='flex-start' flexWrap='wrap' m={0} p={0} >
            <Typography mx={1} variant='h6' id='maindate'>
              01/01/00
            </Typography><Typography mx={1} variant='caption' id='grouptitle'>
              {(currGroup && schedGroups[currGroup]) ?schedGroups[currGroup].descr: 'group title'}
            </Typography>
          </Box>
          <Box id='status'>
            <TextField margin="dense" type="text" variant="outlined" size="small"
              value={currGroup} onChange={changeGroup}
              label="Schedule Group" id="schedgroup" sx={{minWidth: 120}}
              inputProps={{'data-testid': 'schedgroup'}}
              select
            >
              {(schedGroups)
                ? Object.keys(schedGroups).map(item => {
                  return(
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                   )})
                : <MenuItem value='new'>new</MenuItem>
              }
            </TextField>
          </Box>
        </Box>

        <Box mx={1} mb={1}>
          <Button variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => toggleScheds("off")}>Off</Button>
          <OptionsButtons options={schedOptions} onClick={toggleOptions}/>
        </Box>

        <Box mx={1} my={1}>
          {Object.keys(schedButtons).map(item => {
          return (
            <Button key={item} variant={(currSched === item)? "contained": "outlined"} color="primary" onClick={() => toggleScheds(item)}>
              {schedButtons[item]}
            </Button>
          )})}
        </Box>
        </>
        }

       <Divider />
       <Box mx={1} my={1} display="flex" justifyContent="space-between" alignItems="center">
         Test <audio className="audio-element" controls >
           <source src={DefaultSound} type="audio/wav" />
           Your browser doesn't support audio
         </audio>
       </Box>
     </Card></Box>

   { ((futureEvs && futureEvs.evs.length > 0) || expiredEvs.length > 0 || (nextEvs && nextEvs.evs.length > 0)) &&
     <Box>
       { (nextEvs && nextEvs.evs.length > 0) &&
       <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 404, flex: '1 1',
          background: (nextEvs.status === 'pending')? '#FAFAFA': (nextEvs.status === 'ack')? '#F5F5E6': '#FFFFFF',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
         <Box mx={1}>
           <Box display="flex" justifyContent="space-between" alignItems="baseline">
             {(nextEvs.status === 'pending')
               ? <Typography variant='h5'>
                   Next Up
                 </Typography>
               : <Typography variant='h5' sx={{fontWeight: 600,}}>
                   Active
                 </Typography>
             }

             <Button color={(nextEvs.status === 'current')? 'error': 'primary'} onClick={acknowledgeEvent} disabled={(nextEvs.status === 'ack')}>Silence</Button>
             {(nextEvs.status === 'ack')? 'quiet': nextEvs.status}
           </Box>
           { nextEvs.evs.map(item => <DisplayFutureEvent
             key={`${item.evTstamp}:${item.evTaskId}`} item={item}
             descr={(allTasks[item.evTaskId])? allTasks[item.evTaskId].descr: 'system'}/>)
           }
         </Box>

         <NextEvAudio ev={nextEvs}/>
       </Card>
       }

       { (expiredEvs.length > 0) &&
       <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 404, flex: '1 1', background: '#FAFAFA',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
         <Box mx={1}>
           <Box display="flex" justifyContent="space-between" alignItems="baseline">
             <h4>Recent Events</h4>
             <Button onClick={() => setExpiredEvs([])}>
               Clear
             </Button>
           </Box>
           { expiredEvs.map(item => <DisplayFutureEvent
             key={`${item.evTstamp}:${item.evTaskId}`} item={item}
             descr={(allTasks[item.evTaskId])? allTasks[item.evTaskId].descr: 'system'}/>)
           }
         </Box>
       </Card>
       }

       { (futureEvs.evs.length > 0) &&
         <DisplayFutureCard evs={futureEvs.evs} tasks={allTasks} />
       }
     </Box>
   }

    </Box>
    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default HomePage
