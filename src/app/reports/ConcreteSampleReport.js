import PDFPrinter from 'pdfmake';
import fs from 'fs';
import { format } from 'date-fns';
import fonts from './pdfFonts';
import util from '../utils/utils';

class ConcreteSampleReport {
  constructor() {
    this.widths = [
      '5%',
      '15%',
      '7%',
      '10%',
      '10%',
      '8%',
      '9%',
      '9%',
      '9%',
      '9%',
      '9%',
    ];
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

  createConcreteSamplesColumnsHeaders(table) {
    table.body = [
      [
        'Prob. Nª',
        'Descripción',
        'Slump (cm)',
        'Moldeo',
        'Rotura',
        'Días',
        'Ø\n(cm)',
        'Altura (cm)',
        'Peso\n(kg)',
        'Rotura (ton)',
        'Rotura (MPa)',
      ].map((text) => ({
        table: {
          widths: ['*'],
          heights: ['1%', '98%', '1%'],
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

  createConcreteSampleRow(row, locale) {
    const { dataValues } = row;
    const {
      notes,
      slump,
      sampledAt,
      loadedAt,
      days,
      diameter,
      height,
      weight,
      load,
      mPa,
    } = row;
    return [
      { text: dataValues.tracker || '-', alignment: 'center' },
      { text: notes || '-', alignment: 'center' },
      { text: util.formatNumber(slump, locale) || '-', alignment: 'center' },
      { text: format(sampledAt, 'dd-MM-yyyy') || '-', alignment: 'center' },
      { text: format(loadedAt, 'dd-MM-yyyy') || '-', alignment: 'center' },
      { text: days || '-', alignment: 'center' },
      { text: util.formatNumber(diameter, locale) || '-', alignment: 'center' },
      { text: util.formatNumber(height, locale) || '-', alignment: 'center' },
      {
        text: util.formatNumber(weight, locale, 3) || '-',
        alignment: 'center',
      },
      {
        text: util.formatNumber(Number(load), locale) || '-',
        alignment: 'center',
      },
      {
        text: util.formatNumber(Number(mPa), locale) || '-',
        alignment: 'center',
      },
    ];
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
          heights: ['1%', '98%', '1%'],
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

  createCompressionRow(table, compressionTest) {
    const {
      dataValues,
      client,
      concreteProvider,
      notes,
      updatedAt,
    } = compressionTest;

    table.body.push([
      { text: dataValues.tracker || '-', alignment: 'center' },
      { text: client.name || '-', alignment: 'center' },
      { text: concreteProvider.name || '-', alignment: 'center' },
      { text: notes || '-', alignment: 'center' },
      { text: format(updatedAt, 'dd-MM-yyyy') || '-', alignment: 'center' },
    ]);
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

  createConcreteDesignMaterialsRows(materials = [], locale) {
    return materials.map((material) => {
      const {
        name,
        measurement: { abbreviation },
        ConcreteDesignMaterial: { quantity_per_m3 },
        provider: { name: providerName },
      } = material;

      return [
        {
          text: name,
          alignment: 'center',
          colSpan: 2,
        },

        {},
        {
          text: providerName,
          alignment: 'center',
        },

        {
          text: `${util.formatNumber(quantity_per_m3, locale)} ${abbreviation}`,
          alignment: 'center',
          colSpan: 2,
        },
        {},
      ];
    });
  }

  createConcreteDesignTableTitle({ concreteDesign = {}, locale }) {
    const { notes, name, slump } = concreteDesign;
    return [
      {
        text: `Dosificación ${name} ${notes ? `-${notes}-` : ''} ${
          slump ? `- Slump ${util.formatNumber(slump, locale)}cm` : ''
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
    const { materials } = concreteDesign;

    const concreteDesignMaterialTitle = [
      {
        text: 'Material',
        alignment: 'center',
        fillColor: '#2980b9',
        style: 'columnTitles',
        colSpan: 2,
      },
      {},
      {
        text: 'Proveedor',
        alignment: 'center',
        fillColor: '#2980b9',

        style: 'columnTitles',
      },
      {
        text: `Consumo / m³`,
        alignment: 'center',
        colSpan: 2,
        fillColor: '#2980b9',
        style: 'columnTitles',
      },

      {},
    ];

    return [
      this.createConcreteDesignTableTitle({
        concreteDesign,
        dataValues,
        locale,
      }),
      concreteDesignMaterialTitle,
      ...this.createConcreteDesignMaterialsRows(materials, locale),
    ];
  }

  createDocDefinitions(data, compressionTest, locale, printConcreteDesign) {
    this.docsDefinitions.content = [];
    const concreteSampleLayout = {
      table: {
        widths: this.widths,
        heights: 'auto',
        headerRows: 1,
        body: [],
      },
      layout: {
        fillColor(rowIndex) {
          return rowIndex % 2 === 0 ? '#CCCCCC' : null;
        },
      },
    };
    const compressionTestLayout = {
      table: {
        widths: ['5%', '21.5%', '19.5%', '44%', '10%'],
        heights: 'auto',
        headerRows: 1,
        body: [],
      },
      layout: {
        fillColor(rowIndex) {
          return rowIndex % 2 === 0 ? '#CCCCCC' : null;
        },
      },
    };

    this.createCompressionTestColumnsHeaders(compressionTestLayout.table);
    this.createCompressionRow(
      compressionTestLayout.table,
      compressionTest,
      locale
    );

    if (printConcreteDesign)
      compressionTestLayout.table.body.push(
        ...this.createConcreteDesignTable(compressionTest, locale)
      );

    this.createConcreteSamplesColumnsHeaders(concreteSampleLayout.table);
    data.forEach((row) => {
      concreteSampleLayout.table.body.push(
        this.createConcreteSampleRow(row, locale)
      );
    });

    this.docsDefinitions.content.push(compressionTestLayout);
    this.docsDefinitions.content.push('\n');
    this.docsDefinitions.content.push(concreteSampleLayout);
  }

  createPDF(
    data = [],
    compressionTest = {},
    { locale = 'en-US', printConcreteDesign },
    callback
  ) {
    this.createDocDefinitions(
      data,
      compressionTest,
      locale,
      printConcreteDesign
    );
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

export default new ConcreteSampleReport();
