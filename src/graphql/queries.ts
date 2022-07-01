/* eslint-disable */

/* current user */
export interface IgetCurrentUser {
         userid?: string,
         perm?: string,
         nname?: string,
         adisable?: string,
         agroups?: string,
 }

export const currUsersInfo = `query queryUsers {
  getCurrentUser {
      userid
      perm
      nname
      adisable
      agroups
 } }`;

export const listEventsFull = `query queryEvents {
  listEvents {
    items {
      descr
      evnames
      rules
    }
    nextToken

 } }`;

// list of fields for groups and schedules
export interface iSchedGroupListDB {
      descr?: string,
      begins: string,
      button?: string,
      evnames: string,
      sound?: string,
      soundrepeat?: string,
      warn?: string,
      chain?: string,
      notomorrow?: string,
      clock?: string,
}
export const listSchedGroupsFull = `query queryEvents {
  listSchedGroups {
    items {
      begins
      button
      descr
      evnames
      sound
      soundrepeat
      warn
      chain
      notomorrow
      clock
    }
    nextToken

 } }`;

