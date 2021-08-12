import PDFPrinter from 'pdfmake';
import fs from 'fs';
import { format } from 'date-fns';
import fonts from './pdfFonts';
import util from '../utils/utils';

class MeasureReport {
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
      content: [
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              table: {
                widths: ['auto', 'auto', 'auto', 'auto'],
                headerRows: 1,
              },
              layout: {
                fillColor(rowIndex, node, columnIndex) {
                  return rowIndex % 2 === 0 ? '#CCCCCC' : null;
                },
              },
            },
            { width: '*', text: '' },
          ],
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
    this.docsDefinitions.content[0].columns[1].table.body = [
      ['Nombre', 'Slump', 'Descripción', 'Actualizado'].map((text) => ({
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

  createRow({ name, slump, notes, dataValues }, locale, index) {
    return [
      { text: name, alignment: 'center' },
      { text: util.formatNumber(slump, locale), alignment: 'center' },
      { text: notes, alignment: 'center' },
      {
        text: format(dataValues.updated_at, 'dd-MM-yyyy'),
        alignment: 'center',
      },
    ];
  }

  createRows(data, locale) {
    data.forEach((row, index) => {
      this.docsDefinitions.content[0].columns[1].table.body.push(
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

export default new MeasureReport();
