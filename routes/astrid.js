var express = require('express');
var router = express.Router();
const http = require('follow-redirects').http;
const { parseString } = require('xml2js'); // Importa el método parseString desde xml2js


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('!Ruta no permitida¡');
});

router.get('/buscapersona', (req, res) => {

  // Obtén los parámetros de la solicitud
  const { urlhost, puerto, path, nombrebuscar } = req.query;
  // Verifica si se proporcionaron ambos parámetros
  if (!urlhost || !puerto || !path || !nombrebuscar) {
    return res.status(400).send('Se requieren los parámetros "url" y "nombrebuscar"');
  }

  const options = {
    'method': 'POST',
    'hostname': urlhost, // Usa el valor proporcionado para la URL
    'port': puerto,
    'path': '/' + path,
    'headers': {
      'Content-Type': 'text/xml',
      'SOAPAction': '"http://tempuri.org/getCheckList"'
    },
    'maxRedirects': 20
  };

  const request = http.request(options, function (response) {
    let chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      // Convertir XML a JSON
      parseString(body.toString(), function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send('Error al parsear el XML');
        } else {
          // Enviar respuesta como JSON
          const checkListResult = result["soap:Envelope"]["soap:Body"][0]["getCheckListResponse"][0]["getCheckListResult"];
          res.json(checkListResult);
          /*   res.json(result); */
        }
      });
    });

    response.on("error", function (error) {
      console.error(error);
      res.status(500).send('Error en la petición');
    });
  });

  const postData = `<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\r\n    <soap:Body>\r\n        <getCheckList xmlns=\"http://tempuri.org/\">\r\n            <consulta>${nombrebuscar}</consulta>\r\n        </getCheckList>\r\n    </soap:Body>\r\n</soap:Envelope>`;
  request.write(postData);
  request.end();
});

router.get('/detallepersona', (req, res) => {

  const { urlhost, puerto, path, nombrebuscar } = req.query;
  // Verifica si se proporcionaron ambos parámetros
  if (!urlhost || !puerto || !path || !nombrebuscar) {
    return res.status(400).send('Se requieren los parámetros "url" y "nombrebuscar"');
  }

  const options = {
    'method': 'POST',
    'hostname': urlhost, // Usa el valor proporcionado para la URL
    'port': puerto,
    'path': '/' + path,
    'headers': {
      'Content-Type': 'text/xml',
      'SOAPAction': '"http://tempuri.org/getCheckListAll"'
    },
    'maxRedirects': 20
  };


  const request = http.request(options, function (response) {
    let chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      // Convertir XML a JSON
      parseString(body.toString(), function (err, result) {
        if (err) {
          console.error(err);
          res.status(500).send('Error al parsear el XML');
        } else {
          // Enviar respuesta como JSON
          const checkListResult = result["soap:Envelope"]["soap:Body"][0]["getCheckListAllResponse"][0]["getCheckListAllResult"];
          res.json(checkListResult);
        }
      });
    });

    response.on("error", function (error) {
      console.error(error);
      res.status(500).send('Error en la petición');
    });
  });

  const postData = `<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">\r\n  <soap:Body>\r\n    <getCheckListAll xmlns=\"http://tempuri.org/\">\r\n      <consulta>${nombrebuscar}</consulta>\r\n    </getCheckListAll>\r\n  </soap:Body>\r\n</soap:Envelope>`;

  request.write(postData);
  request.end();
});


module.exports = router;
