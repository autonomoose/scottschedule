/* eslint-disable */
/* GraphQL mutations */

export const mutAddEvents = `
  mutation newEvent(
      $etype: String!,
      $evnames: String!,
      $descr: String!,
  )   {
      addEvents(
          etype: $etype,
          evnames: $evnames,
          descr: $descr,
      )   {
          evnames
          descr
} }`;
