// scottscheduler main app page

import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import DisplayFutureEvent, {DisplayFutureCard, buildFutureEvents} from '../components/futurevents';
import {OptionsButtons, buildButtons, buildOptions} from '../components/schedbuttons';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import { ClockWidget } from '../components/clocks';
import { fetchEventsDB } from '../components/eventsutil';
import { fetchSchedGroupsDB, ChoiceSchedGroup } from '../components/schedgrputil';

import { useSnackbar } from 'notistack';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import BigBellSound from '../sounds/bigbell.wav';
import DefaultSound from '../sounds/default.wav';

interface iAudioComp {
    id: string,
    src: string,
    descr: string,
};

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const startParm = useQueryParam('start', '');
    const vdebug = useQueryParam('debug', '');

    const [statusEv, setStatusEv] = useState('Loading'); // describes ev data loading
    const [statusGs, setStatusGs] = useState('Loading'); // descrives groups, schedule data loading
    const [hstatus, setHstatus] = useState('Loading'); // controls page spinner and backdrop display

    const [showClock, setShowClock] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [showSound, setShowSound] = useState(false);

    const [started, setStarted] = useState(new Date(Date.now()));
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
    const [dataSerial, setDataSerial] = useState(0);
    const [eventId, setEventId] = useState(0);
    const [runNumber, setRunNumber] = useState(0);

    // execute event
    //  globals nextEvs, futureEvs
    const eventTask = () => {
        setEventId(0);  // cleanup my id
        var currdate = new Date(Date.now());
        // console.log('Timer Complete', currdate.toLocaleString());
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

        let execPhase = (msRel > msCleanup)? 'postCleanup': (msRel > 0)? 'postEvent': 'preEvent';
        // console.log('relative to event', execPhase, msRel);

        if (execPhase === 'postCleanup') {
            // cleanup, remove current events (and next 30 seconds worth)
            currdate.setSeconds(currdate.getSeconds() + 30);
            let wkEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp > currdate.valueOf());
            if (wkEvents.length !== futureEvs.evs.length) {
                // add newly expired events to log
                let stripEvents: iFutureEvent[] = futureEvs.evs.filter(item => item.evTstamp <= currdate.valueOf());
                const logEvents: iFutureEvent[] = stripEvents.reverse().map(item => {
                    return({...item, begTstamp: started.valueOf()})
                });
                setExpiredEvs(prevEvs => (logEvents.concat(prevEvs)));

                setFutureEvs({...futureEvs, evs: wkEvents});
                if (wkEvents.length === 0) {
                    // console.log("finished", currSched, schedList[0]);
                    setStarted(new Date(Date.now()));

                    // this version doesn't handle currsched with begin times!
                    const schedList = schedGroups[currGroup].schedNames.filter(item => item.schedName === currSched);
                    if (schedList[0].chain) {
                        const chains = schedList[0].chain.split('+');
                        const newsched = chains[0];
                        setCurrSched(newsched);

                        const newOptions : iSchedOptions = {};
                        Object.keys(schedOptions).forEach(item => {newOptions[item] = false});
                        if (chains.length > 1) {
                            chains.slice(1).forEach(item => {newOptions[item] = true});
                        }
                        setSchedOptions(newOptions);
                        const newStart = new Date(Date.now());
                        setStarted(newStart);
                        setRunNumber(() => runNumber + 1);
                        setExpiredEvs(prevEvs => ([
                            {descr: 'end #' + runNumber + ' chain to ' + newsched, evTstamp: Date.now(), begTstamp: started.valueOf(), evTaskId: '-'},
                            ...prevEvs
                        ]));

                        cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, newsched, newOptions, newStart);
                    } else {
                        setExpiredEvs(prevEvs => ([
                            {descr: 'end #' + runNumber, evTstamp: Date.now(), begTstamp: started.valueOf(), evTaskId: '-'},
                            ...prevEvs
                        ]));
                        resetOptions();
                        setCurrSched("off");
                        setHstatus("Completed");
                    }
                }
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
                // decide on the name to be played
                let sname = 'default';
                if (nextEvs.sound && 'name' in nextEvs.sound && typeof(nextEvs.sound.name) !== 'undefined') {
                    sname = nextEvs.sound.name;
                }
                // find the named sound and play it
                const eventAudio = document.getElementById(sname+"-audio") as HTMLVideoElement;
                if (eventAudio) eventAudio.play();
            }
        }

        // early to the party
        if (execPhase === 'preEvent') {
            resched = msRel * -1; // ms until event time

            // play warn sound unless quieted
            if (nextEvs.status !== 'ack') {
                if ('warn' in nextEvs) {
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
                    const eventAudio = document.getElementById(sname+"-audio") as HTMLVideoElement;
                    if (eventAudio) eventAudio.play();
                }
            }
        }

        if (resched > 0) {
            // try again later
            var timeoutId = setTimeout(eventTask, resched) as unknown as number;
            setEventId(timeoutId);
        } else {
            console.log('bad resched', resched);
        }

    };

    // use state eventId and clears it using global eventId
    const killEventTask = () => {
        if (eventId) {
            clearTimeout(eventId);
            setEventId(0);
        }
    };

    // expect a URL parm with scheduler instructions
    interface startParmOutput {
        clock?: string,
        group?: string,
        sched: string,
    }
    const startParmParser= (startParm: string) => {
        const retIn: startParmOutput = {sched: 'off'};
        if (startParm) {
            const [parmGroup, parmSched, ..._parmComp] = startParm.split(';');
            if (parmGroup) {
                if (parmGroup === '_clock') {
                    // needs to be validated
                    retIn['clock'] = (parmSched)? parmSched: 'scheduler';
                } else if (schedGroups[parmGroup]) {
                    retIn['group'] = parmGroup;

                    if (parmSched) {
                        const schedList = schedGroups[parmGroup].schedNames.filter(item => item.schedName === parmSched);
                        if (schedList.length > 0) {
                            retIn['sched'] = parmSched;
                        }
                    }
                }
            }
        }
        return(retIn);
    };

    // when nextEvs change, maintain the next event timer, and update state eventId
    //   this makes sure target fun gets latest copy of nextEvs
    //   ignore 'current', 'soon' status, that is set/ignored by target fun
    useEffect(() => {
        if (nextEvs.status !== 'current' && nextEvs.status !== 'soon') {
            let currdate = new Date(Date.now()).valueOf();
            killEventTask();
            if (nextEvs.evs.length > 0) {
                let next_evtime = nextEvs.evs[0].evTstamp
                let next_milli = next_evtime - currdate - 300000; // ms until event - 5 min warning

                // exec function eventTask after timer
                var timeoutId = setTimeout(eventTask, (next_milli > 0)? next_milli: 10) as unknown as number;
                setEventId(timeoutId);
            }
        }

        // set necessary audio components for nextev
        let wkAudioComp = [];
        let evSrc = DefaultSound;
        let evId = 'default-audio';
        let evDescr = 'std';

        if (nextEvs.sound && 'name' in nextEvs.sound) {
            if (nextEvs.sound.name === 'silent') {
                evSrc = ''; // silence
                evId = 'no-audio';
                evDescr = 'silent';
            } else if (nextEvs.sound.name === 'bigbell') {
                evSrc = BigBellSound;
                evId = 'bigbell-audio';
                evDescr = 'bigbell';
            }
        }

        if (evSrc !== '') wkAudioComp.push({src: evSrc, id: evId, descr: 'sound - ' + evDescr});

        let warnSrc = '';
        evId = '';
        evDescr = 'std';
        if ('warn' in nextEvs) {
            warnSrc = DefaultSound;
            evId = 'default-audio';

            if (nextEvs.warn && nextEvs.warn.sound && 'name' in nextEvs.warn.sound) {
                if (nextEvs.warn.sound.name === '') {
                    warnSrc = 'silent'; // silence
                    evId = 'no-audio';
                    evDescr = 'silent';
                } else if (nextEvs.warn.sound.name === 'bigbell') {
                    warnSrc = BigBellSound;
                    evId = 'bigbell-audio';
                    evDescr = 'bigbell';
                }
            }
        }

        if (warnSrc !== '' && warnSrc !== evSrc) {
            wkAudioComp.push({src: warnSrc, id: evId, descr: 'warning - '+evDescr});
        }
        setAudioComp(wkAudioComp);

    }, [nextEvs]);

    // when futureEvs change, setup new nextEvs state
    useEffect(() => {
        setNextEvs({evs: [], status: 'none'});

        if (futureEvs.evs.length > 0) {
            let currdate = new Date(Date.now()).valueOf();
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
    const setNowDigital = (_currClock: string) => {
        // console.log("setnow digital", currClock);
        let wkdate = new Date(Date.now());

        let mainclock = document.getElementById('mainclock');
        let compclock = document.getElementById('compclock');

        let countDown = document.getElementById('countDown');
        if (countDown) countDown.textContent = showTimeLeft();

        let countUp = document.getElementById('countUp');
        if (countUp) countUp.textContent = showTimeDiff(started.valueOf());

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
        } else if (compclock) {
            const localTime = wkdate.toLocaleTimeString(
              "en-US", {hour: 'numeric', minute: '2-digit'});
            const localComp = localTime.split(' ')[0].split(':');
            const swPM : boolean = (localTime.split(' ')[1] === 'PM');

            compclock.textContent = localComp[0];
            const compminutes = document.getElementById('compminutes');
            if (compminutes) {
                compminutes.textContent = localComp[1];
            }

            let mainpm = document.getElementById('mainpm');
            if (mainpm) {
                if (swPM) {
                    mainpm.textContent = localTime.split(' ')[1];
                } else {
                    mainpm.textContent = '  ';
                }
            }
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

        if (showClock && hstatus !== 'Loading') {
            setNowDigital(showClock);
            var intervalId = setInterval(() => {setNowDigital(showClock)}, 1000);
            return () => {clearInterval(intervalId);};
        }
        return () => {};
    }, [showClock, hstatus, nextEvs]);

    // cleanly reset and rebuild future events using globals
    //  globals allTasks, started
    const cleanRebuildFutureEvents = (wkgroup: iSchedGroup, wksched: string, wkoptions: iSchedOptions, startdate: Date) => {
            killEventTask();
            let currdate = new Date(Date.now());

            // let wkEvents: iFutureEvs = {evs: []};
            if (wksched === "off") {
                setFutureEvs({evs: []});
                setHstatus("Ready");
                return;
            }
            let wkEvents = buildFutureEvents(startdate, wkgroup, wksched, allTasks, wkoptions);

            // cleanup, get expired (or about to in next 15 seconds)
            currdate.setSeconds(currdate.getSeconds() + 15);

            const loggedEvents = expiredEvs.filter(item => item.begTstamp === startdate.valueOf());

            if (loggedEvents.length === 0) {
                // first time (no other events with begTstamp)
                const stripEvents = wkEvents.evs.filter(item => item.evTstamp <= currdate.valueOf());
                const logEvents: iFutureEvent[] = stripEvents.reverse().map(item => {
                    return({...item, begTstamp: startdate.valueOf()})
                });
                logEvents.push(
                   {descr: 'Begin #' + (runNumber+1) + ' ' + wksched, evTstamp: startdate.valueOf(), begTstamp: startdate.valueOf(),evTaskId: '-beg'},
                );
                setExpiredEvs(prevEvs => (logEvents.concat(prevEvs)));
            }

            let finalEvents = wkEvents.evs.filter(item => item.evTstamp > currdate.valueOf());
            setFutureEvs({...wkEvents, evs: finalEvents});

            if (finalEvents.length === 0) {
                setHstatus("Ready");
                enqueueSnackbar(`Complete with no future events`, {variant: 'warning'});
                setCurrSched("off");
            } else {
                setHstatus("Running");
            }
    };

    // change state handle ui for optional schedule button presses
    //   global schedGroups, currGroup, currSched, schedOptions
    const toggleOptions = (item: string) => {
        const toggleTime = Date.now();

        const newOptions = {...schedOptions};
        newOptions[item] = (schedOptions[item] === false);
        setSchedOptions(newOptions);

        if (currSched !== 'off') {
            const label = (newOptions[item])? 'On:': 'Off:';
            setExpiredEvs(prevEvs => ([
                { descr:  label + item + ' #' + runNumber,
                  evTstamp: toggleTime, begTstamp: started.valueOf(),
                  evTaskId: 'opt-' + item,
                },
                ...prevEvs
            ]));

            if ((nextEvs?.evs[0].evTstamp - toggleTime) > 16000) {
                // don't rebuild if we are about to rebuild with a running event
                cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, currSched, newOptions, started);
            }
        }
    }
    const resetOptions = () => {
        const newOptions : iSchedOptions = {};
        Object.keys(schedOptions).forEach(item => {newOptions[item] = false});
        setSchedOptions(newOptions);
    };

    /* getCurrSchedule
       find the schedule from the list in groups

    */
    // returns iSchedule
    const getCurrSchedule = (wkgroup: iSchedGroup, wksched: string): iSchedule => {
        const schedParts = wksched.split('.');
        let schedList: iSchedule[] = [];
        if (wkgroup) {
            schedList = wkgroup.schedNames.filter(item => item.schedName === schedParts[0]);
        }
        return(schedList[0]);
    }

    // change state currSched from schedule buttons, cleanRebuild, msg when turned off
    //   global schedGroups, currGroup, currSched, schedOptions
    const toggleScheds = (wksched: string, pdgroup?: string) => {
        if (currSched !== wksched) {
            const wkgroup = (pdgroup)? pdgroup: currGroup;
            setCurrSched(wksched);
            setShowControls(false);
            const startDate = new Date(Date.now());
            setStarted(startDate);
            cleanRebuildFutureEvents({name:wkgroup,...schedGroups[wkgroup]}, wksched, schedOptions, startDate);
            if (wksched === "off") {
                // set log using previous value of started as begTstamp
                setExpiredEvs(prevEvs => ([
                    {descr: 'Off #' + runNumber, evTstamp: startDate.valueOf(), begTstamp: started.valueOf(), evTaskId: '-'},
                   ...prevEvs
                ]));
                resetOptions();
                setShowControls(true);
                enqueueSnackbar(`scheduler off`,
                    {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
            } else {
                const schedParms = getCurrSchedule(schedGroups[wkgroup], wksched);
                if (schedParms?.clock) {
                    setShowClock(schedParms.clock);
                }

                setRunNumber(() => runNumber + 1);
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
        setShowControls(true);
        if (currSched !== "off") {
            setCurrSched("off");
            // uses old group in call, thats OK as long as schedule is set to off
            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, 'off', schedOptions, started);
            enqueueSnackbar(`scheduler canceled`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
        }
    }

    // scheduler (default ''), digital1, digital2
    const changeClock = (newClock: string) => {
        if (newClock === '' || newClock === 'close') {
            setShowClock('scheduler');
            setShowControls(true);
        } else {
            // validate this and show error wo/ changing it
            setShowClock(newClock);
        }
    };

    // init Data
    //   whenever dataSerial changes
    //     async load event and schedgroup data
    //   when the data above completes
    //     set initial currGroup, currSched, showClock, started time
    //   whenever currGroup changes
    //     build schedButtons, schedOptions
    //     set group quick description on clock

    // load events, allTasks and statusEv
    useEffect(() => {
        const fetchData = async () => {
            try {
                setStatusEv('Loading');
                const newTasks = await fetchEventsDB();
                if (newTasks && Object.keys(newTasks).length > 0) {
                    setAllTasks(newTasks);
                } else {
                    setAllTasks({});
                }
                setStatusEv('Ready');
            } catch (result) {
                setStatusEv('Error');
            }
        };

        if (authStatus === 'authenticated') {
            fetchData();
        }
    }, [dataSerial, authStatus] );

    // load all schedules/groups, schedGroups and statusGs
    useEffect(() => {
        const fetchData = async () => {
            try {
                setStatusGs('Loading');
                const newSchedgrps = await fetchSchedGroupsDB();
                if (newSchedgrps && Object.keys(newSchedgrps).length > 0) {
                    setSchedGroups(newSchedgrps);
                } else {
                    setSchedGroups({});
                }
                setStatusGs('Ready');

            } catch (result) {
                setStatusGs('Error');
            }
        };

        if (authStatus === 'authenticated') {
            fetchData();
        }
    }, [dataSerial, authStatus] );

    // init page when data is finished loading
    useEffect(() => {
        if (statusEv !== 'Loading' && statusGs !== 'Loading') {
            if (statusEv === 'Error' || statusGs === 'Error') {
                enqueueSnackbar(`error retrieving data`, {variant: 'error'});
            }
            setHstatus('Ready');
            setStarted(new Date(Date.now()));
            let newClock = 'scheduler';
            let newGroup = '';
            let newSched = 'off';

            if (schedGroups && Object.keys(schedGroups).length > 0) {
                newGroup = 'default';
            }

            // process start parm from URL group schedule start
            const parsedStart = startParmParser(startParm);
            if (parsedStart['clock']) {
                newClock = parsedStart['clock'];
            }
            setShowClock(newClock);
            if (parsedStart['group']) {
                newGroup = parsedStart['group'];
            }
            setCurrGroup(newGroup);

            if (parsedStart['sched']) {
                newSched = parsedStart['sched'];
                toggleScheds(newSched, newGroup);
            }
            setCurrSched(newSched);

        } else {
            setHstatus('Loading');
        }
    }, [enqueueSnackbar, statusEv, statusGs]);

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
            setHstatus("Ready");
        }
    }, [allTasks, schedGroups, currGroup]);

    // trigger initial quickstart data load
    const pullExamples = async (exname: string) => {
      const myParms = {
        body: {copyfrom: exname,},
        headers: {}, // OPTIONAL
      };

      try {
          const result = await API.post('apscottschedule', '/copygs', myParms);
          if (result && result['Response'] === 'completed') {
              enqueueSnackbar(`Copy successful!`,
                {variant: 'success', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
          } else {
              enqueueSnackbar(`setup failed`, {variant: 'error'} );
              // console.warn('failed setup result', result);
          }
      } catch (apiresult) {
          enqueueSnackbar(`setup api failed`, {variant: 'error'} );
          // console.warn('failed api result', apiresult);
      }
      setDataSerial(dataSerial+1);
    };

    const showTimeLeft = () => {
      let retStr = '';
      if (nextEvs.evs.length > 0) {
        if (nextEvs.evs[0].evTstamp > Date.now()) {
            retStr = 'Next Up' + showTimeDiff(nextEvs.evs[0].evTstamp);
        } else {
            retStr = 'Active for' + showTimeDiff(nextEvs.evs[0].evTstamp+15000);
        }
      }
      return(retStr);
    }

    const showTimeDiff = (inTstamp: number) => {
      let retString = '0';
      const msLeft = Math.abs(Date.now() - inTstamp);
      let minLeft = Math.floor(msLeft / 60000);
      let secLeft = Math.ceil((msLeft % 60000)/1000);
      // edge case from the way we are rounding
      if (secLeft === 60) {
        secLeft = 0;
        minLeft += 1;
      }
      if (minLeft > 120) {
        let hourLeft = Math.floor(minLeft/60);
        minLeft -= hourLeft*60;
        retString = ' '  + hourLeft + 'h ' + minLeft + 'm ';
      } else if (minLeft > 0) {
        retString = ' ' + minLeft + 'm ' + secLeft + 's ';
      } else {
        retString = ' ' + secLeft + 's ';
      }

      return(retString);
    };

    return(
      <Layout><Seo title="Scottschedule" />
      <PageTopper pname="Home" vdebug={vdebug} helpPage="/help/home" />
      <Box display="flex" flexWrap="wrap" justifyContent="center">

      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        <Accordion disableGutters elevation={0}>
          <AccordionSummary sx={{
            bgcolor: 'site.main', minHeight: 32, maxHeight: 32,
            padding: '0px 4px', margin: '0px',
            }} expandIcon={<ExpandMoreIcon />} >
          <Box width='100%' display='flex' alignItems='baseline' justifyContent='space-between'>
              <Typography variant='body2'>
                Status: ({currSched}) {(currSched === 'off')? 'for': 'running' }
              </Typography>
              <Typography variant='h6' id='countUp'>
                0m 0s
              </Typography>
            <Typography variant='body2'>
              Run {runNumber}
            </Typography>
            <Button onClick={() => {setExpiredEvs([]); setRunNumber(0)}}>
              Clear
            </Button>
            <Typography variant='caption'>
              Log
            </Typography>
          </Box>

          </AccordionSummary>
          <AccordionDetails>

            { (expiredEvs.length > 0) &&
                <Box sx={{maxHeight: 100, overflow: 'auto' }}>
                { expiredEvs.map(item => <DisplayFutureEvent
                  key={`${item.evTstamp}:${item.evTaskId}`} item={item}
                  descr={(item.descr)? item.descr: (allTasks[item.evTaskId])? allTasks[item.evTaskId].descr: 'system'}/>)
                }
                </Box>
            }


          </AccordionDetails>
        </Accordion>

        {(showClock === 'scheduler' || showClock === '') ?
        <>
        <Box data-testid='clock-scheduler' m={0} p={0} display="flex" justifyContent="space-around" alignItems="flex-start">
          <Box display="flex" alignItems="baseline">
            <Button data-testid='change clock' onClick={() => changeClock('digital1')}>
              <Typography variant='h4' id='mainclock' sx={{fontSize:40, fontWeight: 600}}>
                00:00
              </Typography>
            </Button>
            <Typography variant='subtitle1' id='mainpm' sx={{fontSize:12}}>
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
            <ChoiceSchedGroup currgroup={currGroup} schedGroupList={schedGroups} setgroup={changeGroup} />
          </Box>
        </Box>

        { (Object.keys(schedGroups).length === 0 && statusGs === 'Ready') &&
          <Box m={2}>
            <Typography variant='h4'>Welcome, new user!</Typography>
            <List dense={true}>
              <Typography variant='body1'>
                Get started quickly with an example config:
              </Typography>
              <Box width='300'>
                <ListItem disablePadding>
                  <ListItemButton data-testid='qstart1' onClick={() => {pullExamples('clocks');}}>
                    <ListItemText primary="Just Clocks" secondary="minimal setup"/>
                </ListItemButton></ListItem>
                <ListItem disablePadding>
                  <ListItemButton data-testid='qstart2' onClick={() => {pullExamples('demos');}}>
                    <ListItemText primary="Cookbook" secondary="Lots of small examples"/>
                </ListItemButton></ListItem>
                <ListItem disablePadding>
                  <ListItemButton data-testid='qstart3' onClick={() => {pullExamples('medscheds');}}>
                    <ListItemText primary="Care" secondary="Medication and care examples" />
                </ListItemButton></ListItem>
              </Box>
            </List>
          </Box>
        }

        </>
        :
        <>
          <ClockWidget currClock={showClock} onComplete={changeClock} />
        </>
        }

        <Box mx={1}>
          <Button size='large' variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => toggleScheds("off")}>Off</Button>
          <OptionsButtons options={schedOptions} onClick={toggleOptions}/>
        </Box>

        { (Object.keys(schedButtons).length > 0) &&
        <Accordion expanded={showControls} onChange={() => setShowControls(!showControls)} disableGutters elevation={0}>
        <AccordionSummary sx={{
            bgcolor: 'site.main', minHeight: 32, maxHeight: 32,
            padding: '0px 4px', margin: '6px 0px 0px 0px',
          }} expandIcon={<ExpandMoreIcon />} >Schedule Buttons</AccordionSummary>
        <AccordionDetails sx={{padding: '0px', margin: '0px'}}>
        <Box mx={1} mb={3}>
          {Object.keys(schedButtons).map(item => {
          return (
            <Button size='large' key={item} variant={(currSched === item)? "contained": "outlined"} color="primary" onClick={() => toggleScheds(item)}>
              {schedButtons[item]}
            </Button>
          )})}
        </Box>
        </AccordionDetails>
        </Accordion>
        }

     </Card></Box>

   { ((futureEvs && futureEvs.evs.length > 0) || expiredEvs.length > 0 || (nextEvs && nextEvs.evs.length > 0)) &&
     <Box ml={4}>
       { (nextEvs && nextEvs.evs.length > 0) &&
       <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 350, flex: '1 1',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
         <Box>
           <Box px={1} display="flex" justifyContent="space-between" alignItems="baseline"
             sx={{ backgroundColor: (nextEvs.status === 'ack' || nextEvs.status === 'pending')? nextEvs.status + '.main'
                : 'site.main'
             }}
           >
             {(nextEvs.status === 'pending') &&
               <Typography variant='h6' data-testid={'ev-' + nextEvs.status} id='countDown'
                 sx={{ color: nextEvs.status + '.contrastText' }}
               >
                 0m 0s
               </Typography>
             }
             {(nextEvs.status === 'soon') &&
               <Typography variant='h6' data-testid={'ev-' + nextEvs.status} id='countDown'
                 sx={{ color: 'warning.main' }}
               >
                 0m 0s
               </Typography>
             }
             {(nextEvs.status === 'current') &&
               <Box width='70%'>
               <Typography variant='h6' data-testid={'ev-' + nextEvs.status} id='countDown'
                 sx={{ color: 'error.main' }}
               >
                 0m 0s
               </Typography>
               <LinearProgress/>
               </Box>

             }
             {(nextEvs.status === 'ack') &&
               <>
               <Typography variant='h6' data-testid={'ev-' + nextEvs.status} id='countDown'
                 sx={{ color: nextEvs.status + '.contrastText' }}
               >
                 0m 0s
               </Typography>
               <Typography variant='h6'>
                 (Silenced)
               </Typography>
               </>
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
           <Box>
                 <Box display='flex' justifyContent='space-between' sx={{bgcolor: 'site.main'}}>
                   <Typography mx={1} variant='subtitle1'>Sound Controls</Typography>
                    <IconButton data-testid='show-sound' size='small' onClick={() => setShowSound(showSound === false)}>
                      <ExpandMoreIcon sx={{height: '1.25rem'}} />
                    </IconButton>
                 </Box>

                 { audioComp.map(item => {
                 return (
                   <Box key={item.id} display='flex'>
                     {(showSound) ?
                       <>
                         <Typography mx={1}>{item.descr}</Typography>
                         <audio id={item.id} controls preload="auto">
                           <source src={item.src} type="audio/wav" />
                           Your browser doesn't support audio
                         </audio>
                       </>
                     :
                       <>
                         <audio id={item.id} preload="auto">
                           <source src={item.src} type="audio/wav" />
                         </audio>
                       </>
                     }

                   </Box>
                 )})}

           </Box>
         }

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
