export const DEFAULT_RECIPES = [
  {
    nombre: "Ensaladilla rusa",
    ingredientes:
      "4 patatas · 2 zanahorias · 1 lata de guisantes · 2 latas de atún · 3 huevos cocidos · mayonesa · aceitunas (opcional)",
    instrucciones:
      "Cuece las patatas y zanahorias en dados hasta que estén tiernas. Cuece los huevos aparte. Mezcla patata, zanahoria, guisantes escurridos, atún desmigado y huevo picado. Liga todo con mayonesa al gusto. Enfría en la nevera al menos 1 hora antes de servir, decorando con aceitunas.",
    favorita: true,
  },
  {
    nombre: "La marinera (tapa murciana)",
    ingredientes: "Ensaladilla rusa · rosca o barquillo de pan tipo \"rosca marinera\" · boquerones en vinagre",
    instrucciones:
      "Rellena la rosca de pan con una buena cantidad de ensaladilla rusa bien fría. Corona con uno o dos boquerones en vinagre encima. Se toma como tapa, fría.",
    favorita: true,
  },
  {
    nombre: "Zarangollo murciano",
    ingredientes: "2-3 calabacines · 1 cebolla · 3 huevos · aceite de oliva virgen extra · sal",
    instrucciones:
      "Corta el calabacín y la cebolla en láminas finas. Pocha la cebolla en aceite a fuego medio, añade el calabacín y sofríe hasta que esté blando (unos 15-20 min). Bate los huevos, viértelos sobre las verduras y remueve como si fueran huevos revueltos hasta que cuajen ligeramente. Sala al gusto.",
    favorita: false,
  },
  {
    nombre: "Paella",
    ingredientes:
      "Arroz · pollo y/o conejo troceado · judía verde plana · garrofón (o judía blanca) · tomate rallado · pimentón · azafrán · aceite de oliva · caldo o agua · sal",
    instrucciones:
      "Dora la carne en la paellera con aceite. Añade la judía verde y el garrofón, sofríe. Incorpora el tomate rallado y el pimentón (sin quemarlo), y enseguida el agua o caldo. Cuando rompa a hervir, añade el azafrán y ajusta de sal. Cuando lleve unos 10 min hirviendo, añade el arroz repartido de forma uniforme. Cocina unos 18-20 min sin remover: 10 min a fuego fuerte y el resto más suave. Deja reposar 5 min antes de servir.",
    favorita: true,
  },
  {
    nombre: "Tortilla de patata española",
    ingredientes: "4-5 patatas · 4-6 huevos · 1 cebolla (opcional) · aceite de oliva virgen extra · sal",
    instrucciones:
      "Pela y corta las patatas (y la cebolla, si la usas) en láminas finas. Fríelas en abundante aceite a fuego medio-bajo hasta que estén tiernas, sin dorarse demasiado. Escurre bien el aceite. Bate los huevos con sal y mezcla con la patata. Cuaja en una sartén antiadherente con un poco de aceite, dando la vuelta con un plato para cuajar el otro lado al gusto (más o menos jugosa).",
    favorita: false,
  },
];

// Sugerencias: más platos murcianos/españoles que aparecen en "Sugerencias"
// dentro de Recetas, para aceptar o descartar — no entran directas a la lista.
export const SUGGESTED_RECIPES = [
  {
    nombre: "Michirones",
    ingredientes:
      "500g de habas secas murcianas · chorizo · jamón (punta o hueso) · morcilla (opcional) · guindilla · pimentón · ajo · laurel · aceite de oliva",
    instrucciones:
      "Deja las habas en remojo un día entero. Cocínalas a fuego lento en olla (mejor exprés) con el chorizo, el jamón, el laurel, la guindilla y un chorro de aceite, cubiertas de agua, hasta que estén muy tiernas (varias horas si no usas exprés). Añade el pimentón casi al final. Se sirve caliente, típico de febrero/marzo en Murcia.",
  },
  {
    nombre: "Caldero murciano",
    ingredientes:
      "Arroz · pescado de roca (mero, dorada...) · ñoras · ajo · tomate rallado · pimentón · aceite de oliva · caldo de pescado",
    instrucciones:
      "Haz un caldo con el pescado y las cabezas/espinas. En el caldero, sofríe ajo, ñora y tomate, añade pimentón y el caldo colado. Cuando hierva, añade el arroz y cocina unos 18-20 min. El pescado se suele servir aparte, sobre el arroz o antes de él, típico del Mar Menor.",
  },
  {
    nombre: "Pisto murciano",
    ingredientes: "Calabacín · pimiento rojo y verde · cebolla · tomate · aceite de oliva · sal · huevo frito (opcional para acompañar)",
    instrucciones:
      "Pocha la cebolla y los pimientos en aceite a fuego medio. Añade el calabacín en dados y rehógalo. Incorpora el tomate (rallado o troceado) y cocina a fuego lento hasta que todo esté bien pochado y sin exceso de líquido, unos 30-40 min. Se puede servir con un huevo frito por encima.",
  },
  {
    nombre: "Migas",
    ingredientes: "Pan duro del día anterior · agua con sal · aceite de oliva · ajos · panceta y chorizo · pimentón (opcional)",
    instrucciones:
      "Trocea el pan en migas pequeñas y humedécelo con agua salada, tápalo unas horas (o de un día para otro). Fríe ajos, panceta y chorizo en aceite, retíralos, y en ese mismo aceite ve sofriendo las migas removiendo constantemente hasta que queden sueltas y doradas. Junta todo y sirve caliente.",
  },
  {
    nombre: "Salmorejo",
    ingredientes: "1kg de tomates maduros · 200g de pan duro · 1 diente de ajo · aceite de oliva virgen extra · sal · vinagre (opcional) · huevo duro y jamón para decorar",
    instrucciones:
      "Tritura los tomates con el ajo, el pan remojado y una pizca de sal. Ve añadiendo aceite en hilo mientras trituras hasta que quede fino y con cuerpo. Rectifica de sal. Enfría en la nevera y sirve con huevo duro picado y jamón por encima.",
  },
  {
    nombre: "Paparajotes (postre murciano)",
    ingredientes: "Hojas de limonero frescas y limpias · harina · huevo · leche · levadura · azúcar · canela · aceite para freír",
    instrucciones:
      "Prepara una masa tipo rebozado con harina, huevo, leche y una pizca de levadura. Moja cada hoja de limonero en la masa y fríe en aceite caliente hasta dorar. Escurre y reboza en azúcar con canela al momento. Se comen sin la hoja, solo el rebozado (la hoja da el aroma).",
  },
];
