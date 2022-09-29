import React from "react"
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import { Auth } from 'aws-amplify';
import Header from "../header"

const mytest = <Header uname="tester1" />;

// headerpub describes header after user tester1 signs in
describe("Header", () => {

  it("renders signed-in snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("opens menu", async () => {
      const utils = render(mytest);
      expect(utils.getByText('Main Menu')).not.toBeVisible()

      userEvent.click(utils.getByLabelText(/open menu/i));
      await waitFor(() => {
          expect(utils.getByText('Main Menu')).toBeVisible()
      });
      userEvent.click(utils.getByLabelText(/close menu/i));
  });

  it("responds to sign out", async () => {
      const utils = render(mytest);
      userEvent.click(utils.getByRole('button', {name: /sign out/i}));
      await waitFor(() => {
          expect(Auth.signOut).toHaveBeenLastCalledWith({"global": true});
      });
  });

  it("handles failure during sign out", async () => {
      const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
      const prevSignOut = Auth.signOut;
      Auth.signOut = jest.fn(() => Promise.reject({error: 'mockLogOutReject'}));

      const utils = render(mytest);
      userEvent.click(utils.getByRole('button', {name: /sign out/i}));

      await waitFor(() => {
          expect(Auth.signOut).toBeCalledTimes(1);
      });
      expect(consoleWarnFn).toBeCalledTimes(1);
      Auth.signOut = prevSignOut;
      consoleWarnFn.mockRestore();
  });

});

