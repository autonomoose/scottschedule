import { Auth } from "aws-amplify"

// this function allows API (and graphQL API) access to
// extended user identity information via authentication header
const getIdToken = async () => ({
  Authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
});

// start config
// export const apiconfig = {API: {endpoints: []}};
// add endpoints like so
//     {
//         name: 'apwbench',
//         endpoint: 'https://api.wbench.wernerdigital.com/core-test',
//         custom_header: getIdToken,
//     }
export const apiconfig = {API: {endpoints: []}};

// export const storageconfig = {Storage: {bucket:"",region:"us-east-1"},}
export const storageconfig = {Storage: {bucket:"",region:"us-east-1"},}

// static picture of awsexports w/ any foreign settings
const awsmobile = {
    "aws_project_region": "us-east-1",
    "aws_cognito_identity_pool_id": "us-east-1:0da77621-0a95-471d-a3e7-4f704ff9239d",
    "aws_cognito_region": "us-east-1",
    "aws_user_pools_id": "us-east-1_Bf2ELMgqt",
    "aws_user_pools_web_client_id": "11jltaa6jjo65mffnqialim99f",
    "oauth": {},
    "aws_cognito_username_attributes": [],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],

    // This section overrides the amplify prod/dev selection, and should be set appropriately in git
    // appsync - uncomment for prod versions
    // "aws_appsync_graphqlEndpoint": "https://rrnef36dzjc2ri2bymuc7lhwvu.appsync-api.us-east-1.amazonaws.com/graphql",
    // appsync wbenchTest - uncomment for test versions
    // "aws_appsync_graphqlEndpoint": "https://rwikl2suhjgxbhnknpmsk7w3i4.appsync-api.us-east-1.amazonaws.com/graphql",
    // prod and  test settings
    "aws_appsync_region": "us-east-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "aws_appsync_apiKey": "null",
    "graphql_headers": getIdToken,
    // "aws_user_files_s3_bucket": "file-locker",
    // "aws_user_files_s3_bucket_region": "us-east-1"
};

export default awsmobile;