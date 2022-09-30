import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import {within} from '@testing-library/dom'

import { API } from 'aws-amplify';
import DisplaySchedGroup, { fetchSchedGroupsDB, ChoiceSchedGroup, CreateGroup, ConnectTask } from '../../components/schedgrputil';
jest.mock('aws-amplify');

const baseSchedNames = {
    begins: 'now',
    buttonName: 'test1',
    descr: 'test sched',
    schedName: 'testsched',
    schedTasks: [{evTaskId: 'testev'}],
};

const testSchedGroup = {
    name: 'testgrp',
    descr: 'test group',
    schedNames: [ baseSchedNames, ]
};
const testSchedGroupList = {
    'default': {
      descr: 'main group',
      schedNames: [{
        begins: 'now',
        buttonName: 'main',
        descr: 'main test',
        schedName: 'testsched',
        schedTasks: [{evTaskId: 'testev'}],
        }]
    },
    'testgrp': {
      descr: 'test group',
      schedNames: [ baseSchedNames, ]
    },
};

const testEvList = ['ev1','ev2'];

const testDBgroupArgs = {
    begins: null,
    button: null,
    chain: null,
    descr: 'test schedules',
    evnames: 'default!args',
    sound: null,
    soundrepeat: null,
    warn: null,
};
const testDBschedArgs = {
    begins: 'now',
    button: 'test1',
    chain: null,
    descr: 'test sched',
    evnames: 'default!testsched!args',
    sound: '_default_',
    soundrepeat: '0',
    warn: '_none_',
};
const testDBevent = {
    begins: null,
    button: null,
    chain: null,
    descr: null,
    evnames: 'default!testsched!testev',
    sound: null,
    soundrepeat: null,
    warn: null,
};


describe("schedgrputil - base DisplaySchedGroup event", () => {
  const mockCallback = jest.fn();
  const mytest = <DisplaySchedGroup group='default' groupSched={testSchedGroup} select={mockCallback} />

  it("renders snapshot correctly", () => {
    const {asFragment} = render(mytest);
    expect(asFragment()).toMatchSnapshot();
  });

  it("handles graphQL thrown error", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.reject('mockRejected')) as any;

      const schedGroups = await fetchSchedGroupsDB();
      expect(schedGroups).toStrictEqual({});
      API.graphql = prevAPIgraphql;
  });
  it("translates simple graphQL into schedgroups", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          testDBschedArgs,
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [baseSchedNames],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups wo events", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          testDBschedArgs,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, schedTasks: [], }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups wo optionals", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          { evnames: 'default!testsched!args',},
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{schedName: 'testsched', descr: '', schedTasks: [], }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w sound", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, sound: 'bigbell',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, sound: {name: 'bigbell',}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w repeated sound", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, sound: 'bigbell', soundrepeat: '2'},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, sound: {name: 'bigbell', repeat: 2}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w warn", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, warn: '_default_',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, warn: {}, }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w chain", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, chain: 'testsched',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, chain: 'testsched', }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
  it("translates graphQL schedgroups w clock", async () => {
      const prevAPIgraphql = API.graphql;
      API.graphql = jest.fn(() => Promise.resolve({'data':
        {'listSchedGroups': {items: [
          testDBgroupArgs,
          {...testDBschedArgs, clock: 'digital1',},
          testDBevent,
        ]}}
      })) as any;
      const schedGroups = await fetchSchedGroupsDB();

      expect(schedGroups).toStrictEqual({
        'default': {
          descr: 'test schedules',
          "notomorrow": false,
          schedNames: [{...baseSchedNames, clock: 'digital1', }],
        }
      });
      API.graphql = prevAPIgraphql;
  });
});


