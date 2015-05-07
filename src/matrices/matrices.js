import moment from 'moment';
import toggle from '../toggle/toggle-calendar';
import $ from 'jquery';
/* ------------------------------ todos ---------------------------
 * Add a query to database to get an array of matrices
 * remove the randomly generated matrices from the constructor
 * test extensively after plugged into the API
 * Possibly try to optimize the getMatricesByDateTerm
 * --------------------------------------------------------------*/

class matriceManager{
  constructor(){
    this.activeLease = 1;
  }
  // store the cheapest value by the selected term.
  getCheapest(term){
    var cheapest = 900000;
    for(var x = 0; x < this.matrices.length; x++){
      if(this.matrices[x].leaseTerm === term){
        cheapest = Math.min(cheapest, this.matrices[x].finalRent);
      }
    }
    return cheapest;
  }
  // get Matrices by index
  getMatricesByIndex(index){
    return [this.byLease[this.activeLease-1][index]];
  }
  // return a matrice by the date and term passed
  /*getMatricesByDateTerm(date, term){
    return this.byLease[term-1].filter(function(mat){
      return (moment(mat.moveInDate.$date).dayOfYear() === date.dayOfYear() &&
              moment(mat.moveInDate.$date).year() === date.year());
    });
  }*/

  renderCheapest(){
    var base = $('.base-rent-holder');
    if(base.length > 0){
      base.html("$" + this.cheapest);
      return true;
    }
    return false;
  }
  // Get matrices from the server and populate an array of all matrices.
  getMatricesFromServer(unitNumber){

  }
  // break the overall query into a smaller array of just the passed lease term
  filterByLease(term){
    var that = this;
    return this.matrices.filter(function(mat, i, matrices){
      if(that.cheapest > mat.finalRent){
        that.cheapest = mat.finalRent;
        that.activeLease = mat.leaseTerm;
      }
      that.cheapest = Math.min(that.cheapest, mat.finalRent);
      if(moment(mat.moveInDate, "YYYY-MM-DD").dayOfYear() <= that.earliestMoveIn.dayOfYear() &&
         moment(mat.moveInDate, "YYYY-MM-DD").year() <= that.earliestMoveIn.year()){
        that.earliestMoveIn = moment(mat.moveInDate, "YYYY-MM-DD");
      }
      if(moment(mat.moveInDate, "YYYY-MM-DD").dayOfYear() >= that.lastMoveIn.dayOfYear() &&
         moment(mat.moveInDate, "YYYY-MM-DD").year() >= that.lastMoveIn.year()){
        that.lastMoveIn = moment(mat.moveInDate, "YYYY-MM-DD");
      }

      return (term === mat.leaseTerm);
    });
  }
  // break the overall array into 15 lease arrays
  breakUpArray(){
    this.earliestMoveIn = moment().add('200', 'days');
    this.lastMoveIn = moment();
    this.cheapest = 90000;
    this.byLease = [];
    this.availableLeases = [];
    for(var x = 0; x < 15; x++){
      this.byLease[x] = this.filterByLease(x+1);
      if(this.byLease[x].length === 0){
        this.availableLeases[x] = false;
      }
      else{
        this.availableLeases[x] = true;
        this.activeLease = x+1;
      }
      this.byLease[x] = this.lookForGaps(this.byLease[x]).reverse();
    }
    this.renderInfo();
    return true;
  }

  lookForGaps(arr){
    var tempArr = [];
    var offset = 0;
    arr.forEach(function(node, i, array){
      if(i < array.length-1){
        if(Math.abs(moment(array[i+1].moveInDate, "YYYY-MM-DD").dayOfYear() - moment(node.moveInDate, "YYYY-MM-DD").dayOfYear()) === 2){
          tempArr[i+offset] = node;
          tempArr[i+offset].restricted = false;
        }
        else{
          tempArr[i+offset] = $.extend(true, {}, node);
          tempArr[i+offset].restricted = false;
          tempArr[i+offset+1] = $.extend(true, {}, node);
          tempArr[i+offset+1].restricted = true;
          tempArr[i+offset+1].moveInDate = moment(node.moveInDate, 'YYYY-MM-DD').add(2, 'days').toString();
          offset++;
        }
      }
      else{
        tempArr[i+offset] = node;
        tempArr[i+offset].restricted = false;
      }
    });
    return tempArr;
  }

  fillSelectBox(){
    var html = '';
    for(var x = 0; x < 15; x++){
      if(this.availableLeases[x]){
        if(this.activeLease === (x+1)){
          html += "<option selected=\"selected\">" + (x+1);
        }
        else{
          html += "<option>" + (x+1);
        }
        if(x === 0){
          html += " month</option>"
        }
        else{
          html += " months</option>"
        }
      }
    }
    $('.cal-select-holder select').html(html);
  }
  renderInfo(){
    this.fillSelectBox();
    this.renderCheapest();
  }
  // calculate the index in the array by the date passed
  getIndexByDate(date){
    var checkDate = date;
    for(var x = 0; x < this.byLease[this.activeLease-1].length; x++){
      var prev = -1, next = -1;
      var current = moment(this.byLease[this.activeLease-1][x].moveInDate, "YYYY-MM-DD");
      if(x > 0){
        prev = moment(this.byLease[this.activeLease-1][x-1].moveInDate, "YYYY-MM-DD");
      }
      if(x < this.byLease[this.activeLease-1].length-1){
        next = moment(this.byLease[this.activeLease-1][x+1].moveInDate, "YYYY-MM-DD");
      }
      if(checkDate.dayOfYear() === current.dayOfYear() && checkDate.year() === current.year()){
        return x;
      }
      else if(prev !== -1){
        if(checkDate.dayOfYear() >= prev.dayOfYear() && checkDate.year() >= prev.year() &&
           checkDate.dayOfYear() <= current.dayOfYear() && checkDate.year() <= current.year()){
          return x-1;
        }
      }
      else if(next !== -1){
        if(checkDate.dayOfYear() > current.dayOfYear() && checkDate.year() >= current.year() &&
           checkDate.dayOfYear() < next.dayOfYear() && checkDate.year() <= next.year()){
          return x;
        }
      }
    }
    return this.byLease[this.activeLease-1].length-1;
  }
  // calculates the first day that is available for the lease term.
  getFirstMoveInDate(){
    return this.byLease[this.activeLease-1][0].moveInDate;
  }
  // the activelease to change cheapest value
  setActiveLease(num){
    this.activeLease = num;
    this.cheapest = this.getCheapest(num);
    this.renderCheapest();
    this.moveInDate = moment(this.getFirstMoveInDate(), "YYYY-MM-DD");
  }
  getRedirect(id){
    var toSend = {id: id};
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://camden-node-2.herokuapp.com/v1/rent-matrix");
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify(toSend));
    xmlhttp.onreadystatechange = function(){
      if(xmlhttp.readyState == 4 && xmlhttp.status == "200"){
        var url = JSON.parse(xmlhttp.responseText);
        window.location.replace(url.url);
      }
    }
  }
  // loads the matrices from the test server
  testLoader(self, callback, nid){
    var that = self || this;
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "http://camden-node-2.herokuapp.com/v1/" + nid + "/rent-matrix", true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            // Get and Save Data
            that.matrices = JSON.parse(xobj.responseText);
            // Break up into arrays for each lease term then save cheapest
            // Earliest Move In Date and Last Move In Date
            that.breakUpArray();
            that.indexControl = 0;
            callback();
          }
    };
    xobj.send(null);
  }
}

export default new matriceManager();
