# -*- coding: utf-8 -*-
"""Boletín OE — App Streamlit (Sprint 1).
Sube el Excel (o usa el de ejemplo) y genera los 3 boletines para descargar.
Correr local:  streamlit run app.py
"""
import os, re, unicodedata
import streamlit as st
import streamlit.components.v1 as components
import engine

HERE = os.path.dirname(os.path.abspath(__file__))
YEL = "#FFE600"

def slug(s):
    s = "".join(c for c in unicodedata.normalize("NFD", str(s).lower()) if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")

st.set_page_config(page_title="Boletín OE — Motor", page_icon="📰", layout="wide")

# ---- Encabezado ----
st.markdown(
    f"<div style='background:#0f172a;border-top:6px solid {YEL};padding:18px 22px;border-radius:10px'>"
    f"<div style='color:{YEL};font:800 12px/1 Arial;letter-spacing:2px'>EXCELENCIA OPERACIONAL · MLM</div>"
    f"<div style='color:#fff;font:800 26px/1.2 Arial;margin-top:6px'>Boletín OE — Motor</div>"
    f"<div style='color:#cbd5e1;font:400 13px/1 Arial;margin-top:4px'>Genera los 3 boletines desde el Sheet/Excel</div>"
    f"</div>", unsafe_allow_html=True)
st.write("")

# ---- Entrada de datos ----
c1, c2 = st.columns([2, 1])
with c1:
    uploaded = st.file_uploader("Archivo de datos (.xlsx exportado del Sheet)", type=["xlsx"])
with c2:
    st.write(""); st.write("")
    usar_ejemplo = st.toggle("Usar datos de ejemplo", value=(uploaded is None))

mes_manual = st.text_input("Mes (opcional; vacío = detecta el más frecuente)", value="")

# ---- Generar ----
if st.button("⚙  Generar boletines", type="primary", use_container_width=True):
    src = uploaded if (uploaded is not None and not usar_ejemplo) else os.path.join(HERE, "sample", "datos_ejemplo.xlsx")
    if uploaded is not None and not usar_ejemplo:
        src = uploaded
    try:
        htmls, mes = engine.generate(src, mes=(mes_manual or None), template_dir=HERE)
        if not htmls:
            st.warning("No encontré áreas en los datos. Revisa la columna 'Área'.")
        else:
            st.success(f"Generados {len(htmls)} boletines · Mes: {mes}")
            tabs = st.tabs(list(htmls.keys()))
            for tab, (area, html) in zip(tabs, htmls.items()):
                with tab:
                    kb = len(html.encode("utf-8")) / 1024
                    estado = "✅ OK (<102 KB)" if kb < 102 else "⚠️ pesado (>102 KB)"
                    st.caption(f"Peso: {kb:.1f} KB · {estado}")
                    st.download_button("⬇  Descargar HTML", data=html,
                                       file_name=f"boletin_{slug(area)}.html",
                                       mime="text/html", use_container_width=True)
                    components.html(html, height=820, scrolling=True)
    except Exception as e:
        st.error(f"Error al generar: {e}")

st.divider()
st.caption("Sprint 1 · MVP — Fase 1 (sin permisos). Fase 2: lectura del Sheet en vivo + guardado en Drive.")
