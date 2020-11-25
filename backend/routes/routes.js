const { Router } = require('express');
const router = Router();
const path = require('path');

const { DB } = require('../models/DBModels.js');
const { v4 } = require('uuid');

router.get(path.resolve(__dirname, '/updatedidinfo.html'), (req, res) => {
	return res.sendFile(path.join('public', 'updatedidinfo.html'));
});

router.post('/api/getdidinfo', (req, res) => {
	let stack = req.body.Stack || req.query.Stack;
	let didtfn = req.body.DidTfn || req.query.DidTfn;
	let aDIDToQuery = (!!didtfn) ? didtfn.split('\n') : [];
	
	//console.log('Routes => List of DID:'+aDIDToQuery);

	let sWhereDIDList = '';
	let sQuery = `
	select trim(hnsc_def_custom.telco_dnis) as telco_dnis,
		trim(hnsc_def_custom.num_dialed) as num_dialed,
		trim(hnsc_def_custom.num_dialed_desc) as num_dialed_desc,
		trim(hnsc_def_custom.appl) as appl,
		trim(hnsc_def_custom.acd_pseudodnis) as acd_pseudodnis,
		trim(hnsc_def_custom.acd_group) as acd_group,
		trim(hnsc_def_custom.bill_type) as bill_type,
		trim(hnsc_def_custom.desc1) as desc1,
		trim(hnsc_def_custom.desc2) as desc2,
		trim(hnsc_def_custom.desc3) as desc3,
		trim(hnsc_def_custom.desc4) as desc4,
		trim(hnsc_def_custom.desc5) as desc5,
		trim(hnsc_def_custom.desc6) as desc6,
		trim(hnsc_def_custom.desc7) as desc7,
		trim(hnsc_def_custom.desc8) as desc8,
		trim(hnsc_def_custom.desc9) as desc9,
		trim(hnsc_def_custom.desc10) as desc10,
		trim(hnsc_def_custom.disc) as disc
	from hnsc_def_custom
	where telco_dnis in(`;

	aDIDToQuery.forEach((element) => {
		if (element) {
			sWhereDIDList += "'" + element + "',";
		}
	});
	sQuery = sQuery + sWhereDIDList.substr(0, sWhereDIDList.length - 2) + "')";

	//console.log(`Routes => stack:${stack}, query: ${sQuery}`);

	const db = new DB();
	const result = db
		.DoQuery(stack, sQuery)
		.then((result) => {
			return res.json(result);
		})
		.then((err) => {
			return { error: err };
		});
});

router.post('/api/getivrnamesbycampaign', (req, res) => {
	const stackId = req.body.Stack || req.query.Stack;
	const app = req.body.App || req.query.App;
	const aCampaigns = (!!app) ? app.split('\n') : [];

	let sWhere = '';
	let sQuery = `
		SELECT count(1), trim(appl), trim(desc9) AS IVR_Name
		FROM hnsc_def_custom 
		WHERE appl IN(`;		
		aCampaigns.forEach((element) => {
			if (element) {
				sWhere += "'" + element + "',";
			}
		});
		sQuery = sQuery + sWhere.substr(0, sWhere.length - 2) + `')
		GROUP BY appl, desc9
		ORDER BY appl ASC, desc9 ASC`;

	const db = new DB();
	const result = db
		.DoQuery(stackId, sQuery)
		.then((result) => {
			return res.json(result);
		})
		.then((err) => {
			return { error: err };
		});
});

router.post('/api/savefile', (req, res) => {
	const fs = require('fs');
	const uuidv4 = v4;

	let fileName = `${uuidv4()}.txt`;
	let fullFileName = path.join(process.cwd(), 'backend/public/uploads/') + fileName;

	let data = req.body.content;

	fs.writeFile(fullFileName, data, function(err) {
		if (err) return console.log(err);
		console.log(fullFileName);
	});
});

module.exports = router;
