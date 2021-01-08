const convertPagination = (resource, currentPage) => {
// 分頁
  const totalResult = resource.length;
  const perpage = 4; // 每頁多少數量
  const pageTotal = Math.ceil(totalResult / perpage); // 共有幾頁
  // let currentPage = 1 ; //當前頁數 （不可超過總頁數）
  if (currentPage > pageTotal) {
    // eslint-disable-next-line no-param-reassign
    currentPage = pageTotal;
  }

  const minItem = (currentPage * perpage) - perpage + 1;
  const maxItem = (currentPage * perpage);

  const data = [];
  resource.forEach((item, i) => {
    const itemNum = i + 1;
    if (itemNum >= minItem && itemNum <= maxItem) {
      data.push(item);
    }
  });
  const page = {
    pageTotal,
    currentPage,
    hasPre: currentPage > 1,
    hasNext: currentPage < pageTotal,
  };
  return {
    page,
    data,
  };
// 分頁結束
};

module.exports = convertPagination;
