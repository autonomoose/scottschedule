/* sched and groups utilities and components

 exports default DisplaySchedGroup (test -base)
    fetchSchedGroupsDB - full groups and schedules(test -base)
  Group components CreateGroup (test -create),
                     ModifyGroup (test -modify,-modempty)
                     ChoiceSchedGroup (test -choice)
  Schedule components ManSched (test -mansched)
  ConnectTask (test -connev)
*/

import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";

import LinkD from './linkd';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { listSchedGroupsFull, iSchedGroupListDB } from '../graphql/queries';
import { mutAddEvents, mutDelEvents, mutAddRules, mutAddScheds } from '../graphql/mutations';

// -------------------------------------------------
interface CreateGroupProps {
  onComplete?: (status: string) => void,
  open: boolean
}
const mockComplete = (msg: string) => {console.log(msg)};
export const CreateGroup = (props: CreateGroupProps) => {
    const funComplete = (props.onComplete) ? props.onComplete : mockComplete;
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            name: '',
            descr: '',
            notomorrow: '',
        }
    });
    const { isDirty, errors } = formState;

    interface FormNewGroupParms {
        name: string,
        descr: string,
        notomorrow: string,
    };
    const formNewGroupSubmit = async (data: FormNewGroupParms) => {
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': data.name+"!args",
                'descr': data.descr,
                'notomorrow': data.notomorrow,
                }
            };
            await API.graphql({query: mutAddEvents, variables: xdata});
            funComplete(data.name);
        } catch (result) {
            console.warn('failed group update', result);
        }
    };

    return(
      <Box ml={4} display={(props.open)?'block': 'none'}>
      <Card style={{margin: '3px 0 0 0', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
          <form key="newGroup" onSubmit={handleSubmit(formNewGroupSubmit)}>
          <Box px='0.5em' display="flex" justifyContent="space-between" alignItems="baseline" sx={{bgcolor: 'site.main'}}>
            <Typography variant='h6'>
              Add New Schedule Group
            </Typography>
            <IconButton size='small' onClick={() => funComplete('')}>X</IconButton>
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

          <Box px='0.5em' mt={2} mb={1} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) };
// -------------------------------------------------
interface ModifyGroupProps {
  group: string,
  groupSched: iSchedGroup,
  onComplete?: (status: string) => void,
  open: boolean,
}
export const ModifyGroup = (props: ModifyGroupProps) => {
    const funComplete = (props.onComplete) ? props.onComplete : mockComplete;
    const wkGroup = props.groupSched;
    const wkName = props.group;

    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            descr: '',
            notomorrow: '',
        }
    });
    const { isDirty, errors } = formState;

    useEffect(() => {
        const defaultValues = {
            descr: (wkGroup && wkGroup.descr)? wkGroup.descr : '',
            notomorrow: (wkGroup)? 'true' : '',
        }
        reset(defaultValues);
    }, [wkGroup] );

    interface FormModGroupParms {
        descr: string,
        notomorrow?: string,
    };
    const formModGroupSubmit = async (data: FormModGroupParms) => {
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkName+"!args",
                'descr': data.descr,
                'notomorrow': (data.notomorrow)? 'true': '',
                }
            };
            await API.graphql({query: mutAddEvents, variables: xdata});
            funComplete(wkName);
        } catch (result) {
            console.warn('failed group update', result);
        }
    };
    interface FormDelEventParms {
        cmd: string,
    };
    const formDelEvent = async (data: FormDelEventParms) => {
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkName+"!"+data.cmd,
                }
            };
            await API.graphql({query: mutDelEvents, variables: xdata});
            funComplete(wkName);
        } catch (result) {
            console.warn('failed delete', result);
        }
    };

    return(
      <Box ml={4} display={(props.open)?'block': 'none'}>
      <Card style={{margin: '3px 0 0 0', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
          <form key="modGroup" onSubmit={handleSubmit(formModGroupSubmit)}>
          <Box px='0.5em' display="flex" justifyContent="space-between" alignItems="baseline" sx={{bgcolor: 'site.main'}}>
            <Typography variant='h6'>Modify Group</Typography>
            <IconButton size='small' onClick={() => funComplete('')}>X</IconButton>
          </Box>
          <Box px='0.5em' display='flex' alignItems='center'>
            {wkName}
            { (wkGroup && wkGroup.schedNames.length === 0) ?
            <IconButton data-testid='delete' size='small' color='warning' onClick={() => formDelEvent({'cmd': 'args'})}>
              <DeleteForeverIcon sx={{height: '1.25rem'}} />
            </IconButton>
            :
            <IconButton data-testid='no-del' size='small'>
              <DeleteForeverIcon sx={{height: '1.25rem'}} />
            </IconButton>
            }
          </Box>

          <Box px='0.5em'><label>
            <input type="text" size={30} data-testid="descrInput"
             {...register('descr', { required: true, pattern: /\S+/, maxLength:30 })}
             aria-invalid={errors.descr ? "true" : "false"}
            />
          </label></Box>

          <Box px='0.5em'>
            {(wkGroup && wkGroup.notomorrow) &&
              <span>wkGroup.notomorrow</span>
            }
          </Box>
          <Box px='0.5em' mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>
          </form>
          { (wkGroup) &&
          <>
            <Box px='0.5em'  mt={2} mb={1} display='flex' justifyContent='space-between' sx={{bgcolor: 'site.main'}}>
              <span>Schedules ({wkGroup.schedNames.length}) </span>
              <Button onClick={() => funComplete('_'+wkName+'!_NEW_')}  size="small" variant="outlined" color="primary">New Schedule</Button>
            </Box>
            <List disablePadding dense sx={{marginLeft: '1em'}}>
            {
              wkGroup.schedNames.map(schedule => {
                return(
                  <ListItem button key={schedule.schedName} onClick={() => funComplete('_'+wkName+'!'+schedule.schedName)}>
                      {schedule.schedName} - {schedule.descr}
                  </ListItem>
              ) } )
            }
            </List>
          </>
          }
        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface ManSchedProps {
  groupSchedName: string, // group!sched or group!_NEW_
  gSchedule: iSchedule,
  evList: string[],
  onComplete?: (status: string) => void,
  open: boolean
}
interface FormManSchedParms {
    schedName: string,
    descr: string,
    begins: string,
    buttonName: string,
    sound: string,
    soundrepeat: string,
    warn: string,
    chain: string,
    clock: string,
};

// manage existing schedule - modify, addconnections
// should change name to useManSched !!!!!

export const ManSched = (props: ManSchedProps) => {
    const funComplete = (props.onComplete) ? props.onComplete : mockComplete;
    let wkWords = props.groupSchedName.split('!');
    const groupName = wkWords.shift() || '';
    const schedName = wkWords.shift() || '';
    const currSchedule = props.gSchedule;
    const [schedEv, setSchedEv] = useState('');
    const [buttonNameEdit, setButtonNameEdit] = useState(false);
    const [showCfg, setShowCfg] = useState('none');

    // when form submits or resets
    const resetTempFormButtons = () => {
        setButtonNameEdit(false);
        setShowCfg('none');
    }

    // form states
    const formDefaultVal: FormManSchedParms = {
        schedName: '',
        descr: '',
        begins: 'now',
        buttonName: '_same_',
        sound: '_default_',
        soundrepeat: '0',
        warn: '_none_',
        chain: '',
        clock: '',
    };
    const { register, handleSubmit, reset, formState } = useForm({defaultValues: formDefaultVal});
    const { isDirty, errors } = formState;

    useEffect(() => {
        let defaultValues: FormManSchedParms = formDefaultVal;
        if (schedName && schedName !== '_NEW_' && currSchedule) {
            defaultValues['schedName'] = schedName;
            defaultValues['descr'] = currSchedule.descr || '';
            defaultValues['begins'] = currSchedule.begins || 'now';
            if (currSchedule.buttonName || currSchedule.buttonName === '') {
                defaultValues['buttonName'] = currSchedule.buttonName;
            }
            if (currSchedule.sound) {
                if (currSchedule.sound['name'] || currSchedule.sound['name'] === '') {
                    defaultValues['sound'] = currSchedule.sound.name;
                }
                if (currSchedule.sound['repeat']) {
                    defaultValues['soundrepeat'] = currSchedule.sound.repeat.toString();
                }
            }
            if ('warn' in currSchedule) {
                defaultValues['warn'] = '_default_';
                if (currSchedule.warn && currSchedule.warn.sound) {
                    defaultValues['warn'] = currSchedule.warn.sound.name || '_default';
                }
            }
            if (currSchedule.chain || currSchedule.chain === '') {
                defaultValues['chain'] = currSchedule.chain;
            }
            if (currSchedule.clock || currSchedule.clock === '') {
                defaultValues['clock'] = currSchedule.clock;
            }
        }

        reset(defaultValues);
    }, [schedName, currSchedule] );

    const formManSchedSubmit = async (data: FormManSchedParms) => {
        let wkRetNames = groupName+"!"+data.schedName;
        if (schedName !== '' && schedName !== '_NEW_') {
            wkRetNames = groupName+"!"+schedName;
        }
        const wkEvNames = wkRetNames+"!args";

        resetTempFormButtons();
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkEvNames,
                'descr': data.descr,
                'begins': data.begins,
                'button': (data.buttonName === '_same_')? data.schedName: data.buttonName,
                'sound': data.sound,
                'soundrepeat': data.soundrepeat,
                'warn': data.warn,
                'clock': data.clock,
                }
            };
            await API.graphql({query: mutAddScheds, variables: xdata});
            funComplete(wkRetNames);
        } catch (result) {
            console.warn('failed sched update', result);
        }
    };
    interface FormDelEventParms {
        cmd: string,
    };
    const formDelEvent = async (data: FormDelEventParms) => {
        try {
            const keyNames = groupName+"!"+schedName;
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': keyNames+"!"+data.cmd,
                }
            };
            await API.graphql({query: mutDelEvents, variables: xdata});
            funComplete((data.cmd === 'args')? '_'+keyNames: keyNames);
        } catch (result) {
            console.warn('failed delete', result);
        }
    };
    const formCallback = (status: string) => {
        setSchedEv('');
        if (status[0] !== '_') {
            funComplete(status);
        }
    };

    return(
      <Box ml={4} display={(props.open)?'block': 'none'}>
      <Card style={{margin: '3px 0 0 0', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
          <form key="manSched" onSubmit={handleSubmit(formManSchedSubmit)}>
          {/* -------------- Title block ----------------- */}
          <Box px='0.5em' display="flex" justifyContent="space-between" alignItems="baseline" sx={{bgcolor: 'site.main'}}>
            <Typography variant='h6'>
              { (schedName && schedName !== '_NEW_')
                ? <span>Modify Schedule - {schedName}
                    { (currSchedule && currSchedule.schedTasks.length === 0) ?
                      <IconButton color='warning' onClick={() => formDelEvent({'cmd': 'args'})}>
                        <DeleteForeverIcon sx={{height: '1.25rem'}} />
                      </IconButton>
                      :
                      <IconButton disabled >
                        <DeleteForeverIcon sx={{height: '1.25rem'}} />
                      </IconButton>
                    }

                  </span>
                : <span>Add Schedule (group {groupName})</span>
              }
            </Typography>
            <IconButton data-testid='cancel' size='small' onClick={() => funComplete('')}>X</IconButton>
          </Box>

          {/* -------------- Main Form Grid ----------------- */}
          <Box sx={{ flexGrow: 1}}>

            <Grid container spacing={2}>
               {/* -------------- Top Line ----------------- */}
               <Grid item xs={4}>
                 {/* -------------- for Add this is a text box ----------------- */}
                 <Box px='0.5rem' display={(schedName && schedName !== '_NEW_')?'none':'flex'}>
                   <TextField label='Name' variant="outlined"
                     size='small'
                     {...register('schedName', { required: true,})}
                     aria-invalid={errors.schedName ? "true" : "false"}
                   />
                 </Box>

                 {/* -------------- for Modify this is a button name textbox OR button ------ */}
                 <Box px='0.5rem' display={(schedName && schedName !== '_NEW_' && buttonNameEdit)? 'flex': 'none'}>
                   <TextField label='Button Label' variant="outlined"
                     size='small'
                     {...register('buttonName', { maxLength:8 })}
                     inputProps={{'data-testid': 'buttonInput'}}
                     aria-invalid={errors.buttonName ? "true" : "false"}
                   />
                 </Box>
                 <Box px='0.5rem' pt={1} display={(schedName && schedName !== '_NEW_' && !buttonNameEdit)?'flex':'none'}>
                  <Button size="small" variant="outlined" component={LinkD}
                    to={`/home?start=${groupName};${schedName}`}>
                    {(currSchedule.buttonName)? currSchedule.buttonName : schedName}
                  </Button>
                  <IconButton  size='small' onClick={() => setButtonNameEdit(true)}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                 </Box>

               </Grid>
               <Grid item xs={8}>
                 <TextField label='Summary' variant="outlined"
                   size='small' fullWidth
                   {...register('descr', { required: true, pattern: /\S+/, maxLength:30 })}
                   aria-invalid={errors.descr ? "true" : "false"}
                   inputProps={{'data-testid': 'descrInput'}}
                 />
               </Grid>

               {/* -------------- start box ------ */}
               <Grid item xs={4} >
                 <Box px='0.5rem' border={1} alignSelf='stretch' sx={{bgcolor: 'site.main'}} height='100%'>
                   <Typography variant='caption'>
                     Start Settings
                   </Typography>
                   <Box display='flex'>
                     <Typography variant='body2'>
                       (normal)
                     </Typography>
                     <IconButton  size='small' onClick={() => setShowCfg('start')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                   </Box>
                 </Box>
               </Grid>

               {/* -------------- type box ------ */}
               <Grid item xs={4}>
                 <Box border={1} px={1} height='100%'>
                   <Typography variant='caption'>
                     Type
                   </Typography>
                   <Box display='flex'>
                   <Typography variant='body2'>
                     Daily Recurring
                   </Typography>
                   <IconButton  size='small' onClick={() => setShowCfg('type')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                   </Box>
                 </Box>
               </Grid>

               {/* -------------- finish box ------ */}
               <Grid item xs={4}>
                 <Box border={1} px={1} sx={{bgcolor: 'site.main', }} height='100%'>
                   <Typography variant='caption'>
                     Finish Settings
                   </Typography>
                   <Box display='flex'>
                     <Typography variant='body2'>
                       { (currSchedule.chain)
                       ? <span>chain {currSchedule.chain}</span>
                       : <span>(default)</span>
                       }
                     </Typography>
                     <IconButton  size='small' onClick={() => setShowCfg('end')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                   </Box>
                 </Box>
               </Grid>

               <Grid item xs={12} display={(showCfg === 'start')? 'flex': 'none'}>
                 <Box px='0.5rem' >
                   <TextField label='Schedule Start' variant="outlined"
                     size='small' fullWidth
                      {...register('begins', { required: true, pattern: /\S+/, maxLength:50 })}
                     aria-invalid={errors.begins ? "true" : "false"}
                     inputProps={{'data-testid': 'beginsInput'}}
                   />
                 </Box>
               </Grid>
               <Grid item xs={12} display={(showCfg === 'type')? 'flex': 'none'}>
               </Grid>
               <Grid item xs={12} display={(showCfg === 'end')? 'flex': 'none'}>
                 <Box px='0.5rem'>
                   <TextField label='Schedule Chain (optional)' variant="outlined"
                     size='small' fullWidth
                   />
                 </Box>
               </Grid>
            </Grid>
          </Box>


          {/* -------------- Old Form ----------------- */}

          <Box px='0.5em' border={1}>
            Defaults
          </Box>
          <Box px='0.5em' border={1} display='flex' alignItems='center' justifyContent='space-between'>
          <Box px='0.5em'>
            clock
            { (currSchedule.clock)
              ? <span>{currSchedule.clock}</span>
              : <span>(default)</span>
            }
          </Box>

          <Box px='0.5em'>
          <Box><label>
            Sound <input type="text" size={10} data-testid="soundInput"
             {...register('sound', { pattern: /\S+/, maxLength:20 })}
             aria-invalid={errors.sound ? "true" : "false"}
            />
          </label></Box>

          <Box><label>
            Repeat <input type="text" size={2} data-testid="soundRepeatInput"
             {...register('soundrepeat', { pattern: /\S+/, maxLength:2 })}
             aria-invalid={errors.soundrepeat ? "true" : "false"}
            />
          </label></Box>

          <Box><label>
            Warn <input type="text" size={10} data-testid="warnInput"
             {...register('warn', { pattern: /\S+/, maxLength:20 })}
             aria-invalid={errors.warn ? "true" : "false"}
            />
          </label></Box>
          </Box>
          </Box>

          <Box px='0.5em' mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => {reset();resetTempFormButtons();}} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>

          {/* -------------- Events ----------------- */}
          { (currSchedule) &&
          <>
            <Box px='0.5em'  mt={2} mb={1} display='flex' justifyContent='space-between' sx={{bgcolor: 'site.main'}}>
              <span>Events ({currSchedule.schedTasks.length}) </span>
              <Button onClick={() => setSchedEv(groupName+'!'+schedName)}  size="small" variant="outlined" color="primary">
                Add Event
              </Button>
            </Box>
            <ConnectTask evList={props.evList} schedName={schedEv} onComplete={formCallback} open={(schedEv !== '')} />
            {
              currSchedule.schedTasks.map(task => {
                return(
                  <Box mx={2} key={task.evTaskId} alignItems='center'>
                    <LinkD to={'/events?start='+task.evTaskId} >{task.evTaskId} <EditIcon sx={{height: '1rem'}} /></LinkD>
                    <IconButton data-testid={'dconn-'+task.evTaskId} color='warning' onClick={() => formDelEvent({'cmd': task.evTaskId })}>
                      <RemoveCircleIcon sx={{height: '1.25rem'}} />
                    </IconButton>
                  </Box>
              ) } )
            }
          </>
          }

        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface ConnectTaskProps {
  schedName: string,
  onComplete: (status: string) => void,
  evList: string[],
  open: boolean,
}
export const ConnectTask = (props: ConnectTaskProps) => {
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            taskid: '',
        }
    });
    const { errors } = formState;


    const formConnectTaskCancel = async () => {
        props.onComplete('_'+props.schedName);
    }
    interface FormConnectTaskParms {
        taskid: string,
    };
    const formConnectTaskSubmit = async (data: FormConnectTaskParms) => {
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': props.schedName+'!'+data.taskid,
                }
            };
            await API.graphql({query: mutAddRules, variables: xdata});
            props.onComplete(props.schedName);

        } catch (result) {
            console.warn('failed update connection', result);
            props.onComplete('');
        }
    };
    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="connectTask" onSubmit={handleSubmit(formConnectTaskSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Connect Event
            </Typography>
          </Box>

          <Box display="flex" justifyContent="center">
            <Autocomplete
              options={props.evList}
              id="taskid" data-testid="taskid"
              sx={{ width: 300 }}
              clearOnEscape clearOnBlur
              renderInput={(params) => (
                <TextField {...params}
                  label="Event Name"
                  variant="outlined"
                  {...register('taskid', { required: true,})}
                  aria-invalid={errors.taskid ? "true" : "false"}
                />
              )}
            />
          </Box>

          <Box my={2} mr={1} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" color='error' onClick={() => formConnectTaskCancel()}>Cancel</Button>
            <Button size="small" variant="outlined" onClick={() => reset()}>Reset</Button>
            <Button size="small" variant="contained" type="submit">Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) }

