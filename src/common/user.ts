// // see https://stackoverflow.com/questions/12702548

// interface iUser {

//     name: string;
//     pw: string;
//     email: string;
//     code: string;
//     id: number;
//     role: number;
//     units: string ;
//     climbs: number;
//     notifications: number;
//     passwordReset : boolean;
// }

export class User {

    public name: string;
    public pw: string;
    public email: string = '';
    public code: string = '';
    public id: number = 0;
    public role: number = User.Roles.None;
    public units: string = 'k';
    public climbs: number = 1;
    public notifications: number = 1;
    public passwordReset : boolean = false;
    public messagetime: Date = new Date();   // was messageTime
    public error : string = '';


constructor(name:string, pw: string, email?: string, notify?: number, error?: string) {
    this.name = name;
    this.pw = pw;
    if (notify) this.notifications = notify;
    if (email)  this.email = email;
    if (error)  this.error = error;
};

   
    /**
     * Initializes a new instance of the Login class with an error message.
     * @param error - The error message.
     */
    // constructor(error: string) {
    //     this.id = 0;
    //     this.name = error;
    // }
}
export namespace User
{
    export enum Roles
    {
       None,Rider,SiteAmin,FullAdmin
    }
}

