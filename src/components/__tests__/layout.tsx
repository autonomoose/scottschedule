import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { API, Auth, Hub } from 'aws-amplify';
import Layout from "../layout";

jest.mock('aws-amplify');

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));

// mock the window.location.reload() called by auth HUB events
const { reload } = window.location;
beforeAll(() => {
    Object.defineProperty(window, 'location', {
        configurable: true,
        value: { reload: jest.fn() },
    });
});

afterAll(() => {
    window.location.reload = reload;
});

const mytest = <Layout><div data-testid='test'>Test</div></Layout>;
describe("Layout", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('test')).toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  }, 10000);

  it('checks Error Boundary', async () => {
    const ThrowError = () => {
      throw new Error('Test error throw');
      return(<div>Mock Error</div>);
    };
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const consoleErrorFn = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());

    render(<Layout><ThrowError /></Layout>);
    await waitFor(() => {
        expect(screen.getByTestId('errorboundary')).toBeVisible();
    });
    expect(consoleErrorFn).toHaveBeenCalledTimes(2); // error boundary and retry
    expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    consoleErrorFn.mockRestore();
    consoleWarnFn.mockRestore();

  });

  it('checks auth Hub listener', async () => {
      const utils = render(mytest);
      await waitFor(() => {
          expect(utils.getByTestId('test')).toBeVisible();
      });
      const consoleLogFn = jest.spyOn(console, 'log').mockImplementation(() => jest.fn());
      const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());

      Hub.dispatch('auth', {event: 'signOut', message: '', data:{}});
      await waitFor(() => {
          expect(mockEnqueue).toHaveBeenLastCalledWith(`user logged off`, {variant: 'success'});
      });

      Hub.dispatch('auth', {event: 'signIn', message: '', data:{}});
      await waitFor(() => {
          expect(mockEnqueue).toHaveBeenLastCalledWith(`Sign-on successful`, {variant: 'success'});
      });

      Hub.dispatch('auth', {event: 'tokenRefresh_failure', message: '', data:{}});
      await waitFor(() => {
          expect(mockEnqueue).toHaveBeenLastCalledWith(`user timed out`, {variant: 'success'});
      });

      Hub.dispatch('auth', {event: 'tokenRefresh', message: '', data:{}});
      expect(consoleLogFn).toHaveBeenLastCalledWith('user refreshed session');

      Hub.dispatch('auth', {event: 'mockUnknown', message: '', data:{}});
      expect(consoleLogFn).toHaveBeenLastCalledWith("Uncaught Auth module hub signal", "mockUnknown");

      // each dispatch event
      expect(consoleWarnFn).toHaveBeenCalledTimes(5);
      consoleWarnFn.mockRestore();
      consoleLogFn.mockRestore();
  });
  it('handles auth currentSession error throw', async () => {
      // patch in error
      const prevSession = Auth.currentSession;
      Auth.currentSession = jest.fn(() => Promise.reject('mockReject'));

      const utils = render(mytest);
      await waitFor(() => {
          expect(utils.getByTestId('authentFail')).toBeVisible();
      });

      Auth.currentSession = prevSession;
  });

  it('handles dberror during user lookup', async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.reject('mockRejected'));
      const utils = render(mytest);
      await waitFor(() => {
          expect(utils.getByTestId('authentFail')).toBeVisible();
      });
      API.graphql = prevAPIgraphql;

  });

  it('handles null lookup (new user)', async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data': {'getCurrentUser':{}}}));
      const utils = render(mytest);
      await waitFor(() => {
          expect(utils.getByTestId('authentNewUser')).toBeVisible();
      });
      API.graphql = prevAPIgraphql;

  });

});
