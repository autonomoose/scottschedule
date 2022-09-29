/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import React from 'react';
import Amplify from 'aws-amplify';
import awsconfig, { apiconfig } from './src/aws-safeset';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { SnackbarProvider } from 'notistack';
require('typeface-roboto');

Amplify.configure(awsconfig)
Amplify.configure(apiconfig);

export const wrapPageElement = ({ element }) => {
  // props provide same data to Layout as Page element will get
  // including location, data, etc - you don't need to pass it
  return (
      <Authenticator.Provider>
      <SnackbarProvider maxSnack={3} dense preventDuplicate>
        {element}
      </SnackbarProvider>
      </Authenticator.Provider>
)};
