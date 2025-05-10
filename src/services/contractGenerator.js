import {
    Document,
    Packer, // Packer нужен будет в Vue компоненте для .toBlob()
    Paragraph,
    TextRun,
    AlignmentType,
    BorderStyle,
    UnderlineType,
    TabStopType,
    // TabStopPosition, // Не используется напрямую, но можно для ясности
    // PageNumber, // Пока не используется
    // VerticalAlign, // Не используется в текущей версии
    // Indent, // Используется внутри Paragraph
    // Spacing, // Используется внутри Paragraph
    Table,
    TableRow,
    TableCell,
    WidthType,
    HeightRule,
    // PageSize, // Используется внутри Document properties
    // PageOrientation, // Не используется
    convertInchesToTwip,
    // ShadingType, // Не используется
    // Header, // Не используется
    // Footer, // Не используется
    Hyperlink,
    // Bookmark, // Не используется напрямую
    // LevelFormat, // Не используется
} from "docx";

// Пример данных договора (оставь здесь для тестирования или удали, если данные всегда из Vue)
/*
const contractDataExample = {
    contractNumber: "123/24",
    // ... остальные поля ...
};
*/

// --- КОНФИГУРАЦИЯ СТИЛЕЙ (stylesConfig) ---
// (Вставь сюда полный объект stylesConfig, который мы разработали)
const stylesConfig = {
    default: {
        paragraph: {
            spacing: { after: 160, line: 259, lineRule: HeightRule.AUTO },
        },
        character: {
            size: 22,
            font: "Calibri",
            languages: { value: "ru-RU", eastAsia: "en-US" },
        },
    },
    paragraphStyles: [
        {
            id: "Normal",
            name: "Normal",
            default: true,
            paragraph: {
                spacing: { after: 0, line: 240, lineRule: HeightRule.AUTO },
            },
            run: {
                font: "Times New Roman",
                size: 24,
                languages: { eastAsia: "ru-RU" },
            },
        },
        {
            id: "DocumentMainTitle",
            name: "Document Main Title",
            basedOn: "Normal",
            paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: { after: 0, line: 240, lineRule: HeightRule.AUTO },
            },
            run: {
                font: "Arial",
                size: 16,
                bold: true,
            },
        },
        {
            id: "ContractText",
            name: "Contract Text",
            basedOn: "Normal",
            paragraph: {
                alignment: AlignmentType.BOTH,
                spacing: { after: 0, line: 240, lineRule: HeightRule.AUTO },
            },
            run: {
                font: "Arial",
                size: 16,
            },
        },
        {
            id: "SectionHeading",
            name: "Section Heading",
            basedOn: "ContractText",
            paragraph: {
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 120 },
            },
            run: {
                font: "Arial",
                size: 16,
                bold: true,
            },
        },
        {
            id: "TableCellText",
            name: "Table Cell Text",
            basedOn: "ContractText",
            paragraph: {
                alignment: AlignmentType.LEFT,
                spacing: { after: 0, line: 240, lineRule: HeightRule.AUTO },
            },
        },
        {
            id: "FieldDescription",
            name: "Field Description",
            basedOn: "ContractText",
            paragraph: {
                alignment: AlignmentType.LEFT,
            },
            run: {
                font: "Arial",
                size: 12,
            },
        },
         {
            id: "HyperlinkStyle",
            name: "Hyperlink",
            type: "character",
            basedOn: "DefaultParagraphFont",
            run: {
                color: "0563C1",
                underline: { type: UnderlineType.SINGLE, color: "auto" },
            },
        }
    ],
    characterStyles: [
        {
            id: "DefaultParagraphFont",
            name: "Default Paragraph Font",
            type: "character",
            default: true,
        },
        {
            id: "PlaceholderField",
            name: "Placeholder Field",
            type: "character",
            run: {
                font: "Arial",
                size: 16,
                bold: true,
                underline: { type: UnderlineType.SINGLE, color: "auto" },
                highlight: "yellow",
            }
        }
    ],
};


