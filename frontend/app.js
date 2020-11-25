const path = require('path');

import './styles/app.css';

import DIDInfoModel from './models/Models.js';
import UI from './UI.js';
import { allowedNodeEnvironmentFlags } from 'process';

// General vars
var tableColumnName = [];
var tableColumnData = [];
var txtFileContent = '';

//Look for buttons in the UI
const _btnGetCurrentDIDInfo = document.getElementById('btnGetCurrentDIDInfo');
const _btnPerformTextDIDInfoValidations = document.getElementById('btnPerformTextDIDInfoValidations');
const _stackSelector = document.getElementById('stackSelector');
const _campaignSelector = document.getElementById('campaignSelector');
//const _genFileTextLink = document.getElementById('genFileTextLink');

var _generateTextFile = null;
var errorMessage = '\n';
var errorCount = -1;
var warningCount = -1;

document.body.aComboCampaigns = [];

// Load the stack list:
document.body.stackList = [
	{stack: 'localhost', stackId: 0},
	{stack: 'Stack 1', stackId: 1},
	{stack: 'Stack 2', stackId: 2},
	{stack: 'Stack 3', stackId: 3},
	{stack: 'Stack 4', stackId: 4}
];

// Load the campaign list:
document.body.campaignList = [
	{ campaign: '(Select Campaign)', campaignId: 0, pseudoDnis: '0000000000', stackId: 0 },
	{ campaign: 'AMA', campaignId: 40, pseudoDnis: '0400100166', stackId: 3 },
	{ campaign: 'ANMA', campaignId: 41, pseudoDnis: '0410100166', stackId: 3 },
	{ campaign: 'HMA', campaignId: 16, pseudoDnis: '0160100166', stackId: 2 },
	{ campaign: 'MAQL', campaignId: 9, pseudoDnis: '0090100166', stackId: 3 },
	{ campaign: 'OMA', campaignId: 29, pseudoDnis: '0290100166', stackId: 3 },
	{ campaign: 'SMA', campaignId: 50, pseudoDnis: '0500100166', stackId: 1 },
	{ campaign: 'THMA', campaignId: 69, pseudoDnis: '0690100166', stackId: 2 }
];

document.body.getCampaignInfo = function(field) {
	let campaignCode = document.getElementById('campaign').value;
	let campaignSelectedId = document.body.campaignList
		.map(function(e) {
			return e['campaign'];
		})
		.indexOf(campaignCode);
	let returnValue = document.body.campaignList[campaignSelectedId][field];
	return returnValue;
};

if (_btnGetCurrentDIDInfo) {
	_btnGetCurrentDIDInfo.addEventListener('click', () => {
		getCurrentDIDInfo();
	});
}

if (_btnPerformTextDIDInfoValidations) {
	_btnPerformTextDIDInfoValidations.addEventListener('click', () => {
		performingTests();
	});
}

// Campaign Selector
if (_campaignSelector) {
	let HTMLCampaignSelector = `
		<label for="campaign">Select campaign to use:</label><br/>
		<select id="campaign">\n`;

	let campaignList = document.body.campaignList;

	// if you remove "localhost", add 1 to i.
	for (var i = 0; i < campaignList.length; i++) {
		HTMLCampaignSelector += `<option value="${campaignList[i].campaign}">${campaignList[i].campaign}</option>\n`;
	}

	HTMLCampaignSelector += `
		</select>
	<br/>`;

	_campaignSelector.innerHTML = HTMLCampaignSelector;
};

// Stack Selector:
if (_stackSelector) {
	let HTMLStackSelector = `
		<label for="stack">Select stack to use:</label><br>
		<select id="stack">\n`;

	let stackList = document.body.stackList;
	for (var i=0; i < stackList.length; i++){
		HTMLStackSelector += `<option value=${stackList[i].stackId}>${stackList[i].stack}</option>\n`
	}

	HTMLStackSelector += `
		</select>
	<br/>`;

	_stackSelector.innerHTML = HTMLStackSelector;
}

/* if (_genFileTextLink) {
	let fileName = _genFileTextLink.text;
	exportFileText(fileName);
} */

