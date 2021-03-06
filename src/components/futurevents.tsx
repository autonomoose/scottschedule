import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

interface iFutureDict {
    [evTstampKey: string]: iFutureEvent[],
}
interface DisplayFutureEventProps {
    item: iFutureEvent,
    descr?: string,
};
const DisplayFutureEvent = (props: DisplayFutureEventProps) => {
    const wkdate = new Date(props.item.evTstamp);
    const wkdescr = (props.descr)? props.descr: props.item.evTaskId;
    const stamp = wkdate.toLocaleString('en-US', {hour: "2-digit", minute: "2-digit", second: "2-digit"});
    let wksize = (wkdescr.length < 25)? 'body1': 'caption';
    let offset = '';
    if (props.item.begTstamp && props.item.begTstamp !== props.item.evTstamp) {
        const sTotLeft = Math.round((props.item.evTstamp - props.item.begTstamp)/1000);
        if (sTotLeft > 0) {
            const minLeft = Math.floor(sTotLeft / 60);
            const hourLeft = Math.floor(minLeft / 60);
            // offset = hourLeft < 99? ('00'+hourLeft).slice(-2): '' + hourLeft;
            offset = '+' + hourLeft;
            offset += ':' + ('00' + (minLeft - (hourLeft*60))).slice(-2);
            offset += ':' + ('00' + (sTotLeft - (minLeft*60) - (hourLeft*3600))).slice(-2);
            wksize = 'caption';
        } else {
            offset ='old';
            wksize = 'caption';
        }
    }
    return (
      <Typography variant={wksize as any} component='div'>
        {stamp} {offset} - {wkdescr}
      </Typography>
)};
export default DisplayFutureEvent

