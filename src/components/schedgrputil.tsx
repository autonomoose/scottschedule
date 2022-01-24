// sched and groups utilities and components
// exports default DisplaySchedGroup
//  - exports Group components CreateGroup, ModifyGroup
//  - exports Schedule components ManSched
// and data fetchSchedGroupsDB - full groups and schedules

import React, { useEffect, useState } from 'react';
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { listSchedGroupsFull, iSchedGroupListDB } from '../graphql/queries';
import { mutAddEvents, mutDelEvents, mutAddRules } from '../graphql/mutations';

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
        }
    });
    const { isDirty, errors } = formState;

    interface FormNewGroupParms {
        name: string,
        descr: string,
    };
    const formNewGroupSubmit = async (data: FormNewGroupParms) => {
        console.log('form group data', data);
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': data.name+"!args",
                'descr': data.descr,
                }
            };
            const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);
            funComplete(data.name);
        } catch (result) {
            console.log('failed group update', result);
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="newGroup" onSubmit={handleSubmit(formNewGroupSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Add New Group
            </Typography>
            <IconButton size='small' color='error' onClick={() => funComplete('')}>X</IconButton>
          </Box>

          <Box><label>
            Name <input type="text" size={12} data-testid="nameInput"
             {...register('name', { required: true, pattern: /\S+/, maxLength:16 })}
             aria-invalid={errors.name ? "true" : "false"}
            />
          </label></Box>
          <Box><label> Description
            <input type="text" size={30} data-testid="descrInput"
             {...register('descr', { required: true, pattern: /\S+/, maxLength:30 })}
             aria-invalid={errors.descr ? "true" : "false"}
            />
          </label></Box>

          <Box mt={2} display='flex' justifyContent='flex-end'>
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
        }
    });
    const { isDirty, errors } = formState;

    useEffect(() => {
        const defaultValues = {
            descr: (wkGroup && wkGroup.descr)? wkGroup.descr : '',
        }
        reset(defaultValues);
    }, [wkGroup] );

    interface FormModGroupParms {
        descr: string,
    };
    const formModGroupSubmit = async (data: FormModGroupParms) => {
        console.log('modform data', data);
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkName+"!args",
                'descr': data.descr,
                }
            };
            const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);
            funComplete(wkName);
        } catch (result) {
            console.log('failed group update', result);
        }
    };
    interface FormDelEventParms {
        cmd: string,
    };
    const formDelEvent = async (data: FormDelEventParms) => {
        console.log('formDel parms', data);
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkName+"!"+data.cmd,
                }
            };
            console.log('deleting', xdata);
            const result = await API.graphql({query: mutDelEvents, variables: xdata});
            console.log('deleted', result);
            funComplete(wkName);
        } catch (result) {
            console.log('failed delete', result);
        }
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="modGroup" onSubmit={handleSubmit(formModGroupSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>Modify Group</Typography>
            <IconButton size='small' color='error' onClick={() => funComplete('')}>X</IconButton>
          </Box>
          <Box display='flex' alignItems='center'>
            {wkName}
            { (wkGroup && wkGroup.schedNames.length === 0) &&
            <IconButton size='small' color='error' onClick={() => formDelEvent({'cmd': 'args'})}>X</IconButton>
            }
          </Box>

          <Box><label>
            <input type="text" size={30} data-testid="descrInput"
             {...register('descr', { required: true, pattern: /\S+/, maxLength:30 })}
             aria-invalid={errors.descr ? "true" : "false"}
            />
          </label></Box>

          <Box mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>
          </form>
          { (wkGroup) &&
          <>
            <Box mb={1} display='flex' justifyContent='space-around'>
              <span>Schedules ({wkGroup.schedNames.length}) </span>
              <Button onClick={() => funComplete('_'+wkName+'!_NEW_')}  size="small" variant="outlined" color="primary">New Schedule</Button>
            </Box>
            {
              wkGroup.schedNames.map(schedule => {
                return(
                  <Box mx={2} key={schedule.schedName} display='flex' flexWrap='wrap'>
                    <Button onClick={() => funComplete('_'+wkName+'!'+schedule.schedName)}  size="small" variant="outlined" color="primary">
                      {schedule.schedName}
                    </Button>

                    ({schedule.schedTasks.length} events)
                  </Box>
              ) } )
            }
          </>
          }
        </Box>
      </Card></Box>
) };

