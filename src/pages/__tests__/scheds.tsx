import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { ManSched, CreateGroup, ModifyGroup } from '../../components/schedgrputil';
import SchedsPage from "../scheds";

interface mockCreateGroupProps {
  onComplete: (status: string) => void,
  open: boolean
}
export const mockCreateGroup = (props: mockCreateGroupProps) => {
    return(
      <Box data-testid='newGroup' display={(props.open)?'block': 'none'}>
      <Button onClick={() => props.onComplete('newGroupName')}>Save New</Button>
      <Button onClick={() => props.onComplete('')}>Cancel New</Button>
      </Box>
)};
interface mockModifyGroupProps {
  group: string,
  groupSched: iSchedGroup,
  onComplete: (status: string) => void,
  open: boolean,
}
export const mockModifyGroup = (props: mockModifyGroupProps) => {
    return(
      <Box data-testid='modifyGroup' display={(props.open)?'block': 'none'}>
      <Button onClick={() => props.onComplete(props.group)}>Save Mod</Button>
      <Button onClick={() => props.onComplete('')}>Cancel Mod</Button>
      <List disablePadding dense sx={{marginLeft: '1em'}}>
        <ListItem button key='testsched' onClick={() => props.onComplete('_testgrp!testsched')}>
            testsched - test sched
        </ListItem>
      </List>

      </Box>
)};

interface mockManSchedProps {
  groupSchedName: string, // group!sched or group!_NEW_
  gSchedule: iSchedule,
  onComplete: (status: string) => void,
  open: boolean
}
export const mockManSched = (props: mockManSchedProps) => {
    return(
      <Box data-testid='manSched' display={(props.open)?'block': 'none'}>
      <Button onClick={() => props.onComplete(props.groupSchedName)}>Save Sched</Button>
      <Button onClick={() => props.onComplete('')}>Cancel Sched</Button>
      </Box>
)};

jest.mock('../../components/schedgrputil', () => ({
    ...jest.requireActual('../../components/schedgrputil'),
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve(
      {testgrp: {descr: 'test group',
        schedNames: [{
          begins: '8:00',
          buttonName: ' ',
          descr: 'test sched',
          schedName: 'testsched',
          schedTasks: [{evTaskId: 'testev'}],
          }]}
      })),
    ManSched: jest.fn(),
    CreateGroup: jest.fn(),
    ModifyGroup: jest.fn(),
}));

beforeAll(() => {
  (CreateGroup as jest.Mock).mockImplementation(mockCreateGroup);
  (ModifyGroup as jest.Mock).mockImplementation(mockModifyGroup);
  (ManSched as jest.Mock).mockImplementation(mockManSched);
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

const mytest = <SchedsPage />;
const mySetup = async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });

    const newGroupButton = utils.getByTestId('create-group');
    const newGroupPanel = utils.getByTestId('newGroup');
    const modGroupPanel = utils.getByTestId('modifyGroup');
    const manSchedPanel = utils.getByTestId('manSched');
    return {
        ...utils,
        newGroupButton,
        newGroupPanel,
        modGroupPanel,
        manSchedPanel,
    }
}

describe("SchedsPage", () => {
  it("renders snapshot correctly", async () => {
    const {asFragment, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("handles panel setup correctly", async () => {
    const utils = await mySetup();

    expect(utils.newGroupButton).toBeEnabled();
    expect(utils.newGroupPanel).not.toBeVisible();
    expect(utils.modGroupPanel).not.toBeVisible();
    expect(utils.manSchedPanel).not.toBeVisible();

  });

  it("opens new group panel", async () => {
    const utils = await mySetup();

    expect(utils.newGroupButton).toBeEnabled();
    await userEvent.click(utils.newGroupButton);
    await waitFor(() => {
      expect(utils.newGroupPanel).toBeVisible();
    });
    expect(utils.modGroupPanel).not.toBeVisible();
    expect(utils.manSchedPanel).not.toBeVisible();

  });

  it("handles new group cancel", async () => {
    const utils = await mySetup();

    await userEvent.click(utils.newGroupButton);
    await waitFor(() => {
      expect(utils.newGroupPanel).toBeVisible();
    });
    const cancelButton = utils.getByRole('button', {name: /cancel new/i});
    await userEvent.click(cancelButton);
    await waitFor(() => {
      expect(utils.newGroupPanel).not.toBeVisible();
    });

  });

  it("handles new group save", async () => {
    const utils = await mySetup();

    await userEvent.click(utils.newGroupButton);
    await waitFor(() => {
      expect(utils.newGroupPanel).toBeVisible();
    });

    const saveButton = utils.getByRole('button', {name: /save new/i});
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });

  });

  it("opens modify group panel", async () => {
    const utils = await mySetup();

    const modGroupButton = utils.getByRole('button', {name: /testgrp - test group/i});
    await userEvent.click(modGroupButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).toBeVisible();
    });
    expect(utils.newGroupPanel).not.toBeVisible();
    expect(utils.manSchedPanel).not.toBeVisible();

  });

  it("handles modify group cancel", async () => {
    const utils = await mySetup();

    const modGroupButton = utils.getByRole('button', {name: /testgrp - test group/i});
    await userEvent.click(modGroupButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).toBeVisible();
    });

    const cancelButton = utils.getByRole('button', {name: /cancel mod/i});
    await userEvent.click(cancelButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).not.toBeVisible();
    });

  });

  it("handles modify group save", async () => {
    const utils = await mySetup();

    const modGroupButton = utils.getByRole('button', {name: /testgrp - test group/i});
    await userEvent.click(modGroupButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).toBeVisible();
    });

    const saveButton = utils.getByRole('button', {name: /save mod/i});
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
  });


  it("opens modify schedule panel and handles cancel", async () => {
    const utils = await mySetup();

    // open group
    const modGroupButton = utils.getByRole('button', {name: /testgrp - test group/i});
    await userEvent.click(modGroupButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).toBeVisible();
    });

    // open sched
    const modSchedButton = utils.getByRole('button', {name: /testsched - test sched/i});
    await userEvent.click(modSchedButton);
    await waitFor(() => {
      expect(utils.manSchedPanel).toBeVisible();
    });
    expect(utils.newGroupPanel).not.toBeVisible();
    expect(utils.modGroupPanel).not.toBeVisible();

    // cancel sched
    const cancelButton = utils.getByRole('button', {name: /cancel sched/i});
    await userEvent.click(cancelButton);
    await waitFor(() => {
      expect(utils.manSchedPanel).not.toBeVisible();
    });

    // should show group list
    expect(modGroupButton).toBeVisible();
  });

  it("handles modify schedule save", async () => {
    const utils = await mySetup();

    // open group
    const modGroupButton = utils.getByRole('button', {name: /testgrp - test group/i});
    await userEvent.click(modGroupButton);
    await waitFor(() => {
      expect(utils.modGroupPanel).toBeVisible();
    });

    // open sched
    const modSchedButton = utils.getByRole('button', {name: /testsched - test sched/i});
    await userEvent.click(modSchedButton);
    await waitFor(() => {
      expect(utils.manSchedPanel).toBeVisible();
    });

    const saveButton = utils.getByRole('button', {name: /save sched/i});
    await userEvent.click(saveButton);
    await waitFor(() => {
      expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });

    expect(utils.manSchedPanel).toBeVisible();
  });

});
