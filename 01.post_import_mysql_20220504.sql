-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: 192.168.0.16    Database: sistema
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_producao_bobine`
--

DROP TABLE IF EXISTS `audit_producao_bobine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_producao_bobine` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bobine_id` int NOT NULL,
  `comp_actual` decimal(10,2) DEFAULT NULL,
  `nome` varchar(200) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `posicao_palete` int unsigned NOT NULL,
  `estado` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `con` tinyint(1) NOT NULL,
  `descen` tinyint(1) NOT NULL,
  `presa` tinyint(1) NOT NULL,
  `diam_insuf` tinyint(1) NOT NULL,
  `furos` tinyint(1) NOT NULL,
  `esp` tinyint(1) NOT NULL,
  `troca_nw` tinyint(1) NOT NULL,
  `outros` tinyint(1) NOT NULL,
  `buraco` tinyint(1) NOT NULL,
  `obs` longtext CHARACTER SET latin1 COLLATE latin1_bin,
  `bobinagem_id` int NOT NULL,
  `largura_id` int DEFAULT NULL,
  `palete_id` int DEFAULT NULL,
  `recycle` tinyint(1) NOT NULL,
  `destino` longtext CHARACTER SET latin1 COLLATE latin1_bin,
  `artigo_id` int DEFAULT NULL,
  `l_real` int DEFAULT NULL,
  `nok` tinyint(1) NOT NULL,
  `car` tinyint(1) NOT NULL,
  `fc` tinyint(1) NOT NULL,
  `fc_diam_fim` decimal(10,0) DEFAULT NULL,
  `fc_diam_ini` decimal(10,0) DEFAULT NULL,
  `ff` tinyint(1) NOT NULL,
  `ff_m_fim` decimal(10,0) DEFAULT NULL,
  `ff_m_ini` decimal(10,0) DEFAULT NULL,
  `fmp` tinyint(1) NOT NULL,
  `lac` tinyint(1) NOT NULL,
  `ncore` tinyint(1) NOT NULL,
  `prop` tinyint(1) NOT NULL,
  `prop_obs` longtext CHARACTER SET latin1 COLLATE latin1_bin,
  `sbrt` tinyint(1) NOT NULL,
  `suj` tinyint(1) NOT NULL,
  `comp` decimal(10,2) DEFAULT NULL,
  `designacao_prod` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `diam` decimal(10,2) DEFAULT NULL,
  `cliente` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `desp` decimal(10,2) DEFAULT NULL,
  `tipo_desp` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `para_retrabalho` tinyint(1) NOT NULL,
  `type_op` varchar(45) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `action` varchar(8) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16321 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `current_nw_lotes`
--

