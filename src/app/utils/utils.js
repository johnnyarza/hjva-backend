import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

const util = {
  userRoles: ['admin', 'office', 'seller', 'lab', 'common'],
  productsGrantedAccess: ['admin', 'office'],
  formatNumber(num, locale, minimumFractionDigits = 2) {
    const currentLocale = locale || 'en-US';
    if (num) {
      const formater = Intl.NumberFormat(currentLocale, {
        minimumFractionDigits,
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
        if (
          field === 'slump' ||
          field === 'tracker' ||
          field === 'load' ||
          field === 'height' ||
          field === 'diameter' ||
          field === 'weight'
        ) {
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
        if (field === 'compressionTest') {
          whereParams[`$${field}.id$`] = { [Op.eq]: `${value}` };
        }
        if (field === 'measurement') {
          whereParams[`$${field}.abbreviation$`] = {
            [Op.iLike]: `%${value}%`,
          };
        }
        if (
          field === 'updated_at' ||
          field === 'loaded_at' ||
          field === 'sampled_at'
        ) {
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
