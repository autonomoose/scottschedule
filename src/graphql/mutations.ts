/* eslint-disable */
/* GraphQL mutations */

export const mutAddEvents = `mutation newEvent($input: EventsInput!) {
      addEvents(input: $input)   {
          evnames
} }`;

export const mutAddRules = `mutation newEvent($input: RulesInput!) {
      addRules(input: $input)   {
          evnames
} }`;