interface DisplayFutureCardProps {
    evs: iFutureEvent[],
    tasks: iTask,
};
export const DisplayFutureCard = (props: DisplayFutureCardProps) => {
    return (
      <Card style={{marginTop: '3px', maxWidth: 432, minWidth: 404, flex: '1 1',
          boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <Typography variant='h6'>
            Upcoming Events
          </Typography>
          { props.evs.slice(1).map(item => <DisplayFutureEvent
            key={`${item.evTstamp}:${item.evTaskId}`} item={item}
            descr={(props.tasks[item.evTaskId])? props.tasks[item.evTaskId].descr: 'system'}/>)
          }
        </Box>
      </Card>
)};


// future events
//
// derive the future events from schedule
//   get the start time figured out
//   get the Task rules that match
//   process rules into events dict w/ tstamp key
//   convert dict to sorted array w/ earliest events first
export const buildFutureEvents = (parmDate: Date, wkgroup: iSchedGroup, wksched: string, taskInfo: iTask, optInfo: iSchedOptions): iFutureEvs => {
    let wkEvents: iFutureEvent[] = [];
    let currdate = new Date(parmDate.valueOf());
    if (optInfo['tomorrow']) {
        // set schedule start to 12:00:01 am tomorrow
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
                case 1: // minutes only (offset only) or word
                    if (/^\+?\d+#?\d*$/.test(wkTlang)) {
                        const minParts = wkTlang.split('#');
                        if (wkTlang[0] === '+') { // offset
                            const wkSeconds = (minParts.length > 1)? retDate.getSeconds() + Number(minParts[1]): 0;
                            retDate.setMinutes(retDate.getMinutes() + Number(minParts[0].substring(1)), wkSeconds);
                        } else { // constant
                            const wkSeconds = (minParts.length > 1)? Number(minParts[1]): 0;
                            retDate.setMinutes(Number(wkTlang.substring(1)), wkSeconds);
                        }
                    } else {
                        switch(wkTlang) {
                            case 'press':  // run-time option press
                                retDate = new Date(Date.now());
                                break;
                            case 'start': // based on schedule start
                            case 'now':
                                break;
                            default:
                                console.warn("unknown date - bad command", wkTlang);
                                break;
                        }
                    }
                    break;
                case 2: // hours and minutes (constant or offset)
                    if (/^\+?\d+$/.test(dateParts[0]) && /^\d+#?\d*$/.test(dateParts[1])) {
                        const minParts = dateParts[1].split('#');
                        if (wkTlang[0] === '+') { // offset
                            retDate.setHours(retDate.getHours() + Number(dateParts[0].substring(1)));
                            const wkSeconds = (minParts.length > 1)? retDate.getSeconds() + Number(minParts[1]): 0;
                            retDate.setMinutes(retDate.getMinutes() + Number(minParts[0]), wkSeconds);
                        } else { // constant
                            retDate.setHours(Number(dateParts[0]));
                            const wkSeconds = (minParts.length > 1)? Number(minParts[1]): 0;
                            retDate.setMinutes(Number(minParts[0]), wkSeconds);
                        }
                    } else {
                        console.warn("unknown date - bad characters", wkTlang);
                    }
                    break;
                default:
                    console.warn("unknown date - bad format", wkTlang);
                    break;
            }
        }
        return retDate;
    };
    // reducer loop thru rules
    const rulesReduceToEvents = (outEvents: iFutureDict, taskRule: string) => {
        // globals startTlang, startDate
        const evTask = taskRule.split('.')[0];
        const ruleParts = taskRule.split('.')[1].split(',');
        var lastDate = new Date(startDate.valueOf());
        lastDate.setHours(0);
        lastDate.setMinutes(0);
        lastDate.setSeconds(0);

        // handle each rule as a set of compound statements comma separated
        for (const wkRule of ruleParts) {
            // get timeoffset info and generate possible event time

            let ruleWords = wkRule.split(' ');
            let tlangTimeWord = ruleWords.shift();
            if (!tlangTimeWord || tlangTimeWord === '') {
                continue;
            }

            let evTime = (tlangTimeWord.startsWith('++'))
                ? tlangDate(tlangTimeWord.slice(1), lastDate)
                : tlangDate(tlangTimeWord, startDate); // global startDate

            // possibly adjust evTime with orlater(+0:00)/orsooner(xx:xx)
            //     continue matching unless it fails
            let nextTlangWord = ruleWords.shift();
            while (nextTlangWord === 'or' && ruleWords.length > 0) {
                let nextTimeWord = ruleWords.shift();
                if (!nextTimeWord || nextTimeWord === '') {
                    break;
                }

                let nextEvTime = (nextTimeWord.startsWith('++'))
                    ? tlangDate(nextTimeWord.slice(1), lastDate)
                    : tlangDate(nextTimeWord, startDate); // global startDate

                // console.log("curr", evTime);
                // console.log("or ", nextTimeWord, nextEvTime);
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
            if (typeof lastDate === 'undefined' || lastDate.valueOf() !== evTime.valueOf()) {
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
        return {evs:wkEvents};
    }
    let currSchedule = schedList[0];

    // find the starting time
    var startTlang = 'now';
    if (schedParts[1]) {
        startTlang = schedParts[1];
    } else if (currSchedule.begins) {
            startTlang = currSchedule.begins;
    }
    var startDate = tlangDate(startTlang, currdate);

    // get appropriate rules from tasklist
    let activeRules = [];

    if (currSchedule.schedTasks.length > 0) {
        activeRules = currSchedule.schedTasks.reduce(tasksReduceToRules, []);
    } else {
        // new
        activeRules.push("new.23:23");
    }

    // convert rules to future events dict (to preserve order on mult event per timestamp)
    const dictEvents = activeRules.reduce(rulesReduceToEvents, {});
    // convert dictionary to wkEvents: iFutureEvent[]
    for (const tmpTstamp of Object.keys(dictEvents).sort()) {
        for (const tmpEv of dictEvents[tmpTstamp]) {
            wkEvents.push(tmpEv);
        }
    }

    // copy currSchedule arguments that need to be on futureEvs
    // add another and this should be a set of fields processed by a loop
    let schedArgs: iFutureEvs = {evs: wkEvents, begins: startDate.valueOf()};
    if ('sound' in currSchedule) {
        schedArgs['sound'] = currSchedule['sound'];
    }
    if ('warn' in currSchedule) {
        schedArgs['warn'] = currSchedule['warn'];
    }
    return (schedArgs);
};