// Processes
function getCurrentDIDInfo() {
	/*
		"0": "telco_dnis"
		"1": "num_dialed"
		"2": "num_dialed_desc"
		"3": "appl"
		"4": "acd_pseudodnis"
		"5": "acd_group"
		"6": "bill_type"
		"7": "desc1"
		"8": "desc2"
		"9": "desc3"
		"10": "desc4"
		"11": "desc5"
		"12": "desc6"
		"13": "desc7"
		"14": "desc8"
		"15": "desc9"
		"16": "desc10"
		"17": "disc"
	*/

	ClearEnvironment('grid');

	document.body.aComboCampaigns = [];
	
	const objDIDList = document.getElementById('text_did_area').value;
	var divCurrentConfig = document.getElementById('divCurrentConfig');

	const stackObj = parseInt(document.getElementById('stack').value); 
	const stackId = document.body.stackList[stackObj].stackId;

	if (stackId < 0 || stackId > 4) {
		divCurrentConfig.innerHTML = `<strong style="color: red;">You need to select a stack before run the query</strong>`;
		return;
	}

	const ui = new UI();
	const didTextInfo = ui
		.renderDIDInfoSection(stackId, objDIDList)
		.then(
			(result) => {
				tableColumnName = result['fields'];
				tableColumnData = result['rows'];

				const limit = result.rowCount;
				let sData = '';

				if (tableColumnData.length === 0) {
					divCurrentConfig.innerHTML = '<strong style="color:red;">NO DATA</strong>';
					return;
				}

				const sHeader = `
				<a href="#" class="changeDIDStatus" id="changeDIDStatus">Disconnect all DID's</a><br />
				<div class="container-fluid">
					<table style="width:100%" class="table table-bordered">
						<thead>
							<tr>`;
				const sFooter = `
							</tr>
						</thead>
					</table>
				</div>`;

				// Create the header
				const columnsize = [ 90, 90, 150, 55, 100, 40, 95, 30, 30, 30, 30, 30, 30, 30, 30, 120, 60, 20 ];
				for (var iHeader = 0; iHeader < tableColumnName.length; iHeader++) {
					if (iHeader === 2) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setdescription">Set description</a></small><p></th>`;
					} else if (iHeader === 3) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setapp">App</a></small><p></th>`;
					} else if (iHeader === 4) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setpseudodnis">Set pseudodnis</a></small><p></th>`;
					} else if (iHeader === 5) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setgroup">Set group Id</a></small><p></th>`;
					} else if (iHeader >= 7 && iHeader <= 14) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setdesc${iHeader - 6}">Blank</a></small><p></th>`;
					} else if (iHeader === 15) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setdesc${iHeader - 6}">Set IVR Name</a></small><p></th>`;
					} else if (iHeader === 16) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setdesc10">Set SB00</a></small><p></th>`;
					} else if (iHeader === 17) {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}<br/>
												<p><small><a href="#" class="setdisc">Set 0</a></small><p></th>`;
					} else {
						sData += `				<th style="width:${columnsize[iHeader]}px;">${tableColumnName[iHeader]['name']}</th>\n`;
					}
				}

				sData += `
							</tr>
							<tr class="noPadding">`;

				// Put the data into the grid
				for (var iRow = 0; iRow < tableColumnData.length; iRow++) {
					for (var jColumn = 0; jColumn < tableColumnData[iRow].length; jColumn++) {
						if (jColumn <= 1 || jColumn === 6) {
							sData += `				<td><input id="i${iRow}j${jColumn}" type="text" disabled="disabled" style="width:${columnsize[
								jColumn
							]}px;" class="watch-me" value="${tableColumnData[iRow][jColumn] || ''}"></td>\n`;
						} else {
							if (jColumn === 15){
								sData += `				<td><div id="divi${iRow}j${jColumn}"></div></td>\n`;	
							}else{
								sData += `				<td><input id="i${iRow}j${jColumn}" type="text" style="width:${columnsize[
									jColumn
								]}px;" class="watch-me" value="${tableColumnData[iRow][jColumn] || ''}"></td>\n`;	
							}
						}
					}

					sData += `
							</tr>
							<tr class="noPadding">`;
				}

				divCurrentConfig.innerHTML = sHeader + sData + sFooter;

				// Render the list of comboboxes for IVRNames
				for(let iRowForCombo=0; iRowForCombo < tableColumnData.length; iRowForCombo++){
					const sName = `i${iRowForCombo}j15`;
					const oDiv = document.getElementById(`divi${iRowForCombo}j15`);
					const sCampaign = tableColumnData[iRowForCombo][3];
					const sCurrentValue = tableColumnData[iRowForCombo][15];

					const ui = new UI();
					const IVRList = ui
						.renderListOfIVRNames(1, sCampaign)
						.then(
							(result) => {				
								let Data = result['rows'];
								let sHTML = `<select name="${sName}" id="${sName}">\n`;

								for(var iRowForSelect=0; iRowForSelect < Data.length; iRowForSelect++){
									let sValue = Data[iRowForSelect][2];
									let sDisplay = `${Data[iRowForSelect][2]} (${Data[iRowForSelect][0]})`;
									let sSelected = (sValue === sCurrentValue) ? `selected="selected"` : '';

									let item = `<option value="${sValue}" ${sSelected}>${sDisplay}</option>\n`;
									sHTML += item;
								}
								sHTML += '</select>';

								oDiv.innerHTML = sHTML;
							},
							(err) => {
								console.log(err);
							}
						)
						.catch((e) => {
							console.log(e);
						});	
				}

				_generateTextFile = document.getElementById('generateTextFile');
				_generateTextFile.className = 'ShowElement';

				if (_generateTextFile) {
					_generateTextFile.addEventListener('click', () => {
						generateTextFileBasedOnTable();
					});
				}

				// Add Jquery to change the status of the DIDs
				$('.changeDIDStatus').click(() => {
					let listDescription = document.querySelectorAll('.watch-me');
					listDescription.forEach((element) => {
						element.disabled = true;
					});
				});

				//Add Jquery to validate changes on all editable objects
				$('.watch-me').on('change', function() {
					const row = this.id.substr(0, this.id.indexOf('j')).replace('i', '');
					const column = this.id.substr(this.id.indexOf('j')).replace('j', '');

					tableColumnData[row][column] = this.value;
				});

				//Add Jquery to SetDisc class
				$('.setdisc').click(() => {
					for (var i = 0; i < limit; i++) {
						let id = `i${i}j17`;
						document.getElementById(id).value = '0';
						tableColumnData[i][17] = '0';
					}
				});

				// Add Jquery to setdescription class
				$('.setdescription').click(() => {
					let newDescription = prompt(
						'Enter a description for all items in this column.\nEnter # to replace telco_dnis value\nEnter - to clear value',
						'# - '
					);

					if (newDescription != '') {
						for (var i = 0; i < limit; i++) {
							let id = `i${i}j2`;
							let descriptionChanged = newDescription.replace('#', tableColumnData[i][0]);

							document.getElementById(id).value = descriptionChanged;
							tableColumnData[i][2] = descriptionChanged;
						}
					}
				});

				$('.setapp').click(() => {
					let app = document.body.getCampaignInfo('campaign');

					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j3`;
						document.getElementById(id).value = app;
						tableColumnData[i][3] = app;
					}
				});

				$('.setpseudodnis').click(() => {
					let pseudoDnis = document.body.getCampaignInfo('pseudoDnis');
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j4`;
						document.getElementById(id).value = pseudoDnis;
						tableColumnData[i][4] = pseudoDnis;
					}
				});

				$('.setgroup').click(() => {
					let groupId = document.body.getCampaignInfo('campaignId');
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j5`;
						document.getElementById(id).value = groupId;
						tableColumnData[i][5] = groupId;
					}
				});

				$('.setdesc1').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j7`;
						document.getElementById(id).value = '';
						tableColumnData[i][7] = '';
					}
				});

				$('.setdesc2').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j8`;
						document.getElementById(id).value = '';
						tableColumnData[i][8] = '';
					}
				});

				$('.setdesc3').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j9`;
						document.getElementById(id).value = '';
						tableColumnData[i][9] = '';
					}
				});

				$('.setdesc4').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j10`;
						document.getElementById(id).value = '';
						tableColumnData[i][10] = '';
					}
				});

				$('.setdesc5').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j11`;
						document.getElementById(id).value = '';
						tableColumnData[i][11] = '';
					}
				});

				$('.setdesc6').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j12`;
						document.getElementById(id).value = '';
						tableColumnData[i][12] = '';
					}
				});

				$('.setdesc7').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j13`;
						document.getElementById(id).value = '';
						tableColumnData[i][13] = '';
					}
				});

				$('.setdesc8').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j14`;
						document.getElementById(id).value = '';
						tableColumnData[i][14] = '';
					}
				});

				$('.setdesc9').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j15`;
						document.getElementById(id).value = '';
						tableColumnData[i][15] = '';
					}
				});

				$('.setdesc10').click(() => {
					for (var i = 0; i < tableColumnData.length; i++) {
						let id = `i${i}j16`;
						document.getElementById(id).value = 'SB00';
						tableColumnData[i][16] = 'SB00';
					}
				});
			},
			(err) => {
				console.log(err);
			}
		)
		.catch((e) => {
			console.log(e);
		});
}