// -------------------------------------------------
interface ManSchedProps {
  groupSchedName: string, // group!sched or group!_NEW_
  gSchedule: iSchedule,
  onComplete?: (status: string) => void,
  open: boolean
}
export const ManSched = (props: ManSchedProps) => {
    const funComplete = (props.onComplete) ? props.onComplete : mockComplete;
    let wkWords = props.groupSchedName.split('!');
    const groupName = wkWords.shift() || '';
    const schedName = wkWords.shift() || '';
    const currSchedule = props.gSchedule;
    const [schedEv, setSchedEv] = useState('');
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            schedName: '',
            begins: 'now',
            buttonName: '_schedule name_',
        }
    });
    const { isDirty, errors } = formState;

    useEffect(() => {
        let defaultValues = {
            schedName: '',
            begins: 'now',
            buttonName: '_schedule name_',
        };
        if (schedName && schedName !== '_NEW_' && currSchedule) {
          defaultValues = {
              schedName: schedName,
              begins: currSchedule.begins || 'now',
              buttonName: currSchedule.buttonName || '_schedule name_',
          };
        }

        reset(defaultValues);
    }, [schedName, currSchedule] );

    interface FormManSchedParms {
        schedName: string,
        begins: string,
        buttonName: string,
    };
    const formManSchedSubmit = async (data: FormManSchedParms) => {
        console.log('form sched data', data);
        let wkEvNames = groupName+"!"+data.schedName+"!args";
        if (schedName !== '' && schedName !== '_NEW_') {
            wkEvNames = groupName+"!"+schedName+"!args";
        }

        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': wkEvNames,
                }
            };
            // const result = await API.graphql({query: mutAddEvents, variables: xdata});
            console.log('updated', result);
            funComplete(data.schedName);
        } catch (result) {
            console.log('failed sched update', result);
        }
    };
    interface FormDelEventParms {
        cmd: string,
    };
    const formDelEvent = async (data: FormDelEventParms) => {
        console.log('formDel parms', data);
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': groupName+"!"+schedName+"!"+data.cmd,
                }
            };
            console.log('deleting', xdata);
            const result = await API.graphql({query: mutDelEvents, variables: xdata});
            console.log('deleted', result);
            funComplete(groupName+"!"+schedName);
        } catch (result) {
            console.log('failed delete', result);
        }
    };
    const formCallback = (status: string) => {
        console.log("manSched callback status", status);
        setSchedEv('');
        funComplete(status);
    };

    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="manSched" onSubmit={handleSubmit(formManSchedSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              { (schedName && schedName !== '_NEW_')
                ? <span>Modify Schedules </span>
                : <span>Add Schedule ({groupName})</span>
              }
            </Typography>
            <IconButton size='small' color='error' onClick={() => funComplete('')}>X</IconButton>
          </Box>

          <Box display='flex' justifyContent='space-between'>
            <Box display={(schedName && schedName !== '_NEW_')?'none':'flex'}><label>
              Name <input type="text" size={12} data-testid="nameInput"
               {...register('schedName', { required: true, pattern: /\S+/, maxLength:16 })}
               aria-invalid={errors.schedName ? "true" : "false"}
              />
            </label></Box>
            {(schedName && schedName !== '_NEW_') &&
              <Box>
                {schedName}
                { (currSchedule && currSchedule.schedTasks.length === 0) &&
                  <IconButton size='small' color='error' onClick={() => formDelEvent({'cmd': 'args'})}>X</IconButton>
                }

              </Box>
            }

            <Box><label>
              Button <input type="text" size={6} data-testid="beginsInput"
               {...register('buttonName', { pattern: /\S+/, maxLength:8 })}
               aria-invalid={errors.buttonName ? "true" : "false"}
              />
            </label></Box>
          </Box>

          <Box><label>
            Begins <textarea rows={1} cols={27} data-testid="beginsInput"
             {...register('begins', { required: true, pattern: /\S+/, maxLength:50 })}
             aria-invalid={errors.begins ? "true" : "false"}
            ></textarea>
          </label></Box>


          <Box mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
          { (currSchedule) &&
          <>
            <Box mb={1} display='flex' justifyContent='space-around'>
              <span>Events ({currSchedule.schedTasks.length}) </span>
              <Button onClick={() => setSchedEv(groupName+'!'+schedName)}  size="small" variant="outlined" color="primary">Add Event</Button>
            </Box>
            <ConnectTask schedName={schedEv} onComplete={formCallback} open={(schedEv !== '')} />
            {
              currSchedule.schedTasks.map(task => {
                return(
                  <Box mx={2} key={task.evTaskId}>
                    <IconButton size='small' color='error' onClick={() => formDelEvent({'cmd': task.evTaskId })}>X</IconButton>

                    {task.evTaskId}
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
  open: boolean,
}
export const ConnectTask = (props: ConnectTaskProps) => {
    // form states
    const { register, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            taskid: '',
        }
    });
    const { isDirty, errors } = formState;

    const formConnectTaskCancel = async () => {
        props.onComplete('');
    }
    interface FormConnectTaskParms {
        taskid: string,
    };
    const formConnectTaskSubmit = async (data: FormConnectTaskParms) => {
        console.log('form data', data);
        try {
            const xdata = {'input': {
                'etype': 'gs',
                'evnames': props.schedName+'!'+data.taskid,
                }
            };
            const result = await API.graphql({query: mutAddRules, variables: xdata});
            console.log('connected task to schedule', result);
            props.onComplete(props.schedName);

        } catch (result) {
            console.log('failed update connection', result);
            props.onComplete('');
        }
    };
    return(
      <Box display={(props.open)?'block': 'none'}>
      <Card style={{marginTop: '3px', maxWidth: 350, minWidth: 350, flex: '1 1', background: '#FAFAFA',
       boxShadow: '-5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box mx={1}>
          <form key="connectTask" onSubmit={handleSubmit(formConnectTaskSubmit)}>
          <Box display="flex" justifyContent="space-between" alignItems="baseline">
            <Typography variant='h6'>
              Connect Event
            </Typography>
          </Box>

          <Box>
            <input type='text' size={10} data-testid="taskid"
             {...register('taskid', { required: true,})}
             aria-invalid={errors.taskid ? "true" : "false"}
            />
          </Box>

          <Box mt={2} display='flex' justifyContent='flex-end'>
            <Button size="small" variant="outlined" color='error' onClick={() => formConnectTaskCancel()}>Cancel</Button>
            <Button size="small" variant="outlined" onClick={() => reset()} disabled={!isDirty}>Reset</Button>
            <Button size="small" variant="contained" type="submit" disabled={!isDirty}>Save</Button>
          </Box>

          </form>
        </Box>
      </Card></Box>
) }

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
      <Box key={wkName}>
        {(props.select)
          ? <Button size="small" onClick={() => {props.select?.(wkName);}}>
              {wkName}
            </Button>
          : <span>{wkName} </span>
        }

        - {wkGroup.descr}
        {
          wkGroup.schedNames.map(schedule => {
            // console.log(schedule);
          return(
            <Box mx={2} key={schedule.schedName} display='flex' flexWrap='wrap'>
              {schedule.schedName} ({schedule.schedTasks.length} events)
              {(schedule.begins && schedule.begins.length <= 30) && <Box ml={1}> starts={schedule.begins} </Box>}
              {(schedule.begins && schedule.begins.length > 30) &&
                <Box ml={1}>
                  starts=({schedule.begins.slice(0,30)} {schedule.begins.slice(30)})

                </Box>
              }
              {(schedule.buttonName) && <Box ml={1}> button='{schedule.buttonName}' </Box>}
              {(schedule.sound) &&
                <Box ml={1} display='flex'>
                  sound=(
                  {(schedule.sound.name) && <Box> name={schedule.sound.name}, </Box>}
                  {(schedule.sound.name === '') && <Box> name='', </Box>}
                  {(schedule.sound.repeat) && <Box> repeat={schedule.sound.repeat}, </Box>}
                  {(schedule.sound.src) && <Box> src={schedule.sound.src}, </Box>}
                  )
                </Box>
              }
              {(schedule.warn) &&
                <Box ml={1}>
                  warn=(
                    {(schedule.warn.sound) &&
                      <Box ml={1} display='flex'>
                        sound=(
                        {(schedule.warn.sound.name) && <Box> name={schedule.warn.sound.name}, </Box>}
                        {(schedule.warn.sound.repeat) && <Box> repeat={schedule.warn.sound.repeat}, </Box>}
                        {(schedule.warn.sound.src) && <Box> src={schedule.warn.sound.src}, </Box>}
                          )
                      </Box>
                    }
                  )
                </Box>
              }
              {(schedule.schedTasks && schedule.schedTasks.length > 0) &&
                <Box mx={1}>
                events=(
                {schedule.schedTasks.map(schedTask => {
                  return(
                    <span key={schedTask.evTaskId}>{schedTask.evTaskId}, </span>
                )})
                }
                )
                </Box>
              }
            </Box>
          )})
        }
      </Box>
) };

// -------------------------------------------------
export const fetchSchedGroupsDB = async (): Promise<iSchedGroupList> => {
    try {
        const result: any = await API.graphql({query: listSchedGroupsFull})
        console.log("loaded schedgroups dbrecords:", result.data.listSchedGroups.items.length);

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
                if (item.begins) {
                    schedArgs.begins = item.begins;
                }
                if (item.button) {
                    schedArgs.buttonName = item.button;
                }
                if (item.sound || item.sound === '') {
                    wkSound['name'] = item.sound;
                }
                if (item.soundrepeat) {
                    wkSound['repeat'] = parseInt(item.soundrepeat, 10);
                }
                if (item.warn || item.warn === '') {
                    // console.log('warn', item.warn);
                    schedArgs['warn'] = {};
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
        console.log("got error", result);
        return({});
    }
};

export default DisplaySchedGroup
