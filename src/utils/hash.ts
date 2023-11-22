
// import sha256 from 'crypto-js/sha256';

// export async function getHash(text : string)  {
//     if (text === null || text === undefined || text === "") {
// 	    return "";
// 	  }
//     const hashHex = sha256(text).toString();
//     return hashHex.toUpperCase();
//   }

import sjcl from 'sjcl'


export async function getHash(text : string)  {
    if (text === null || text === undefined || text === "") {
	    return "";
	  }
    const myBitArray = sjcl.hash.sha256.hash(text)
    const hashHex = sjcl.codec.hex.fromBits(myBitArray).toString();
    return hashHex.toUpperCase();
  }

  // node.js crypto 
  
  // import crypto from 'crypto';

  // export async function getHash(text : string)  {
  //   if (text === null || text === undefined || text === "") {
	//     return "";
	//   }
  //   // see https://stackoverflow.com/questions/18338890
  //   const msgBuffer = new TextEncoder().encode(text);                    
  //   const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
   //   // convert ArrayBuffer to Array
  //   const hashArray = Array.from(new Uint8Array(hashBuffer));
  //   // convert bytes to hex string                  
  //   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  //   return hashHex.toUpperCase();
  // }