import  { TimesDates }  from './timesdates'

/**
 * Class for a Member of TCC
 */
export class Member {
    number = 0;             // will be autoincrented by the database
    fname = '';
    surname = '';
    subs = 0.0;
    paidDate = new Date();
    joinedDate = new Date();
    gender = '';             
    address1 = '';
    address2= '';
    address3 = '';
    postcode = '';
    phone = '';
    email = '';
    committee = '';
    commArray = [''];
    // WhatsApp groups
    waChat = 0;
    waInfo = 0;
    waLeisure = 0;
    nextOfKin = '';
    nokPhone = '';

}