// -------------------------------------------------
interface ChoiceSchedGroupProps {
    schedGroupList: iSchedGroupList,
    currgroup: string,
    setgroup: (event: React.ChangeEvent<HTMLInputElement>) => void,
}
export const ChoiceSchedGroup = (props:ChoiceSchedGroupProps) => (
    <TextField margin="dense" type="text" variant="outlined" size="small"
      value={props.currgroup} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {props.setgroup(e)} }
      label="Schedule Group" id="schedgroup" sx={{minWidth: 120}}
      inputProps={{'data-testid': 'schedgroup'}}
      select
    >
      {(props.schedGroupList)
        ? Object.keys(props.schedGroupList).map(item => {
          return(
            <MenuItem key={item} value={item}>{item}</MenuItem>
           )})
        : <MenuItem value='new'>new</MenuItem>
      }
    </TextField>
);
// -------------------------------------------------
interface DisplaySchedGroupProps {
  group: string,
  groupSched: iSchedGroup,
  select?: (group: string) => void,
}
const DisplaySchedGroup = (props: DisplaySchedGroupProps) => {
    const wkGroup = props.groupSched;
    const wkName = props.group;
    return(
      <Box mb={1} key={wkName} sx={{borderTop: '1px solid grey'}}>
        <List disablePadding>
          <ListItem button sx={{marginRight: '1em'}} onClick={() => {props.select?.(wkName);}}>
            {wkName} - {wkGroup.descr}
          </ListItem>
        <List disablePadding dense sx={{marginLeft: '1em'}}>
        {
          wkGroup.schedNames.map(schedule => {
            // console.log(schedule);
          return(
            <ListItem button key={schedule.schedName} onClick={() => {props.select?.('_'+wkName+'!'+schedule.schedName);}}>
              {schedule.schedName} - {schedule.descr}
            </ListItem>
          )})
        }
        </List>
        </List>
      </Box>
) };

