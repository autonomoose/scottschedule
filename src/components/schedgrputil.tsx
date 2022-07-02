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
import { ErrorMessage } from '@hookform/error-message';

import {LinkD, GatsbyLink} from './linkd';

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

    /* -------- reset form defaults to any current values ------ */
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
        setShowCfg('');
    }, [schedName, currSchedule] );

    // only makes it here on a successful form submit
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
                'chain': data.chain,
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
                ? <span>Schedule {schedName}
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
                : <span>New Schedule (group {groupName})</span>
              }
            </Typography>
            <IconButton data-testid='cancel' size='small' onClick={() => funComplete('')}>X</IconButton>
          </Box>

          {/* -------------- Main Form Grid ----------------- */}
          <Box sx={{ flexGrow: 1}}><Grid container spacing={2}>
            {/* -------------- Top Line ----------------- */}
            <Grid item xs={5}>
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
                <Box mt={-2} ml={-2.5}>
                  <IconButton  size='small' onClick={() => setButtonNameEdit(false)}>X</IconButton>
                </Box>
              </Box>

              <Box border={1} mt={.5} ml={.5}>
                <CaptionBox caption='Button' />

                <Box px='0.5rem' pb={1} alignItems='center' display={(schedName && schedName !== '_NEW_' && !buttonNameEdit)?'flex':'none'}>
                  {(currSchedule.begins === 'now')
                  ? <Box display='flex'>
                      <Button size="small" variant="outlined" component={GatsbyLink}
                        to={`/home?start=${groupName};${schedName}`}>
                        {(currSchedule.buttonName)? currSchedule.buttonName : schedName}
                      </Button>
                      <IconButton  size='small' onClick={() => setButtonNameEdit(true)}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                    </Box>
                  : <span>
                      Complex
                    </span>
                  }
                </Box>
              </Box>

            </Grid>
            <Grid item xs={7}>
              <Box mt={.5} mr={.5}>
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

            {/* -------------- start box ------ */}
            <Grid item xs={4} >
              <Box px='0.5rem' ml={.5} border={1} alignSelf='stretch' sx={{bgcolor: 'site.main'}} height='100%'>
                {/* -------------- start summary and edit ------ */}
                <CaptionBox caption='Start&nbsp;Settings' xpad='0' />
                <Box display='flex' alignItems='center'>
                  <Typography variant='body2'>
                    {(currSchedule.begins === 'now')? <span> (normal) </span>: <span> (complex) </span> }
                  </Typography>
                  <IconButton  size='small' onClick={() => setShowCfg('start')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
                </Box>
              </Box>
            </Grid>

            {/* -------------- defaults box ------ */}
            <Grid item xs={4}><Box border={1} px={1} height='100%'>
              <CaptionBox caption='Defaults' xpad='0' />
              <Box display='flex' alignItems='center'>
                <Typography variant='body2'>
                  { (currSchedule.clock)
                    ? <span>{currSchedule.clock}</span>
                    : <span>(default)</span>
                  }
                </Typography>
                <IconButton  size='small' onClick={() => setShowCfg('defaults')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
              </Box>
            </Box></Grid>

            {/* -------------- finish box ------ */}
            <Grid item xs={4}><Box border={1} px={1} mr={.5} sx={{bgcolor: 'site.main', }} height='100%'>
              <CaptionBox caption='End&nbsp;Settings' xpad='0' />
              <Box display='flex' alignItems='center'>
                <Typography variant='body2'>
                  { (currSchedule.chain)
                  ? <span>chained</span>
                  : <span>none</span>
                  }
                </Typography>
                <IconButton  size='small' onClick={() => setShowCfg('end')}><EditIcon sx={{height: '1.25rem'}}/></IconButton>
              </Box>
            </Box></Grid>

            {/* -------------- start - begins input ------ */}
            <Grid item xs={12} display={(showCfg === 'start')? 'block': 'none'}>
              <Box px='0.5rem' width='100%' display='flex'>
                <TextField label='Schedule Start' size='small' fullWidth
                   {...register('begins', {
                    required: 'this field is required',
                    pattern: {value: /^[a-zA-Z0-9\:\,]+$/, message: 'alphanumeric, colons, and commas only'},
                    maxLength: {value: 50, message: 'limited to 50 characters'},
                  })}
                  aria-invalid={errors.begins ? "true" : "false"}
                  color={errors.begins ? 'error' : 'primary'}
                  inputProps={{'data-testid': 'beginsInput'}}
                />
                <Box mt={-2} ml={-2.5}>
                  <IconButton  size='small' onClick={() => setShowCfg('')}>X</IconButton>
                </Box>
              </Box>
              <Box px={1.5}>
                <ErrorMessage errors={errors} name="begins" render={({ message }) =>
                  <CaptionBox caption={message} color='error'/>
                } />
              </Box>
            </Grid>

            {/* -------------- defaults input ------ */}
            <Box mt={1} ml={5} mr={3} display={(showCfg === 'defaults')? 'block': 'none'} border={1} width='100%'>
              <Box pl={1} mb={1} sx={{bgcolor: 'site.main'}} display="flex" justifyContent="space-between" alignItems="baseline" >
                <Typography variant='h6'>
                  Defaults
                </Typography>
                  <IconButton  size='small' onClick={() => setShowCfg('')}>X</IconButton>
              </Box>
              <Grid item xs={12}>
                <Box px='0.5rem' display='flex'>
                  <TextField label='Clock' size='small'
                    {...register('clock', {
                      pattern: {value: /^[a-zA-Z0-9\-]+$/, message: 'no special chars'},
                      maxLength: {value: 10, message: 'too long - limited to 10 characters'},
                    })}
                    aria-invalid={errors.clock ? "true" : "false"}
                    color={errors.clock ? 'error' : 'primary'}
                    inputProps={{'data-testid': 'clockInput'}}
                    InputLabelProps={{shrink: true}}
                  />
                </Box>
                <Box px={1.5}>
                  <ErrorMessage errors={errors} name="clock" render={({ message }) =>
                    <CaptionBox caption={message} color='error'/>
                  } />
                </Box>
              </Grid>


              <Grid item xs={12} display='flex' my={2}>
                {/* -------------- sound ------ */}
                <Grid item xs={6} >
                  <Box px='0.5rem' >
                    <TextField label='Sound' size='small' fullWidth
                      {...register('sound', {
                        pattern: {value: /^[a-zA-Z0-9\-\_]+$/, message: 'no special chars'},
                        maxLength: {value: 20, message: 'too long - limited to 10 characters'},
                      })}
                      aria-invalid={errors.sound ? "true" : "false"}
                      color={errors.sound ? 'error' : 'primary'}
                      inputProps={{'data-testid': 'soundInput'}}
                    />
                  </Box>
                  <Box px={1.5}>
                    <ErrorMessage errors={errors} name="sound" render={({ message }) =>
                      <CaptionBox caption={message} color='error'/>
                    } />
                  </Box>
                </Grid>

                {/* -------------- sound repeat ------ */}
                <Grid item xs={3} >
                  <Box px='0.5rem' >
                    <TextField label='Repeat' size='small' fullWidth
                      {...register('soundrepeat', {
                        pattern: {value: /^[0-9]+$/, message: 'numeric only'},
                        maxLength: {value: 2, message: 'less than 100'},
                      })}
                      aria-invalid={errors.soundrepeat ? "true" : "false"}
                      inputProps={{'data-testid': 'soundRepeatInput'}}
                    />
                  </Box>
                  <Box px={1.5}>
                    <ErrorMessage errors={errors} name="soundrepeat" render={({ message }) =>
                      <CaptionBox caption={message} color='error'/>
                    } />
                  </Box>
                </Grid>
              </Grid>

              {/* -------------- warn ------ */}
              <Grid item xs={12} display='flex' my={2}>
                <Grid item xs={8} >
                  <Box px='0.5rem' >
                    <TextField label='Warning' size='small'
                      {...register('warn', {
                        pattern: {value: /^[a-zA-Z0-9\-\_]+$/, message: 'no special chars'},
                        maxLength: {value: 20, message: 'too long - limited to 10 characters'},
                      })}
                      aria-invalid={errors.warn ? "true" : "false"}
                      color={errors.warn ? 'error' : 'primary'}
                      inputProps={{'data-testid': 'warnInput'}}
                    />
                  </Box>
                  <Box px={1.5}>
                    <ErrorMessage errors={errors} name="warn" render={({ message }) =>
                      <CaptionBox caption={message} color='error'/>
                    } />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* -------------- finish - chain input ------ */}
            <Grid item xs={12} display={(showCfg === 'end')? 'flex': 'none'}>
              <Box px='0.5rem' display='flex'>
                <TextField label='Schedule Chain' variant="outlined" size='small' fullWidth
                  {...register('chain', {
                    pattern: {value: /^[a-zA-Z0-9\+]+$/, message: 'no special characters'},
                    maxLength: {value: 40, message: 'limited to 40 characters'},
                  })}
                  aria-invalid={errors.chain ? "true" : "false"}
                  color={errors.chain ? 'error' : 'primary'}
                  inputProps={{'data-testid': 'chainInput'}}
                />
                <Box mt={-2} ml={-2.5}>
                  <IconButton  size='small' onClick={() => setShowCfg('')}>X</IconButton>
                </Box>
                <ErrorMessage errors={errors} name="chain" render={({ message }) =>
                  <CaptionBox caption={message} color='error'/>
                } />
              </Box>
            </Grid>

          </Grid></Box>

          {/* -------------- Form Save/Reset Buttons ----------------- */}
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


interface iCaptionBox {
    caption: string,
    color?: string,
    xpad?: string, // rem
}
// quick caption box
const CaptionBox = (props: iCaptionBox) => {
    const { caption, color, xpad } = props;
    const wkColor = color || 'inherit';
    const wkXpad = xpad || '0.5rem';
    return (
      <Box px={wkXpad} mt={-1.75}>
        <Typography variant='caption' color={wkColor}
          sx={{ bgcolor:'background.paper', position: 'relative', zIndex: '2'}} >
          &nbsp;{caption}&nbsp;
        </Typography>
      </Box>
)}
export default DisplaySchedGroup
