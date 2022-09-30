import React from "react";
import { render, waitFor } from "@testing-library/react";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import { ManSched, CreateGroup, ModifyGroup } from '../../components/schedgrputil';
import SchedsPage from "../scheds";

/* mock these to keep from testing all the
     sub-components, and generating new snapshots
*/
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
    fetchSchedGroupsDB: jest.fn(() => Promise.resolve({})),
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
describe("SchedsPage", () => {
  it("renders no group/scheds correctly", async () => {
    const {asFragment, getByTestId} = render(mytest);
    await waitFor(() => {
        expect(getByTestId('dataBackdrop')).not.toBeVisible();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it("handles null for group/scheds fetch", async () => {
    const utils = render(mytest);
    await waitFor(() => {
        expect(utils.getByTestId('dataBackdrop')).not.toBeVisible();
    });
  });
});


