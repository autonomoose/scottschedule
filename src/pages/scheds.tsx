// schedule listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import { fetchSchedGroupsDB } from '../components/schedgrputil';

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

const SchedsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});

    // init Data
    useEffect(() => {
        const fetchScheds = async () => {
            setHstatus('Loading');
            const newSchedgrps = await fetchSchedGroupsDB();
            if (newSchedgrps) {
                enqueueSnackbar(`loaded schedules`,
                  {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                setSchedGroups(newSchedgrps);
            } else {
                enqueueSnackbar(`no schedules found`, {variant: 'error'});
            }
        setHstatus('Ready');
        };

        fetchScheds();
    }, []);

    console.log('orig', schedGroups);
    return(
      <Layout><Seo title="Schedules - Scottschedule" />
      <PageTopper pname="Schedules" vdebug={vdebug} helpPage="/help/scheds" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <DisplaySchedGroups sgrp={schedGroups}/>

      </Box>
      <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
        <CircularProgress data-testid="dataBackdrop" color="inherit" />
      </Backdrop>
      </Layout>
) };

interface DisplaySchedGroupsProps {
  sgrp: iSchedGroupList,
}
const DisplaySchedGroups = (props: DisplaySchedGroupsProps) => {
    const wkSchedGroups = props.sgrp;
    return(
      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1', background: '#F5F5E6',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
        <Box>
        Groups({Object.keys(wkSchedGroups).length}), Schedules
        {
          Object.keys(wkSchedGroups).map(groupname => {
          return(
            <Box key={groupname}>
              {groupname} ({wkSchedGroups[groupname].schedNames.length} sched) descr={wkSchedGroups[groupname].descr}
              {
                wkSchedGroups[groupname].schedNames.map(schedule => {
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
          )})
        }
        </Box>

     </Card></Box>
) };

export default SchedsPage
