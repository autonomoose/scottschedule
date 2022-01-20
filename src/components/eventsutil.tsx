import React from 'react';
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { listEventsFull } from '../graphql/queries';
import { mutAddEvents } from '../graphql/mutations';

interface CreateEventProps {
  tasks: iTask
}
export const CreateEvent = (props: CreateEventProps) => {
    const allTasks = props.tasks;

    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            name: '',
            descr: '',
        }
    });
    const { isDirty, errors } = formState;

    interface FormParms {
        name: string,
        descr: string,
    };
    const formSubmit = async (data: FormParms) => {
        console.log('form data', data);
        try {
            const xdata = {
                'etype': 'ev',
                'evnames': data.name+"!args",
                'descr': data.descr,
            };
            const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);

        } catch (result) {
            console.log('failed update', result);
        }
    };

    return(
      <Box><Card style={{marginTop: '3px', maxWidth: 432, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="apply" onSubmit={handleSubmit(formSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Add New Event
            </Typography>
          </Box>

          <Box><label> Name
            <input type="text" size={12} data-testid="nameInput"
             {...register('name', { required: true, pattern: /\S+/, maxLength:16 })}
             aria-invalid={errors.name ? "true" : "false"}
            />
          </label></Box>
          <Box><label> Description
            <input type="text" size={25} data-testid="descrInput"
             {...register('descr', { required: true, pattern: /\S+/, maxLength:25 })}
             aria-invalid={errors.descr ? "true" : "false"}
            />
          </label></Box>

          <Box mt={2}>
            <Button size="small" variant="contained" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) };

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
        console.log("events loaded:", result.data.listEvents.items.length);

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
