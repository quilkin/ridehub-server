export enum Roles
{
    None,        // Signed up but not yet authenticated by email
    Rider,       // normal signed-up rider
    SiteAdmin,   // allowed to edit others' rides etc
    FullAdmin      // not yet used
}

/**
 * Details of a logged-in user (who may be a rider)
 */
export class User {

    public name: string;
    public pw: string;
    public email: string = '';
    public code: string = '';               // used for securty when dealing with emails (lost password etc)
    public id: number = 0;                  // autoincremented by database
    public role: number = Roles.None;       // see Roles above
    public units: string = 'k';             // preferred distnce unist (miles or km)
    public climbs: number = 1;              // not used??
    public notifications: number = 1;       // if the user wants a notification when a new ride is posted
    public passwordReset : boolean = false; // true while waiting for a reset
    public messagetime: Date = new Date();  // was messageTime
    public error : string = '';             // not used??


constructor(name:string, pw: string, email?: string, notify?: number, error?: string) {
    this.name = name;
    this.pw = pw;
    if (notify) this.notifications = notify;
    if (email)  this.email = email;
    if (error)  this.error = error;
};

   
}


