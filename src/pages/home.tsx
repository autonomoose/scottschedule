// runs complex timers
//  execute events, eventTask, getNextEvent, killEventTask, useEffect(futureEvs)
//  future events, DisplayFutureEvent, buildFutureEvents
//  ui, setNow (maintain clock/calendar),
//    toggleOptions(string), toggleScheds(string),
//    bldOptions(iSchedGroup, string)
//  init
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
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

import DefaultSound from '../sounds/default.wav';

interface iFutureEvent {
    evTstamp: number,
    evTaskId: string,
};

interface iFutureDict {
    [evTstampKey: string]: iFutureEvent[],
}

interface iTask {
    [evTaskId: string]: {
        descr: string,
        schedRules: string[],
    };
};

interface iSchedTask {
   evTaskId: string,
}

interface iSchedule {
    schedName: string,
    schedTasks: iSchedTask[],
    begins?: string,
    buttonName?: string,
}

interface iSchedGroup {
    name: string,
    descr: string,
    schedNames: iSchedule[],
};

interface iSchedGroupList {
    [name: string]: {
        descr: string,
        schedNames: iSchedule[],
    };
};

// schedule buttons
interface iSchedButtons {
    [name: string]: string; // button [name]=text
};

// schedule options
interface iSchedOptions {
    [name: string]: boolean;
};

