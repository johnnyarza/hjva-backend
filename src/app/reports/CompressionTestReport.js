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
                text: 'RELATORIO \n DOSIFICACIONES',
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

  createColumnsHeaders(table) {
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

  createRow({ client, concreteProvider, notes, dataValues }, locale) {
    return [
      { text: dataValues.tracker || '-', alignment: 'center' },
      { text: client.name || '-', alignment: 'center' },
      { text: concreteProvider.name || '-', alignment: 'center' },
      {
        text: notes || '-',
        alignment: 'center',
      },
      {
        text: format(dataValues.updated_at, 'dd-MM-yyyy') || '-',
        alignment: 'center',
      },
    ];
  }

  createCompressionTestTable(row, locale) {
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
    this.createColumnsHeaders(layout.table);
    layout.table.body.push(this.createRow(row, locale));
    this.docsDefinitions.content.push(layout);
  }

  createCompressionTestTableWithoutMaterialDesign(table, row, locale) {
    table.body.push(this.createRow(row, locale));
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
          fillColor(rowIndex, node, columnIndex) {
            return rowIndex % 2 === 0 ? '#CCCCCC' : null;
          },
        },
      };

      this.createColumnsHeaders(layout.table);
      data.forEach((row, index) => {
        this.createCompressionTestTableWithoutMaterialDesign(
          layout.table,
          row,
          locale
        );
      });

      this.docsDefinitions.content.push(layout);
    }

    if (printConcreteDesign) {
      data.forEach((row, index) => {
        this.createCompressionTestTable(row, locale);
        this.createMaterialDesignTable(row, locale, index);

        this.docsDefinitions.content.push('\n');
      });
    }
  }

  createMaterialDesignTable({ concreteDesign, dataValues }, locale, index) {
    console.log(concreteDesign);
    const { concreteDesignMaterial } = concreteDesign;
    const { name, slump, notes } = concreteDesign;

    const concreteDesignTitle = [
      { text: 'Nombre', alignment: 'center', colSpan: 2, fillColor: '#2980b9' },
      {},
      {
        text: 'Slump',
        alignment: 'center',
        fillColor: '#2980b9',
      },
      {
        text: 'Descripción ',
        alignment: 'center',
        fillColor: '#2980b9',
        colSpan: 2,
      },
      {},
    ];
    const concreteDesignRow = [
      { text: concreteDesign.name, alignment: 'center', colSpan: 2 },
      {},
      {
        text: concreteDesign.slump,
        alignment: 'center',
      },
      {
        text: concreteDesign.notes,
        alignment: 'center',

        colSpan: 2,
      },
      {},
    ];
    const materialsTitle = [
      {
        text: 'Material',
        alignment: 'center',
        fillColor: '#2980b9',
      },
      {
        text: 'Proveedor',
        alignment: 'center',
        fillColor: '#2980b9',
        colSpan: 2,
      },
      {},
      {
        text: `Consumo / m³`,
        alignment: 'center',
        colSpan: 2,
        fillColor: '#2980b9',
      },

      {},
    ];

    const materialsRows = concreteDesignMaterial.map((m) => {
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
          text: `${quantity_per_m3} ${dV.abbr}`,
          alignment: 'center',
          colSpan: 2,
        },
        {},
      ];
    });

    const layout = {
      table: {
        widths: ['20%', '20%', '20%', '20%', '20%'],
        headerRows: 1,
        body: [
          [
            {
              text: `Dosificación ${name} - Doc. Nª${
                dataValues.tracker || '-'
              }`,
              alignment: 'center',
              colSpan: 5,
              fillColor: '#2980b9',
            },
            {},
            {},
            {},
            {},
          ],
          concreteDesignTitle,
          concreteDesignRow,
          materialsTitle,
          ...materialsRows,
        ],
      },
      layout: {
        fillColor(rowIndex, node, columnIndex) {
          return rowIndex % 2 === 0 ? '#CCCCCC' : null;
        },
      },
    };

    this.docsDefinitions.content.push(layout);
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
