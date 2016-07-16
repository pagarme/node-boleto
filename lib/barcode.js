'use strict';

exports.binaryRepresentationForBarcodeData = (barcodeData) => {
	let digits = {
		0: "00110",
		1: "10001",
		2: "01001",
		3: "11000",
		4: "00101",
		5: "10100",
		6: "01100",
		7: "00011",
		8: "10010",
		9: "01010"
	};

	if (barcodeData.length % 2 != 0) {
		barcodeData = "0" + barcodeData;
	}

	let binaryDigits = "0000";
	// Start of barcode
	for (let i = 0; i < barcodeData.length; i += 2) {
		let digit1 = digits[parseInt(barcodeData[i])];
		let digit2 = digits[parseInt(barcodeData[i + 1])];

		for (let j = 0; j < digit1.length; j++) {
			binaryDigits += digit1[j] + digit2[j];
		}
	}

	// End of barcode
	binaryDigits += "1000";

	return binaryDigits;
}

// Convert a value to a little endian hexadecimal value
exports._getLittleEndianHex = (value) => {
	let result = [];
	for (let bytes = 4; bytes > 0; bytes--) {
		result.push(String.fromCharCode(value & 0xff));
		value >>= 0x8;
	}

	return result.join('');
}

exports._bmpHeader = (width, height) => {
	let numFileBytes = exports._getLittleEndianHex(width * height);
	width = exports._getLittleEndianHex(width);
	height = exports._getLittleEndianHex(height);

	return 'BM' + // Signature
		numFileBytes + // size of the file (bytes)*
		'\x00\x00' + // reserved
		'\x00\x00' + // reserved
		'\x36\x00\x00\x00' + // offset of where BMP data lives (54 bytes)
		'\x28\x00\x00\x00' + // number of remaining bytes in header from here (40 bytes)
		width + // the width of the bitmap in pixels*
		height + // the height of the bitmap in pixels*
		'\x01\x00' + // the number of color planes (1)
		'\x20\x00' + // 32 bits / pixel
		'\x00\x00\x00\x00' + // No compression (0)
		'\x00\x00\x00\x00' + // size of the BMP data (bytes)*
		'\x13\x0B\x00\x00' + // 2835 pixels/meter - horizontal resolution
		'\x13\x0B\x00\x00' + // 2835 pixels/meter - the vertical resolution
		'\x00\x00\x00\x00' + // Number of colors in the palette (keep 0 for 32-bit)
		'\x00\x00\x00\x00'; // 0 important colors (means all colors are important)
}

exports.bmpLineForBarcodeData = (barcodeData) => {
	let binaryRepresentation = exports.binaryRepresentationForBarcodeData(barcodeData);

	let bmpData = new Array();
	let black = true;
	let offset = 0;

	for (let i = 0; i < binaryRepresentation.length; i++) {
		let digit = binaryRepresentation[i];
		let color = black ? String.fromCharCode(0, 0, 0, 0) : String.fromCharCode(255, 255, 255, 0);
		let pixelsToDraw = (digit == "0") ? 1 : 3;

		for (let j = 0; j < pixelsToDraw; j++) {
			bmpData[offset++] = color;
		}

		black = !black;
	}

	let bmpHeader = exports._bmpHeader(offset - 1, 1);
	let bmpBuffer = new Buffer(bmpHeader + bmpData.join(""), 'binary');
	return bmpBuffer.toString('base64');
}