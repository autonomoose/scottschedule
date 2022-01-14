import { Auth } from "aws-amplify"

// this function allows API (and graphQL API) access to
// extended user identity information via authentication header
const getIdToken = async () => ({
  Authorization: (await Auth.currentSession()).getIdToken().getJwtToken()
});

// start config
export const apiconfig = {API:
    {endpoints:
    [{
        name: 'apscottschedule',
        // endpoint: 'https://api.scottsched.wernerdigital.com/core',
        endpoint: 'https://api.scottsched.wernerdigital.com/core-test',
        custom_header: getIdToken,
    }],
    }
}

export const storageconfig = {Storage: {bucket:"scottsched",region:"us-east-1"},}

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

    //  prod versions
    // "aws_appsync_graphqlEndpoint": "https://gyolw776gvhqvpcjkagtmmvkoa.appsync-api.us-east-1.amazonaws.com/graphql",
    // test versions
    "aws_appsync_graphqlEndpoint": "https://iknysjhzmzfd5nddlaljxl5cgy.appsync-api.us-east-1.amazonaws.com/graphql",
    "aws_appsync_region": "us-east-1",
    "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS",
    "aws_appsync_apiKey": "null",
    "graphql_headers": getIdToken,
};

export default awsmobile;