describe("schedgrputil - choice (ChoiceSchedGroup) event", () => {
  const mockCallback = jest.fn();
  const mytest = <ChoiceSchedGroup currgroup='default' schedGroupList={testSchedGroupList} setgroup={mockCallback} />
  const mySetup = () => {
      const utils = render(mytest);
      const groupInput = utils.getByTestId(/schedgroup/i);
      const groupInputChg = (myvalue: string) => {
          fireEvent.change(groupInput, { target: { value: myvalue } });
      };
      return {
          ...utils,
          groupInput,
          groupInputChg,
      }
  };

  it("renders choice snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("has correct default", () => {
    const utils = mySetup();
    expect(utils.groupInput).toHaveValue('default');
  });
  it("changes to test", async () => {
    const utils = mySetup();
    utils.groupInputChg('testgrp');
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

});

describe("schedgrputil - connev (connect event)", () => {
  const mySetup = async () => {
      const mockCallback = jest.fn();
      const mytest = <ConnectTask evList={testEvList} schedName='testgrp' onComplete={mockCallback} open={true} />
      const utils = render(mytest);
      await waitFor(() => {
        expect(utils.getByTestId('taskid')).toBeVisible();
      });
      const taskFld = utils.getByTestId('taskid');
      const canButton = utils.getByRole('button', {name: /cancel/i});
      const resetButton = utils.getByRole('button', {name: /reset/i});
      const saveButton = utils.getByRole('button', {name: /save/i});

      return {
          ...utils,
          canButton,
          resetButton,
          saveButton,
          taskFld,
          mockCallback,
      }
  };
  it("renders snapshot correctly", async () => {
    const utils = await mySetup();

    expect(utils.container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", async () => {
    const utils = await mySetup();

    expect(utils.canButton).toBeEnabled();
    expect(utils.resetButton).toBeEnabled();
    expect(utils.saveButton).toBeEnabled();
  });
  it("cancels with button", async () => {
    const utils = await mySetup();

    userEvent.click(utils.canButton);
    await waitFor(() => {
      expect(utils.mockCallback).toHaveBeenLastCalledWith('_testgrp');
    });
  });

  it("enables reset and save after event name modification", async () => {
    const utils = await mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after event modification", async () => {
    const utils = await mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    userEvent.click(utils.resetButton);
  });

  it("handles graphql error on save", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = await mySetup();

    const inputFld = within(utils.taskFld).getByRole('button');
    userEvent.type(inputFld, 'ev2');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    API.graphql = prevAPIgraphql;
  });
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = await mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    API.graphql = prevAPIgraphql;
  });

});

describe("schedgrputil - create group", () => {
  const mySetup = async () => {
      const mockCallback = jest.fn();
      const mytest = <CreateGroup onComplete={mockCallback} open={true} />;
      const utils = render(mytest);
      await waitFor(() => {
        expect(utils.getByTestId('nameInput')).toBeVisible();
      });
      const resetButton = utils.getByRole('button', {name: /reset/i});
      const saveButton = utils.getByRole('button', {name: /save/i});
      const nameFld = utils.getByTestId('nameInput');
      const descrFld = utils.getByTestId('descrInput');

      return {
          ...utils,
          resetButton,
          saveButton,
          nameFld,
          descrFld,
          mockCallback,
      }
  };

  it("renders snapshot correctly", async () => {
    const utils = await mySetup();

    expect(utils.container.firstChild).toMatchSnapshot();
  });

  it("starts with buttons in correct status", async () => {
    const utils = await mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
  });

  it("cancels with upper right x button", async () => {
    const utils = await mySetup();

    userEvent.click(utils.getByRole('button', {name: /x/i}));
    await waitFor(() => {
      expect(utils.mockCallback).toHaveBeenLastCalledWith('');
    });
  });

  it("enables reset and save after name modification", async () => {
    const utils = await mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after name modification", async () => {
    const utils = await mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    userEvent.click(utils.resetButton);
    await waitFor(() => {
      expect(utils.resetButton).toBeDisabled();
    });
  });
  it("handles graphql error on save", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = await mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(2);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = await mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    API.graphql = prevAPIgraphql;
  });

});
