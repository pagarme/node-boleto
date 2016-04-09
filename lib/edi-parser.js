'use strict';

let banks = null;

module.exports = (banks) => {
  return {
	parse: (bankName, fileContent) => {
	  // let bankCode = fileContent.substring(0, 3);
	  
	  // for(let bank in banks) {
		// if(banks[bank].options.codigo == bankCode && banks[bank].parseEDIFile) {
		  return banks[bankName].parseEDIFile(fileContent);
		// }
	  // }

	  // throw "Unsupported bank for EDI file parsing.";
	}
  }
}
