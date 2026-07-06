# -*- coding: utf-8 -*-
"""Motor del Boletín OE — usa el FINAL de cada área como plantilla (idéntico).
Solo la TABLA DE PROYECTOS se llena desde el Sheet; directorio, fotos, imágenes
y diseño quedan 'baked' en cada template_{area}.html (se editan en el código).
CLI:  python engine.py sample/datos_ejemplo.xlsx salida/
"""
import sys, os, re, unicodedata
import pandas as pd

PILL={"on track":("#f0fdf4","#16a34a"),"en proceso":("#fffbeb","#d97706"),
      "planeado":("#eff6ff","#111111"),"en riesgo":("#fef2f2","#dc2626"),"discovery":("#f1f5f9","#64748b")}
# Área -> (plantilla, generador de filas). Quality no tiene tabla (None) -> baked.
AREA_TPL={"first mile":"template_fm.html","service center":"template_svc.html","quality":"template_quality.html"}

def _norm(s):
    s=str(s or "").strip().lower()
    return "".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn")
def _s(v): return "" if v is None or (isinstance(v,float) and pd.isna(v)) else str(v).strip()
def find_col(df,*kw):
    for c in df.columns:
        n=_norm(c)
        if all(k in n for k in kw): return c
    return None

def _fm_rows(proys):
    out=""
    for p in proys:
        bg,fg=PILL.get(_norm(p["estado"]),("#fffbeb","#d97706")); av=p["avance"]
        link=('<a href="%s" style="font:700 11px/1.3 \'proxima-nova\',Arial,sans-serif;color:#111111;text-decoration:none" target="_blank"><span style="color:#111111;text-decoration:none">%s</span></a>'%(p["enlace"],p["proyecto"])) if (p["enlace"] and p["enlace"]!="-") else ('<span style="font:700 11px/1.3 \'proxima-nova\',Arial,sans-serif;color:#111111">%s</span>'%p["proyecto"])
        out+=('<tr class="x5"><td class="x6"><div class="x7"><div class="x8">'
          '<div style="width:%s%%;height:100%%;background:#FFE600;border-radius:3px"></div></div>'
          '<span class="x9">%s%%</span><span style="font:800 8px/1 \'proxima-nova\',Arial,sans-serif;'
          'letter-spacing:1px;text-transform:uppercase;background:%s;color:%s;padding:2px 7px;border-radius:2px;'
          'white-space:nowrap">%s</span></div>%s</td><td class="x10">%s</td>'
          '<td class="x0"><span style="display:inline-block;width:7px;height:7px;border-radius:50%%;background:#FFE600;'
          'margin-right:4px;vertical-align:middle;flex-shrink:0"></span>%s%% &#183; %s<br/>'
          '<span style="font-size:10px;color:#888">%s</span></td><td class="x11">%s</td><td class="x0">%s</td></tr>')%(
          av,av,bg,fg,p["estado"],link,p.get("sub",""),av,p["estado"],p["contexto"],p["stopper"] or "&#8212;",p["siguiente"] or "&#8212;")
    return out

def _svc_rows(proys):
    out=""
    for p in proys:
        bg,fg=PILL.get(_norm(p["estado"]),("#fffbeb","#d97706")); av=p["avance"]
        link=('<a class="x9" href="%s" target="_blank" style="color:#111111;text-decoration:none"><span style="color:#111111;text-decoration:none">%s</span></a>'%(p["enlace"],p["proyecto"])) if (p["enlace"] and p["enlace"]!="-") else ('<span style="font:700 12px/1.3 Arial,sans-serif;color:#111111">%s</span>'%p["proyecto"])
        out+=('<tr class="x1"><td class="x2"><div class="x3"><div class="pbw"><div class="pb pg" style="width:%s%%;"></div></div>'
          '<span class="pp">%s%%</span><span class="x10" style="background:%s;color:%s">%s</span></div>%s</td><td class="x4">%s</td>'
          '<td class="x0">%s%% &#183; %s<br/><span style="font-size:10px;color:#888;">%s</span></td>'
          '<td class="x5">%s</td><td class="x0">%s</td></tr>')%(
          av,av,bg,fg,p["estado"],link,p.get("sub",""),av,p["estado"],p["contexto"],p["stopper"] or "&#8212;",p["siguiente"] or "&#8212;")
    return out

ROWGEN={"first mile":_fm_rows,"service center":_svc_rows}

def _load(path):
    xls=pd.read_excel(path,sheet_name=None,dtype=str)
    data={_norm(n):df.fillna("") for n,df in xls.items()}
    for k in ("respuestas","form responses 1","respuestas de formulario 1","hoja1","proyectos"):
        if k in data: return data[k]
    return list(data.values())[0]

def _proys(resp, area, mes):
    cA=find_col(resp,"area"); cM=find_col(resp,"mes"); cP=find_col(resp,"proyecto")
    df=resp
    if cA: df=df[df[cA].map(_norm)==_norm(area)]
    if cM and mes: df=df[df[cM].map(_norm)==_norm(mes)]
    g=lambda r,*k: (_s(r[find_col(resp,*k)]) if find_col(resp,*k) is not None else "")
    out=[]
    for _,r in df.iterrows():
        proj=_s(r[cP]) if cP is not None else ""
        if not proj: continue
        out.append({"proyecto":proj,"avance":g(r,"avance") or "0","estado":g(r,"estado"),
            "contexto":g(r,"contexto"),"stopper":g(r,"stopper"),"siguiente":g(r,"siguiente"),"enlace":g(r,"enlace")})
    return out

def generate(path, mes=None, template_dir="."):
    resp=_load(path)
    cA=find_col(resp,"area"); cM=find_col(resp,"mes")
    if mes is None and cM is not None:
        vals=[v for v in resp[cM].map(_s) if v]; mes=max(set(vals),key=vals.count) if vals else ""
    areas=[]
    if cA is not None:
        for v in resp[cA].map(_s):
            if v and v not in areas: areas.append(v)
    out={}
    for area in areas:
        key=_norm(area); tf=AREA_TPL.get(key)
        if not tf: continue
        tpl=open(os.path.join(template_dir,tf),encoding="utf-8").read()
        if key in ROWGEN and "@@PROYECTOS@@" in tpl:
            tpl=tpl.replace("@@PROYECTOS@@", ROWGEN[key](_proys(resp,area,mes)))
        out[area]=tpl.encode("ascii","xmlcharrefreplace").decode("ascii")
    return out, mes

if __name__=="__main__":
    src=sys.argv[1] if len(sys.argv)>1 else "sample/datos_ejemplo.xlsx"
    dst=sys.argv[2] if len(sys.argv)>2 else "salida"
    os.makedirs(dst,exist_ok=True)
    htmls,mes=generate(src,template_dir=os.path.dirname(os.path.abspath(__file__)))
    for area,html in htmls.items():
        kb=round(len(html.encode())/1024,1); safe=re.sub(r"[^a-z0-9]+","_",_norm(area)).strip("_")
        open(os.path.join(dst,"boletin_%s.html"%safe),"w",encoding="utf-8").write(html)
        print("OK %-16s %s KB (<102:%s)"%(area,kb,kb<102))
    print("Mes:",mes,"| Areas:",len(htmls))
