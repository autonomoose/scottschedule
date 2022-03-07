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

export interface iSchedGroupListDB {
      begins: string,
      button?: string,
      descr?: string,
      evnames: string,
      sound?: string,
      soundrepeat?: string,
      warn?: string,
      chain?: string,
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
    }
    nextToken

 } }`;

