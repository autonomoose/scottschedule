import React from 'react';
import { StaticImage } from 'gatsby-plugin-image'
import { navigate } from "gatsby";
import { API } from 'aws-amplify';
import { useForm } from "react-hook-form";

import Layout from '../components/layout'
import Seo from '../components/seo'

import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const SetupStep2Page = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, formState } = useForm();
  const { isDirty, errors } = formState;

  const onSubmit = async () => {
      const myParms = {
        body: {},
        headers: {}, // OPTIONAL
      };

      try {
          const result = await API.post('apscottschedule', '/basicsetup', myParms);
          if (result && result['Response'] === 'completed') {
              enqueueSnackbar(`Thank you for signing up!`,
                {variant: 'success', anchorOrigin: {vertical: 'bottom', horizontal: 'right'}} );
              navigate("/home");
          } else {
              enqueueSnackbar(`setup failed`, {variant: 'error'} );
              console.log('failed setup result', result);
          }
      } catch (apiresult) {
          enqueueSnackbar(`setup failed`, {variant: 'error'} );
              console.log('failed api result', apiresult);
      }
  };

  return (
      <Layout usrSetup="step2">
      <Seo title="Ecom WorkBench Sign-up" />
        <Box display="flex" alignItems="flex-start">
          <Box ml={2}>
          <StaticImage alt="" width={160} loading="eager" aria-labelledby="page-name" src="../images/wernerdigital-hosted.png" />
          </Box>
          <Box mt={6} ml={1}>
          <h1 id="page-name">WBench Signup</h1>
            <Box mb={3} ml={3}>
              <span style={{color: "#777777"}}>Step 1: Create account (Done!)</span>
            </Box>
            <Box mb={3} ml={3} pt={2} px={1} border={1}>
              Step 2: Please read and accept our <a href="https://www.wernerdigital.com/terms" style={{color: `#0000EE`, textDecoration: 'underline'}}> Terms of Service </a>
                <Box ml={2}>
                <form key="apply" onSubmit={handleSubmit(onSubmit)}>
                <br /> <FormControlLabel control={<Checkbox color="primary" />} label="I accept!" {...register('acceptbox', {required: true})} aria-label='acceptbox'/>
                <Button size="small" variant="contained" color="primary" type="submit" disabled={!isDirty}> Submit</Button>
                 <br />{errors.acceptbox && <span role="alert" style={{color: "#B00020"}}>&nbsp;&nbsp;you must accept terms to continue</span> }
                 <br />
                </form>
                </Box>
            </Box>
            <Box mb={3} ml={3}>
              Step 3: Build/import schedules (or just run the clocks!)
            </Box>
          </Box>
        </Box>

      </Layout>
  )
}

export default SetupStep2Page
