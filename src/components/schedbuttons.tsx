import React from 'react';

import Button from '@mui/material/Button';

interface OptionsButtonsProps {
    options: iSchedOptions,
    onClick(name: string): void,
}
// if present, strip out tomorrow button and make it go last
export const OptionsButtons = (props: OptionsButtonsProps) => {
    return (
      <>
      {Object.keys(props.options).filter(item => item !== 'tomorrow').map(item => {
        return (
          <Button size='large' key={item} variant={(props.options[item])? "contained": "outlined"}
            color="primary" onClick={() => props.onClick(item)}>
            {item}
          </Button>
        )})}
      {Object.keys(props.options).filter(item => item === 'tomorrow').map(item => {
        return (
          <Button size='large' key={item} variant={(props.options[item])? "contained": "outlined"}
            color="primary" onClick={() => props.onClick(item)}>
            {item}
          </Button>
        )})}
      </>
)};

// loops through nested scheduleGroup to build schedule buttons
export const buildButtons = (wkSchedGroup: iSchedGroup) : iSchedButtons => {
    // loop through schedules looking for tasks
    const optionSchedReduce = (outDict: iSchedButtons, item: iSchedule) => {
        if (item.begins) {
            const scheds = item.begins.split(',');
            if (scheds.length > 1) {
                scheds.forEach((starttime: string) => {
                    if (starttime && starttime !== '') {
                        outDict[item.schedName + '.' + starttime] = (item.buttonName || item.buttonName === '')
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
    const retres = wkSchedGroup.schedNames.reduce(optionSchedReduce, {});
    return (retres);
}

// loops through nested scheduleGroup looking for all possible options
export const buildOptions = (wkSchedGroup: iSchedGroup, wkTasks: iTask) : iSchedOptions => {
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
    let starterOptions: { [key: string]: boolean } = {'tomorrow': false};
    if (wkSchedGroup.notomorrow) starterOptions = {};

    const retres = wkSchedGroup.schedNames.reduce(optionSchedReduce, starterOptions);
    return (retres);
};
