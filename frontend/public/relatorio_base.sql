/* ===========================================================================================
   RELATÓRIO DE ANÁLISE SQL
   Objetivo: Responder às perguntas A até E conforme solicitado no teste, 
   utilizando consultas em PostgreSQL com comentários explicativos.
   =========================================================================================== */



-- ===========================================================================================
-- PERGUNTA A
-- Objetivo: Calcular o total de reservas, receita, custo e margem (Receita - Custo) por mês.
-- ===========================================================================================

SELECT
    TO_CHAR(dt_reserva, 'MM-YYYY') AS mes,              -- Converte a data para formato mês/ano.
    COUNT(id_reserva) AS total_reservas,                -- Conta o total de reservas realizadas no mês.
    
    CONCAT('R$ ', TO_CHAR(
        SUM(COALESCE(receita, 0)), 
        'FM999G999G990D00'
    )) AS receita_total,                                -- Soma a receita total do mês e formata como valor monetário.
    
    CONCAT('R$ ', TO_CHAR(
        SUM(COALESCE(custo, 0)), 
        'FM999G999G990D00'
    )) AS custo_total,                                  -- Soma o custo total do mês com formatação.
    
    CONCAT('R$ ', TO_CHAR(
        SUM(COALESCE(receita, 0) - COALESCE(custo, 0)), 
        'FM999G999G990D00'
    )) AS margem_total                                  -- Calcula a margem total (receita - custo) do mês.
    
FROM
    reservas
GROUP BY
    mes
ORDER BY
    mes;

-- Comentário: Esta consulta gera a visão mensal consolidada de performance financeira.



-- ===========================================================================================
-- PERGUNTA B
-- Objetivo: Listar os 5 destinos com maior margem média, considerando apenas destinos com 
-- pelo menos 10 reservas válidas.
-- ===========================================================================================

WITH ranking_margem AS (
    SELECT
        destino,
        COUNT(id_reserva) AS total_reservas,                                -- Conta o total de reservas por destino.
        AVG(COALESCE(receita, 0) - COALESCE(custo, 0)) AS margem_media_num  -- Calcula a média da margem por destino.
    FROM
        reservas
    GROUP BY
        destino
    HAVING
        COUNT(id_reserva) >= 10                                             -- Filtra apenas destinos com 10 ou mais reservas.
    ORDER BY
        margem_media_num DESC
    LIMIT 5                                                                 -- Seleciona os 5 com maior margem média.
)

SELECT
    destino,
    total_reservas,
    CONCAT('R$ ', TO_CHAR(
        margem_media_num,
        'FM999G999G990D00'
    )) AS margem_media                                                     -- Formata o resultado final da margem média.
FROM
    ranking_margem;

-- Comentário: Identifica os destinos mais lucrativos com base em volume mínimo e margem média.



-- ===========================================================================================
-- PERGUNTA C
-- Objetivo: Calcular a receita total e a participação percentual por tipo de cliente 
-- e canal de venda (com padronização do canal online).
-- ===========================================================================================

WITH vendas_agrupadas AS (
    SELECT
        c.tipo_cliente,
        CASE 
            WHEN LOWER(r.canal_venda) IN ('online', 'on-line') THEN 'Online'  -- Padroniza nome do canal.
            ELSE r.canal_venda
        END AS canal_venda_padronizado,
        SUM(COALESCE(r.receita, 0)) AS receita_total_num                      -- Soma a receita por grupo.
    FROM
        reservas r
    JOIN
        clientes c ON r.cliente = c.cliente
    GROUP BY
        c.tipo_cliente, canal_venda_padronizado
),

calculos_percentuais AS (
    SELECT
        tipo_cliente,
        canal_venda_padronizado,
        receita_total_num,
        (receita_total_num / SUM(receita_total_num) OVER ()) * 100 AS participacao_percentual_num  -- Calcula % de participação.
    FROM
        vendas_agrupadas
    ORDER BY
        tipo_cliente, receita_total_num DESC
)

SELECT
    tipo_cliente,
    canal_venda_padronizado,
    
    CONCAT('R$ ', TO_CHAR(
        receita_total_num,
        'FM999G999G990D00'
    )) AS receita_total,
    
    CONCAT(
        TO_CHAR(participacao_percentual_num, 'FM990D00'),
        '%'
    ) AS participacao_percentual
    
FROM
    calculos_percentuais;

-- Comentário: Mostra o peso relativo de cada tipo de cliente e canal de venda no faturamento.



-- ===========================================================================================
-- PERGUNTA D
-- Objetivo: Identificar clientes com aumento de receita superior a 20% 
-- entre o 1º (H1) e o 2º (H2) semestre de 2024.
-- ===========================================================================================

