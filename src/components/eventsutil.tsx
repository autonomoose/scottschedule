import React from 'react';
import { API } from 'aws-amplify';

import Box from '@mui/material/Box';

import { listEventsFull } from '../graphql/queries';

interface DisplayEventProps {
  evid: string,
  tasks: iTask
}
const DisplayEvent = (props: DisplayEventProps) => {
    const evid = props.evid;
    const allTasks = props.tasks;
    return(
      <Box key={`${evid}0`}>
        <span>{evid}({allTasks[evid].schedRules.length} rules) {allTasks[evid].descr}</span>
        {
          allTasks[evid].schedRules.map((task: string) => {
            let sequence = 1;
          return(
            <Box key={`${evid}${sequence}`}  display='flex'>
              {sequence} {`${evid}${sequence}`}
              <Box mx={1} px={1} sx={{ border: '1px solid grey' }} key={`${evid}${sequence++}`}>
                { (task.length >= 45)
                  ? <>{task.slice(0,45)} {task.slice(45)})</>
                  : <>{task}</>
                }
              </Box>
            </Box>
          )})
        }
      </Box>
) };

export const fetchEventsDB = async (): Promise<iTask> => {
    try {
        const result: any = await API.graphql({query: listEventsFull})
        console.log("events:", result.data.listEvents.items.length);

        const compactTasks = result.data.listEvents.items.reduce((resdict: iTask, item: iTaskDb) => {
            const evkeys = item.evnames.split('!');
            if (!resdict[evkeys[0]]) {
                resdict[evkeys[0]] = {descr: '', schedRules: []};
            }
            if (evkeys[1] === 'args') {
                resdict[evkeys[0]].descr = (item.descr)? item.descr: '';
            } else {
                resdict[evkeys[0]].schedRules.push(evkeys[1] + " " + item.rules);
            }
            return resdict;
        }, {});

        return(compactTasks);
    } catch (result) {
        console.log("got error", result);
        return({});
    }
};

export default DisplayEvent
