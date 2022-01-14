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

