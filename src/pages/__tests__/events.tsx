import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { CreateEvent, ModifyEvent } from '../../components/eventsutil';
import EventsPage from "../events";

interface mockCreateEventProps {
  onComplete: (status: string) => void,
  open: boolean
}
export const mockCreateEvent = (props: mockCreateEventProps) => {
    return(
      <Box data-testid='newEvent' display={(props.open)?'block': 'none'}>
      <Button onClick={() => props.onComplete('newEvName')}>Save New</Button>
      <Button onClick={() => props.onComplete('')}>Cancel</Button>
      </Box>
)};

interface mockModifyEventProps {
  evid: string,
  tasks: iTask,
  onComplete: (status: string) => void,
  open: boolean,
}
export const mockModifyEvent = (props: mockModifyEventProps) => {
    return(
      <Box data-testid='modifyEvent' display={(props.open)?'block': 'none'}>
      <Button onClick={() => props.onComplete(props.evid)}>Save Mod</Button>
      </Box>
)};

jest.mock('../../components/eventsutil', () => ({
    ...jest.requireActual('../../components/eventsutil'),
    fetchEventsDB: jest.fn(() => Promise.resolve({testevt: {descr: 'testing', schedRules: ["begin +2,++2,++2"]}})),
    CreateEvent: jest.fn(),
    ModifyEvent: jest.fn(),
}));

beforeAll(() => {
  (CreateEvent as jest.Mock).mockImplementation(mockCreateEvent);
  (ModifyEvent as jest.Mock).mockImplementation(mockModifyEvent);
});

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    };
  }
}));
const mytest = <EventsPage />;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
    const newEventButton = utils.getByRole('button', {name: /new event/i});
    const saveNewButton = utils.getByRole('button', {name: /save new/i});
    const testButton = utils.getByRole('button', {name: /testevt - testing/i});

    return {
        ...utils,
        newEventButton,
        saveNewButton,
        testButton,
    }
}

describe("EventsPage", () => {
  it("renders snapshot correctly", async () => {
    const {container, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it("handles panel setup correctly", async () => {
    const utils = await mySetup();

    expect(utils.newEventButton).toBeDisabled();
    expect(utils.getByTestId('newEvent')).toBeVisible();
    expect(utils.getByTestId('modifyEvent')).not.toBeVisible();

    expect(utils.testButton).toBeVisible();

  });

  it("handles cancel with callback blank", async () => {
    const utils = await mySetup();

    const cancelButton = utils.getByRole('button', {name: /cancel/i});
    userEvent.click(cancelButton);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
  });

  it("handles clicking on event to show modify card", async () => {
    const utils = await mySetup();

    expect(utils.testButton).toBeVisible();
    userEvent.click(utils.testButton);

    await waitFor(() => {
        expect(utils.getByTestId('modifyEvent')).toBeVisible();
    });
    expect(utils.getByTestId('newEvent')).not.toBeVisible();

  });

  it("new event button switches back to new event card", async () => {
    const utils = await mySetup();

    expect(utils.testButton).toBeVisible();
    userEvent.click(utils.testButton);

    await waitFor(() => {
        expect(utils.getByTestId('modifyEvent')).toBeVisible();
    });
    expect(utils.newEventButton).toBeEnabled();
    userEvent.click(utils.newEventButton);
    await waitFor(() => {
        expect(utils.getByTestId('newEvent')).toBeVisible();
    });
    expect(utils.newEventButton).toBeDisabled();
    expect(utils.getByTestId('modifyEvent')).not.toBeVisible();

  });

  it("reloads data after modified event is saved", async () => {
    const utils = await mySetup();

    expect(utils.testButton).toBeVisible();
    userEvent.click(utils.testButton);

    await waitFor(() => {
        expect(utils.getByTestId('modifyEvent')).toBeVisible();
    });

    const saveModButton = utils.getByRole('button', {name: /save mod/i});
    userEvent.click(saveModButton);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });

  });

});
