// schedule listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';
import { useAuthenticator } from '@aws-amplify/ui-react';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import { ManSched, CreateGroup, ModifyGroup, fetchSchedGroupsDB } from '../components/schedgrputil';
import { fetchEventsDB } from '../components/eventsutil';

import { useSnackbar } from 'notistack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const SchedsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { authStatus } = useAuthenticator(context => [context.authStatus]);
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [showList, setShowList] = useState(true);
    const [schedGroups, setSchedGroups] = useState<iSchedGroupList>({});
    const [groupName, setGroupName] = useState('');
    const [schedName, setSchedName] = useState('');
    const [currSchedule, setCurrSchedule] = useState<iSchedule>({schedName: '', schedTasks: []});
    const [evList, setEvList] = useState<string[]>([]);

    const [pgserial, setPgserial] = useState(0);

    // group name changes
    const buttonSetGroupName = async (newGroupName: string) => {
        if (newGroupName[0] === '_' && newGroupName !== '_NEW_') {
            setGroupName('');
            setSchedName(newGroupName.slice(1));
        } else {
            setGroupName(newGroupName);
            setSchedName('');
            setShowList(false);
        }
    }

    // handler for dialog report data changes
    const formSchedCallback = async (status: string) => {
        if (status !== '') {
            if (status[0] !== '_') {
                setSchedName(status);
            } else {
                setSchedName('');
                const statusNames = status.slice(1).split('!');
                setGroupName(statusNames[0]);
            }
            setPgserial(pgserial+1);
        } else {
            setSchedName('');
            setShowList(true);
        }
    };

    // handler for group dialog to control group and schedule dialogs
    const formGroupCallback = async (status: string) => {
        if (status[0] === '_') {
            // call to open schedule from group form
            setGroupName('');
            setSchedName(status.slice(1));
            setShowList(false);
        } else {
            if (status !== '') {
                setPgserial(pgserial+1);
                setGroupName(status);
            } else {
                setShowList(true);
                setGroupName('');
            }
        }
    }

    // maintain currSchedule with schedName
    useEffect(() => {
        let retSched: iSchedule = {schedName: '', schedTasks: []}

        if (schedName !== '') {
            let schedParts=schedName.split('!');
            const wkgroup = schedParts.shift() || '';
            const wksched = schedParts.shift() || '';
            if (wkgroup && wksched && wksched !== '_NEW_' && schedGroups[wkgroup]) {
                const schedList = schedGroups[wkgroup].schedNames.filter(item => item.schedName === wksched)
                if (schedList.length === 1) {
                    retSched = schedList[0];
                }
            }
        }
        setCurrSchedule(retSched);
    }, [schedName, schedGroups]);

    // init DB Data
    useEffect(() => {
        const fetchScheds = async () => {
            setHstatus('Loading');
            const newSchedgrps = await fetchSchedGroupsDB();
            if (newSchedgrps) {
                // enqueueSnackbar(`loaded schedules`,
                //  {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                setSchedGroups(newSchedgrps);
                if (groupName !== '' && groupName in newSchedgrps === false) {
                  setGroupName('');
                  setShowList(true);
                }
            } else {
                enqueueSnackbar(`no schedules found`, {variant: 'error'});
            }
        setHstatus('Ready');
        };

        if (authStatus === 'authenticated') {
            fetchScheds();
        }
    }, [enqueueSnackbar, pgserial, authStatus]);

    useEffect(() => {
        const fetchEvs = async () => {
            const newTasks = await fetchEventsDB();
            if (newTasks) {
                setEvList(Object.keys(newTasks));
            }
        };

        if (authStatus === 'authenticated') {
            fetchEvs();
        }
    }, [authStatus]);

    return(
      <Layout><Seo title="Schedules - Scottschedule" />
      <PageTopper pname="Schedules" vdebug={vdebug} helpPage="/help/scheds" />
      <Box display="flex" flexWrap="wrap" justifyContent="center">

        <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1',
         boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

          <Typography variant='h6' sx={{padding: '0 0.5em 0', bgcolor: 'site.main'}}>
          Schedule and Schedule Groups Editor
          </Typography><Typography variant='body2' sx={{margin: '1px 4px'}}>
          Create and modify schedules, and organize them into groups
          </Typography>

          <Accordion expanded={showList} onChange={() => setShowList(!showList)} disableGutters elevation={0}>
            <AccordionSummary sx={{
              bgcolor: 'site.main', minHeight: 45, maxHeight: 45,
              padding: '0px 4px 0px 0px', margin: '6px 0px 0px 0px',
              }} expandIcon={<ExpandMoreIcon />} >
              <Box width='100%' mx={1} display='flex'
                justifyContent='space-between' alignItems='baseline'>

                Schedule Groups List ({Object.keys(schedGroups).length})
                <Button variant='outlined' disabled={(groupName === '_NEW_')}
                  onClick={(event) => {buttonSetGroupName('_NEW_');event.stopPropagation();}}
                  data-testid='create-group'>
                  New Group
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{maxHeight: '9rem', overflow: 'auto' }}>
              <List disablePadding dense sx={{marginLeft: '1em'}}>
              {
                Object.keys(schedGroups).map(groupname => {
                return(
                    <ListItem button key={`${groupname}ev`}
                      onClick={() => {buttonSetGroupName(groupname);}}>

                      {groupname} - {schedGroups[groupname].descr}
                    </ListItem>
                )})
              }
              </List>
            </AccordionDetails>
          </Accordion>
        </Card></Box>

      <CreateGroup onComplete={formGroupCallback} open={(groupName === '_NEW_')}/>
      <ModifyGroup group={groupName} groupSched={schedGroups[groupName]}
       onComplete={formGroupCallback}
       open={(groupName !== '' && groupName !== '_NEW_')}
      />
      <ManSched evList={evList} onComplete={formSchedCallback} open={(schedName !== '')}
       groupSchedName={schedName} gSchedule={currSchedule}
      />

      </Box>
      <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
        <CircularProgress data-testid="dataBackdrop" color="inherit" />
      </Backdrop>
      </Layout>
) };


export default SchedsPage
