import uvicorn
import pandas as pd
import io
import pathlib
from fastapi import FastAPI, Depends, UploadFile, File, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from datetime import datetime

from . import models, queries
from .database import engine, get_db, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema Viajante API",
    description="Backend para análise de dados da agência de viagens."
)

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_sql_report_text(db: Session) -> str:
    report_parts = []
    
    queries_map = {
        "a": ("Cálculo do total de reservas, receita, custo e margem por mês (Receita - Custo).", queries.RESERVAS_MENSAL_QUERY),
        "b": ("Lista os 5 destinos com maior margem média, considerando pelo menos 10 reservas válidas.", queries.TOP_MARGEM_QUERY),
        "c": ("Receita total e participação percentual por tipo de cliente e canal de venda.", queries.RECEITA_CANAL_QUERY),
        "d": ("Identificação dos clientes com aumento de receita superior a 20% entre o 1º e o 2º semestre de 2024.", queries.CRESCIMENTO_CLIENTES_QUERY),
        "e": ("Indicador de fidelidade que combina tempo de parceria, log(reservas) e receita média.", queries.FIDELIDADE_QUERY),
    }

    report_parts.append("-- Arquivo de Entrega: Respostas SQL para o Desafio Viajante")
    report_parts.append(f"-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_parts.append("--")

    for key, (justification, sql_query) in queries_map.items():
        report_parts.append(f"\n-- ===========================================================================================")
        report_parts.append(f"-- PERGUNTA {key.upper()}: {justification}")
        report_parts.append(f"-- ===========================================================================================")
        
        report_parts.append(f"\n{sql_query}\n")
        report_parts.append(f"-- COMENTÁRIO: A consulta acima calcula a resposta para a pergunta {key.upper()}.")
        
        try:
            results = db.execute(text(sql_query)).mappings().all()
            report_parts.append(f"\n-- RESULTADO (Primeiras 15 linhas):\n")
            
            if results:
                headers = list(results[0].keys())
                col_widths = {h: max(len(h), 20) for h in headers}
                
                header_line = " | ".join([h.ljust(col_widths[h]) for h in headers])
                report_parts.append(f"-- {header_line}")
                report_parts.append("-- " + "-" * len(header_line))

                for row in results[:15]:
                    row_data = []
                    for header in headers:
                        value = row[header]
                        formatted_value = ""
                        
                        if isinstance(value, (int, float)):
                            formatted_value = f"{value:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
                        else:
                            formatted_value = str(value)
                            
                        row_data.append(formatted_value.ljust(col_widths[header]))
                    report_parts.append("-- " + " | ".join(row_data))
            else:
                report_parts.append("-- NENHUM RESULTADO ENCONTRADO.")
                
        except Exception as e:
             report_parts.append(f"\n-- ERRO AO EXECUTAR CONSULTA: {str(e)}")

    return "\n".join(report_parts)


@app.get("/reservas/mensal")
def get_reservas_mensal(db: Session = Depends(get_db)):
    result = db.execute(text(queries.RESERVAS_MENSAL_QUERY)).mappings().all()
    return result

@app.get("/destinos/top-margem")
def get_top_destinos_margem(db: Session = Depends(get_db)):
    result = db.execute(text(queries.TOP_MARGEM_QUERY)).mappings().all()
    return result

@app.get("/destinos/rentabilidade")
def get_destinos_rentabilidade(db: Session = Depends(get_db)):
    result = db.execute(text(queries.RENTABILIDADE_DESTINOS_QUERY)).mappings().all()
    return result

@app.get("/clientes/receita_canal")
def get_receita_cliente_canal(db: Session = Depends(get_db)):
    result = db.execute(text(queries.RECEITA_CANAL_QUERY)).mappings().all()
    return result

@app.get("/clientes/crescimento")
def get_clientes_crescimento(db: Session = Depends(get_db)):
    result = db.execute(text(queries.CRESCIMENTO_CLIENTES_QUERY)).mappings().all()
    return result

@app.get("/clientes/fidelidade")
def get_clientes_fidelidade(db: Session = Depends(get_db)):
    result = db.execute(text(queries.FIDELIDADE_QUERY)).mappings().all()
    return result

@app.get("/reservas/listar")
def get_reservas_listar(
    db: Session = Depends(get_db),
    mes: Optional[str] = Query(None, alias="mes"),
    cliente_nome: Optional[str] = Query(None, alias="cliente"),
    destino_nome: Optional[str] = Query(None, alias="destino"),
    canal: Optional[str] = Query(None),
    uf: Optional[str] = Query(None)
):
    query = db.query(models.Reserva).join(models.Cliente, models.Reserva.cliente == models.Cliente.cliente)

    if mes:
        try:
            ano, mes_num = map(int, mes.split('-'))
            query = query.filter(
                text("EXTRACT(YEAR FROM reservas.dt_reserva) = :ano AND EXTRACT(MONTH FROM reservas.dt_reserva) = :mes_num")
            ).params(ano=ano, mes_num=mes_num)
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de mês inválido. Use YYYY-MM.")
    if cliente_nome:
        query = query.filter(models.Reserva.cliente == cliente_nome)
    if destino_nome:
        query = query.filter(models.Reserva.destino == destino_nome)
    if canal:
        canal_lower = canal.lower()
        if canal_lower == 'online':
             query = query.filter(text("LOWER(reservas.canal_venda) IN ('online', 'on-line')"))
        else:
            query = query.filter(models.Reserva.canal_venda == canal)
    if uf:
        query = query.filter(models.Cliente.uf == uf)
    
    return query.all()

@app.post("/importar")
async def importar_base(
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        dfs = pd.read_excel(io.BytesIO(content), sheet_name=None)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao ler o arquivo Excel. Verifique se é um .xlsx válido. Erro: {str(e)}")

    required_sheets = ['reservas', 'clientes', 'destinos']
    if not all(sheet in dfs for sheet in required_sheets):
        missing = [sheet for sheet in required_sheets if sheet not in dfs]
        raise HTTPException(status_code=400, detail=f"Arquivo Excel inválido. As abas obrigatórias não foram encontradas: {missing}")

    try:
        df_reservas = dfs['reservas']
        df_clientes = dfs['clientes']
        df_destinos = dfs['destinos']

        df_reservas['dt_embarque'] = pd.to_datetime(df_reservas['dt_embarque'], errors='coerce')
        df_reservas['dt_reserva'] = pd.to_datetime(df_reservas['dt_reserva'], errors='coerce')

        with engine.connect() as conn:
            df_reservas.to_sql('reservas', conn, if_exists='replace', index=False)
            df_clientes.to_sql('clientes', conn, if_exists='replace', index=False)
            df_destinos.to_sql('destinos', conn, if_exists='replace', index=False)
            conn.commit()

        return {
            "status": "sucesso",
            "arquivo": file.filename,
            "reservas_importadas": len(df_reservas),
            "clientes_importados": len(df_clientes),
            "destinos_importados": len(df_destinos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar e salvar os dados: {str(e)}")


@app.get("/generate/sql-report")
def generate_sql_report(db: Session = Depends(get_db)):
    sql_content = generate_sql_report_text(db)

    return Response(
        content=sql_content, 
        media_type="text/plain", 
        headers={
            "Content-Disposition": "attachment; filename=relatorio_sql_viajante.sql",
            "Content-Type": "text/plain; charset=utf-8"
        }
    )

BASE_DIR = pathlib.Path(__file__).resolve().parent.parent
PBIX_PATH = BASE_DIR / "static/Analise_Viajante.pbix"

@app.get("/download/dashboard_pbix")
def download_pbix_file():
    if not PBIX_PATH.exists():
        raise HTTPException(status_code=404, detail="Arquivo .pbix não encontrado no servidor.")
    
    return FileResponse(
        path=PBIX_PATH, 
        media_type='application/octet-stream', 
        filename='Analise_Viajante.pbix'
    )

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)