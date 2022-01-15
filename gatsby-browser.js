/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import React from 'react';
import Amplify from 'aws-amplify';
import awsconfig, { apiconfig } from './src/aws-safeset';
// import awsconfig, { apiconfig, storageconfig } from './src/aws-safeset';
import { SnackbarProvider } from 'notistack';
require('typeface-roboto');

Amplify.configure(awsconfig)
Amplify.configure(apiconfig);
// setup in aws-safeset before enabling
// Amplify.configure(storageconfig);

export const wrapPageElement = ({ element }) => {
  // props provide same data to Layout as Page element will get
  // including location, data, etc - you don't need to pass it
  return <SnackbarProvider maxSnack={3} dense preventDuplicate>{element}</SnackbarProvider>;
};