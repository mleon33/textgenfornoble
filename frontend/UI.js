import DIDInfoService from './services/Services';

const didInfoService = new DIDInfoService();

class UI {
	async renderDIDInfoSection(stackId, listOfDID) {
		//console.log(`UI => stackId:${stackId}, listOfDID: ${listOfDID}`);

		const didinfo = await didInfoService.getDIDInfo(stackId, listOfDID).then(
			(result) => {
				return JSON.parse(result);
			},
			(err) => {
				console.log(err);
			}
		);
		return didinfo;
	}

	async renderListOfIVRNames(stackId, app){
		const listIVRNames = await didInfoService.getListOfIVRNames(stackId, app).then(
			(result) => {
				return JSON.parse(result);
			},
			(err) => {
				console.log(err);
			}
		)
		return listIVRNames;
	}

	async sendDataToGenerateTextFile(data) {
		const saveResult = await didInfoService.saveTextFile(data).then(
			(result) => {
				return result;
			},
			(err) => {
				console.log(err);
			}
		);
		return saveResult;
	}
}

export default UI;
