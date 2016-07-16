'use strict';

exports.dateFromEdiDate = (ediDate) => {
  return new Date(parseInt(ediDate.substring(4, 8)), 
	parseInt(ediDate.substring(2, 4)) - 1, 
	parseInt(ediDate.substring(0, 2)));
};