DROP TABLE IF EXISTS `current_nw_lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `current_nw_lotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `posicao` int DEFAULT NULL,
  `matprima_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `lote_i_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `lote_f_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `t_stamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `current_settings_id` int DEFAULT NULL,
  `active` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ig_bobinagens`
--

DROP TABLE IF EXISTS `ig_bobinagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ig_bobinagens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` int DEFAULT NULL,
  `type_desc` varchar(255) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `n_trocas` int DEFAULT NULL,
  `A1` double DEFAULT NULL,
  `A1_LAG` double DEFAULT NULL,
  `A1_RESET` double DEFAULT NULL,
  `A2` double DEFAULT NULL,
  `A2_LAG` double DEFAULT NULL,
  `A2_RESET` double DEFAULT NULL,
  `A3` double DEFAULT NULL,
  `A3_LAG` double DEFAULT NULL,
  `A3_RESET` double DEFAULT NULL,
  `A4` double DEFAULT NULL,
  `A4_LAG` double DEFAULT NULL,
  `A4_RESET` double DEFAULT NULL,
  `A5` double DEFAULT NULL,
  `A5_LAG` double DEFAULT NULL,
  `A5_RESET` double DEFAULT NULL,
  `A6` double DEFAULT NULL,
  `A6_LAG` double DEFAULT NULL,
  `A6_RESET` double DEFAULT NULL,
  `B1` double DEFAULT NULL,
  `B1_LAG` double DEFAULT NULL,
  `B1_RESET` double DEFAULT NULL,
  `B2` double DEFAULT NULL,
  `B2_LAG` double DEFAULT NULL,
  `B2_RESET` double DEFAULT NULL,
  `B3` double DEFAULT NULL,
  `B3_LAG` double DEFAULT NULL,
  `B3_RESET` double DEFAULT NULL,
  `B4` double DEFAULT NULL,
  `B4_LAG` double DEFAULT NULL,
  `B4_RESET` double DEFAULT NULL,
  `B5` double DEFAULT NULL,
  `B5_LAG` double DEFAULT NULL,
  `B5_RESET` double DEFAULT NULL,
  `B6` double DEFAULT NULL,
  `B6_LAG` double DEFAULT NULL,
  `B6_RESET` double DEFAULT NULL,
  `C1` double DEFAULT NULL,
  `C1_LAG` double DEFAULT NULL,
  `C1_RESET` double DEFAULT NULL,
  `C2` double DEFAULT NULL,
  `C2_LAG` double DEFAULT NULL,
  `C2_RESET` double DEFAULT NULL,
  `C3` double DEFAULT NULL,
  `C3_LAG` double DEFAULT NULL,
  `C3_RESET` double DEFAULT NULL,
  `C4` double DEFAULT NULL,
  `C4_LAG` double DEFAULT NULL,
  `C4_RESET` double DEFAULT NULL,
  `C5` double DEFAULT NULL,
  `C5_LAG` double DEFAULT NULL,
  `C5_RESET` double DEFAULT NULL,
  `C6` double DEFAULT NULL,
  `C6_LAG` double DEFAULT NULL,
  `C6_RESET` double DEFAULT NULL,
  `diametro_calculado` int DEFAULT NULL,
  `diametro` float DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `metros` int DEFAULT NULL,
  `nw_inf` int DEFAULT NULL,
  `nw_sup` int DEFAULT NULL,
  `metros_evento_estado` int DEFAULT NULL,
  `nw_inf_evento_estado` int DEFAULT NULL,
  `nw_sup_evento_estado` int DEFAULT NULL,
  `inicio_ts` datetime DEFAULT NULL,
  `fim_ts` datetime DEFAULT NULL,
  `t_stamp` datetime DEFAULT NULL,
  `status` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ig_bobinagenst_stampndx` (`t_stamp`)
) ENGINE=InnoDB AUTO_INCREMENT=2388 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`192.168.0.59`*/ /*!50003 TRIGGER `ig_bobinagens_AFTER_INSERT` AFTER INSERT ON `ig_bobinagens` FOR EACH ROW BEGIN
    DECLARE line varchar(1000);
    DECLARE acs_id int;
    DECLARE cs_id int;
    
    IF NEW.type = 1 THEN BEGIN
		CALL create_bobinagem(NEW.id,NEW.diametro, NEW.metros, NEW.peso, NEW.nw_inf, NEW.nw_sup, NEW.inicio_ts, NEW.fim_ts,
        (CASE WHEN NEW.A1 < NEW.A1_LAG THEN IFNULL(NEW.A1_RESET,0) ELSE 0 END + IFNULL(NEW.A1,0))-IFNULL(NEW.A1_LAG,0),
        (CASE WHEN NEW.A2 < NEW.A2_LAG THEN IFNULL(NEW.A2_RESET,0) ELSE 0 END + IFNULL(NEW.A2,0))-IFNULL(NEW.A2_LAG,0),
        (CASE WHEN NEW.A3 < NEW.A3_LAG THEN IFNULL(NEW.A3_RESET,0) ELSE 0 END + IFNULL(NEW.A3,0))-IFNULL(NEW.A3_LAG,0),
        (CASE WHEN NEW.A4 < NEW.A4_LAG THEN IFNULL(NEW.A4_RESET,0) ELSE 0 END + IFNULL(NEW.A4,0))-IFNULL(NEW.A4_LAG,0),
        (CASE WHEN NEW.A5 < NEW.A5_LAG THEN IFNULL(NEW.A5_RESET,0) ELSE 0 END + IFNULL(NEW.A5,0))-IFNULL(NEW.A5_LAG,0),
        (CASE WHEN NEW.A6 < NEW.A6_LAG THEN IFNULL(NEW.A6_RESET,0) ELSE 0 END + IFNULL(NEW.A6,0))-IFNULL(NEW.A6_LAG,0),
        (CASE WHEN NEW.B1 < NEW.B1_LAG THEN IFNULL(NEW.B1_RESET,0) ELSE 0 END + IFNULL(NEW.B1,0))-IFNULL(NEW.B1_LAG,0),
		(CASE WHEN NEW.B2 < NEW.B2_LAG THEN IFNULL(NEW.B2_RESET,0) ELSE 0 END + IFNULL(NEW.B2,0))-IFNULL(NEW.B2_LAG,0),
		(CASE WHEN NEW.B3 < NEW.B3_LAG THEN IFNULL(NEW.B3_RESET,0) ELSE 0 END + IFNULL(NEW.B3,0))-IFNULL(NEW.B3_LAG,0),
		(CASE WHEN NEW.B4 < NEW.B4_LAG THEN IFNULL(NEW.B4_RESET,0) ELSE 0 END + IFNULL(NEW.B4,0))-IFNULL(NEW.B4_LAG,0),
		(CASE WHEN NEW.B5 < NEW.B5_LAG THEN IFNULL(NEW.B5_RESET,0) ELSE 0 END + IFNULL(NEW.B5,0))-IFNULL(NEW.B5_LAG,0),
		(CASE WHEN NEW.B6 < NEW.B6_LAG THEN IFNULL(NEW.B6_RESET,0) ELSE 0 END + IFNULL(NEW.B6,0))-IFNULL(NEW.B6_LAG,0),
		(CASE WHEN NEW.C1 < NEW.C1_LAG THEN IFNULL(NEW.C1_RESET,0) ELSE 0 END + IFNULL(NEW.C1,0))-IFNULL(NEW.C1_LAG,0),
		(CASE WHEN NEW.C2 < NEW.C2_LAG THEN IFNULL(NEW.C2_RESET,0) ELSE 0 END + IFNULL(NEW.C2,0))-IFNULL(NEW.C2_LAG,0),
		(CASE WHEN NEW.C3 < NEW.C3_LAG THEN IFNULL(NEW.C3_RESET,0) ELSE 0 END + IFNULL(NEW.C3,0))-IFNULL(NEW.C3_LAG,0),
		(CASE WHEN NEW.C4 < NEW.C4_LAG THEN IFNULL(NEW.C4_RESET,0) ELSE 0 END + IFNULL(NEW.C4,0))-IFNULL(NEW.C4_LAG,0),
		(CASE WHEN NEW.C5 < NEW.C5_LAG THEN IFNULL(NEW.C5_RESET,0) ELSE 0 END + IFNULL(NEW.C5,0))-IFNULL(NEW.C5_LAG,0),
		(CASE WHEN NEW.C6 < NEW.C6_LAG THEN IFNULL(NEW.C6_RESET,0) ELSE 0 END + IFNULL(NEW.C6,0))-IFNULL(NEW.C6_LAG,0)
        );
	END; 
    
    SELECT 
		JSON_ARRAY(
		JSON_OBJECT('id',NEW.id,'doser','A1','cons',(CASE WHEN NEW.A1 < NEW.A1_LAG THEN IFNULL(NEW.A1_RESET,0) ELSE 0 END + IFNULL(NEW.A1,0))-IFNULL(NEW.A1_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','A2','cons',(CASE WHEN NEW.A2 < NEW.A2_LAG THEN IFNULL(NEW.A2_RESET,0) ELSE 0 END + IFNULL(NEW.A2,0))-IFNULL(NEW.A2_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','A3','cons',(CASE WHEN NEW.A3 < NEW.A3_LAG THEN IFNULL(NEW.A3_RESET,0) ELSE 0 END + IFNULL(NEW.A3,0))-IFNULL(NEW.A3_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','A4','cons',(CASE WHEN NEW.A4 < NEW.A4_LAG THEN IFNULL(NEW.A4_RESET,0) ELSE 0 END + IFNULL(NEW.A4,0))-IFNULL(NEW.A4_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','A5','cons',(CASE WHEN NEW.A5 < NEW.A5_LAG THEN IFNULL(NEW.A5_RESET,0) ELSE 0 END + IFNULL(NEW.A5,0))-IFNULL(NEW.A5_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','A6','cons',(CASE WHEN NEW.A6 < NEW.A6_LAG THEN IFNULL(NEW.A6_RESET,0) ELSE 0 END + IFNULL(NEW.A6,0))-IFNULL(NEW.A6_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B1','cons',(CASE WHEN NEW.B1 < NEW.B1_LAG THEN IFNULL(NEW.B1_RESET,0) ELSE 0 END + IFNULL(NEW.B1,0))-IFNULL(NEW.B1_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B2','cons',(CASE WHEN NEW.B2 < NEW.B2_LAG THEN IFNULL(NEW.B2_RESET,0) ELSE 0 END + IFNULL(NEW.B2,0))-IFNULL(NEW.B2_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B3','cons',(CASE WHEN NEW.B3 < NEW.B3_LAG THEN IFNULL(NEW.B3_RESET,0) ELSE 0 END + IFNULL(NEW.B3,0))-IFNULL(NEW.B3_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B4','cons',(CASE WHEN NEW.B4 < NEW.B4_LAG THEN IFNULL(NEW.B4_RESET,0) ELSE 0 END + IFNULL(NEW.B4,0))-IFNULL(NEW.B4_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B5','cons',(CASE WHEN NEW.B5 < NEW.B5_LAG THEN IFNULL(NEW.B5_RESET,0) ELSE 0 END + IFNULL(NEW.B5,0))-IFNULL(NEW.B5_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','B6','cons',(CASE WHEN NEW.B6 < NEW.B6_LAG THEN IFNULL(NEW.B6_RESET,0) ELSE 0 END + IFNULL(NEW.B6,0))-IFNULL(NEW.B6_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C1','cons',(CASE WHEN NEW.C1 < NEW.C1_LAG THEN IFNULL(NEW.C1_RESET,0) ELSE 0 END + IFNULL(NEW.C1,0))-IFNULL(NEW.C1_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C2','cons',(CASE WHEN NEW.C2 < NEW.C2_LAG THEN IFNULL(NEW.C2_RESET,0) ELSE 0 END + IFNULL(NEW.C2,0))-IFNULL(NEW.C2_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C3','cons',(CASE WHEN NEW.C3 < NEW.C3_LAG THEN IFNULL(NEW.C3_RESET,0) ELSE 0 END + IFNULL(NEW.C3,0))-IFNULL(NEW.C3_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C4','cons',(CASE WHEN NEW.C4 < NEW.C4_LAG THEN IFNULL(NEW.C4_RESET,0) ELSE 0 END + IFNULL(NEW.C4,0))-IFNULL(NEW.C4_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C5','cons',(CASE WHEN NEW.C5 < NEW.C5_LAG THEN IFNULL(NEW.C5_RESET,0) ELSE 0 END + IFNULL(NEW.C5,0))-IFNULL(NEW.C5_LAG,0)),
		JSON_OBJECT('id',NEW.id,'doser','C6','cons',(CASE WHEN NEW.C6 < NEW.C6_LAG THEN IFNULL(NEW.C6_RESET,0) ELSE 0 END + IFNULL(NEW.C6,0))-IFNULL(NEW.C6_LAG,0))
		) t into line;

INSERT INTO lotesdosers(`doser`,`lote_id`,`n_lote`,`artigo_cod`,`status`,`t_stamp`,`qty_consumed`,`type_mov`,`loteslinha_id`,`group_id`,`ig_bobinagem_id`,`qty_to_consume`)    
SELECT * FROM(		
WITH CONSUMOS AS(
SELECT * FROM JSON_TABLE(line,"$[*]" COLUMNS(rowid FOR ORDINALITY,id INT PATH "$.id",doser VARCHAR(2) PATH "$.doser",cons DOUBLE PATH "$.cons")) t
),
QTY_LOTES_AVAILABLE AS(
	select t.*,SUM(t.qty_lote_available) over (PARTITION BY t.group_id) qty_artigo_available
	FROM (
		select distinct * from (
		SELECT 
		DOSERS.group_id, LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote,LOTES.qty_lote,DOSERS.loteslinha_id,LOTES.t_stamp,DOSERS.`status`,
		SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) qty_lote_consumed,
		qty_lote + SUM(DOSERS.qty_consumed) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) qty_lote_available,
		MIN(DOSERS.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) min_t_stamp, #FIFO DATE TO ORDER ASC
		MAX(LOTES.t_stamp) over (PARTITION BY LOTES.artigo_cod,LOTES.lote_id,LOTES.n_lote) max_t_stamp
		FROM loteslinha LOTES
		LEFT JOIN lotesdosers DOSERS ON LOTES.id=DOSERS.loteslinha_id 
		WHERE LOTES.status=1 
		) t WHERE  max_t_stamp=t_stamp and `status`=1
	) t where qty_lote_available>0
),
GROUP_DOSER AS(
	SELECT DOSERS.doser,DOSERS.group_id,COUNT(*) OVER (PARTITION BY group_id) n_dosers FROM lotesdosers DOSERS 
    WHERE DOSERS.status=1 AND DOSERS.id in(SELECT DISTINCT MAX(id) OVER (PARTITION BY D.doser) FROM lotesdosers D WHERE D.`status`=1)
),
CONS_BY_LOTE AS(
SELECT 
GD.group_id, QLA.min_t_stamp,C.doser, QLA.artigo_cod, QLA.lote_id, QLA.n_lote,QLA.loteslinha_id,C.id ig_bobinage_id, GD.n_dosers,
QLA.qty_lote,QLA.qty_lote_consumed,QLA.qty_lote_available,QLA.qty_artigo_available, 
C.cons qty_to_consume,
SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id,QLA.n_lote) qty_to_consume_lote,
(C.cons/SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id,QLA.n_lote)) percent_to_consume,
CASE WHEN LAG(GD.doser,1) OVER (ORDER BY GD.group_id IS NULL, group_id, GD.doser, min_t_stamp) is null or LAG(GD.doser,1) OVER (ORDER BY GD.group_id IS NULL, group_id, GD.doser, min_t_stamp) <> GD.doser THEN 1 ELSE 0 END doser_changed,
CASE WHEN ((SUM(CASE WHEN QLA.n_lote IS NULL THEN NULL ELSE C.cons END) OVER (PARTITION BY QLA.artigo_cod, QLA.lote_id, QLA.n_lote)) > QLA.qty_lote_available) THEN 1 ELSE 0 END qty_exceeds
FROM CONSUMOS C
LEFT JOIN GROUP_DOSER GD ON GD.doser=C.doser
LEFT JOIN QTY_LOTES_AVAILABLE QLA ON GD.group_id = QLA.group_id
order by GD.group_id IS NULL, group_id, GD.doser, min_t_stamp
)
SELECT 
doser,lote_id,n_lote,artigo_cod,1 `status`,now() t_stamp,to_consume_cumulative qty_consumed,'C' type_mov,
CASE WHEN to_consume_cumulative >= 0 THEN NULL ELSE loteslinha_id END loteslinha_id,
group_id,NEW.id, qty_to_consume
FROM (
	SELECT 
		CBL.doser,CBL.lote_id,CBL.n_lote,CBL.artigo_cod,CBL.loteslinha_id,CBL.group_id,CBL.qty_to_consume,
		CASE WHEN doser_changed=1 THEN @rest_dosers:=qty_to_consume_lote ELSE @rest_dosers END rest_dosers,
		CASE WHEN doser_changed=1 THEN @rest_doser:=qty_to_consume ELSE @rest_doser END rest_doser,
		@auxdosers:=@rest_dosers auxdosers,
		@auxdoser:=@rest_doser auxdoser,
		CASE WHEN @rest_doser=0 THEN 1 ELSE 0 END all_consumed_doser,
		-1*(CASE WHEN @auxdosers > qty_lote_available THEN qty_lote_available*percent_to_consume ELSE @rest_doser END) to_consume_cumulative,
		CASE WHEN @auxdosers > qty_lote_available THEN @rest_dosers:=@rest_dosers-(qty_lote_available*percent_to_consume) ELSE @rest_dosers:=@rest_dosers-@rest_doser END updated_rest_dosers,
		CASE WHEN @auxdosers > qty_lote_available THEN @rest_doser:=@rest_doser-(qty_lote_available*percent_to_consume) ELSE @rest_doser:=0 END updated_rest_doser
	FROM CONS_BY_LOTE CBL
) t where not (all_consumed_doser=1 and to_consume_cumulative=0)
)t; 

UPDATE ig_doseadores SET
	ig_bobinagem_id=NEW.id,
	audit_cs_id = (SELECT acs.id 
	from producao_currentsettings cs
	join audit_currentsettings acs on cs.id=acs.contextid
	where cs.status=3
	order by acs.id desc
	limit 1)
where ig_bobinagem_id is null;
    
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ig_consumo_nw`
--

DROP TABLE IF EXISTS `ig_consumo_nw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ig_consumo_nw` (
  `id` int NOT NULL AUTO_INCREMENT,
  `consumo_sup` int DEFAULT NULL,
  `consumo_inf` int DEFAULT NULL,
  `t_stamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `matprima_sup_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `matprima_inf_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `lote_sup_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `lote_inf_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `current_settings_id` int DEFAULT NULL,
  `type` int DEFAULT NULL,
  `lote_sup_id` int DEFAULT NULL,
  `lote_inf_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ig_doseadores`
--

DROP TABLE IF EXISTS `ig_doseadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ig_doseadores` (
  `ig_doseadores_ndx` int NOT NULL AUTO_INCREMENT,
  `A1_D` float DEFAULT NULL,
  `A1_P` float DEFAULT NULL,
  `A1_S` float DEFAULT NULL,
  `A2_S` float DEFAULT NULL,
  `A2_P` float DEFAULT NULL,
  `A2_D` float DEFAULT NULL,
  `A3_S` float DEFAULT NULL,
  `A3_P` float DEFAULT NULL,
  `A3_D` float DEFAULT NULL,
  `A4_S` float DEFAULT NULL,
  `A4_P` float DEFAULT NULL,
  `A4_D` float DEFAULT NULL,
  `A5_S` float DEFAULT NULL,
  `A5_P` float DEFAULT NULL,
  `A5_D` float DEFAULT NULL,
  `A6_S` float DEFAULT NULL,
  `A6_P` float DEFAULT NULL,
  `A6_D` float DEFAULT NULL,
  `B1_S` float DEFAULT NULL,
  `B1_P` float DEFAULT NULL,
  `B1_D` float DEFAULT NULL,
  `B2_S` float DEFAULT NULL,
  `B2_P` float DEFAULT NULL,
  `B2_D` float DEFAULT NULL,
  `B3_S` float DEFAULT NULL,
  `B3_P` float DEFAULT NULL,
  `B3_D` float DEFAULT NULL,
  `B4_S` float DEFAULT NULL,
  `B4_P` float DEFAULT NULL,
  `B4_D` float DEFAULT NULL,
  `B5_S` float DEFAULT NULL,
  `B5_P` float DEFAULT NULL,
  `B5_D` float DEFAULT NULL,
  `B6_S` float DEFAULT NULL,
  `B6_P` float DEFAULT NULL,
  `B6_D` float DEFAULT NULL,
  `C1_S` float DEFAULT NULL,
  `C1_P` float DEFAULT NULL,
  `C1_D` float DEFAULT NULL,
  `C2_S` float DEFAULT NULL,
  `C2_P` float DEFAULT NULL,
  `C2_D` float DEFAULT NULL,
  `C3_S` float DEFAULT NULL,
  `C3_P` float DEFAULT NULL,
  `C3_D` float DEFAULT NULL,
  `C4_S` float DEFAULT NULL,
  `C4_P` float DEFAULT NULL,
  `C4_D` float DEFAULT NULL,
  `C5_S` float DEFAULT NULL,
  `C5_P` float DEFAULT NULL,
  `C5_D` float DEFAULT NULL,
  `C6_S` float DEFAULT NULL,
  `C6_P` float DEFAULT NULL,
  `C6_D` float DEFAULT NULL,
  `D_A` float DEFAULT NULL,
  `D_B` float DEFAULT NULL,
  `D_C` float DEFAULT NULL,
  `t_stamp` datetime DEFAULT NULL,
  `ig_bobinagem_id` int DEFAULT NULL,
  `audit_cs_id` int DEFAULT NULL,
  PRIMARY KEY (`ig_doseadores_ndx`),
  KEY `ig_doseadorest_stampndx` (`t_stamp`)
) ENGINE=InnoDB AUTO_INCREMENT=35914 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotescore`
--

DROP TABLE IF EXISTS `lotescore`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotescore` (
  `id` int NOT NULL AUTO_INCREMENT,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `qty_consumed` decimal(12,5) DEFAULT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `lotescorelinha_id` int DEFAULT NULL,
  `ig_bobinagem_id` int DEFAULT NULL,
  `qty_to_consume` decimal(12,5) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotescorelinha`
--

DROP TABLE IF EXISTS `lotescorelinha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotescorelinha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `qty_lote` decimal(12,5) DEFAULT NULL,
  `qty_reminder` decimal(12,5) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  `type` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotesdosers`
--

DROP TABLE IF EXISTS `lotesdosers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotesdosers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doser` varchar(2) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `qty_consumed` decimal(12,5) DEFAULT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `loteslinha_id` int DEFAULT NULL,
  `group_id` bigint DEFAULT NULL,
  `ig_bobinagem_id` int DEFAULT NULL,
  `qty_to_consume` decimal(12,5) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8179 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loteslinha`
--

DROP TABLE IF EXISTS `loteslinha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loteslinha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `qty_lote` decimal(12,5) DEFAULT NULL,
  `qty_reminder` decimal(12,5) DEFAULT NULL,
  `group` bigint DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotesnw`
--

DROP TABLE IF EXISTS `lotesnw`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotesnw` (
  `id` int NOT NULL AUTO_INCREMENT,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `qty_consumed` decimal(12,5) DEFAULT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `lotesnwlinha_id` int DEFAULT NULL,
  `ig_bobinagem_id` int DEFAULT NULL,
  `qty_to_consume` decimal(12,5) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lotesnwlinha`
--

DROP TABLE IF EXISTS `lotesnwlinha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotesnwlinha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `t_stamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `artigo_cod` varchar(25) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `n_lote` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `status` smallint NOT NULL,
  `type_mov` varchar(4) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `qty_lote` decimal(12,5) DEFAULT NULL,
  `qty_reminder` decimal(12,5) DEFAULT NULL,
  `lote_id` int DEFAULT NULL,
  `type` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'sistema'
--

--
-- Dumping routines for database 'sistema'
--
/*!50003 DROP PROCEDURE IF EXISTS `create_bobinagem` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`192.168.0.59` PROCEDURE `create_bobinagem`(in ig_id int, in diametro float, in metros int, in peso float, in nw_inf int, in nw_sup int, inicio datetime, fim datetime, 
A1 double,A2 double,A3 double,A4 double,A5 double,A6 double,
B1 double,B2 double,B3 double,B4 double,B5 double,B6 double,
C1 double,C2 double,C3 double,C4 double,C5 double,C6 double
)
BOBINAGEM_PROC:BEGIN
DECLARE _current_settings_id int;
DECLARE _audit_current_settings_id int;
DECLARE _cortes_ordem JSON;
DECLARE _ofs JSON;
DECLARE _nonwovens JSON;
DECLARE _n_bobinagem int;
DECLARE _gsm int;
DECLARE _largura_total int;
DECLARE _core int;
DECLARE _produto_cod VARCHAR(200);
DECLARE _nome_bobinagem VARCHAR(20);
DECLARE _ordem_cod VARCHAR(50);
DECLARE _larguras_cod VARCHAR(50);
DECLARE _n_cortes INT UNSIGNED; #DEFAULT JSON_LENGTH(in_array);
DECLARE done INT DEFAULT 0;
DECLARE _perfil_id INT DEFAULT NULL;
DECLARE _n_perfil_nome INT;
DECLARE _troca INT;
DECLARE _bobinagem_id INT DEFAULT NULL;
DECLARE _perfil_token VARCHAR(50);
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

#DECLARE EXIT HANDLER FOR SQLEXCEPTION 
#    BEGIN
#        ROLLBACK;
#        #EXIT PROCEDURE;
#    END;

#START TRANSACTION;

#CHECK NW CHANGE
SELECT CASE WHEN `type`= 5 OR `type`=6 THEN 1 ELSE 0 END into _troca from ig_bobinagens order by id desc limit 1;


#LAST CURRENT SETTINGS IN PRODUCTION
SELECT 
acs.id,
acs.ofs, 
acs.nonwovens,
JSON_EXTRACT(acs.cortesordem, '$.ordem_cod') ordem_cod,
JSON_UNQUOTE(CAST(JSON_EXTRACT(acs.cortesordem, '$.largura_ordem') AS JSON)), 
JSON_UNQUOTE(JSON_EXTRACT(acs.cortes, '$.largura_json')) larguras_cod, 
acs.produto_cod, acs.gsm
into _audit_current_settings_id,_ofs,_nonwovens,_ordem_cod,_cortes_ordem,_larguras_cod,_produto_cod, _gsm
FROM 
audit_currentsettings acs join producao_currentsettings cs on cs.id=acs.contextid and cs.status=3 ORDER BY acs.id DESC LIMIT 1;

IF (_audit_current_settings_id IS NULL) THEN
	LEAVE BOBINAGEM_PROC;
END IF;

#PERFIL DATA
SELECT sum(tbl.v) into _largura_total FROM JSON_TABLE(_cortes_ordem,"$[*]"COLUMNS(v INT PATH "$")) tbl;
SELECT tbl.core core, md5(CONCAT(_produto_cod,'+',tbl.core,'+',_ordem_cod)) token into _core,_perfil_token FROM JSON_TABLE(_ofs,"$[0]" COLUMNS(core INT PATH "$.artigo_core")) tbl;
SELECT id into _perfil_id FROM producao_perfil where token = _perfil_token;
IF (_perfil_id is null) then
	select count(*) into _n_perfil_nome from producao_perfil where nome = CONCAT(@produto_cod,' ',REPLACE(REPLACE(@larguras_cod,'"',''),': ','x'),'=',@largura_total,' ',@core,"''");
	#PERFIL
    insert into producao_perfil(`timestamp`,nome,produto,retrabalho,num_bobines,largura_bobinagem,core,gramagem,user_id,obsoleto,token)
    SELECT
	CURRENT_TIMESTAMP `timestamp`, 
	CONCAT(_produto_cod,' ',REPLACE(REPLACE(_larguras_cod,'"',''),': ','x'),'=',_largura_total,' ',_core,"'' ",_n_perfil_nome) nome,
	_produto_cod,
	0 retrabalho,
	JSON_LENGTH(_cortes_ordem) num_bobines,
	_largura_total,
	_core,
    _gsm,
    1 user_id,
	0 obsoleto,
    _perfil_token token;
    SELECT LAST_INSERT_ID() into _perfil_id;

	#LARGURAS
    insert into producao_largura(num_bobine,largura,perfil_id,designacao_prod,gsm,artigo_id,cliente_id)
	select tl.num_bobine,tl.largura, _perfil_id , _produto_cod designacao_prod, _gsm, artigos.artigo_id, pc.id cliente_id
	from (
	SELECT 
	ROW_NUMBER() OVER() num_bobine , larguras.largura
	FROM JSON_TABLE(JSON_EXTRACT(_cortes_ordem, '$'),"$[*]"COLUMNS(largura INT PATH "$")) larguras
	) tl
	JOIN ( select distinct * from JSON_TABLE(JSON_EXTRACT(_ofs, '$'),"$[*]"COLUMNS(artigo_id INT PATH "$.artigo_id", largura INT PATH "$.artigo_lar", gsm INT PATH "$.artigo_gsm", cliente_cod INT PATH "$.cliente_cod", produto_cod VARCHAR(200) PATH "$.produto_cod")) t) artigos on artigos.largura=tl.largura
	JOIN producao_cliente pc on pc.cod = cliente_cod
	order by tl.num_bobine;
end if;



BEGIN
DECLARE _artigo_id int;
DECLARE _item_cod VARCHAR(50);
DECLARE _cliente_cod VARCHAR(50);
DECLARE _lar int;
DECLARE _rowid int;
DECLARE c_ofs CURSOR FOR
SELECT tbl.* FROM JSON_TABLE(_ofs,"$[*]" COLUMNS(rowid FOR ORDINALITY, artigo_id INT PATH "$.item_id",item_cod VARCHAR(50) PATH "$.item_cod",lar INT PATH "$.artigo_lar",cliente_cod VARCHAR(50) PATH "$.cliente_cod")) tbl;

open c_ofs;
cloop:loop
if done = true then leave cloop; end if;
fetch c_ofs into _rowid,_artigo_id,_item_cod,_lar,_cliente_cod;
#select artigo_id,item_cod,core,lar,cliente_cod AS '** DEBUG:';
end loop cloop;
close c_ofs;
END;



set _n_cortes := JSON_LENGTH(_cortes_ordem);
select count(*) into _n_bobinagem from sistema_dev.producao_bobinagem where `data` = CURRENT_DATE and nome like '20%';
set _n_bobinagem := _n_bobinagem + 1;
SELECT CONCAT(DATE_FORMAT(CURRENT_DATE, "%Y%m%d"),'-', LPAD(_n_bobinagem,2,'0')) into _nome_bobinagem;

#BOBINES
#select * from producao_perfil order by id desc;
#select * from producao_largura order by id desc;
#select * from producao_bobine order by id desc;
#select * from producao_bobinagem order by id desc;
#SELECT * FROM sistema_dev.producao_etiquetaretrabalho order by id desc;where bobine='20220105-22-01';

INSERT INTO producao_bobinagem(`timestamp`,nome,`data`,num_bobinagem,comp,tiponwinf,tiponwsup,estado,nwinf,nwsup,comp_cli,diam,area,perfil_id,user_id,inico,fim,duracao,desper,area_g,area_dm,area_r,area_ind,area_ba,comp_par, audit_current_settings_id,num_emendas,valid,ig_bobinagem_id)
select 
CURRENT_TIMESTAMP,
_nome_bobinagem nome,CURDATE() `data`, _n_bobinagem num_bobinagem, metros comp,
JSON_UNQUOTE(JSON_EXTRACT(_nonwovens, '$.nw_des_inf')) tiponwinf,
JSON_UNQUOTE(JSON_EXTRACT(_nonwovens, '$.nw_des_sup')) tiponwsup,
'LAB' estado, nw_inf nwinf, nw_sup nwsup, metros comp_cli,diametro diam, ((_largura_total*metros)/1000) area,
_perfil_id perfil_id, 1 user_id, inicio, fim,timediff(fim,inicio) duracao,
0 desper, 0 area_g, 0 area_dm, 0 area_r, 0 area_ind, 0 area_ba, 0 comp_par,_audit_current_settings_id,0 num_emendas,
0 valid,ig_id
from producao_perfil pf
where pf.id = _perfil_id;
SELECT LAST_INSERT_ID() into _bobinagem_id;

insert into producao_bobine(comp_actual,nome,posicao_palete,estado,area,bobinagem_id,largura_id,artigo_id,comp,designacao_prod,diam,cliente,con,descen,presa,diam_insuf, furos, esp, troca_nw, outros, buraco, recycle,nok, car,fc,ff,fmp,lac,ncore,prop,sbrt,suj,para_retrabalho)
select 
metros comp_actual, CONCAT(_nome_bobinagem,'-',LPAD(num_bobine, 2, '0')) nome,0 posicao_palete, 'LAB' estado, (pl.largura * metros)/1000 area,
_bobinagem_id bobinagem_id,pl.id, pl.artigo_id,metros comp, pl.designacao_prod, diametro ,pc.nome,
0 con, 0 descen, 0 presa, 0 diam_insuf, 0 furos, 0 esp, _troca troca_nw, 0 outros, 0 buraco, 0 recycle, 0 nok, 0 car, 0 fc, 0 ff, 0 fmp, 0 lac, 0 ncore, 0 prop, 0 sbrt,0 suj, 0 para_retrabalho
from producao_perfil pf
join producao_largura pl on pl.perfil_id=pf.id
left join producao_cliente pc on pc.id=pl.cliente_id
where pf.id = _perfil_id;

insert into producao_etiquetaretrabalho(bobine,`data`,produto,largura_bobinagem,diam,largura_bobine,comp_total,area,bobinagem_id,estado_impressao,artigo)
select 
pb.nome bobine, pbm.data `data`, pb.designacao_prod produto, _largura_total largura_bobinagem,pbm.diam,pl.largura largura_bobine,pbm.comp,pb.area,pbm.id bobinagem_id,0 estado_impressao,
pa.des artigo
from producao_bobine pb
join producao_largura pl on pl.id=pb.largura_id
join producao_bobinagem pbm on pbm.id=pb.bobinagem_id 
join producao_artigo pa on pa.id=pb.artigo_id
where bobinagem_id=_bobinagem_id;

INSERT INTO producao_bobinagemconsumos
(
`ig_bobinagem_id`,`A1`,`A2`,`A3`,`A4`,`A5`,`A6`,`B1`,`B2`,`B3`,`B4`,`B5`,`B6`,`C1`,`C2`,`C3`,`C4`,`C5`,`C6`,
`metros`,`nw_inf`,`nw_sup`,`peso`,`diametro`,`inicio`,`fim`,`bobinagem_id`)
VALUES
(
ig_id,A1,A2,A3,A4,A5,A6,B1,B2,B3,B4,B5,B6,C1,C2,C3,C4,C5,C6,metros,nw_inf,nw_sup,peso,diametro,inicio,fim,_bobinagem_id);

#select cortes_ordem,produto_cod,n_cortes,n_bobinagem,nome_bobinagem,ordem_cod,perfil_token AS '** DEBUG:';

#COMMIT;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `procedure_teste` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`192.168.0.59` PROCEDURE `procedure_teste`()
BEGIN
insert into teste(nome) values('nomeeee');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_nw_troca` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`192.168.0.59` PROCEDURE `sp_nw_troca`(inf int,sup int)
BEGIN
DECLARE current_settings_id int;
DECLARE agg_of_id int;
DECLARE matprima_inf_cod varchar(25);
DECLARE matprima_sup_cod varchar(25);
DECLARE lote_inf_id int;
DECLARE lote_sup_id int;

select tbl.id,tbl.agg_of_id,tbl.nw_cod_inf,tbl.nw_cod_sup,
(select id from current_nw_lotes cl where tbl.id=cl.current_settings_id and cl.posicao=0 and matprima_cod=tbl.nw_cod_inf and cl.active=1) lote_inf_id,
(select id from current_nw_lotes cl where tbl.id=cl.current_settings_id and cl.posicao=1 and matprima_cod=tbl.nw_cod_sup and cl.active=1) lote_sup_id
into current_settings_id,agg_of_id,matprima_inf_cod,matprima_sup_cod,lote_inf_id,lote_sup_id
from
(
select cs.id,agg_of_id,JSON_EXTRACT(nonwovens, '$.nw_cod_inf') nw_cod_inf,JSON_EXTRACT(nonwovens, '$.nw_cod_sup') nw_cod_sup
FROM producao_currentsettings cs
#JOIN current_nw_lotes cl on cs.id=cl.current_settings_id
where cs.status=3
) tbl;

#select 
#id,
#agg_of_id,
#JSON_EXTRACT(nonwovens, '$.nw_cod_inf') ,
#JSON_EXTRACT(nonwovens, '$.nw_cod_sup')
#into current_settings_id,agg_of_id,matprima_inf_cod,matprima_sup_cod
#from producao_currentsettings where status=3;
INSERT INTO ig_consumo_nw(consumo_inf,consumo_sup,matprima_inf_cod,matprima_sup_cod,current_settings_id,lote_inf_id,lote_sup_id)
values(inf,sup,matprima_inf_cod,matprima_sup_cod,current_settings_id,lote_inf_id,lote_sup_id);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-04 10:28:27
