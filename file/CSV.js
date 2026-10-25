const CSV_FILE_EXTENSION = "csv";
const CSV_MIME_TYPES = [
	'text/csv',
	'txt/csv',
	'application/octet-stream',
	'application/csv-tab-delimited-table',
	'application/vnd.ms-excel',
	'application/vnd.ms-pki.seccat',
	'text/plain',
];

class CSV {
	static checkFile(filename, fileType) {
		return CSV_MIME_TYPES.indexOf(fileType) !== -1 && filename.split('.').pop().toLowerCase() === CSV_FILE_EXTENSION;
	}

}

export { CSV };
