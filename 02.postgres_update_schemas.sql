DROP SCHEMA IF EXISTS "SGP-TEST" CASCADE; 
CREATE SCHEMA "SGP-TEST";
IMPORT FOREIGN SCHEMA sistema_test FROM SERVER mysql_sgp
INTO "SGP-TEST"
OPTIONS (import_default 'true');

DROP SCHEMA IF EXISTS "SGP-DEV" CASCADE; 
CREATE SCHEMA "SGP-DEV";
IMPORT FOREIGN SCHEMA sistema_dev FROM SERVER mysql_sgp
INTO "SGP-DEV"
OPTIONS (import_default 'true');

DROP SCHEMA IF EXISTS "SGP-PROD" CASCADE; 
CREATE SCHEMA "SGP-PROD";
IMPORT FOREIGN SCHEMA sistema FROM SERVER mysql_sgp
INTO "SGP-PROD"
OPTIONS (import_default 'true');

DROP SCHEMA IF EXISTS "SGP-PROD-SISTEMA" CASCADE; 
CREATE SCHEMA "SGP-PROD-SISTEMA";
IMPORT FOREIGN SCHEMA sistema FROM SERVER mysql_sgp_sistema
INTO "SGP-PROD-SISTEMA"
OPTIONS (import_default 'true');


DROP MATERIALIZED VIEW IF EXISTS public.mv_bobines;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_bobines
TABLESPACE pg_default
AS
 SELECT pb.id,
    pb.nome,
    pb.estado,
    pb.palete_id,
	pb.comp,
	pb.comp_actual,
	pla.largura,
    pl.nome AS palete_nome
   FROM "SGP-PROD".producao_bobine pb
   JOIN "SGP-PROD".producao_largura pla ON pla.id=pb.largura_id 
   LEFT JOIN "SGP-PROD".producao_palete pl ON pl.id = pb.palete_id
   
WITH DATA;

ALTER TABLE IF EXISTS public.mv_bobines
    OWNER TO postgres;


CREATE UNIQUE INDEX "IDX_UQ_MV_BOBINES_ID"
    ON public.mv_bobines USING btree
    (id)
    TABLESPACE pg_default;

DROP MATERIALIZED VIEW IF EXISTS public.mv_consumo_granulado;
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_consumo_granulado
TABLESPACE pg_default
AS
 SELECT consumos_granulado.id,
    consumos_granulado.cuba,
    consumos_granulado.doser,
    consumos_granulado.matprima_cod,
    consumos_granulado.matprima_des,
    consumos_granulado.n_lote,
    consumos_granulado.vcr_num,
    consumos_granulado.qty_lote,
    consumos_granulado.qty_consumed,
    consumos_granulado.shared,
    consumos_granulado.data_entrada_lote,
    consumos_granulado.data_saida_lote,
    consumos_granulado.ig_id,
    consumos_granulado.audit_cs_id,
    consumos_granulado.agg_of_id,
    consumos_granulado.arranque,
    consumos_granulado.status,
    consumos_granulado.ofs
   FROM "SGP-PROD".consumos_granulado
WITH DATA;
ALTER TABLE IF EXISTS public.mv_consumo_granulado
    OWNER TO postgres;


