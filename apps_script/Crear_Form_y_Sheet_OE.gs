/**
 * ============================================================
 *  BOLETÍN OE — Crea el Google Form (6 secciones) + Sheet ligado
 *  con las pestañas de catálogo (Directorio y NuevosIngresos).
 * ============================================================
 *  USO
 *   1) script.google.com  ->  Nuevo proyecto  ->  pega este código  ->  Guardar.
 *   2) Ejecuta "crearFormYSheet"  ->  autoriza (Forms + Sheets).
 *   3) En el registro (Ver -> Registros) copia las 3 URLs:
 *        - Form (editar), Form (para llenar), y el Sheet de respuestas.
 *   4) Diseño corporativo del Form: NO se puede por código.
 *      Ábrelo -> 🎨 Personalizar tema -> color HEX FFE600 + imagen de encabezado.
 * ============================================================
 */

// ---- Catálogos (edítalos aquí) ----
var AREAS = ['First Mile', 'Service Center', 'Quality'];
var MESES = ['Enero 2026','Febrero 2026','Marzo 2026','Abril 2026','Mayo 2026','Junio 2026',
             'Julio 2026','Agosto 2026','Septiembre 2026','Octubre 2026','Noviembre 2026','Diciembre 2026'];
var SUPERVISORES = ['Miguel Hernández','Mariana Novoa','Steven Seedorf','Ana Vargas',
                    'Juan Carlos García','Eduardo García','Ricardo Almanza'];
var ESTADOS = ['On Track','En Proceso','Planeado','En Riesgo','Discovery'];
var SINO = ['Sí','No'];
var MEDALLAS = ['Oro','Plata','Bronce','Sin medalla'];

