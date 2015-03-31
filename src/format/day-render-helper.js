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
    if(date < moment().add(-1, 'day')){
      $(cell).addClass('disabled');
      return true;
    }
    return false;
  }
  disableAfterMax(date, cell, max){
    if(date > max){
      $(cell).addClass('disabled');
      return true;
    }
    return false;
  }
  renderPrice(cell){
    var p = this.getPrice();
    $(cell).append("<div class=\"price-holder\"><p>"+ p +"</p></div>");
    if(p === 0){
      $(cell).addClass('light-green');
    }
  }
  renderDay(date, cell){
    var today = moment();
    var maxDay = moment().add(90, 'day');
    $(cell).removeClass('fc-today');
    if(this.disableBefore(today, date, cell)){return;}
    else if(this.disableAfterMax(date, cell, maxDay)){return;}
    else{
      var termLength = $('.calendar-head select option:selected').text();
      termLength = termLength.substring(0, termLength.indexOf(' '));
      this.matrix = matrice.getMatricesByDateTerm(date, Number(termLength));
      if(this.matrix.length > 0)
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
}

export default new dayRenderHelper();
