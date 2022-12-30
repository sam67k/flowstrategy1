const express = require('express');
const http = require('http');

const app = express();

app.get('/I/want/title', (req, res) => {
	let addresses = req.query.address;
	if (!Array.isArray(addresses)) {
		addresses = [addresses];
	}
	let titles = [];

	for (const address of addresses) {
		const url = address.includes('http') ? address : `http://${address}`;
		http
			.get(url, (response) => {
				response.setEncoding('utf8');
				let data = '';
				response.on('data', (chunk) => {
					data += chunk;
				});
				response.on('end', () => {
					const match = data.match(/<title>([\s\S]*)<\/title>/);
					const title = match ? match[1] : 'NO RESPONSE';
					titles.push({ address, title });
					if (titles.length === addresses.length) {
						const html = `
            <html>
            <head></head>
            <body>
              <h1> Following are the titles of given websites: </h1>
              <ul>
                ${titles.map(
									({ address, title }) => `<li> ${address} - "${title}" </li>`
								)}
              </ul>
            </body>
            </html>
          `;
						res.send(html);
					}
				});
			})
			.on('error', () => {
				titles.push({ address, title: 'NO RESPONSE' });
				if (titles.length === addresses.length) {
					const html = `
          <html>
          <head></head>
          <body>
            <h1> Following are the titles of given websites: </h1>
            <ul>
              ${titles.map(
								({ address, title }) => `<li> ${address} - "${title}" </li>`
							)}
            </ul>
          </body>
          </html>
        `;
					res.send(html);
				}
			});
	}
});

app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
