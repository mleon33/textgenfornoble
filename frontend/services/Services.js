class DIDInfoService {
	constructor() {
		this.URI_DIDInfo = `/api/getdidinfo`;
		this.URI_ListIVRNames = `/api/getivrnamesbycampaign`;
	}

	async getDIDInfo(stackid, listOfDID) {
		//console.log(`Service => stackid:${stackid}, listOfDID: ${listOfDID}`);

		const response = await fetch(this.URI_DIDInfo, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ Stack: stackid, DidTfn: listOfDID })
		});

		const didinfo = await response.text();
		return didinfo;
	}

	async getListOfIVRNames(stackid, app) {
		const response = await fetch(this.URI_ListIVRNames, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ Stack: stackid, App: app })
		});

		const listOfIVRs = await response.text();
		return listOfIVRs;
	}

	async saveTextFile(data) {		
		const response = await fetch(`/api/savefile`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ content: data })
		});

		const result = await response.json();
		return result;
	}
}

export default DIDInfoService;
