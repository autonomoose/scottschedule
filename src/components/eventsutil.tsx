// events utilities and components
// exports default DisplayEvent,
//  also exports components CreateEvent, ModifyEvent
//  and data fetchEventsDB - full events
import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { listEventsFull } from '../graphql/queries';
import { mutAddEvents, mutAddRules } from '../graphql/mutations';

// -------------------------------------------------
interface CreateEventProps {
  onComplete?: (status: string) => void,
  open: boolean
}
export const CreateEvent = (props: CreateEventProps) => {
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            name: '',
            descr: '',
        }
    });
    const { isDirty, errors } = formState;

    interface FormNewEvParms {
        name: string,
        descr: string,
    };
    const formNewEvSubmit = async (data: FormNewEvParms) => {
        console.log('form data', data);
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': data.name+"!args",
                'descr': data.descr,
                }
            };
            const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);
            if (props.onComplete) {
                props.onComplete(data.name);
            }
        } catch (result) {
            console.log('failed update', result);
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="newEv" onSubmit={handleSubmit(formNewEvSubmit)}>
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

// -------------------------------------------------
interface CreateRuleProps {
  evName: string,
  onComplete?: (status: string) => void,
  open: boolean
}
export const CreateRule = (props: CreateRuleProps) => {
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            cmd: 'begin',
            content: '',
        }
    });
    const { isDirty, errors } = formState;

    const formNewRuleCancel = async () => {
        if (props.onComplete) {
            props.onComplete('');
        }
    }
    interface FormNewRuleParms {
        cmd: string,
        content: string,
    };
    const formNewRuleSubmit = async (data: FormNewRuleParms) => {
        console.log('form data', data);
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': props.evName+"!"+data.cmd,
                'rules': data.content,
                }
            };
            const result = await API.graphql({query: mutAddRules, variables: xdata});
            console.log('updated rules', result);
            if (props.onComplete) {
                props.onComplete(props.evName);
            }

        } catch (result) {
            console.log('failed update rules', result);
            if (props.onComplete) {
                props.onComplete('');
            }
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="newRule" onSubmit={handleSubmit(formNewRuleSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Add New Rule
            </Typography>
          </Box>

          <Box>
            <textarea rows={2} cols={27} data-testid="contentRule"
             {...register('content', { required: true,})}
             aria-invalid={errors.content ? "true" : "false"}
            ></textarea>
          </Box>

          <Box mt={2}>
            <Button size="small" variant="contained" onClick={() => formNewRuleCancel()}>Cancel</Button>
            <Button size="small" variant="contained" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface ModifyEventProps {
  evid: string,
  tasks: iTask,
  onComplete?: (status: string) => void,
  open: boolean,
}
export const ModifyEvent = (props: ModifyEventProps) => {
    const allTasks = props.tasks;
    const evid = props.evid;

    const [evRule, setEvRule] = useState('');

    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            descr: '',
        }
    });
    const { isDirty, errors } = formState;

    useEffect(() => {
        const defaultValues = {
            descr: (allTasks[evid] && allTasks[evid].descr)? allTasks[evid].descr : '',
        }
        reset(defaultValues);
    }, [allTasks, evid] );

    interface FormModEvParms {
        descr: string,
    };
    const formModEvSubmit = async (data: FormModEvParms) => {
        console.log('modform data', data);
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': evid+"!args",
                'descr': data.descr,
                }
            };
            const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);
            if (props.onComplete) {
                props.onComplete(evid);
            }
        } catch (result) {
            console.log('failed update', result);
        }
    };
    const formCallback = (status: string) => {
        console.log("mod callback status", status);
        setEvRule('');
        if (props.onComplete && status !== '') {
            props.onComplete(status);
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="newEv" onSubmit={handleSubmit(formModEvSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>Modify Event {evid}</Typography>
          </Box>
          <Box>{evid}</Box>

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
          <Box display='flex' justifyContent='space-around'>
            <span>Rules ({(allTasks && allTasks[evid])? allTasks[evid].schedRules.length: 0})</span>
            <Button onClick={() => setEvRule(evid)}  size="small" variant="outlined" color="primary">New Rule</Button>
          </Box>
          {(allTasks && allTasks[evid]) &&
          <Box>
            <CreateRule evName={evRule} onComplete={formCallback} open={(evRule !== '')} />
            {
              allTasks[evid].schedRules.map((task: string) => {
                let sequence = 1;
              return(
                <Box key={`${evid}${sequence}`}  display='flex'>
                  {sequence}
                  <Box mx={1} mb={1} px={1} sx={{ border: '1px solid grey' }} key={`${evid}${sequence++}`}>
                    {task.split(',').join(', ')}
                  </Box>
                </Box>
              )})
            }

          </Box>
          }

        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface DisplayEventProps {
  evid: string,
  tasks: iTask,
  select?: (evid: string) => void,
}
const DisplayEvent = (props: DisplayEventProps) => {
    const evid = props.evid;
    const allTasks = props.tasks;

    return(
      <Box key={`${evid}0`}>
        <span>
          {(props.select)
            ? <Button size="small" onClick={() => {props.select?.(evid);}}>
                {evid}
              </Button>
            : <span>{evid}</span>
          }

          - {allTasks[evid].descr}
        </span>
      </Box>
) };

// -------------------------------------------------
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
