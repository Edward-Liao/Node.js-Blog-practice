const convertPagination = function(resource, currentPage){

//分頁

const totalResult = resource.length; 
const perpage = 4 ; //每頁多少數量
const pageTotal = Math.ceil(totalResult / perpage); //共有幾頁
// let currentPage = 1 ; //當前頁數 （不可超過總頁數）
if (currentPage>pageTotal){
  currentPage=pageTotal;
}

const minItem = (currentPage * perpage) - perpage + 1 ;
const maxItem = (currentPage * perpage);


const data = [];
resource.forEach(function(item, i){
  let itemNum = i+1 ;
  if (itemNum >= minItem && itemNum <= maxItem){
    data.push(item);
  }
});
const page = {
  pageTotal,
  currentPage,
  hasPre: currentPage >1,
  hasNext: currentPage < pageTotal

}
return{
    page,
    data
}

// console.log('總資料',totalResult ,'每頁數量' , perpage , '總頁數' , pageTotal , minItem , maxItem);


//分頁結束


}

module.exports = convertPagination;