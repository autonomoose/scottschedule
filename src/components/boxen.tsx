/*
    various boxes
*/
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface iCaptionBox {
    caption: string,
    color?: string,
    xpad?: string, // rem
}
// quick caption box
export const CaptionBox = (props: iCaptionBox) => {
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

