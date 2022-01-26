// extra clocks
import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface ClockProps {
  onComplete: (status: string) => void,
}
export const ClockDigital1 = (props: ClockProps) => {
    return(
      <>
        <Button sx={{margin: 0}} onClick={() => props.onComplete('next')}>
          <Typography variant='h1' id='mainclock'
            sx={{fontSize:150, fontWeight: 600, color: 'black', padding: 0, margin: 0}}>00:00</Typography>
        </Button>
        <Typography variant='subtitle1' id='mainpm' sx={{fontSize:20, fontWeight: 600, color: 'black'}}>
          PM
        </Typography>
        <Box mx={4} display='flex' justifyContent='space-between'>
          <Typography mx={1} variant='h4' id='maindate'>Day, 01/01</Typography>
          <Button onClick={() => props.onComplete('close')}>Close</Button>
        </Box>
      </>
) };

export const ClockDigital2 = (props: ClockProps) => {
    return(
      <>
        <Button sx={{margin: 0, padding: 0}} onClick={() => props.onComplete('next')}>
          <Box display='flex' justifyContent='flex-start' alignItems='center'>
            <Typography id='compclock'
             sx={{letterSpacing: '-30px', lineHeight:.8, fontSize:230, fontWeight: 600, color: 'black', padding: 0, margin: 0}}>00</Typography>
            <Box ml={3}>
              <Typography id='compminutes'
               sx={{lineHeight:.8, fontSize:150, fontWeight: 800, color: 'black', padding: 0, margin: 0}}>
                00
              </Typography>
              <Typography id='maindate'
               sx={{lineHeight:1, fontSize:20, color:'black', padding: 0, margin: 0}}>
                Day, 01/01
              </Typography>
              <Typography id='mainpm'
               sx={{lineHeight:1, fontSize:20, fontWeight: 600, color: 'black'}}>
                PM
              </Typography>
            </Box>
           </Box>
        </Button>
        <Box mx={4} display='flex' justifyContent='space-between'>
          <Button onClick={() => props.onComplete('close')}>Close</Button>
        </Box>
      </>
) };