DROP MATERIALIZED VIEW IF EXISTS public.mv_ofabrico_list;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_ofabrico_list
TABLESPACE pg_default
AS
 SELECT DISTINCT ON (t.ofabrico, t.iorder) t.ofabrico,
    t.prf,
    t.data_encomenda,
    t.rowid,
    t.ofabrico_status,
    t.start_date,
    t.end_date,
    t.qty_prevista,
    t.qty_realizada,
    t.ofabrico_sgp,
    t.ofabrico_sgp_nome,
    t.paletes_produzir_sgp,
    t.paletes_stock_sgp,
    t.paletes_total_sgp,
    t.retrabalho_sgp,
    t.ativa_sgp,
    t.completa_sgp,
    t.ordem_original_stock,
    t.num_bobines,
    t.item,
    t.item_nome,
    t.bom_alt,
    t.qty_item,
    t.iorder,
    t.cliente_cod,
    t.cliente_nome,
    t.n_bobines_atual,
    t.matricula,
    t.matricula_reboque,
    t.modo_exp,
    count(*) FILTER (WHERE t.ordem_original_stock = 0 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_produzidas,
    count(*) FILTER (WHERE t.ordem_original_stock = 1 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_stock_in,
    count(*) OVER w AS n_paletes_total
   FROM ( SELECT DISTINCT ON (ofh."MFGNUM_0", ofitm."MFGLIN_0", pp.id) ofh."MFGNUM_0" AS ofabrico,
            oforder."PRFNUM_0" AS prf,
            oforder."ORDDAT_0" AS data_encomenda,
            ofh."ROWID" AS rowid,
            ofh."MFGTRKFLG_0" AS ofabrico_status,
            ofh."STRDAT_0" AS start_date,
            ofh."ENDDAT_0" AS end_date,
            ofh."EXTQTY_0" AS qty_prevista,
            ofh."CPLQTY_0" AS qty_realizada,
            dl."LICPLATE_0" AS matricula,
            dl."TRLLICPLATE_0" AS matricula_reboque,
            dl."MDL_0" AS modo_exp,
            pop.id AS ofabrico_sgp,
            pop.op AS ofabrico_sgp_nome,
            pop.num_paletes_produzir AS paletes_produzir_sgp,
            pop.num_paletes_stock AS paletes_stock_sgp,
            pop.num_paletes_total AS paletes_total_sgp,
            pop.retrabalho AS retrabalho_sgp,
            pop.ativa AS ativa_sgp,
            pop.completa AS completa_sgp,
            pp.ordem_original_stock,
            pp.num_bobines,
            ofitm."ITMREF_0" AS item,
            itmsales."ITMDES1_0" AS item_nome,
            ofitm."BOMALT_0" AS bom_alt,
            ofitm."UOMEXTQTY_0" AS qty_item,
                CASE
                    WHEN length(ofitm."VCRNUMORI_0"::text) = 1 THEN pop.enccod
                    ELSE ofitm."VCRNUMORI_0"
                END AS iorder,
                CASE
                    WHEN oforder."BPCORD_0" IS NULL THEN pop.clientecod
                    ELSE oforder."BPCORD_0"
                END AS cliente_cod,
                CASE
                    WHEN oforder."BPCNAM_0" IS NULL THEN pop.clientenome
                    ELSE oforder."BPCNAM_0"
                END AS cliente_nome,
            pp.num_bobines_act AS n_bobines_atual
           FROM "SAGE-PROD"."MFGHEAD" ofh
             LEFT JOIN "SAGE-PROD"."MFGITM" ofitm ON ofitm."MFGNUM_0"::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SAGE-PROD"."SORDER" oforder ON oforder."SOHNUM_0"::text = ofitm."VCRNUMORI_0"::text
             LEFT JOIN "SAGE-PROD"."ITMSALES" itmsales ON itmsales."ITMREF_0"::text = ofitm."ITMREF_0"::text
             LEFT JOIN "SAGE-PROD"."SDELIVERY" dl ON dl."SDHNUM_0"::text = oforder."LASDLVNUM_0"::text
             LEFT JOIN "SGP-PROD".planeamento_ordemproducao pop ON pop.ofid::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SGP-PROD".producao_palete pp ON pp.ordem_id = pop.id AND pp.nome IS NOT NULL) t
  WINDOW w AS (PARTITION BY t.ofabrico, t.ofabrico_sgp, t.iorder)
WITH DATA;














ALTER TABLE IF EXISTS public.mv_ofabrico_list
    OWNER TO postgres;


DROP MATERIALIZED VIEW IF EXISTS public.mv_ofabrico_sage_list;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_ofabrico_sage_list
TABLESPACE pg_default
AS
 SELECT DISTINCT ON (ofh."MFGNUM_0", ofitm."MFGLIN_0") ofh."MFGNUM_0" AS ofabrico,
    oforder."PRFNUM_0" AS prf,
    oforder."ORDDAT_0" AS data_encomenda,
    ofh."ROWID" AS rowid,
    ofh."MFGTRKFLG_0" AS ofabrico_status,
    ofh."STRDAT_0" AS start_date,
    ofh."ENDDAT_0" AS end_date,
    ofh."EXTQTY_0" AS qty_prevista,
    ofh."CPLQTY_0" AS qty_realizada,
    ofitm."ITMREF_0" AS item,
    itmsales."ITMDES1_0" AS item_nome,
    ofitm."BOMALT_0" AS bom_alt,
    ofitm."VCRNUMORI_0" AS iorder
   FROM "SAGE-PROD"."MFGHEAD" ofh
     LEFT JOIN "SAGE-PROD"."MFGITM" ofitm ON ofitm."MFGNUM_0"::text = ofh."MFGNUM_0"::text
     LEFT JOIN "SAGE-PROD"."SORDER" oforder ON oforder."SOHNUM_0"::text = ofitm."VCRNUMORI_0"::text
     LEFT JOIN "SAGE-PROD"."ITMSALES" itmsales ON itmsales."ITMREF_0"::text = ofitm."ITMREF_0"::text
WITH DATA;

ALTER TABLE IF EXISTS public.mv_ofabrico_sage_list
    OWNER TO postgres;








DROP MATERIALIZED VIEW IF EXISTS public.mv_ofabrico_list_dev;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_ofabrico_list_dev
TABLESPACE pg_default
AS
 SELECT DISTINCT ON (t.ofabrico, t.iorder) t.ofabrico,
    t.prf,
    t.data_encomenda,
    t.rowid,
    t.ofabrico_status,
    t.start_date,
    t.end_date,
    t.qty_prevista,
    t.qty_realizada,
    t.ofabrico_sgp,
    t.ofabrico_sgp_nome,
    t.paletes_produzir_sgp,
    t.paletes_stock_sgp,
    t.paletes_total_sgp,
    t.retrabalho_sgp,
    t.ativa_sgp,
    t.completa_sgp,
    t.ordem_original_stock,
    t.num_bobines,
    t.item,
    t.item_nome,
    t.bom_alt,
    t.qty_item,
    t.iorder,
    t.cliente_cod,
    t.cliente_nome,
    t.n_bobines_atual,
    t.matricula,
    t.matricula_reboque,
    t.modo_exp,
    count(*) FILTER (WHERE t.ordem_original_stock = 0 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_produzidas,
    count(*) FILTER (WHERE t.ordem_original_stock = 1 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_stock_in,
    count(*) OVER w AS n_paletes_total
   FROM ( SELECT DISTINCT ON (ofh."MFGNUM_0", ofitm."MFGLIN_0", pp.id) ofh."MFGNUM_0" AS ofabrico,
            oforder."PRFNUM_0" AS prf,
            oforder."ORDDAT_0" AS data_encomenda,
            ofh."ROWID" AS rowid,
            ofh."MFGTRKFLG_0" AS ofabrico_status,
            ofh."STRDAT_0" AS start_date,
            ofh."ENDDAT_0" AS end_date,
            ofh."EXTQTY_0" AS qty_prevista,
            ofh."CPLQTY_0" AS qty_realizada,
            dl."LICPLATE_0" AS matricula,
            dl."TRLLICPLATE_0" AS matricula_reboque,
            dl."MDL_0" AS modo_exp,
            pop.id AS ofabrico_sgp,
            pop.op AS ofabrico_sgp_nome,
            pop.num_paletes_produzir AS paletes_produzir_sgp,
            pop.num_paletes_stock AS paletes_stock_sgp,
            pop.num_paletes_total AS paletes_total_sgp,
            pop.retrabalho AS retrabalho_sgp,
            pop.ativa AS ativa_sgp,
            pop.completa AS completa_sgp,
            pp.ordem_original_stock,
            pp.num_bobines,
            ofitm."ITMREF_0" AS item,
            itmsales."ITMDES1_0" AS item_nome,
            ofitm."BOMALT_0" AS bom_alt,
            ofitm."UOMEXTQTY_0" AS qty_item,
                CASE
                    WHEN length(ofitm."VCRNUMORI_0"::text) = 1 THEN pop.enccod
                    ELSE ofitm."VCRNUMORI_0"
                END AS iorder,
                CASE
                    WHEN oforder."BPCORD_0" IS NULL THEN pop.clientecod
                    ELSE oforder."BPCORD_0"
                END AS cliente_cod,
                CASE
                    WHEN oforder."BPCNAM_0" IS NULL THEN pop.clientenome
                    ELSE oforder."BPCNAM_0"
                END AS cliente_nome,
            pp.num_bobines_act AS n_bobines_atual
           FROM "SAGE-PROD"."MFGHEAD" ofh
             LEFT JOIN "SAGE-PROD"."MFGITM" ofitm ON ofitm."MFGNUM_0"::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SAGE-PROD"."SORDER" oforder ON oforder."SOHNUM_0"::text = ofitm."VCRNUMORI_0"::text
             LEFT JOIN "SAGE-PROD"."ITMSALES" itmsales ON itmsales."ITMREF_0"::text = ofitm."ITMREF_0"::text
             LEFT JOIN "SAGE-PROD"."SDELIVERY" dl ON dl."SDHNUM_0"::text = oforder."LASDLVNUM_0"::text
             LEFT JOIN "SGP-DEV".planeamento_ordemproducao pop ON pop.ofid::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SGP-DEV".producao_palete pp ON pp.ordem_id = pop.id AND pp.nome IS NOT NULL) t
  WINDOW w AS (PARTITION BY t.ofabrico, t.ofabrico_sgp, t.iorder)
WITH DATA;

ALTER TABLE IF EXISTS public.mv_ofabrico_list_dev
    OWNER TO postgres;


DROP MATERIALIZED VIEW IF EXISTS public.mv_ofabrico_list_test;

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_ofabrico_list_test
TABLESPACE pg_default
AS
 SELECT DISTINCT ON (t.ofabrico, t.iorder) t.ofabrico,
    t.prf,
    t.data_encomenda,
    t.rowid,
    t.ofabrico_status,
    t.start_date,
    t.end_date,
    t.qty_prevista,
    t.qty_realizada,
    t.ofabrico_sgp,
    t.ofabrico_sgp_nome,
    t.paletes_produzir_sgp,
    t.paletes_stock_sgp,
    t.paletes_total_sgp,
    t.retrabalho_sgp,
    t.ativa_sgp,
    t.completa_sgp,
    t.ordem_original_stock,
    t.num_bobines,
    t.item,
    t.item_nome,
    t.bom_alt,
    t.qty_item,
    t.iorder,
    t.cliente_cod,
    t.cliente_nome,
    t.n_bobines_atual,
    t.matricula,
    t.matricula_reboque,
    t.modo_exp,
    count(*) FILTER (WHERE t.ordem_original_stock = 0 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_produzidas,
    count(*) FILTER (WHERE t.ordem_original_stock = 1 AND NOT t.num_bobines > t.n_bobines_atual) OVER w AS n_paletes_stock_in,
    count(*) OVER w AS n_paletes_total
   FROM ( SELECT DISTINCT ON (ofh."MFGNUM_0", ofitm."MFGLIN_0", pp.id) ofh."MFGNUM_0" AS ofabrico,
            oforder."PRFNUM_0" AS prf,
            oforder."ORDDAT_0" AS data_encomenda,
            ofh."ROWID" AS rowid,
            ofh."MFGTRKFLG_0" AS ofabrico_status,
            ofh."STRDAT_0" AS start_date,
            ofh."ENDDAT_0" AS end_date,
            ofh."EXTQTY_0" AS qty_prevista,
            ofh."CPLQTY_0" AS qty_realizada,
            pop.id AS ofabrico_sgp,
            pop.op AS ofabrico_sgp_nome,
            pop.num_paletes_produzir AS paletes_produzir_sgp,
            pop.num_paletes_stock AS paletes_stock_sgp,
            pop.num_paletes_total AS paletes_total_sgp,
            pop.retrabalho AS retrabalho_sgp,
            pop.ativa AS ativa_sgp,
            pop.completa AS completa_sgp,
            pp.ordem_original_stock,
            pp.num_bobines,
            dl."LICPLATE_0" AS matricula,
            dl."TRLLICPLATE_0" AS matricula_reboque,
            dl."MDL_0" AS modo_exp,
            ofitm."ITMREF_0" AS item,
            itmsales."ITMDES1_0" AS item_nome,
            ofitm."BOMALT_0" AS bom_alt,
            ofitm."UOMEXTQTY_0" AS qty_item,
                CASE
                    WHEN length(ofitm."VCRNUMORI_0"::text) = 1 THEN pop.enccod
                    ELSE ofitm."VCRNUMORI_0"
                END AS iorder,
                CASE
                    WHEN oforder."BPCORD_0" IS NULL THEN pop.clientecod
                    ELSE oforder."BPCORD_0"
                END AS cliente_cod,
                CASE
                    WHEN oforder."BPCNAM_0" IS NULL THEN pop.clientenome
                    ELSE oforder."BPCNAM_0"
                END AS cliente_nome,
            pp.num_bobines_act AS n_bobines_atual
           FROM "SAGE-PROD"."MFGHEAD" ofh
             LEFT JOIN "SAGE-PROD"."MFGITM" ofitm ON ofitm."MFGNUM_0"::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SAGE-PROD"."SORDER" oforder ON oforder."SOHNUM_0"::text = ofitm."VCRNUMORI_0"::text
             LEFT JOIN "SAGE-PROD"."ITMSALES" itmsales ON itmsales."ITMREF_0"::text = ofitm."ITMREF_0"::text
             LEFT JOIN "SAGE-PROD"."SDELIVERY" dl ON dl."SDHNUM_0"::text = oforder."LASDLVNUM_0"::text
             LEFT JOIN "SGP-TEST".planeamento_ordemproducao pop ON pop.ofid::text = ofh."MFGNUM_0"::text
             LEFT JOIN "SGP-TEST".producao_palete pp ON pp.ordem_id = pop.id AND pp.nome IS NOT NULL) t
  WINDOW w AS (PARTITION BY t.ofabrico, t.ofabrico_sgp, t.iorder)
WITH DATA;

ALTER TABLE IF EXISTS public.mv_ofabrico_list_test
    OWNER TO postgres;




