import { API } from 'aws-amplify';

import { listSchedGroupsFull, iSchedGroupListDB } from '../graphql/queries';

export const fetchSchedGroupsDB = async (): Promise<iSchedGroupList> => {
    try {
        const result: any = await API.graphql({query: listSchedGroupsFull})
        console.log("loaded schedgroups dbrecords:", result.data.listSchedGroups.items.length);

        const compactEvents = result.data.listSchedGroups.items.reduce((resdict: iGrpSchedTask, item: iSchedGroupListDB) => {
            const evkeys = item.evnames.split('!');
            // group,sched,ev
            let wkGroup = evkeys[0];
            let wkSched = evkeys[1];

            if (wkSched !== 'args' && evkeys[2] && evkeys[2] !== 'args') {
                if (!resdict[wkGroup+"!"+wkSched]) {
                    resdict[wkGroup+"!"+wkSched] = [];
                }
                resdict[wkGroup+"!"+wkSched].push({evTaskId: evkeys[2]});
            }
            return resdict;
        }, {});

        // console.log("eventlist", compactEvents);
        const compactGroups = result.data.listSchedGroups.items.reduce((resdict: iSchedGroupList, item: iSchedGroupListDB) => {
            const evkeys = item.evnames.split('!');
            // group,sched,ev
            let wkGroup = evkeys[0];
            if (!resdict[wkGroup]) {
                // setup basic group
                resdict[wkGroup] = {descr: '', schedNames: []};
            }
            if (evkeys[1] === 'args') {
                // group args
                resdict[wkGroup].descr = (item.descr)? item.descr: '';
            } else if (evkeys[2] === 'args') {
                // schedule args
                const wkSched = evkeys[1];
                let schedArgs: iSchedule = {schedName: wkSched, schedTasks: []};
                let wkSound: iEvsSound = {};

                if (compactEvents[wkGroup+"!"+wkSched]) {
                    schedArgs.schedTasks = compactEvents[wkGroup+"!"+wkSched];
                } else {
                    schedArgs.schedTasks = [];
                }
                if (item.begins) {
                    schedArgs.begins = item.begins;
                }
                if (item.button) {
                    schedArgs.buttonName = item.button;
                }
                if (item.sound || item.sound === '') {
                    wkSound['name'] = item.sound;
                }
                if (item.soundrepeat) {
                    wkSound['repeat'] = parseInt(item.soundrepeat, 10);
                }
                if (item.warn || item.warn === '') {
                    // console.log('warn', item.warn);
                    schedArgs['warn'] = {};
                }
                if (wkSound && Object.keys(wkSound).length > 0) {
                    schedArgs['sound'] = wkSound;
                }
                resdict[wkGroup].schedNames.push(schedArgs)
            }
            return resdict;
        }, {});

        return(compactGroups);
    } catch (result) {
        console.log("got error", result);
        return({});
    }
};


