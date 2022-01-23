// schedule listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import DisplaySchedGroup, { CreateGroup, ModifyGroup, fetchSchedGroupsDB } from '../components/schedgrputil';

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

const SchedsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});
    const [groupName, setGroupName] = useState('');
    const [pgserial, setPgserial] = useState(0);

    const buttonSetGroupName = async (newGroupName: string) => {
        setGroupName(newGroupName);
    }

    const formGroupCallback = async (status: string) => {
        console.log("group callback status", status);
        setGroupName(status);
        if (status !== '') {
            setPgserial(pgserial+1);
        }
    }

    // init Data
    useEffect(() => {
        const fetchScheds = async () => {
            setHstatus('Loading');
            console.log('Loading schedgroups seq#', pgserial);
            const newSchedgrps = await fetchSchedGroupsDB();
            if (newSchedgrps) {
                enqueueSnackbar(`loaded schedules`,
                  {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                setSchedGroups(newSchedgrps);
                if (groupName in newSchedgrps === false) {
                  setGroupName('');
                }
            } else {
                enqueueSnackbar(`no schedules found`, {variant: 'error'});
            }
        setHstatus('Ready');
        };

        fetchScheds();
    }, [enqueueSnackbar, pgserial]);

    console.log('orig', schedGroups);
    return(
      <Layout><Seo title="Schedules - Scottschedule" />
      <PageTopper pname="Schedules" vdebug={vdebug} helpPage="/help/scheds" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

        <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1', background: '#F5F5E6',
         boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>
          <Box mx={1} display='flex' justifyContent='space-between' alignItems='baseline'>
            Groups ({Object.keys(schedGroups).length})
            <Button variant='outlined' onClick={() => {setPgserial(pgserial+1);}}>
              Refresh
            </Button>

            <Button variant='outlined' disabled={(groupName === '_NEW_')} onClick={() => {buttonSetGroupName('_NEW_');}}>
              New Group
            </Button>
          </Box>

          {
            Object.keys(schedGroups).map(groupname => {
            return(
                <DisplaySchedGroup key={`${groupname}ev`}
                 group={groupname}
                 groupSched={schedGroups[groupname]}
                 select={buttonSetGroupName}
                />
            )})
          }
        </Card></Box>

      <CreateGroup onComplete={formGroupCallback} open={(groupName === '_NEW_')}/>
      <ModifyGroup group={groupName} groupSched={schedGroups[groupName]}
       onComplete={formGroupCallback}
       open={(groupName !== '' && groupName !== '_NEW_')}
      />

      </Box>
      <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
        <CircularProgress data-testid="dataBackdrop" color="inherit" />
      </Backdrop>
      </Layout>
) };


export default SchedsPage
