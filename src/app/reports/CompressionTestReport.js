import PDFPrinter from 'pdfmake';
import fs from 'fs';
import { format } from 'date-fns';
import fonts from './pdfFonts';
import util from '../utils/utils';

class MeasureReport {
  constructor() {
    this.widths = ['10%', '20%', '20%', '30%', '20%'];
    this.printer = new PDFPrinter(fonts);
    this.logo = Buffer.from(fs.readFileSync('src/app/assets/HJVA-logo.png'));
    this.docsDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [40, 100, 40, 60],
      defaultStyle: {
        font: 'Helvetica',
      },
      header: {
        margin: [40, 20, 40, 20],
        table: {
          heights: [100],
          widths: ['*', '*', '*'],

          body: [
            [
              {
                layout: 'noBorders',
                table: {
                  body: [
                    [
                      {
                        image: this.logo,
                        fit: [150, 120],
                      },
                    ],
                  ],
                },
              },
              {
                text: 'RELATORIO \n ENSAYOS',
                style: 'header',
                alignment: 'center',
              },
              {
                text: `Comercio y Construcciones HJVA \n Pto. Quijarro, Sta. Cruz, Bolivia \n${format(
                  new Date(),
                  'dd-MM-yyyy HH:mm'
                )} \n`,
                style: 'header',
                alignment: 'right',
              },
            ],
          ],
        },
        layout: 'noBorders',
      },

      footer(currentPage, pageCount) {
        return {
          margin: [40, 20, 40, 20],
          text: `${currentPage.toString()} / ${pageCount}`,
          alignment: 'center',
        };
      },
      content: [],
      styles: {
        header: {
          fontSize: 14,
          bold: true,
        },
        oddRows: { fillColor: '#ebebeb' },
        columnTitles: {
          fontSize: 12,
          bold: true,
          lineHeight: 1,
        },
      },
    };
  }

  createCompressionTestColumnsHeaders(table) {
    table.body = [
      [
        'Doc. Nª',
        'Cliente',
        'Prov. Hormigón',
        'Descripción',
        'Actualizado',
      ].map((text) => ({
        table: {
          widths: ['*'],
          heights: [0, 10, 0],
          body: [
            [{ text: '', style: 'columnTitles' }],
            [
              {
                text,
                style: 'columnTitles',
                alignment: 'center',
              },
            ],
            [{ text: '', style: 'columnTitles' }],
          ],
        },
        layout: 'noBorders',
        fillColor: '#2ecc71',
      })),
    ];
  }

  createCompressionTestRow(
    { client, concreteProvider, notes, dataValues, concreteDesign },
    locale,
    printConcreteDesign
  ) {
    return [
      { text: dataValues.tracker || '-', alignment: 'center' },
      { text: client.name || '-', alignment: 'center' },
      { text: concreteProvider.name || '-', alignment: 'center' },
      {
        text: !printConcreteDesign
          ? `${concreteDesign.name}, SLUMP:${util.formatNumber(
              concreteDesign.slump,
              locale
            )}. ${notes || '-'}`
          : notes || '-',
        alignment: 'center',
      },
      {
        text: format(dataValues.updated_at, 'dd-MM-yyyy') || '-',
        alignment: 'center',
      },
    ];
  }

  createCompressionTestTable(row, locale, printConcreteDesign) {
    const layout = {
      table: {
        widths: this.widths,
        headerRows: 1,
        body: [],
      },
      layout: {
        fillColor(rowIndex) {
          return rowIndex % 2 === 0 ? '#CCCCCC' : null;
        },
      },
    };
    this.createCompressionTestColumnsHeaders(layout.table);
    layout.table.body.push(
      this.createCompressionTestRow(row, locale, printConcreteDesign)
    );
    this.docsDefinitions.content.push(layout);
  }

  createCompressionTestTableWithoutMaterialDesign(
    table,
    row,
    locale,
    printConcreteDesign
  ) {
    table.body.push(
      this.createCompressionTestRow(row, locale, printConcreteDesign)
    );
  }

  createConcreteDesignMaterialTableTitle() {
    return [
      {
        text: 'Nombre',
        alignment: 'center',
        colSpan: 2,
        fillColor: '#2980b9',
        style: 'columnTitles',
      },
      {},
      {
        text: 'Slump',
        alignment: 'center',
        fillColor: '#2980b9',
        style: 'columnTitles',
      },
      {
        text: 'Descripción ',
        alignment: 'center',
        fillColor: '#2980b9',
        colSpan: 2,
        style: 'columnTitles',
      },
      {},
    ];
  }

  createConCreteDesignRow(concreteDesign, locale) {
    const { name, slump, notes } = concreteDesign;
    return [
      { text: name, alignment: 'center', colSpan: 2 },
      {},
      {
        text: `${util.formatNumber(slump, locale)}`,
        alignment: 'center',
      },
      {
        text: notes,
        alignment: 'center',

        colSpan: 2,
      },
      {},
    ];
  }

  createConcreteDesignMaterialsRows(concreteDesignMaterial = [], locale) {
    return concreteDesignMaterial.map((m) => {
      const { material, quantity_per_m3 } = m;
      const { measurement, provider } = material;
      const { dataValues: dV } = measurement;

      return [
        {
          text: material.name,
          alignment: 'center',
        },
        {
          text: provider.name,
          alignment: 'center',
          colSpan: 2,
        },
        {},
        {
          text: `${util.formatNumber(quantity_per_m3, locale)} ${dV.abbr}`,
          alignment: 'center',
          colSpan: 2,
        },
        {},
      ];
    });
  }

  createConcreteDesignTableTitle(concreteDesign = {}, dataValues = {}) {
    return [
      {
        text: `Dosificación ${concreteDesign.name} - Doc. Nª${
          dataValues.tracker || '-'
        }`,
        alignment: 'center',
        colSpan: 5,
        fillColor: '#2980b9',
        style: 'columnTitles',
      },
      {},
      {},
      {},
      {},
    ];
  }

  createConcreteDesignTable({ concreteDesign, dataValues }, locale) {
    const { concreteDesignMaterial } = concreteDesign;

    const materialsTitle = [
      {
        text: 'Material',
        alignment: 'center',
        fillColor: '#2980b9',
        style: 'columnTitles',
      },
      {
        text: 'Proveedor',
        alignment: 'center',
        fillColor: '#2980b9',
        colSpan: 2,
        style: 'columnTitles',
      },
      {},
      {
        text: `Consumo / m³`,
        alignment: 'center',
        colSpan: 2,
        fillColor: '#2980b9',
        style: 'columnTitles',
      },

      {},
    ];

    const layout = {
      table: {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        headerRows: 1,
        body: [
          this.createConcreteDesignTableTitle(concreteDesign, dataValues),
          this.createConcreteDesignMaterialTableTitle(),
          this.createConCreteDesignRow(concreteDesign, locale),
          materialsTitle,
          ...this.createConcreteDesignMaterialsRows(
            concreteDesignMaterial,
            locale
          ),
        ],
      },
      layout: {
        fillColor(rowIndex) {
          return rowIndex % 2 === 0 ? '#CCCCCC' : null;
        },
      },
    };

    this.docsDefinitions.content.push(layout);
  }

  createDocDefinitions(data, locale, printConcreteDesign) {
    this.docsDefinitions.content = [];

    if (!printConcreteDesign) {
      const layout = {
        table: {
          widths: this.widths,
          headerRows: 1,
          body: [],
        },
        layout: {
          fillColor(rowIndex) {
            return rowIndex % 2 === 0 ? '#CCCCCC' : null;
          },
        },
      };

      this.createCompressionTestColumnsHeaders(layout.table);
      data.forEach((row) => {
        this.createCompressionTestTableWithoutMaterialDesign(
          layout.table,
          row,
          locale,
          printConcreteDesign
        );
      });

      this.docsDefinitions.content.push(layout);
    }

    if (printConcreteDesign) {
      data.forEach((row, index) => {
        this.createCompressionTestTable(row, locale, printConcreteDesign);
        this.createConcreteDesignTable(row, locale, index);

        if (data.length > 0 && index < data.length - 1)
          this.docsDefinitions.content.push({ text: '', pageBreak: 'after' });
      });
    }
  }

  createPDF(data = [], { locale = 'en-US', printConcreteDesign }, callback) {
    this.createDocDefinitions(data, locale, printConcreteDesign);
    const pdfDoc = this.printer.createPdfKitDocument(this.docsDefinitions);
    const chuncks = [];

    pdfDoc.on('data', (chunk) => chuncks.push(chunk));
    pdfDoc.end();

    pdfDoc.on('end', () => {
      const result = Buffer.concat(chuncks);
      callback(result);
    });
  }
}

export default new MeasureReport();
