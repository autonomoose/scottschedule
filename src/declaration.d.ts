declare module 'gatsby-query-params';
declare module '*.wav';

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
    begins?: string,
    buttonName?: string,
    sound?: iEvsSound,
    warn?: iEvsWarn,
}

interface iSchedGroup {
    name: string,
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
    src?: string,
    mRepeat?: number,
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

