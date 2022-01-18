// events listing
import React, { useEffect, useState } from 'react';
import { useQueryParam } from 'gatsby-query-params';
import { API } from 'aws-amplify';

import Layout from '../components/layout';
import PageTopper from '../components/pagetopper';
import Seo from '../components/seo';

import { useSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';

import { listEventsFull } from '../graphql/queries';

const EventsPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const vdebug = useQueryParam('debug', '');

    const [hstatus, setHstatus] = useState('Loading'); // hstatus depends on hdata
    const [allTasks, setAllTasks] = useState<iTask>({});

    useEffect(() => {
      const fetchData = async () => {
          setHstatus('Loading');
          try {
              const result: any = await API.graphql({query: listEventsFull})
              console.log("events:", result.data.listEvents.items.length);

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

              enqueueSnackbar(`loaded events`,
                {variant: 'info', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
              setAllTasks(compactTasks);
          } catch (result) {
              enqueueSnackbar(`error retrieving main sku info`, {variant: 'error'});
              console.log("got error", result);
          }
          setHstatus('Ready');
      };

      fetchData();
    }, [enqueueSnackbar, vdebug] );

    return(
      <Layout><Seo title="Events - Scottschedule" />
      <PageTopper pname="Events" vdebug={vdebug} helpPage="/help/events" />
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">

      <Box><Card style={{maxWidth: 432, minWidth: 394, flex: '1 1', background: '#F5F5E6',
        boxShadow: '5px 5px 12px #888888', borderRadius: '0 0 5px 5px'}}>

        Events({Object.keys(allTasks).length})
        {
          Object.keys(allTasks).map((evid: string) => {
          return(
            <Box key={evid}>
              <span>{evid}({allTasks[evid].schedRules.length} rules) {allTasks[evid].descr}</span>
              {
                allTasks[evid].schedRules.map((task: string) => {
                  let sequence = 1;
                return(
                  <Box  display='flex'>
                    {sequence}
                    <Box mx={1} px={1} sx={{ border: '1px solid grey' }} key={`${evid}${sequence++}`}>
                      { (task.length >= 45)
                        ? <>{task.slice(0,45)} {task.slice(45)})</>
                        : <>{task}</>
                      }
                    </Box>
                  </Box>
                )})
              }
            </Box>
          )})
        }

     </Card></Box>

   </Box>
    <Backdrop sx={{ color: '#fff', zIndex: 3000 }} open={(hstatus === "Loading")} >
      <CircularProgress data-testid="dataBackdrop" color="inherit" />
    </Backdrop>
    </Layout>
) };

export default EventsPage
