import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from '@testing-library/user-event'

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
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
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
  const mockCallback = jest.fn();
  const mytest = <ConnectTask evList={testEvList} schedName='testgrp' onComplete={mockCallback} open={true} />
  const mySetup = () => {
      const utils = render(mytest);
      const canButton = utils.getByRole('button', {name: /cancel/i});
      const resetButton = utils.getByRole('button', {name: /reset/i});
      const saveButton = utils.getByRole('button', {name: /save/i});
      const taskFld = utils.getByTestId('taskid');

      return {
          ...utils,
          canButton,
          resetButton,
          saveButton,
          taskFld,
      }
  };
  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });
  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.canButton).toBeEnabled();
    expect(utils.resetButton).toBeEnabled();
    expect(utils.saveButton).toBeEnabled();
  });
  it("cancels with button", () => {
    const utils = mySetup();

    userEvent.click(utils.canButton);
    expect(mockCallback).toHaveBeenLastCalledWith('_testgrp');
  });

  it("enables reset and save after event name modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after event modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    userEvent.click(utils.resetButton);
  });

  it("handles graphql error on save", async () => {
    const consoleWarnFn = jest.spyOn(console, 'warn').mockImplementation(() => jest.fn());
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.reject('mockreject')) as any;
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.type(utils.taskFld, 'newev');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('testgrp');
    });
    API.graphql = prevAPIgraphql;
  });

});

describe("schedgrputil - create group", () => {
  const mockCallback = jest.fn();
  const mytest = <CreateGroup onComplete={mockCallback} open={true} />;
  const mySetup = () => {
      const utils = render(mytest);
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
      }
  };

  it("renders snapshot correctly", () => {
    const {container} = render(mytest);

    expect(container.firstChild).toMatchSnapshot();
  });

  it("starts with buttons in correct status", () => {
    const utils = mySetup();

    expect(utils.resetButton).toBeDisabled();
    expect(utils.saveButton).toBeDisabled();
  });

  it("cancels with upper right x button", () => {
    const utils = mySetup();

    userEvent.click(utils.getByRole('button', {name: /x/i}));
    expect(mockCallback).toHaveBeenLastCalledWith('');
  });

  it("enables reset and save after name modification", async () => {
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
  });
  it("handles reset after name modification", async () => {
    const utils = mySetup();

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
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(consoleWarnFn).toHaveBeenCalledTimes(1);
    });
    API.graphql = prevAPIgraphql;
    consoleWarnFn.mockRestore();
  });
  it("handles save after name modification", async () => {
    const prevAPIgraphql = API.graphql;
    API.graphql = jest.fn(() => Promise.resolve({})) as any;
    const utils = mySetup();

    userEvent.type(utils.nameFld, 'newgrp');
    userEvent.type(utils.descrFld, 'new desc');
    await waitFor(() => {
      expect(utils.resetButton).toBeEnabled();
    });
    expect(utils.saveButton).toBeEnabled();
    userEvent.click(utils.saveButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenLastCalledWith('newgrp');
    });
    API.graphql = prevAPIgraphql;
  });

});
