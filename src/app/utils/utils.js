import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

const util = {
  userRoles: ['admin', 'office', 'seller', 'lab', 'common'],
  productsGrantedAccess: ['admin', 'office'],
  formatNumber(num, locale) {
    const currentLocale = locale || 'en-US';
    if (num) {
      const formater = Intl.NumberFormat(currentLocale, {
        minimumFractionDigits: 2,
      });
      let number = num;

      if (!Number.isNaN(num)) number = Number(num);
      return formater.format(number);
    }
    return 0;
  },
  queryParams(reqQuery = {}) {
    const whereParams = {};
    const queries = Object.entries(reqQuery);
    if (queries.length > 0) {
      queries.forEach((query) => {
        const [field, value] = query;
        if (
          field === 'name' ||
          field === 'abbreviation' ||
          field === 'notes' ||
          field === 'email' ||
          field === 'phone' ||
          field === 'address'
        ) {
          whereParams[field] = {
            [Op.iLike]: `%${value}%`,
          };
        }
        if (field === 'slump' || field === 'tracker') {
          whereParams[field] = {
            [Op.eq]: `${value}`,
          };
        }
        if (
          field === 'category' ||
          field === 'provider' ||
          field === 'concreteProvider' ||
          field === 'concreteDesign' ||
          field === 'client'
        ) {
          whereParams[`$${field}.name$`] = { [Op.iLike]: `%${value}%` };
        }
        if (field === 'measurement') {
          whereParams[`$${field}.abbreviation$`] = {
            [Op.iLike]: `%${value}%`,
          };
        }
        if (field === 'updated_at') {
          const { from, to } = JSON.parse(value);
          whereParams[field] = {
            [Op.gte]: startOfDay(parseISO(from)),
            [Op.lte]: endOfDay(parseISO(to)),
          };
        }
      });
    }
    return { ...whereParams };
  },
};

export default util;
