const axios = require('axios').default;
const { ethers } = require('ethers');
const XLSX = require('xlsx');

const getNftData = (id, contract, rl) => {
	console.log('getting nft info...');
	axios
		.get(
			`https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=${id}_${contract}`
		)
		// .get(
		// 	`https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=0x4bb68fec13f1ed6fd6f8f9bf0bf29d7c8af4a8c767676787d814712329e2e972_0x31585bc66347e5d1e8edf5af2a7bb864e9c04055`
		// )
		.then(response => {
			getNftHistory(response.data.loopringNftInfo.nftData[0], rl);
		});
};

const getNftHistory = (loopringId, rl) => {
	console.log(`getting trade history with id ${loopringId} ...`);
	axios
		.get(
			`https://api.nft.gamestop.com/nft-svc-marketplace/history?nftData=${loopringId}`
		)
		.then(async response => {
			const data = response.data;
			const filteredData = data.filter(
				sale => sale.transaction.txType == 'SpotTrade'
			);

			const rows = filteredData.map(row => ({
				blockid: row.blockId,
				transactionId: row.transactionId,
				ethAmount: ethers.utils.formatEther(
					row.transaction.orderA.amountS
				),
				nftAmount: row.transaction.orderA.amountB
			}));

			const worksheet = XLSX.utils.json_to_sheet(rows);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Dates');

			/* fix headers */
			XLSX.utils.sheet_add_aoa(
				worksheet,
				[['Block Id', 'Transaction Id', 'ETH Amount', 'NFT amount']],
				{
					origin: 'A1'
				}
			);

			/* create an XLSX file and try to save to Presidents.xlsx */
			XLSX.writeFile(workbook, 'result.xlsx');
			console.log('DONE! written to result.xlsx');
		})
		.then(() => rl.close());
};
module.exports = {
	start: getNftData
};
