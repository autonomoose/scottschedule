[![CodeQL](https://github.com/autonomoose/scottschedule/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/autonomoose/scottschedule/actions/workflows/codeql.yml)

# Scottschedule
Complex timers - [https://scottschedule.wernerdigital.com](aws hosted version)
React/Gatsby in Typescript using AWS amplify for services integration and build.

This project requires multiple AWS resources that are not defined in this project.
These services were originally defined via AWS amplify, but have been customized
beyond that services ability to define complete cloudformation templates.
These services include:
- Cognito customization (amplify section describes basic cognito setup)
- dynamodb tables
- appsync (graphQL)
- api gateway (complex data and user setup)
- lambda functions to support api gateway
- IAM roles/policies
- cloudwatch
- route53
- s3

Features:
- adaptive, uses browser to run well on many devices including PC's, phones, tablets
- handles multiple complex event timers
- allows for specific times, starting time offsets, previous run offsets
- allow for optional events and timers
- autostart tomorrow for devices that can disable sleep mode

