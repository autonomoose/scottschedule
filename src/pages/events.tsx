// events listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';
import DisplayEvents, { CreateEvent, ModifyEvent, fetchEventsDB } from '../components/eventsutil';

import { useSnackbar } from 'notistack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const EventsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const startParm = useQueryParam('start', '');
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [showList, setShowList] = useState(true);
    const [allTasks, setAllTasks] = useState<iTask>({});
    const [evName, setEvName] = useState('');
    const [pgserial, setPgserial] = useState(0);

    const buttonSetEvName = async (newEvName: string) => {
        setEvName(newEvName);
        if (newEvName !== '') {
            setShowList(false);
            }
    }

    const formCallback = async (status: string) => {
        setEvName(status);
        if (status !== '') {
            setPgserial(pgserial+1);
        } else {
            setShowList(true);
        }
    }

    useEffect(() => {
        const fetchEvs = async () => {
            setHstatus('Loading');
            const newTasks = await fetchEventsDB();
            if (newTasks) {
                enqueueSnackbar(`loaded events`,
                  {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
                setAllTasks(newTasks);
                let wkEvName = evName;
                if (wkEvName === '' && startParm && pgserial === 0) {
                    wkEvName = startParm;
                }

                // console.log('try ev name', wkEvName);
                if (wkEvName === '' || wkEvName in newTasks === false) {
                    setEvName('');
                } else {
                    setEvName(wkEvName);
                    setShowList(false);
                }
            }
        setHstatus('Ready');
        };

        fetchEvs();
        // console.log('ev fetch', pgserial, startParm);
    }, [enqueueSnackbar, vdebug, pgserial, startParm] );

    return(
      <Layout><Seo title="Events - Scottschedule" />
      <PageTopper pname="Events" vdebug={vdebug} helpPage="/help/events" />
      <Box display="flex" flexWrap="wrap" justifyContent="center">

      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        <Typography variant='h6' sx={{padding: '0 0.5em 0', bgcolor: 'site.main'}}>
        Event Definition Editor
        </Typography><Typography variant='body2' sx={{margin: '1px 4px'}}>
        Create and modify individual timing rules and conditions
        </Typography>

        <Accordion expanded={showList} onChange={() => setShowList(!showList)} disableGutters elevation={0}>
          <AccordionSummary sx={{
            bgcolor: 'site.main', minHeight: 45, maxHeight: 45,
            padding: '0px 4px 0px 0px', margin: '6px 0px 0px 0px',
            }} expandIcon={<ExpandMoreIcon />} >
            <Box width='100%' mx={1} display='flex' justifyContent='space-between' alignItems='baseline'>
              Events List ({Object.keys(allTasks).length})
              <Button variant='outlined' disabled={(evName === '_new')} onClick={(event) => {buttonSetEvName('_new');event.stopPropagation();}} data-testid='create-event'>
                New Event
              </Button>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{maxHeight: '9rem', overflow: 'auto' }}>
            <DisplayEvents tasks={allTasks} select={buttonSetEvName} />
          </AccordionDetails>
        </Accordion>

     </Card></Box>
     <Box>
       <CreateEvent onComplete={formCallback} open={(evName === '_new')}/>
       <ModifyEvent evid={evName} tasks={allTasks} onComplete={formCallback} open={(evName !== '') && (evName !== '_new')}  />
     </Box>

   </Box>
    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default EventsPage
