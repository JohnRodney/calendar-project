import moment from 'moment';

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
  renderPrice(P, cell){
    var p = this.getPrice(P);
    $(cell).append("<div class=\"price-holder\"><p>"+ p +"</p></div>");
    if(p === 0){
      $(cell).addClass('light-green');
    }
  }
  renderDay(date, cell){
    var today = new Date();
    var maxDay = moment().add(90, 'day');
    var P = Math.floor(Math.random()*11+1395);

    $(cell).removeClass('fc-today');

    if(this.disableBefore(today, date, cell)){return;}
    else if(this.disableAfterMax(date, cell, maxDay)){return;}
    else{
      this.renderPrice(P, cell);
    }
  }
  getPrice(p){
    var OriginalPrice = 1400;
    var val = (p-OriginalPrice)*30;
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
