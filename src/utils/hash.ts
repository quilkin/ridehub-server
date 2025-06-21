
import sjcl from 'sjcl'

/**
 * use for storeing and comparing passwords
 * @param text usually a  password
 * @returns hashed string
 */
export async function getHash(text : string)  {
    if (text === null || text === undefined || text === "") {
	    return "";
	  }
    const myBitArray = sjcl.hash.sha256.hash(text)
    const hashHex = sjcl.codec.hex.fromBits(myBitArray).toString();
    return hashHex.toUpperCase();
  }
