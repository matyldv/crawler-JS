var http = require('http');
var fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');

var tabela = '<table><thead><tr><th width="40%">Tytuł</th><th>Ilość stron</th><th>Cena</th><th>Cena za stronę</th></tr>  </thead>';
var zamkniecie = '</table>';
var result = tabela + zamkniecie;
ksiazki = [];

class Ksiazka {
  constructor(tytul, strony, cena, cenaZaStrone) {
    this.tytul = tytul;
    this.strony = strony;
    this.cena = cena;
    this.cenaZaStrone = cenaZaStrone;
  }
}
rp('https://www.empik.com/ksiazki/informatyka,3173,s').then(function(html){
	const $ = cheerio.load(html);
	var title = $('title');
	$('.seoTitle').each((i, el) => {
            var link = $(el).attr('href');
			link = 'https://www.empik.com'+link
			rp(link).then(function(subbody){
				const $ = cheerio.load(subbody);
				title = $('title');
			var pages = $("tr:contains('Liczba stron') .attributeDetailsValue").text();
			var cena = $(".productPriceInfo__wrapper").text().trim();
			cena = cena.split('\n');
			cena = cena[0];
			cena = cena.substring(0,cena.length-4);
			var tytul = $(".productBaseInfo h1");
			tytul = tytul.text().trim();
			tytul = tytul.split('\n');
			tytul = tytul.join('');
			var ilosc = pages.split('\n');
			ilosc = ilosc[1];
			ksiazki.push(new Ksiazka(tytul, ilosc, cena, (parseInt(cena)/parseInt(ilosc)).toFixed(3)));
			if(ksiazki.length == 30) {
				ksiazki.sort(function(a, b){return a.cenaZaStrone-b.cenaZaStrone});
				console.log(ksiazki);
				result = tabela;
				for(var i = 0; i < 30; i++){
					result = result + "<tr><td>" + ksiazki[i].tytul + "</td> <td>" + ksiazki[i].strony + "</td> <td>" + ksiazki[i].cena + "</td> <td>" + ksiazki[i].cenaZaStrone + "</td></tr>"; 
				}
				result += zamkniecie;
				
			}
		})
			
	});
	
	$.html();
	
});

fs.readFile('./index.html', function (err, html) {
    if (err) throw err;    
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html); 
		response.write(result);
        response.end();  
		
    }).listen(8080);
});


		