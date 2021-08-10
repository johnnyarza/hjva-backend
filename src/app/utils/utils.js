const util = {
  userRoles: ['admin', 'office', 'seller', 'lab', 'common'],
  productsGrantedAccess: ['admin', 'office'],
  formatNumber(num, locale = 'en-US') {
    if (num) {
      const formater = Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
      });
      let number = num;

      if (!Number.isNaN(num)) number = Number(num);
      return formater.format(number);
    }
    return 0;
  },
};

export default util;
