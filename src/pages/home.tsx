// prototype scottscheduler home page

import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
import {OptionsButtons, buildButtons, buildOptions} from '../components/schedbuttons';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import { fetchEventsDB } from '../components/eventsutil';
import { fetchSchedGroupsDB } from '../components/schedgrputil';

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

interface iNextEvs {
    evs: iFutureEvent[],
    status: string,
    sound?: iEvsSound,
    warn?: iEvsWarn,
};

interface iAudioComp {
    id: string,
    src: string,
};

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [showClock, setShowClock] = useState('');

    const [currGroup, setCurrGroup] = useState('');
    const [currSched, setCurrSched] = useState('off');
    const [schedButtons, setSchedButtons] = useState<iSchedButtons>({});
    const [schedOptions, setSchedOptions] = useState<iSchedOptions>({});

    const [audioComp, setAudioComp] = useState<iAudioComp[]>([]);
    const [nextEvs, setNextEvs] = useState<iNextEvs>({evs: [], status: 'none'});
    const [expiredEvs, setExpiredEvs] = useState<iFutureEvent[]>([]);
    const [futureEvs, setFutureEvs] = useState<iFutureEvs>({evs: []});
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});
    const [eventId, setEventId] = useState(0);

    // execute event
    //  globals nextEvs, futureEvs
    const eventTask = () => {
        setEventId(0);  // cleanup my id
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
            // console.log("repeat ", msRepeat, msCleanup);
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
                }
            }
        }

        // early to the party
        if (execPhase === 'preEvent') {
            resched = msRel * -1; // ms until event time

            // play warn sound unless quieted
            if (nextEvs.status !== 'ack') {
                if ('warn' in nextEvs) {
                    // console.log("found warn");
                    if (nextEvs.status === 'pending') {
                        setNextEvs({...nextEvs, status: 'soon'});
                    }

                    const msWarnRepeat = 60000; // repeat every minute
                    resched += Math.ceil(msRel/msWarnRepeat) * msWarnRepeat;
                    if (resched < 30000) {
                        resched += msWarnRepeat;
                    }

                    let sname = 'default';
                    if (nextEvs.warn && nextEvs.warn.sound && 'name' in nextEvs.warn.sound && typeof(nextEvs.warn.sound.name) !== 'undefined') {
                        sname = nextEvs.warn.sound.name;
                    }
                    if (sname) {
                        const eventAudio = document.getElementById(sname+"-audio") as HTMLVideoElement;
                        if (eventAudio) {
                            eventAudio.play();
                        } else {
                            console.log("no warn mooo");
                        }
                    }
                }
            }
        }

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
    //   global eventId
    const killEventTask = () => {
        if (eventId) {
            clearTimeout(eventId);
            setEventId(0);
            console.log('Cancel alarm timer', eventId);
        }
    };

    // when nextEvs change, maintain the next event timer, and update state eventId
    //   this makes sure target fun gets latest copy of nextEvs
    //   ignore 'current', 'soon' status, that is set/ignored by target fun
    useEffect(() => {
        if (nextEvs.status !== 'current' && nextEvs.status !== 'soon') {
            let currdate = new Date().valueOf();
            killEventTask();
            if (nextEvs.evs.length > 0) {
                console.log('useeffect nextevs - update event task');
                let next_evtime = nextEvs.evs[0].evTstamp
                let next_milli = next_evtime - currdate - 300000; // ms until event - 5 min warning

                // exec function eventTask after timer
                var timeoutId = setTimeout(eventTask, (next_milli > 0)? next_milli: 10) as unknown as number;
                setEventId(timeoutId);
                console.log('restart alarm timer', timeoutId);
            } else {
                console.log('useeffect nextevs - trigger');
            }
        } else {
            console.log('useeffect nextevs - current/soon');
        }

        // set necessary audio components for nextev
        let wkAudioComp = [];
        let evSrc = DefaultSound;
        let evId = 'default-audio';

        if (nextEvs.sound && 'name' in nextEvs.sound) {
            if (nextEvs.sound.name === '') {
                evSrc = ''; // silence
                evId = 'no-audio';
            } else if (nextEvs.sound.name === 'bigbell') {
                evSrc = BigBellSound;
                evId = 'bigbell-audio';
            }
        }
        if (evSrc !== '') {
            wkAudioComp.push({src: evSrc, id: evId});
        }

        let warnSrc = '';
        evId = '';
        if ('warn' in nextEvs) {
            warnSrc = DefaultSound;
            evId = 'default-audio';

            if (nextEvs.warn && nextEvs.warn.sound && 'name' in nextEvs.warn.sound) {
                if (nextEvs.warn.sound.name === '') {
                    warnSrc = ''; // silence
                    evId = 'no-audio';
                } else if (nextEvs.warn.sound.name === 'bigbell') {
                    warnSrc = BigBellSound;
                    evId = 'bigbell-audio';
                }
            }
        }

        if (warnSrc !== '' && warnSrc !== evSrc) {
            wkAudioComp.push({src: warnSrc, id: evId});
        }
        setAudioComp(wkAudioComp);
        // console.log("audioList", wkAudioComp);

    }, [nextEvs]);

    // when futureEvs change, setup new nextEvs state
    useEffect(() => {
        console.log('useeffect futureevs');
        setNextEvs({evs: [], status: 'none'});

        if (futureEvs.evs.length > 0) {
            let currdate = new Date().valueOf();
            let wkEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp > currdate);
            if (wkEvents.length > 0) {
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
            const localTime = wkdate.toLocaleTimeString(
              "en-US", {hour: '2-digit', minute: '2-digit'});

            mainclock.textContent = localTime.split(' ')[0];
            let mainpm = document.getElementById('mainpm');
            if (mainpm) {
                if (localTime.split(' ')[1] === 'PM') {
                    mainpm.textContent = localTime.split(' ')[1];
                } else {
                    mainpm.textContent = '  ';
                }
            }
        } else {
            console.log("no mainclock on dom");
        }

        let maindate = document.getElementById('maindate');
        if (maindate) {
            maindate.textContent = wkdate.toLocaleDateString(
              "en-US", {day: "2-digit", month: "short", weekday: "short"});
        }
    }
    // maintain selected clock
    useEffect(() => {
        // every ten seconds, get the time and update clock
        // cleanup on useeffect return

        if (showClock && showClock !== '' && hstatus !== 'Loading') {
            setNowDigital();
            var intervalId = setInterval(() => {setNowDigital()}, 10000);
            console.log("restart clock useeffect id", intervalId);

            return () => {clearInterval(intervalId);console.log('clear id', intervalId);};
        } else {
            console.log("clock not defined");
        }
        return () => {};
    }, [showClock, hstatus]);

    // cleanly reset and rebuild future events using globals
    //  globals allTasks
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
    //   global schedGroups, currGroup, currSched, schedOptions
    const toggleOptions = (item: string) => {
        const newOptions = {...schedOptions};
        newOptions[item] = (schedOptions[item] === false);
        setSchedOptions(newOptions);

        if (currSched !== 'off') {
            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, currSched, newOptions);
        }
    }
    // change state currSched from schedule buttons, cleanRebuild, msg when turned off
    //   global schedGroups, currGroup, currSched, schedOptions
    const toggleScheds = (wksched: string) => {
        if (currSched !== wksched) {
            setCurrSched(wksched);

            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, wksched, schedOptions);
            if (wksched === "off") {
                enqueueSnackbar(`scheduler off`,
                    {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
            }
        }
    }
    // acknowledge the buttons
    // globals nextEvs
    const acknowledgeEvent = () => {
        const updNext = {...nextEvs, status: 'ack'};
        setNextEvs(updNext);
    }

    // change state currGroup from choicelist, turns off currSched/cleanRebuild if nec
    //   global schedGroups, currGroup, currSched, schedOptions
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

    // init Data
    // load allTasks
    useEffect(() => {
        const fetchData = async () => {
            try {
                const newTasks = await fetchEventsDB();
                if (newTasks) {
                    enqueueSnackbar(`loaded events`,
                      {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                    setAllTasks(newTasks);
                } else {
                    enqueueSnackbar(`no events found`, {variant: 'error'});
                }
            } catch (result) {
                enqueueSnackbar(`error retrieving events`, {variant: 'error'});
                console.log("got error", result);
            }
        };

        setHstatus('Loading');
        console.log('events loading');
        fetchData();
    }, [enqueueSnackbar] );

    // load all schedules, groups
    useEffect(() => {
      const fetchData = async () => {
          try {
              const newSchedgrps = await fetchSchedGroupsDB();
              if (newSchedgrps) {
                  enqueueSnackbar(`loaded schedules`,
                    {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                  setSchedGroups(newSchedgrps);
              } else {
                  enqueueSnackbar(`no schedules found`, {variant: 'error'});
              }
          } catch (result) {
              enqueueSnackbar(`error retrieving sched/groups`, {variant: 'error'});
              console.log("got error", result);
          }

      };

      setHstatus('Loading');
      console.log('schedgroups loading');
      fetchData();
    }, [enqueueSnackbar] );

    useEffect(() => {
        // post data init
        if (schedGroups) {
            killEventTask();
            setNextEvs({evs: [], status: 'none'});
            setFutureEvs({evs: []});
            setShowClock('scheduler');

            let wkGroup = 'default';
            setCurrGroup(wkGroup);
            setCurrSched('off');

            let groupElement =  document.getElementById('grouptitle');
            if (schedGroups[wkGroup] && groupElement) {
                    groupElement.textContent = schedGroups[wkGroup].descr;
        }

        // init schedule group completed
        }

    }, [schedGroups]);

    // update when currGroup updates, or the background schedGroups,allTasks updates
    useEffect(() => {
        console.log("useeffect currGroup - schedGroups, allTasks");
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
            setHstatus("Ready");
            console.log("Status = Ready");
        }
    }, [allTasks, schedGroups, currGroup]);

    return(
      <Layout><Seo title="Prototype 2.3 - Scottschedule" />
      <PageTopper pname="Home" vdebug={vdebug} helpPage="/help/home" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1', background: '#F5F5E6',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        <Box display={(showClock === "digital1")? 'flex': 'none'} flexDirection='column'>
          { (showClock === "digital1") &&
          <>
          <Button sx={{margin: 0}} onClick={() => setShowClock('scheduler')}>
            <Typography variant='h1' id='mainclock'
              sx={{fontSize:150, fontWeight: 600, color: 'black', padding: 0, margin: 0}}>00:00</Typography>
          </Button>
          <Typography variant='subtitle1' id='mainpm' sx={{fontSize:20, fontWeight: 600, color: 'black'}}>
            PM
          </Typography>
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
          <Box display="flex" alignItems="baseline">
            <Button onClick={() => setShowClock('digital1')}>
              <Typography variant='h4' id='mainclock' sx={{fontSize:40, fontWeight: 600, color: 'black'}}>
                00:00
              </Typography>
            </Button>
            <Typography variant='subtitle1' id='mainpm' sx={{fontSize:12, color: 'black'}}>
              PM
            </Typography>
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
        <Divider />
        <Box mx={1} my={1} display="flex" justifyContent="space-between" alignItems="center">
          Test <audio className="audio-element" controls >
            <source src={DefaultSound} type="audio/wav" />
            Your browser doesn't support audio
          </audio>
        </Box>
        </>
        }

     </Card></Box>

   { ((futureEvs && futureEvs.evs.length > 0) || expiredEvs.length > 0 || (nextEvs && nextEvs.evs.length > 0)) &&
     <Box>
       { (nextEvs && nextEvs.evs.length > 0) &&
       <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 350, flex: '1 1',
          background: (nextEvs.status === 'pending')? '#FAFAFA': (nextEvs.status === 'ack')? '#F5F5E6': '#FFFFFF',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
         <Box mx={1}>
           <Box display="flex" justifyContent="space-between" alignItems="baseline">
             {(nextEvs.status === 'pending') &&
               <Typography variant='h6'>
                 Next Up
               </Typography>
             }
             {(nextEvs.status === 'soon') &&
               <Typography variant='h6'>
                 Next Up (soon)
               </Typography>
             }
             {(nextEvs.status === 'current') &&
               <Typography variant='h6' sx={{fontWeight: 600,}}>
                 Active
               </Typography>
             }
             {(nextEvs.status === 'ack') &&
               <Typography variant='h6' sx={{fontWeight: 600,}}>
                 Current
               </Typography>
             }

             <Button variant='outlined'
               color={(nextEvs.status === 'current' || nextEvs.status === 'soon')? 'error': 'primary'}
               onClick={acknowledgeEvent} disabled={(nextEvs.status === 'ack')}>
               Silence
             </Button>
           </Box>
           { nextEvs.evs.map(item => <DisplayFutureEvent
             key={`${item.evTstamp}:${item.evTaskId}`} item={item}
             descr={(allTasks[item.evTaskId])? allTasks[item.evTaskId].descr: 'system'}/>)
           }
         </Box>
         {(nextEvs.status !== 'ack') &&
             <>
             { audioComp.map(item => {
             return (
               <audio key={item.id} id={item.id} controls>
                 <source src={item.src} type="audio/wav" />
                 Your browser doesn't support audio
               </audio>
             )})}
             </>
         }
       </Card>
       }

       { (expiredEvs.length > 0) &&
       <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 350, flex: '1 1', background: '#FAFAFA',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
         <Box mx={1}>
           <Box display="flex" justifyContent="space-between" alignItems="baseline">
             <Typography variant='h6'>
               Recent Events
             </Typography>
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