function performingTests() {
	const header =
		'telco_dnis|num_dialed|num_dialed_desc|appl|acd_pseudodnis|acd_group|bill_type|desc1|desc2|desc3|desc4|desc5|desc6|desc7|desc8|desc9|desc10|disc';
	const matchExpressionDisco = /(DISC|DISCO|DESC|DISCONNECTED)/gm;
	const matchExpressionValidChars = /^[ -~]+/gm;

	ClearEnvironment('result');

	var output = document.getElementById('output');

	var textdata = document.getElementById('textdata').value;
	var lines = textdata.split('\n');
	var campaignCollection = [];

	if (lines[0].length === 0) {
		errorMessage = 'Your text file is empty or has only the header row.';
		errorCount++;
	} else {
		let linesCount = lines.length;

		if (lines[0] === header) {
			for (var i = 1; i < linesCount; i++) {
				var subline = lines[i];
				var fields = subline.split('|');

				/*
                Test 1: Verify if row is using correct separator '|'
                */
				if (subline.match(/\|/g) && subline.match(/\|/g).length != 17) {
					errorMessage +=
						'Line: ' +
						(i + 1) +
						" ERROR: Line doesn't contains exact number of pipe ('|') separator (17). You have " +
						subline.match(/\|/g).length +
						'</br>';
					errorCount++;
				}

				/*
                Test 2: Verify quantity of columns. It has to be 18 columns.
                */
				if (fields.length != 18) {
					errorMessage +=
						'Line: ' +
						(i + 1) +
						' ERROR: Quantity of columns is inconsistent with header columns. Requires: 18, you have: ' +
						fields.length +
						'</br>';
					errorCount++;
				}

				/*
                Test 3: Verify unnecessary blank spaces between data and separator.
                */
				if (subline.match(/(\| | \|)/)) {
					errorMessage +=
						'Line: ' +
						(i + 1) +
						' ERROR: Line contains unneccessary blank spaces between data and separator.</br>';
					errorCount++;
				}

				/*
				CONDITION: If > 0 and fields array is empty, this can be the empty last line, else lunch an error.
				*/
				if (fields != '') {
					/*
					field: telco_dnis
					error 1: field is empty or field length is minor than 10 characters.
					*/
					if (fields[0].length < 10) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' telco_dnis has to be 10 numbers, you have only ' +
							fields[0].length +
							' characters.</br>';
						errorCount++;
					}

					/*
					field: num_dialed
					error 1: field is empty or field length is minor than 10 characters.
					*/
					if (fields[1].length < 10) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' num_dialed has to be 10 numbers, you have only ' +
							fields[1].length +
							' characters.</br>';
						errorCount++;
					}

					/*
					field: num_dialed_desc
					error 1: field is empty
					warning 1: field contains invalid characters
					*/
					if (fields[2].length <= 0) {
						errorMessage +=
							'<div style="color: yellow";>WARNING: Line: ' +
							(i + 1) +
							' num_dialed_desc is empty.</div></br>';
						warningCount++;
					}

					if (fields[2].match(matchExpressionValidChars)[0].length != fields[2].length) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' num_dialed_desc contains INVALID CHARACTERS, please review that you are using valid ASCII characters. </br>';
						errorCount++;
					}

					/* 
					field: appl
					error 1: field empty field
					error 2: field contains invalid characters
					warning 1: field length is major than 4 characters.
					*/
					if (fields[3].length <= 0) {
						errorMessage += 'Line: ' + (i + 1) + ' appl is empty.';
						errorCount++;
					}
					if (fields[3].match(matchExpressionValidChars)[0].length != fields[3].length) {
						errorMessage += 'Line: ' + (i + 1) + ' appl has INVALID CHARACTERS.';
						errorCount++;
					}
					if (fields[3].length > 4) {
						errorMessage +=
							'<div style="color: yellow;">WARNING: Appl lenght is more than 4 characters.</div>';
						warningCount++;
					} else {
						campaignCollection.push(fields[3]);
					}

					/*
					field: acd_pseudodnis
					error 1: field is empty or field length is minor than 10 characters.
					*/
					if (fields[4].length < 10) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' acd_pseudodnis has to be 10 numbers, you have only ' +
							fields[4].length +
							' characters.</br>';
						errorCount++;
					}

					/*
					field: acd_group
					error 1: field length is empty or first character is not '0'|'1' and major than 3 characters
					*/
					if (fields[5].length <= 0 || (!fields[5][0].match(/(0|1)/g) && fields[5].length >= 3)) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' acd_group is empty or length is major than 2 characters or first character is major than 2.</br>';
						errorCount++;
					}

					/*
					field: bill_type
					error 1: field is empty or field length is minor than 10 characters
					error 2: bill_type is different than telco_dnis (field 0) and num_dialed (field 1)
					*/
					if (fields[6].length < 10) {
						errorMessage +=
							'Line: ' +
							(i + 1) +
							' bill_type is empty or field length is minor than 10 characters.</br>';
						errorCount++;
					}
					if (fields[6] != fields[0] || fields[6] != fields[1]) {
						errorMessage +=
							'Line: ' + (i + 1) + ' bill_type is different than telco_dnis or num_dialed field.</br>';
						errorCount++;
					}

					/*
					field: desc1
					warning 1: field length must to be zero.
					*/
					if (fields[7].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc1 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc2
					warning 1: field length must to be zero.
					*/
					if (fields[8].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc2 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc3
					warning 1: field length must to be zero.
					*/
					if (fields[9].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc3 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc4
					warning 1: field length must to be zero.
					*/
					if (fields[10].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc4 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc5
					warning 1: field length must to be zero.
					*/
					if (fields[11].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc5 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc6
					warning 1: field length must to be zero.
					*/
					if (fields[12].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc6 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc7
					warning 1: field length must to be zero.
					*/
					if (fields[13].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc7 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc8
					warning 1: field length must to be zero.
					*/
					if (fields[14].length > 0) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc8 usually is empty, but you have a value in this field.</div></br>';
						warningCount++;
					}

					/*
					field: desc9 / expected: IVR_NAME
					error 1: field is empty.
					warning 1: field content matchs with disconnected string.
					*/
					if (fields[15].length <= 0) {
						errorMessage += 'Line: ' + (i + 1) + ': desc9 is empty.</br>';
						errorCount++;
					}
					if (fields[15].match(matchExpressionDisco)) {
						errorMessage +=
							'<div style="color: yellow;">Line: ' +
							(i + 1) +
							' WARNING: desc9 contains DISC|DISCO|DESC|DISCONNECTED string.</div></br>';
						warningCount++;
					}

					/*
					field: desc10
					error 1: field is different than SB00
					*/
					if (fields[16] != 'SB00') {
						errorMessage += 'Line: ' + (i + 1) + ' desc10 MUST TO BE equal to "SB00".</br>';
						errorCount++;
					}

					/*
					field: disc
					error 1: field value is different than '0'
					*/
					if (fields[17] != '0') {
						errorMessage += 'Line: ' + (i + 1) + ' disc MUST TO BE equal to "0".</br>';
						errorCount++;
					}
				} else {
					if (i === 1) {
						errorMessage += "FATAL Error: Your textfile hasn't data rows. Nothing to do.";
						errorCount++;
					} else {
						errorMessage += 'Please remove the empty last line.';
						errorCount++;
					}
				}
			}
		} else {
			var colnames = lines[0].split('|');
			var realColNames = header.split('|');

			// comparing quantity of columns
			if (colnames.length != realColNames.length) {
				errorMessage +=
					'Quantity of columns differ to hnsc_def_custom template. Requires: <strong>' +
					(realColNames.length - 1) +
					'</strong>, you have: <strong>' +
					(colnames.length - 1) +
					'</strong></br>';
				errorCount++;
			} else {
				// Detecting typos in header row
				for (var i = 0; i < realColNames.length; i++) {
					if (realColNames[i] !== colnames[i]) {
						errorMessage +=
							'Column #' +
							(i + 1) +
							' has to be <strong>' +
							realColNames[i] +
							'</strong> and you have <strong>' +
							colnames[i] +
							'</strong>\n';
						errorCount++;
					}
				}
			}
		}
	}

	/*
    Test 4: If there is more than 1 campaign, raise a warning...
    */
	var uniqueCampaigns = [ ...new Set(campaignCollection) ];
	if (uniqueCampaigns.length > 1) {
		errorMessage +=
			'### GENERAL ERROR ###: You have more than 1 campaign in a single text file. You have ' +
			uniqueCampaigns.join() +
			' campaigns </br>';
		errorCount++;
	}

	// prints output
	output.innerHTML =
		errorCount > -1 || warningCount > -1
			? 'Your text file has ' +
				(errorCount + 1) +
				' error(s) and ' +
				(warningCount + 1) +
				' warning(s): </br>' +
				errorMessage +
				'</br></br></br></br>'
			: 'Ready to go!</br>';

	// If all went fine :)
	if (errorCount < 0) {
		const section = document.getElementById('generateFileOutput');
		const textData = document.getElementById('textdata').value;

		const ui = new UI();
		const fileName = ui.sendDataToGenerateTextFile(textData).then(
			(result) => {
				console.log('result: ' + result);
				return result;
			},
			(err) => {
				console.log(err);
				return '';
			}
		);
		console.log('filename: ' + fileName);
		section.innerHTML = `<p style="color: black;">Text file generated:</p><a href="${fileName}" id="genFileTextLink">${fileName}</a></br></br>`;
	}
}

function generateTextFileBasedOnTable() {
	const output = document.getElementById('textdata');
	txtFileContent = '';

	// Add header row
	for (var i = 0; i < tableColumnName.length; i++) {
		txtFileContent += `${tableColumnName[i]['name']}|`;
	}
	txtFileContent = txtFileContent.substr(0, txtFileContent.length - 1) + '\n';

	output.value = '';

	// Add data row
	for (var i = 0; i < tableColumnData.length; i++) {
		if (tableColumnData[i].length > 0) {
			txtFileContent += tableColumnData[i].join('|') + '\n';
		}
	}
	output.value = txtFileContent.substr(0, txtFileContent.length - 1);
}

function ClearEnvironment(kindOfCleanning){
	var outputGridData = document.getElementById('divCurrentConfig');
	var outputTextData = document.getElementById('textdata');
	var outputResult = document.getElementById('output');

	if(kindOfCleanning === 'grid'){
		outputGridData.innerHTML = '';
		outputTextData.textData = '';
		outputResult.innerText = '';	
	}
	else if(kindOfCleanning === 'result'){
		outputTextData.innerHTML = '';
		outputResult.innerText = '';	
	}
	else{
		outputGridData.innerHTML = '';
		outputTextData.textData = '';
		outputResult.innerText = '';	
	}
}