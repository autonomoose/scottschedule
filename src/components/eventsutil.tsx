// events utilities and components
// exports default DisplayEvents,
//  also exports components CreateEvent, ModifyEvent
//  and data fetchEventsDB - full events
import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';

import {CaptionBox} from './boxen';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { listEventsFull } from '../graphql/queries';
import { mutAddEvents, mutAddRules, mutDelEvents } from '../graphql/mutations';

/*
   add events
*/
interface CreateEventProps {
  onComplete: (status: string) => void,
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
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': data.name+"!args",
                'descr': data.descr,
                }
            };
            await API.graphql({query: mutAddEvents, variables: xdata});
            props.onComplete(data.name);
        } catch (result) {
            console.warn('failed update', result);
        }
    };

    return(
      <Box ml={4} display={(props.open)?'block': 'none'}>
      <Card style={{margin: '3px 0 0 0', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
          <form key="newEv" onSubmit={handleSubmit(formNewEvSubmit)}>
          {/* -------------- Title block ----------------- */}
          <Box px='0.5em' display="flex" justifyContent="space-between" alignItems="baseline" sx={{bgcolor: 'site.main'}}>
            <Typography variant='h6'>
              Add New Event
            </Typography>
          </Box>

          <Box px='0.5em'><label>
            Name <input type="text" size={12} data-testid="nameInput"
             {...register('name', { required: true, pattern: /\S+/, maxLength:16 })}
             aria-invalid={errors.name ? "true" : "false"}
            />
          </label></Box>
          <Box px='0.5em'><label> Description
            <input type="text" size={30} data-testid="descrInput"
             {...register('descr', { required: true, pattern: /\S+/, maxLength:30 })}
             aria-invalid={errors.descr ? "true" : "false"}
            />
          </label></Box>

          <Box  px='0.5em' mt={2} mb={1} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface CreateRuleProps {
  evName: string,
  onComplete: (status: string) => void,
  open: boolean
}
export const CreateRule = (props: CreateRuleProps) => {
    // form states
    const { register, handleSubmit, reset, formState, watch } = useForm({
        defaultValues: {
            cmd: 'begin',
            options: '',
            content: '',
        }
    });
    const { isDirty, errors } = formState;

    const formNewRuleCancel = async () => {
        props.onComplete('');
    }
    interface FormNewRuleParms {
        cmd: string,
        options: string,
        content: string,
    };
    const formNewRuleSubmit = async (data: FormNewRuleParms) => {
        try {
            let wkEvNames = props.evName+"!"+data.cmd;
            if (data.options !== '') {
                wkEvNames += ' ' + data.options;
            }
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': wkEvNames,
                'rules': data.content,
                }
            };
            await API.graphql({query: mutAddRules, variables: xdata});
            props.onComplete(props.evName);

        } catch (result) {
            console.warn('failed update rules', result);
            props.onComplete('');
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="newRule" onSubmit={handleSubmit(formNewRuleSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Add New Rule
            </Typography>
          </Box>

          <Box display='flex'>
            <select {...register("cmd")}>
              <option value="begin">begin</option>
              <option value="option">option</option>
            </select>
            <input disabled={(watch('cmd') === 'begin')} data-testid="optionsInput" {...register('options')} />
          </Box>

          <Box>
            <textarea rows={2} cols={27} data-testid="contentRule"
             {...register('content', { required: true,})}
             aria-invalid={errors.content ? "true" : "false"}
            ></textarea>
          </Box>

          <Box mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" color='error' onClick={() => formNewRuleCancel()}>Cancel</Button>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) };

/*
   modify events
*/
interface ModifyEventProps {
  evid: string,
  tasks: iTask,
  onComplete: (status: string) => void,
  open: boolean,
}
interface FormModifyEventParms {
  descr: string,
}
export const ModifyEvent = (props: ModifyEventProps) => {
    const allTasks = props.tasks;
    const evid = props.evid;

    const [evRule, setEvRule] = useState('');

    // form states
    const formDefaultVal: FormModifyEventParms = {
        descr: '',
    };
    const { register, handleSubmit, reset, formState } = useForm({defaultValues: formDefaultVal});
    const { isDirty, errors } = formState;

    /* -------- reset form defaults to any current values ------ */
    useEffect(() => {
        let defaultValues: FormModifyEventParms = formDefaultVal;

        if (allTasks[evid]?.descr) {
            defaultValues['descr'] = allTasks[evid].descr;
        }

        reset(defaultValues);
    }, [allTasks, evid] );

    const formModEvSubmit = async (data: FormModifyEventParms) => {
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': evid+"!args",
                'descr': data.descr,
                }
            };
            await API.graphql({query: mutAddEvents, variables: xdata});
            props.onComplete(evid);
        } catch (result) {
            console.warn('failed update', result);
        }
    };
    interface FormDelEventParms {
        cmd: string,
    };
    const formDelEvent = async (data: FormDelEventParms) => {
        try {
            const xdata = {'input': {
                'etype': 'ev',
                'evnames': evid+"!"+data.cmd,
                }
            };
            await API.graphql({query: mutDelEvents, variables: xdata});
            props.onComplete(evid);
        } catch (result) {
            console.warn('failed delete', result);
        }
    };
    const formCallback = (status: string) => {
        console.log("mod callback status", status);
        setEvRule('');
        props.onComplete(status);
    };

    return(
      <Box ml={4} display={(props.open)?'block': 'none'}>
      <Card style={{margin: '3px 0 0 0', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
          <form key="newEv" onSubmit={handleSubmit(formModEvSubmit)}>
          {/* -------------- Title block ----------------- */}
          <Box px='0.5em' display="flex" justifyContent="space-between" alignItems="baseline" sx={{bgcolor: 'site.main'}}>
            <Typography variant='h6'>
              Event {evid}
              { (allTasks[evid] && allTasks[evid].schedRules.length === 0) ?
                <IconButton data-testid={'del-'+evid} size='small' color='error' onClick={() => formDelEvent({'cmd': 'args'})}>
                  <DeleteForeverIcon sx={{height: '1.25rem'}} />
                </IconButton>
                :
                <IconButton disabled data-testid={'del-'+evid} size='small'>
                  <DeleteForeverIcon sx={{height: '1.25rem'}} />
                </IconButton>
              }
            </Typography>
            <IconButton data-testid='cancel' size='small' onClick={() => props.onComplete('')}>X</IconButton>
          </Box>

          {/* -------------- Main Form Grid ----------------- */}
          <Box sx={{ flexGrow: 1}}><Grid container spacing={2}>
            {/* -------------- Top Line ----------------- */}
            <Grid item xs={8}>
              <Box mt={.5} mr={.5} px='0.5rem'>
                <TextField label='Summary' size='small' fullWidth
                  {...register('descr', {
                    required: 'this field is required',
                    pattern: {value: /^[a-zA-Z0-9 \-]+$/, message: 'no special characters'},
                    maxLength: {value: 20, message: 'limited to 20 characters'},
                  })}
                  aria-invalid={errors.descr ? "true" : "false"}
                  color={errors.descr ? 'error' : 'primary'}
                  inputProps={{'data-testid': 'descrInput'}}
                  InputLabelProps={{shrink: true}}
                />
                <ErrorMessage errors={errors} name="descr" render={({ message }) =>
                  <CaptionBox caption={message} color='error'/>
                } />
              </Box>
            </Grid>
          </Grid></Box>
          {/* ----------End Grid, Form Save/Reset Buttons ----------------- */}

          <Box px='0.5em' mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>
          </form>

          {/* -------------- Rules ----------------- */}
          <Box px='0.5em'  mt={2} mb={1} display='flex' justifyContent='space-between' sx={{bgcolor: 'site.main'}}>
            <span>Rules ({(allTasks && allTasks[evid])? allTasks[evid].schedRules.length: 0})</span>
            <Button onClick={() => setEvRule(evid)}  size="small" variant="outlined" color="primary">New Rule</Button>
          </Box>
          {(allTasks && allTasks[evid]) &&
          <Box>
            <CreateRule evName={evRule} onComplete={formCallback} open={(evRule !== '')} />
            {
              allTasks[evid].schedRules.map((task: string) => {
                // get the cmd words out
                let words = task.split(' ');
                let cmd = words.shift() || 'begin';
                if (cmd === 'option') {
                    cmd = 'option ' +  words.shift() || '';
                }
                const displayRule = words.join(' ').split(',').join(', ');

              return(
                <Box key={`${evid}${cmd}`}  display='flex'>
                  <Box display='flex'>
                    <IconButton size='small' color='error' onClick={() => formDelEvent({cmd})}>X</IconButton>
                    {cmd}
                  </Box>
                  <Box mx={1} mb={1} px={1} sx={{ border: '1px solid grey' }} key={`${evid}${cmd}`}>
                    {displayRule}
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
  tasks: iTask,
  select?: (evid: string) => void,
}
const DisplayEvents = (props: DisplayEventProps) => {
    const allTasks = props.tasks;

    return(
      <List disablePadding dense sx={{marginLeft: '1em'}}>
        {
          Object.keys(allTasks).map((evid: string) => {
          return(
            <ListItem button key={evid} onClick={() => {props.select?.(evid);}}>
              {evid} - {allTasks[evid].descr}
            </ListItem>
           )})
        }
      </List>
) };

// -------------------------------------------------
export const fetchEventsDB = async (): Promise<iTask> => {
    try {
        const result: any = await API.graphql({query: listEventsFull})

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
        return({});
    }
};

export default DisplayEvents