function crearFormYSheet() {
  var form = FormApp.create('Boletín Mensual OE — Captura');
  form.setDescription('Captura la información de tu proyecto. Envía UNA respuesta por proyecto. '
    + 'Las secciones de Caso de éxito, Evento, Programa y Notas son opcionales: llénalas solo si aplican.');

  // ---------- Sección 0 · Identificación ----------
  form.addSectionHeaderItem().setTitle('0 · Identificación');
  form.addListItem().setTitle('Área').setChoiceValues(AREAS).setRequired(true);
  form.addListItem().setTitle('Mes').setChoiceValues(MESES).setRequired(true);
  form.addListItem().setTitle('Responsable').setChoiceValues(SUPERVISORES).setRequired(true);

  // ---------- Sección 1 · Proyecto ----------
  form.addPageBreakItem().setTitle('1 · Proyecto')
      .setHelpText('Datos del proyecto para la tabla "Oficina de Proyectos".');
  form.addTextItem().setTitle('Nombre del proyecto').setHelpText('Corto y consistente (máx ~45 car.)').setRequired(true);
  var pct = form.addTextItem().setTitle('% Avance').setHelpText('Solo el número, 0 a 100 (sin %).');
  pct.setValidation(FormApp.createTextValidation().setHelpText('Número entre 0 y 100')
      .requireNumberBetween(0, 100).build());
  form.addListItem().setTitle('Estado').setChoiceValues(ESTADOS).setRequired(true);
  form.addParagraphTextItem().setTitle('Contexto').setHelpText('1–2 frases, máx ~140 car. Qué pasa + un dato concreto.');
  form.addTextItem().setTitle('Stopper / Riesgo').setHelpText('1 frase. Si no hay, escribe "Sin riesgo".');
  form.addTextItem().setTitle('Siguiente paso').setHelpText('Acción concreta con fecha o semana.');
  form.addTextItem().setTitle('Enlace').setHelpText('URL a Grid / WI / Doc, o "-" si no hay.');

  // ---------- Sección 2 · Caso de éxito ----------
  form.addPageBreakItem().setTitle('2 · Caso de éxito (opcional)');
  form.addMultipleChoiceItem().setTitle('¿Hay caso de éxito este mes?').setChoiceValues(SINO);
  form.addTextItem().setTitle('Caso · Título').setHelpText('Titular claro, máx ~60 car.');
  form.addParagraphTextItem().setTitle('Caso · Descripción').setHelpText('1–3 frases: qué se logró y su impacto.');
  form.addTextItem().setTitle('Caso · Métrica destacada').setHelpText('Valor + unidad. Ej: -37% BPP');
  form.addTextItem().setTitle('Caso · Foto (enlace de Drive)').setHelpText('Pega el enlace público de Drive de la imagen.');
  form.addTextItem().setTitle('Caso · Equipo').setHelpText('Nombres separados por coma.');

  // ---------- Sección 3 · Evento ----------
  form.addPageBreakItem().setTitle('3 · Evento en puerta (opcional)');
  form.addMultipleChoiceItem().setTitle('¿Hay evento próximo?').setChoiceValues(SINO);
  form.addTextItem().setTitle('Evento · Fecha').setHelpText('Ej: 10 Jun');
  form.addTextItem().setTitle('Evento · Nombre');
  form.addParagraphTextItem().setTitle('Evento · Descripción');

  // ---------- Sección 4 · Programa de excelencia ----------
  form.addPageBreakItem().setTitle('4 · Programa de excelencia (opcional)');
  form.addMultipleChoiceItem().setTitle('¿Hay resultado de programa?').setChoiceValues(SINO);
  form.addTextItem().setTitle('Programa · Nombre').setHelpText('Ej: PEX, PEFM, PELH, PELM');
  form.addListItem().setTitle('Programa · Nivel / Medalla').setChoiceValues(MEDALLAS);
  form.addTextItem().setTitle('Programa · Resultado');

  // ---------- Sección 5 · Notas de edición ----------
  form.addPageBreakItem().setTitle('5 · Notas de edición (opcional · para PMO)');
  form.addParagraphTextItem().setTitle('Intro del mes').setHelpText('Mensaje de bienvenida / hitos del mes (1 por área).');
  form.addParagraphTextItem().setTitle('KPIs destacados').setHelpText('Ej: 85% Granel On Track | 70% Slip Robotics | W23 Calibración');
  form.addParagraphTextItem().setTitle('Comentarios');

  // ---------- Sección 6 · Gráficas del mes (imágenes que sube el supervisor) ----------
  form.addPageBreakItem().setTitle('6 · Gráficas del mes (opcional)')
      .setHelpText('Sube hasta 4 imágenes (gráficas, tableros, resultados). El motor las coloca en el boletín.');
  for (var g = 1; g <= 4; g++) {
    form.addTextItem().setTitle('Grafica' + g + ' · Título');
    try {
      form.addFileUploadItem().setTitle('Grafica' + g + ' · Imagen');   // requiere dominio Workspace
    } catch (e) {
      form.addTextItem().setTitle('Grafica' + g + ' · URL de imagen (Drive)');  // respaldo
    }
  }

  // ---------- Sheet ligado + catálogo ----------
  var ss = SpreadsheetApp.create('Boletín OE — Respuestas');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // Pestaña Directorio (catálogo)
  var dir = ss.insertSheet('Directorio');
  dir.appendRow(['Nombre','Rol','Correo','Nivel','FotoURL','Área']);
  var DIREC = [
    ['Miguel Hernández','Sr Manager OE','miguel.hernandezmartinez@mercadolibre.com.mx',1,'','Todos'],
    ['Steven Seedorf','Manager OTR','steven.seedorf@mercadolibre.com.mx',2,'','Todos'],
    ['Mariana Novoa','Manager UTR','mariana.novoa@mercadolibre.com.mx',2,'','Todos'],
    ['Ana Vargas','Supervisor SVC','ana.vargasfuentes@mercadolibre.com.mx',3,'','Todos'],
    ['Juan Carlos García','Supervisor Quality','garcia.gjuan@mercadolibre.com.mx',3,'','Todos'],
    ['Eduardo García','Supervisor OE','eduardo.garcia@mercadolibre.com.mx',3,'','Todos'],
    ['Ricardo Almanza','Supervisor LH y FM','carlosricardo.almanzaloo@mercadolibre.com.mx',3,'','Todos']
  ];
  DIREC.forEach(function(r){ dir.appendRow(r); });

  // Pestaña NuevosIngresos (catálogo)
  var ni = ss.insertSheet('NuevosIngresos');
  ni.appendRow(['Nombre','Rol','Correo','FotoURL','Área']);
  var NUEVOS = [
    ['Pablo Gallegos','Analista Sr · XD','pablo.gallegossolano@mercadolibre.com.mx','','First Mile'],
    ['Galindo García','Analista SSr · XD','galindo.garciame@mercadolibre.com.mx','','First Mile'],
    ['Eduardo García','Supervisor OE','eduardo.garcia@mercadolibre.com.mx','','First Mile'],
    ['Larry Beresford','Analista · FM · TOM','larry.beresforddiaz@mercadolibre.com.mx','','First Mile']
  ];
  NUEVOS.forEach(function(r){ ni.appendRow(r); });

  Logger.log('==== LISTO ====');
  Logger.log('Form (editar):  ' + form.getEditUrl());
  Logger.log('Form (llenar):  ' + form.getPublishedUrl());
  Logger.log('Sheet:          ' + ss.getUrl());
  Logger.log('Recuerda: aplica el tema (color FFE600) manualmente en el Form.');
}
