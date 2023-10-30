export const transformFormulacaoData = ({ items, formulacao }) => {
    //let formu_materiasprimas_A = items?.filter(v => (v.extrusora === 'A')).map(v => ({ ...(v?.cuba_A && { cuba_A: v.cuba_A }), ...(v?.doseador_A && { doseador_A: v.doseador_A }), global: v.vglobal, matprima_cod_A: v.matprima_cod, orig_matprima_cod_A: v.matprima_cod, densidade_A: v.densidade, arranque_A: v.arranque, tolerancia_A: v.tolerancia, removeCtrl: true }));
    //let formu_materiasprimas_BC = items?.filter(v => (v.extrusora === 'BC')).map(v => ({ ...(v?.cuba_BC && { cuba_BC: v.cuba_BC }), ...(v?.doseador_B && { doseador_B: v.doseador_B }), ...(v?.doseador_C && { doseador_C: v.doseador_C }), global: v.vglobal, matprima_cod_BC: v.matprima_cod, orig_matprima_cod_BC: v.matprima_cod, densidade_BC: v.densidade, arranque_BC: v.arranque, tolerancia_BC: v.tolerancia, removeCtrl: true }));
    //let formu_materiasprimas_B = items?.filter(v => (v.extrusora === 'B')).map(v => ({ ...(v?.cuba_B && { cuba_B: v.cuba_B }), ...(v?.doseador_B && { doseador_B: v.doseador_B }), global: v.vglobal, matprima_cod_B: v.matprima_cod, orig_matprima_cod_B: v.matprima_cod, densidade_B: v.densidade, arranque_B: v.arranque, tolerancia_B: v.tolerancia, removeCtrl: true }));
    //let formu_materiasprimas_C = items?.filter(v => (v.extrusora === 'C')).map(v => ({ ...(v?.cuba_C && { cuba_C: v.cuba_C }), ...(v?.doseador_C && { doseador_C: v.doseador_C }), global: v.vglobal, matprima_cod_C: v.matprima_cod, orig_matprima_cod_C: v.matprima_cod, densidade_C: v.densidade, arranque_C: v.arranque, tolerancia_C: v.tolerancia, removeCtrl: true }));

    //Modo compatibilidade com modelo de dados antigo, que considerava as extrusuras BC uma só...
    //Verificar se existe BC
    let formu_materiasprimas_A;
    let formu_materiasprimas_B;
    let formu_materiasprimas_C;
    if (items?.some(v => v.extrusora === "BC")) {
        formu_materiasprimas_A = items?.filter(v => (v.extrusora === 'A')).map(v => ({ ...(v?.cuba_A && { cuba: v.cuba_A }), ...(v?.doseador_A && { doseador: v.doseador_A }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
        formu_materiasprimas_B = items?.filter(v => (v.extrusora === 'BC')).map(v => ({ ...(v?.cuba_BC && { cuba: v.cuba_BC }), ...(v?.doseador_B && { doseador: v.doseador_B }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
        formu_materiasprimas_C = items?.filter(v => (v.extrusora === 'BC')).map(v => ({ ...(v?.cuba_BC && { cuba: v.cuba_BC }), ...(v?.doseador_C && { doseador: v.doseador_C }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
    } else {
        formu_materiasprimas_A = items?.filter(v => (v.extrusora === 'A')).map(v => ({ ...(v?.cuba && { cuba: v.cuba }), ...(v?.doseador && { doseador: v.doseador }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
        formu_materiasprimas_B = items?.filter(v => (v.extrusora === 'B')).map(v => ({ ...(v?.cuba && { cuba: v.cuba }), ...(v?.doseador && { doseador: v.doseador }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
        formu_materiasprimas_C = items?.filter(v => (v.extrusora === 'C')).map(v => ({ ...(v?.cuba && { cuba: v.cuba }), ...(v?.doseador && { doseador: v.doseador }), global: v.vglobal, matprima_cod: v.matprima_cod, orig_matprima_cod: v.matprima_cod, densidade: v.densidade, arranque: v.arranque, tolerancia: v.tolerancia, removeCtrl: true }));
    }
    console.log("loaded", formu_materiasprimas_B)

    const cliente_cod = { key: formulacao?.cliente_cod, value: formulacao?.cliente_cod, label: formulacao?.cliente_nome };
    return { ...formulacao, cliente_cod, formu_materiasprimas_A/* , formu_materiasprimas_BC */, formu_materiasprimas_B, formu_materiasprimas_C, totalGlobal: 100 };
}

export const transformFormulacaoDataList = (formulacao) => {
    const rows = [];
    const eA = [];
    const eB = [];
    const eC = [];
    for (let v of formulacao.items) {
        if (v.extrusora == 'A') {
            let { cuba_A, doseador_A, ...dt } = v;
            let cuba = cuba_A ? cuba_A : dt?.cuba;
            let doseador = doseador_A ? doseador_A : dt?.doseador;
            eA.push({ ...dt, cuba, doseador });
        }
        if (v.extrusora == 'BC') {
            let { cuba_BC, doseador_B, doseador_C, ...dt } = v;
            let cuba = cuba_BC && cuba_BC;
            let doseador = doseador_B && doseador_B;
            eB.push({ ...dt, cuba, doseador, extrusora: "B" });
            doseador = doseador_C && doseador_C;
            eC.push({ ...dt, cuba, doseador, extrusora: "C" });
        }
        if (v.extrusora == 'B') {
            eB.push(v);
        }
        if (v.extrusora == 'C') {
            eC.push(v);
        }
    }
    rows.push({ id: -1 });
    rows.push(...eA);
    rows.push({ id: -2 });
    rows.push(...eB);
    rows.push({ id: -3 });
    rows.push(...eC);
    return rows;
}