WITH receita_semestral AS (
    SELECT
        cliente,
        CASE 
            WHEN EXTRACT(MONTH FROM dt_reserva) <= 6 THEN 'H1'
            ELSE 'H2'
        END AS semestre,                                    -- Classifica reservas por semestre.
        SUM(COALESCE(receita, 0)) AS receita_total          -- Soma a receita por cliente e semestre.
    FROM
        reservas
    WHERE
        EXTRACT(YEAR FROM dt_reserva) = 2024                -- Considera apenas reservas de 2024.
    GROUP BY
        cliente, semestre
),
receita_pivotada AS (
    SELECT
        cliente,
        SUM(CASE WHEN semestre = 'H1' THEN receita_total ELSE 0 END) AS receita_h1_num,
        SUM(CASE WHEN semestre = 'H2' THEN receita_total ELSE 0 END) AS receita_h2_num
    FROM
        receita_semestral
    GROUP BY
        cliente
),
clientes_com_crescimento AS (
    SELECT
        cliente,
        receita_h1_num,
        receita_h2_num,
        ((receita_h2_num - receita_h1_num) / receita_h1_num) * 100 AS crescimento_percentual_num
    FROM
        receita_pivotada
    WHERE
        receita_h1_num > 0
        AND ((receita_h2_num - receita_h1_num) / receita_h1_num) > 0.20  -- Filtro para crescimento > 20%.
    ORDER BY
        crescimento_percentual_num DESC
)
SELECT
    cliente,
    CONCAT('R$ ', 
        REPLACE(
            REPLACE(
                TO_CHAR(receita_h1_num, 'FM999,999,990.00'), 
            ',', '.'), '.',
            ','
        )
    ) AS receita_h1,                                         -- Formata receita do 1º semestre.
    
    CONCAT('R$ ', 
        REPLACE(
            REPLACE(
                TO_CHAR(receita_h2_num, 'FM999,999,990.00'), 
            ',', '.'), '.',
            ','
        )
    ) AS receita_h2,                                         -- Formata receita do 2º semestre.
    
    CONCAT(
        REPLACE(
            TO_CHAR(crescimento_percentual_num, 'FM990.00'),
        '.', ','
        ),
        '%'
    ) AS crescimento_percentual
FROM
    clientes_com_crescimento;
    
-- Comentário:

   A consulta não retornou resultados porque os filtros são bem restritivos. 
   Ela considera apenas reservas feitas em 2024. Se não houver dados desse ano, 
   tudo fica vazio. 

   Além disso, o cálculo exige que o cliente tenha receita nos dois semestres 
   (H1 e H2) e que o crescimento do segundo sobre o primeiro seja maior que 20%. 
   Caso algum desses critérios não seja atendido, o cliente é excluído da análise.

   Em resumo: a query está certa — só não há clientes que se encaixem nesses parâmetros 
   dentro da base atual.

-- ===========================================================================================
-- PERGUNTA E
-- Objetivo: Criar um indicador de fidelidade ponderado que combina 
-- tempo de parceria, log do número de reservas e receita média.
-- ===========================================================================================

WITH raw_metrics AS (
    SELECT
        c.cliente,
        c.tipo_cliente,
        c."UF",
        c.tempo_parceria_anos,
        LOG(COUNT(r.id_reserva)) AS log_total_reservas,   -- Logaritmo do total de reservas (reduz impacto de grandes volumes).
        COALESCE(AVG(r.receita), 0) AS receita_media      -- Receita média por cliente.
    FROM
        clientes c
    LEFT JOIN
        reservas r ON c.cliente = r.cliente
    GROUP BY
        c.cliente, c.tipo_cliente, c."UF", c.tempo_parceria_anos
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
        "UF",
        COALESCE(
            (tempo_parceria_anos - min_parceria) / NULLIF((max_parceria - min_parceria)::float, 0),
            0
        ) AS norm_parceria,                                -- Normaliza tempo de parceria entre 0 e 1.
        COALESCE(
            (log_total_reservas - min_log_reservas) / NULLIF((max_log_reservas - min_log_reservas)::float, 0),
            0
        ) AS norm_log_reservas,                            -- Normaliza log de reservas.
        COALESCE(
            (receita_media - min_receita_media) / NULLIF((max_receita_media - min_receita_media)::float, 0),
            0
        ) AS norm_receita_media                            -- Normaliza receita média.
    FROM
        metrics_min_max
),

final_scores AS (
    SELECT
        n.cliente,
        n.tipo_cliente,
        n."UF",
        (
            (n.norm_parceria * 0.40) +                     -- Peso de 40% para tempo de parceria.
            (n.norm_log_reservas * 0.30) +                 -- Peso de 30% para log de reservas.
            (n.norm_receita_media * 0.30)                  -- Peso de 30% para receita média.
        ) * 100 AS score_fidelidade_num
    FROM
        normalized_scores n
    ORDER BY
        score_fidelidade_num DESC
)

SELECT
    cliente,
    tipo_cliente,
    "UF",  
    CONCAT(
        TO_CHAR(score_fidelidade_num, 'FM990D00'),
        '%'
    ) AS score_fidelidade                                 -- Formata o score de fidelidade em percentual.
FROM
    final_scores;

-- Comentário: A métrica final classifica o nível de fidelidade dos clientes com base em múltiplos fatores combinados.
