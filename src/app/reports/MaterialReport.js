import PDFPrinter from 'pdfmake';
import fs from 'fs';
import { format } from 'date-fns';
import fonts from './pdfFonts';
import util from '../utils/utils';

class MaterialReport {
  constructor() {
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
                text: 'RELATORIO \n ESTOQUE',
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
      content: [
        {
          table: {
            widths: [
              'auto',
              'auto',
              'auto',
              'auto',
              'auto',
              '*',
              'auto',
              'auto',
            ],
            headerRows: 1,
          },
        },
      ],
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

  createColumnsHeaders() {
    this.docsDefinitions.content[0].table.body = [
      [
        'Nombre',
        'Categoria',
        'Saldo',
        'Unidad',
        'Proveedor',
        'Descripción',
        'Valor',
        'Actualizado',
      ].map((text) => ({
        table: {
          heights: [0, 10, 0],
          body: [
            [{ text: '', style: 'columnTitles' }],
            [{ text, style: 'columnTitles' }],
            [{ text: '', style: 'columnTitles' }],
          ],
        },
        layout: 'noBorders',
        fillColor: '#2ecc71',
      })),
    ];
  }

  createRow(
    {
      name,
      notes,
      stockQty,
      price,
      category,
      provider,
      measurement,
      dataValues,
    },
    locale,
    index
  ) {
    return [
      name,
      { text: category.name, alignment: 'center' },
      {
        text: util.formatNumber(stockQty, locale),
        alignment: 'center',
      },
      { text: measurement.abbreviation, alignment: 'center' },
      { text: provider.name, alignment: 'center' },
      { text: notes, alignment: 'left' },
      {
        text: price === '0' ? '-' : util.formatNumber(price, locale),
        alignment: 'center',
      },
      {
        text: format(dataValues.updated_at, 'dd-MM-yyyy'),
        alignment: 'center',
      },
    ].map((text) => {
      const isOdd = index % 2 === 1;
      if (isOdd) return { text, style: 'oddRows' };
      return { text };
    });
  }

  createRows(data, locale) {
    data.forEach((row, index) => {
      this.docsDefinitions.content[0].table.body.push(
        this.createRow(row, locale, index)
      );
    });
  }

  createPDF(data = [], locale = 'en-US', callback) {
    this.createColumnsHeaders();
    this.createRows(data, locale);

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

export default new MaterialReport();
