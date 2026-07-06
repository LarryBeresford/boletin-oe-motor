/**
 * ============================================================
 *  PRUEBA REAL · Envía los 3 boletines de la carpeta "Boletines OE Prueba"
 *  a Larry, con asunto fijo por reporte:
 *     NL: First Mile · XD · SC · TOM
 *     NL: SVC · Last Mile
 *     NL: Quality
 * ============================================================
 *  PASOS
 *   1) Ten los 3 HTML dentro de la carpeta de Drive: "Boletines OE Prueba".
 *      (Deben seguir siendo HTML, no convertirse a Documento de Google.)
 *   2) script.google.com -> Nuevo proyecto -> pega este código -> Guardar.
 *   3) Corre "enviarPruebaReal" -> autoriza (Drive + Gmail) -> revisa tu bandeja.
 * ------------------------------------------------------------
 * Correos:
 * monica.gallardoramirez@mercadolibre.com.mx
 * carlosricardo.almanzaloo@mercadolibre.com.mx
 * ============================================================
 */

var CARPETA = 'Boletines OE Prueba';
var DESTINO = 'larry.beresforddiaz@mercadolibre.com.mx';
var REMITENTE = 'Excelencia Operacional';

function enviarPruebaReal() {
  var carpetas = DriveApp.getFoldersByName(CARPETA);
  if (!carpetas.hasNext()) {
    Logger.log('NO encontré la carpeta "' + CARPETA + '" en tu Drive.');
    return;
  }
  var files = carpetas.next().getFiles();
  var enviados = 0, ignorados = [], sinAsunto = [];

  while (files.hasNext()) {
    var f = files.next();
    var nombre = f.getName();
    var mt = f.getBlob().getContentType() || '';

    if (mt.indexOf('html') === -1 && !/\.html?$/i.test(nombre)) {
      ignorados.push(nombre + ' (no es HTML)');
      continue;
    }

    var html = f.getBlob().getDataAsString('UTF-8');
    var asunto = asuntoDe_(nombre, html);
    if (!asunto) { sinAsunto.push(nombre); continue; }

    GmailApp.sendEmail(
      DESTINO,
      asunto,
      'Si no ves el contenido, ábrelo en la vista HTML de Gmail.',
      { htmlBody: html, name: REMITENTE }
    );
    enviados++;
    Logger.log('Enviado: ' + nombre + '  |  Asunto: ' + asunto);
  }

  Logger.log('=== Enviados ' + enviados + ' a ' + DESTINO + ' ===');
  if (ignorados.length) Logger.log('Ignorados (no HTML): ' + ignorados.join(' | '));
  if (sinAsunto.length) Logger.log('No pude identificar el reporte de: ' + sinAsunto.join(' | '));
}

/**
 * Decide el asunto según el reporte (detecta por nombre de archivo y <title>).
 * Orden importa: primero First Mile (TOM), luego SVC (Last Mile), luego Quality.
 */
function asuntoDe_(nombre, html) {
  var title = (html.match(/<title>([\s\S]*?)<\/title>/i) || ['', ''])[1];
  var key = (nombre + ' ' + title).toLowerCase();

  if (/tom|first\s*mile|fm[_\s·-]|xd.*sc.*tom/.test(key)) return 'NL: First Mile · XD · SC · TOM';
  if (/last\s*mile|svc[_\s]*lm|svc\s*\+/.test(key))       return 'NL: SVC · Last Mile';
  if (/quality|icqa|audits/.test(key))                    return 'NL: Quality';
  return '';   // no identificado
}
