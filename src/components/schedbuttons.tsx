import React from 'react';

import Button from '@mui/material/Button';

interface OptionsButtonsProps {
    options: iSchedOptions,
    onClick(name: string): void,
}
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
          <Button size='large' key={'tomorrow'} variant={(props.options['tomorrow'])? "contained": "outlined"}
            color="primary" onClick={() => props.onClick('tomorrow')}>
            tomorrow
          </Button>
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
    return (wkSchedGroup.schedNames.reduce(optionSchedReduce, {}));
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
    const starterOptions = {'tomorrow': false};

    return (wkSchedGroup.schedNames.reduce(optionSchedReduce, starterOptions));
};
