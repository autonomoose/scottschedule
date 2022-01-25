declare module 'gatsby-query-params';
declare module '*.wav';

interface iTaskDb {
    evnames: string,
    descr?: string,
    rules?: string,
};
interface iTask {
    [evTaskId: string]: {
        descr: string,
        schedRules: string[],
    };
};

interface iSchedTask {
   evTaskId: string,
}

interface iSchedule {
    schedName: string,
    schedTasks: iSchedTask[],
    descr?: string,
    begins?: string,
    buttonName?: string,
    sound?: iEvsSound,
    warn?: iEvsWarn,
}

interface iSchedGroup {
    name?: string,
    descr: string,
    schedNames: iSchedule[],
};

// schedule options
interface iSchedOptions {
    [name: string]: boolean;
};

// schedule buttons
interface iSchedButtons {
    [name: string]: string; // button [name]=text
};

// next event group sound parms
interface iEvsSound {
    name?: string,
    repeat?: number,
    src?: string, // not implemented yet
};

// next event group sound parms
interface iEvsWarn {
    mEarly?: number,
    sound?: iEvsSound,
};

interface iFutureEvent {
    evTstamp: number,
    evTaskId: string,
};

interface iFutureEvs {
    evs: iFutureEvent[],
    begins?: number,
    sound?: iEvsSound,
    warn?: iEvsWarn,
};

interface iSchedGroupList {
    [name: string]: {
        descr: string,
        schedNames: iSchedule[],
    };
};

interface iGrpSchedTask {
    [name: string]: iSchedTask[],
};


