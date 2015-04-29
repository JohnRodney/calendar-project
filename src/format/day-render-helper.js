import moment from 'moment';
import matrice from '../matrices/matrices';

/* ------------------------------------------------- Documentation -------------------------------------------------------------------
// dayRenderHelper class is an object that handles all the logic needed to render particular data to each calendar cell.
// disableBefore(): basically disables all days on the calendar before whatever the present day is
// disableAfterMax(): pass a maxDate and it will disable any dates that fall after this day (Set at default 90 right now)
// renderPrice(): this renders the Price into the cell based on selected Matrix and the original price
// renderDay(): this is the main entry point to the class that is called from the FullCalender dayRender method
// getPrice(): this calculates the price based on selected matrix and the original price.
// ---------------------------------------------------------------------------------------------------------------------------------*/

class dayRenderHelper{
  disableBefore(today, date, cell){
    if(date < today.add(-1, 'day')){
      $(cell).addClass('disabled');
      if(date.month() === today.month()){
        $(cell).append('<div class=\"question-icon\"></div>');
      }
      return true;
    }
    return false;
  }
  disableAfterMax(date, cell, max){
    if(date > max){
      $(cell).addClass('disabled');
      if(date.month() === max.month()){
        $(cell).append('<div class=\"question-icon\"></div>');
      }
      return true;
    }
    return false;
  }
  renderPrice(cell){
    var p = this.getPrice();
    if(p === 0){
      p = "+$ 0";
    }
    $(cell).append("<div class=\"price-holder\"><p>"+ p +"</p></div>");
    if(p === 0){
      $(cell).addClass('light-green');
    }
  }
  renderDay(date, cell){
    var index = this.getIndexByDate(date);
    var today = moment(matrice.earliestMoveIn);
    var maxDay = matrice.lastMoveIn;
    $(cell).removeClass('fc-today');
    if(this.disableBefore(today, date, cell)){return;}
    else if(this.disableAfterMax(date, cell, maxDay)){return;}
    else{
      this.matrix = matrice.getMatricesByIndex(index);
      this.renderPrice(cell);
    }
  }
  getPrice(){
    var OriginalPrice = matrice.cheapest;
    var val = (this.matrix[0].finalRent-OriginalPrice);
    if(val > 0){
      val = "+$" + val;
    }
    else if(val !== 0){
      val = "-$" + (val*-1);
    }
    return val;
  }
  getIndexByDate(date){
    return matrice.getIndexByDate(date);
  }
}

export default new dayRenderHelper();
