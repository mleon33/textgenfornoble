class DIDInfo {
	constructor(
		telco_dnis,
		num_dialed,
		num_dialed_desc,
		appl,
		acd_pseudodnis,
		acd_group,
		bill_type,
		desc1,
		desc2,
		desc3,
		desc4,
		desc5,
		desc6,
		desc7,
		desc8,
		desc9,
		desc10,
		disc
	) {
		this.telco_dnis = telco_dnis;
		this.num_dialed = num_dialed;
		this.num_dialed_desc = num_dialed_desc;
		this.appl = appl;
		this.acd_pseudodnis = acd_pseudodnis;
		this.acd_group = acd_group;
		this.bill_type = bill_type;
		this.desc1 = desc1;
		this.desc2 = desc2;
		this.desc3 = desc3;
		this.desc4 = desc4;
		this.desc5 = desc5;
		this.desc6 = desc6;
		this.desc7 = desc7;
		this.desc8 = desc8;
		this.desc9 = desc9;
		this.desc10 = desc10;
		this.disc = disc;
	}
}
module.exports.DIDInfo = DIDInfo;
