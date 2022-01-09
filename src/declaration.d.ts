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

interface iFutureEvent {
    evTstamp: number,
    evTaskId: string,
};

// schedule buttons
interface iSchedButtons {
    [name: string]: string; // button [name]=text
};



