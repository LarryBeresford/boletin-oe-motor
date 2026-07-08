# Boletín OE — Motor

Genera los boletines mensuales de Excelencia Operacional MLM
—**First Mile · XD · SC · TOM**, **Service Center · Last Mile** y **Quality**—
usando **el diseño final de cada área como plantilla** (salida idéntica).

## Modelo
- **Desde el Sheet (Form):** solo la **tabla de Oficina de Proyectos** (FM y SVC).
- **"Baked" en el código (se edita a mano cuando cambie):** directorio y **fotos del equipo por área**, imágenes/gráficas (screenshots), y el diseño. Están dentro de `template_fm.html`, `template_svc.html`, `template_quality.html`.
- **Quality** no tiene tabla de proyectos: su plantilla va completa (baked); se actualiza en el código.

```
Google Form -> Google Sheet (Respuestas) -> engine.py rellena la tabla -> 3 HTML idénticos
```

## Archivos
| Archivo | Qué hace |
|---|---|
| `app.py` | Interfaz Streamlit: subir Excel -> generar -> previsualizar -> descargar |
| `engine.py` | Carga la plantilla del área e inyecta la tabla de proyectos (email-safe, <102 KB) |
| `template_fm.html` / `template_svc.html` / `template_quality.html` | El final de cada área (plantilla) |
| `sample/datos_ejemplo.xlsx` | Datos de prueba (pestaña `Respuestas`) |
| `apps_script/` | Scripts de Google (crear Form+Sheet, enviar por Gmail) |

## Entrada (Sheet "Respuestas")
1 fila por proyecto: `Área, Mes, Responsable, Proyecto, % Avance, Estado, Contexto, Stopper, Siguiente, Enlace`.

## Cambiar contactos / fotos del directorio
- **First Mile:** el directorio (nombre, rol, correo, foto) sale de la pestaña **`Directorio`** del Sheet. Editas esa pestaña y el boletín cambia — sin tocar código.
- **SVC y Quality:** por ahora siguen 'baked' en su `template_<área>.html` (se migran igual que FM en el siguiente paso).
- Gráficas/capturas: llegan por el Form (pendiente de cablear).

## Correr localmente
```bash
pip install -r requirements.txt
streamlit run app.py
```

## Deploy (Streamlit Cloud)
Sube el repo a GitHub -> share.streamlit.io -> `app.py`. (Credenciales, si aplica, en Settings -> Secrets, nunca en el repo.)

## Estado
- [x] Sprint 1 — Motor: tabla de proyectos desde el Sheet, salida idéntica por área
- [ ] Sprint 2 — Lectura del Sheet en vivo (cuenta de servicio)
- [ ] Sprint 3 — Guardado en D