const HomePage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata

    const [currGroup, setCurrGroup] = useState('default');
    const [currSched, setCurrSched] = useState('off');
    const [schedButtons, setSchedButtons] = useState<iSchedButtons>({});
    const [schedOptions, setSchedOptions] = useState<iSchedOptions>({});

    const [expiredEvs, setExpiredEvs] = useState<iFutureEvent[]>([]);
    const [futureEvs, setFutureEvs] = useState<iFutureEvent[]>([]);
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});
    const [eventId, setEventId] = useState(0);


    // execute event
    //
    const eventTask = () => {
        setEventId(0);
        var currdate = new Date();
        console.log('Timer Complete', currdate.toLocaleString());


        // play sound unless quieted
        const eventAudio = document.getElementsByClassName("audio-element")[0] as HTMLVideoElement;
        if (eventAudio) {
            eventAudio.play();
        } else {
            console.log("no mooo");
        }

        // remove current events (and next 30 seconds worth) from
        currdate.setSeconds(currdate.getSeconds() + 30);
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate.valueOf());
        if (wkEvents.length !== futureEvs.length) {
            let stripEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp <= currdate.valueOf());
            setExpiredEvs(stripEvents);

            setFutureEvs(wkEvents);
            if (wkEvents.length === 0) {
                setCurrSched("off");
                setHstatus("Completed");
            }
        } else {
            console.log("no cleanup after event");
        }
    };

    const getNextEvent = () => {
        let ret_milli = 0;
        let currdate = new Date().valueOf();
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate);

        // return milliseconds until event
        if (wkEvents.length > 0) {
            ret_milli = wkEvents[0].evTstamp - currdate;
        }
        return (ret_milli);
    };
    const killEventTask = () => {
        if (eventId) {
            clearTimeout(eventId);
            setEventId(0);
            console.log('Cancel timer');
        }
    };
    // maintain the next event timer, and update state
    useEffect(() => {
        killEventTask();

        // build new event task
        if (futureEvs.length > 0) {
            //    find next event, and milliseconds until trigger
            var nextEvent = getNextEvent();
            if (nextEvent > 0) {
                var timeoutId = setTimeout(eventTask, nextEvent) as unknown as number;
                setEventId(timeoutId);
            } else {
                console.log('future events but no next event?');
            }
        }
    }, [futureEvs]);


    // future events
    //
    interface DisplayFutureEventProps {
        item: iFutureEvent,
        descr?: string,
    }
    const DisplayFutureEvent = (props: DisplayFutureEventProps) => {
        const wkdate = new Date(props.item.evTstamp);
        const wkdescr = (props.descr)? props.descr: props.item.evTaskId;
        return (
          <div>
            {wkdate.toLocaleString('en-US', {hour: "2-digit", minute: "2-digit"})} - {wkdescr}
          </div>
    )}

    // derive the future events from schedule
    //   get the start time figured out
    //   get the Task rules that match
    //   process rules into events dict w/ tstamp key
    //   convert dict to sorted array w/ earliest events first
    const buildFutureEvents = (wkgroup: iSchedGroup, wksched: string, taskInfo: iTask, optInfo: iSchedOptions): iFutureEvent[] => {
        let wkEvents: iFutureEvent[] = [];
        let currdate = new Date();
        console.log("buildFutureEvents", wkgroup.name, wksched, optInfo);
        if (optInfo['tomorrow']) {
            currdate.setHours(currdate.getHours() + 24);
            currdate.setHours(0);
            currdate.setMinutes(0);
            currdate.setSeconds(1);
        }

        // date object used for starting times,
        const tlangDate = (wkTlang: string | undefined, wkStart: Date) => {
            let retDate = new Date(wkStart.valueOf())
            if (wkTlang) {
                const dateParts = wkTlang.split(':');
                switch(dateParts.length) {
                    case 0: // undefined and now are handled by retDate init
                        break;
                    case 1: // minutes only (offset only) or word
                        if (/^\+?\d+$/.test(wkTlang)) {
                            // numeric is minutes only
                            if (wkTlang[0] === '+') {
                                // offset
                                retDate.setMinutes(retDate.getMinutes() + Number(dateParts[0]));
                                retDate.setSeconds(0);
                            } else {
                                // constant
                                retDate.setMinutes(Number(dateParts[0]));
                                retDate.setSeconds(0);
                            }
                        } else {
                            switch(wkTlang) {
                                case 'now':
                                    break;
                                default:
                                    console.log("unknown date", wkTlang);
                                    break;
                            }
                        }
                        break;
                    case 2: // hours and minutes (constant or offset)
                        if (wkTlang[0] === '+') {
                            // offset
                            retDate.setHours(retDate.getHours() + Number(dateParts[0].substring(1)));
                            retDate.setMinutes(retDate.getMinutes() + Number(dateParts[1]));
                            retDate.setSeconds(0);
                        } else {
                            // constant
                            retDate.setHours(Number(dateParts[0]));
                            retDate.setMinutes(Number(dateParts[1]));
                            retDate.setSeconds(0);
                        }
                        break;
                    case 3: // constant with offset HH:MM+HH:MM, date with hour minute 12/02/22:HH:MM
                        break;

                    default:
                        console.log("unknown date", wkTlang);
                        break;
                }
            }
            return retDate;
        };
        // reducer loop thru rules
        const rulesReduceToEvents = (outEvents: iFutureDict, taskRule: string) => {
            // globals startTlang, startDate
            console.log("taskrule", taskRule);
            const evTask = taskRule.split('.')[0];
            const ruleParts = taskRule.split('.')[1].split(',');
            var lastDate: Date;

            // handle each rule as a set of compound statements comma separated
            for (const wkRule of ruleParts) {
                // get timeoffset info and generate possible event time

                let ruleWords = wkRule.split(' ');
                let tlangTimeWord = ruleWords.shift();
                let evTime = (tlangTimeWord.startsWith('++'))
                    ? tlangDate(tlangTimeWord.slice(1), lastDate)
                    : tlangDate(tlangTimeWord, startDate); // global startDate

                // possibly adjust evTime with orlater(+0:00)/orsooner(xx:xx)
                //     continue matching unless it fails
                let nextTlangWord = ruleWords.shift();
                while (nextTlangWord === 'or' && ruleWords.length > 0) {
                    let nextTimeWord = ruleWords.shift();
                    let nextEvTime = (nextTimeWord.startsWith('++'))
                        ? tlangDate(nextTimeWord.slice(1), lastDate)
                        : tlangDate(nextTimeWord, startDate); // global startDate
                    if (!nextTimeWord) {
                        console.log("or fail - no time word");
                        break;
                    }

                    console.log("or ", nextTimeWord, nextEvTime);
                    if (nextTimeWord[0] === '+') {
                        // or later
                        if (evTime > nextEvTime) {
                            // fails, no more or
                            break;
                        }
                        tlangTimeWord = nextTimeWord;
                        evTime = nextEvTime;
                    } else {
                        // or sooner
                        if (evTime < nextEvTime) {
                            // fails, no more or
                            break;
                        }
                        tlangTimeWord = nextTimeWord;
                        evTime = nextEvTime;
                    }
                    nextTlangWord = ruleWords.shift();
                }

                // store event by timestamp for later extract in order
                console.log("dates", lastDate, evTime);
                if (typeof lastDate !== 'undefined' && lastDate.valueOf() === evTime.valueOf()) {
                    console.log("repeat event not added");
                } else {
                    let evVal = evTime.valueOf().toString();
                    if (outEvents[evVal]) {
                        outEvents[evVal].push({evTstamp: evTime.valueOf(), evTaskId: evTask});
                    } else {
                        outEvents[evVal] = [];
                        outEvents[evVal].push({evTstamp: evTime.valueOf(), evTaskId: evTask});
                    }
                    lastDate = evTime;
                }

                // deal with any * (repeat) instructions

            }
            return(outEvents);
        };
        // reducer loop thru tasks
        const tasksReduceToRules = (outRules: string[], wkTaskName: iSchedTask) => {
            // globals startTlang, startDate
            if (taskInfo[wkTaskName.evTaskId]) {
                // find matching rule - loop backward through rules to find first match
                let matchRule: string = '';
                const tasklist = taskInfo[wkTaskName.evTaskId].schedRules.slice().reverse();

                for (const wkRule of tasklist) {
                    const ruleWords = wkRule.split(' ');
                    switch(ruleWords[0]) {
                        case "begin":
                            // begin always matches
                            matchRule = ruleWords.slice(1).join(' ');
                            break;
                        case "option":
                            // option matches if all arguments are true
                            let options = ruleWords[1].split('+');
                            let matcher = true;
                            for (const wkOption of options) {
                                if (wkOption.startsWith('start:')) {
                                    // todo ends with + should do date check
                                    if (wkOption.slice(6) !== startTlang) { // global startTlang
                                        matcher = false;
                                        break;
                                    }
                                } else if (!optInfo[wkOption]) {
                                    matcher = false;
                                    break;
                                }
                            }
                            if (matcher) {
                                matchRule = ruleWords.slice(2).join(' ');
                            }
                            break;
                        default:
                            console.log("unknown word", ruleWords[0]);
                        break;
                    }
                    if (matchRule !== '') {
                        break; // out of for loop
                    }
                } // end of find matching rule

                // add matching rule to output
                if (matchRule !== '') {
                    const outRule = wkTaskName.evTaskId + "." + matchRule
                    outRules.push(outRule);
                }
            } else {
                console.log(wkTaskName.evTaskId, " task not found");
            }
            return outRules;
        }


        // find the schedule and possibly start time
        const schedParts = wksched.split('.');
        let schedList: iSchedule[] = [];
        if (wkgroup) {
            schedList = wkgroup.schedNames.filter(item => item.schedName === schedParts[0]);
        }
        if (schedList.length !== 1) {
            console.log("no unique schedule found ", schedList, schedParts[0]);
            return wkEvents;
        }
        console.log("found iSchedule ", schedList[0].schedName, schedList[0]);

        // find the starting time
        var startTlang = 'now';
        if (schedParts[1]) {
            startTlang = schedParts[1];
        } else if (schedList[0].begins) {
                startTlang = schedList[0].begins;
        }
        var startDate = tlangDate(startTlang, currdate);
        console.log("start tlang", startTlang, " date ", startDate);

        // get appropriate rules from tasklist
        let activeRules = [];

        if (schedList[0].schedTasks.length > 0) {
            activeRules = schedList[0].schedTasks.reduce(tasksReduceToRules, []);
        } else {
            // new
            activeRules.push("new.23:23");
            console.log("no tasks - added new rule");
        }
        console.log("active Rules", activeRules);

        // convert rules to future events dict (to preserve order on mult event per timestamp)
        const dictEvents = activeRules.reduce(rulesReduceToEvents, {});
        // convert dictionary to wkEvents: iFutureEvent[]
        for (const tmpTstamp of Object.keys(dictEvents).sort()) {
            for (const tmpEv of dictEvents[tmpTstamp]) {
                wkEvents.push(tmpEv);
            }
        }
        console.log("active Events", wkEvents);
        return wkEvents;
    }

    // ui functions
    // maintain the clock/calendar on ui
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

    // cleanly reset and rebuild future events using globals
    const cleanRebuildFutureEvents = (wkgroup: iSchedGroup, wksched: string, wkoptions: iSchedOptions) => {
            console.log("Building schedule ", wkgroup.name, wkgroup.descr, wksched);
            killEventTask();

            let wkEvents: iFutureEvent[] = [];
            if (wksched !== "off") {
                wkEvents = buildFutureEvents(wkgroup, wksched, allTasks, wkoptions);
                }

            // cleanup, get expired (or about to in next 30 seconds)
            let currdate = new Date();
            currdate.setSeconds(currdate.getSeconds() + 30);

            let stripEvents = wkEvents.filter(item => item.evTstamp <= currdate.valueOf());
            setExpiredEvs(stripEvents);

            let finalEvents = wkEvents.filter(item => item.evTstamp > currdate.valueOf());
            setFutureEvs(finalEvents);
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

    // loops through nested scheduleGroup to build schedule buttons
    const buildButtons = (wkSchedGroup: iSchedGroup) : iSchedButtons => {
        // loop through schedules looking for tasks
        const optionSchedReduce = (outDict: iSchedButtons, item: iSchedule) => {
            if (item.begins) {
                const scheds = item.begins.split(',');
                if (scheds.length > 1) {
                    scheds.forEach((starttime: string) => {
                        if (starttime && starttime !== '') {
                            outDict[item.schedName + '.' + starttime] = (item.buttonName)
                                ? item.buttonName + ' ' + starttime
                                : item.schedName + ' ' + starttime;
                        }
                    });
                } else {
                    outDict[item.schedName] = (item.buttonName)? item.buttonName: item.schedName;
                }
            } else {
                outDict[item.schedName] = (item.buttonName)? item.buttonName: item.schedName;
            }
            return outDict;
        }
        return (wkSchedGroup.schedNames.reduce(optionSchedReduce, {}));
    }
    // loops through nested scheduleGroup looking for all possible options
    const buildOptions = (wkSchedGroup: iSchedGroup, wkTasks: iTask) : iSchedOptions => {
        // loop through rules looking for opt statements
        const optionRuleReduce = (outDict: iSchedOptions, item: string) => {
            const optIndex = item.indexOf('option ');
            if (optIndex >= 0) {
                const ruleWords = item.slice(optIndex).split(' ');
                if (ruleWords[1]) {
                    ruleWords[1].split('+').forEach((item: string) => {
                        if (!item.startsWith('start:')) {
                            outDict[item] = false;
                        }
                    });
                }
            }
            return outDict;
        }
        // loop through tasks looking for rules
        const optionTaskReduce = (outDict: iSchedOptions, item: iSchedTask) => {
            return (wkTasks[item.evTaskId])? wkTasks[item.evTaskId].schedRules.reduce(optionRuleReduce, outDict): outDict;
        }
        // loop through schedules looking for tasks
        const optionSchedReduce = (outDict: iSchedOptions, item: iSchedule) => {
            return item.schedTasks.reduce(optionTaskReduce, outDict)
        }
        const starterOptions = {'tomorrow': false};

        return (wkSchedGroup.schedNames.reduce(optionSchedReduce, starterOptions));
    }

    // handle ui for optional schedule button presses
    const toggleOptions = (item: string) => {
        const newOptions = {...schedOptions};
        newOptions[item] = (schedOptions[item] === false);
        setSchedOptions(newOptions);

        if (currSched !== 'off') {
            cleanRebuildFutureEvents({name:currGroup,...schedGroups[currGroup]}, currSched, newOptions);
        }
    }
    // handle ui for schedule buttons
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
    // change currGroup from choicelist
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

    // update when currGroup updates
    useEffect(() => {
        if (schedGroups[currGroup] && allTasks) {
            // set schedule buttons, example = {'test4': 'wake'}
            setSchedButtons(buildButtons({name:currGroup,...schedGroups[currGroup]}));

            // set optional schedule buttons, example = {'Miralax': true,'Sunday': false,}
            setSchedOptions(buildOptions({name:currGroup,...schedGroups[currGroup]}, allTasks));
        }

    }, [enqueueSnackbar, allTasks, schedGroups, currGroup]);

    // init
    useEffect(() => {
        // every ten seconds, get the time and update clock
        // cleanup on useeffect return
        setNow();
        var intervalId = setInterval(() => {setNow()}, 10000);

        // setup Data
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
                'begin 22:00,+1,+1',
            ]},
        }
        setAllTasks(wkTasks);

        // setup scheduleGroup
        const wkSchedGroup: iSchedGroupList = {
            'default': {descr:'default schedules', schedNames: [
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
                {schedName: 'test1', schedTasks: [
                    {evTaskId: 'back2bed'},
                    {evTaskId: 'twominute'},
                ]},
                {schedName: 'test2', begins: 'now', schedTasks: [
                    {evTaskId: 'cuckoo97'},
                ]},
                {schedName: 'test3', begins: 'now', schedTasks: [
                    {evTaskId: 'basetime'},
                ]},
                {schedName: 'blank', begins: 'now', schedTasks: []},
            ]},
        }
        setSchedGroups(wkSchedGroup);

        // init completed
        setHstatus("Ready");
        enqueueSnackbar(`init complete`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );

        return () => {clearInterval(intervalId)};
    }, [enqueueSnackbar]);



    return(
    <Layout>
      <Seo title="Scottschedule Prototype" />
      <PageTopper pname="Home" vdebug={vdebug}
        helpPage="/help/home"
      />
      <Box mx={2} display="flex" flexWrap="wrap" justifyContent="space-between">
      <Card style={{maxWidth: 432, minWidth: 410, flex: '1 1', background: '#FAFAFA',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

      <Box m={0} p={0} display="flex" justifyContent="space-around" alignItems="flex-start">
        <Box><h1 id='mainclock'>Starting...</h1></Box>
        <Box>
          <h2 id='maindate'></h2>
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
                : <MenuItem value='default'>default</MenuItem>
              }
            </TextField>
        </Box>
      </Box>

      <Box mx={1} mb={1}>
          <Button variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => toggleScheds("off")}>Off</Button>

      {Object.keys(schedOptions).filter(item => item !== 'tomorrow').map(item => {
        return (
          <Button key={item} variant={(schedOptions[item])? "contained": "outlined"}
            color="primary" onClick={() => toggleOptions(item)}>
            {item}
          </Button>
        )})}
          <Button key={'tomorrow'} variant={(schedOptions['tomorrow'])? "contained": "outlined"}
            color="primary" onClick={() => toggleOptions('tomorrow')}>
            {(schedOptions['tomorrow'])? "tomorrow": "today"}
          </Button>

      </Box><Box mx={1} my={1}>
      {Object.keys(schedButtons).map(item => {
          return (
            <Button key={item} variant={(currSched === item)? "contained": "outlined"} color="primary" onClick={() => toggleScheds(item)}>
              {schedButtons[item]}
            </Button>
      )})}
      </Box>

     <Divider />
     <Box mx={1} my={1} display="flex" justifyContent="space-between" alignItems="center">
       Default <audio className="audio-element" controls >
         <source src={DefaultSound} type="audio/wav" />
         Your browser doesn't support audio
       </audio>
     </Box>

      </Card>

    { (futureEvs.length > 0 || expiredEvs.length > 0) &&
      <Box>
      { (expiredEvs.length > 0) &&
      <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 410, flex: '1 1', background: '#FAFAFA',
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

      { (futureEvs.length > 0) &&
      <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 410, flex: '1 1', background: '#FAFAFA',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
        <h4>Upcoming Events</h4>
        { futureEvs.map(item => <DisplayFutureEvent
          key={`${item.evTstamp}:${item.evTaskId}`} item={item}
          descr={(allTasks[item.evTaskId])? allTasks[item.evTaskId].descr: 'system'}/>)
        }
        </Box>
      </Card>
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
