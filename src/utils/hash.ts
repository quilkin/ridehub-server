import crypto from 'crypto';

export async function getHash(text : string)  {
    if (text === null || text === undefined || text === "") {
	    return "";
	  }
    // see https://stackoverflow.com/questions/18338890
    const msgBuffer = new TextEncoder().encode(text);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    //const hashBuffer = await crypto.createHmac('sha256', '').update(msgBuffer).digest('hex');
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toUpperCase();
  }