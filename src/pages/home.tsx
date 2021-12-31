// runs complex timers
//  execute events, alarmTask, getNextAlarm, killAlarmTask, useEffect(futureEvs)
//  future events, DisplayFutureEvent, buildFutureEvents
//  ui, setNow (maintain clock/calendar),
//    toggleOptions(string), toggleScheds(string),
//    bldOptions(iSchedGroup, string)
//  init
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
import Divider from '@mui/material/Divider';

import DefaultSound from '../sounds/default.wav';

interface iFutureEvent {
    evTstamp: number,
    evTaskId: string,
};

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
    const [currSched, setCurrSched] = useState('off');
    const [schedButtons, setSchedButtons] = useState<iSchedButtons>({});
    const [schedOptions, setSchedOptions] = useState<iSchedOptions>({});

    const [futureEvs, setFutureEvs] = useState<iFutureEvent[]>([]);
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [schedGroup, setSchedGroup] = useState<iSchedGroup>({});
    const [alarmId, setAlarmId] = useState(0);


    // execute event
    //
    const alarmTask = () => {
        setAlarmId(0);
        var currdate = new Date();
        console.log('Timer Complete', currdate.toLocaleString());

        // play sound unless quieted
        const alarmAudio = document.getElementsByClassName("audio-element")[0]
        if (alarmAudio) {
            alarmAudio.play();
        } else {
            console.log("no mooo");
        }

        // remove current event from
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate.valueOf());
        if (wkEvents.length !== futureEvs.length) {
            setFutureEvs(wkEvents);
            if (wkEvents.length === 0) {
                setCurrSched("off");
                setHstatus("Completed");
            }
        } else {
            console.log("no cleanup after alarm");
        }
    };
    const getNextAlarm = () => {
        let ret_milli = 0;
        let currdate = new Date().valueOf();
        let wkEvents: iFutureEvent[] = futureEvs.filter(item => item.evTstamp > currdate);

        // return milliseconds until alarm
        if (wkEvents.length > 0) {
            ret_milli = wkEvents[0].evTstamp - currdate;
        }
        return (ret_milli);
    };
    const killAlarmTask = () => {
        if (alarmId) {
            clearTimeout(alarmId);
            setAlarmId(0);
            console.log('Cancel timer');
        }
    };
    // maintain the next alarm timer, and update state
    // const [alarmId, setAlarmId] = useState();
    useEffect(() => {
        killAlarmTask();

        // build new alarm task
        if (futureEvs.length > 0) {
            //    find next alarm, and milliseconds until trigger
            var nextAlarm = getNextAlarm();
            if (nextAlarm > 0) {
                var timeoutId = setTimeout(alarmTask, nextAlarm) as unknown as number;
                setAlarmId(timeoutId);
            } else {
                console.log('future events but no next alarm?');
            }
        }
    }, [futureEvs]);


    // future events
    //
    const DisplayFutureEvent = (props: iFutureEvent) => {
        const wkdate = new Date(props.evTstamp);
        return (
          <div>
            {wkdate.toLocaleString()} -- Task {props.evTaskId}
          </div>
    )}

    const buildFutureEvents = (wksched: string, taskInfo: iTask): iFutureEvent[] => {
        let wkEvents: iFutureEvent[] = [];
        let currdate = new Date();

        const tasksReduceToRules = (outRules: string[], wkTaskName: iSchedTask) => {
            console.log("task", wkTaskName);
            if (taskInfo[wkTaskName.evTaskId]) {
                // find matching rule - loop backward through rules to find first match
                let matchRule: string = '';
                const tasklist = taskInfo[wkTaskName.evTaskId].schedRules.slice().reverse();

                for (const wkRule of tasklist) {
                    console.log("rule", wkRule);

                    const ruleWords = wkRule.split(' ');
                    switch(ruleWords[0]) {
                        case "begin":
                            // begin always matches
                            matchRule = ruleWords.slice(1).join(' ');
                            break;
                        case "option":
                            // option matches if all arguments are true
                            console.log("option");
                            break;
                        case "start":
                            // start matches if start === beginning
                            console.log("start");
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

                // end valid task handling
            } else {
                console.log(wkTaskName.evTaskId, " task not found");
            }
            return outRules;
        }


        // start
        if (wksched === "test1") {
            // couple of quick short tests
            let wkdate = new Date(currdate.valueOf());
            wkdate.setSeconds(wkdate.getSeconds()+120)
            wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '1'})

            wkdate.setSeconds(wkdate.getSeconds()+120)
            wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '2'})

            wkdate.setSeconds(wkdate.getSeconds()+120)
            wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: '3'})
        } else if (wksched === "test2") {
            // on the hour
            let wkdate = new Date(currdate.valueOf());
            for (let wkhour = 8; wkhour < 19; wkhour++) {
                wkdate.setHours(wkhour);
                wkdate.setMinutes(0);
                wkdate.setSeconds(0);
                wkEvents.push({evTstamp: wkdate.valueOf(), evTaskId: wkhour.toString()})
            }
        } else {
            // derive the future events from schedule

            // find the schedule and possibly start time
            const schedParts = wksched.split('.');
            let schedList: iSchedule[] = [];
            if (schedGroup['default']) {
                schedList = schedGroup['default'].schedNames.filter(item => item.schedName === schedParts[0]);
            }
            if (schedList.length !== 1) {
                console.log("no unique schedule found ", schedList, schedParts[0]);
                return wkEvents;
            }
            console.log("found ", schedList[0].schedName, schedList[0]);

            // find the start date
            if (schedParts[1]) {
                console.log("schedule start ", schedParts[1]);
            } else {
                console.log("schedule start current");
            }

            // get appropriate rules from tasklist
            const activeRules = schedList[0].schedTasks.reduce(tasksReduceToRules, []);
            console.log("active Rules", activeRules);

            // finished with all tasks
        }
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

    // handle ui for optional schedule buttons
    const toggleOptions = (item: string) => {
        const newOptions = {...schedOptions};
        newOptions[item] = (schedOptions[item] === false);
        setSchedOptions(newOptions);
    }
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
        return (wkSchedGroup['default'])? wkSchedGroup['default'].schedNames.reduce(optionSchedReduce, {}): {};
    }
    // loops through nested scheduleGroup looking for all possible options
    const buildOptions = (wkSchedGroup: iSchedGroup, wkTasks: iTask) : iSchedOptions => {
        // loop through rules looking for opt statements
        const optionRuleReduce = (outDict: iSchedOptions, item: string) => {
            const optIndex = item.indexOf('option ');
            if (optIndex >= 0) {
                const ruleWords = item.slice(optIndex).split(' ');
                if (ruleWords[1]) {
                    ruleWords[1].split(',').forEach((item: string) => {
                        outDict[item] = false;
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

        return (wkSchedGroup['default'])? wkSchedGroup['default'].schedNames.reduce(optionSchedReduce, {}): {};
    }

    // handle ui for schedule buttons
    const toggleScheds = (wksched: string) => {
        if (currSched !== wksched) {
            setHstatus("Loading");
            setCurrSched(wksched);
            console.log("Building schedule ", wksched);
            killAlarmTask();

            let wkEvents: iFutureEvent[] = [];
            let currdate = new Date();
            if (wksched === "off") {
                enqueueSnackbar(`scheduler off`,
                    {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                } else {
                    wkEvents = buildFutureEvents(wksched, allTasks);
                }

            // cleanup
            let finalEvents: iFutureEvent[] = wkEvents.filter(item => item.evTstamp > currdate.valueOf());
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
        }
    }

    // init
    useEffect(() => {
        // setup UI
        setNow();
        // every ten seconds, get the time and update clock
        var intervalId = setInterval(() => {setNow()}, 10000);
        // cleanup on useeffect return

        // setup Data
        //
        // setup events
        const wkTasks: iTask = {
            'miralax' : {descr:'long description', schedRules: [
                'begin +2:15',
            ]},
        }
        setAllTasks(wkTasks);

        // setup scheduleGroup
        const wkSchedGroup: iSchedGroup = {
            'default': {descr:'default schedules', schedNames: [
                {schedName: 'main', buttonName: ' ', begins: '8:00,8:15,8:30,8:45,9:00,9:15,9:30,9:45,10:00,', schedTasks: [
                    {evTaskId: 'miralax'},
                ]},
                {schedName: 'test1', schedTasks: []},
                {schedName: 'test2', begins: 'now', schedTasks: []},
                {schedName: 'test3', begins: 'now', schedTasks: []},
            ]},
        }
        setSchedGroup(wkSchedGroup);

        // set schedule buttons
        // setSchedButtons({'test4': 'wake'});
        setSchedButtons(buildButtons(wkSchedGroup));

        // set optional schedule buttons
        // setSchedOptions({'Miralax': true,'Sunday': false,});
        setSchedOptions(buildOptions(wkSchedGroup, wkTasks));

        // init completed
        setHstatus("Ready");
        enqueueSnackbar(`init complete`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );

        return () => {clearInterval(intervalId)};
    }, [enqueueSnackbar]);



    return(
    <Layout>
      <Seo title="Scottschedule Home" />
      <PageTopper pname="Home" vdebug={vdebug}
        helpPage="/help/home"
      />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <Card style={{marginTop: '3px', maxWidth: 412, minWidth: 410, flex: '1 1'}}>
      <Box display="flex" justifyContent="space-around" alignItems="flex-start">
        <Box><h1 id='mainclock'>Starting...</h1></Box>
        <Box><h2 id='maindate'></h2></Box>
        <Box id='status'>{hstatus}</Box>
      </Box>

      <Box mx={1} mb={1}>
      <Button size="small" variant={(currSched === "off")? "contained": "outlined"} color="error" onClick={() => toggleScheds("off")}>Off</Button>
      {Object.keys(schedButtons).map(item => {
          return (
            <Button key={item} size="small" variant={(currSched === item)? "contained": "outlined"} color="primary" onClick={() => toggleScheds(item)}>
              {schedButtons[item]}
            </Button>
      )})}
      </Box>

     { (Object.keys(schedOptions).length > 0) &&
     <>
     <Divider />
     <Box mx={1} my={1}>
       {Object.keys(schedOptions).map(item => {
         return (
         <Button key={item} size="small" variant={(schedOptions[item])? "contained": "outlined"}
           color="primary" onClick={() => toggleOptions(item)}>
           {item}
         </Button>
       )})}
     </Box>
     </>
     }

     <Divider />
     <Box mx={1} my={1} display="flex" justifyContent="space-between" alignItems="center">
       Default <audio className="audio-element" controls >
         <source src={DefaultSound} type="audio/wav" />
         Your browser doesn't support audio
       </audio>
     </Box>

      </Card>

    { (futureEvs.length > 0) &&
      <Box>
      <Card style={{marginTop: '3px', maxWidth: 410, minWidth: 300, flex: '1 1'}}>
        <Box mx={1}>
        <h4>Upcoming Events</h4>
        { futureEvs.map(item => <DisplayFutureEvent key={item.evTstamp} {...item}/>)}
        </Box>
      </Card>
      </Box>
    }
    </Box>

    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default HomePage