// --- ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ ---
// Экспортируем ее, чтобы можно было импортировать в Vue компоненте
export async function createContractDocument(data) {
    const documentChildren = []; // Используем английское название

    // === ЗАГОЛОВОК ===
    documentChildren.push(
        new Paragraph({
            style: "DocumentMainTitle",
            children: [
                new TextRun(`ДОГОВОP N ${data.contractNumber || "____"}`),
            ],
        }),
        new Paragraph({
            style: "DocumentMainTitle",
            children: [new TextRun("об образовании на обучение по дополнительной")],
        }),
        new Paragraph({
            style: "DocumentMainTitle",
            children: [new TextRun("образовательной программе")],
        })
    );

    documentChildren.push(
        new Paragraph({
            style: "ContractText",
            alignment: AlignmentType.BOTH,
            indent: { firstLine: 540 },
            run: { size: 6 },
            children: [new TextRun(" ")],
        })
    );

    documentChildren.push(
        new Paragraph({
            style: "ContractText",
            alignment: AlignmentType.BOTH,
            tabStops: [
                { type: TabStopType.RIGHT, position: convertInchesToTwip(5.5) },
            ],
            children: [
                new TextRun(data.city || "г. Краснодар"),
                new TextRun("\t"),
                new TextRun(`«`),
                new TextRun({ text: data.contractDateDay || "__", underline: { type: UnderlineType.SINGLE } }),
                new TextRun(`» `),
                new TextRun({ text: data.contractDateMonth || "____", underline: { type: UnderlineType.SINGLE } }),
                new TextRun(` 20`),
                new TextRun({ text: data.contractDateYear ? data.contractDateYear.slice(-2) : "__", underline: { type: UnderlineType.SINGLE } }),
                new TextRun(` г.`),
            ],
        })
    );

    documentChildren.push(new Paragraph({ style: "ContractText", children: [new TextRun(" ")] }));

    // === ПРЕАМБУЛА ===
    documentChildren.push(
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 426 },
            children: [
                new TextRun(
                    "Федеральное государственное бюджетное образовательное учреждение высшего образования «Кубанский государственный университет», " +
                    "осуществляющее образовательную деятельность на основании лицензии на осуществление образовательной деятельности серии 90Л01 № 0009015, " +
                    "регистрационный номер 1982 от 03.03.2016 г., выданной Федеральной службой по надзору в сфере образования и науки, действующей бессрочно, " +
                    "свидетельства о государственной аккредитации серии 90А01 № 0003197, регистрационный номер 3042 от 27.03.2019 г., выданного " +
                    "Федеральной службой по надзору в сфере образования и науки, действующего бессрочно (п.16 ст.136 ФЗ № 170-ФЗ от 11.06.2021 г.) " +
                    "(далее – «Исполнитель»/«Университет»), в лице проректора по довузовскому и дополнительному профессиональному образованию " +
                    "Кустова Семена Юрьевича, действующего на основании доверенности от 09.02.2024 № 176/01, с одной стороны, и "
                ),
                new TextRun({ text: data.representativeFullName || "____________________", style: "PlaceholderField" }),
                new TextRun(","),
            ],
        }),
        new Paragraph({
            style: "FieldDescription",
            alignment: AlignmentType.CENTER,
            children: [new TextRun("(фамилия, имя, отчество (при наличии) законного представителя несовершеннолетнего лица, зачисляемого на обучение)")],
        }),
        new Paragraph({
            style: "ContractText",
            children: [
                new TextRun("именуемый (ая) в дальнейшем «Заказчик», с другой стороны, и "),
                new TextRun({ text: data.studentFullName || "____________________", style: "PlaceholderField" }),
                new TextRun(","),
            ],
        }),
        new Paragraph({
            style: "FieldDescription",
            alignment: AlignmentType.CENTER,
            children: [new TextRun("(фамилия, имя, отчество (при наличии) лица, зачисляемого на обучение)")],
        }),
        new Paragraph({
            style: "ContractText",
            children: [new TextRun("именуемый (ая) в дальнейшем «Обучающийся», с третьей стороны, совместно именуемые Стороны, заключили настоящий Договор о нижеследующем:")],
        })
    );

    // === РАЗДЕЛ I. Предмет Договора ===
    documentChildren.push(
        new Paragraph({ text: " ", style: "ContractText" }),
        new Paragraph({
            text: "I. Предмет Договора",
            style: "SectionHeading",
        }),
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 284 },
            children: [
                new TextRun("1.1.\t"),
                new TextRun("Исполнитель обязуется предоставить образовательную услугу, а Заказчик обязуется оплатить обучение по дополнительной " +
                            "общеобразовательной (общеразвивающей) программе "),
                new TextRun({ text: `«${data.programName || "____________________"}»`, style: "PlaceholderField" }),
            ],
        }),
        new Paragraph({
            style: "FieldDescription",
            alignment: AlignmentType.CENTER,
            children: [new TextRun("(наименование дополнительной образовательной программы)")],
        }),
        new Paragraph({
            style: "ContractText",
            alignment: AlignmentType.BOTH,
            children: [
                 // XML имел сложную структуру с табуляцией для этой строки.
                 // Воспроизводим подчеркивание текста, как было в XML, без точной табуляции.
                new TextRun({ text: "очная форма обучения с применением дистанционных образовательных технологий", underline: {type: UnderlineType.SINGLE} }),
            ],
        }),
         new Paragraph({
            style: "ContractText",
            children: [new TextRun("в пределах федеральных государственных требований в соответствии с учебными планами, в том числе индивидуальными, и образовательными программами Исполнителя.")],
        }),
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 284 },
            children: [
                new TextRun("1.2.\tСрок освоения образовательной программы на момент подписания Договора составляет "),
                new TextRun({ text: `${data.programDurationMonths || "__"} месяцев`, underline: {type: UnderlineType.SINGLE} }),
                new TextRun({ text: data.programHours ? ` в объеме ${data.programHours} часов.` : " в объеме ____ часов.", bold: false, underline: {type: UnderlineType.NONE} }), // Снял подчеркивание
                new TextRun(" С «"),
                new TextRun({ text: data.programStartDate || "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun("» по «"),
                new TextRun({ text: data.programEndDate || "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun("» года."), // Добавил "года" как в XML
            ],
        }),
        new Paragraph({
            style: "FieldDescription",
            alignment: AlignmentType.RIGHT,
            // В XML <w:ind w:firstLine="7797"/> - очень большой отступ, вероятно для выравнивания под "месяцев".
            // Используем простой right alignment.
            children: [new TextRun("(указывается количество дней/месяцев)")],
        }),
        // Абзац про индивидуальный план
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 284 }, // Как в XML
            children: [
                new TextRun("Срок освоения образовательной программы по индивидуальному учебному плану, при его наличии, в том числе ускоренному обучению, составляет "),
                new TextRun({ text: "____________", underline: {type: UnderlineType.SINGLE} }), // Место для данных
                new TextRun(", с «"),
                new TextRun({ text: "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun("» "),
                new TextRun({ text: "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun(" 20"),
                new TextRun({ text: "__", underline: {type: UnderlineType.SINGLE} }),
                new TextRun(" года по «"),
                new TextRun({ text: "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun("» "),
                new TextRun({ text: "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun(" 20"),
                new TextRun({ text: "__", underline: {type: UnderlineType.SINGLE} }),
                new TextRun(" года в объеме "),
                new TextRun({ text: "____", underline: {type: UnderlineType.SINGLE} }),
                new TextRun(" часов."),
            ]
        }),
        new Paragraph({ // Описание под сроком для индивид. плана
            style: "FieldDescription",
            indent: { firstLine: 284 }, // Как в XML
            children: [new TextRun("(указывается количество дней/месяцев)")],
        }),
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 284 },
            children: [
                new TextRun("1.3.\tПосле освоения Обучающимся образовательной программы ему выдается документ об обучении, установленного Университетом образца, – "),
                new TextRun({ text: "Сертификат о дополнительном образовании", underline: { type: UnderlineType.SINGLE } }),
                new TextRun("."),
            ],
        }),
        new Paragraph({
            style: "FieldDescription",
            indent: {firstLine: convertInchesToTwip(1.5)}, // Примерный отступ
            children: [new TextRun("(документ об обучении)")],
        }),
        new Paragraph({
            style: "ContractText",
            indent: { firstLine: 284 },
            children: [new TextRun("Обучающимся, освоившим часть образовательной программы и (или) отчисленным из образовательного подразделения Университета, выдается справка об обучении или о периоде обучения по образцу, установленному Университетом.")],
        }),
    );

    documentChildren.push(
        new Paragraph({ text: " ", style: "ContractText" }), // Пустой абзац из XML <w:pPr><w:pStyle w:val="ConsPlusNormal"/>...</w:pPr></w:p>
        new Paragraph({
            text: "II. Права Исполнителя, Заказчика и Обучающегося",
            style: "SectionHeading",
        }),
        new Paragraph({ text: " ", style: "ContractText" }), // Пустой абзац из XML
        new Paragraph({ // 2.1
            style: "ContractText", indent: {firstLine: 284},
            children: [ new TextRun("2.1.\tИсполнитель вправе:") ]
        }),
        new Paragraph({ // 2.1.1
            style: "ContractText", indent: {firstLine: 284 + 284}, // Дополнительный отступ для подпункта
            children: [ new TextRun("2.1.1.\tСамостоятельно осуществлять образовательный процесс, устанавливать системы оценок, формы, порядок и периодичность проведения промежуточной аттестации Обучающегося.") ]
        }),
        new Paragraph({ // 2.1.2
            style: "ContractText", indent: {firstLine: 284 + 284},
            children: [ new TextRun("2.1.2.\tПрименять к Обучающемуся меры поощрения и меры дисциплинарного взыскания в соответствии с законодательством Российской Федерации, учредительными документами Исполнителя, настоящим Договором и локальными нормативными актами Исполнителя.") ]
        }),
         // ... и так далее для всех пунктов и подпунктов ...
         // Тебе нужно будет аккуратно перенести текст всех разделов,
         // используя ручную нумерацию и отступы.

    // === РАЗДЕЛ IX. Адреса и реквизиты сторон ===
    // (Вставь сюда код для таблицы реквизитов и подписей, который мы разработали)
    // ...
        documentChildren.push(
        new Paragraph({ text: " ", style: "ContractText" }),
        new Paragraph({
            text: "IХ. Адреса и реквизиты сторон", // Убедись, что ID правильный для римской цифры
            style: "SectionHeading",
        })
    ))

    const table = new Table({
        width: { size: 10774, type: WidthType.DXA },
        indent: { size: -289, type: WidthType.DXA },
        columnWidths: [3591, 3591, 3592],
        borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "auto" },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: "Исполнитель", style: "TableCellText", alignment: AlignmentType.CENTER, run: { bold: true} })] }),
                    new TableCell({ children: [new Paragraph({ text: "Заказчик", style: "TableCellText", alignment: AlignmentType.CENTER, run: { bold: true} })] }),
                    new TableCell({ children: [new Paragraph({ text: "Обучающийся", style: "TableCellText", alignment: AlignmentType.CENTER, run: { bold: true} })] }),
                ],
            }),
            new TableRow({
                children: [
                    new TableCell({ // Исполнитель
                        verticalAlign: VerticalAlign.TOP, // Чтобы текст начинался сверху
                        children: [
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Федеральное государственное бюджетное образовательное учреждение высшего образования «Кубанский государственный университет»")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Место нахождения: 350040, г. Краснодар, ул. Ставропольская, 149")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("тел.: (861)21-99-530")] }),
                            new Paragraph({ style: "TableCellText", children: [
                                new TextRun("e-mail: "),
                                new Hyperlink({ children: [ new TextRun({ text: "ittdo@kubsu.ru", style: "HyperlinkStyle" }) ], link: "mailto:ittdo@kubsu.ru" })
                            ]}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Официальный сайт: www.kubsu.ru")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Банковские реквизиты:")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ИНН 2312038420 КПП 231201001")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("УФК по Краснодарскому краю")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("(ФГБОУ ВО «КУБАНСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ» л/с 20186Х22950, где Х – большая латинская буква)")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ЕКС 40102810945370000010")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Номер казначейского счета 03214643000000011800")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("БИК 010349101")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ЮЖНОЕ ГУ Банка России//УФК по Краснодарскому краю г. Краснодар")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ОКТМО 03701000")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ОКПО 02067847")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("ОКОНХ 92100")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Обязательно указать в НП:")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("КБК – 00000000000000000130")] }),
                        ],
                    }),
                    new TableCell({ // Заказчик
                        verticalAlign: VerticalAlign.TOP,
                        children: [
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Фамилия, имя, отчество (при наличии)/наименование юридического лица")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun({ text: data.representativeFullName || " ", style: "PlaceholderField" })] }), // Пробел, если пусто
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Адрес места жительства")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun({ text: data.representativeAddress || " ", style: "PlaceholderField" })] }),
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Паспорт: серия, номер, когда и кем выдан")] }),
                            new Paragraph({ style: "TableCellText", children: [
                                new TextRun({ text: `${data.representativePassportSerial || ""} ${data.representativePassportNumber || ""} выдан ${data.representativePassportIssuedBy || ""} ${data.representativePassportIssueDate || ""}`, style: "PlaceholderField" })
                            ]}),
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Банковские реквизиты (при наличии),")] }),
                            new Paragraph({ style: "TableCellText", children: [
                                new TextRun("телефон: "),
                                new TextRun({ text: data.representativePhone || " ", style: "PlaceholderField" })
                            ]}),
                        ],
                    }),
                    new TableCell({ // Обучающийся
                        verticalAlign: VerticalAlign.TOP,
                        children: [
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Фамилия, имя, отчество (при наличии)")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun({ text: data.studentFullName || " ", style: "PlaceholderField" })] }),
                             new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Дата рождения")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun({ text: data.studentBirthDate || " ", style: "PlaceholderField" })] }),
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Адрес места жительства")] }),
                            new Paragraph({ style: "TableCellText", children: [new TextRun({ text: data.studentAddress || " ", style: "PlaceholderField" })] }),
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Паспорт: серия, номер, когда и кем выдан")] }),
                            new Paragraph({ style: "TableCellText", children: [
                                new TextRun({ text: `${data.studentPassportSerial || ""} ${data.studentPassportNumber || ""} выдан ${data.studentPassportIssuedBy || ""} ${data.studentPassportIssueDate || ""}`, style: "PlaceholderField" })
                            ]}),
                            new Paragraph({ text: " ", style: "TableCellText"}),
                            new Paragraph({ style: "TableCellText", children: [new TextRun("Банковские реквизиты (при наличии),")] }),
                            new Paragraph({ style: "TableCellText", children: [
                                new TextRun("телефон: "),
                                new TextRun({ text: data.studentPhone || " ", style: "PlaceholderField" })
                            ]}),
                        ],
                    }),
                ],
            }),
            new TableRow({ // Строка с "ознакомлен"
                children: [
                    new TableCell({ children: [new Paragraph(" ")] }), // Пусто
                    new TableCell({
                        children: [
                            new Paragraph({
                                style: "ContractText",
                                children: [new TextRun("С правилами внутреннего распорядка обучающихся Кубанского государственного университета ознакомлен(а):")]
                            }),
                            new Paragraph({ text: " ", style: "ContractText"}),
                            new Paragraph({
                                style: "ContractText",
                                tabStops: [{type: TabStopType.LEFT, position: convertInchesToTwip(2.5)}],
                                children: [
                                    new TextRun("_________________"),
                                    new TextRun("\t"),
                                    new TextRun({ text: data.representativeFullName ? `${data.representativeFullName.split(" ")[0]} ${data.representativeFullName.split(" ").slice(1).map(n => n[0]).join(".")}.` : " ", style:"PlaceholderField" }),
                                ]
                            }),
                             new Paragraph({
                                style: "FieldDescription",
                                tabStops: [
                                    {type: TabStopType.LEFT, position: convertInchesToTwip(0.5)},
                                    {type: TabStopType.LEFT, position: convertInchesToTwip(2.8)}
                                ],
                                children: [
                                    new TextRun("\t(подпись)"),
                                    new TextRun("\tФ.И.О."),
                                ]
                            }),
                        ],
                    }),
                    new TableCell({ children: [new Paragraph(" ")] }), // Пусто
                ]
            })
        ],
    });
    documentChildren.push(table);

    // ПОДПИСИ СТОРОН (таблицей без границ)
    documentChildren.push(new Paragraph({text: " ", style: "ContractText"}));

    const signatureTable = new Table({
        columnWidths: [3591, 3591, 3592],
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "auto" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
            left: { style: BorderStyle.NONE, size: 0, color: "auto" },
            right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({ verticalAlign: VerticalAlign.TOP, children: [
                        new Paragraph({style: "ContractText", children: [new TextRun("Проректор")]}),
                        new Paragraph({style: "ContractText", children: [new TextRun("по довузовскому и дополнительному")]}),
                        new Paragraph({style: "ContractText", children: [new TextRun("профессиональному образованию")]}),
                        new Paragraph({text: " ", style: "ContractText", spacing: {before: 240}}),
                        new Paragraph({style: "ContractText", children: [new TextRun("_________________________ С.Ю. Кустов")]}),
                        new Paragraph({style: "FieldDescription", alignment: AlignmentType.LEFT, indent: {left: convertInchesToTwip(0.5)}, children: [new TextRun("(подпись)")]}),
                        new Paragraph({text: " ", style: "ContractText", spacing: {before: 240}}),
                        new Paragraph({style: "ContractText", children: [new TextRun("М.П.")]}),
                    ]}),
                    new TableCell({ verticalAlign: VerticalAlign.BOTTOM, children: [ // Заказчик - выравнивание по низу для подписи
                        new Paragraph({text: " ", style: "ContractText", spacing: {before: 240*4}}), // Отступы для выравнивания
                        new Paragraph({style: "ContractText", children: [
                            new TextRun("_________________ "),
                            new TextRun({ text: data.representativeFullName ? `${data.representativeFullName.split(" ")[0]} ${data.representativeFullName.split(" ").slice(1).map(n => n[0]).join(".")}.` : " ", style:"PlaceholderField" }),
                        ]}),
                        new Paragraph({style: "FieldDescription", alignment: AlignmentType.LEFT, children: [new TextRun("(подпись)\t\tФ.И.О.")]}),
                    ]}),
                    new TableCell({ verticalAlign: VerticalAlign.BOTTOM, children: [ // Обучающийся
                        new Paragraph({text: " ", style: "ContractText", spacing: {before: 240*4}}),
                         new Paragraph({style: "ContractText", children: [
                            new TextRun("_________________ "),
                            new TextRun({ text: data.studentFullName ? `${data.studentFullName.split(" ")[0]} ${data.studentFullName.split(" ").slice(1).map(n => n[0]).join(".")}.` : " ", style:"PlaceholderField" }),
                        ]}),
                        new Paragraph({style: "FieldDescription", alignment: AlignmentType.LEFT, children: [new TextRun("(подпись)\t\tФ.И.О.")]}),
                    ]}),
                ]
            })
        ]
    });
    documentChildren.push(signatureTable);


    // === ОПРЕДЕЛЕНИЕ ДОКУМЕНТА ===
    const doc = new Document({
        styles: stylesConfig,
        sections: [
            {
                properties: {
                    pageSize: { width: 11906, height: 16838 },
                    pageMargins: {
                        top: 709, right: 567, bottom: 709, left: 851,
                        header: 709, footer: 709, gutter: 0,
                    },
                },
                children: documentChildren,
            },
        ],
    });

    return doc;
}

// Если ты хочешь протестировать этот файл отдельно в Node.js:
// import fs from 'fs'; // Потребуется 'npm install fs' - ой, fs встроенный
// async function testGenerate() {
//    const exampleData = { /* ... твои тестовые данные ... */ };
//    const doc = await createContractDocument(exampleData);
//    Packer.toBuffer(doc).then(buffer => {
//        fs.writeFileSync("TestContract.docx", buffer);
//        console.log("TestContract.docx создан");
//    });
// }
// testGenerate();