// events listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import DisplayEvent, { CreateEvent, ModifyEvent, fetchEventsDB } from '../components/eventsutil';

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

const EventsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [evName, setEvName] = useState('');
    const [pgserial, setPgserial] = useState(0);

    const buttonSetEvName = async (newEvName: string) => {
        setEvName(newEvName);
    }

    const formCallback = async (status: string) => {
        console.log("ev callback status", status);
        setEvName(status);
        if (status !== '') {
            setPgserial(pgserial+1);
        }
    }

    useEffect(() => {
        const fetchEvs = async () => {
            setHstatus('Loading');
            console.log('Loading events seq#', pgserial);
            const newTasks = await fetchEventsDB();
            if (newTasks) {
                enqueueSnackbar(`loaded events`,
                  {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                setAllTasks(newTasks);
                if (evName in newTasks === false) {
                  setEvName('');
                }
            } else {
                enqueueSnackbar(`no events found`, {variant: 'error'});
            }
        setHstatus('Ready');
        };

        fetchEvs();
    }, [enqueueSnackbar, vdebug, pgserial] );

    return(
      <Layout><Seo title="Events - Scottschedule" />
      <PageTopper pname="Events" vdebug={vdebug} helpPage="/help/events" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1', background: '#F5F5E6',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        <Box mx={1} display='flex' justifyContent='space-between' alignItems='baseline'>
          Events ({Object.keys(allTasks).length})
          <Button  onClick={() => {setPgserial(pgserial+1);}}>
            Refresh
          </Button>

          <Button disabled={(evName === '')} onClick={() => {buttonSetEvName('');}}>
            New Event
          </Button>
        </Box>

        {
          Object.keys(allTasks).map((evid: string) => {
          return(
              <DisplayEvent key={`${evid}ev`}
               evid={evid} tasks={allTasks}
               select={buttonSetEvName}
              />
          )})
        }

     </Card></Box>
     <Box>
       <CreateEvent onComplete={formCallback} open={(evName === '')} />
       <ModifyEvent evid={evName} tasks={allTasks} onComplete={formCallback} open={(evName !== '')}  />
     </Box>

   </Box>
    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default EventsPage
