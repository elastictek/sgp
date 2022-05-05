CREATE TRIGGER `producao_currentsettings_AFTER_INSERT` AFTER INSERT ON `producao_currentsettings` FOR EACH ROW
INSERT INTO audit_currentsettings (`formulacao`,`gamaoperatoria`,`nonwovens`,`artigospecs`,
`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,`status`,
`observacoes`,`start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,
`amostragem`,`gsm`,`produto_id`,`produto_cod`,`lotes`,
`type_op`,`timestamp`,`action`,`contextid`,`agg_of_id`,`user_id`,`created`)
  VALUES(NEW.formulacao,NEW.gamaoperatoria,NEW.nonwovens,NEW.artigospecs,NEW.cortes,NEW.cortesordem,
  NEW.cores,NEW.paletizacao,NEW.emendas,NEW.ofs,NEW.paletesstock,NEW.status,NEW.observacoes,NEW.start_prev_date,
  NEW.end_prev_date,NEW.horas_previstas_producao, NEW.sentido_enrolamento,NEW.amostragem,
  NEW.gsm,NEW.produto_id,NEW.produto_cod,NEW.lotes,
  NEW.type_op,NOW(),'insert', NEW.id, NEW.agg_of_id,NEW.user_id,NEW.created);


CREATE TRIGGER `producao_currentsettings_AFTER_UPDATE` AFTER UPDATE ON `producao_currentsettings` FOR EACH ROW
INSERT INTO audit_currentsettings (`formulacao`,`gamaoperatoria`,`nonwovens`,`artigospecs`,
`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,`status`,
`observacoes`,`start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,
`amostragem`,`gsm`,`produto_id`,`produto_cod`,`lotes`,
`type_op`,`timestamp`,`action`,`contextid`,`agg_of_id`,`user_id`,`created`)
  VALUES(NEW.formulacao,NEW.gamaoperatoria,NEW.nonwovens,NEW.artigospecs,NEW.cortes,NEW.cortesordem,
  NEW.cores,NEW.paletizacao,NEW.emendas,NEW.ofs,NEW.paletesstock,NEW.status,NEW.observacoes,NEW.start_prev_date,
  NEW.end_prev_date,NEW.horas_previstas_producao, NEW.sentido_enrolamento,NEW.amostragem,
  NEW.gsm,NEW.produto_id,NEW.produto_cod,NEW.lotes,
  NEW.type_op,NOW(),'update', NEW.id, NEW.agg_of_id,NEW.user_id,NEW.created);


CREATE TRIGGER `producao_currentsettings_AFTER_DELETE` AFTER DELETE ON `producao_currentsettings` FOR EACH ROW
INSERT INTO audit_currentsettings (`formulacao`,`gamaoperatoria`,`nonwovens`,`artigospecs`,
`cortes`,`cortesordem`,`cores`,`paletizacao`,`emendas`,`ofs`,`paletesstock`,`status`,
`observacoes`,`start_prev_date`,`end_prev_date`,`horas_previstas_producao`,`sentido_enrolamento`,
`amostragem`,`gsm`,`produto_id`,`produto_cod`,`lotes`,
`type_op`,`timestamp`,`action`,`contextid`,`agg_of_id`,`user_id`,`created`)
  VALUES(OLD.formulacao,OLD.gamaoperatoria,OLD.nonwovens,OLD.artigospecs,OLD.cortes,OLD.cortesordem,
  OLD.cores,OLD.paletizacao,OLD.emendas,OLD.ofs,OLD.paletesstock,OLD.status,OLD.observacoes,OLD.start_prev_date,
  OLD.end_prev_date,OLD.horas_previstas_producao, OLD.sentido_enrolamento,OLD.amostragem,
  OLD.gsm,OLD.produto_id,OLD.produto_cod,OLD.lotes,
  OLD.type_op,NOW(),'delete', OLD.id, OLD.agg_of_id,OLD.user_id,OLD.created);