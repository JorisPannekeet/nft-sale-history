const axios = require('axios').default;
const { ethers } = require('ethers');
const excel = require('excel4node');

const getNftData = (id, contract, rl) => {
	console.log('getting nft info...');
	axios
		.get(
			`https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=${id}_${contract}`
		)
		// .get(
		// 	`https://api.nft.gamestop.com/nft-svc-marketplace/getNft?tokenIdAndContractAddress=0x9fa35b10fd77628db18adf4132dc16c14f55d7f6d464e3fb4233f677fbd21f37_0x50f7c99091522898b3e0b8a5b4bd2d48385fe99e`
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
		.then(response => {
			const data = response.data;
			const filteredData = data.filter(
				sale => sale.transaction.txType == 'SpotTrade'
			);
			const workbook = new excel.Workbook();

			const worksheet = workbook.addWorksheet('Sheet 1');
			const style = workbook.createStyle({
				font: {
					color: '#000000',
					size: 12
				}
			});

			filteredData.map((sale, index) => {
				const ethAmount = ethers.utils.formatEther(
					sale.transaction.orderA.amountS
				);
				const saleAmount = sale.transaction.orderA.amountB;

				//HEADERS
				worksheet.cell(1, 1).string('Block id').style(style);
				worksheet.cell(1, 2).string('Transaction id').style(style);
				worksheet.cell(1, 3).string('ETH amount').style(style);
				worksheet.cell(1, 4).string('NFT amount').style(style);
				//DATA
				worksheet
					.cell(index + 2, 1)
					.number(parseFloat(sale.blockId))
					.style(style);
				worksheet
					.cell(index + 2, 2)
					.number(parseFloat(sale.transactionId))
					.style(style);
				worksheet
					.cell(index + 2, 3)
					.string(ethAmount)
					.style(style);
				worksheet
					.cell(index + 2, 4)
					.number(parseFloat(saleAmount))
					.style(style);
			});
			workbook.write('result.xlsx');
			console.log('DONE! written to result.xlsx');
		})
		.then(() => rl.close());
};
module.exports = {
	start: getNftData
};
