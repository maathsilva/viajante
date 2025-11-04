RESERVAS_MENSAL_QUERY = """
    SELECT
        TO_CHAR(dt_reserva, 'YYYY-MM') AS mes,
        COUNT(id_reserva) AS total_reservas,
        SUM(COALESCE(receita, 0)) AS receita_total,
        SUM(COALESCE(custo, 0)) AS custo_total,
        SUM(COALESCE(receita, 0) - COALESCE(custo, 0)) AS margem_total
    FROM
        reservas
    GROUP BY
        mes
    ORDER BY
        mes;
"""

TOP_MARGEM_QUERY = """
    SELECT
        destino,
        COUNT(id_reserva) AS total_reservas,
        AVG(COALESCE(receita, 0) - COALESCE(custo, 0)) AS margem_media
    FROM
        reservas
    GROUP BY
        destino
    HAVING
        COUNT(id_reserva) >= 10
    ORDER BY
        margem_media DESC
    LIMIT 5;
"""

RECEITA_CANAL_QUERY = """
    WITH vendas_agrupadas AS (
        SELECT
            c.tipo_cliente,
            CASE 
                WHEN LOWER(r.canal_venda) IN ('online', 'on-line') THEN 'Online'
                ELSE r.canal_venda
            END AS canal_venda_padronizado,
            SUM(COALESCE(r.receita, 0)) AS receita_total
        FROM
            reservas r
        JOIN
            clientes c ON r.cliente = c.cliente
        GROUP BY
            c.tipo_cliente, canal_venda_padronizado
    )
    SELECT
        tipo_cliente,
        canal_venda_padronizado,
        receita_total,
        (receita_total / SUM(receita_total) OVER ()) * 100 AS participacao_percentual
    FROM
        vendas_agrupadas
    ORDER BY
        tipo_cliente, receita_total DESC;
"""

CRESCIMENTO_CLIENTES_QUERY = """
    WITH receita_semestral AS (
        SELECT
            cliente,
            CASE 
                WHEN EXTRACT(MONTH FROM dt_reserva) <= 6 THEN 'H1'
                ELSE 'H2'
            END AS semestre,
            SUM(COALESCE(receita, 0)) AS receita_total
        FROM
            reservas
        WHERE
            EXTRACT(YEAR FROM dt_reserva) = 2024
        GROUP BY
            cliente, semestre
    ),
    receita_pivotada AS (
        SELECT
            cliente,
            SUM(CASE WHEN semestre = 'H1' THEN receita_total ELSE 0 END) AS receita_h1,
            SUM(CASE WHEN semestre = 'H2' THEN receita_total ELSE 0 END) AS receita_h2
        FROM
            receita_semestral
        GROUP BY
            cliente
    )
    SELECT
        cliente,
        receita_h1,
        receita_h2,
        ((receita_h2 - receita_h1) / receita_h1) * 100 AS crescimento_percentual
    FROM
        receita_pivotada
    WHERE
        receita_h1 > 0
        AND ((receita_h2 - receita_h1) / receita_h1) > 0.20
    ORDER BY
        crescimento_percentual DESC;
"""

FIDELIDADE_QUERY = """
    WITH raw_metrics AS (
        SELECT
            c.cliente,
            c.tipo_cliente,
            c.uf,
            c.tempo_parceria_anos,
            LOG(COUNT(r.id_reserva)) AS log_total_reservas,
            COALESCE(AVG(r.receita), 0) AS receita_media
        FROM
            clientes c
        LEFT JOIN
            reservas r ON c.cliente = r.cliente
        GROUP BY
            c.cliente, c.tipo_cliente, c.uf, c.tempo_parceria_anos
    ),
    metrics_min_max AS (
        SELECT
            *,
            MIN(tempo_parceria_anos) OVER() AS min_parceria,
            MAX(tempo_parceria_anos) OVER() AS max_parceria,
            MIN(log_total_reservas) OVER() AS min_log_reservas,
            MAX(log_total_reservas) OVER() AS max_log_reservas,
            MIN(receita_media) OVER() AS min_receita_media,
            MAX(receita_media) OVER() AS max_receita_media
        FROM
            raw_metrics
    ),
    normalized_scores AS (
        SELECT
            cliente,
            tipo_cliente,
            uf,
            COALESCE(
                (tempo_parceria_anos - min_parceria) / NULLIF((max_parceria - min_parceria)::float, 0),
                0
            ) AS norm_parceria,
            COALESCE(
                (log_total_reservas - min_log_reservas) / NULLIF((max_log_reservas - min_log_reservas)::float, 0),
                0
            ) AS norm_log_reservas,
            COALESCE(
                (receita_media - min_receita_media) / NULLIF((max_receita_media - min_receita_media)::float, 0),
                0
            ) AS norm_receita_media
        FROM
            metrics_min_max
    )
    SELECT
        n.cliente,
        n.tipo_cliente,
        n.uf,
        (
            (n.norm_parceria * 0.40) +
            (n.norm_log_reservas * 0.30) +
            (n.norm_receita_media * 0.30)
        ) * 100 AS score_fidelidade
    FROM
        normalized_scores n
    ORDER BY
        score_fidelidade DESC;
"""

RENTABILIDADE_DESTINOS_QUERY = """
    SELECT
        d.destino,
        d.pais,
        d.continente,
        AVG(COALESCE(r.receita, 0) - COALESCE(r.custo, 0)) AS margem_media
    FROM
        destinos d
    JOIN
        reservas r ON d.destino = r.destino
    GROUP BY
        d.destino, d.pais, d.continente
    HAVING
        COUNT(r.id_reserva) > 0
    ORDER BY
        margem_media DESC;
"""