// -------------------------------------------------
export const fetchSchedGroupsDB = async (): Promise<iSchedGroupList> => {
    try {
        const result: any = await API.graphql({query: listSchedGroupsFull})

        const compactEvents = result.data.listSchedGroups.items.reduce((resdict: iGrpSchedTask, item: iSchedGroupListDB) => {
            const evkeys = item.evnames.split('!');
            // group,sched,ev
            let wkGroup = evkeys[0];
            let wkSched = evkeys[1];

            if (wkSched !== 'args' && evkeys[2] && evkeys[2] !== 'args') {
                if (!resdict[wkGroup+"!"+wkSched]) {
                    resdict[wkGroup+"!"+wkSched] = [];
                }
                resdict[wkGroup+"!"+wkSched].push({evTaskId: evkeys[2]});
            }
            return resdict;
        }, {});

        // console.log("eventlist", compactEvents);
        const compactGroups = result.data.listSchedGroups.items.reduce((resdict: iSchedGroupList, item: iSchedGroupListDB) => {
            const evkeys = item.evnames.split('!');
            // group,sched,ev
            let wkGroup = evkeys[0];
            if (!resdict[wkGroup]) {
                // setup basic group
                resdict[wkGroup] = {descr: '', schedNames: []};
            }
            if (evkeys[1] === 'args') {
                // group args
                resdict[wkGroup].descr = (item.descr)? item.descr: '';
                resdict[wkGroup].notomorrow = (item.notomorrow && item.notomorrow !== '')? true: false;
            } else if (evkeys[2] === 'args') {
                // schedule args
                const wkSched = evkeys[1];
                let schedArgs: iSchedule = {schedName: wkSched, schedTasks: []};
                let wkSound: iEvsSound = {};

                if (compactEvents[wkGroup+"!"+wkSched]) {
                    schedArgs.schedTasks = compactEvents[wkGroup+"!"+wkSched];
                } else {
                    schedArgs.schedTasks = [];
                }
                schedArgs.descr = (item.descr)? item.descr: '';
                if (item.begins) {
                    schedArgs.begins = item.begins;
                }
                if (item.chain) {
                    schedArgs.chain = item.chain;
                }
                if (item.clock) {
                    schedArgs.clock = item.clock;
                }
                if (item.button || item.button === '') {
                    schedArgs.buttonName = item.button;
                }
                if (item.sound || item.sound === '') {
                    if (item.sound !== '_default_') {
                        wkSound['name'] = item.sound;
                    }
                }
                if (item.soundrepeat && parseInt(item.soundrepeat, 10) !== 0) {
                    wkSound['repeat'] = parseInt(item.soundrepeat, 10);
                }
                if (item.warn || item.warn === '') {
                    if (item.warn !== '_none_') {
                        schedArgs['warn'] = {};
                    }
                }

                if (wkSound && Object.keys(wkSound).length > 0) {
                    schedArgs['sound'] = wkSound;
                }
                resdict[wkGroup].schedNames.push(schedArgs)
            }
            return resdict;
        }, {});

        return(compactGroups);
    } catch (result) {
        return({});
    }
};

export default DisplaySchedGroup
